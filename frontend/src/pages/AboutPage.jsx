import { motion } from 'framer-motion'
import GlassCard from '../components/ui/GlassCard'
import ModelComparisonTable from '../components/predict/ModelComparisonTable'

const techStack = [
  { label: 'React 18', color: '#61dafb' },
  { label: 'Vite', color: '#a78bfa' },
  { label: 'Tailwind CSS', color: '#38bdf8' },
  { label: 'Framer Motion', color: '#f472b6' },
  { label: 'Zustand', color: '#fb923c' },
  { label: 'FastAPI', color: '#10b981' },
  { label: 'scikit-learn', color: '#f59e0b' },
  { label: 'XGBoost', color: '#ef4444' },
  { label: 'SHAP', color: '#a3e635' },
  { label: 'Recharts', color: '#818cf8' },
]

const datasets = [
  {
    name: 'Concrete Compressive Strength',
    source: 'UCI Machine Learning Repository',
    url: 'https://archive.ics.uci.edu/dataset/165/concrete+compressive+strength',
    desc: '1,030 concrete mix samples with 8 input features and 1 regression target.',
  },
  {
    name: 'Steel Alloy Strength',
    source: 'Materials Project / Custom CSV',
    url: null,
    desc: 'Steel alloy composition data with yield strength, tensile strength, and elongation targets.',
  },
  {
    name: 'Engineering Materials',
    source: 'Materials Science Textbook Database',
    url: null,
    desc: 'General material properties (E, G, μ, ρ) with ultimate/yield strength and recommended use targets.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <GlassCard className="p-8 md:p-10 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 0% 0%, rgba(16,185,129,0.07) 0%, transparent 60%)',
              }}
            />
            <div className="relative z-10">
              <span
                className="text-xs font-medium tracking-widest uppercase mb-4 block"
                style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}
              >
                About MatML
              </span>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
              >
                Materials Science,<br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #6ee7b7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  powered by ML
                </span>
              </h1>
              <p
                className="text-base leading-relaxed max-w-2xl"
                style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
              >
                MatML is a full-stack machine learning application that predicts mechanical properties of
                engineering materials from their composition — eliminating the need for expensive and time-consuming lab tests.
                Engineers and researchers can enter material parameters and receive instant predictions with SHAP-based explainability.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* ML Modules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-12"
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
          >
            ML Modules
          </h2>
          <ModelComparisonTable />
        </motion.section>

        {/* Datasets */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-12"
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
          >
            Datasets
          </h2>
          <div className="flex flex-col gap-4">
            {datasets.map((ds) => (
              <GlassCard key={ds.name} className="p-6 glass-hover">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <h3
                    className="font-semibold"
                    style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
                  >
                    {ds.name}
                  </h3>
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#9ca3af',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {ds.source}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                  {ds.desc}
                </p>
                {ds.url && (
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs mt-3 transition-colors"
                    style={{ color: '#10b981', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#34d399' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#10b981' }}
                  >
                    View dataset source ↗
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
          >
            Tech Stack
          </h2>
          <GlassCard className="p-6">
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech.label}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    background: `${tech.color}14`,
                    border: `1px solid ${tech.color}30`,
                    color: tech.color,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </main>
  )
}
