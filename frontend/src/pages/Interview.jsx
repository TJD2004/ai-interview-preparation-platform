import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import BotAvatar from '../components/BotAvatar';

export default function Interview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(location.state?.firstReply || 'Loading your first question...');
  const [answer, setAnswer] = useState('');
  const [interim, setInterim] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(1);
  const questionCount = location.state?.questionCount || 6;

  const recognitionRef = useRef(null);
  const hasSpokenFirst = useRef(false);

  useEffect(() => {
    if (location.state?.firstReply && !hasSpokenFirst.current) {
      hasSpokenFirst.current = true;
      speak(location.state.firstReply);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '', interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + ' ';
        else interimText += t;
      }
      if (finalText) setAnswer(prev => (prev + ' ' + finalText).trim());
      setInterim(interimText);
    };

    recognition.onend = () => {
      if (recognitionRef.current?.shouldContinue) recognition.start();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.shouldContinue = false;
      recognition.stop();
    };
  }, []);

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  function toggleMic() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.shouldContinue = false;
      recognition.stop();
      setListening(false);
    } else {
      recognition.shouldContinue = true;
      setInterim('');
      recognition.start();
      setListening(true);
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || submitting) return;
    if (listening) toggleMic();
    setSubmitting(true);

    try {
      const res = await client.post('/interview/chat', { sessionId: id, message: answer });
      setAnswer('');
      setInterim('');

      if (res.data.finished) {
        navigate(`/report/${id}`);
        return;
      }

      setProgress(p => p + 1);
      setQuestion(res.data.reply);
      speak(res.data.reply);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page interview-stage">
      <Link to="/dashboard" className="stage-exit">← Exit</Link>
      <div className="stage-progress">Question {Math.min(progress, questionCount)} of {questionCount}</div>

      <BotAvatar speaking={speaking} listening={listening} />

      <AnimatePresence mode="wait">
        <motion.p
          className="stage-question"
          key={question}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {question}
        </motion.p>
      </AnimatePresence>

      <div className="stage-answer">
        {interim && <p className="interim-text">{interim}</p>}
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Speak, or type your answer here..."
        />
        <div className="stage-controls">
          <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic}>
            {listening ? '⏹ Stop' : '🎙️ Speak'}
          </button>
          <button className="cta-btn" onClick={submitAnswer} disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit answer'}
          </button>
        </div>
      </div>
    </div>
  );
}
