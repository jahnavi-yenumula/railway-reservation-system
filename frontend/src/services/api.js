// Axios API Service - all backend calls go through here
import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('railToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors globally (token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('railToken')
      localStorage.removeItem('railUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== AUTH APIs =====
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
}

// ===== TRAIN APIs =====
export const trainAPI = {
  search: (from, to, date) => API.get(`/trains/search?from=${from}&to=${to}&date=${date}`),
  getDetails: (trainNo) => API.get(`/trains/${trainNo}`),
  getAll: () => API.get('/trains'),
  getStations: () => API.get('/trains/stations'),
}

// ===== BOOKING APIs =====
export const bookingAPI = {
  create: (data) => API.post('/bookings/create', data),
  getMyBookings: () => API.get('/bookings/my'),
  getByPNR: (pnr) => API.get(`/bookings/${pnr}`),
  cancel: (pnr) => API.put(`/bookings/cancel/${pnr}`),
}

// ===== PAYMENT APIs =====
export const paymentAPI = {
  pay: (data) => API.post('/payments/pay', data),
  getDetails: (pnr) => API.get(`/payments/${pnr}`),
}

// ===== USER APIs =====
export const userAPI = {
  getSavedPassengers: () => API.get('/users/passengers'),
  addPassenger: (data) => API.post('/users/passengers', data),
  updatePassenger: (id, data) => API.put(`/users/passengers/${id}`, data),
  deletePassenger: (id) => API.delete(`/users/passengers/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
}

// ===== ADMIN APIs =====
export const adminAPI = {
  addTrain: (data) => API.post('/admin/train', data),
  addStation: (data) => API.post('/admin/station', data),
  addRoute: (data) => API.post('/admin/route', data),
  addCoach: (data) => API.post('/admin/coach', data),
  getAllBookings: () => API.get('/admin/bookings'),
  getAllUsers: () => API.get('/admin/users'),
  getStats: () => API.get('/admin/stats'),
}

export default API
