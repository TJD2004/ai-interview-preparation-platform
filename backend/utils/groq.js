const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile'; // free, open-source (Meta Llama), served by Groq

function buildSystemPrompt(role, questionCount) {
  return `You are an experienced, friendly interviewer conducting a realistic mock interview for the role of "${role}".

Rules you must always follow:
- Ask ONE question at a time. Never ask multiple questions in a single message.
- Keep each question short and natural, like something a real interviewer would say out loud.
- After the candidate answers, give a brief one-sentence acknowledgement, then ask the next question. Occasionally follow up directly on something they said.
- Ask a total of ${questionCount} questions covering a natural mix of: introduction/background, role-specific technical or skill questions, and behavioral questions relevant to "${role}".
- Do not number the questions or say things like "Question 3".
- After the candidate has answered the ${questionCount}th question, do NOT ask another question. Instead reply with ONLY this exact format:
FEEDBACK_START
Overall Score: X/10
Strengths: <2-3 sentences>
Areas to Improve: <2-3 sentences>
Summary: <2-3 sentence overall summary and encouragement>
FEEDBACK_END
- Never mention that you are an AI. Stay in character as a human interviewer at all times until the feedback.`;
}

async function getAIReply(role, questionCount, messages) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in backend/.env');
  }

  const payload = {
    model: MODEL,
    messages: [{ role: 'system', content: buildSystemPrompt(role, questionCount) }, ...messages],
    temperature: 0.7,
    max_tokens: 400
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function getGroqCompletion(systemPrompt, userMessage, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in backend/.env');
  }

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 900
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { getAIReply, getGroqCompletion };
