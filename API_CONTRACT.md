# StudentNest - REST API Contract

All endpoints reside under the `/api` root.
JSON is the standard format for request payloads and responses.
All authenticated requests must include the header:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Standard Error Envelope

When any request errors (4xx or 5xx), the response always matches this structure:

```json
{
  "timestamp": "2026-10-29T12:00:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "rent": "Rent must be greater than 0"
  }
}
```

---

## 2. Health Check

### `GET /api/health`
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "status": "UP"
}
```

---

## 3. Authentication & User Profile

### `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Aman Gupta",
  "email": "aman@ips.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "STUDENT",
  "college": "IPS Academy Indore",
  "course": "B.Tech CSE",
  "homeCity": "Bhopal",
  "ownerBusinessName": null
}
```
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Aman Gupta",
    "email": "aman@ips.com",
    "phone": "9876543210",
    "role": "STUDENT",
    "blocked": false,
    "college": "IPS Academy Indore",
    "course": "B.Tech CSE",
    "homeCity": "Bhopal",
    "ownerBusinessName": null,
    "createdAt": "2026-10-29T12:00:00"
  }
}
```

---

### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@ips.com",
  "password": "student123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 6,
    "name": "Aman Gupta",
    "email": "student@ips.com",
    "phone": "9111223344",
    "role": "STUDENT",
    "blocked": false,
    "college": "IPS Academy, Institute of Engineering & Science",
    "course": "B.Tech CSE 3rd Year",
    "homeCity": "Bhopal",
    "ownerBusinessName": null,
    "createdAt": "2026-09-29T12:00:00"
  }
}
```

---

### `GET /api/auth/me`
- **Access**: Authenticated (`STUDENT`, `PG_OWNER`, `MESS_OWNER`, `ADMIN`)
- **Response** (`200 OK`):
```json
{
  "id": 6,
  "name": "Aman Gupta",
  "email": "student@ips.com",
  "phone": "9111223344",
  "role": "STUDENT",
  "blocked": false,
  "college": "IPS Academy, Institute of Engineering & Science",
  "course": "B.Tech CSE 3rd Year",
  "homeCity": "Bhopal",
  "ownerBusinessName": null,
  "createdAt": "2026-09-29T12:00:00"
}
```

---

### `PUT /api/auth/me`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "name": "Aman Gupta",
  "phone": "9988776655",
  "college": "IPS Academy Indore",
  "course": "B.Tech CSE 4th Year",
  "homeCity": "Indore",
  "ownerBusinessName": null
}
```
- **Response** (`200 OK`): Updated user profile object.

---

## 4. PG Listings (Public)

### `GET /api/pgs`
- **Access**: Public (Approved listings only)
- **Query Parameters**:
  - `q` (string): Text query matching title, description, address
  - `type` (enum): `PG`, `HOSTEL`, `FLAT`
  - `minRent` (number): Minimum monthly rent
  - `maxRent` (number): Maximum monthly rent
  - `gender` (enum): `BOYS`, `GIRLS`, `ANY`
  - `sharing` (enum): `SINGLE`, `DOUBLE`, `TRIPLE`
  - `facilities` (string): Comma-separated facilities that must ALL be matched (e.g., `WIFI,AC,MEALS`)
  - `verifiedOnly` (boolean): `true` to filter only verified listings
  - `maxDistanceKm` (number): Maximum distance from college in km (e.g. `3.0`)
  - `sortBy` (enum): `rent`, `distance`, `rating`, `latest` (default: `latest`)
  - `order` (enum): `asc`, `desc`
  - `page` (number): 0-indexed page number (default: `0`)
  - `size` (number): Items per page (default: `10`)

