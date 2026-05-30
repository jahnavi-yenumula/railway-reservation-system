// Ticket Page - IRCTC-style ticket display
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const TicketPage = () => {
  const { pnr } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTicket()
  }, [pnr])

  const fetchTicket = async () => {
    try {
      const res = await bookingAPI.getByPNR(pnr)
      if (res.data.success) {
        setData(res.data)
      }
    } catch (err) {
      toast.error('Error fetching ticket')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>
  if (!data) return <div className="container py-5 text-center"><h5>Ticket not found</h5></div>

  const { booking, tickets, payment } = data

  const getStatusBadge = (status) => {
    if (status === 'CNF') return <span className="badge bg-success">CONFIRMED</span>
    if (status === 'WL') return <span className="badge bg-warning text-dark">WAITLIST</span>
    if (status === 'CAN') return <span className="badge bg-danger">CANCELLED</span>
    return <span className="badge bg-secondary">{status}</span>
  }

  return (
    <div className="container py-4">
      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4 no-print">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/my-bookings')}>
          <i className="bi bi-arrow-left me-2"></i>My Bookings
        </button>
        <button className="btn btn-primary ms-auto" onClick={handlePrint}>
          <i className="bi bi-printer me-2"></i>Print Ticket
        </button>
      </div>

      {/* Ticket */}
      <div className="ticket-container mx-auto" style={{ maxWidth: '750px' }}>
        {/* Ticket Header */}
        <div className="ticket-header d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-train-front-fill fs-4" style={{ color: '#e8600a' }}></i>
              <span className="fw-bold fs-5">RailBook</span>
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>E-Ticket / Reservation Slip</div>
          </div>
          <div className="text-end">
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>PNR Number</div>
            <div className="ticket-pnr">{booking.PNR_10}</div>
          </div>
        </div>

        {/* Train Info */}
        <div className="p-4 border-bottom">
          <div className="row">
            <div className="col-md-6">
              <div className="fw-bold fs-5" style={{ color: '#0a2d6e' }}>{booking.TRAIN_NAME}</div>
              <div className="text-muted">Train #{booking.TRAIN_NO} • {booking.TRAIN_TYPE}</div>
            </div>
            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <div className="fw-bold">
                {new Date(booking.JOURNEY_DATE).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>Journey Date</div>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="p-4 border-bottom">
          <div className="row align-items-center">
            <div className="col-4 text-center">
              <div className="fw-bold fs-4" style={{ color: '#0a2d6e' }}>
                {booking.DEPARTURE_TIME?.slice(0, 5) || '--:--'}
              </div>
              <div className="fw-bold">{booking.FROM_CODE}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{booking.FROM_STATION}</div>
            </div>
            <div className="col-4 text-center">
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-train-front" style={{ color: '#0a2d6e', fontSize: '1.5rem' }}></i>
              </div>
            </div>
            <div className="col-4 text-center">
              <div className="fw-bold fs-4" style={{ color: '#0a2d6e' }}>
                {booking.ARRIVAL_TIME?.slice(0, 5) || '--:--'}
              </div>
              <div className="fw-bold">{booking.TO_CODE}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{booking.TO_STATION}</div>
            </div>
          </div>
        </div>

        {/* Passenger Table */}
        <div className="p-4 border-bottom">
          <h6 className="fw-bold mb-3">Passenger Details</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead style={{ backgroundColor: '#f0f4ff' }}>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Coach</th>
                  <th>Seat</th>
                  <th>Class</th>
                  <th>Berth</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => (
                  <tr key={t.TICKET_ID}>
                    <td>{i + 1}</td>
                    <td className="fw-500">{t.PASSENGER_NAME}</td>
                    <td>{t.PASSENGER_AGE}</td>
                    <td>{t.COACH_LABEL}</td>
                    <td>{t.SEAT_NUM || (t.STATUS === 'WL' ? `WL/${t.WL_NUMBER}` : '-')}</td>
                    <td>{t.CLASS_CODE} — {t.CLASS_NAME}</td>
                    <td>{t.ALLOCATED_BERTH || '-'}</td>
                    <td>{getStatusBadge(t.STATUS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment & Booking Info */}
        <div className="p-4">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-2">
                <span className="text-muted me-2">Booking Status:</span>
                <span className={`badge ${booking.BOOKING_STATUS === 'Booked' ? 'bg-success' : booking.BOOKING_STATUS === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {booking.BOOKING_STATUS}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-muted me-2">Booked On:</span>
                <strong>{booking.BOOKED_ON}</strong>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              {payment && (
                <>
                  <div className="mb-2">
                    <span className="text-muted me-2">Payment:</span>
                    <span className="badge bg-success">{payment.PAYMENT_STATUS}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted me-2">Method:</span>
                    <strong>{payment.PAYMENT_METHOD}</strong>
                  </div>
                </>
              )}
              <div>
                <span className="text-muted me-2">Total Fare:</span>
                <strong className="fs-5" style={{ color: '#e8600a' }}>₹{booking.TOTAL_FARE}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '0 0 10px 10px', fontSize: '0.75rem', color: '#6c757d' }}>
          This is a computer-generated ticket. Please carry a valid photo ID during travel.
        </div>
      </div>
    </div>
  )
}

export default TicketPage
