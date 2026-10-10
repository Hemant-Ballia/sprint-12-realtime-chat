# Sprint 12: Real-Time Chat Application

This is the assignment for Sprint 12: Real-Time Systems & UI Isolation, Track B: Fullstack Developers.

It implements a minimal real-time chat application using React, Vite, Node.js, Express, and Socket.io.

## Features
- **Real-Time Messaging**: Bidirectional real-time communication.
- **Username Authentication**: Users must enter a valid username before connecting.
- **Channel Segregation**: Two distinct chat rooms ("General" and "Tech Support") with strict message and typing isolation.
- **Typing Indicators**: Real-time typing status visible to other users in the same room.

## Architecture
- **Frontend**: React SPA built with Vite. Uses standard `socket.io-client` with manual connection management.
- **Backend**: Node.js and Express server with `socket.io`. Uses in-memory structures to track active typing users and rooms.
- **Deployment Ready**: Fully configured for production environments via `.env` files and parameterized URLs.

## Requirements Checklist
- [x] React SPA and Node.js/Express backend using Socket.io
- [x] Bidirectional real-time messaging displayed in the UI
- [x] Username required before connecting
- [x] Messages formatted as `[Username]: message`
- [x] Typing indicators visible to other users
- [x] General and Tech Support rooms with strict message and typing isolation
- [x] Prompts.md documenting the actual prompt strategy used
- [x] README.md with setup, architecture, scripts, environment variables, testing, and deployment instructions

## Environment Variables

### Backend (`backend/.env`)
- `PORT`: Port on which the Express server listens (default: `5000`).
- `CLIENT_URL`: URL of the frontend application for CORS configuration (default: `http://localhost:5173`).

### Frontend (`frontend/.env`)
- `VITE_SOCKET_URL`: URL of the backend socket server (default: `http://localhost:5000`).

## Setup and Installation

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure Environment Variables:
   - Copy `frontend/.env.example` to `frontend/.env`
   - Copy `backend/.env.example` to `backend/.env`
   - Update variables as necessary for your environment.

## Running the Application Locally

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## Scripts

### Frontend
- `npm run dev`: Start Vite development server.
- `npm run build`: Build production assets.
- `npm run lint`: Run Oxlint to check code quality.
- `npm run preview`: Preview production build locally.

### Backend
- `npm start`: Start the Express/Socket.io server.
- `npm run dev`: Start the server in watch mode.

## Testing
- The backend contains an `/api/health` HTTP endpoint for liveness checks.
- Comprehensive programmatic Socket.io testing verifies cross-room isolation, rejected connections, typing scope boundaries, and message identity spoofing.

## Deployment
1. Set the respective environment variables (`CLIENT_URL` on the backend, `VITE_SOCKET_URL` on the frontend) in your production hosting environments (e.g., Vercel, Render).
2. The frontend is a static React site built via `npm run build` which produces a `/dist` directory.
3. The backend runs as a stateful standard Node.js application (`npm start`). Ensure your hosting platform supports WebSockets.
