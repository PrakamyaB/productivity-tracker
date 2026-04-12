import AIInsights from "../components/ui/AIInsights";
import React from 'react';
import { useAnalytics } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Clock, Flame, Target, TrendingUp, Download, RefreshCw, Lightbulb, Award } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'var(--accent)' }) => (
  <div className="card card-padding" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.8125rem', color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const Skeleton = ({ h = 20, w = '100%', r = 8 }) => (
  <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useAnalytics();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleExport = async () => {
    try {
      const res = await analyticsAPI.exportCSV();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `productivity-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Skeleton h={60} />
      <div className="grid-4"><Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} /></div>
      <Skeleton h={280} />
    </div>
  );

  const { overview, charts, insights } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={refresh} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid-4">
        <StatCard icon={Clock} label="Today's Hours" value={`${overview?.today?.hours || 0}h`}
          sub={`${overview?.today?.completed || 0}/${overview?.today?.total || 0} habits completed`}
          color="var(--accent)" />
        <StatCard icon={TrendingUp} label="This Week" value={`${overview?.week?.hours || 0}h`}
          sub="Total hours logged" color="#10b981" />
        <StatCard icon={Flame} label="Best Streak" value={`${overview?.longestStreak || 0} days`}
          sub={`Current: ${overview?.currentBestStreak || 0} days`} color="#f59e0b" />
        <StatCard icon={Award} label="Most Consistent" value={overview?.mostConsistentHabit?.name || '—'}
          sub={overview?.mostConsistentHabit ? `${overview.mostConsistentHabit.days} days logged` : 'Start logging!'}
          color="#ec4899" />
      </div>
       <AIInsights />

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Daily trend */}
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
            Daily Activity — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts?.daily || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" name="Hours" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#colorHours)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
            Category Breakdown
          </h3>
          {charts?.category?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={charts.category} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="hours" nameKey="name">
                  {charts.category.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No data yet — start logging!
            </div>
          )}
        </div>
      </div>

      {/* Weekly + Day of week charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
            Weekly Summary — Last 12 Weeks
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.weekly || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" name="Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
            Avg. Hours by Day of Week
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.dayOfWeek || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgHours" name="Avg Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      {insights?.length > 0 && (
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Lightbulb size={18} color="var(--warning)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Smart Insights</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: ins.type === 'warning' ? 'var(--warning-light)' :
                  ins.type === 'achievement' ? 'var(--success-light)' : 'var(--accent-light)',
                border: `1px solid ${ins.type === 'warning' ? 'var(--warning)' :
                  ins.type === 'achievement' ? 'var(--success)' : 'var(--accent)'}22`,
              }}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{ins.icon}</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
