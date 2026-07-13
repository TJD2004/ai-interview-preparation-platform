import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';

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

export default function ATSChecker() {
  const [roleChoice, setRoleChoice] = useState('Frontend Developer');
  const [customRole, setCustomRole] = useState('');
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const finalRole = roleChoice === 'Other' ? customRole.trim() : roleChoice;

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !finalRole || checking) return;
    setChecking(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', finalRole);

      const res = await client.post('/ats/check', formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze resume');
    } finally {
      setChecking(false);
    }
  }

  function scoreColor(score) {
    if (score >= 75) return 'var(--green)';
    if (score >= 50) return 'var(--fuchsia)';
    return 'var(--red)';
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <h1>ATS Resume Checker</h1>
        <p className="muted">Upload your resume and see how it scores against a target role — free, powered by the same AI as your interviews.</p>
      </div>

      <div className="ats-grid">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit} className="start-form">
            <label>Target role</label>
            <select value={roleChoice} onChange={e => setRoleChoice(e.target.value)}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <AnimatePresence>
              {roleChoice === 'Other' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <label>Type your role</label>
                  <input value={customRole} onChange={e => setCustomRole(e.target.value)} placeholder="e.g. Cloud Security Engineer" required />
                </motion.div>
              )}
            </AnimatePresence>

            <label>Resume file (PDF, DOCX, or TXT)</label>
            <div className="file-drop" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {file ? <span>{file.name}</span> : <span className="muted">Click to choose a file</span>}
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="cta-btn full" type="submit" disabled={!file || !finalRole || checking}>
              {checking ? 'Analyzing...' : 'Check my resume'}
            </button>
          </form>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!result && !checking && <p className="muted">Your ATS score and suggestions will appear here.</p>}
          {checking && <p className="muted">Reading your resume and comparing it against "{finalRole}"...</p>}

          {result && (
            <div>
              <div className="ats-score-row">
                <div className="ats-score-circle" style={{ borderColor: scoreColor(result.atsScore) }}>
                  <span style={{ color: scoreColor(result.atsScore) }}>{result.atsScore}</span>
                  <span className="ats-score-label">/ 100</span>
                </div>
                <p className="ats-summary">{result.summary}</p>
              </div>

              {result.matchedKeywords?.length > 0 && (
                <div className="ats-section">
                  <h3>Matched keywords</h3>
                  <div className="keyword-chips">
                    {result.matchedKeywords.map(k => <span key={k} className="keyword-chip matched">{k}</span>)}
                  </div>
                </div>
              )}

              {result.missingKeywords?.length > 0 && (
                <div className="ats-section">
                  <h3>Missing keywords</h3>
                  <div className="keyword-chips">
                    {result.missingKeywords.map(k => <span key={k} className="keyword-chip missing">{k}</span>)}
                  </div>
                </div>
              )}

              {result.formattingIssues?.length > 0 && (
                <div className="ats-section">
                  <h3>Formatting issues</h3>
                  <ul className="ats-list">
                    {result.formattingIssues.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div className="ats-section">
                  <h3>Suggestions</h3>
                  <ul className="ats-list">
                    {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
