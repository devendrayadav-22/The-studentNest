# StudentNest - Deployment Guide

StudentNest is designed for high-availability cloud deployment with separated frontend and backend architectures.

## Architecture

- **Frontend**: React + Vite SPA, hosted on **Vercel** with client-side SPA routing rewrites.
- **Backend**: Spring Boot 3.3.4 REST API, running on **Render / Railway / AWS EC2**.
- **Database**: Managed **PostgreSQL (Neon / Supabase / AWS RDS)**.

---

## 1. Vercel Deployment (Frontend)

1. Connect your repository to Vercel and set the Root Directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL`: URL of the deployed Spring Boot backend (e.g. `https://studentnest-api.onrender.com`).
   - `VITE_DEMO_MODE`: `true` (enables one-click demo credentials).
6. Verify `frontend/vercel.json` rewrite configuration:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 2. Backend Deployment (Render / Docker)

1. Set Environment Variables:
   - `PORT`: `8080`
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `DB_URL`: `jdbc:postgresql://<neon-hostname>/studentnest?sslmode=require`
   - `DB_USER`: `<neon-user>`
   - `DB_PASSWORD`: `<neon-password>`
   - `JWT_SECRET`: 64+ character base64 string
   - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL
   - `DEMO_MODE`: `true`
2. Docker build using the included multi-stage `Dockerfile`:
   ```bash
   docker build -t studentnest-backend ./backend
   docker run -p 8080:8080 studentnest-backend
   ```

