import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Profile() {
  const { user, login } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get('/interview/analytics').then(res => setAnalytics(res.data));
  }, []);

  async function saveName(e) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await client.patch('/auth/me', { name: name.trim() });
      const token = localStorage.getItem('token');
      login(token, res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Your account and overall progress.</p>
      </div>

      <div className="profile-grid">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user?.name?.[0]?.toUpperCase() || '?')}
            </div>
            <p className="profile-email">{user?.email}</p>
          </div>

          <form onSubmit={saveName} className="start-form">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
            <button className="cta-btn full" type="submit" disabled={saving}>
              {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2>Lifetime stats</h2>
          {analytics ? (
            <div className="stat-row">
              <div><span className="stat-num"><AnimatedNumber value={analytics.totalInterviews} /></span><span className="stat-label">Interviews</span></div>
              <div><span className="stat-num"><AnimatedNumber value={analytics.avgScore} decimals={1} /></span><span className="stat-label">Avg score</span></div>
            </div>
          ) : (
            <p className="muted">Loading...</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
