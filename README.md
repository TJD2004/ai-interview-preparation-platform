# 🤖 AI Interview Prep

An AI-powered mock interview platform featuring voice-based interviews, a 3D animated interviewer, aptitude practice, ATS resume analysis, Google authentication, and detailed reports.

Powered by **Groq's free API** using **Meta Llama 3.3**.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-000000?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Groq](https://img.shields.io/badge/AI-Groq-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# ✨ Features

## 🎤 AI Mock Interview

- Voice-based mock interviews
- AI-generated interview questions
- Speech-to-Text answer capture
- Text-to-Speech AI interviewer
- Follow-up questions
- AI-generated feedback
- Interview scoring
- Interview history

---

## 🤖 3D Animated AI Interviewer

- Low-poly robot avatar
- Idle animation
- Eye blinking
- Listening animation
- Speaking animation
- Animated equalizer mouth
- Built with React Three Fiber

---

## 🧠 Aptitude Practice

Practice from **600 curated aptitude questions** across **40 topics**.

### Logical Reasoning (20 Topics)

- Blood Relations
- Coding-Decoding
- Directions
- Seating Arrangement
- Puzzles
- Series
- Analogy
- Classification
- Statement & Conclusion
- Statement & Assumption
- Cause & Effect
- Syllogism
- Calendar
- Clock
- Ranking
- Alphabet Test
- Data Sufficiency
- Decision Making
- Cubes & Dice
- Mirror & Water Images

### Quantitative Aptitude (20 Topics)

- Percentage
- Profit & Loss
- Time & Work
- Time, Speed & Distance
- Ratio & Proportion
- Average
- Number System
- Simplification
- Simple Interest
- Compound Interest
- Mixture & Alligation
- Partnership
- Permutation & Combination
- Probability
- Mensuration
- Geometry
- Algebra
- HCF & LCM
- Pipes & Cisterns
- Boats & Streams

### Features

- Category Selection
- Topic Selection
- Mixed Mode
- Custom Question Count
- Instant Evaluation
- Topic-wise Accuracy
- Complete Solutions
- Previous Test Reports

---

## 📄 ATS Resume Checker

Supported formats:

- PDF
- DOCX
- TXT

AI provides:

- ATS Score (0–100)
- Resume Summary
- Matched Keywords
- Missing Keywords
- Formatting Issues
- Improvement Suggestions

---

## 👤 Authentication

- Email & Password Login
- Google OAuth Login
- JWT Authentication
- Protected Routes
- Profile Management

---

## 📊 Reports Dashboard

Track complete history of:

- AI Interviews
- Aptitude Tests
- ATS Resume Checks

Includes:

- Overall Score
- Topic Accuracy
- AI Feedback
- Resume Reports

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- React Router
- React Three Fiber
- Tailwind CSS
- Framer Motion

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Multer

## Database

- MongoDB
- Mongoose

## AI

- Groq API
- Meta Llama 3.3

## Authentication

- Google OAuth
- JWT

---

# 📂 Project Structure

```text
AI-Interview-Prep
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   └── assets
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── seed
│   ├── services
│   └── utils
│
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-preparation-platform.git

cd ai-interview-preparation-platform
```

---

## 2. MongoDB Setup

### Local

```text
mongodb://localhost:27017/ai_interview_db
```

### MongoDB Atlas

Create a free MongoDB Atlas cluster and copy the connection string.

No manual database or collection creation is required.

---

## 3. Google OAuth Setup

1. Go to Google Cloud Console.
2. Create an OAuth Client.
3. Add:

```text
http://localhost:5173
```

as an **Authorized JavaScript Origin**.

Copy the generated Client ID.

---

## 4. Groq API Setup

Create a free API key from:

https://console.groq.com

No credit card required.

---

## 5. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure:

```env
GROQ_API_KEY=
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
```

Run:

```bash
npm start
```

Expected output:

```text
MongoDB connected
Server running on http://localhost:5000
```

---

## 6. Seed Aptitude Questions

```bash
cd backend

npm run seed:aptitude
```

Imports:

- 600 Questions
- 40 Topics
- Correct Answers
- Detailed Solutions

---

## 7. Frontend Setup

```bash
cd frontend

npm install
cp .env.example .env
```

Configure:

```env
VITE_GOOGLE_CLIENT_ID=
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🔄 Application Flow

## AI Interview

```text
Login
   │
Choose Role
   │
AI asks Question
   │
Speak Answer
   │
AI Evaluation
   │
Next Question
   │
Final Report
   │
Saved to MongoDB
```

---

## Aptitude Practice

```text
Select Category
      │
Select Topic
      │
Attempt Questions
      │
Submit
      │
Detailed Report
      │
Saved to MongoDB
```

---

## ATS Resume Checker

```text
Upload Resume
      │
Extract Text
      │
Groq AI Analysis
      │
ATS Score
      │
Suggestions
      │
Saved to MongoDB
```

---

# 🗄 Database Collections

| Collection | Description |
|------------|-------------|
| users | User accounts |
| interviewSessions | Interview session details |
| interviewMessages | Chat history |
| aptitudeQuestions | Question bank |
| aptitudeSessions | Aptitude attempts |
| aptitudeAnswers | User answers |
| resumeChecks | ATS reports |

MongoDB `_id` values are transformed into plain `id` strings before being sent to the frontend.

---

# 🔒 Security

- JWT Authentication
- bcrypt Password Hashing
- Google OAuth
- Protected API Routes
- Resume parsing in memory only
- Uploaded files are never stored permanently

---

# 💡 Future Enhancements

- AI HR Interview
- Coding Interview
- Live Coding Editor
- Company-specific Interview Sets
- Certificate Generation
- Leaderboard
- Interview Analytics
- Dark Mode
- Multi-language Support

---

# 📌 Notes

- Powered by **Groq API**
- Uses **Meta Llama 3.3**
- No OpenAI, Claude, or Gemini APIs
- MongoDB Atlas supported
- Resume files are parsed in memory only
- Fully responsive design

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub!
