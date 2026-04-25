# HRMS Lite - Human Resource Management System

A lightweight, professional Human Resource Management System built for an end-to-end full-stack development assessment.

## Submission Details
- **Live Application URL**: https://etharaai-project-production-19ef.up.railway.app/
- **GitHub Repository Link**: https://github.com/Akash7367/ethara_ai-project

## Features

### 1. Employee Management
- **Add Employee**: Create new records with unique Employee ID, Name, Email, and Department.
- **View Records**: A clean, sortable table view of all employees.
- **Delete Records**: Remove employee data from the system.
- **Validations**: Server-side checks for unique IDs and valid email formats.

### 2. Attendance Management
- **Mark Attendance**: Log daily presence (Present/Absent) for any employee.
- **Attendance History**: View historical attendance records for specific employees via a slide-out panel.

### 3. Dashboard (Bonus)
- **Real-time Stats**: Total employees and today's attendance summary.
- **Department Breakdown**: Visual summary of employee distribution across departments.

## Tech Stack

- **Frontend**: React.js (Vite), Vanilla CSS (Custom Design System), Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy ORM.
- **Database**: SQLite (Local file-based persistence).
- **API**: RESTful architecture with Pydantic validation.

## Steps to Run Locally

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Assumptions & Limitations
- **Authentication**: As per the assessment requirements, the system assumes a single admin user and does not implement login/signup.
- **Data Persistence**: Uses SQLite for simplicity in local evaluation. In a production environment, PostgreSQL or MySQL would be recommended.
- **Concurrency**: SQLite is configured for single-threaded access for local stability.
