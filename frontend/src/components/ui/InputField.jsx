import { useState } from 'react'
import TooltipIcon from './TooltipIcon'

/**
 * InputField — styled number input with label, ghost text, unit badge, tooltip, error state
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.name
 * @param {number} props.value
 * @param {function} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.tooltip]
 * @param {string} [props.unit]
 * @param {number} [props.min]
 * @param {number} [props.max]
 * @param {number} [props.step]
 * @param {string} [props.error]
 */
export default function InputField({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  tooltip = '',
  unit = '',
  min,
  max,
  step = 'any',
  error,
}) {
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? 'rgba(239,68,68,0.6)'
    : focused
    ? 'rgba(16,185,129,0.5)'
    : 'rgba(255,255,255,0.08)'

  const shadowStyle = error
    ? '0 0 0 3px rgba(239,68,68,0.12)'
    : focused
    ? '0 0 0 3px rgba(16,185,129,0.12)'
    : 'none'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={name}
          className="text-sm font-medium"
          style={{ color: '#d1d5db', fontFamily: 'DM Sans, sans-serif' }}
        >
          {label}
        </label>
        {tooltip && <TooltipIcon text={tooltip} />}
      </div>

      <div
        className="flex items-center rounded-xl overflow-hidden transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${borderColor}`,
          boxShadow: shadowStyle,
        }}
      >
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={(e) => {
            const raw = e.target.value
            const parsed = parseFloat(raw)
            onChange(name, Number.isNaN(parsed) ? 0 : parsed)
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none"
          style={{
            color: '#f9fafb',
            fontFamily: 'JetBrains Mono, monospace',
            caretColor: '#10b981',
          }}
        />
        {unit && (
          <span
            className="px-3 py-2.5 text-xs font-medium border-l shrink-0"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#6b7280',
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(255,255,255,0.02)',
              minWidth: '4rem',
              textAlign: 'center',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs" style={{ color: '#f87171', fontFamily: 'DM Sans, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}
