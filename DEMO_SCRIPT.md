# StudentNest - Live Walkthrough & Demo Script

This script walks through all core functionality of **StudentNest** ("Find Your Stay, Food & Comfort - All in one Place").

## Demo Accounts

| Role | Email | Password | Access Dashboard |
|---|---|---|---|
| Student | `student@ips.com` | `student123` | `/student` |
| PG Owner | `owner@ips.com` | `owner123` | `/owner` |
| Mess Owner | `mess@ips.com` | `mess123` | `/mess` |
| Administrator | `admin@ips.com` | `admin123` | `/admin` |

---

## 1. Guest Experience & Public Discovery

1. Navigate to `/` (Home):
   - Notice the top hero badge: *"Now live near IPS Academy, Indore"*.
   - Headline: *"Find Your Stay, Food & Comfort - All in one Place"*.
   - Subtext: *"PG, Mess aur Map, ek jagah. Abhi IPS Academy, Indore ke liye live."*.
   - Footer highlights: *"More colleges coming soon"*.
2. As a guest, try clicking:
   - Wishlist heart on any Featured PG card.
   - Contact / WhatsApp / Call / Inquiry on any PG or Mess detail page.
   - A modal promptly asks to *"Login as Student"* or *"Register"*, preserving your return URL!
   - Owner phone numbers remain completely hidden until student authentication.

---

## 2. Mess & Tiffin Services (`/messes`)

1. Use the **Status** filter:
   - Toggle **Open**: only shows messes whose operating hours in `Asia/Kolkata` are currently open.
   - Toggle **Closed**: displays messes currently outside service hours.
   - Toggle **All**: shows both open and closed messes.
2. Use the **Food Type** filter:
   - Selecting **Pure Veg** shows pure veg messes plus those serving both, with an informative note.
   - Selecting **Both** shows only multi-cuisine messes.
3. Use the **Sort** dropdown:
   - Choose **Price: Low to High**, **Closest to Campus**, or **Highest Rated**.
   - The selected sort option is controlled and strictly preserved on reload and state changes.

---

## 3. Mess Owner Experience (`/mess`)

1. Login as `mess@ips.com` / `mess123`.
2. Notice the clean sidebar:
   - Navigation contains strictly: **Overview**, **Mess Profile**, **Menu**, **Reviews**, **Inquiries**, and **Profile**.
   - No PG links or "Explore PG" options exist in the mess owner workspace.
   - If a mess owner manually enters `/pgs` in the address bar, they are automatically guarded and redirected to `/mess`.
3. Toggle the live **Mark as Closed / Open** status button.

---

## 4. Student Workflow (`/student`)

1. Login as `student@ips.com` / `student123`.
2. Browse `/pgs` and `/messes` with full access to direct WhatsApp, direct call, and inquiry messaging.
3. Save listings to Wishlist and use the side-by-side **Compare** tool.
4. Post authentic student reviews with star ratings and comments.

