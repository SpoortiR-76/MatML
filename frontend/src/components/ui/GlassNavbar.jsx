import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Predict', path: '/predict' },
]

export default function GlassNavbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <svg width="24" height="24" viewBox="0 0 32 32" className="transition-transform group-hover:scale-110">
            <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke="#10b981" strokeWidth="2" />
            <polygon points="16,9 23,13 23,19 16,23 9,19 9,13" fill="#10b981" opacity="0.35" />
          </svg>
          <span
            className="font-display font-bold text-lg tracking-tight"
            style={{ color: '#f9fafb', fontFamily: 'Syne, sans-serif' }}
          >
            Mat<span style={{ color: '#10b981' }}>ML</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium transition-colors"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                color: location.pathname === link.path ? '#10b981' : '#9ca3af',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f9fafb' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = location.pathname === link.path ? '#10b981' : '#9ca3af' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/predict"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: '#10b981',
              color: '#0a0a0a',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#059669' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981' }}
          >
            Try Now →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex flex-col justify-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-0.5 rounded-full transition-all"
              style={{
                background: '#9ca3af',
                width: i === 1 && menuOpen ? '60%' : '100%',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'scaleX(0)'
                  : 'none',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: location.pathname === link.path ? '#10b981' : '#9ca3af',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/predict"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-center"
                style={{ background: '#10b981', color: '#0a0a0a', fontFamily: 'DM Sans, sans-serif' }}
              >
                Try Now →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
