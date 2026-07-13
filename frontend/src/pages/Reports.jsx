import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';

export default function Reports() {
  const [tab, setTab] = useState('interviews');
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [aptitudeSessions, setAptitudeSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/interview/history'),
      client.get('/aptitude/history')
    ]).then(([interviewRes, aptitudeRes]) => {
      setInterviewSessions(interviewRes.data.sessions);
      setAptitudeSessions(aptitudeRes.data.sessions);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Your reports</h1>
        <p className="muted">Every interview and aptitude test you've completed, scored and saved.</p>
      </div>

      <div className="tab-row">
        <button className={`tab-btn${tab === 'interviews' ? ' active' : ''}`} onClick={() => setTab('interviews')}>
          Interviews
        </button>
        <button className={`tab-btn${tab === 'aptitude' ? ' active' : ''}`} onClick={() => setTab('aptitude')}>
          Aptitude Tests
        </button>
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={tab}>
        {tab === 'interviews' && (
          <>
            {!loading && interviewSessions.length === 0 && (
              <p className="muted">No interviews yet — start one from the AI Interview tab.</p>
            )}
            <ul className="session-list">
              {interviewSessions.map(s => (
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
          </>
        )}

        {tab === 'aptitude' && (
          <>
            {!loading && aptitudeSessions.length === 0 && (
              <p className="muted">No aptitude tests yet — start one from the Aptitude Practice tab.</p>
            )}
            <ul className="session-list">
              {aptitudeSessions.map(s => (
                <li key={s.id}>
                  <Link to={s.status === 'completed' ? `/aptitude/report/${s.id}` : '/aptitude'}>
                    <span className="session-role">{s.topic || (s.category === 'mixed' ? 'Mixed Practice' : s.category)}</span>
                    <span className={`session-status ${s.status}`}>
                      {s.status === 'completed' ? `${s.correctCount}/${s.questionCount} · ${s.scorePercent}%` : 'In progress'}
                    </span>
                    <span className="session-date">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.div>
    </div>
  );
}
