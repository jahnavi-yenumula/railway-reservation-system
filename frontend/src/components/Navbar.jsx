// Main Navigation Bar
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#0a2d6e' }}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-train-front-fill fs-4" style={{ color: '#e8600a' }}></i>
          <span>RailBook</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                <i className="bi bi-search me-1"></i>Search Trains
              </Link>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">
                    <i className="bi bi-ticket-perforated me-1"></i>My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/saved-passengers">
                    <i className="bi bi-people me-1"></i>Saved Passengers
                  </Link>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  <i className="bi bi-shield-lock me-1"></i>Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Auth Buttons */}
          <ul className="navbar-nav">
            {isLoggedIn ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>{user?.name?.split(' ')[0]}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-bookings">
                      <i className="bi bi-ticket me-2"></i>My Bookings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-sm ms-2 px-3 py-2"
                    to="/signup"
                    style={{ backgroundColor: '#e8600a', color: 'white', borderRadius: '6px' }}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
