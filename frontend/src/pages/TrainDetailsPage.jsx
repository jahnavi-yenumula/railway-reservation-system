// Train Details Page - full route, coaches, timings
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trainAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const TrainDetailsPage = () => {
  const { trainNo } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetails()
  }, [trainNo])

  const fetchDetails = async () => {
    try {
      const res = await trainAPI.getDetails(trainNo)
      if (res.data.success) {
        setData(res.data)
      }
    } catch (err) {
      toast.error('Error fetching train details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>
  if (!data) return <div className="container py-5 text-center"><h5>Train not found</h5></div>

  const { train, route, coaches } = data

  return (
    <div className="container py-4">
      {/* Back Button */}
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2"></i>Back
      </button>

      {/* Train Header */}
      <div className="card mb-4" style={{ borderLeft: '4px solid #0a2d6e' }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#0a2d6e' }}>{train.TRAIN_NAME}</h4>
              <span className="text-muted me-3">
                <i className="bi bi-hash me-1"></i>{train.TRAIN_NO}
              </span>
              <span className="badge bg-secondary">{train.TRAIN_TYPE}</span>
            </div>
            <button
              className="btn btn-orange"
              style={{ backgroundColor: '#e8600a', color: 'white' }}
              onClick={() => navigate(`/booking/${train.TRAIN_NO}`)}
            >
              <i className="bi bi-ticket me-2"></i>Book Now
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Route Timeline */}
        <div className="col-md-7">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
              <i className="bi bi-map me-2"></i>Route & Schedule
            </div>
            <div className="card-body">
              <div className="route-timeline">
                {route.map((stop, index) => (
                  <div key={stop.ROUTE_ID} className="route-stop">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold" style={{ color: '#0a2d6e' }}>
                          {stop.STN_NAME}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {stop.STN_CODE} • {stop.CITY}{stop.STATE ? `, ${stop.STATE}` : ''}
                        </div>
                        {stop.DISTANCE_FROM_SOURCE > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                            {stop.DISTANCE_FROM_SOURCE} km from source
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        {stop.ARRIVAL_TIME && (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span className="text-muted me-1">Arr:</span>
                            <strong>{stop.ARRIVAL_TIME.slice(0, 5)}</strong>
                          </div>
                        )}
                        {stop.DEPART_TIME && (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span className="text-muted me-1">Dep:</span>
                            <strong>{stop.DEPART_TIME.slice(0, 5)}</strong>
                          </div>
                        )}
                        {index === 0 && (
                          <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Origin</span>
                        )}
                        {index === route.length - 1 && (
                          <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>Destination</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coaches */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header" style={{ backgroundColor: '#0a2d6e', color: 'white' }}>
              <i className="bi bi-layout-three-columns me-2"></i>Coach Information
            </div>
            <div className="card-body">
              {coaches.length === 0 ? (
                <div className="text-muted">No coach class info available.</div>
              ) : coaches.map(coach => (
                <div key={coach.CLASS_CODE} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <div>
                    <span className="fw-bold me-2">{coach.CLASS_CODE}</span>
                    <span className="badge bg-light text-dark border">{coach.CLASS_NAME}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-person me-1"></i>{coach.TOTAL_SEATS} seats
                    <span className="ms-2 text-success" style={{ fontSize: '0.75rem' }}>
                      ₹{coach.BASE_FARE_MULTIPLIER}/km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Quick Info</h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Stops</span>
                <strong>{route.length}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Distance</span>
                <strong>{route[route.length - 1]?.DISTANCE_FROM_SOURCE || 0} km</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Coaches</span>
                <strong>{coaches.length}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Seats</span>
                <strong>{coaches.reduce((s, c) => s + (c.TOTAL_SEATS || 0), 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainDetailsPage
