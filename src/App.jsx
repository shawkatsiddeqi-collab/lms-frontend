import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-orb w-96 h-96 bg-indigo-400/20 top-0 -left-48" />
        <div className="gradient-orb w-96 h-96 bg-purple-400/20 top-1/4 -right-48 animation-delay-1000" />
        <div className="gradient-orb w-72 h-72 bg-pink-400/10 bottom-0 left-1/4 animation-delay-2000" />
      </div>
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <AppRoutes key={location.pathname} />
      </AnimatePresence>
    </div>
  )
}

export default App