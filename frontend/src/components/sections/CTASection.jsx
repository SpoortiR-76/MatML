import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard
            className="p-12 text-center relative overflow-hidden"
            style={{ border: '1px solid rgba(16,185,129,0.18)' }}
          >
            {/* Glow behind */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
              >
                Ready to predict?
              </h2>
              <p
                className="text-lg mb-8 max-w-xl mx-auto"
                style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
              >
                Enter your material composition and get instant ML predictions — no setup, no lab required.
              </p>
              <Link
                to="/predict"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all"
                style={{
                  background: '#10b981',
                  color: '#0a0a0a',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 0 40px rgba(16,185,129,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669'
                  e.currentTarget.style.boxShadow = '0 0 60px rgba(16,185,129,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.3)'
                }}
              >
                Open Predictor →
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
