// Signup Page
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'

const SignupPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...submitData } = form
      const res = await authAPI.signup(submitData)
      if (res.data.success) {
        toast.success('Account created! Please login.')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <i className="bi bi-person-plus-fill fs-1" style={{ color: '#0a2d6e' }}></i>
              <h4 className="fw-bold mt-2" style={{ color: '#0a2d6e' }}>Create Your Account</h4>
              <p className="text-muted">Join RailBook and start booking tickets</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* First Name */}
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="mobile"
                    placeholder="10-digit mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Gender */}
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="col-md-6">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Submit */}
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-bold"
                    style={{ backgroundColor: '#0a2d6e', color: 'white' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-check me-2"></i>Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <hr />
            <p className="text-center mb-0">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#e8600a', fontWeight: '600' }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
