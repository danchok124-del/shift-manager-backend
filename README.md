# Shift Management System

A comprehensive web application for shift scheduling, department management, and employee attendance tracking.

## 🎯 Overview

This project is a full-stack shift management system built for the BI-TWA semester project. It allows organizations to:
- Schedule and manage work shifts
- Track employee attendance
- Manage departments and user roles
- Handle shift assignments and approvals
- Provide detailed work reports

## 🏗️ Tech Stack

### Backend
- **NestJS** - Enterprise-grade Node.js framework
- **TypeORM** - Advanced database ORM
- **PostgreSQL** - Production database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **TypeScript** - Strict typing throughout

### Frontend  
- **React 18** - Modern UI library
- **TypeScript** - Type-safe frontend code
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **SCSS Modules** - Component-scoped styling
- **No CSS frameworks** - Custom, original design

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PostgreSQL** 12+
- **npm** or **yarn**

### 1. Database Setup

```sql
CREATE DATABASE shift_management;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and fill in your database credentials and generate a strong JWT secret
# JWT_SECRET generation: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install dependencies
npm install

# Run database migrations (if available)
npm run typeorm migration:run

# Seed database with sample data
npm run seed

# Start development server
npm run start:dev
```

Backend runs at: **http://localhost:3000**

### 3. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env if needed (default API URL is http://localhost:3000/api)

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 👥 Test Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| HR Admin | hr@example.com | password123 |
| Manager (Kitchen) | chef@example.com | password123 |
| Manager (Front Desk) | manager@example.com | password123 |
| Employee | john@example.com | password123 |
| Employee | jane@example.com | password123 |

## 🔐 User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Unauthenticated** | View public shifts, register, login |
| **Employee** | Sign up for shifts, manage availability, view personal schedule and attendance |
| **Manager** | Create shifts for department, assign employees, view department reports |
| **HR** | Full access - manage departments, users, skills, view all attendance |

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Users
- `GET /api/users` - List users (with filtering)
- `GET /api/users/me` - Current user profile
- `GET /api/users/:id` - User details
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/schedule?startDate&endDate` - User schedule
- `GET /api/users/:id/report?month&year` - Monthly work report

### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department (Manager/HR)
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `POST /api/departments/:id/users` - Add user to department
- `DELETE /api/departments/:id/users/:userId` - Remove user from department

### Shifts
- `GET /api/shifts` - List shifts (with filters)
- `GET /api/shifts/public` - Public shifts available for signup
- `GET /api/shifts/:id` - Shift details
- `POST /api/shifts` - Create shift (Manager/HR)
- `PUT /api/shifts/:id` - Update shift
- `DELETE /api/shifts/:id` - Delete shift
- `POST /api/shifts/:id/assign` - Assign user to shift
- `DELETE /api/shifts/:id/assign/:userId` - Remove assignment

### Attendance
- `POST /api/attendance/clock-in` - Clock in (for hardware devices)
- `POST /api/attendance/clock-out` - Clock out (for hardware devices)
- `POST /api/attendance/manual-clock-in` - Manual web clock-in
- `POST /api/attendance/manual-clock-out` - Manual web clock-out
- `GET /api/attendance/my` - Personal attendance records
- `GET /api/attendance` - All attendance (Manager/HR)

### Skills
- `GET /api/skills` - List skills
- `POST /api/skills` - Create skill
- `GET /api/skills/user/:userId` - User skills
- `POST /api/skills/user/:userId` - Assign skill to user

## 📁 Project Structure

```
shift-management-system/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── users/             # User management
│   │   ├── departments/       # Department CRUD
│   │   ├── shifts/            # Shift scheduling
│   │   ├── attendance/        # Time tracking
│   │   ├── skills/            # Skills management
│   │   ├── entities/          # TypeORM entities
│   │   ├── app.module.ts      # Main application module
│   │   ├── main.ts            # Application entry point
│   │   └── seed.ts            # Database seeding script
│   ├── .env.example           # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── common/        # Buttons, cards, badges, etc.
│   │   │   ├── auth/          # Auth-related components
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── users/         # User components
│   │   │   ├── departments/   # Department components
│   │   │   ├── shifts/        # Shift components
│   │   │   └── attendance/    # Attendance components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context providers
│   │   ├── types/             # TypeScript type definitions
│   │   ├── styles/            # Global SCSS styles
│   │   └── App.tsx            # Root component
│   ├── .env.example           # Environment template
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🛠️ Development

### Backend Scripts
```bash
npm run start:dev    # Development mode with hot-reload
npm run build        # Production build
npm run start:prod   # Run production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run seed         # Seed database with test data
```

### Frontend Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Environment variable validation
- CORS protection
- Input validation with class-validator
- SQL injection protection via TypeORM

## ♿ Accessibility

- Semantic HTML5 markup
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 375px, 768px, 1024px, 1920px
- Touch-friendly controls (44x44px minimum)
- Responsive navigation
- Print stylesheet included

## 🧪 Testing

```bash
# Backend
cd backend
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report

# Frontend
cd frontend
npm run test           # Component tests
```

## 📄 License

This is a university semester project for BI-TWA course.

## 👨‍💻 Author

**BI-TWA Semester Project**  
Czech Technical University in Prague

---

## 📝 Additional Notes

### Hardware Simulation
The system includes endpoints for hardware clock-in devices:
- Devices send `cardId` to `/api/attendance/clock-in` and `/api/attendance/clock-out`
- Server verifies the user has a scheduled shift
- Manual web-based clock-in/out is available for authenticated users

### Environment Variables
All sensitive configuration is externalized to `.env` files. Never commit actual `.env` files - use `.env.example` templates instead.

### Database Migrations
TypeORM synchronization is enabled in development (`synchronize: true`). For production, use proper migrations:
```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

### CORS Configuration
The backend accepts requests from the frontend URL specified in `CORS_ORIGIN` environment variable.
