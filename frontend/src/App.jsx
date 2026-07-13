import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AIInterview from './pages/AIInterview';
import AptitudePractice from './pages/AptitudePractice';
import AptitudeReport from './pages/AptitudeReport';
import ATSChecker from './pages/ATSChecker';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Interview from './pages/Interview';
import Report from './pages/Report';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedFullscreen from './components/ProtectedFullscreen';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/interview/new" element={<ProtectedRoute><AIInterview /></ProtectedRoute>} />
      <Route path="/aptitude" element={<ProtectedRoute><AptitudePractice /></ProtectedRoute>} />
      <Route path="/aptitude/report/:id" element={<ProtectedRoute><AptitudeReport /></ProtectedRoute>} />
      <Route path="/ats-checker" element={<ProtectedRoute><ATSChecker /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />

      <Route path="/interview/:id" element={<ProtectedFullscreen><Interview /></ProtectedFullscreen>} />
    </Routes>
  );
}
