/**
 * ModelBadge — displays which ML model was used
 * @param {object} props
 * @param {string} props.modelName
 */
export default function ModelBadge({ modelName }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-medium px-3 py-1.5 rounded-lg"
        style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#10b981',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ⚙ {modelName}
      </span>
    </div>
  )
}
