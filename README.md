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

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Bootstrap 5       |
| Backend    | Node.js, Express.js               |
| Database   | Oracle SQL (Oracle XE 21c)        |
| Auth       | JSON Web Tokens (JWT), bcryptjs   |
| HTTP Client| Axios                             |
| Styling    | Bootstrap 5, Bootstrap Icons      |

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

Make sure the following are installed on your system before getting started:

- [Node.js](https://nodejs.org/) (v18 or above)
- [Oracle Database XE 21c](https://www.oracle.com/database/technologies/xe-downloads.html)
- [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/downloads.html) (required by `oracledb` Node.js driver)
- npm (comes with Node.js)
- Git

---

## 🗄️ Database Setup

1. Install and start **Oracle XE 21c**.

2. Connect to your Oracle database using SQL*Plus or SQL Developer:
   ```
   Username: system
   Password: <your password>
   Connect String: localhost:1521/XEPDB1
   ```

3. Run the SQL scripts to create the required tables (users, trains, bookings, payments, etc.). If a `schema.sql` file is provided in the project, run it:
   ```sql
   @path/to/schema.sql
   ```

4. Seed the admin user by running the script from the backend folder:
   ```bash
   node scripts/createAdmin.js
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

Create a `.env` file inside the `backend/` folder with the following content:

```env
PORT=5000
DB_USER=system
DB_PASSWORD=your_oracle_password
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

### Start the Backend

```bash
cd backend
npm run dev
```

The backend server will start at: `http://localhost:5000`

> For production: `npm start`

### Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

> Open this URL in your browser to use the application.

---

## 🔐 Environment Variables

| Variable           | Description                          | Example                  |
|--------------------|--------------------------------------|--------------------------|
| `PORT`             | Port for the backend server          | `5000`                   |
| `DB_USER`          | Oracle database username             | `system`                 |
| `DB_PASSWORD`      | Oracle database password             | `your_password`          |
| `DB_CONNECT_STRING`| Oracle connection string             | `localhost:1521/XEPDB1`  |
| `JWT_SECRET`       | Secret key for signing JWT tokens    | `your_secret_key`        |
| `JWT_EXPIRES_IN`   | JWT token expiry duration            | `7d`                     |

---