- **Response** (`200 OK`):
```json
{
  "content": [
    {
      "id": 1,
      "ownerId": 2,
      "ownerName": "Ramesh Sharma",
      "ownerPhone": "9826011223",
      "ownerBusinessName": "Sharma Residency & Hostels",
      "title": "Shree Krishna Boys PG - Near Bhawarkua Square",
      "description": "Comfortable, clean and budget-friendly PG for college students...",
      "type": "PG",
      "rent": 4800.0,
      "deposit": 4800.0,
      "gender": "BOYS",
      "sharing": "DOUBLE",
      "facilities": ["WIFI", "RO_WATER", "GEYSER", "LAUNDRY", "PARKING", "CCTV"],
      "rules": "Main gate closes at 10:30 PM. No smoking or alcohol allowed inside rooms.",
      "images": ["/images/Pimage1.jpg", "/images/Pimage2.jpg"],
      "address": "Plot 42, Professor Colony, Near Bhawarkua Tower, Indore",
      "lat": 22.6934,
      "lng": 75.8662,
      "availableBeds": 3,
      "status": "APPROVED",
      "verified": true,
      "rejectionReason": null,
      "lastUpdated": "2026-10-24T12:00:00",
      "createdAt": "2026-09-14T12:00:00",
      "viewCount": 142,
      "distanceKm": 0.54,
      "lastUpdatedDaysAgo": 5,
      "stale": false,
      "averageRating": 4.5,
      "reviewCount": 2
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 5,
  "totalPages": 1
}
```

---

### `GET /api/pgs/{id}`
- **Access**: Public (if `APPROVED`); Owner or Admin can access when `PENDING` or `REJECTED`.
- **Side effect**: Increments `viewCount` by 1.
- **Response** (`200 OK`): Single `PgListingResponse` object as shown above.

---

## 5. PG Owner Operations

### `POST /api/owner/pgs`
- **Access**: `PG_OWNER`, `ADMIN`
- **Request Body**:
```json
{
  "title": "New Green Park PG",
  "description": "Quiet environment for students",
  "type": "PG",
  "rent": 5200.0,
  "deposit": 5000.0,
  "gender": "BOYS",
  "sharing": "DOUBLE",
  "facilities": ["WIFI", "RO_WATER", "GEYSER"],
  "rules": "Gate locks at 11 PM",
  "images": ["/images/Pimage1.jpg"],
  "address": "Rajendra Nagar AB Road, Indore",
  "lat": 22.6845,
  "lng": 75.8390,
  "availableBeds": 4
}
```
- **Response** (`201 Created`):
```json
{
  "id": 9,
  "status": "PENDING",
  "verified": false,
  "viewCount": 0,
  "lastUpdatedDaysAgo": 0,
  "stale": false,
  ...
}
```

---

### `GET /api/owner/pgs`
- **Access**: `PG_OWNER`, `ADMIN`
- **Response** (`200 OK`): Array of `PgListingResponse` owned by the user.

---

### `PUT /api/owner/pgs/{id}`
- **Access**: Owner of the listing or `ADMIN`
- **Request Body**: Same as `POST /api/owner/pgs`.
- **Response** (`200 OK`): Updated `PgListingResponse`. Note: If listing was already `APPROVED`, it remains `APPROVED` and refreshes `lastUpdated`.

---

### `DELETE /api/owner/pgs/{id}`
- **Access**: Owner of the listing or `ADMIN`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

---

### `POST /api/owner/pgs/{id}/confirm-availability`
- **Access**: Owner of the listing or `ADMIN`
- **Response** (`200 OK`): Updates `lastUpdated` to now, setting `lastUpdatedDaysAgo = 0` and `stale = false`.

---

### `PATCH /api/owner/pgs/{id}/beds`
- **Access**: Owner of the listing or `ADMIN`
- **Request Body**:
```json
{
  "availableBeds": 2
}
```
- **Response** (`200 OK`): Updated `PgListingResponse`.

---

### `GET /api/owner/stats`
- **Access**: `PG_OWNER`, `ADMIN`
- **Response** (`200 OK`):
```json
{
  "totalListings": 3,
  "approvedListings": 2,
  "pendingListings": 1,
  "totalViews": 252,
  "totalInquiries": 4,
  "totalBeds": 17
}
```

