// My Bookings Page - shows all bookings for logged-in user
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const MyBookingsPage = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingPNR, setCancellingPNR] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMyBookings()
      setBookings(res.data.bookings || [])
    } catch (err) {
      toast.error('Error fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (pnr) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    setCancellingPNR(pnr)
    try {
      const res = await bookingAPI.cancel(pnr)
      if (res.data.success) {
        toast.success('Booking cancelled successfully')
        fetchBookings() // Refresh list
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancellingPNR(null)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      Confirmed: 'bg-success',
      Waitlisted: 'bg-warning text-dark',
      Cancelled: 'bg-danger',
      Pending: 'bg-secondary',
    }
    return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>
  }

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
        <i className="bi bi-ticket-perforated me-2"></i>My Bookings
      </h4>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-ticket fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No bookings yet</h5>
          <p className="text-muted">Start by searching for trains</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            Search Trains
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map(booking => (
            <div key={booking.PNR_10} className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    {/* PNR & Train */}
                    <div className="col-md-3">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>PNR</div>
                      <div className="fw-bold" style={{ color: '#e8600a', letterSpacing: '1px' }}>
                        {booking.PNR_10}
                      </div>
                      <div className="fw-bold" style={{ color: '#0a2d6e', fontSize: '0.9rem' }}>
                        {booking.TRAIN_NAME}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        #{booking.TRAIN_NO}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="text-center">
                          <div className="fw-bold">{booking.DEPARTURE_TIME?.slice(0, 5)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                            {booking.FROM_STATION?.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </div>
                        <i className="bi bi-arrow-right text-muted"></i>
                        <div className="text-center">
                          <div className="fw-bold">{booking.ARRIVAL_TIME?.slice(0, 5)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                            {booking.TO_STATION?.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Journey Date */}
                    <div className="col-md-2">
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Journey Date</div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                        {new Date(booking.JOURNEY_DATE).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {booking.PASSENGER_COUNT} passenger(s)
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-md-2">
                      <div className="mb-1">{getStatusBadge(booking.BOOKING_STATUS)}</div>
                      {booking.PAYMENT_STATUS && (
                        <span className={`badge ${booking.PAYMENT_STATUS === 'Success' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.7rem' }}>
                          {booking.PAYMENT_STATUS === 'Success' ? 'Paid' : 'Unpaid'}
                        </span>
                      )}
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        ₹{booking.TOTAL_FARE}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-md-2 d-flex flex-column gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/ticket/${booking.PNR_10}`)}
                      >
                        <i className="bi bi-eye me-1"></i>View Ticket
                      </button>
                      {booking.BOOKING_STATUS !== 'Cancelled' && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancel(booking.PNR_10)}
                          disabled={cancellingPNR === booking.PNR_10}
                        >
                          {cancellingPNR === booking.PNR_10 ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <><i className="bi bi-x-circle me-1"></i>Cancel</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookingsPage
