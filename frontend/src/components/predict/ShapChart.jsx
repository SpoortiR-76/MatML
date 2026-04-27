import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

/**
 * ShapChart — horizontal bar chart for SHAP feature contributions
 * @param {object} props
 * @param {Record<string, number>} props.shapValues - {featureName: shapValue}
 */
export default function ShapChart({ shapValues, title = 'Feature Contributions (SHAP)' }) {
  if (!shapValues || Object.keys(shapValues).length === 0) return null

  const data = Object.entries(shapValues)
    .map(([name, value]) => ({ name, value, abs: Math.abs(value) }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 8)

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: 'rgba(15,15,15,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f9fafb',
        }}
      >
        <div style={{ color: '#9ca3af', marginBottom: 2 }}>{d.name}</div>
        <div style={{ color: d.value >= 0 ? '#10b981' : '#f87171', fontWeight: 600 }}>
          {d.value >= 0 ? '+' : ''}{d.value.toFixed(4)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold" style={{ color: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
          {title}
        </h4>
        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#10b981' }} />
            <span style={{ color: '#9ca3af' }}>Positive</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#f87171' }} />
            <span style={{ color: '#9ca3af' }}>Negative</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? '#10b981' : '#f87171'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
