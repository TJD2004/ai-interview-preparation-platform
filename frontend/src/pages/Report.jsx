import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';

export default function Report() {
  const { id } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    client.get(`/interview/${id}`).then(res => setSession(res.data.session));
  }, [id]);

  if (!session) return <div className="page-loading">Loading report...</div>;

  return (
    <div className="content-page">
      <motion.div className="card wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="report-header">
          <h1>{session.role}</h1>
          <span className="score-badge">{session.overallScore ?? '—'}/10</span>
        </div>

        <div className="report-section">
          <h3>Strengths</h3>
          <p>{session.strengths || 'Not available'}</p>
        </div>
        <div className="report-section">
          <h3>Areas to improve</h3>
          <p>{session.improvements || 'Not available'}</p>
        </div>
        <div className="report-section">
          <h3>Summary</h3>
          <p>{session.summary || 'Not available'}</p>
        </div>

        <details className="transcript-toggle">
          <summary>View full transcript</summary>
          <div className="transcript">
            {session.messages?.map(m => (
              <p key={m.id} className={m.sender}>
                <strong>{m.sender === 'ai' ? 'Interviewer' : 'You'}:</strong> {m.content}
              </p>
            ))}
          </div>
        </details>

        <Link to="/reports" className="cta-btn">Back to reports</Link>
      </motion.div>
    </div>
  );
}
