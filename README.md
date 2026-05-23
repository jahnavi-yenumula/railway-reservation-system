🚂 Railway Reservation System

A comprehensive, full-stack web application designed to facilitate online train ticket booking, passenger management, and administrative control over railway operations.

🚀 Features

Passenger (User) Features

Authentication: Secure user registration and login system.

Train Search: Search for available trains between source and destination stations on specific dates.

Ticket Booking: Dynamic seat allocation system.

Waitlist Management: Automated waitlist handling and confirmation logic when trains are fully booked.

PNR Generation: Automatic generation of unique Passenger Name Record (PNR) numbers for confirmed tickets.

Booking History: View, track, and manage past and upcoming journeys in a dedicated dashboard.

Saved Passengers: Save passenger details for quicker checkouts in the future.

Payment Integration: Secure payment processing page for finalizing bookings.

Administrator Features

Admin Dashboard: Centralized control panel for administrative tasks.

Train Management: Create, update, modify routes, and manage train schedules.

Oversight: Monitor bookings and overall system usage.

🛠️ Tech Stack

Frontend: React.js (Bootstrapped with Vite), Context API for state management.

Backend: Node.js, Express.js.

Database: SQL (Schema provided in railway_setup.sql).

Authentication: JWT (JSON Web Tokens) with secure middleware.

📂 Project Structure

railway-reservation-system/
├── backend/                  # Node.js / Express Backend
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Request handlers (admin, auth, booking, etc.)
│   ├── middleware/           # Custom middlewares (auth, admin checks)
│   ├── routes/               # API route definitions
│   ├── scripts/              # DB testing and Admin creation scripts
│   ├── utils/                # Helper functions (PNR generator, seat allocator, etc.)
│   └── server.js             # Main backend entry point
├── frontend/                 # React.js Frontend
│   ├── public/               # Static assets
│   ├── src/                  
│   │   ├── components/       # Reusable UI components (Navbar, TrainCard, etc.)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # Application pages (Home, Login, Booking, etc.)
│   │   ├── services/         # API integration logic
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx          # Frontend entry point
│   ├── index.html            
│   └── vite.config.js        
├── railway_setup.sql         # SQL script to initialize the database schema
└── README.md                 # Project documentation


⚙️ Local Development Setup

Follow these steps to get the project up and running on your local machine.

Prerequisites

Node.js (v16 or higher)

A running SQL database server (MySQL/PostgreSQL depending on your specific DB driver in backend/config/db.js)

Git

1. Database Setup

Open your SQL client.

Create a new database for the project.

Run the provided railway_setup.sql script to create the necessary tables and relationships.

2. Backend Setup

Navigate to the backend directory:

cd backend


Install dependencies:

npm install


Create a .env file in the backend directory and configure your environment variables (e.g., Database credentials, JWT Secret, Port):

PORT=5000
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
JWT_SECRET=your_super_secret_jwt_key


Run the setup script to create an initial admin account:

node scripts/createAdmin.js


Start the backend server:

npm start
# or npm run dev for nodemon


3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

cd frontend


Install dependencies:

npm install


Create a .env file in the frontend directory for API configuration:

VITE_API_URL=http://localhost:5000/api


Start the frontend development server:

npm run dev


🛡️ Security

Passwords are fundamentally encrypted before being stored in the database.

API endpoints are protected using JWT Authentication.

Role-based access control (RBAC) ensures only admins can access administrative routes (adminMiddleware.js).
