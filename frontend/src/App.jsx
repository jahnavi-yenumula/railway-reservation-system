// Main App - sets up routing and layout
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// Context
import { AuthProvider } from './context/AuthContext'

// Layout Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SearchResultsPage from './pages/SearchResultsPage'
import TrainDetailsPage from './pages/TrainDetailsPage'
import BookingPage from './pages/BookingPage'
import PaymentPage from './pages/PaymentPage'
import TicketPage from './pages/TicketPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import SavedPassengersPage from './pages/SavedPassengersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />

        {/* Main Layout */}
        <div className="d-flex flex-column min-vh-100">
          <Navbar />

          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/train/:trainNo" element={<TrainDetailsPage />} />

              {/* Protected Routes (login required) */}
              <Route path="/booking/:trainNo" element={
                <ProtectedRoute><BookingPage /></ProtectedRoute>
              } />
              <Route path="/payment/:pnr" element={
                <ProtectedRoute><PaymentPage /></ProtectedRoute>
              } />
              <Route path="/ticket/:pnr" element={
                <ProtectedRoute><TicketPage /></ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/saved-passengers" element={
                <ProtectedRoute><SavedPassengersPage /></ProtectedRoute>
              } />

              {/* Admin Only Route */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
