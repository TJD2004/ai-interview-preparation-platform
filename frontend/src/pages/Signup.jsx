import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import BotAvatar from '../components/BotAvatar';
import Logo from '../components/Logo';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post('/auth/signup', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    try {
      const res = await client.post('/auth/google', { credential: credentialResponse.credential });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed');
    }
  }

  return (
    <div className="split-auth">
      <div className="split-panel">
        <div className="bg-blob blob-2" />
        <Link to="/" className="split-brand"><Logo size={32} /> InterviewPrep</Link>
        <motion.div
          className="split-orb"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <BotAvatar speaking={false} listening />
        </motion.div>
        <motion.p
          className="split-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Free forever. No card, no catch.
        </motion.p>
      </div>

      <div className="split-form-side">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Create your account</h1>
          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            <button type="submit" className="cta-btn full">Sign up</button>
          </form>

          <div className="divider"><span>or</span></div>

          <div className="google-btn-wrap">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed')} theme="filled_black" shape="pill" />
          </div>

          <p className="switch-link">Already have an account? <Link to="/login">Log in</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
