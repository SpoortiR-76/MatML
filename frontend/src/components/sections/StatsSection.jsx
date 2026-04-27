import { motion } from 'framer-motion'

const stats = [
  { value: '1,030+', label: 'Training Samples', sub: 'Concrete dataset (UCI)' },
  { value: '3', label: 'ML Modules', sub: 'Concrete · Steel · Materials' },
  { value: '6+', label: 'Models Trained', sub: 'RF, XGB, Linear baselines' },
  { value: 'SHAP', label: 'Explainability', sub: 'Feature importance on every result' },
]

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center justify-center py-10 px-6 text-center"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <span
                className="text-4xl font-bold mb-1"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  color: '#10b981',
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-sm font-semibold mb-1"
                style={{ color: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}
              >
                {stat.label}
              </span>
              <span
                className="text-xs"
                style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}
              >
                {stat.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
