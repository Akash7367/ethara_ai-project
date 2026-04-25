from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import List, Optional
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: str

class Attendance(AttendanceBase):
    id: int
    employee_id: str

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    attendance: List[Attendance] = []

    class Config:
        orm_mode = True

class DashboardStats(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    department_counts: dict
