# 🚆 Railway Reservation System

A full-stack web application for booking train tickets online. Built as a 2nd-year BTech CSE project, it covers the complete reservation workflow — from searching trains to booking seats, making payments, and managing bookings through an admin dashboard.

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Database Setup](#-database-setup)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)

---

## 📖 Project Description

The Railway Reservation System allows users to search for trains between stations, book tickets, choose seats, and make payments — all through a clean web interface. Admins can manage trains, view all bookings, and monitor the system through a dedicated dashboard.

---

## ✨ Features

### 👤 User
- Register and log in securely (JWT-based authentication)
- Search trains by source, destination, and date
- View available seats and select preferred class
- Book tickets with automatic seat allocation
- Make payments for confirmed bookings
- View and manage personal bookings (cancel, download)
- Save frequent passenger details

### 🛠️ Admin
- Secure admin login
- Add, update, and delete trains
- View all bookings across the system
- Monitor seat availability and waitlists

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Bootstrap 5         |
| Backend     | Node.js, Express.js                 |
| Database    | Oracle SQL (via Docker)             |
| Auth        | JSON Web Tokens (JWT), bcryptjs     |
| HTTP Client | Axios                               |
| Styling     | Bootstrap 5, Bootstrap Icons        |

---

## 📁 Folder Structure

```
railway-reservation-system/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # Oracle DB connection
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── trainController.js
│   │   └── userController.js
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
│   │   ├── generatePNR.js         # PNR number generator
│   │   ├── seatAllocator.js       # Auto seat allocation logic
│   │   └── waitlistManager.js     # Waitlist handling
│   ├── scripts/
│   │   ├── createAdmin.js         # Script to seed admin user
│   │   └── testDb.js              # Script to test DB connection
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── TrainCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SearchResultsPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SavedPassengersPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## ✅ Prerequisites

Install the following before getting started:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — to run Oracle Database (no Oracle installation needed)
- [Node.js v18+](https://nodejs.org/) — for backend and frontend
- npm — comes bundled with Node.js
- Git — to clone the repository

> ⚠️ You do **not** need to install Oracle XE separately. Docker handles it entirely.

---

## 🗄️ Database Setup (Docker)

### Step 1 — Pull and start Oracle XE container

Open a terminal and run:

```bash
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PWD=Password123 \
  container-registry.oracle.com/database/express:21.3.0-xe
```

> On Windows CMD, replace the `\` line continuations with `^` or just run it as one line.

### Step 2 — Wait for Oracle to be ready

```bash
docker logs -f oracle-xe
```

Wait until you see:

```
DATABASE IS READY TO USE!
```

Then press `Ctrl+C` to stop watching logs.

### Step 3 — Verify the connection (optional)

```bash
docker exec -it oracle-xe sqlplus system/Password123@localhost:1521/XEPDB1
```

If you see a `SQL>` prompt, the database is up and running.

### Step 4 — Seed the admin user

From the `backend/` folder, run:

```bash
node scripts/createAdmin.js
```

### Future starts (after first setup)

You don't need to re-create the container. Just start it with:

```bash
docker start oracle-xe
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/railway-reservation-system.git
cd railway-reservation-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
DB_USER=system
DB_PASSWORD=Password123
DB_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

You need **three things running** at the same time — Oracle (Docker), the backend, and the frontend.

### Terminal 1 — Start Oracle Database

```bash
docker start oracle-xe
```

### Terminal 2 — Start the Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
Oracle DB connected successfully
```

### Terminal 3 — Start the Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready
➜  Local:   http://localhost:5173/
```

### Open in Browser

Visit: **http://localhost:5173**

---

## 🔐 Environment Variables

| Variable            | Description                        | Example                 |
|---------------------|------------------------------------|-------------------------|
| `PORT`              | Port for the backend server        | `5000`                  |
| `DB_USER`           | Oracle database username           | `system`                |
| `DB_PASSWORD`       | Oracle database password           | `Password123`           |
| `DB_CONNECT_STRING` | Oracle connection string           | `localhost:1521/XEPDB1` |
| `JWT_SECRET`        | Secret key for signing JWT tokens  | `your_secret_key`       |
| `JWT_EXPIRES_IN`    | JWT token expiry duration          | `7d`                    |

---

## ❗ Common Errors

| Error | Fix |
|-------|-----|
| `ORA-12541: No listener` | Run `docker start oracle-xe` and wait for it to be ready |
| `Cannot find module` | Run `npm install` inside the failing folder |
| `Port 5000 already in use` | Change `PORT` in `.env` or kill the process using that port |
| `Docker not found` | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure it's running |

---

## 👨‍💻 Author

**Y. Thanush Reddy**  
2nd Year BTech CSE

---

## 📄 License

This project is built for academic purposes.
