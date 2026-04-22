# TaskFlow

TaskFlow is a modern fullstack task management application built to showcase junior fullstack developer skills through a real-world product workflow. This project demonstrates authentication, CRUD operations, dashboard analytics, filtering, search, relational database design, and responsive UI development.

## Live Features

- User registration and login
- Secure password hashing with bcrypt
- Protected dashboard with cookie-based authentication
- Create, edit, update, and delete tasks
- Task status management: `TODO`, `IN_PROGRESS`, `DONE`
- Task priority management: `LOW`, `MEDIUM`, `HIGH`
- Due date support
- Search tasks by title
- Filter tasks by status
- Filter tasks by priority
- Overdue task badge
- Toast notifications
- Dark mode toggle
- Responsive modern UI

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Cookie-based auth
- **Notifications:** Sonner
- **Icons:** Lucide React
- **Security:** bcrypt

## Project Goals

This project was built as a portfolio-ready fullstack application to demonstrate:

- frontend and backend integration
- authentication flow
- full CRUD implementation
- relational database modeling
- reusable UI patterns
- dashboard and analytics design
- responsive product-focused interface

## Core Features

### Authentication
- Register a new account
- Login with existing credentials
- Logout securely
- Restrict dashboard access to authenticated users

### Task Management
- Add a new task
- Edit task details
- Delete a task
- Update task status
- Set task priority
- Set task due date

### Dashboard Experience
- Summary cards for task stats
- Completion progress bar
- Search and filter controls
- Overdue task highlighting
- Dark mode support
- Responsive layout for desktop and mobile

## Database Schema

### User
- `id`
- `name`
- `email`
- `password`
- `createdAt`

### Task
- `id`
- `title`
- `description`
- `status`
- `priority`
- `dueDate`
- `createdAt`
- `updatedAt`
- `userId`

## Folder Structure

```text
taskflow-app/
├─ app/
│  ├─ api/
│  │  ├─ login/
│  │  ├─ logout/
│  │  ├─ register/
│  │  └─ tasks/
│  ├─ dashboard/
│  ├─ login/
│  ├─ register/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ prisma/
│  └─ schema.prisma
├─ src/
│  └─ lib/
│     ├─ auth.ts
│     ├─ prisma.ts
│     └─ validations.ts
├─ .env
├─ middleware.ts
├─ prisma.config.ts
└─ tsconfig.json