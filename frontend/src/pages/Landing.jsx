import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import BotAvatar from '../components/BotAvatar';
import Navbar from '../components/Navbar';
import MagneticButton from '../components/MagneticButton';
import TiltCard from '../components/TiltCard';

const STEPS = [
  { n: '01', title: 'Pick a role', text: 'Choose from common roles or type your own — the interviewer adapts to it.' },
  { n: '02', title: 'Talk it out', text: 'Answer out loud. Your interviewer speaks questions and listens to you live.' },
  { n: '03', title: 'Get a real report', text: 'A score, strengths, and areas to improve — saved so you can track growth.' }
];

export default function Landing() {
  const { scrollY } = useScroll();
  const blob1Y = useTransform(scrollY, [0, 900], [0, 160]);
  const blob2Y = useTransform(scrollY, [0, 900], [0, -120]);
  const heroOrbY = useTransform(scrollY, [0, 500], [0, 60]);

  return (
    <div className="page landing">
      <motion.div className="bg-blob blob-1" style={{ y: blob1Y }} />
      <motion.div className="bg-blob blob-2" style={{ y: blob2Y }} />

      <Navbar />

      <div className="hero">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow">Free. No subscriptions. Ever.</span>
          <h1>Walk into your next interview already having done this one.</h1>
          <p>
            Speak your answers out loud to an AI interviewer built for your exact role.
            Get a real transcript, a real score, and a report you can actually improve on.
          </p>
          <MagneticButton>
            <Link to="/signup" className="cta-btn">Start practicing</Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          className="hero-orb"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{ y: heroOrbY }}
        >
          <BotAvatar speaking listening={false} />
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1, duration: 0.6 }, y: { delay: 1, duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <ChevronDown size={22} />
      </motion.div>

      <div className="steps-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.12 }}
            >
              <TiltCard className="step-card">
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="feature-row">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <TiltCard className="feature-card" maxTilt={7}>
            <h3>Talk, don't type</h3>
            <p>Real voice interview with speech recognition and a spoken AI interviewer.</p>
          </TiltCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }}>
          <TiltCard className="feature-card" maxTilt={7}>
            <h3>Built for your role</h3>
            <p>Questions tailored to the exact job title you give it — technical, behavioral, and background.</p>
          </TiltCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
          <TiltCard className="feature-card" maxTilt={7}>
            <h3>Track your growth</h3>
            <p>Every interview is scored and saved, so you can see yourself improve over time.</p>
          </TiltCard>
        </motion.div>
      </div>

      <motion.div
        className="final-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2>Your next interview starts here.</h2>
        <MagneticButton>
          <Link to="/signup" className="cta-btn">Get started free</Link>
        </MagneticButton>
      </motion.div>
    </div>
  );
}
