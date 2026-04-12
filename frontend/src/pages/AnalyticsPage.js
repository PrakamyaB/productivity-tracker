import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useAnalytics } from '../hooks/useData';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#14b8a6','#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.8125rem', color: p.color || 'var(--text-primary)' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, loading, refresh } = useAnalytics();
  const [period, setPeriod] = useState('daily');

  const handleExport = async () => {
    try {
      const res = await analyticsAPI.exportCSV();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `productivity-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[200,280,220].map((h,i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 18 }} />)}
    </div>
  );

  const { overview, charts } = data || {};

  const chartData = period === 'daily' ? charts?.daily : charts?.weekly;
  const xKey = period === 'daily' ? 'date' : 'week';
  const xFormatter = period === 'daily' ? v => v?.slice(5) : v => v;

  // Trend: compare last 7 vs prev 7 days
  const recent7 = (charts?.daily || []).slice(-7);
  const prev7 = (charts?.daily || []).slice(-14, -7);
  const recentHours = recent7.reduce((s, d) => s + d.hours, 0);
  const prevHours = prev7.reduce((s, d) => s + d.hours, 0);
  const trendPct = prevHours > 0 ? ((recentHours - prevHours) / prevHours * 100).toFixed(0) : 0;
  const TrendIcon = trendPct > 5 ? TrendingUp : trendPct < -5 ? TrendingDown : Minus;
  const trendColor = trendPct > 5 ? 'var(--success)' : trendPct < -5 ? 'var(--danger)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Deep dive into your productivity patterns</p>
        </div>
        <button onClick={handleExport} className="btn btn-secondary btn-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Trend summary cards */}
      <div className="grid-4">
        {[
          { label: 'This Week', value: `${Math.round(overview?.week?.hours || 0)}h`, sub: 'logged' },
          { label: 'This Month', value: `${Math.round(overview?.month?.hours || 0)}h`, sub: 'logged' },
          { label: 'Longest Streak', value: `${overview?.longestStreak || 0}`, sub: 'days' },
          { label: '7-Day Trend', value: `${trendPct > 0 ? '+' : ''}${trendPct}%`, sub: 'vs. prev week', color: trendColor },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card card-padding">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Period selector + main chart */}
      <div className="card card-padding">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem' }}>Hours Over Time</h3>
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 10, padding: 3, gap: 2 }}>
            {['daily', 'weekly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                style={{
                  padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.8125rem', fontFamily: 'var(--font-body)',
                  background: period === p ? 'var(--bg-card)' : 'transparent',
                  color: period === p ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: period === p ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} tickFormatter={xFormatter} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={period === 'daily' ? 4 : 0} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="hours" name="Hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two column charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Category breakdown */}
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 20 }}>Category Split (30 days)</h3>
          {charts?.category?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={charts.category} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="hours" nameKey="name">
                    {charts.category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}h`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {charts.category.map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.8125rem' }}>{c.name}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{c.hours}h</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>}
        </div>

        {/* Day of week heatmap-style */}
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 20 }}>Productivity by Day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.dayOfWeek || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgHours" name="Avg Hours" radius={[5,5,0,0]}>
                {(charts?.dayOfWeek || []).map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Average hours logged per day of week (last 30 days)
          </div>
        </div>
      </div>

      {/* Weekly comparison bar */}
      <div className="card card-padding">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 20 }}>Weekly Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={charts?.weekly || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" name="Hours" fill="#8b5cf6" radius={[4,4,0,0]} />
            <Bar dataKey="completed" name="Completions" fill="#10b981" radius={[4,4,0,0]} />
            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
