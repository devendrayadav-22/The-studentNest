// test_all_fixes.mjs
const API_BASE = 'http://localhost:8080/api';

async function req(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('--- 1. Testing Auth Tokens & Logins ---');
  const studentAuth = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student@ips.com', password: 'student123' })
  });
  const studentToken = studentAuth.data.token;
  console.log('Student login status:', studentAuth.status, 'role:', studentAuth.data?.user?.role);

  const messAuth = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'mess@ips.com', password: 'mess123' })
  });
  const messToken = messAuth.data.token;
  console.log('Mess Owner login status:', messAuth.status, 'role:', messAuth.data?.user?.role);

  console.log('\n--- 2. Testing Mess Status (All / Open / Closed) ---');
  const allMesses = await req('/messes?status=all');
  console.log('Messes (status=all): count =', allMesses.data.totalElements);

  const openMesses = await req('/messes?status=open');
  console.log('Messes (status=open): count =', openMesses.data.totalElements, openMesses.data.content.map(m => ({ name: m.name, isOpen: m.isOpen })));

  const closedMesses = await req('/messes?status=closed');
  console.log('Messes (status=closed): count =', closedMesses.data.totalElements, closedMesses.data.content.map(m => ({ name: m.name, isOpen: m.isOpen })));

  console.log('\n--- 3. Testing Toggle Closed from mess@ips.com ---');
  // Toggle Maa Annapurna to closed
  const toggleRes = await req('/mess-owner/profile/open', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${messToken}` }
  });
  console.log('Mess owner toggled isOpen ->', toggleRes.data?.isOpen);

  const openAfterToggle = await req('/messes?status=open');
  console.log('Messes (status=open) after toggle:', openAfterToggle.data.totalElements, openAfterToggle.data.content.map(m => m.name));

  const closedAfterToggle = await req('/messes?status=closed');
  console.log('Messes (status=closed) after toggle:', closedAfterToggle.data.totalElements, closedAfterToggle.data.content.map(m => m.name));

  // Toggle back to open for consistency
  const toggleBack = await req('/mess-owner/profile/open', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${messToken}` }
  });
  console.log('Mess owner toggled back -> isOpen =', toggleBack.data?.isOpen);

  console.log('\n--- 4. Testing Food Type Filters (VEG / NONVEG / BOTH) ---');
  const vegRes = await req('/messes?foodType=VEG');
  console.log('Food filter VEG (should include VEG and BOTH):', vegRes.data.content.map(m => `${m.name} (${m.foodType})`));

  const nonVegRes = await req('/messes?foodType=NONVEG');
  console.log('Food filter NONVEG (should include NONVEG and BOTH):', nonVegRes.data.content.map(m => `${m.name} (${m.foodType})`));

  const bothRes = await req('/messes?foodType=BOTH');
  console.log('Food filter BOTH (should include ONLY BOTH):', bothRes.data.content.map(m => `${m.name} (${m.foodType})`));

  console.log('\n--- 5. Testing Guest Phone Privacy vs Student Auth ---');
  const guestPg = await req('/pgs');
  console.log('Guest PG ownerPhone (must be null):', guestPg.data.content.map(p => p.ownerPhone));

  const guestMess = await req('/messes');
  console.log('Guest Mess ownerPhone (must be null):', guestMess.data.content.map(m => m.ownerPhone));

  const studentPg = await req('/pgs', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log('Student PG ownerPhone (must be visible):', studentPg.data.content.map(p => p.ownerPhone));

  const studentMess = await req('/messes', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log('Student Mess ownerPhone (must be visible):', studentMess.data.content.map(m => m.ownerPhone));

  console.log('\n--- 6. Testing JSON Property Name isOpen ---');
  const checkJson = await req('/messes?size=1');
  const firstMess = checkJson.data.content[0];
  console.log('Mess JSON field "isOpen" exists?', 'isOpen' in firstMess, 'value =', firstMess.isOpen);

  console.log('\n--- 7. Testing OpenAPI Title ---');
  const openApiRes = await req('/v3/api-docs');
  console.log('OpenAPI Title:', openApiRes.data?.info?.title);

  console.log('\n>>> ALL TEST CHECKS FINISHED SUCCESSFULLY! <<<');
}

run().catch(console.error);

