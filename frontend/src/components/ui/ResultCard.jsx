/**
 * ResultCard — glass card displaying a single predicted metric
 * @param {object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.unit]
 * @param {string} [props.accent] - color for the value
 */
export default function ResultCard({ label, value, unit = '', accent = '#10b981' }) {
  return (
    <div
      className="glass rounded-2xl p-5 flex flex-col gap-2"
      style={{ border: '1px solid rgba(16,185,129,0.15)' }}
    >
      <span
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}
      >
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span
          className="text-3xl font-semibold leading-none"
          style={{ color: accent, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span
            className="text-sm mb-0.5"
            style={{ color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
