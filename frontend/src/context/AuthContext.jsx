// Auth Context - manages user login state across the app
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, restore user from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('railToken')
    const savedUser = localStorage.getItem('railUser')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // Login: save token and user to state + localStorage
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('railToken', jwtToken)
    localStorage.setItem('railUser', JSON.stringify(userData))
  }

  // Logout: clear everything
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('railToken')
    localStorage.removeItem('railUser')
  }

  const isAdmin = user?.role === 'Admin'
  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext)
