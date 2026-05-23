# 🚂 RailBook - Railway Reservation System

A full-stack railway reservation system built with React, Node.js, Express, and Oracle XE.

---

## Project Structure

```
dbms-proj/
├── backend/          ← Node.js + Express API
├── frontend/         ← React + Vite app
└── railway_setup.sql ← Oracle DB schema (already executed)
```

---

## Prerequisites

- Node.js v18+
- Oracle XE running in Docker on `localhost:1521`
- Oracle DB credentials: `system / Password123`
- Docker container with `XEPDB1` pluggable database

---

## Setup & Run

### 1. Start Oracle XE Docker (if not running)
```bash
docker start <your-oracle-container-name>
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### 3. Create Admin User (first time only)
```bash
cd backend
node scripts/createAdmin.js
```
Admin credentials: `admin@railbook.in` / `Admin@123`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get logged-in user profile |

### Trains
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trains/search?from=NDLS&to=HWH&date=2026-04-10` | Search trains |
| GET | `/api/trains/:trainNo` | Train details + route |
| GET | `/api/trains/stations` | All stations |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/bookings/my` | My bookings |
| GET | `/api/bookings/:pnr` | Booking by PNR |
| PUT | `/api/bookings/cancel/:pnr` | Cancel booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/pay` | Process payment |
| GET | `/api/payments/:pnr` | Payment details |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/passengers` | Saved passengers |
| POST | `/api/users/passengers` | Add passenger |
| PUT | `/api/users/passengers/:id` | Update passenger |
| DELETE | `/api/users/passengers/:id` | Delete passenger |

### Admin (Admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/train` | Add train |
| POST | `/api/admin/station` | Add station |
| POST | `/api/admin/route` | Add route stop |
| POST | `/api/admin/coach` | Add coach |
| GET | `/api/admin/bookings` | All bookings |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/stats` | Dashboard stats |

---

## Features

- JWT Authentication with bcrypt password hashing
- Train search with SQL joins across trains/routes/stations
- Seat allocation with CNF/WL logic
- Waitlist auto-promotion on cancellation
- Dummy payment system (UPI, Card, Net Banking, Wallet)
- IRCTC-style ticket display with print support
- Saved passengers (master_passengers table)
- Admin panel with analytics dashboard
- Responsive Bootstrap 5 UI with deep blue + orange theme

---

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `stations` | Station master data |
| `trains` | Train information |
| `coaches` | Coach/class details per train |
| `routes` | Train route stops with timings |
| `users` | Registered users |
| `bookings` | Booking records with PNR |
| `tickets` | Per-passenger ticket with seat/WL |
| `payments` | Payment transactions |
| `master_passengers` | Saved passenger profiles |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | Oracle XE (Docker) |
| Backend | Node.js + Express.js |
| Auth | JWT + bcryptjs |
| DB Driver | oracledb (thin mode) |
| Frontend | React 18 + Vite |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| UI Framework | Bootstrap 5 |
| Icons | Bootstrap Icons |
| Notifications | React Toastify |
| State | React Context API |
