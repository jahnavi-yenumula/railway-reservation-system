// Login Page
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      if (res.data.success) {
        login(res.data.user, res.data.token)
        toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
        // Redirect admin to admin panel, others to home
        navigate(res.data.user.role === 'Admin' ? '/admin' : '/')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <i className="bi bi-train-front-fill fs-1" style={{ color: '#0a2d6e' }}></i>
              <h4 className="fw-bold mt-2" style={{ color: '#0a2d6e' }}>Login to RailBook</h4>
              <p className="text-muted">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-500">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label fw-500">Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn w-100 py-2 fw-bold"
                style={{ backgroundColor: '#0a2d6e', color: 'white' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </>
                )}
              </button>
            </form>

            <hr />
            <p className="text-center mb-0">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#e8600a', fontWeight: '600' }}>
                Sign Up
              </Link>
            </p>

            {/* Demo credentials hint */}
            <div className="alert alert-info mt-3 mb-0" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-info-circle me-1"></i>
              <strong>Demo:</strong> traveler@example.com / (set your own password via signup)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
