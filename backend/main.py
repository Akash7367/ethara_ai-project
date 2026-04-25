from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas
from database import SessionLocal, engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to HRMS Lite API"}

# Employee Endpoints
@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Clean inputs
    employee.employee_id = employee.employee_id.strip()
    employee.email = employee.email.strip()
    
    # Check for duplicate Employee ID
    db_employee = crud.get_employee_by_id(db, employee_id=employee.employee_id)
    if db_employee:
        raise HTTPException(
            status_code=400, 
            detail="employee already exist with this empid please enter differnent empid"
        )
    
    # Check for duplicate Email
    db_email = crud.get_employee_by_email(db, email=employee.email)
    if db_email:
        raise HTTPException(status_code=400, detail="An employee with this email already exists.")
    
    return crud.create_employee(db=db, employee=employee)

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = crud.get_employees(db, skip=skip, limit=limit)
    return employees

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    success = crud.delete_employee(db, employee_id=employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}

# Attendance Endpoints
@app.post("/attendance/", response_model=schemas.Attendance)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    db_employee = crud.get_employee_by_id(db, employee_id=attendance.employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.mark_attendance(db=db, attendance=attendance)

@app.get("/attendance/{employee_id}", response_model=List[schemas.Attendance])
def read_attendance(employee_id: str, db: Session = Depends(get_db)):
    attendance_records = crud.get_attendance_by_employee(db, employee_id=employee_id)
    return attendance_records

@app.get("/dashboard/", response_model=schemas.DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)
