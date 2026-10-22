# Smart Competency — AI Student Career Readiness Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://sqlite.org/)

**Smart Competency** is an AI-powered student competency assessment, personalized career development, and campus placement readiness platform. It empowers college students to diagnose technical and cognitive skill gaps, follow personalized learning paths, solve algorithmic challenges, prepare for technical interviews, and maximize placement readiness.

---

## 🌟 Key Modules & Capabilities

- **🎯 Transparent Placement Readiness Engine:** Calculates a multi-pillar readiness index across 8 transparent weighted indicators (Technical Proficiency, Algorithmic Coding, Aptitude & Logic, Communication, Resume Strength, Projects, Mock Interviews, and Daily Consistency).
- **📊 Interactive Skill Matrix & Gap Analysis:** Identifies competency deltas against specific target roles (*Full Stack, Backend, Frontend, AI/ML, Data Analyst, Cloud/DevOps, Cybersecurity*).
- **💻 Coding Lab:** In-browser coding environment supporting multiple programming languages, syntax highlighting, test case runner, and LeetCode-style problem categories.
- **🤖 AI Career Coach:** Conversational AI coach providing tailored career advice, resume tips, and interview walkthroughs.
- **📄 Resume ATS Analyzer:** Live ATS score checker, missing keyword detector, action verb recommender, and structural improvement suggestions.
- **📅 Today's Action Plan:** Dynamic micro-tasks scheduled to eliminate prioritized skill gaps, accompanied by daily consistency streak tracking and confetti celebration.
- **🏆 Campus Leaderboard & Badges:** Departmental and institutional student standings featuring a top-3 podium and unlockable achievement honors.
- **🏛️ Placement Cell / Admin Portal:** Institutional dashboard for placement directors and deans, featuring cohort readiness distributions, departmental skill deficit analytics, student roster, CSV export, and assessment question authoring.
- **⚡ 1-Click Demo Personas:** Seamlessly switch between **Alex Chen (Student Persona)** and **Dr. Sarah Jenkins (Placement Director Admin)**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router 7, Lucide Icons, Canvas Confetti |
| **Styling** | Vanilla CSS Design System with dark glassmorphic SaaS theme |
| **Backend** | Node.js, Express, TypeScript (`tsx`) |
| **Database** | SQLite via `better-sqlite3`, auto-seeding on boot |
| **Auth & Security** | JWT (JSON Web Tokens), `bcryptjs` password hashing |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Akalyadevi-Thangavel/Smart-Competency.git
cd Smart-Competency
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

### 4. Running the Development Server
Run both the backend API and the Vite frontend simultaneously:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
```bash
# Terminal 1: Backend API & SQLite Database
npm run server:dev   # Runs on http://localhost:5000

# Terminal 2: Vite Client with Hot Reload
npm run client:dev   # Runs on http://localhost:5173
```

- Open **[http://localhost:5173](http://localhost:5173)** in your browser.
- Backend health check: **[http://localhost:5000/api/health](http://localhost:5000/api/health)**.

---

## 📂 Project Structure

```
Smart_Competency/
├── server/                      # Express backend & SQLite database
│   ├── db/                      # Database schema, seed data, and connection
│   ├── middleware/              # JWT auth and role check middleware
│   ├── routes/                  # REST APIs (auth, user, skills, coding, admin, etc.)
│   ├── services/                # Competency & skill gap calculation engine
│   └── index.ts                 # Server entry point
├── src/                         # React frontend
│   ├── components/              # UI components (Buttons, Cards, Badges, Charts)
│   ├── context/                 # Auth, Theme, and Notification contexts
│   ├── pages/                   # Application pages (Dashboard, CodingLab, Admin, etc.)
│   ├── services/                # API client
│   ├── types/                   # TypeScript interfaces
│   ├── App.tsx                  # Main router and shell layout
│   └── main.tsx                 # React DOM mount point
├── dist/                        # Production client build
├── Prompt.md                    # Master platform specification
└── package.json
```

---

## 📄 License
This project is licensed under the MIT License.
