# StudentNest - Find Your Stay, Food & Comfort - All in one Place

Backend and Frontend platform for **StudentNest**, designed for students of **IPS Academy, Indore** to discover PGs, hostels, flats, and mess/tiffin centers near campus, compute accurate Haversine distances to college, review accommodations, submit inquiries, bookmark wishlists, and manage listings.

> *PG, Mess aur Map, ek jagah. Abhi IPS Academy, Indore ke liye live. More colleges coming soon.*

Built with **Java 17**, **Spring Boot 3.3.4**, **Spring Security + JWT**, **Spring Data JPA**, **PostgreSQL**, and containerized for seamless deployment on **Render** with **Neon PostgreSQL**.

---

## 🚀 Features

- **College-Centric Geo Filtering**: Calculates Haversine distance from IPS Academy Indore campus (`22.6900° N, 75.8700° E`). Filter listings by `maxDistanceKm`.
- **Role-Based Security**: Role-based access control (`STUDENT`, `PG_OWNER`, `MESS_OWNER`, `ADMIN`) with JWT stateless authentication (24-hour expiration) and BCrypt password encryption.
- **Listing Lifecycle & Approval**:
  - Newly created PG or Mess listings start as `PENDING` with `verified: false`.
  - Admin approval workflow (`APPROVED` with `verified: true` or `REJECTED` with reason).
  - Public search only serves `APPROVED` listings.
  - Owners can refresh availability timestamp (`POST /confirm-availability`) to keep listings fresh.
- **Stale Listing Detection**: Listings not updated for 30 days are flagged as `stale: true` and checked via a daily `@Scheduled` background job.
- **Dynamic Search & Filtering**: Filter by keyword, type (PG/Hostel/Flat), rent range, gender, sharing, must-match facilities (e.g. WiFi, AC, Meals), and distance.
- **Mess & Weekly Menu**: Mess profiles support weekly schedules (Breakfast, Lunch, Dinner), food type filters (Veg/Non-Veg), pricing, and real-time Open/Closed toggle.
- **Student Engagement**:
  - Star ratings & reviews (1–5 scale, duplicate prevention per student per target, owner reply support).
  - Wishlist bookmarking.
  - Inquiries routed directly to listing owners.
- **Administrative Moderation**:
  - Full platform metrics dashboard.
  - User management (block/unblock blocked users cannot login).
  - Review moderation & report resolution.
  - Campus announcements broadcast.
- **Testing & Local Dev**: Zero-configuration H2 in-memory test suite (`application-test.properties`). `demo.mode` endpoint to reset and reseed sample data.
- **Self-Documenting API**: Interactive OpenAPI Swagger documentation at `/swagger-ui.html`.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.3.4 |
| Build Tool | Apache Maven 3.9+ |
| Security | Spring Security 6, JJWT (io.jsonwebtoken 0.12.5) |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15+ (Production / Local), H2 (Automated Tests) |
| Documentation | SpringDoc OpenAPI 3 (`springdoc-openapi-starter-webmvc-ui:2.5.0`) |
| Container | Docker Multi-Stage (`eclipse-temurin:17-jre`), Docker Compose |

---

## 📋 Seeded Accounts & Credentials

The application automatically seeds realistic data on its first run if the database is empty:

| Email | Password | Role | Description |
|---|---|---|---|
| `admin@ips.com` | `admin123` | `ADMIN` | Platform Administrator |
| `owner@ips.com` | `owner123` | `PG_OWNER` | PG Owner (Sharma Residency) |
| `pgowner2@ips.com` | `owner123` | `PG_OWNER` | PG Owner (Verma Luxury Living) |
| `pgowner3@ips.com` | `owner123` | `PG_OWNER` | PG Owner (Patel Girls PG) |
| `mess@ips.com` | `mess123` | `MESS_OWNER` | Mess Owner (Maa Annapurna Mess) |
| `student@ips.com` | `student123` | `STUDENT` | Student (B.Tech CSE, IPS Academy) |
| `student2@ips.com` | `student123` | `STUDENT` | Student (BBA, IPS Academy) |

*Pre-seeded listings include 8 PG/Hostels around Indore (Rajendra Nagar, Bhawarkua, AB Road, Khandwa Road) with verified coordinates, 3 Mess profiles with menus, 12 reviews, wishlists, and inquiries.*

---

## ⚙️ Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | Port on which the Spring Boot server listens |
| `DB_URL` | `jdbc:postgresql://localhost:5432/ipsfinder` | JDBC Connection URL (*Include `?sslmode=require` for Neon*) |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | `404E6352...` *(dev default)* | Secret key for HS256 JWT signature |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `DEMO_MODE` | `false` | Enables `/api/dev/reset-demo` when `true` |
| `COLLEGE_LAT` | `22.6900` | Latitude of IPS Academy Indore campus |
| `COLLEGE_LNG` | `75.8700` | Longitude of IPS Academy Indore campus |

---

