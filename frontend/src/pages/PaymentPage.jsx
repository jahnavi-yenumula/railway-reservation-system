// Payment Page - dummy payment form
import React, { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { paymentAPI } from '../services/api'
import { toast } from 'react-toastify'

const PaymentPage = () => {
  const { pnr } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { totalFare = 0, passengers = [], trainData, journeyDate } = location.state || {}

  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')

  const handlePayment = async (e) => {
    e.preventDefault()

    // Basic validation
    if (paymentMethod === 'UPI' && !upiId) {
      toast.error('Please enter UPI ID')
      return
    }
    if (paymentMethod === 'Card' && cardNumber.length < 16) {
      toast.error('Please enter valid card number')
      return
    }

    setLoading(true)
    try {
      const res = await paymentAPI.pay({
        pnr,
        paymentMethod,
        amount: totalFare,
      })

      if (res.data.success) {
        toast.success('Payment successful!')
        navigate(`/ticket/${pnr}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
        <i className="bi bi-credit-card me-2"></i>Complete Payment
      </h4>

      <div className="row g-4">
        {/* Payment Form */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-header fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
              Select Payment Method
            </div>
            <div className="card-body">
              <form onSubmit={handlePayment}>
                {/* Payment Method Tabs */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                  {['UPI', 'Card', 'Net Banking', 'Wallet'].map(method => (
                    <button
                      key={method}
                      type="button"
                      className={`btn btn-sm ${paymentMethod === method ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method === 'UPI' && <i className="bi bi-phone me-1"></i>}
                      {method === 'Card' && <i className="bi bi-credit-card me-1"></i>}
                      {method === 'Net Banking' && <i className="bi bi-bank me-1"></i>}
                      {method === 'Wallet' && <i className="bi bi-wallet me-1"></i>}
                      {method}
                    </button>
                  ))}
                </div>

                {/* UPI Form */}
                {paymentMethod === 'UPI' && (
                  <div className="mb-4">
                    <label className="form-label fw-500">UPI ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <div className="mt-2 d-flex gap-2 flex-wrap">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <span key={app} className="badge bg-light text-dark border" style={{ cursor: 'pointer' }}>
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Form */}
                {paymentMethod === 'Card' && (
                  <div className="mb-4">
                    <div className="mb-3">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label">Expiry Date</label>
                        <input type="text" className="form-control" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="col-6">
                        <label className="form-label">CVV</label>
                        <input type="password" className="form-control" placeholder="***" maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'Net Banking' && (
                  <div className="mb-4">
                    <label className="form-label">Select Bank</label>
                    <select className="form-select">
                      <option>SBI</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>PNB</option>
                    </select>
                  </div>
                )}

                {/* Wallet */}
                {paymentMethod === 'Wallet' && (
                  <div className="mb-4">
                    <label className="form-label">Select Wallet</label>
                    <select className="form-select">
                      <option>Paytm Wallet</option>
                      <option>Amazon Pay</option>
                      <option>Mobikwik</option>
                    </select>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="submit"
                  className="btn w-100 py-2 fw-bold"
                  style={{ backgroundColor: '#e8600a', color: 'white' }}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing Payment...</>
                  ) : (
                    <><i className="bi bi-lock me-2"></i>Pay ₹{totalFare} Securely</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header fw-bold" style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
              <i className="bi bi-receipt me-2"></i>Booking Summary
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>PNR Number</div>
                <div className="fw-bold fs-5" style={{ color: '#e8600a', letterSpacing: '2px' }}>{pnr}</div>
              </div>

              {trainData && (
                <div className="mb-3">
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Train</div>
                  <div className="fw-bold">{trainData.TRAIN_NAME || trainData.train_name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    #{trainData.TRAIN_NO || trainData.train_no}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Journey Date</div>
                <div className="fw-bold">{journeyDate}</div>
              </div>

              <div className="mb-3">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Passengers ({passengers.length})</div>
                {passengers.map((p, i) => (
                  <div key={i} style={{ fontSize: '0.85rem' }}>
                    {p.passenger_name}, {p.passenger_age} yrs
                  </div>
                ))}
              </div>

              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total Amount</span>
                <span className="fw-bold fs-5" style={{ color: '#e8600a' }}>₹{totalFare}</span>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="alert alert-success mt-3" style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-shield-check me-2"></i>
            This is a demo payment. No real money will be charged.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
