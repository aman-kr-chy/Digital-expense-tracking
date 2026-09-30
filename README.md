# SplitEase 💰

SplitEase is a modern, full-stack expense-sharing web application inspired by Splitwise. It allows users to track balances, add expenses, create groups, and manage friends efficiently. 

## Features

- **Authentication**: Secure JWT-based user login and registration with bcrypt password hashing.
- **Dashboard**: Get a bird's-eye view of your finances: total owed, total others owe you, net balance, and recent activities.
- **Groups**: Create groups for trips, flatmates, or events, and manage shared expenses seamlessly.
- **Friends**: Search users, send friend requests, and track individual balances.
- **Expenses**: Add expenses with a clean UI, categorise them, and split them automatically (equal splitting implemented, other modes supported by schema).
- **Responsive UI**: A modern, beautiful design using Tailwind CSS with glassmorphism effects and micro-animations.

## Tech Stack

**Frontend:**
- React.js (Vite)
- Redux Toolkit (RTK Query)
- Tailwind CSS
- React Router
- Lucide React Icons

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas URI)

### 1. Setup Backend
```bash
cd server
npm install
```
Ensure that you create a `.env` file in the `server` directory (you can copy from `.env.example`).
To populate the database with sample data:
```bash
node seed.js
```
To run the backend server:
```bash
npm run dev
```
*(The server will run on http://localhost:5000)*

### 2. Setup Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*(The app will be accessible at http://localhost:5173)*

---

## 🔑 Test Credentials
If you seeded the database using `node seed.js`, you can log in with:
- **Email:** `aman@example.com`
- **Password:** `password123`

---

## 🚢 Deployment

### Deploying the Backend (Render/Railway/Heroku)
1. Push your code to a GitHub repository.
2. Link your repository to a platform like Render or Railway.
3. Add the environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`) in the platform's dashboard.
4. Set the build command to `npm install` and start command to `node server.js` (Ensure the root directory points to `/server`).

### Deploying the Frontend (Vercel)
1. Import your GitHub repository to Vercel.
2. Select the `/client` directory as the Root Directory.
3. Framework preset should automatically detect "Vite".
4. Add the backend API URL to your environment variables (e.g. `VITE_API_URL`). (You may need to update the `baseUrl` in `client/src/store/slices/apiSlice.js` to use this ENV variable for production).
5. Click **Deploy**.