## 🏃 Running Locally

### Option 1: Native Maven + Local PostgreSQL

1. **Prerequisites**:
   - JDK 17+ installed and configured on your `PATH`.
   - Apache Maven 3.8+ installed.
   - PostgreSQL 15+ running on port `5432`.

2. **Create Database**:
   ```sql
   CREATE DATABASE ipsfinder;
   ```

3. **Configure Environment (Optional)**:
   Set your database credentials if different from defaults:
   ```bash
   # Windows PowerShell
   $env:DB_URL="jdbc:postgresql://localhost:5432/ipsfinder"
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="your_password"
   
   # Linux / macOS
   export DB_URL="jdbc:postgresql://localhost:5432/ipsfinder"
   export DB_USER="postgres"
   export DB_PASSWORD="your_password"
   ```

4. **Run Application**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

5. **Access Endpoints**:
   - Health Check: `http://localhost:8080/api/health`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - OpenAPI Docs: `http://localhost:8080/v3/api-docs`

---

### Option 2: Docker Compose (Full Stack with PostgreSQL)

To start both PostgreSQL 16 and the Spring Boot backend container in one command:

```bash
docker compose up -d --build
```

To stop:
```bash
docker compose down
```

---

## 🧪 Running Tests

Tests run against an in-memory **H2 database** (test profile) without needing an external PostgreSQL instance:

```bash
cd backend
mvn test
```

