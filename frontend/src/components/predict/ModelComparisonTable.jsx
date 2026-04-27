import GlassCard from '../ui/GlassCard'

const modules = [
  {
    name: 'Module 1 — Concrete',
    dataset: 'UCI Concrete Compressive Strength',
    rows: '~1,030',
    task: 'Single-output regression',
    models: ['LinearRegression (baseline)', 'RandomForestRegressor ✓', 'XGBRegressor'],
    metric: 'R² ≈ 0.92 | MAE ≈ 4.2 MPa',
    accent: '#10b981',
  },
  {
    name: 'Module 2 — Steel',
    dataset: 'Steel Alloy Composition',
    rows: 'Variable',
    task: 'Multi-output regression (3 targets)',
    models: ['MultiOutput LinearRegression (baseline)', 'MultiOutput XGBRegressor ✓'],
    metric: 'Avg R² across yield / tensile / elongation',
    accent: '#34d399',
  },
  {
    name: 'Module 3 — Materials',
    dataset: 'Engineering Materials Database',
    rows: 'Variable',
    task: 'Multi-output regression + binary classification',
    models: ['MultiOutput RF → Su, Sy prediction', 'RandomForestClassifier → Use flag'],
    metric: 'R² (regression) + Accuracy (classification)',
    accent: '#6ee7b7',
  },
]

export default function ModelComparisonTable() {
  return (
    <div className="flex flex-col gap-6">
      {modules.map((mod) => (
        <GlassCard key={mod.name} className="p-6 glass-hover">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3
                className="font-bold text-lg mb-1"
                style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
              >
                {mod.name}
              </h3>
              <p className="text-sm" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                {mod.dataset} · {mod.rows} rows · {mod.task}
              </p>
            </div>
            <span
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: `${mod.accent}18`,
                border: `1px solid ${mod.accent}30`,
                color: mod.accent,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {mod.metric}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mod.models.map((m) => (
              <span
                key={m}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  background: m.includes('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                  border: m.includes('✓')
                    ? '1px solid rgba(16,185,129,0.25)'
                    : '1px solid rgba(255,255,255,0.07)',
                  color: m.includes('✓') ? '#10b981' : '#9ca3af',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
