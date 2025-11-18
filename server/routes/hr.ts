import { RequestHandler } from "express";
import { getDatabase } from "../db";
import { ObjectId } from "mongodb";

// Employees
export const getEmployees: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const employees = await db.collection('hr_employees').find().toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const createEmployee: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const employeeId = `EMP-${Date.now().toString().slice(-6)}`;
    const employee = { 
      ...req.body, 
      employeeId,
      status: req.body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('hr_employees').insertOne(employee);
    res.json({ _id: result.insertedId, ...employee });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('hr_employees').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deleteEmployee: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('hr_employees').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

// Departments
export const getDepartments: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const departments = await db.collection('hr_departments').find().toArray();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

export const createDepartment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const department = { 
      ...req.body,
      employeeCount: req.body.employeeCount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('hr_departments').insertOne(department);
    res.json({ _id: result.insertedId, ...department });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
};

export const updateDepartment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('hr_departments').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
};

export const deleteDepartment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('hr_departments').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

// Attendance
export const getAttendance: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const attendance = await db.collection('hr_attendance').find().sort({ date: -1 }).toArray();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const createAttendance: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const attendance = { 
      ...req.body,
      status: req.body.status || 'present',
      hoursWorked: req.body.hoursWorked || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('hr_attendance').insertOne(attendance);
    res.json({ _id: result.insertedId, ...attendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create attendance' });
  }
};

export const updateAttendance: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('hr_attendance').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};

export const deleteAttendance: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('hr_attendance').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
};

// Leave Requests
export const getLeaveRequests: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const requests = await db.collection('hr_leave_requests').find().sort({ startDate: -1 }).toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const createLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const requestNumber = `LR-${Date.now().toString().slice(-6)}`;
    const request = { 
      ...req.body,
      requestNumber,
      status: req.body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('hr_leave_requests').insertOne(request);
    res.json({ _id: result.insertedId, ...request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

export const updateLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('hr_leave_requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave request' });
  }
};

export const deleteLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('hr_leave_requests').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
};

// Analytics
export const getHRAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [employees, departments, attendance, leaveRequests] = await Promise.all([
      db.collection('hr_employees').find().toArray(),
      db.collection('hr_departments').find().toArray(),
      db.collection('hr_attendance').find().toArray(),
      db.collection('hr_leave_requests').find().toArray()
    ]);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalDepartments = departments.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = attendance.filter(a => {
      const attDate = new Date(a.date);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });
    
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
    
    const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;
    const approvedLeaves = leaveRequests.filter(r => r.status === 'approved').length;
    
    const avgSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0) / totalEmployees || 0;
    
    const attendanceRate = todayAttendance.length > 0 
      ? (presentToday / todayAttendance.length) * 100 
      : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      totalDepartments,
      presentToday,
      absentToday,
      pendingLeaves,
      approvedLeaves,
      avgSalary,
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
