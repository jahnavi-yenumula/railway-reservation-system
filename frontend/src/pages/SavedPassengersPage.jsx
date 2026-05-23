// Saved Passengers Page - manage master_passengers
import React, { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import { toast } from 'react-toastify'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyForm = { name: '', age: '', gender: 'Male', preferred_berth: 'No Preference' }

const SavedPassengersPage = () => {
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPassengers()
  }, [])

  const fetchPassengers = async () => {
    try {
      const res = await userAPI.getSavedPassengers()
      setPassengers(res.data.passengers || [])
    } catch (err) {
      toast.error('Error fetching saved passengers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await userAPI.updatePassenger(editingId, form)
        toast.success('Passenger updated')
      } else {
        await userAPI.addPassenger(form)
        toast.success('Passenger saved')
      }
      setForm(emptyForm)
      setShowForm(false)
      setEditingId(null)
      fetchPassengers()
    } catch (err) {
      toast.error('Error saving passenger')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p) => {
    setForm({
      name: p.NAME,
      age: p.AGE,
      gender: p.GENDER,
      preferred_berth: p.PREFERRED_BERTH || 'No Preference',
    })
    setEditingId(p.MSTR_PASS_ID)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved passenger?')) return
    try {
      await userAPI.deletePassenger(id)
      toast.success('Passenger deleted')
      fetchPassengers()
    } catch (err) {
      toast.error('Error deleting passenger')
    }
  }

  if (loading) return <div className="container py-5"><LoadingSpinner /></div>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: '#0a2d6e' }}>
          <i className="bi bi-people me-2"></i>Saved Passengers
        </h4>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}
        >
          <i className="bi bi-plus me-1"></i>Add Passenger
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
            {editingId ? 'Edit Passenger' : 'Add New Passenger'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Preferred Berth</label>
                  <select
                    className="form-select"
                    value={form.preferred_berth}
                    onChange={(e) => setForm({ ...form, preferred_berth: e.target.value })}
                  >
                    {['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update' : 'Save Passenger'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Passengers List */}
      {passengers.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No saved passengers</h5>
          <p className="text-muted">Save passenger profiles for quick booking</p>
        </div>
      ) : (
        <div className="row g-3">
          {passengers.map(p => (
            <div key={p.MSTR_PASS_ID} className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                        style={{ width: '40px', height: '40px', backgroundColor: '#0a2d6e', color: 'white', fontWeight: 'bold' }}
                      >
                        {p.NAME[0].toUpperCase()}
                      </div>
                      <div className="fw-bold">{p.NAME}</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {p.AGE} yrs • {p.GENDER}
                      </div>
                      {p.PREFERRED_BERTH && (
                        <span className="badge bg-light text-dark border mt-1" style={{ fontSize: '0.7rem' }}>
                          {p.PREFERRED_BERTH}
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.MSTR_PASS_ID)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedPassengersPage
