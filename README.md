# StudyAI 🎓

Upload lecture files → Get instant summaries, flashcards, MCQ quizzes & practice questions.

**Stack:** React (Vite) + Flask (Python) + Claude AI

---

## Project Structure

```
studyai/
├── backend/
│   ├── app.py              ← Flask API
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── components/
    │       ├── Uploader.jsx
    │       ├── Summary.jsx
    │       ├── Flashcards.jsx
    │       ├── Quiz.jsx
    │       └── ShortQuestions.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
```

Set your Anthropic API key:
```bash
# Mac/Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows
set ANTHROPIC_API_KEY=sk-ant-...
```

Run the server:
```bash
python app.py
```
Backend runs at → http://localhost:5000

---

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → http://localhost:3000

---

## Features

| Feature | Description |
|---|---|
| 📤 Upload | PDF, DOCX, TXT or paste text |
| 📌 Summary | 5+ bullet point key takeaways |
| 🧠 Flashcards | 8 flip cards with Q&A |
| ❓ Quiz | 10 MCQs with scoring + explanations |
| ✍️ Practice | 5 short-answer questions with sample answers |

---

## Get Your API Key

1. Go to https://console.anthropic.com
2. Create account → API Keys → New Key
3. Copy and set as `ANTHROPIC_API_KEY`

---

## Deploy

**Backend:** Railway, Render, or any Python host
**Frontend:** Vercel (`npm run build` → deploy `dist/` folder)

Make sure to update the API URL in `App.jsx` when deploying:
```js
// Change this line in App.jsx:
const res = await fetch("http://localhost:5000/api/process", ...
// To your deployed backend URL:
const res = await fetch("https://your-backend.railway.app/api/process", ...
```
