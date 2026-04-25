from sqlalchemy.orm import Session
import models, schemas
from datetime import date

def get_employee_by_id(db: Session, employee_id: str):
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: str):
    db_employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
        return True
    return False

def mark_attendance(db: Session, attendance: schemas.AttendanceCreate):
    # Check if attendance already exists for this date and employee
    db_attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if db_attendance:
        db_attendance.status = attendance.status
    else:
        db_attendance = models.Attendance(**attendance.dict())
        db.add(db_attendance)
    
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_by_employee(db: Session, employee_id: str):
    return db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).all()

def get_dashboard_stats(db: Session):
    today = date.today()
    total_employees = db.query(models.Employee).count()
    total_present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Present"
    ).count()
    total_absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Absent"
    ).count()
    
    # Department counts
    employees = db.query(models.Employee.department).all()
    dept_counts = {}
    for (dept,) in employees:
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
    return {
        "total_employees": total_employees,
        "total_present_today": total_present_today,
        "total_absent_today": total_absent_today,
        "department_counts": dept_counts
    }
