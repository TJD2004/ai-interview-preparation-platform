import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="brand-row">
        <Logo size={32} />
        <span className="brand">InterviewPrep</span>
      </Link>
      <div className="nav-links">
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="nav-btn" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="nav-cta">Sign up</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
