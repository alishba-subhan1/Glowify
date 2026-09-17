# Glowify - Smart Parlour Platform

Glowify is a **single platform website**:

- **Frontend** (`client/`) — customer pages + admin in one app
  - Customer: `/`, `/services`, `/book`, `/contact`
  - Admin: `/admin/login`, `/admin`
- **Backend** (`server/`) — REST API
- **Database** — MongoDB (local or Atlas)

## Stack

- Frontend: React + Vite + Tailwind + React Router + Fetch API
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

## Project Structure

```text
Glowify/
  client/   # Website (customer + admin)
  server/   # Backend API
```

## Run Locally

### One-click (Windows)

- Install: `install-glowify.bat`
- Start: `start-glowify.bat`
- Stop: `stop-glowify.bat`

### Manual

**1) API**

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

**2) Website**

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Open:

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin
- API health: http://localhost:5000/api/health

Default admin (auto-created on first run):

- Email: `admin@glowify.com`
- Password: `admin123`

## MongoDB Setup

1. Create free cluster on MongoDB Atlas
2. Database user + Network Access (your IP or `0.0.0.0/0` for demo)
3. In `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/glowify?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret
CLIENT_ORIGINS=http://localhost:5173
```

4. Verify: `http://localhost:5000/api/health` → `"database": "connected"`

## Deploy on Render

1. Push this repository to GitHub. The root `.gitignore` excludes local `.env` files, `node_modules`, and build output.
2. In Render, choose **New + → Blueprint** and connect the repository.
3. Render reads `render.yaml` and creates the API and static website services.
4. Enter values for `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when prompted.
5. After deployment, open the `glowify-client` service URL and use that link for sharing.

The API uses `CLIENT_URL` for CORS and `CLIENT_PUBLIC_URL` for public return URLs. The frontend uses `VITE_API_URL` to reach the API.

## Main API Endpoints

- `POST /api/auth/login` · `POST /api/auth/register`
- `GET /api/services` · `GET /api/services/all` (admin)
- `POST /api/bookings` · `GET /api/bookings` (admin)
- `PATCH /api/bookings/:id/status` (admin)
- `GET /api/notifications/admin` · `GET /api/settings`
- `POST /api/chat/customer` · `POST /api/contact`
