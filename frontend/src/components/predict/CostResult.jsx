import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import ResultCard from '../ui/ResultCard'

function fmt(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toFixed(0)}`
}

const COLORS = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#fbbf24','#f87171','#818cf8','#e879f9','#67e8f9','#fdba74']

export default function CostResults({ data }) {
  const chartData = (data.breakdown || [])
    .sort((a, b) => b.total_cost_inr - a.total_cost_inr)

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{
        background: 'rgba(15,15,15,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'DM Sans',
        color: '#f9fafb',
      }}>
        <div style={{ color: '#9ca3af', marginBottom: 2 }}>{d.component}</div>
        <div style={{ color: '#10b981', fontWeight: 600 }}>{fmt(d.total_cost_inr)}</div>
        <div style={{ color: '#6b7280' }}>{d.quantity_kg?.toFixed(1)} kg · ₹{d.unit_cost_inr_per_kg}/kg</div>
        <div style={{ color: '#9ca3af' }}>{(d.cost_fraction * 100).toFixed(1)}% of total</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ResultCard label="Total Cost" value={fmt(data.total_cost_inr)} accent="#10b981" />
        <ResultCard label="Cost / m³"  value={fmt(data.cost_per_m3_inr)} accent="#34d399" />
        <ResultCard label="Volume"     value={`${data.volume_m3} m³`} accent="#6ee7b7" />
      </div>

      {/* Cost breakdown table */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>
            Component Breakdown
          </p>
          <div className="space-y-2 mb-4">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs" style={{ color: '#d1d5db', fontFamily: 'DM Sans' }}>{item.component}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold" style={{ color: '#f9fafb', fontFamily: 'JetBrains Mono' }}>{fmt(item.total_cost_inr)}</span>
                  <span className="text-xs ml-2" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>({(item.cost_fraction * 100).toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={Math.max(chartData.length * 36 + 20, 120)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <XAxis
                type="number"
                tickFormatter={(v) => fmt(v)}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="component"
                width={130}
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="total_cost_inr" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cost notes */}
      {data.cost_notes?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Cost Insights</p>
          {data.cost_notes.map((note, i) => (
            <div key={i} className="rounded-lg px-3 py-2 text-xs" style={{
              background: 'rgba(16,185,129,0.06)',
              borderLeft: '3px solid #10b981',
              color: '#d1d5db',
              fontFamily: 'DM Sans',
              lineHeight: '1.5',
            }}>
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
