import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Mic, Calculator, FileText, ClipboardList, CircleUserRound, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { to: '/interview/new', label: 'AI Interview', Icon: Mic },
  { to: '/aptitude', label: 'Aptitude Practice', Icon: Calculator },
  { to: '/ats-checker', label: 'ATS Checker', Icon: FileText },
  { to: '/reports', label: 'Reports', Icon: ClipboardList },
  { to: '/profile', label: 'Profile', Icon: CircleUserRound }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sidebar-brand-row">
        <Logo size={38} />
        <span className="sidebar-brand">InterviewPrep</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon"><item.Icon size={17} strokeWidth={2} /></span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle className="sidebar-theme-toggle" />
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user?.name?.[0]?.toUpperCase() || '?')}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <button onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={12} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
