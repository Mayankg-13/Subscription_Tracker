import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import CategoryPieChart from '../components/CategoryPieChart';
import { DollarSign, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getDaysLeft = (dateString) => {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMonthly: 0,
    totalYearly: 0,
    activeCount: 0,
    byCategory: [],
  });

  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, upcomingRes] = await Promise.all([
          api.get('/subscriptions/stats'),
          api.get('/subscriptions/upcoming'),
        ]);

        setStats(statsRes.data);
        setUpcoming(upcomingRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time summary of your monthly commitment and renewals</p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Monthly Spend"
          value={formatCurrency(stats.totalMonthly)}
          subtitle="Normalized monthly commitment"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Total Yearly Spend"
          value={formatCurrency(stats.totalYearly)}
          subtitle="Projected annual expenditure"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeCount}
          subtitle="Currently active recurring plans"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Main Grid: Category Chart & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Recharts Pie Chart */}
        <CategoryPieChart data={stats.byCategory} />

        {/* Right Column: Upcoming Renewals List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">Renewing in Next 7 Days</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {upcoming.length} upcoming
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl">
                No active subscriptions renewing within the next 7 days.
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {upcoming.map((sub) => {
                  const daysLeft = getDaysLeft(sub.nextRenewalDate);
                  const isUrgent = daysLeft <= 2;

                  return (
                    <div
                      key={sub._id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">{sub.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">{sub.category}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-300">{formatCurrency(sub.amount)}</span>
                        </div>
                      </div>

                      {/* Renewal Date & Urgent Badge */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-300">{formatDate(sub.nextRenewalDate)}</p>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 mt-1 rounded-full text-[11px] font-semibold border ${
                            isUrgent
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}
                        >
                          {isUrgent && <AlertCircle className="w-3 h-3" />}
                          <span>{daysLeft <= 0 ? 'Renews Today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
