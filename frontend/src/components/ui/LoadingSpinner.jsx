/**
 * LoadingSpinner — animated emerald spinner with optional label
 * @param {object} props
 * @param {string} [props.label]
 */
export default function LoadingSpinner({ label = 'Analyzing composition...' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(16,185,129,0.12)',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#10b981',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      {label && (
        <p
          className="text-sm"
          style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
        >
          {label}
        </p>
      )}
    </div>
  )
}
