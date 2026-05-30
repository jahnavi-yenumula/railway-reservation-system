# 🚆 Railway Reservation System

A full-stack web application for booking train tickets online. Built as a 2nd-year BTech CSE project using React, Node.js, Express.js, and Oracle SQL. Covers the complete reservation workflow — searching trains, booking seats, making payments, cancellations, waitlist management, and an admin dashboard.

> **Schema Version:** 3.0 (Enterprise Refinement Master)

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Database Setup](#-database-setup-docker)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Common Errors](#-common-errors)

---

## 📖 Project Description

The Railway Reservation System allows users to search for trains between stations, book tickets for one or more passengers, choose a travel class, and make payments — all through a clean web interface. The system handles automatic seat allocation, waitlisting, and waitlist promotion on cancellation.

Admins can manage trains, stations, routes, coach classes, train compositions, and view all bookings and users through a dedicated dashboard.

---

## ✨ Features

### 👤 User
- Register and log in securely (JWT-based authentication)
- Search trains by source station, destination station, and date
- View available coaches with real-time seat counts and fare per person
- Select travel quota: General, Tatkal, Ladies, Defence, Senior Citizen
- Book tickets for up to 6 passengers in one booking
- Automatic seat allocation — confirmed (CNF) or waitlisted (WL)
- Make payments via UPI, Credit Card, Debit Card, Net Banking, or Wallet
- View all personal bookings with PNR, status, and payment info
- View full e-ticket with passenger details, coach, seat, and berth
- Cancel bookings — waitlisted passengers are automatically promoted
- Save frequent passenger profiles for quick booking
- View and update personal profile

### 🛠️ Admin
- Secure admin-only login (role-based access control)
- Add new trains with type and active days schedule
- Add stations with city, name, and state
- Add route stops with sequence, distance, and times (minutes since midnight)
- Add coach classes to the catalog (class code, name, seats, fare multiplier)
- Assign coaches to specific train run dates (train composition)
- View all bookings across the system with source/destination and quota
- View all registered users
- Dashboard with total bookings, users, trains, and revenue stats

---

## 🛠️ Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, Vite, Bootstrap 5, Bootstrap Icons    |
| Backend     | Node.js 18+, Express.js 4                       |
| Database    | Oracle Database XE 21c (via Docker)             |
| ORM / Driver| oracledb 6 (thin mode — no Instant Client needed)|
| Auth        | JSON Web Tokens (JWT), bcryptjs                 |
| HTTP Client | Axios                                           |

---

## 🗄️ Database Schema

Schema version 3.0. Run `railway_setup.sql` to create all tables, indexes, views, and seed data.

### Tables

| Table | Description |
|-------|-------------|
| `stations` | Station master — code, name, city, state |
| `trains` | Train master — number, name, type, active days |
| `routes` | Train route stops — sequence, arrival/departure (minutes since midnight), distance |
| `train_instances` | A specific run of a train on a specific date — tracks status and delays |
| `coach_classes` | Static catalog of coach types — class code, name, seats, fare multiplier (₹/km) |
| `train_composition` | Dynamic assignment of coaches to a train on a specific run date |
| `users` | Registered users — email, mobile, DOB, gender, role, bcrypt password hash |
| `bookings` | Booking record — PNR, user, train, journey date, source/destination stations, quota, fare, status |
| `tickets` | Individual passenger tickets — name, age, gender, composition, seat, berth, status (CNF/RAC/WL/CAN) |
| `payments` | Payment record — transaction ID, PNR, amount, method, status |
| `master_passengers` | Saved passenger profiles per user |

### View

| View | Description |
|------|-------------|
| `v_booking_fare_estimates` | Calculates dynamic fare from distance × class multiplier for each booking |

### Key Design Points

- **Times as integers** — `arrival_time` and `depart_time` in `routes` are stored as minutes since midnight (0–1439). Example: 16:50 = 1010. The backend converts these to `HH:MM` strings before sending to the frontend.
- **Dynamic coach inventory** — Coaches are not fixed to a train. Each run date gets its own `train_composition` record. If no composition exists for a date, the backend auto-copies it from the most recent run.
- **Fare calculation** — `total_fare = distance_km × base_fare_multiplier × passenger_count`. The multiplier is defined per class in `coach_classes`.
- **Booking status** — `'Booked'`, `'Cancelled'`, `'Partially_Cancelled'` (no `'Confirmed'` or `'Pending'`).
- **Ticket status** — `'CNF'` (confirmed), `'RAC'`, `'WL'` (waitlist), `'CAN'` (cancelled).
- **Payment methods** — Must be exactly one of: `'UPI'`, `'Credit Card'`, `'Debit Card'`, `'Net Banking'`, `'Wallet'`.
- **User roles** — `'Admin'`, `'Station Master'`, `'Passenger'`, `'TC'`.

---

## 📁 Folder Structure

```
railway-reservation-system/
│
├── railway_setup.sql              # Full Oracle schema v3.0 — run this first
│
├── backend/
│   ├── config/
│   │   └── db.js                  # Oracle connection pool (thin mode)
│   ├── controllers/
│   │   ├── adminController.js     # Train, station, route, coach class, composition management
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── bookingController.js   # Create, view, cancel bookings
│   │   ├── paymentController.js   # Process and view payments
│   │   ├── trainController.js     # Search, details, coaches-for-date
│   │   └── userController.js      # Saved passengers, profile update
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── adminMiddleware.js     # Admin role check
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── trainRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generatePNR.js         # Generates unique 10-digit PNR
│   │   ├── seatAllocator.js       # Auto seat allocation using composition_id
│   │   └── waitlistManager.js     # Promotes WL → CNF on cancellation
│   ├── scripts/
│   │   ├── createAdmin.js         # One-time script to seed admin user
│   │   └── testDb.js              # Script to test DB queries
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables (not committed)
│   └── package.json
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── TrainCard.jsx      # Search result card with class codes and availability
│       │   ├── ProtectedRoute.jsx
│       │   └── LoadingSpinner.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state (JWT + user info)
│       ├── pages/
│       │   ├── HomePage.jsx           # Search form + popular routes
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── SearchResultsPage.jsx  # Train search results
│       │   ├── TrainDetailsPage.jsx   # Full route + coach class info
│       │   ├── BookingPage.jsx        # Passenger form + quota + coach selection + fare
│       │   ├── PaymentPage.jsx        # Payment method selection
│       │   ├── TicketPage.jsx         # E-ticket with seat, berth, class details
│       │   ├── MyBookingsPage.jsx     # User's booking history + cancel
│       │   ├── ProfilePage.jsx        # View and edit profile
│       │   ├── SavedPassengersPage.jsx# Manage saved passenger profiles
│       │   ├── AdminDashboardPage.jsx # Full admin panel
│       │   └── NotFoundPage.jsx
│       ├── services/
│       │   └── api.js             # All Axios API calls
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

---

## ✅ Prerequisites

Install the following before getting started:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — to run Oracle Database XE (no Oracle installation needed)
- [Node.js v18+](https://nodejs.org/) — for backend and frontend
- npm — comes bundled with Node.js
- Git — to clone the repository

> You do **not** need to install Oracle Instant Client. The backend uses `oracledb` in **thin mode**.

---

## 🗄️ Database Setup (Docker)

### Step 1 — Pull and start Oracle XE container

```bash
docker run -d --name oracle-xe -p 1521:1521 -e ORACLE_PWD=your_db_password container-registry.oracle.com/database/express:21.3.0-xe
```

### Step 2 — Wait for Oracle to be ready

```bash
docker logs -f oracle-xe
```

Wait until you see:

```
DATABASE IS READY TO USE!
```

Press `Ctrl+C` to stop watching logs.

### Step 3 — Connect to Oracle and run the schema

```bash
docker exec -it oracle-xe sqlplus system/your_db_password@localhost:1521/XEPDB1
```

Once at the `SQL>` prompt, run the setup file:

```sql
@/path/to/railway_setup.sql
```

Or copy-paste the contents of `railway_setup.sql` directly into the SQL prompt. This will:
- Drop and recreate all tables
- Create indexes and the fare estimate view
- Insert seed data (stations, trains, routes, coach classes, a sample booking)

### Step 4 — Create the admin user

From the `backend/` folder:

```bash
node scripts/createAdmin.js
```

This creates:
- **Email:** `admin@railbook.in`
- **Password:** `Admin@123`

### Future starts

```bash
docker start oracle-xe
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/railway-reservation-system.git
cd railway-reservation-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_USER=system
DB_PASSWORD=your_db_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

You need three things running at the same time.

### Terminal 1 — Oracle Database

```bash
docker start oracle-xe
```

### Terminal 2 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Oracle DB connection pool created successfully
🚀 Server running on http://localhost:5000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready
➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT token |
| GET | `/profile` | Yes | Get logged-in user's profile |

### Trains — `/api/trains`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?from=&to=&date=` | No | Search trains by route and date |
| GET | `/stations` | No | Get all stations |
| GET | `/` | No | Get all trains |
| GET | `/:trainNo` | No | Get train details, route, and coach classes |
| GET | `/:trainNo/coaches?date=` | No | Get coach composition for a specific date (auto-creates if missing) |

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/create` | Yes | Create a new booking with seat allocation |
| GET | `/my` | Yes | Get all bookings for the logged-in user |
| GET | `/:pnr` | Yes | Get full booking details by PNR |
| PUT | `/cancel/:pnr` | Yes | Cancel a booking and promote waitlist |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/pay` | Yes | Process payment for a booking |
| GET | `/:pnr` | Yes | Get payment details for a PNR |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/passengers` | Yes | Get saved passenger profiles |
| POST | `/passengers` | Yes | Add a saved passenger |
| PUT | `/passengers/:id` | Yes | Update a saved passenger |
| DELETE | `/passengers/:id` | Yes | Delete a saved passenger |
| PUT | `/profile` | Yes | Update user profile (name, mobile) |

### Admin — `/api/admin` *(Admin role required)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats (bookings, users, trains, revenue) |
| GET | `/bookings` | All bookings across the system |
| GET | `/users` | All registered users |
| GET | `/coach-classes` | All coach classes in the catalog |
| POST | `/train` | Add a new train |
| POST | `/station` | Add a new station |
| POST | `/route` | Add a route stop (times in minutes since midnight) |
| POST | `/coach-class` | Add a coach class to the catalog |
| POST | `/train-composition` | Assign a coach to a train on a specific run date |

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `DB_USER` | Oracle database username | `system` |
| `DB_PASSWORD` | Oracle database password | `your_db_password` |
| `DB_CONNECT_STRING` | Oracle connection string | `localhost:1521/XEPDB1` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `7d` |

---

## ❗ Common Errors

| Error | Fix |
|-------|-----|
| `ORA-12541: No listener` | Run `docker start oracle-xe` and wait for "DATABASE IS READY TO USE!" |
| `ORA-00001: unique constraint violated` | You are inserting a duplicate PNR, station code, or train number |
| `ORA-02291: integrity constraint violated` | The referenced train/station/composition does not exist — insert parent record first |
| `Cannot find module` | Run `npm install` inside the `backend/` or `frontend/` folder |
| `Port 5000 already in use` | Change `PORT` in `.env` or kill the process using that port |
| `No coaches available for this date` | The backend will auto-create composition for any date — check that `train_instances` has at least one record for the train |
| `Docker not found` | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and ensure it is running |
| `Invalid payment method` | Must be exactly: `UPI`, `Credit Card`, `Debit Card`, `Net Banking`, or `Wallet` |

---

## 🧪 Demo Credentials

After running `node scripts/createAdmin.js`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@railbook.in` | `Admin@123` |
| Passenger | `traveler@example.com` | *(set via signup)* |

The SQL seed data also inserts a sample passenger (`traveler@example.com`) and a booking with PNR `4215567890` for train `12302` (Howrah Rajdhani Express) on `2026-04-10`.

---

## 📝 Notes for Students

- **Oracle bind variables** — Never use `:from`, `:to`, `:date`, `:status`, `:name`, `:type` as bind variable names in `oracledb` queries. These are reserved words. Use `:src`, `:dst`, `:jDate`, `:tktStatus`, `:passName`, etc.
- **Times are integers** — Route times in the database are stored as minutes since midnight (0–1439), not as `HH:MM` strings. The backend converts them before sending to the frontend using a `minsToTime()` helper.
- **Composition auto-copy** — When a user books for a date that has no `train_composition` record, the backend automatically copies the coach layout from the most recent available run. This means you only need to seed one run date and all future dates will work.
- **Fare formula** — `fare = distance_km × base_fare_multiplier × passengers`. The multiplier is stored in `coach_classes` (e.g., SL = 0.60, 3A = 1.70, 1A = 4.20).