---

## 6. Mess & Tiffin Services (Public)

### `GET /api/messes`
- **Access**: Public
- **Query Parameters**:
  - `q` (string): Text match on name, description, address
  - `foodType` (enum): `VEG` (matches VEG & BOTH), `NONVEG` (matches NONVEG & BOTH), `BOTH` (matches only BOTH)
  - `maxPrice` (number): Max monthly or per-meal price
  - `status` (string): `all` (default), `open` (currently open), or `closed` (currently closed)
  - `openNow` (boolean): `true` alias for `status=open`
  - `maxDistanceKm` (number): Max distance in km from college
  - `sortBy` (enum): `price`, `distance`, `rating`, `latest`
  - `order` (enum): `asc`, `desc`
  - `page` (number): 0-indexed page
  - `size` (number): Items per page

> **Open / Closed Calculation Rule**: A mess is "open" when the owner's `isOpen` toggle is `true` AND the current local time in `Asia/Kolkata` is between `openTime` and `closeTime` (supporting midnight rollover where `closeTime < openTime`). "Closed" is the exact opposite.
> **Phone Privacy Rule**: `ownerPhone` is populated only for authenticated requests; for unauthenticated public requests it is returned as `null`.

- **Response** (`200 OK`):
```json
{
  "content": [
    {
      "id": 1,
      "ownerId": 5,
      "ownerName": "Mahesh Joshi",
      "ownerPhone": "9826077889 (null for unauthenticated guests)",
      "ownerBusinessName": "Annapurna Tiffin & Mess Services",
      "name": "Maa Annapurna Shuddh Shakahari Mess",
      "description": "100% Pure vegetarian North Indian and MP style home cooked food...",
      "foodType": "VEG",
      "openTime": "07:30 AM",
      "closeTime": "10:30 PM",
      "pricePerMeal": 80.0,
      "monthlyPrice": 2400.0,
      "deliveryCharge": 0.0,
      "deliveryArea": "Bhawarkua, Vishnupuri, IPS Campus Road",
      "address": "12 Bholaram Ustad Marg, Bhawarkua, Indore",
      "lat": 22.6950,
      "lng": 75.8670,
      "images": ["/images/Mimage1.jpg"],
      "isOpen": true,
      "status": "APPROVED",
      "verified": true,
      "rejectionReason": null,
      "lastUpdated": "2026-10-26T12:00:00",
      "createdAt": "2026-09-09T12:00:00",
      "distanceKm": 0.64,
      "lastUpdatedDaysAgo": 3,
      "stale": false,
      "averageRating": 4.5,
      "reviewCount": 2,
      "menuItems": null
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1
}
```

---

### `GET /api/messes/{id}`
- **Access**: Public
- **Response** (`200 OK`): Single `MessProfileResponse` including `menuItems` array:
```json
{
  "id": 1,
  "name": "Maa Annapurna Shuddh Shakahari Mess",
  ...
  "menuItems": [
    {
      "id": 1,
      "messId": 1,
      "name": "Poha Jalebi & Tea",
      "foodType": "VEG",
      "dayOfWeek": "ALL",
      "mealType": "BREAKFAST",
      "price": 40.0
    },
    {
      "id": 2,
      "messId": 1,
      "name": "Dal Tadka, Paneer Butter Masala, 4 Butter Roti, Rice",
      "foodType": "VEG",
      "dayOfWeek": "MON",
      "mealType": "LUNCH",
      "price": 80.0
    }
  ]
}
```

---

## 7. Mess Owner Operations

