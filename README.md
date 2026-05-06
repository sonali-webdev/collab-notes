# 📝 CollabNotes — Real-time Collaborative Notes App

A full-stack real-time collaborative notes application where multiple users can create, edit, and share notes simultaneously.

## 🌐 Live Demo

- **Frontend:** https://collab-notes-self.vercel.app
- **Backend:** https://collab-notes-backend-efda.onrender.com

---

## ✨ Features

- 🔐 **Authentication** — Register, Login with JWT tokens
- 📝 **Notes CRUD** — Create, Read, Update, Delete notes
- ⚡ **Real-time Collaboration** — Multiple users edit same note simultaneously
- 🔗 **Share Notes** — Share with Editor or Viewer permissions
- 🔍 **Search Notes** — Search by title or content
- ⭐ **Favorite Notes** — Mark important notes
- 💾 **Auto-save** — Notes save automatically while typing
- 👥 **Active Users** — See who's editing the note live
- 🎨 **Beautiful UI** — Colorful cards, illustrations, responsive design

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React.js + Vite  | Frontend framework      |
| TypeScript       | Type safety             |
| Tailwind CSS     | Styling                 |
| Socket.IO Client | Real-time communication |
| Axios            | API calls               |
| React Router     | Navigation              |

### Backend

| Technology        | Purpose          |
| ----------------- | ---------------- |
| Node.js + Express | Web server       |
| TypeScript        | Type safety      |
| Socket.IO         | WebSocket server |
| Prisma ORM        | Database queries |
| JWT               | Authentication   |
| bcryptjs          | Password hashing |

### Database & Deployment

| Technology        | Purpose          |
| ----------------- | ---------------- |
| PostgreSQL (Neon) | Cloud database   |
| Vercel            | Frontend hosting |
| Render            | Backend hosting  |

---

## 🏗️ Architecture

┌─────────────────┐ ┌──────────────────┐ ┌─────────────┐
│ │ HTTP │ │ │ │
│ React.js │◄───────►│ Node/Express │◄──────►│ PostgreSQL │
│ (Vercel) │ │ (Render) │ │ (Neon) │
│ │◄───────►│ │ │ │
│ Socket.IO │ WS │ Socket.IO │ │ │
│ (client) │ │ (server) │ │ │
└─────────────────┘ └──────────────────┘ └─────────────┘

---

## 🚀 Run Locally

### Prerequisites

- Node.js installed
- PostgreSQL installed (or use Neon cloud)

### Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

Frontend Setup
cd client
npm install
npm run dev

Environment Variables (server/.env)
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
CLIENT_URL=http://localhost:5173

📁 Project Structure

collab-notes/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # ShareModal
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Login, Register, Dashboard, NoteEditor
│   │   ├── services/          # API & Socket setup
│   │   └── types/             # TypeScript types
│   └── package.json
│
└── server/                    # Node.js Backend
    ├── src/
    │   ├── controllers/       # Auth & Note controllers
    │   ├── middleware/        # JWT authentication
    │   ├── routes/            # API routes
    │   ├── socket/            # Socket.IO handlers
    │   ├── types/             # TypeScript types
    │   └── utils/             # Helper functions
    ├── prisma/
    │   └── schema.prisma      # Database schema
    └── package.json


👩‍💻 Developer
Sonali Gupta — Full Stack Developer
```
