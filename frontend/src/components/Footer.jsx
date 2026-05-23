// Footer Component
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <div className="container">
        <div className="row py-4">
          {/* Brand */}
          <div className="col-md-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-train-front-fill fs-4" style={{ color: '#e8600a' }}></i>
              <h5 className="text-white mb-0 fw-bold">RailBook</h5>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              India's trusted railway reservation platform. Book tickets, check PNR status, and manage your journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search Trains</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-md-3 mb-4">
            <h6>Services</h6>
            <ul className="list-unstyled">
              <li><a href="#">PNR Status</a></li>
              <li><a href="#">Train Schedule</a></li>
              <li><a href="#">Seat Availability</a></li>
              <li><a href="#">Fare Enquiry</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3 mb-4">
            <h6>Contact</h6>
            <ul className="list-unstyled" style={{ fontSize: '0.85rem' }}>
              <li><i className="bi bi-telephone me-2"></i>139 (Railway Helpline)</li>
              <li><i className="bi bi-envelope me-2"></i>support@railbook.in</li>
              <li><i className="bi bi-clock me-2"></i>24/7 Support</li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <div className="row pb-3">
          <div className="col text-center" style={{ fontSize: '0.8rem' }}>
            © 2026 RailBook. Built as a student project. Not affiliated with Indian Railways.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