### `POST /api/mess-owner/profile`
- **Access**: `MESS_OWNER`, `ADMIN`
- **Request Body**:
```json
{
  "name": "Malwa Zaika Tiffin Center",
  "description": "Delicious tiffins delivered to your PG",
  "foodType": "BOTH",
  "openTime": "08:00 AM",
  "closeTime": "10:00 PM",
  "pricePerMeal": 95.0,
  "monthlyPrice": 2800.0,
  "deliveryCharge": 15.0,
  "deliveryArea": "Rajendra Nagar, AB Road",
  "address": "Annapurna Complex, Indore",
  "lat": 22.6860,
  "lng": 75.8410,
  "images": ["/images/Mimage2.jpg"],
  "isOpen": true
}
```
- **Response** (`201 Created`): `MessProfileResponse` in `PENDING` status.

---

### `PATCH /api/mess-owner/profile/open`
- **Access**: `MESS_OWNER`, `ADMIN`
- **Response** (`200 OK`): Toggles `isOpen` boolean.

---

### `GET /api/mess-owner/stats`
- **Access**: `MESS_OWNER`, `ADMIN`
- **Response** (`200 OK`):
```json
{
  "totalMenuItems": 5,
  "isOpen": true,
  "verified": true,
  "status": "APPROVED",
  "totalInquiries": 3
}
```

---

### `POST /api/mess-owner/menu`
- **Access**: `MESS_OWNER`, `ADMIN`
- **Request Body**:
```json
{
  "name": "Aloo Paratha with Curd",
  "foodType": "VEG",
  "dayOfWeek": "ALL",
  "mealType": "BREAKFAST",
  "price": 50.0
}
```
- **Response** (`201 Created`): `MenuItemResponse`.

---

## 8. Reviews & Ratings

### `GET /api/reviews?targetType=PG&targetId=1`
- **Access**: Public
- **Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "studentId": 6,
    "studentName": "Aman Gupta",
    "studentCollege": "IPS Academy, Institute of Engineering & Science",
    "targetType": "PG",
    "targetId": 1,
    "rating": 5,
    "comment": "Excellent PG! Wi-Fi is blazing fast.",
    "ownerReply": "Thank you Aman! We are glad you enjoy the stay.",
    "createdAt": "2026-10-14T12:00:00"
  }
]
```

---

### `POST /api/reviews`
- **Access**: `STUDENT` only
- **Constraint**: One review per student per target. Re-posting returns `409 Conflict`.
- **Request Body**:
```json
{
  "targetType": "PG",
  "targetId": 1,
  "rating": 5,
  "comment": "Very peaceful place to study."
}
```
- **Response** (`201 Created`): `ReviewResponse`.

---

### `POST /api/reviews/{id}/reply`
- **Access**: Owner of target PG/Mess or `ADMIN`
- **Request Body**:
```json
{
  "ownerReply": "Thank you for the warm feedback!"
}
```
- **Response** (`200 OK`): Updated `ReviewResponse`.

---

## 9. Wishlist

### `GET /api/wishlist`
- **Access**: `STUDENT`
- **Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "studentId": 6,
    "targetType": "PG",
    "targetId": 3,
    "title": "Radha Rani Luxury Girls PG",
    "imageUrl": "/images/Pimage3.jpg",
    "price": 6800.0,
    "address": "Scheme 71, Near Cat Road, Rajendra Nagar, Indore",
    "createdAt": "2026-10-19T12:00:00"
  }
]
```

---

### `POST /api/wishlist`
- **Access**: `STUDENT`
- **Request Body**:
```json
{
  "targetType": "PG",
  "targetId": 3
}
```
- **Response** (`201 Created`): `WishlistResponse`.

---

### `DELETE /api/wishlist/{id}`
- **Access**: `STUDENT`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

## 10. Inquiries

### `POST /api/inquiries`
- **Access**: `STUDENT`
- **Request Body**:
```json
{
  "targetType": "PG",
  "targetId": 1,
  "message": "Hi, do you have a double bed room available starting next Monday?"
}
```
- **Response** (`201 Created`):
```json
{
  "id": 5,
  "studentId": 6,
  "studentName": "Aman Gupta",
  "studentEmail": "student@ips.com",
  "studentPhone": "9111223344",
  "targetType": "PG",
  "targetId": 1,
  "targetTitle": "Shree Krishna Boys PG - Near Bhawarkua Square",
  "ownerId": 2,
  "ownerName": "Ramesh Sharma",
  "message": "Hi, do you have a double bed room available starting next Monday?",
  "status": "NEW",
  "createdAt": "2026-10-29T12:00:00"
}
```

