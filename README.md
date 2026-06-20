# Mini Project Management Portal

A full-stack, responsive web application built for the **o2h Full Stack Application Developer Fresher Hiring Assessment**. 

This repository implements the **Advanced Version** of the hiring criteria including JWT user sessions, pagination, tasks search/sorting, real-time metrics, dark mode support, and full unit test coverage.

---

## ⚡ Features

### Frontend (React)
- **Dashboard Overview:** Displays user tasks in card layouts with micro-animations.
- **Statistics Dashboard:** Tracks counts for Total, Pending, In Progress, and Completed tasks.
- **Task Search & Filtering:** Filter items by status, sort by creation date, and search text on title and descriptions.
- **Paginated Grid:** Limits task views per page (6 tasks/page) with full controls.
- **Task Validation:** Client-side validations (Title required, Description min 20 characters).
- **Dark Mode Support:** Smooth toggling with local storage theme preservation.
- **Axios Interceptors:** Automatic JWT session attachments and graceful logout handlers.

### Backend (Node.js & Express)
- **JWT Authentication:** Secure password hashing (via `bcryptjs`) and tokens generation.
- **Robust REST API:** Form-validated, authenticated CRUD routes for tasks.
- **Dual-Database Mode:** Zero-config automatic fallback to SQLite if MySQL is offline.
- **Database Migrations:** Automatic table generation (`Users`, `Tasks`) on startup.
- **Green Unit Tests:** Full integration test suites using `Jest` and `Supertest`.

---

## 📂 Project Structure

```
project-root/
├─ backend/
│  ├─ config/        # Database adapter (MySQL/SQLite)
│  ├─ controllers/   # Business logic (Auth & Task handlers)
│  ├─ middleware/    # Auth route guard checks
│  ├─ models/        # Database SQL statement abstractions
│  ├─ routes/        # Router endpoint maps
│  ├─ tests/         # Jest integration tests
│  ├─ server.js      # App bootstrap entry point
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/ # Reuseable UI widgets (Navbar, Card, Stats)
│  │  ├─ pages/      # Pages (Login, Register, Dashboard, AddTask)
│  │  ├─ services/   # Axios API client wrapper
│  │  ├─ App.jsx      # Navigation routing & guards
│  │  ├─ index.css   # Custom CSS theme design system
│  │  └─ main.jsx
│  ├─ index.html
│  └─ package.json
└─ README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- *(Optional)* **MySQL Server** (if running in MySQL mode)

---

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd o2h

# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory (you can copy the provided `.env.example`).

By default, the server runs in **SQLite mode** which creates a local file named `database.sqlite` automatically. **No database server configuration is required to test or run the application immediately.**

#### To Use MySQL:
1. Ensure your MySQL server is running.
2. Update the `backend/.env` file with your credentials:
```env
PORT=5000
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=o2h_portal
JWT_SECRET=super_secret_o2h_jwt_key_2026
JWT_EXPIRES_IN=7d
```
3. The backend will automatically create the database `o2h_portal` and the required tables on boot.

---

### Step 3: Start the Application

You will need to run the backend server and frontend dev server in separate terminal windows.

#### Start Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend:
```bash
cd frontend
npm run dev
# React app runs on http://localhost:5173
```

---

## 🧪 Running Unit Tests

The backend includes a suite of integration tests that verify database queries, input validations, security locks, and API outcomes. They run using an isolated SQLite instance for fast, isolated runs.

```bash
cd backend
npm run test
```

---

## 📖 API Documentation

All routes (except Auth `login` & `register`) require authorization via a **Bearer Token** inside the `Authorization` header.

### 🔐 Authentication Routes

#### Register User
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

#### Login User
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):** *(returns matching register response)*

---

### 📋 Task Management Routes
*(Requires `Authorization: Bearer <token>`)*

#### Create Task
- **Endpoint:** `POST /api/tasks`
- **Request Body:**
  ```json
  {
    "title": "Design Database Schema",
    "description": "Establish standard SQL schemas for tasks and authentication tables.",
    "status": "Pending"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": 1,
      "title": "Design Database Schema",
      "description": "Establish standard SQL schemas for tasks and authentication tables.",
      "status": "Pending",
      "user_id": 1
    }
  }
  ```

#### Get All Tasks
- **Endpoint:** `GET /api/tasks`
- **Query Parameters:**
  - `status`: Filter by `Pending`, `In Progress`, or `Completed` (Optional)
  - `search`: Case-insensitive search on title/description (Optional)
  - `sortBy`: `newest` or `oldest` (Optional)
  - `page`: Page index (Default: 1)
  - `limit`: Task count per page (Default: 6)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "totalTasks": 8,
      "totalPages": 2,
      "currentPage": 1,
      "limit": 6
    }
  }
  ```

#### Update Task Status
- **Endpoint:** `PUT /api/tasks/:id`
- **Request Body:**
  ```json
  {
    "status": "Completed"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task status updated successfully",
    "data": { "id": "1", "status": "Completed" }
  }
  ```

#### Delete Task
- **Endpoint:** `DELETE /api/tasks/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

#### Get Dashboard Statistics
- **Endpoint:** `GET /api/tasks/stats`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total": 5,
      "pending": 2,
      "inProgress": 1,
      "completed": 2
    }
  }
  ```

---

## 📝 Assumptions & Notes
1. **Scope of SQLite database file:** SQLite writes tables locally inside `backend/database.sqlite` when `DB_TYPE` is not set or set to `sqlite`.
2. **Cascading Deletions:** If a user deletes their account (or is deleted), all tasks assigned to that user ID are deleted cascade style.
3. **Responsive grid break points:** UI is tailored for mobile (under 768px) and web browsers.
