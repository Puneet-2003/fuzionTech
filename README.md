# 🏗️ Project Architecture

## 📁 Folder Structure


fusiontecz-assignment/
├── client/ # React Frontend
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # Reusable UI (KanbanBoard, TaskCard)
│ │ │ ├── common/ # Button, Modal, Alert
│ │ │ └── kanban/ # BoardColumn, TaskItem
│ │ ├── pages/ # Route components
│ │ │ ├── Dashboard.tsx # Project list
│ │ │ ├── ProjectPage.tsx # Kanban board
│ │ │ ├── Login.tsx
│ │ │ └── Signup.tsx
│ │ ├── store/ # Zustand stores
│ │ │ ├── projectStore.ts # Projects state
│ │ │ └── taskStore.ts # Tasks state
│ │ ├── hooks/ # Custom hooks
│ │ │ ├── useProjects.ts
│ │ │ └── useTasks.ts
│ │ ├── services/ # API calls
│ │ │ └── api.ts # Axios instance
│ │ ├── types/ # TypeScript interfaces
│ │ └── utils/ # Helpers
│ ├── package.json
│ └── tailwind.config.js
│
├── server/ # Node.js Backend
│ ├── src/
│ │ ├── middleware/ # Request handlers
│ │ │ ├── auth.ts # JWT verification
│ │ │ ├── rbac.ts # Role-based access
│ │ │ └── validation.ts # Zod schemas
│ │ ├── models/ # MongoDB schemas
│ │ │ ├── Project.ts
│ │ │ ├── Task.ts
│ │ │ ├── Activity.ts
│ │ │ └── User.ts
│ │ ├── controllers/ # Business logic
│ │ │ ├── authController.ts
│ │ │ ├── projectController.ts
│ │ │ └── taskController.ts
│ │ ├── routes/ # API routes
│ │ │ ├── auth.ts
│ │ │ ├── projects.ts
│ │ │ └── tasks.ts
│ │ ├── utils/ # Helpers
│ │ │ ├── errors.ts # Custom errors
│ │ │ └── validators.ts # Zod schemas
│ │ └── index.ts # Server entry
│ ├── package.json
│ └── tsconfig.json
│
├── .env.example
├── .gitignore
└── README.md


## 🔄 Data Flow

User Action (Drag Task)
↓
Optimistic UI Update (Zustand)
↓
API Call (POST /api/tasks/:id)
↓
Middleware Chain:

JWT Auth ✓

Project RBAC ✓

Task Validation ✓

State Transition ✓
↓
Controller:

Find task → Check permissions

Validate state (BACKLOG→IN_PROGRESS)

Update task

Create activity log
↓
MongoDB Atlas (Indexed queries)
↓
Response → Zustand → UI Update


## 🛡️ Middleware Stack

Every API Request:
┌─────────────────────────────────────┐
│ 1. CORS │
│ 2. Rate Limiting │
│ 3. Helmet (Security Headers) │
│ 4. JWT Auth → userId │
│ 5. Project RBAC → owner/member │
│ 6. Zod Validation → sanitized data │
│ 7. Controller Logic │
└─────────────────────────────────────┘


## 📊 Database Schema

Project {
_id, name, description, owner, members[], createdAt
}

Task {
_id, title, description, status, priority,
assignee, projectId, createdBy, createdAt
}

Activity {
_id, taskId, action, userId, oldValues, newValues, createdAt
}


## ⚙️ Key Architectural Decisions

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend State** | Zustand | Zero-boilerplate, devtools, server-state sync |
| **API Client** | Axios | Interceptors, TypeScript, retry logic |
| **Validation** | Zod | Type-safe, inference, runtime+compile-time |
| **Styling** | Tailwind | Utility-first, no CSS bloat, responsive |
| **Backend** | Express + TS | Familiar, middleware ecosystem |
| **ORM** | Mongoose | Schema validation, population, TypeScript |
| **Auth** | JWT + bcrypt | Stateless, secure, scalable |

## 🚀 Deployment Ready

Development: npm run dev (both client/server)
Production:
client → npm run build → serve static
server → npm run build → npm start



**Clean, scalable, production-grade architecture matching Fusiontecz requirements!** 🎯
