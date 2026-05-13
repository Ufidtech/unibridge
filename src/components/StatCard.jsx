export default function StatCard({ icon, label, value, subtext, variant = 'default' }) {
  const variantStyles = {
    default: 'bg-slate-900 border-slate-800',
    success: 'bg-green-500/10 border-green-500/30',
  };

  return (
    <div className={`border rounded-lg p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${variant === 'success' ? 'text-green-400' : 'text-slate-400'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${variant === 'success' ? 'text-green-400' : 'text-slate-100'}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-slate-500 mt-2">
              {subtext}
            </p>
          )}
        </div>
        <div className="text-4xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
