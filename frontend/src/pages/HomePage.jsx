// Home Page - Hero, Search Form, Stats, Popular Trains
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const HomePage = () => {
  const navigate = useNavigate()
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchForm.from || !searchForm.to || !searchForm.date) {
      toast.error('Please fill all search fields')
      return
    }
    if (searchForm.from === searchForm.to) {
      toast.error('Source and destination cannot be same')
      return
    }
    navigate(`/search?from=${searchForm.from}&to=${searchForm.to}&date=${searchForm.date}`)
  }

  // Popular stations for quick select
  const stations = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'HWH', name: 'Howrah' },
    { code: 'KNP', name: 'Kanpur' },
    { code: 'DDU', name: 'Mughalsarai' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <h1 className="mb-3">
                <i className="bi bi-train-front-fill me-2" style={{ color: '#e8600a' }}></i>
                Book Train Tickets Fast & Easy
              </h1>
              <p className="lead opacity-75">
                Search trains, check availability, and book tickets in minutes. Your journey starts here.
              </p>
              <div className="d-flex gap-3 mt-4">
                <div className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e8600a' }}>500+</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Trains Daily</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e8600a' }}>1M+</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Passengers</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e8600a' }}>99%</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>On Time</div>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <div className="col-lg-7">
              <div className="card search-card p-4">
                <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
                  <i className="bi bi-search me-2"></i>Search Trains
                </h5>
                <form onSubmit={handleSearch}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-500">From Station</label>
                      <select
                        className="form-select"
                        value={searchForm.from}
                        onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                        required
                      >
                        <option value="">Select Source</option>
                        {stations.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">To Station</label>
                      <select
                        className="form-select"
                        value={searchForm.to}
                        onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                        required
                      >
                        <option value="">Select Destination</option>
                        {stations.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Journey Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={searchForm.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <button
                        type="submit"
                        className="btn w-100 py-2 fw-600"
                        style={{ backgroundColor: '#e8600a', color: 'white', borderRadius: '8px' }}
                      >
                        <i className="bi bi-search me-2"></i>Search Trains
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container my-5">
        <div className="row g-4">
          {[
            { icon: 'bi-train-front', label: 'Trains Available', value: '500+', color: '#0a2d6e' },
            { icon: 'bi-geo-alt', label: 'Stations Connected', value: '7,000+', color: '#198754' },
            { icon: 'bi-people', label: 'Daily Passengers', value: '2.3 Crore', color: '#e8600a' },
            { icon: 'bi-shield-check', label: 'Safe Journeys', value: '99.9%', color: '#6f42c1' },
          ].map((stat, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="card text-center p-4">
                <i className={`bi ${stat.icon} fs-1 mb-2`} style={{ color: stat.color }}></i>
                <h4 className="fw-bold mb-1" style={{ color: stat.color }}>{stat.value}</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Routes */}
      <div style={{ backgroundColor: '#f0f4ff' }} className="py-5">
        <div className="container">
          <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
            <i className="bi bi-star-fill me-2" style={{ color: '#e8600a' }}></i>
            Popular Routes
          </h4>
          <div className="row g-3">
            {[
              { from: 'NDLS', to: 'HWH', fromName: 'New Delhi', toName: 'Howrah', trains: 12 },
              { from: 'NDLS', to: 'KNP', fromName: 'New Delhi', toName: 'Kanpur', trains: 8 },
              { from: 'KNP', to: 'HWH', fromName: 'Kanpur', toName: 'Howrah', trains: 6 },
              { from: 'NDLS', to: 'DDU', fromName: 'New Delhi', toName: 'Mughalsarai', trains: 10 },
            ].map((route, i) => (
              <div key={i} className="col-md-3">
                <div
                  className="card p-3 cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`/search?from=${route.from}&to=${route.to}&date=${new Date().toISOString().split('T')[0]}`)
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold" style={{ color: '#0a2d6e' }}>{route.fromName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>→ {route.toName}</div>
                    </div>
                    <span className="badge" style={{ backgroundColor: '#e8600a' }}>
                      {route.trains} Trains
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="container my-5">
        <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
          <i className="bi bi-megaphone-fill me-2" style={{ color: '#e8600a' }}></i>
          Announcements
        </h4>
        <div className="row g-3">
          {[
            { icon: 'bi-info-circle', color: 'primary', text: 'Special trains added for summer vacation season. Book early to avoid waitlist.' },
            { icon: 'bi-exclamation-triangle', color: 'warning', text: 'Maintenance work on Delhi-Mumbai route. Expect minor delays on 25th May.' },
            { icon: 'bi-check-circle', color: 'success', text: 'New AC coaches added to Rajdhani Express. Enhanced comfort for passengers.' },
          ].map((ann, i) => (
            <div key={i} className="col-md-4">
              <div className={`alert alert-${ann.color} d-flex gap-2`} role="alert">
                <i className={`bi ${ann.icon} flex-shrink-0 mt-1`}></i>
                <div style={{ fontSize: '0.85rem' }}>{ann.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ backgroundColor: '#0a2d6e' }} className="py-5">
        <div className="container">
          <h4 className="fw-bold text-white text-center mb-4">Why Choose RailBook?</h4>
          <div className="row g-4 text-center">
            {[
              { icon: 'bi-lightning-charge', title: 'Instant Booking', desc: 'Book tickets in under 2 minutes' },
              { icon: 'bi-shield-lock', title: 'Secure Payments', desc: 'Multiple safe payment options' },
              { icon: 'bi-phone', title: 'Mobile Friendly', desc: 'Book from any device, anywhere' },
              { icon: 'bi-headset', title: '24/7 Support', desc: 'Always here to help you' },
            ].map((f, i) => (
              <div key={i} className="col-6 col-md-3">
                <i className={`bi ${f.icon} fs-1 mb-3`} style={{ color: '#e8600a' }}></i>
                <h6 className="text-white fw-bold">{f.title}</h6>
                <p style={{ color: '#cdd8f0', fontSize: '0.85rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
