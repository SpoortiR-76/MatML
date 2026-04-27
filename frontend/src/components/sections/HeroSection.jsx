import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: '5%',
            left: '55%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: '40%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
            animation: 'float 14s ease-in-out infinite reverse',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            bottom: '10%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
            animation: 'float 18s ease-in-out infinite',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
          />
          <span className="text-xs font-medium" style={{ color: '#10b981', fontFamily: 'DM Sans, sans-serif' }}>
            ML-Powered Material Science
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Predict Material
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Properties
          </span>{' '}
          with ML
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
        >
          No lab tests needed. Input composition data and get instant predictions for
          compressive strength, yield strength, tensile properties — with full
          explainability via SHAP.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/predict"
            className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all"
            style={{
              background: '#10b981',
              color: '#0a0a0a',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 0 30px rgba(16,185,129,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.3)'
            }}
          >
            Try Now →
          </Link>
          <Link
            to="/about"
            className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f9fafb',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            See How It Works
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2"
        style={{ transform: 'translateX(-50%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <motion.div
            className="w-1 h-2 rounded-full"
            style={{ background: '#10b981' }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
