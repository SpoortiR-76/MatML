/**
 * GlassCard — base glass morphism container
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {object} [props.style]
 */
export default function GlassCard({ children, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`glass rounded-2xl ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}