Tests cover:
- Authentication & JWT token generation
- Blocked user login denial
- Role-based authorization constraints (403 Forbidden)
- Public search visibility (only `APPROVED` listings displayed)
- Ownership verification (owner cannot modify others' listings)
- Admin approval workflow (`PENDING` -> `APPROVED` + `verified: true`)
- Haversine distance calculation and radius filtering
- Duplicate review rejection per student/target (409 Conflict)

---

## 🚢 Production Deployment to Render with Neon PostgreSQL

1. **Create Neon Database**:
   - Sign up at [neon.tech](https://neon.tech) and create a database named `ipsfinder`.
   - Copy the connection string. Ensure it ends with `?sslmode=require`.
   - Example: `jdbc:postgresql://ep-silent-hill-12345.ap-southeast-1.aws.neon.tech/ipsfinder?sslmode=require`

2. **Deploy to Render**:
   - In Render, create a **New Web Service** pointing to your repository.
   - Select **Docker** environment.
   - Set **Docker Context** to `./backend` and **Dockerfile Path** to `backend/Dockerfile`.
   - Set Environment Variables:
     - `DB_URL`: Neon JDBC connection string.
     - `DB_USER`: Neon database user.
     - `DB_PASSWORD`: Neon database password.
     - `JWT_SECRET`: A secure 64-character random string.
     - `CORS_ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://ips-pg-finder.vercel.app`).
     - `DEMO_MODE`: `false`.
   - Health check path: `/api/health`.

---

## 📑 API Summary Table

| Category | Method | Endpoint | Access | Summary |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public | Returns `{status: "UP"}` |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user |
| **Auth** | `POST` | `/api/auth/login` | Public | Login with email/password -> JWT |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Get current logged-in profile |
| **Auth** | `PUT` | `/api/auth/me` | Authenticated | Update user profile |
| **PG Public** | `GET` | `/api/pgs` | Public | Filter approved PGs with search params |
| **PG Public** | `GET` | `/api/pgs/{id}` | Public | Get PG details (increments viewCount) |
| **PG Owner** | `POST` | `/api/owner/pgs` | PG_OWNER, ADMIN | Create PG listing (starts PENDING) |
| **PG Owner** | `GET` | `/api/owner/pgs` | PG_OWNER, ADMIN | Get all my PG listings |
| **PG Owner** | `PUT` | `/api/owner/pgs/{id}` | PG_OWNER, ADMIN | Update my PG listing |
| **PG Owner** | `DELETE`| `/api/owner/pgs/{id}` | PG_OWNER, ADMIN | Delete my PG listing |
| **PG Owner** | `POST` | `/api/owner/pgs/{id}/confirm-availability` | PG_OWNER, ADMIN | Touch lastUpdated timestamp |
| **PG Owner** | `PATCH`| `/api/owner/pgs/{id}/beds` | PG_OWNER, ADMIN | Update available bed count |
| **PG Owner** | `GET` | `/api/owner/stats` | PG_OWNER, ADMIN | Owner metrics dashboard |
| **Mess Public**| `GET` | `/api/messes` | Public | Filter approved messes |
| **Mess Public**| `GET` | `/api/messes/{id}` | Public | Get mess profile with weekly menu |
| **Mess Owner** | `POST` | `/api/mess-owner/profile` | MESS_OWNER, ADMIN| Create or update mess profile |
| **Mess Owner** | `GET` | `/api/mess-owner/profile` | MESS_OWNER, ADMIN| Get current owner's mess profile |
| **Mess Owner** | `PUT` | `/api/mess-owner/profile` | MESS_OWNER, ADMIN| Update mess profile |
| **Mess Owner** | `PATCH`| `/api/mess-owner/profile/open` | MESS_OWNER, ADMIN| Toggle Open/Closed status |
| **Mess Owner** | `POST` | `/api/mess-owner/confirm-availability` | MESS_OWNER, ADMIN| Touch lastUpdated timestamp |
| **Mess Owner** | `GET` | `/api/mess-owner/stats` | MESS_OWNER, ADMIN| Mess metrics dashboard |
| **Menu Items** | `GET` | `/api/mess-owner/menu` | MESS_OWNER, ADMIN| List owner's menu items |
| **Menu Items** | `POST` | `/api/mess-owner/menu` | MESS_OWNER, ADMIN| Add item to weekly menu |
| **Menu Items** | `PUT` | `/api/mess-owner/menu/{id}` | MESS_OWNER, ADMIN| Update menu item |
| **Menu Items** | `DELETE`| `/api/mess-owner/menu/{id}` | MESS_OWNER, ADMIN| Delete menu item |
| **Reviews** | `GET` | `/api/reviews` | Public | List reviews for target PG or Mess |
| **Reviews** | `POST` | `/api/reviews` | STUDENT | Submit review (1 per student/target) |
| **Reviews** | `PUT` | `/api/reviews/{id}` | STUDENT | Edit student's review |
| **Reviews** | `DELETE`| `/api/reviews/{id}` | STUDENT, ADMIN | Delete review |
| **Reviews** | `POST` | `/api/reviews/{id}/reply` | Owner, ADMIN | Owner reply to review on listing |
| **Reviews** | `GET` | `/api/reviews/mine` | STUDENT | List all my reviews |
| **Wishlist** | `GET` | `/api/wishlist` | STUDENT | List bookmarked PGs/Messes |
| **Wishlist** | `POST` | `/api/wishlist` | STUDENT | Add item to wishlist |
| **Wishlist** | `DELETE`| `/api/wishlist/{id}` | STUDENT | Remove item from wishlist |
| **Inquiries** | `POST` | `/api/inquiries` | STUDENT | Send inquiry message to owner |
| **Inquiries** | `GET` | `/api/inquiries/mine` | STUDENT | List inquiries sent by student |
| **Inquiries** | `GET` | `/api/inquiries/received`| PG/MESS_OWNER | List inquiries received by owner |
| **Inquiries** | `PATCH`| `/api/inquiries/{id}/status` | PG/MESS_OWNER | Update inquiry status (NEW/CONTACTED)|
| **Reports** | `POST` | `/api/reports` | Authenticated | Submit listing report |
| **Admin** | `GET` | `/api/admin/stats` | ADMIN | Platform metrics |
| **Admin** | `GET` | `/api/admin/pending` | ADMIN | View all pending PGs and messes |
| **Admin** | `POST` | `/api/admin/pgs/{id}/approve` | ADMIN | Approve PG listing |
| **Admin** | `POST` | `/api/admin/pgs/{id}/reject` | ADMIN | Reject PG listing with reason |
| **Admin** | `POST` | `/api/admin/messes/{id}/approve`| ADMIN | Approve Mess profile |
| **Admin** | `POST` | `/api/admin/messes/{id}/reject` | ADMIN | Reject Mess profile with reason |
| **Admin** | `GET` | `/api/admin/listings` | ADMIN | View all listings |
| **Admin** | `DELETE`| `/api/admin/pgs/{id}` | ADMIN | Delete PG listing |
| **Admin** | `DELETE`| `/api/admin/messes/{id}` | ADMIN | Delete Mess profile |
| **Admin** | `GET` | `/api/admin/users` | ADMIN | View users (optional ?role= filter) |
| **Admin** | `PATCH`| `/api/admin/users/{id}/block` | ADMIN | Block user account |
| **Admin** | `PATCH`| `/api/admin/users/{id}/unblock`| ADMIN | Unblock user account |
| **Admin** | `GET` | `/api/admin/reviews` | ADMIN | View all reviews |
| **Admin** | `DELETE`| `/api/admin/reviews/{id}` | ADMIN | Delete review |
| **Admin** | `GET` | `/api/admin/reports` | ADMIN | View user reports |
| **Admin** | `PATCH`| `/api/admin/reports/{id}` | ADMIN | Update report status |
| **Admin** | `POST` | `/api/admin/announcements` | ADMIN | Create announcement |
| **Admin** | `PUT` | `/api/admin/announcements/{id}`| ADMIN | Edit announcement |
| **Admin** | `DELETE`| `/api/admin/announcements/{id}`| ADMIN | Delete announcement |
| **Announcements**| `GET`| `/api/announcements` | Public | Public announcements feed |
| **Dev** | `POST` | `/api/dev/reset-demo` | Public (Demo Mode)| Wipe & re-seed database |
#   T h e - s t u d e n t N e s t  
 