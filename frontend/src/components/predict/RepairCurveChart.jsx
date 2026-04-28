import { Component, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { predictEnhancedSteel } from '../../api/predictions'
import { usePredictionStore } from '../../store/predictionStore'

// Safe number helper — returns undefined (Recharts ignores it) if not finite
const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined)

// Error boundary to prevent the chart crash from taking down the whole page
class ChartErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, msg: '' } }
  static getDerivedStateFromError(err) { return { hasError: true, msg: err?.message || 'Chart error' } }
  render() {
    if (this.state.hasError)
      return (
        <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          ⚠ Chart could not render: {this.state.msg}
        </div>
      )
    return this.props.children
  }
}

function estimateElongation(baseElongation, lifespanIndex) {
  if (!Number.isFinite(baseElongation)) return 0
  return Math.max(0, baseElongation * (0.65 + 0.35 * lifespanIndex))
}

export default function RepairCurveChart({ initialResult }) {
  const form = usePredictionStore((s) => s.formData.enhanced_steel)
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)

  const reqKey = useMemo(
    () => JSON.stringify({
      c: form.c, mn: form.mn, si: form.si, cr: form.cr, ni: form.ni, mo: form.mo, v: form.v,
      n: form.n, nb: form.nb, co: form.co, w: form.w, al: form.al, ti: form.ti, application: form.application,
    }),
    [form]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const baseInput = {
          c: form.c, mn: form.mn, si: form.si, cr: form.cr, ni: form.ni, mo: form.mo, v: form.v,
          n: form.n, nb: form.nb, co: form.co, w: form.w, al: form.al, ti: form.ti, application: form.application,
        }
        const requests = Array.from({ length: 11 }, (_, repair_cycles) =>
          predictEnhancedSteel({ ...baseInput, repair_cycles })
        )
        const responses = await Promise.all(requests)
        if (cancelled) return

        const maxRepairs = responses[0]?.recommendation?.max_repair_cycles ?? 8
        const next = responses.map((r, idx) => {
          const life = safeNum(r?.degradation?.lifespan_index) ?? 0
          return {
            cycle: idx,
            su: safeNum(r?.repair?.su_post_mpa ?? r?.strength?.su_mpa) ?? 0,
            sy: safeNum(r?.repair?.sy_post_mpa ?? r?.strength?.sy_mpa) ?? 0,
            lifespan_index: life,
            lifespan_safe: idx <= maxRepairs ? life : null,
            lifespan_risk: idx > maxRepairs ? life : null,
            elongation: safeNum(
              idx === 0
                ? (r?.strength?.elongation_pct ?? 0)
                : estimateElongation(r?.strength?.elongation_pct ?? 0, life)
            ) ?? 0,
            shap: r?.degradation?.shap_values || {},
          }
        })
        setSeries(next)
      } catch (_) {
        if (cancelled) return
        // Fallback synthetic curves to preserve design in mock/error conditions.
        const su0 = initialResult?.strength?.su_mpa ?? 550
        const sy0 = initialResult?.strength?.sy_mpa ?? 400
        const el0 = initialResult?.strength?.elongation_pct ?? 22
        const maxRepairs = initialResult?.recommendation?.max_repair_cycles ?? 8
        const synthetic = Array.from({ length: 11 }, (_, cycle) => {
          const ratio = Math.exp(-0.07 * cycle)
          const life = Math.max(0.1, ratio)
          return {
            cycle,
            su: +(su0 * ratio).toFixed(2),
            sy: +(sy0 * ratio).toFixed(2),
            lifespan_index: +life.toFixed(4),
            lifespan_safe: cycle <= maxRepairs ? +life.toFixed(4) : null,
            lifespan_risk: cycle > maxRepairs ? +life.toFixed(4) : null,
            elongation: +estimateElongation(el0, life).toFixed(2),
            shap: {},
          }
        })
        setSeries(synthetic)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [reqKey, initialResult, form.application])

  if (loading && series.length === 0) {
    return <p className="text-xs" style={{ color: '#9ca3af' }}>Loading 0-10 repair cycle comparison...</p>
  }
  if (series.length === 0) return null

  const suBaseline = safeNum(initialResult?.strength?.su_mpa ?? series[0]?.su)
  const syBaseline = safeNum(initialResult?.strength?.sy_mpa ?? series[0]?.sy)
  const maxRepairs = safeNum(initialResult?.recommendation?.max_repair_cycles) ?? 8
  const activeCycle = Math.max(0, Math.min(10, Number(form.repair_cycles || 0)))
  const shapMap = series[activeCycle]?.shap || {}
  const topShap = Object.entries(shapMap)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([feature, value]) => ({ feature, contribution: safeNum(value) ?? 0 }))

  return (
    <ChartErrorBoundary>
      <div className="space-y-4">
        <div className="h-64 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="cycle" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1]} stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {Number.isFinite(suBaseline) && (
                <ReferenceLine yAxisId="left" y={suBaseline} stroke="#1F4E79" strokeDasharray="6 4" />
              )}
              {Number.isFinite(syBaseline) && (
                <ReferenceLine yAxisId="left" y={syBaseline} stroke="#2E74B5" strokeDasharray="6 4" />
              )}
              {Number.isFinite(maxRepairs) && (
                <ReferenceLine x={maxRepairs} yAxisId="left" stroke="#ef4444" strokeDasharray="4 4" />
              )}
              <Line yAxisId="left" type="monotone" dataKey="su" name="Su (MPa)" stroke="#1F4E79" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="sy" name="Sy (MPa)" stroke="#2E74B5" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="elongation" name="Elongation (%)" stroke="#375623" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="lifespan_safe" name="Lifespan Index (safe)" stroke="#BF8F00" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="lifespan_risk" name="Lifespan Index (risk)" stroke="#ef4444" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {topShap.length > 0 && (
          <div className="h-40 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>
              Top-3 Module E SHAP contributions at cycle {activeCycle}
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topShap}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="feature" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="contribution" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </ChartErrorBoundary>
  )
}
