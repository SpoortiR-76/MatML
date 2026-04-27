import { useState } from 'react'

/**
 * TooltipIcon — ⓘ icon with hover tooltip
 * @param {object} props
 * @param {string} props.text - tooltip content
 */
export default function TooltipIcon({ text }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: '#9ca3af',
          fontFamily: 'JetBrains Mono, monospace',
          cursor: 'help',
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label={text}
      >
        i
      </button>
      {visible && (
        <span
          className="absolute bottom-6 left-1/2 z-50 w-48 px-3 py-2 rounded-xl text-xs leading-relaxed pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(15,15,15,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            color: '#d1d5db',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            whiteSpace: 'normal',
          }}
        >
          {text}
          <span
            className="absolute top-full left-1/2"
            style={{
              transform: 'translateX(-50%)',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(255,255,255,0.12)',
            }}
          />
        </span>
      )}
    </span>
  )
}
