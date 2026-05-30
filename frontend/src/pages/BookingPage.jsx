// Booking Page - Passenger details form + coach selection
// Updated for schema v3.0:
//   - coaches come from train_composition (per run_date), not a static coaches table
//   - booking sends compositionId, sourceStnCode, destinationStnCode
//   - tickets require passenger_gender
//   - fare calculated from distance * base_fare_multiplier
import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { trainAPI, userAPI, bookingAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const QUOTA_OPTIONS = [
  { value: 'GN', label: 'General (GN)' },
  { value: 'TQ', label: 'Tatkal (TQ)' },
  { value: 'LD', label: 'Ladies (LD)' },
  { value: 'DF', label: 'Defence (DF)' },
  { value: 'SR', label: 'Senior Citizen (SR)' },
]

const emptyPassenger = () => ({
  passenger_name: '',
  passenger_age: '',
  passenger_gender: 'Male',
})

const BookingPage = () => {
  const { trainNo } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Get train info and route info from navigation state
  const [trainData, setTrainData] = useState(location.state?.train || null)
  const [coaches, setCoaches] = useState([])           // train_composition rows for this date
  const [selectedComposition, setSelectedComposition] = useState('') // composition_id
  const [selectedCoachInfo, setSelectedCoachInfo] = useState(null)
  const [passengers, setPassengers] = useState([emptyPassenger()])
  const [savedPassengers, setSavedPassengers] = useState([])
  const [journeyDate, setJourneyDate] = useState(location.state?.searchDate || new Date().toISOString().split('T')[0])
  const [quota, setQuota] = useState('GN')
  const [loading, setLoading] = useState(false)
  const [fetchingTrain, setFetchingTrain] = useState(!trainData)  // true only when no state passed
  const initialMount = React.useRef(true)

  // Source and destination from search state
  const fromCode = location.state?.fromCode || ''
  const toCode = location.state?.toCode || ''

  // Distance in km between source and destination — from search state or fetched from route
  const [distanceKm, setDistanceKm] = useState(
    location.state?.train?.DISTANCE_KM || 0
  )

  useEffect(() => {
    if (!trainData) {
      fetchTrainDetails()
    } else {
      fetchCoachesForDate(journeyDate)
    }
    fetchSavedPassengers()
  }, [])

  // When journey date changes (not on first render), re-fetch coaches
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
      return
    }
    fetchCoachesForDate(journeyDate)
  }, [journeyDate])

  const fetchTrainDetails = async () => {
    try {
      const res = await trainAPI.getDetails(trainNo)
      if (res.data.success) {
        setTrainData(res.data.train)

        // Compute distance from route if fromCode/toCode are available
        if (fromCode && toCode && res.data.route) {
          const srcStop = res.data.route.find(r => r.STN_CODE === fromCode)
          const dstStop = res.data.route.find(r => r.STN_CODE === toCode)
          if (srcStop && dstStop) {
            setDistanceKm(dstStop.DISTANCE_FROM_SOURCE - srcStop.DISTANCE_FROM_SOURCE)
          } else {
            // Fall back to full route distance
            const route = res.data.route
            if (route.length > 1) {
              setDistanceKm(route[route.length - 1].DISTANCE_FROM_SOURCE || 0)
            }
          }
        }

        await fetchCoachesForDate(journeyDate)
      }
    } catch (err) {
      toast.error('Error loading train details')
    } finally {
      setFetchingTrain(false)
    }
  }

  const fetchCoachesForDate = async (date) => {
    try {
      const res = await trainAPI.getCoachesForDate(trainNo, date)
      if (res.data.success) {
        setCoaches(res.data.coaches || [])
        setSelectedComposition('')
        setSelectedCoachInfo(null)
      }
    } catch (err) {
      // Silently fail — message already shown if needed
    }
  }

  const fetchSavedPassengers = async () => {
    try {
      const res = await userAPI.getSavedPassengers()
      setSavedPassengers(res.data.passengers || [])
    } catch (err) {
      // Not logged in or no saved passengers — that's fine
    }
  }

  // Calculate fare based on distance and multiplier
  const calculateFare = () => {
    if (!selectedCoachInfo) return 0
    const multiplier = selectedCoachInfo.BASE_FARE_MULTIPLIER || 1
    const farePerPassenger = Math.round(distanceKm * multiplier)
    return farePerPassenger * passengers.length
  }

  // Fare per person for a given coach (shown on coach card before selection)
  const farePerPerson = (coach) => {
    const multiplier = coach.BASE_FARE_MULTIPLIER || 1
    return Math.round(distanceKm * multiplier)
  }

  const handleSelectCoach = (coach) => {
    setSelectedComposition(coach.COMPOSITION_ID)
    setSelectedCoachInfo(coach)
  }

  // Add a new passenger row
  const addPassenger = () => {
    if (passengers.length >= 6) {
      toast.warning('Maximum 6 passengers per booking')
      return
    }
    setPassengers([...passengers, emptyPassenger()])
  }

  // Remove a passenger row
  const removePassenger = (index) => {
    if (passengers.length === 1) return
    setPassengers(passengers.filter((_, i) => i !== index))
  }

  // Update a passenger field
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers]
    updated[index][field] = value
    setPassengers(updated)
  }

  // Fill from saved passenger
  const fillFromSaved = (index, savedId) => {
    const saved = savedPassengers.find(p => p.MSTR_PASS_ID == savedId)
    if (saved) {
      const updated = [...passengers]
      updated[index] = {
        passenger_name: saved.NAME,
        passenger_age: saved.AGE,
        passenger_gender: saved.GENDER,
      }
      setPassengers(updated)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedComposition) {
      toast.error('Please select a coach/class')
      return
    }

    if (!fromCode || !toCode) {
      toast.error('Source and destination station info is missing. Please search again.')
      return
    }

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.passenger_name || !p.passenger_age) {
        toast.error(`Please fill details for passenger ${i + 1}`)
        return
      }
      if (p.passenger_age < 1 || p.passenger_age > 125) {
        toast.error(`Invalid age for passenger ${i + 1}`)
        return
      }
    }

    setLoading(true)
    try {
      const totalFare = calculateFare()
      const res = await bookingAPI.create({
        trainNo,
        journeyDate,
        compositionId: parseInt(selectedComposition),
        sourceStnCode: fromCode,
        destinationStnCode: toCode,
        quota,
        passengers,
        totalFare,
      })

      if (res.data.success) {
        toast.success('Booking created! Proceed to payment.')
        navigate(`/payment/${res.data.pnr}`, {
          state: {
            pnr: res.data.pnr,
            totalFare,
            passengers,
            trainData,
            journeyDate,
          },
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingTrain) return <div className="container py-5"><LoadingSpinner /></div>

  const totalFare = calculateFare()

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
        <i className="bi bi-ticket-perforated me-2"></i>Book Ticket
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left: Passenger Details */}
          <div className="col-md-8">
            {/* Train Info Summary */}
            {trainData && (
              <div className="card mb-4 p-3" style={{ borderLeft: '4px solid #0a2d6e' }}>
                <div className="d-flex justify-content-between flex-wrap gap-2">
                  <div>
                    <div className="fw-bold" style={{ color: '#0a2d6e' }}>
                      {trainData.TRAIN_NAME || trainData.train_name}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      #{trainData.TRAIN_NO || trainData.train_no}
                    </div>
                    {fromCode && toCode && (
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {fromCode} <i className="bi bi-arrow-right mx-1"></i> {toCode}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label mb-1">Journey Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={journeyDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quota Selection */}
            <div className="card mb-4">
              <div className="card-header fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                <i className="bi bi-tag me-2"></i>Select Quota
              </div>
              <div className="card-body">
                <div className="d-flex gap-2 flex-wrap">
                  {QUOTA_OPTIONS.map(q => (
                    <button
                      key={q.value}
                      type="button"
                      className={`btn btn-sm ${quota === q.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setQuota(q.value)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coach Selection — from train_composition */}
            <div className="card mb-4">
              <div className="card-header fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                <i className="bi bi-layout-three-columns me-2"></i>Select Class
              </div>
              <div className="card-body">
                {coaches.length === 0 ? (
                  <div className="text-muted">
                    No coaches available for this date. Try a different date.
                  </div>
                ) : (
                  <div className="row g-2">
                    {coaches.map(coach => (
                      <div key={coach.COMPOSITION_ID} className="col-md-4">
                        <div
                          className={`border rounded p-3 ${selectedComposition == coach.COMPOSITION_ID ? 'border-primary bg-light' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSelectCoach(coach)}
                        >
                          <div className="fw-bold">{coach.COACH_LABEL}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {coach.CLASS_CODE} — {coach.CLASS_NAME}
                          </div>
                          <div style={{ fontSize: '0.75rem' }}>
                            {coach.AVAILABLE_SEATS > 0 ? (
                              <span className="text-success">{coach.AVAILABLE_SEATS} available</span>
                            ) : (
                              <span className="text-danger">Waitlist</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                            ₹{farePerPerson(coach)}/person
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Passenger Details */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
                <span className="fw-bold">
                  <i className="bi bi-people me-2"></i>Passenger Details
                </span>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPassenger}>
                  <i className="bi bi-plus me-1"></i>Add Passenger
                </button>
              </div>
              <div className="card-body">
                {passengers.map((p, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Passenger {index + 1}</strong>
                      <div className="d-flex gap-2 align-items-center">
                        {/* Fill from saved */}
                        {savedPassengers.length > 0 && (
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            onChange={(e) => fillFromSaved(index, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Saved Passengers</option>
                            {savedPassengers.map(sp => (
                              <option key={sp.MSTR_PASS_ID} value={sp.MSTR_PASS_ID}>
                                {sp.NAME}
                              </option>
                            ))}
                          </select>
                        )}
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removePassenger(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Full Name"
                          value={p.passenger_name}
                          onChange={(e) => updatePassenger(index, 'passenger_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Age"
                          value={p.passenger_age}
                          onChange={(e) => updatePassenger(index, 'passenger_age', e.target.value)}
                          min="1"
                          max="125"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-select"
                          value={p.passenger_gender}
                          onChange={(e) => updatePassenger(index, 'passenger_gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Fare Summary */}
          <div className="col-md-4">
            <div className="card sticky-top" style={{ top: '80px' }}>
              <div className="card-header fw-bold" style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
                <i className="bi bi-receipt me-2"></i>Fare Summary
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Passengers</span>
                  <strong>{passengers.length}</strong>
                </div>
                {selectedCoachInfo && (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Class</span>
                      <strong>{selectedCoachInfo.CLASS_CODE} — {selectedCoachInfo.CLASS_NAME}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Distance</span>
                      <strong>{distanceKm} km</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Rate</span>
                      <strong>₹{selectedCoachInfo.BASE_FARE_MULTIPLIER}/km</strong>
                    </div>
                  </>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Total Fare</span>
                  <strong className="fs-5" style={{ color: '#e8600a' }}>
                    ₹{totalFare}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-2 fw-bold"
                  style={{ backgroundColor: '#e8600a', color: 'white' }}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                  ) : (
                    <><i className="bi bi-arrow-right-circle me-2"></i>Proceed to Payment</>
                  )}
                </button>

                <div className="mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-shield-check me-1 text-success"></i>
                  Secure booking. Cancellation available before journey date.
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BookingPage
