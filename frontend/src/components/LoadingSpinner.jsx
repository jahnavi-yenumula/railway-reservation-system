// Reusable Loading Spinner
import React from 'react'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay flex-column gap-3">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">{message}</p>
    </div>
  )
}

export default LoadingSpinner
