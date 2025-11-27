## My Messenger – Quick Start

Run the app locally (React + Vite frontend, Node/Express + Socket.IO backend).

### Prereqs
- Node 18+ and npm 9+

### Install
```bash
cd my-messenger/
npm install            # root deps (frontend/tooling)
cd backend && npm install   # installs express, socket.io, jsonwebtoken, cors, dotenv
```

### Env (backend)
Create `backend/.env`:
```env
JWT_SECRET=superSecretKey
PORT=5000 #or any other port you prefer, also update it in `backend/server.js`
```
Note: CORS is set to `http://localhost:5173` in `backend/server.js`.

### Run
- Backend: `cd backend && npm start` → http://localhost:5000
- Frontend: `cd .. && npm run dev` → http://localhost:5173


### Troubleshooting
- Ports: backend 5000, frontend 5173 (change `PORT` or `--port`)
- CORS: if ports change, update origin in `backend/server.js`
- 401: include `Authorization: Bearer <token>` from signup/login
