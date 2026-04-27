import { motion } from 'framer-motion'

/**
 * TabSwitcher — animated tab bar
 * @param {object} props
 * @param {Array<{id: string, label: string, icon: string}>} props.tabs
 * @param {string} props.active
 * @param {function} props.onChange
 */
export default function TabSwitcher({ tabs, active, onChange }) {
  return (
    <div
      className="flex rounded-2xl p-1.5 w-full max-w-lg"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors duration-200"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: isActive ? '#0a0a0a' : '#6b7280',
              zIndex: 1,
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-bg"
                className="absolute inset-0 rounded-xl"
                style={{ background: '#10b981' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {tab.icon} {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
