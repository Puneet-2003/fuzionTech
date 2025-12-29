# 🚀 Fusiontecz Task Management System

**Advanced MERN Stack Assignment** - Multi-user workflow platform with RBAC, task lifecycle management, and activity tracking.

## ✨ Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| JWT Authentication | ✅ | Secure login/register with bcrypt |
| Role-Based Access | ✅ | Owner/Member permissions |
| Kanban Board | ✅ | Drag & drop tasks |
| Task Lifecycle | ✅ | BACKLOG → IN_PROGRESS → REVIEW → DONE |
| Activity Logging | ✅ | Full audit trail |

## 🏗️ Project Structure

fusiontecz-task-manager/
├── client/ # React Frontend
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── common/ # Button, Modal
│ │ │ └── kanban/ # BoardColumn, TaskCard
│ │ ├── pages/ # Dashboard, ProjectPage
│ │ ├── store/ # Zustand stores
│ │ ├── hooks/
│ │ └── services/
│ └── package.json
│
├── server/ # Node.js Backend
│ ├── src/
│ │ ├── middleware/ # auth, rbac, validation
│ │ ├── models/ # Project, Task, Activity
│ │ ├── controllers/
│ │ └── routes/
│ ├── package.json
│ └── tsconfig.json
│
├── .env.example
├── .gitignore
└── README.md


## 🔄 Request Flow

User Action → Zustand → API Call → Middleware → Controller → MongoDB Atlas


**Middleware Stack:**
1. CORS
2. JWT Auth 
3. RBAC Check
4. Zod Validation
5. Business Logic

## 📊 Task State Machine


BACKLOG → IN_PROGRESS
IN_PROGRESS → REVIEW
REVIEW → DONE (Terminal)

## 🚀 Quick Start

Clone
git clone <repo-url>
cd fusiontecz-task-manager

Backend
cd server && npm install && npm run dev

Frontend (new terminal)
cd client && npm install && npm start


**Access:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 🔧 Environment Setup

**server/.env:**
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fusiontecz
JWT_SECRET=your-super-secret-key

**client/.env:**

## 🌐 Key API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Get JWT |
| GET | `/api/projects` | User | List projects |
| POST | `/api/projects/:id/invite` | Owner | Invite member |
| PUT | `/api/tasks/:id` | Member | Update task |

## 🛡️ Security & Performance

**Security:**
- ✅ bcrypt password hashing
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation (Zod)
- ✅ MongoDB indexes

**Performance:**
- ✅ Pagination (`?page=1&limit=20`)
- ✅ Compound indexes
- ✅ Field projection

## ✅ Fusiontecz Requirements Checklist

- [x] Backend-enforced RBAC
- [x] Strict state transitions
- [x] Activity logging
- [x] Pagination + indexes
- [x] Clean Git history
- [x] No node_modules

---

**Fusiontecz Solutions Assignment** | **Production-Ready**  
**Author: [Your Name]**
