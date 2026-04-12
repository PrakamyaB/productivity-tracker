import { useState, useEffect, useCallback } from 'react';
import { habitsAPI, analyticsAPI, goalsAPI, logsAPI } from '../services/api';

// ── Habits ────────────────────────────────────────────
export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await habitsAPI.getAll();
      setHabits(res.data.habits);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => {
    const res = await habitsAPI.create(data);
    setHabits(prev => [...prev, res.data.habit]);
    return res.data.habit;
  };

  const update = async (id, data) => {
    const res = await habitsAPI.update(id, data);
    setHabits(prev => prev.map(h => h._id === id ? res.data.habit : h));
    return res.data.habit;
  };

  const remove = async (id) => {
    await habitsAPI.delete(id);
    setHabits(prev => prev.filter(h => h._id !== id));
  };

  const refresh = fetch;

  return { habits, loading, error, create, update, remove, refresh };
};

// ── Analytics / Dashboard ─────────────────────────────
export const useAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
};

// ── Goals ─────────────────────────────────────────────
export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await goalsAPI.getAll();
      setGoals(res.data.goals);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (data) => {
    const res = await goalsAPI.create(data);
    setGoals(prev => [res.data.goal, ...prev]);
    return res.data.goal;
  };

  const remove = async (id) => {
    await goalsAPI.delete(id);
    setGoals(prev => prev.filter(g => g._id !== id));
  };

  return { goals, loading, create, remove, refresh: fetch };
};

// ── Today's Logs ──────────────────────────────────────
export const useTodayLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await logsAPI.getByDate(today);
      setLogs(res.data.logs);
    } catch {}
    finally { setLoading(false); }
  }, [today]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = async (data) => {
    const res = await logsAPI.createOrUpdate(data);
    const newLog = res.data.log;
    setLogs(prev => {
      const exists = prev.find(l => l.habit._id === newLog.habit || l.habit === newLog.habit);
      if (exists) return prev.map(l => (l._id === newLog._id || (l.habit._id || l.habit) === (newLog.habit._id || newLog.habit)) ? { ...newLog, habit: l.habit } : l);
      return [...prev, newLog];
    });
    return res.data;
  };

  return { logs, loading, upsert, refresh: fetch };
};
