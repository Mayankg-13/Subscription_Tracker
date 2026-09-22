import { Calendar, Edit2, Trash2, Power, Bell } from 'lucide-react';

const CATEGORY_COLORS = {
  Entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Utilities: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Software: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const SubscriptionCard = ({ subscription, onEdit, onDelete, onToggleStatus }) => {
  const { _id, name, category, amount, billingCycle, nextRenewalDate, status, reminderDaysBefore, notes } = subscription;

  const categoryStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const isActive = status === 'active';

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all duration-200 hover:border-slate-700/80 hover:shadow-xl relative flex flex-col justify-between ${
      isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
    }`}>
      
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate">{name}</h3>
            <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold border ${categoryStyle}`}>
              {category}
            </span>
          </div>

          {/* Amount Badge */}
          <div className="text-right">
            <span className="text-xl font-bold text-white tracking-tight">
              {formatCurrency(amount)}
            </span>
            <p className="text-xs text-slate-400 capitalize">per {billingCycle}</p>
          </div>
        </div>

        {/* Renewal Date & Reminders */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next Renewal:</span>
            </div>
            <span className="font-medium text-slate-200">{formatDate(nextRenewalDate)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Reminder:</span>
            </div>
            <span className="font-medium text-slate-200">{reminderDaysBefore} days before</span>
          </div>

          {notes && (
            <p className="text-slate-400 italic text-[11px] pt-1 truncate" title={notes}>
              "{notes}"
            </p>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        
        {/* Status Toggle Badge */}
        <button
          onClick={() => onToggleStatus(subscription)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          }`}
        >
          <Power className="w-3 h-3" />
          <span className="capitalize">{status}</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Edit Subscription"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Subscription"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default SubscriptionCard;
