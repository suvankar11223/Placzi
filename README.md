# Placzi: Elite AI Resume Architect

Placzi is not just a resume builder; it's an AI-driven career strategist. By integrating Llama-3 (via Groq) and Gemini, it analyzes job descriptions and transforms your work history into an ATS-crushing document in seconds.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://your-live-demo-link) • [![Report Bug](https://img.shields.io/badge/Report%20Bug-Issue-red)](https://github.com/suvankar11223/Placzi/issues) • [![Request Feature](https://img.shields.io/badge/Request%20Feature-Issue-green)](https://github.com/suvankar11223/Placzi/issues)

## 💎 Premium Features

| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| 🧠 Neural Strategist | An AI Agent that decides whether to rewrite bullets, match ATS requirements, or perform skill gap analysis. |
| ⚡ Instant Live-Preview | See your resume update in real-time as you type or accept AI suggestions. |
| 🎨 Dynamic Theming   | Switch between professional templates and customize colors/spacing with a single click. |
| 🛡️ Secure Vault      | Industry-standard JWT & Bcrypt protection for your personal data and resume history. |
| 📦 Docker Ready      | One-command deployment for development and production environments. |

## 🛠️ Architecture Overview

Placzi uses a decoupled architecture where the Frontend handles the heavy lifting of real-time rendering, and the Backend acts as the orchestrator for AI logic and persistent storage.

## ⚙️ Installation

### 1️⃣ Clone & Enter

```bash
git clone https://github.com/suvankar11223/Placzi.git
cd Placzi
```

### 2️⃣ Environment Setup

Create these files to connect the "brain" of the application:

#### 📂 Backend/.env

```
MONGODB_URI=your_uri
GROQ_API_KEY=gsk_your_key
JWT_SECRET_KEY=your_secret
ALLOWED_SITE=http://localhost:5173
```

#### 📂 Frontend/.env.local

```
VITE_GEMINI_API_KEY=your_key
VITE_APP_URL=http://localhost:5001/
```

## 🚀 Execution Modes

### Option A: The Docker Way (Fastest)

```bash
cd Backend
docker-compose up -d
cd ../Frontend && npm install && npm run dev
```

### Option B: Manual Setup

#### Frontend:
```bash
cd Frontend && npm install && npm run dev
```

#### Backend:
```bash
cd Backend && npm install && npm run dev
```

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
