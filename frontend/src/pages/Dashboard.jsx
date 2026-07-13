import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, FileText } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedNumber from '../components/AnimatedNumber';

const CHART_COLORS = {
  dark: { axis: '#A99BC4', tooltipBg: '#1E1433', tooltipBorder: '#3A2856', line: '#22D3EE' },
  light: { axis: '#6E5E85', tooltipBg: '#FFFFFF', tooltipBorder: '#E4DCF2', line: '#0891B2' }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    client.get('/interview/history').then(res => setSessions(res.data.sessions.slice(0, 4)));
    client.get('/interview/analytics').then(res => setAnalytics(res.data));
  }, []);

  const chartData = (analytics?.scoreTrend || []).map((s, i) => ({ name: `#${i + 1}`, score: s.score }));
  const chartColors = CHART_COLORS[theme] || CHART_COLORS.dark;

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p className="muted">Here's where you left off.</p>
      </div>

      <div className="dashboard-grid">
        <motion.div className="card cta-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2>Ready for another round?</h2>
          <p className="muted">Pick a role and start a fresh mock interview.</p>
          <Link to="/interview/new" className="cta-btn">Start interview</Link>
          <div className="quick-links-row">
            <Link to="/aptitude" className="quick-link"><Calculator size={14} /> Aptitude Practice</Link>
            <Link to="/ats-checker" className="quick-link"><FileText size={14} /> ATS Resume Checker</Link>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2>Your progress</h2>
          {analytics && analytics.totalInterviews > 0 ? (
            <>
              <div className="stat-row">
                <div><span className="stat-num"><AnimatedNumber value={analytics.totalInterviews} /></span><span className="stat-label">Interviews</span></div>
                <div><span className="stat-num"><AnimatedNumber value={analytics.avgScore} decimals={1} /></span><span className="stat-label">Avg score</span></div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke={chartColors.axis} fontSize={12} />
                  <YAxis domain={[0, 10]} stroke={chartColors.axis} fontSize={12} />
                  <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke={chartColors.line} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="muted">No completed interviews yet — finish one to see your trend here.</p>
          )}
        </motion.div>

        <motion.div className="card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card-header-row">
            <h2>Recent interviews</h2>
            <Link to="/reports" className="link-muted">View all →</Link>
          </div>
          {sessions.length === 0 && <p className="muted">Your past interviews will show up here.</p>}
          <ul className="session-list">
            {sessions.map(s => (
              <li key={s.id}>
                <Link to={s.status === 'completed' ? `/report/${s.id}` : `/interview/${s.id}`}>
                  <span className="session-role">{s.role}</span>
                  <span className={`session-status ${s.status}`}>
                    {s.status === 'completed' ? `Score ${s.overallScore ?? '—'}/10` : 'In progress'}
                  </span>
                  <span className="session-date">{new Date(s.createdAt).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
