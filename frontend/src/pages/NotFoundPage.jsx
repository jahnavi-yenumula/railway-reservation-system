// 404 Not Found Page
import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="container py-5 text-center">
      <i className="bi bi-train-front" style={{ fontSize: '5rem', color: '#0a2d6e', opacity: 0.3 }}></i>
      <h1 className="display-1 fw-bold" style={{ color: '#0a2d6e' }}>404</h1>
      <h4 className="text-muted mb-3">Page Not Found</h4>
      <p className="text-muted mb-4">
        Looks like this train has left the station. The page you're looking for doesn't exist.
      </p>
      <button className="btn btn-primary px-4" onClick={() => navigate('/')}>
        <i className="bi bi-house me-2"></i>Back to Home
      </button>
    </div>
  )
}

export default NotFoundPage
