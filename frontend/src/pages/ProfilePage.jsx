// Profile Page - view and update user profile
import React, { useState, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', mobile: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile()
      setProfile(res.data.user)
      setForm({
        first_name: res.data.user.FIRST_NAME,
        last_name: res.data.user.LAST_NAME,
        mobile: res.data.user.MOBILE,
      })
    } catch (err) {
      toast.error('Error fetching profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userAPI.updateProfile(form)
      toast.success('Profile updated successfully')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      toast.error('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4" style={{ color: '#0a2d6e' }}>
        <i className="bi bi-person-circle me-2"></i>My Profile
      </h4>

      <div className="row g-4">
        <div className="col-md-4">
          {/* Profile Card */}
          <div className="card text-center p-4">
            <div
              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ width: '80px', height: '80px', backgroundColor: '#0a2d6e', color: 'white', fontSize: '2rem' }}
            >
              {profile?.FIRST_NAME?.[0]?.toUpperCase()}
            </div>
            <h5 className="fw-bold">{profile?.FIRST_NAME} {profile?.LAST_NAME}</h5>
            <p className="text-muted mb-2">{profile?.EMAIL}</p>
            <span className={`badge ${profile?.ROLE === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
              {profile?.ROLE}
            </span>
            <div className="mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
              Member since {new Date(profile?.CREATED_AT).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
              <span className="fw-bold">Personal Information</span>
              {!editing && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="row g-3">
                  {[
                    { label: 'First Name', value: profile?.FIRST_NAME },
                    { label: 'Last Name', value: profile?.LAST_NAME },
                    { label: 'Email', value: profile?.EMAIL },
                    { label: 'Mobile', value: profile?.MOBILE },
                    { label: 'Date of Birth', value: profile?.DOB },
                    { label: 'Gender', value: profile?.GENDER },
                  ].map(({ label, value }) => (
                    <div key={label} className="col-md-6">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{label}</div>
                      <div className="fw-500">{value || '-'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
