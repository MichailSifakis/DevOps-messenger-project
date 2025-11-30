# My Messenger - Real-Time Chat Application

A full-stack real-time messaging application built with React, Node.js, MongoDB, and Socket.IO. Features include user authentication, real-time messaging, contact management, and comprehensive DevOps practices.

[![Test Coverage](https://img.shields.io/badge/coverage-72%25-brightgreen.svg)](backend/coverage/lcov-report/index.html)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue.svg)](.github/workflows)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](docker-compose.yml)

## 🌟 Live Demo

- **Frontend**: [http://messenger-app-ms-17326.northeurope.azurecontainer.io](http://messenger-app-ms-17326.northeurope.azurecontainer.io)
- **Backend API**: [http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000](http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000)
- **Health Check**: [/health](http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000/health)
- **Metrics**: [/metrics](http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000/metrics)

## 🚀 Features

- **Real-time Messaging**: Socket.IO for instant message delivery
- **User Authentication**: JWT-based secure authentication
- **Contact Management**: Add and manage contacts by unique code
- **Conversation History**: Persistent message threads with MongoDB
- **Search Functionality**: Search through message history
- **Responsive Design**: WhatsApp-inspired dark theme UI
- **Health Monitoring**: Built-in health checks and Prometheus metrics
- **Containerized**: Docker and Docker Compose ready
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running Locally](#-running-locally)
- [Running with Docker](#-running-with-docker)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Monitoring](#-monitoring)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

## 🔧 Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and **Docker Compose** (for containerized deployment)
- **MongoDB** 7.0+ (or use Docker)
- **Azure CLI** (optional, for cloud deployment)

## 📦 Installation

### Clone the Repository

```bash
git clone https://github.com/MichailSifakis/DevOps-messenger-project$0
cd my-messenger
```

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/messenger
JWT_SECRET=supersecretkey
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost
```

### Frontend Environment Variables

Create `.env` in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running Locally

### Option 1: With Local MongoDB

**Step 1: Start MongoDB**

Using Docker:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7
```

Or install MongoDB locally:
- macOS: `brew install mongodb-community@7.0 && brew services start mongodb-community@7.0`
- Ubuntu: `sudo apt-get install mongodb`
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

**Step 2: Start Backend**

```bash
cd backend
npm start
```

Backend runs at: **http://localhost:5000**

**Step 3: Start Frontend**

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Option 2: With Docker Compose (Recommended)

```bash
docker-compose up --build
```

Services:
- **Frontend**: http://localhost
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Prometheus**: http://localhost:9090

Stop services:
```bash
docker-compose down
```

## 🐳 Running with Docker

### Build Images

```bash
cd backend
docker build -t messenger-backend:latest .
cd ..
docker build -t messenger-frontend:latest .
```

### Run Containers
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7
docker run -d --name backend -p 5000:5000 -e MONGO_URI=mongodb://host.docker.internal:27017/messenger messenger-backend:latest
docker run -d --name frontend -p 80:80 messenger-frontend:latest
```

## 🧪 Testing

### Run All Tests

```bash
cd backend
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

Coverage report: `backend/coverage/lcov-report/index.html`

### Current Test Coverage

```
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   72.41 |    61.11 |   68.88 |   73.19 |
```

## 🚀 Deployment

### Automated Deployment (GitHub Actions)

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will:
1. Run tests
2. Check coverage (≥70%)
3. Build Docker images
4. Push to Azure Container Registry
5. Deploy to Azure Container Instances

### Manual Deployment to Azure

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📚 API Documentation

### Authentication

**POST `/api/users/signup`** - Create account\
**POST `/api/users/login`** - Login

### Messages

**POST `/api/messages`** - Send message\
**GET `/api/messages/thread?a=CODE1&b=CODE2`** - Get conversation\
**GET `/api/messages/conversations?code=CODE`** - List conversations\
**DELETE `/api/messages/thread?a=CODE1&b=CODE2`** - Delete thread

### Contacts

**POST `/api/contacts`** - Add contact\
**GET `/api/contacts?ownerCode=CODE`** - List contacts\
**DELETE `/api/contacts`** - Remove contact

### Monitoring

**GET `/health`** - Health status\
**GET `/metrics`** - Prometheus metrics

## 📊 Monitoring

### Prometheus

Access: http://localhost:9090

**Metrics:**
- `requests_total` - Total HTTP requests
- `errors_total` - HTTP errors (4xx, 5xx)
- `http_request_duration_ms` - Average latency
- `process_uptime_seconds` - Server uptime

### Health Checks

```bash
curl http://localhost:5000/health
curl http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000/health
```

## 📁 Project Structure

```
my-messenger/
├── .github/workflows/      # CI/CD pipelines
├── backend/
│   ├── __tests__/          # 76 automated tests
│   ├── middleware/         # Auth, errors, metrics
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Helper functions
│   └── server.js           # Express + Socket.IO
├── src/                    # React frontend
├── docker-compose.yml      # Multi-container setup
├── Dockerfile              # Frontend container
├── prometheus.yml          # Monitoring config
└── deploy.sh               # Deployment script
```

## 🐛 Troubleshooting

### Port Conflicts
```bash
PORT=5001  # Change in backend/.env
npm run dev -- --port 5174
```

### MongoDB Connection Failed
```bash
docker ps | grep mongo
docker restart mongodb
```

### Socket.IO Not Working
Check browser console and verify backend URL in \`src/App.jsx\`

### 401 Unauthorized
Clear localStorage and login again

### Coverage Below 70%
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## 👨‍💻 Author

Created as part of DevOps course assignment. AI assisted for formatting and solving issues.

## 🙏 Acknowledgments

- MongoDB, Socket.IO, Express.js, React, Vite
- Docker, GitHub Actions, Azure

---