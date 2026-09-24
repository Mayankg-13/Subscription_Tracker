const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-600/20 to-violet-600/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-600/20 to-pink-600/10 border-rose-500/30 text-rose-400',
  };

  const styleClass = colorMap[color] || colorMap.indigo;

  return (
    <div className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br ${styleClass} relative overflow-hidden transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
