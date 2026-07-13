require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models');
const authRoutes = require('./routes/auth.routes');
const interviewRoutes = require('./routes/interview.routes');
const aptitudeRoutes = require('./routes/aptitude.routes');
const atsRoutes = require('./routes/ats.routes');

const app = express();
// CORS_ORIGIN unset -> allow all (fine for local dev). Set it to your Netlify
// URL in production, e.g. CORS_ORIGIN=https://your-app.netlify.app
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/ats', atsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err.message);
    console.error('Check your MONGODB_URI in backend/.env and that your cluster/network access allows this connection.');
  }
}

start();