---

### `GET /api/inquiries/mine`
- **Access**: `STUDENT`
- **Response** (`200 OK`): Array of inquiries sent by student.

---

### `GET /api/inquiries/received`
- **Access**: `PG_OWNER`, `MESS_OWNER`, `ADMIN`
- **Response** (`200 OK`): Array of inquiries received by owner.

---

### `PATCH /api/inquiries/{id}/status`
- **Access**: Owner or `ADMIN`
- **Request Body**:
```json
{
  "status": "CONTACTED"
}
```
- **Response** (`200 OK`): Updated `InquiryResponse`.

---

## 11. Reports

### `POST /api/reports`
- **Access**: Authenticated users
- **Request Body**:
```json
{
  "targetType": "PG",
  "targetId": 8,
  "reason": "Photos do not match the real location"
}
```
- **Response** (`201 Created`):
```json
{
  "id": 3,
  "reporterId": 6,
  "reporterName": "Aman Gupta",
  "targetType": "PG",
  "targetId": 8,
  "reason": "Photos do not match the real location",
  "status": "OPEN",
  "createdAt": "2026-10-29T12:00:00"
}
```

---

## 12. Admin Operations

### `GET /api/admin/stats`
- **Access**: `ADMIN`
- **Response** (`200 OK`):
```json
{
  "totalUsers": 7,
  "totalStudents": 2,
  "totalPgOwners": 3,
  "totalMessOwners": 1,
  "totalPgs": 8,
  "pendingPgs": 2,
  "approvedPgs": 5,
  "totalMesses": 3,
  "pendingMesses": 1,
  "approvedMesses": 2,
  "totalReviews": 12,
  "totalReports": 2,
  "openReports": 1
}
```

---

### `GET /api/admin/pending`
- **Access**: `ADMIN`
- **Response** (`200 OK`):
```json
{
  "pgs": [ ... ],
  "messes": [ ... ]
}
```

---

### `POST /api/admin/pgs/{id}/approve`
- **Access**: `ADMIN`
- **Response** (`200 OK`): `PgListingResponse` with `status: "APPROVED"` and `verified: true`.

---

### `POST /api/admin/pgs/{id}/reject`
- **Access**: `ADMIN`
- **Request Body**:
```json
{
  "reason": "Incomplete documentation and unclear photos."
}
```
- **Response** (`200 OK`): `PgListingResponse` with `status: "REJECTED"`, `verified: false`, `rejectionReason: "..."`.

---

### `PATCH /api/admin/users/{id}/block`
- **Access**: `ADMIN`
- **Response** (`200 OK`): `UserSummaryDto` with `blocked: true`. Blocked users are immediately prevented from logging in.

---

### `POST /api/admin/announcements`
- **Access**: `ADMIN`
- **Request Body**:
```json
{
  "title": "Advisory on Summer PG Electricity Charges",
  "content": "Please verify sub-meter readings before paying AC electricity bills."
}
```
- **Response** (`201 Created`): `AnnouncementResponse`.

---

## 13. Public Announcements

### `GET /api/announcements`
- **Access**: Public
- **Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "title": "Welcome to IPS PG Finder Portal!",
    "content": "Welcome IPSians! You can now easily explore verified PGs...",
    "createdAt": "2026-09-29T12:00:00"
  }
]
```

---

## 14. Development Tools (Demo Mode Only)

### `POST /api/dev/reset-demo`
- **Access**: Public (Active only when `demo.mode=true`, returns `404 Not Found` in production)
- **Side effect**: Wipes all tables using native CASCADE truncate, resets identities, and re-executes data seeder.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Demo database wiped and re-seeded successfully"
}
```
