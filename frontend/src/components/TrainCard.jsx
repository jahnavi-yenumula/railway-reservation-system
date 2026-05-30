// Train Card - shown in search results
// Updated for schema v3.0: coaches are train_composition rows with CLASS_CODE/CLASS_NAME
import React from 'react'
import { useNavigate } from 'react-router-dom'

const TrainCard = ({ train, searchDate, fromCode, toCode }) => {
  const navigate = useNavigate()

  // Calculate total available seats across all compositions
  const totalAvailable = train.coaches?.reduce((sum, c) => sum + (c.AVAILABLE_SEATS || 0), 0) || 0

  const handleBook = () => {
    navigate(`/booking/${train.TRAIN_NO}`, {
      state: { train, searchDate, fromCode, toCode },
    })
  }

  const handleDetails = () => {
    navigate(`/train/${train.TRAIN_NO}`)
  }

  return (
    <div className="card train-card mb-3">
      <div className="card-body">
        <div className="row align-items-center">
          {/* Train Info */}
          <div className="col-md-3">
            <div className="train-number">{train.TRAIN_NO}</div>
            <div className="train-name">{train.TRAIN_NAME}</div>
            <span className="badge bg-secondary mt-1" style={{ fontSize: '0.7rem' }}>
              {train.TRAIN_TYPE}
            </span>
          </div>

          {/* Departure */}
          <div className="col-md-2 text-center">
            <div className="time-display">{train.DEPARTURE_TIME || '--:--'}</div>
            <div className="station-name">{train.FROM_CODE}</div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{train.FROM_CITY}</div>
          </div>

          {/* Duration Arrow */}
          <div className="col-md-2 text-center">
            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
              {train.DISTANCE_KM ? `${train.DISTANCE_KM} km` : ''}
            </div>
            <div className="d-flex align-items-center justify-content-center gap-1 my-1">
              <div style={{ height: '2px', width: '30px', backgroundColor: '#0a2d6e' }}></div>
              <i className="bi bi-train-front" style={{ color: '#0a2d6e' }}></i>
              <div style={{ height: '2px', width: '30px', backgroundColor: '#0a2d6e' }}></div>
            </div>
          </div>

          {/* Arrival */}
          <div className="col-md-2 text-center">
            <div className="time-display">{train.ARRIVAL_TIME || '--:--'}</div>
            <div className="station-name">{train.TO_CODE}</div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{train.TO_CITY}</div>
          </div>

          {/* Availability — show class codes from train_composition */}
          <div className="col-md-2 text-center">
            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              {totalAvailable > 0 ? (
                <span className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  {totalAvailable} Seats
                </span>
              ) : (
                <span className="text-danger">
                  <i className="bi bi-x-circle me-1"></i>
                  Waitlist
                </span>
              )}
            </div>
            {/* Show unique class codes */}
            <div className="mt-1">
              {[...new Set(train.coaches?.map(c => c.CLASS_CODE))].map((code) => (
                <span key={code} className="badge bg-light text-dark me-1" style={{ fontSize: '0.65rem' }}>
                  {code}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-md-1 d-flex flex-column gap-2">
            <button className="btn btn-sm btn-primary" onClick={handleBook}>
              Book
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleDetails}>
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainCard
