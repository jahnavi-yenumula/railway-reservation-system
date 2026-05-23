// Search Results Page - shows trains matching the search
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { trainAPI } from '../services/api'
import TrainCard from '../components/TrainCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    if (from && to && date) {
      fetchTrains()
    }
  }, [from, to, date])

  const fetchTrains = async () => {
    setLoading(true)
    try {
      const res = await trainAPI.search(from, to, date)
      if (res.data.success) {
        setTrains(res.data.trains)
      }
    } catch (err) {
      toast.error('Error searching trains. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter by train type
  const filteredTrains = filterType === 'All'
    ? trains
    : trains.filter(t => t.TRAIN_TYPE === filterType)

  const trainTypes = ['All', ...new Set(trains.map(t => t.TRAIN_TYPE))]

  return (
    <div className="container py-4">
      {/* Search Summary */}
      <div className="card mb-4 p-3" style={{ borderLeft: '4px solid #0a2d6e' }}>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div>
            <span className="fw-bold fs-5" style={{ color: '#0a2d6e' }}>{from}</span>
            <i className="bi bi-arrow-right mx-2 text-muted"></i>
            <span className="fw-bold fs-5" style={{ color: '#0a2d6e' }}>{to}</span>
          </div>
          <span className="badge bg-light text-dark border">
            <i className="bi bi-calendar me-1"></i>
            {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary ms-auto"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-pencil me-1"></i>Modify Search
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {trainTypes.map(type => (
          <button
            key={type}
            className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Searching trains..." />
      ) : filteredTrains.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-train-front fs-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No trains found</h5>
          <p className="text-muted">Try a different route or date</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Search Again
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">
            <strong>{filteredTrains.length}</strong> train(s) found
          </p>
          {filteredTrains.map(train => (
            <TrainCard
              key={train.TRAIN_NO}
              train={train}
              searchDate={date}
              fromCode={from}
              toCode={to}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default SearchResultsPage
