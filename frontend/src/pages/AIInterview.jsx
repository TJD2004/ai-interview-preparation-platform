import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import BotAvatar from '../components/BotAvatar';

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'DevOps Engineer',
  'QA Engineer',
  'Business Analyst',
  'Other'
];

export default function AIInterview() {
  const [roleChoice, setRoleChoice] = useState('Frontend Developer');
  const [customRole, setCustomRole] = useState('');
  const [questionCount, setQuestionCount] = useState(6);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const finalRole = roleChoice === 'Other' ? customRole.trim() : roleChoice;

  async function startInterview(e) {
    e.preventDefault();
    if (!finalRole || starting) return;
    setStarting(true);
    try {
      const res = await client.post('/interview/start', { role: finalRole, questionCount });
      navigate(`/interview/${res.data.sessionId}`, {
        state: { role: finalRole, questionCount, firstReply: res.data.reply }
      });
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>Start a new interview</h1>
        <p className="muted">Pick a role and the interviewer builds questions specifically around it.</p>
      </div>

      <div className="ai-interview-grid">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={startInterview} className="start-form">
            <label>Role</label>
            <select value={roleChoice} onChange={e => setRoleChoice(e.target.value)}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <AnimatePresence>
              {roleChoice === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <label>Type your role</label>
                  <input
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="e.g. Cloud Security Engineer"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <label>Questions</label>
            <select value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}>
              <option value={4}>4 — Quick</option>
              <option value={6}>6 — Standard</option>
              <option value={8}>8 — Full</option>
            </select>

            <button className="cta-btn full" type="submit" disabled={starting || !finalRole}>
              {starting ? 'Starting...' : 'Start interview'}
            </button>
          </form>
        </motion.div>

        <motion.div
          className="card ai-interview-preview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <BotAvatar speaking={false} listening={false} />
          <p className="muted small">Your interviewer is ready when you are.</p>
        </motion.div>
      </div>
    </div>
  );
}
