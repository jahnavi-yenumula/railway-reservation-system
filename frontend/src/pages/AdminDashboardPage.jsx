// Admin Dashboard Page
// Updated for schema v3.0:
//   - "Add Coach" replaced by "Add Coach Class" + "Add Train Composition"
//   - Station form now includes 'state' field
//   - Train form now includes 'active_days' field
//   - Route times are now integers (minutes since midnight, 0-1439)
//   - Bookings table shows source/destination station codes and quota
import React, { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [coachClasses, setCoachClasses] = useState([])
  const [loading, setLoading] = useState(false)

  // Forms
  const [trainForm, setTrainForm] = useState({ train_no: '', train_name: '', train_type: 'Express', active_days: '1111111' })
  const [stationForm, setStationForm] = useState({ stn_code: '', city: '', stn_name: '', state: '' })
  const [coachClassForm, setCoachClassForm] = useState({ class_code: '', class_name: '', total_seats: 72, base_fare_multiplier: 1.70 })
  const [compositionForm, setCompositionForm] = useState({ train_no: '', run_date: '', coach_label: '', class_code: '' })
  const [routeForm, setRouteForm] = useState({ train_no: '', stn_code: '', arrival_time: '', depart_time: '', sequence_num: '', distance_from_source: 0 })

  useEffect(() => {
    if (activeTab === 'stats') fetchStats()
    if (activeTab === 'bookings') fetchBookings()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'addComposition') fetchCoachClasses()
  }, [activeTab])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getStats()
      setStats(res.data.stats)
    } catch (err) {
      toast.error('Error fetching stats')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllBookings()
      setBookings(res.data.bookings || [])
    } catch (err) {
      toast.error('Error fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllUsers()
      setUsers(res.data.users || [])
    } catch (err) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const fetchCoachClasses = async () => {
    try {
      const res = await adminAPI.getCoachClasses()
      setCoachClasses(res.data.coachClasses || [])
    } catch (err) {
      // silently fail
    }
  }

  const handleAddTrain = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addTrain(trainForm)
      toast.success('Train added successfully')
      setTrainForm({ train_no: '', train_name: '', train_type: 'Express', active_days: '1111111' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding train')
    }
  }

  const handleAddStation = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addStation(stationForm)
      toast.success('Station added successfully')
      setStationForm({ stn_code: '', city: '', stn_name: '', state: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding station')
    }
  }

  const handleAddCoachClass = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addCoachClass(coachClassForm)
      toast.success('Coach class added successfully')
      setCoachClassForm({ class_code: '', class_name: '', total_seats: 72, base_fare_multiplier: 1.70 })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding coach class')
    }
  }

  const handleAddComposition = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addTrainComposition(compositionForm)
      toast.success('Train composition added successfully')
      setCompositionForm({ train_no: '', run_date: '', coach_label: '', class_code: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding train composition')
    }
  }

  const handleAddRoute = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addRoute(routeForm)
      toast.success('Route stop added successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding route')
    }
  }

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: 'bi-speedometer2' },
    { id: 'bookings', label: 'All Bookings', icon: 'bi-ticket' },
    { id: 'users', label: 'All Users', icon: 'bi-people' },
    { id: 'addTrain', label: 'Add Train', icon: 'bi-train-front' },
    { id: 'addStation', label: 'Add Station', icon: 'bi-geo-alt' },
    { id: 'addCoachClass', label: 'Add Coach Class', icon: 'bi-grid-3x3' },
    { id: 'addComposition', label: 'Train Composition', icon: 'bi-layout-three-columns' },
    { id: 'addRoute', label: 'Add Route', icon: 'bi-map' },
  ]

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '220px', flexShrink: 0 }}>
        <div className="px-3 py-3 text-white fw-bold border-bottom border-secondary mb-2">
          <i className="bi bi-shield-lock me-2" style={{ color: '#e8600a' }}></i>Admin Panel
        </div>
        <nav className="nav flex-column">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-link text-start ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon} me-2`}></i>{tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>

        {/* Stats Dashboard */}
        {activeTab === 'stats' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Dashboard Overview</h5>
            {loading ? <LoadingSpinner /> : stats && (
              <div className="row g-4">
                {[
                  { label: 'Total Bookings', value: stats.totalBookings, icon: 'bi-ticket', color: '#0a2d6e' },
                  { label: 'Total Users', value: stats.totalUsers, icon: 'bi-people', color: '#198754' },
                  { label: 'Total Trains', value: stats.totalTrains, icon: 'bi-train-front', color: '#e8600a' },
                  { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString('en-IN')}`, icon: 'bi-currency-rupee', color: '#6f42c1' },
                ].map((s, i) => (
                  <div key={i} className="col-md-3">
                    <div className="card p-4 text-center">
                      <i className={`bi ${s.icon} fs-1 mb-2`} style={{ color: s.color }}></i>
                      <h4 className="fw-bold" style={{ color: s.color }}>{s.value}</h4>
                      <p className="text-muted mb-0">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Bookings */}
        {activeTab === 'bookings' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>All Bookings</h5>
            {loading ? <LoadingSpinner /> : (
              <div className="table-responsive">
                <table className="table table-hover bg-white rounded">
                  <thead style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
                    <tr>
                      <th>PNR</th>
                      <th>Passenger</th>
                      <th>Train</th>
                      <th>Route</th>
                      <th>Journey Date</th>
                      <th>Quota</th>
                      <th>Fare</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.PNR_10}>
                        <td><strong style={{ color: '#e8600a' }}>{b.PNR_10}</strong></td>
                        <td>
                          <div>{b.PASSENGER_NAME}</div>
                          <small className="text-muted">{b.EMAIL}</small>
                        </td>
                        <td>
                          <div>{b.TRAIN_NAME}</div>
                          <small className="text-muted">#{b.TRAIN_NO}</small>
                        </td>
                        <td>
                          <small>{b.SOURCE_STN_CODE} → {b.DESTINATION_STN_CODE}</small>
                        </td>
                        <td>{b.JOURNEY_DATE}</td>
                        <td><span className="badge bg-secondary">{b.QUOTA}</span></td>
                        <td>₹{b.TOTAL_FARE}</td>
                        <td>
                          <span className={`badge ${b.STATUS === 'Booked' ? 'bg-success' : b.STATUS === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {b.STATUS}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${b.PAYMENT_STATUS === 'Success' ? 'bg-success' : 'bg-secondary'}`}>
                            {b.PAYMENT_STATUS || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Users */}
        {activeTab === 'users' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>All Users</h5>
            {loading ? <LoadingSpinner /> : (
              <div className="table-responsive">
                <table className="table table-hover bg-white rounded">
                  <thead style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Gender</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.USER_ID}>
                        <td>{u.USER_ID}</td>
                        <td>{u.FIRST_NAME} {u.LAST_NAME}</td>
                        <td>{u.EMAIL}</td>
                        <td>{u.MOBILE}</td>
                        <td>{u.GENDER}</td>
                        <td>
                          <span className={`badge ${u.ROLE === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {u.ROLE}
                          </span>
                        </td>
                        <td>{u.CREATED_AT}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Train */}
        {activeTab === 'addTrain' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Add New Train</h5>
            <div className="card" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <form onSubmit={handleAddTrain}>
                  <div className="mb-3">
                    <label className="form-label">Train Number <small className="text-muted">(digits only)</small></label>
                    <input type="text" className="form-control" placeholder="e.g. 12301"
                      value={trainForm.train_no} onChange={(e) => setTrainForm({ ...trainForm, train_no: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Train Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Rajdhani Express"
                      value={trainForm.train_name} onChange={(e) => setTrainForm({ ...trainForm, train_name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Train Type</label>
                    <select className="form-select" value={trainForm.train_type}
                      onChange={(e) => setTrainForm({ ...trainForm, train_type: e.target.value })}>
                      {['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Duronto', 'Passenger'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Active Days <small className="text-muted">(7-char binary: MTWTFSS, 1=runs, 0=off)</small></label>
                    <input type="text" className="form-control" placeholder="e.g. 1111111"
                      maxLength={7} pattern="[01]{7}"
                      value={trainForm.active_days} onChange={(e) => setTrainForm({ ...trainForm, active_days: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Add Train</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Station */}
        {activeTab === 'addStation' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Add New Station</h5>
            <div className="card" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <form onSubmit={handleAddStation}>
                  <div className="mb-3">
                    <label className="form-label">Station Code <small className="text-muted">(uppercase)</small></label>
                    <input type="text" className="form-control" placeholder="e.g. NDLS"
                      value={stationForm.stn_code} onChange={(e) => setStationForm({ ...stationForm, stn_code: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" placeholder="e.g. New Delhi"
                      value={stationForm.city} onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Station Name</label>
                    <input type="text" className="form-control" placeholder="e.g. New Delhi Railway Station"
                      value={stationForm.stn_name} onChange={(e) => setStationForm({ ...stationForm, stn_name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <input type="text" className="form-control" placeholder="e.g. Delhi"
                      value={stationForm.state} onChange={(e) => setStationForm({ ...stationForm, state: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Add Station</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Coach Class */}
        {activeTab === 'addCoachClass' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Add Coach Class</h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Coach classes are the static catalog (e.g. 1A, 2A, SL). After adding a class, assign it to a train run using "Train Composition".
            </p>
            <div className="card" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <form onSubmit={handleAddCoachClass}>
                  <div className="mb-3">
                    <label className="form-label">Class Code <small className="text-muted">(e.g. 1A, 2A, SL)</small></label>
                    <input type="text" className="form-control" placeholder="e.g. 3A"
                      value={coachClassForm.class_code} onChange={(e) => setCoachClassForm({ ...coachClassForm, class_code: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Class Name</label>
                    <input type="text" className="form-control" placeholder="e.g. AC 3-Tier"
                      value={coachClassForm.class_name} onChange={(e) => setCoachClassForm({ ...coachClassForm, class_name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total Seats per Coach</label>
                    <input type="number" className="form-control" min="1"
                      value={coachClassForm.total_seats} onChange={(e) => setCoachClassForm({ ...coachClassForm, total_seats: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Base Fare Multiplier <small className="text-muted">(₹ per km)</small></label>
                    <input type="number" className="form-control" step="0.01" min="0.01"
                      value={coachClassForm.base_fare_multiplier} onChange={(e) => setCoachClassForm({ ...coachClassForm, base_fare_multiplier: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Add Coach Class</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Train Composition */}
        {activeTab === 'addComposition' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Add Train Composition</h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Assign a coach (with a class) to a specific train on a specific run date. This creates the seat inventory for that day.
            </p>
            <div className="card" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <form onSubmit={handleAddComposition}>
                  <div className="mb-3">
                    <label className="form-label">Train Number</label>
                    <input type="text" className="form-control" placeholder="e.g. 12302"
                      value={compositionForm.train_no} onChange={(e) => setCompositionForm({ ...compositionForm, train_no: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Run Date</label>
                    <input type="date" className="form-control"
                      value={compositionForm.run_date} onChange={(e) => setCompositionForm({ ...compositionForm, run_date: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Coach Label <small className="text-muted">(e.g. B1, H1)</small></label>
                    <input type="text" className="form-control" placeholder="e.g. B1"
                      value={compositionForm.coach_label} onChange={(e) => setCompositionForm({ ...compositionForm, coach_label: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Class Code</label>
                    <select className="form-select" value={compositionForm.class_code}
                      onChange={(e) => setCompositionForm({ ...compositionForm, class_code: e.target.value })} required>
                      <option value="">Select Class</option>
                      {coachClasses.map(cc => (
                        <option key={cc.CLASS_CODE} value={cc.CLASS_CODE}>
                          {cc.CLASS_CODE} — {cc.CLASS_NAME}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Add Composition</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Route */}
        {activeTab === 'addRoute' && (
          <div>
            <h5 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>Add Route Stop</h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Times are in <strong>minutes since midnight</strong> (0–1439). Example: 08:05 = 485, 16:50 = 1010.
            </p>
            <div className="card" style={{ maxWidth: '500px' }}>
              <div className="card-body">
                <form onSubmit={handleAddRoute}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Train Number</label>
                      <input type="text" className="form-control" placeholder="e.g. 12302"
                        value={routeForm.train_no} onChange={(e) => setRouteForm({ ...routeForm, train_no: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Station Code</label>
                      <input type="text" className="form-control" placeholder="e.g. NDLS"
                        value={routeForm.stn_code} onChange={(e) => setRouteForm({ ...routeForm, stn_code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Arrival Time (mins)</label>
                      <input type="number" className="form-control" placeholder="e.g. 485 (leave blank for origin)"
                        min="0" max="1439"
                        value={routeForm.arrival_time} onChange={(e) => setRouteForm({ ...routeForm, arrival_time: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Departure Time (mins)</label>
                      <input type="number" className="form-control" placeholder="e.g. 1010 (leave blank for terminus)"
                        min="0" max="1439"
                        value={routeForm.depart_time} onChange={(e) => setRouteForm({ ...routeForm, depart_time: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Sequence Number</label>
                      <input type="number" className="form-control" min="1"
                        value={routeForm.sequence_num} onChange={(e) => setRouteForm({ ...routeForm, sequence_num: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Distance from Source (km)</label>
                      <input type="number" className="form-control" min="0"
                        value={routeForm.distance_from_source} onChange={(e) => setRouteForm({ ...routeForm, distance_from_source: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary w-100">Add Route Stop</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
