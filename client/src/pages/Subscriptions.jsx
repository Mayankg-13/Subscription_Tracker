import { useState, useEffect } from 'react';
import api from '../api/axios';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { Plus, Search, Filter, RefreshCw, CreditCard, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['All', 'Entertainment', 'Education', 'Utilities', 'Health', 'Software', 'Other'];
const STATUSES = ['All', 'active', 'cancelled'];

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;

      const res = await api.get('/subscriptions', { params });
      setSubscriptions(res.data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, status]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingSub) {
      const res = await api.put(`/subscriptions/${editingSub._id}`, formData);
      setSubscriptions((prev) =>
        prev.map((sub) => (sub._id === editingSub._id ? res.data : sub))
      );
    } else {
      const res = await api.post('/subscriptions', formData);
      setSubscriptions((prev) => [res.data, ...prev]);
    }
    fetchSubscriptions();
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'cancelled' : 'active';
    try {
      const res = await api.put(`/subscriptions/${sub._id}`, { status: newStatus });
      setSubscriptions((prev) =>
        prev.map((item) => (item._id === sub._id ? res.data : item))
      );
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/subscriptions/${deletingId}`);
      setSubscriptions((prev) => prev.filter((item) => item._id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your recurring payments</p>
        </div>

        <button
          onClick={() => {
            setEditingSub(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions by name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm capitalize"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Subscription Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="p-4 rounded-2xl bg-indigo-600/10 text-indigo-400 mb-4">
            <CreditCard className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">No subscriptions found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">
            {search || category !== 'All' || status !== 'All'
              ? 'No subscriptions match your search or filter criteria.'
              : 'You haven’t added any subscriptions yet. Click below to add your first one!'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setStatus('All');
              setEditingSub(null);
              setIsFormOpen(true);
            }}
            className="mt-6 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub._id}
              subscription={sub}
              onEdit={(s) => {
                setEditingSub(s);
                setIsFormOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingSub}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Subscription</h3>
            <p className="text-slate-400 text-sm">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors shadow-lg shadow-rose-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Subscriptions;
