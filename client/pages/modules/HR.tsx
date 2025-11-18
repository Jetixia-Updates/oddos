import React, { useState, useEffect } from "react";
import { Users, Plus, Search, TrendingUp, Edit, Trash2, Calendar, UserCheck, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HR() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeForm, setEmployeeForm] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', hireDate: '', salary: 0, status: 'active' });
  const [deptForm, setDeptForm] = useState({ name: '', manager: '', description: '', budget: 0 });
  const [attendanceForm, setAttendanceForm] = useState({ employeeId: '', employeeName: '', date: '', checkIn: '', checkOut: '', hoursWorked: 0, status: 'present' });
  const [leaveForm, setLeaveForm] = useState({ employeeId: '', employeeName: '', leaveType: 'annual', startDate: '', endDate: '', days: 0, reason: '', status: 'pending' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [e, d, a, l, an] = await Promise.all([
        fetch('/api/hr/employees').then(r => r.json()).catch(() => []),
        fetch('/api/hr/departments').then(r => r.json()).catch(() => []),
        fetch('/api/hr/attendance').then(r => r.json()).catch(() => []),
        fetch('/api/hr/leave-requests').then(r => r.json()).catch(() => []),
        fetch('/api/hr/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setEmployees(Array.isArray(e) ? e : []);
      setDepartments(Array.isArray(d) ? d : []);
      setAttendance(Array.isArray(a) ? a : []);
      setLeaveRequests(Array.isArray(l) ? l : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setEmployees([]);
      setDepartments([]);
      setAttendance([]);
      setLeaveRequests([]);
      setAnalytics({});
    }
  };

  const handleSaveEmployee = async () => {
    const url = editingItem ? `/api/hr/employees/${editingItem._id}` : '/api/hr/employees';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employeeForm) });
    fetchData();
    setShowEmployeeDialog(false);
    setEmployeeForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', hireDate: '', salary: 0, status: 'active' });
    setEditingItem(null);
  };

  const handleSaveDepartment = async () => {
    const url = editingItem ? `/api/hr/departments/${editingItem._id}` : '/api/hr/departments';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(deptForm) });
    fetchData();
    setShowDeptDialog(false);
    setDeptForm({ name: '', manager: '', description: '', budget: 0 });
    setEditingItem(null);
  };

  const handleSaveAttendance = async () => {
    await fetch('/api/hr/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attendanceForm) });
    fetchData();
    setShowAttendanceDialog(false);
    setAttendanceForm({ employeeId: '', employeeName: '', date: '', checkIn: '', checkOut: '', hoursWorked: 0, status: 'present' });
  };

  const handleSaveLeave = async () => {
    const url = editingItem ? `/api/hr/leave-requests/${editingItem._id}` : '/api/hr/leave-requests';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leaveForm) });
    fetchData();
    setShowLeaveDialog(false);
    setLeaveForm({ employeeId: '', employeeName: '', leaveType: 'annual', startDate: '', endDate: '', days: 0, reason: '', status: 'pending' });
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/hr/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { active: 'bg-green-500/20 text-green-500', inactive: 'bg-gray-500/20 text-gray-500', present: 'bg-green-500/20 text-green-500', absent: 'bg-red-500/20 text-red-500', late: 'bg-yellow-500/20 text-yellow-500', pending: 'bg-yellow-500/20 text-yellow-500', approved: 'bg-green-500/20 text-green-500', rejected: 'bg-red-500/20 text-red-500' };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Human Resources</h1>
            <p className="text-muted-foreground">Manage employees, attendance, and leave requests</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Employees', value: analytics?.totalEmployees || 0, icon: Users, color: 'text-blue-500', desc: `${analytics?.activeEmployees || 0} active` },
              { title: 'Present Today', value: analytics?.presentToday || 0, icon: UserCheck, color: 'text-green-500', desc: `${(analytics?.attendanceRate || 0).toFixed(1)}% attendance` },
              { title: 'Pending Leaves', value: analytics?.pendingLeaves || 0, icon: Calendar, color: 'text-yellow-500', desc: 'Awaiting approval' },
              { title: 'Avg Salary', value: formatCurrency(analytics?.avgSalary || 0), icon: TrendingUp, color: 'text-purple-500', desc: 'Per employee' }
            ].map((stat, idx) => (
              <Card key={idx} className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Departments</CardTitle><CardDescription>Employee distribution</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{dept.name}</p><p className="text-sm text-muted-foreground">Manager: {dept.manager}</p></div>
                      <div className="text-right"><p className="font-bold text-lg">{dept.employeeCount || 0}</p><p className="text-xs text-muted-foreground">employees</p></div>
                    </div>
                  ))}
                  {departments.length === 0 && <p className="text-center text-muted-foreground py-8">No departments</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Recent Leave Requests</CardTitle><CardDescription>Pending approvals</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests.filter(r => r.status === 'pending').slice(0, 5).map((leave) => (
                    <div key={leave._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{leave.employeeName}</p><p className="text-sm text-muted-foreground">{leave.leaveType} • {leave.days} days</p></div>
                      <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                    </div>
                  ))}
                  {leaveRequests.filter(r => r.status === 'pending').length === 0 && <p className="text-center text-muted-foreground py-8">No pending requests</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Employee Management</CardTitle><CardDescription>Manage your workforce</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setEmployeeForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', hireDate: '', salary: 0, status: 'active' }); setEditingItem(null); setShowEmployeeDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
              <Table>
                <TableHeader><TableRow><TableHead>Employee ID</TableHead><TableHead>Name</TableHead><TableHead>Position</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead>Salary</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {employees.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                    <TableRow key={emp._id}>
                      <TableCell className="font-semibold">{emp.employeeId}</TableCell>
                      <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.position}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(emp.salary)}</TableCell>
                      <TableCell><Badge className={getStatusColor(emp.status)}>{emp.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(emp); setEmployeeForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, phone: emp.phone, position: emp.position, department: emp.department, hireDate: emp.hireDate, salary: emp.salary, status: emp.status }); setShowEmployeeDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('employees', emp._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Departments</CardTitle><CardDescription>Manage organizational units</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setDeptForm({ name: '', manager: '', description: '', budget: 0 }); setEditingItem(null); setShowDeptDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Department</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <Card key={dept._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(dept); setDeptForm({ name: dept.name, manager: dept.manager, description: dept.description, budget: dept.budget }); setShowDeptDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('departments', dept._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2"><p className="text-sm text-muted-foreground">Manager: {dept.manager}</p><p className="text-sm text-muted-foreground">Employees: {dept.employeeCount || 0}</p><p className="text-sm text-muted-foreground">Budget: {formatCurrency(dept.budget)}</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Attendance Records</CardTitle><CardDescription>Track employee attendance</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setAttendanceForm({ employeeId: '', employeeName: '', date: '', checkIn: '', checkOut: '', hoursWorked: 0, status: 'present' }); setShowAttendanceDialog(true); }}><Plus className="w-4 h-4 mr-2" />Mark Attendance</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Hours</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {attendance.map((att) => (
                    <TableRow key={att._id}>
                      <TableCell className="font-semibold">{att.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(att.date)}</TableCell>
                      <TableCell>{att.checkIn}</TableCell>
                      <TableCell>{att.checkOut}</TableCell>
                      <TableCell className="font-bold">{att.hoursWorked}h</TableCell>
                      <TableCell><Badge className={getStatusColor(att.status)}>{att.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Leave Requests</CardTitle><CardDescription>Manage time off requests</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setLeaveForm({ employeeId: '', employeeName: '', leaveType: 'annual', startDate: '', endDate: '', days: 0, reason: '', status: 'pending' }); setEditingItem(null); setShowLeaveDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Request</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Request #</TableHead><TableHead>Employee</TableHead><TableHead>Leave Type</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {leaveRequests.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-semibold">{leave.requestNumber}</TableCell>
                      <TableCell>{leave.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{leave.leaveType}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(leave.startDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(leave.endDate)}</TableCell>
                      <TableCell className="font-bold">{leave.days}</TableCell>
                      <TableCell><Badge className={getStatusColor(leave.status)}>{leave.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(leave); setLeaveForm({ employeeId: leave.employeeId, employeeName: leave.employeeName, leaveType: leave.leaveType, startDate: leave.startDate, endDate: leave.endDate, days: leave.days, reason: leave.reason, status: leave.status }); setShowLeaveDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('leave-requests', leave._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Employee' : 'New Employee'}</DialogTitle><DialogDescription>Manage employee information</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">First Name *</label><Input value={employeeForm.firstName} onChange={(e) => setEmployeeForm({...employeeForm, firstName: e.target.value})} placeholder="John" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Last Name *</label><Input value={employeeForm.lastName} onChange={(e) => setEmployeeForm({...employeeForm, lastName: e.target.value})} placeholder="Doe" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Email *</label><Input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})} placeholder="john@example.com" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input value={employeeForm.phone} onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})} placeholder="+1 234 567 8900" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Position *</label><Input value={employeeForm.position} onChange={(e) => setEmployeeForm({...employeeForm, position: e.target.value})} placeholder="Software Engineer" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Department</label><Select value={employeeForm.department} onValueChange={(value) => setEmployeeForm({...employeeForm, department: value})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Hire Date *</label><Input type="date" value={employeeForm.hireDate} onChange={(e) => setEmployeeForm({...employeeForm, hireDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Salary</label><Input type="number" value={employeeForm.salary} onChange={(e) => setEmployeeForm({...employeeForm, salary: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={employeeForm.status} onValueChange={(value) => setEmployeeForm({...employeeForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>Cancel</Button><Button onClick={handleSaveEmployee} className="gradient-primary">Save Employee</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Department' : 'New Department'}</DialogTitle><DialogDescription>Manage department details</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Department Name *</label><Input value={deptForm.name} onChange={(e) => setDeptForm({...deptForm, name: e.target.value})} placeholder="Engineering" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Manager</label><Input value={deptForm.manager} onChange={(e) => setDeptForm({...deptForm, manager: e.target.value})} placeholder="Manager name" /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Budget</label><Input type="number" value={deptForm.budget} onChange={(e) => setDeptForm({...deptForm, budget: Number(e.target.value)})} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={deptForm.description} onChange={(e) => setDeptForm({...deptForm, description: e.target.value})} placeholder="Department description..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowDeptDialog(false)}>Cancel</Button><Button onClick={handleSaveDepartment} className="gradient-primary">Save Department</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle><DialogDescription>Record employee attendance</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Employee *</label><Select value={attendanceForm.employeeId} onValueChange={(value) => { const emp = employees.find(e => e._id === value); setAttendanceForm({...attendanceForm, employeeId: value, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : ''}); }}><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger><SelectContent>{employees.map(e => <SelectItem key={e._id} value={e._id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Date *</label><Input type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Check In</label><Input type="time" value={attendanceForm.checkIn} onChange={(e) => setAttendanceForm({...attendanceForm, checkIn: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Check Out</label><Input type="time" value={attendanceForm.checkOut} onChange={(e) => setAttendanceForm({...attendanceForm, checkOut: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Hours</label><Input type="number" value={attendanceForm.hoursWorked} onChange={(e) => setAttendanceForm({...attendanceForm, hoursWorked: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={attendanceForm.status} onValueChange={(value) => setAttendanceForm({...attendanceForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="present">Present</SelectItem><SelectItem value="absent">Absent</SelectItem><SelectItem value="late">Late</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>Cancel</Button><Button onClick={handleSaveAttendance} className="gradient-primary">Save Attendance</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle><DialogDescription>Submit leave request</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Employee *</label><Select value={leaveForm.employeeId} onValueChange={(value) => { const emp = employees.find(e => e._id === value); setLeaveForm({...leaveForm, employeeId: value, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : ''}); }}><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger><SelectContent>{employees.map(e => <SelectItem key={e._id} value={e._id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Leave Type</label><Select value={leaveForm.leaveType} onValueChange={(value) => setLeaveForm({...leaveForm, leaveType: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="annual">Annual Leave</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="casual">Casual Leave</SelectItem><SelectItem value="unpaid">Unpaid Leave</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Start Date *</label><Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">End Date *</label><Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Days</label><Input type="number" value={leaveForm.days} onChange={(e) => setLeaveForm({...leaveForm, days: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Reason</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Reason for leave..." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={leaveForm.status} onValueChange={(value) => setLeaveForm({...leaveForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowLeaveDialog(false)}>Cancel</Button><Button onClick={handleSaveLeave} className="gradient-primary">Save Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
