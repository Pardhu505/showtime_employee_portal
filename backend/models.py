from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Attendance(BaseModel):
    att_date: str = Field(..., alias="Att. Date")
    emp_code: str = Field(..., alias="Emp Code")
    employee_name: str = Field(..., alias="Employee Name")
    in_time: Optional[str] = Field(None, alias="S. InTime")
    out_time: Optional[str] = Field(None, alias="S. OutTime")
    work_dur: Optional[str] = Field(None, alias="Work Dur")
    ot: Optional[str] = Field(None, alias="OT")
    tot_dur: Optional[str] = Field(None, alias="Tot. Dur")
    late_by: Optional[str] = Field(None, alias="LateBy")
    early_going_by: Optional[str] = Field(None, alias="EarlyGoingBy")
    status: str = Field(..., alias="Status")
    punch_records: Optional[str] = Field(None, alias="Punch Records")

    class Config:
        allow_population_by_field_name = True
