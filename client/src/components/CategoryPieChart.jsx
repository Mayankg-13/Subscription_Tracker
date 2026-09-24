import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  Entertainment: '#ec4899', // Pink
  Education: '#6366f1',     // Indigo
  Utilities: '#f59e0b',     // Amber
  Health: '#10b981',        // Emerald
  Software: '#06b6d4',      // Cyan
  Other: '#64748b',         // Slate
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3 rounded-xl border border-slate-700 text-xs shadow-xl">
        <p className="font-bold text-white mb-1">{data.category}</p>
        <p className="text-slate-300">
          Spend: <span className="font-semibold text-indigo-400">{formatCurrency(data.monthlyTotal)}</span> / mo
        </p>
        <p className="text-slate-400">
          Subscriptions: <span className="font-semibold text-white">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-slate-400 text-sm">No active category spending to chart yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-lg font-bold text-white tracking-tight">Monthly Spend by Category</h3>
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="monthlyTotal"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other}
                  stroke="rgba(15, 23, 42, 0.8)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium px-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
