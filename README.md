# 🛡️ ScamShield AI

### AI-Powered Scam & Phishing Detection Assistant

ScamShield AI is a web-based security assistant that analyzes suspicious messages and URLs using AI to help users identify potential scams before they interact with them.

Instead of simply returning a "safe" or "scam" result, ScamShield explains **why** content may be suspicious by identifying risk factors, scam tactics, and recommended actions.

---

## 🚨 Problem

Online scams increasingly use:

* Urgent messages and threats
* Fake account or KYC warnings
* OTP requests
* Brand impersonation
* Suspicious or deceptive URLs
* Social engineering tactics

Many users may recognize that something feels suspicious but cannot easily determine **which parts of the message are dangerous or what they should do next**.

ScamShield aims to provide an additional layer of analysis by turning suspicious content into an understandable security assessment.

---

## 💡 Solution

ScamShield provides three analysis modes:

### 1. Message Analysis

Users can paste a suspicious message and receive:

* Risk score
* Risk category
* Scam type
* Red flags
* Scam tactics
* AI-generated explanation
* Recommended action

### 2. URL Analysis

Users can submit a suspicious URL to receive an AI-based security assessment including:

* Risk score
* Risk category
* Scam type
* Domain information
* Red flags
* Scam tactics
* Explanation
* Recommended action

### 3. Message + URL Analysis

ScamShield can analyze a suspicious message together with its embedded URL.

This provides additional context by allowing the AI to consider the **message content and the suspicious link together**, rather than treating them as completely separate inputs.

---

## ✨ Key Features

* 🤖 AI-powered scam analysis
* 💬 Suspicious message detection
* 🔗 Suspicious URL analysis
* 🔍 Combined message + URL analysis
* 📊 Percentage-based risk scoring
* 🚨 Red-flag identification
* 🎯 Scam tactic detection
* 🧠 Explainable AI results
* 🛡️ Recommended safety actions
* 🕘 Recent scan history
* 📱 Responsive web interface
* ☁️ Deployed frontend and backend

---

## 🧠 AI Analysis

The application uses the Groq API with the `openai/gpt-oss-20b` model.

The AI is instructed to return structured security analysis containing fields such as:

```text
Risk Score
Risk Category
Scam Type
Red Flags
Scam Tactics
Explanation
Recommended Action
```

The backend processes the AI response and sends structured results to the React frontend.

---

## 🏗️ System Architecture

```text
                 ┌──────────────────────┐
                 │      User Input      │
                 │ Message / URL / Both │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   React Frontend     │
                 │       Vercel         │
                 └──────────┬───────────┘
                            │ HTTPS API
                            ▼
                 ┌──────────────────────┐
                 │   FastAPI Backend    │
                 │       Render         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │      Groq API        │
                 │  AI Security Model   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Structured Analysis  │
                 │ Risk / Flags / Type  │
                 │ Tactics / Explanation│
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   ScamShield UI      │
                 │ Results + History    │
                 └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* Uvicorn

### AI

* Groq API
* `openai/gpt-oss-20b`

### Deployment

* Vercel — Frontend
* Render — Backend

---

## 📁 Project Structure

```text
ScamShield/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔐 Security

API credentials are stored as environment variables on the backend and are not exposed in the frontend or committed to the repository.

The application follows a backend-based API architecture so sensitive API credentials do not need to be placed inside the client-side React application.

---

## 🌐 Live Demo

**Live Application:**
https://scam-shield-ten-olive.vercel.app

**Backend API:**
https://scamshield-api-rc48.onrender.com

**GitHub Repository:**
https://github.com/Sahikk05/ScamShield

---

## 🚀 Future Scope

ScamShield can be extended with:

* Browser extension integration
* Email and SMS analysis
* Multilingual scam detection
* Real-time threat intelligence
* URL reputation services
* Domain and certificate intelligence
* Larger scam datasets for evaluation
* User reporting and community-driven threat intelligence
* Integration with messaging and email platforms

---

## ⚠️ Disclaimer

ScamShield is an AI-assisted security analysis tool and should not be treated as a definitive security authority.

Users should independently verify important financial, account, and identity-related requests through official channels.
