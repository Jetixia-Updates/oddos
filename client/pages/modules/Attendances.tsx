import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Attendances() {
  const [activeTab, setActiveTab] = useState('today');
  const [attendances, setAttendances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [a, e, an] = await Promise.all([
        fetch('/api/attendances/records').then(r => r.json()).catch(() => []),
        fetch('/api/hr/employees').then(r => r.json()).catch(() => []),
        fetch('/api/attendances/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setAttendances(Array.isArray(a) ? a : []);
      setEmployees(Array.isArray(e) ? e : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    await fetch('/api/attendances/records', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    fetchData();
    setShowDialog(false);
    setForm({ employeeId: '', checkIn: '', checkOut: '', status: 'present', notes: '' });
  };

  const handleCheckIn = async (employeeId: string) => {
    await fetch('/api/attendances/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, checkIn: new Date().toISOString() })
    });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-500/20 text-green-500',
      absent: 'bg-red-500/20 text-red-500',
      late: 'bg-yellow-500/20 text-yellow-500',
      'half-day': 'bg-blue-500/20 text-blue-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Attendances</h1>
            <p className="text-muted-foreground">Track employee attendance</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Present', value: analytics?.present || 0, color: 'text-green-500' },
              { title: 'Absent', value: analytics?.absent || 0, color: 'text-red-500' },
              { title: 'Late', value: analytics?.late || 0, color: 'text-yellow-500' },
              { title: 'On Leave', value: analytics?.onLeave || 0, color: 'text-blue-500' }
            ].map((stat, idx) => (
              <Card key={idx} className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Check-In</CardTitle>
                <Button className="gradient-primary" onClick={() => setShowDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />Manual Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.slice(0, 9).map((emp) => (
                  <div key={emp._id} className="p-4 rounded-lg border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">{emp.department}</p>
                    </div>
                    <Button size="sm" onClick={() => handleCheckIn(emp._id)}>
                      <Clock className="w-4 h-4 mr-2" />Check In
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.map((att) => {
                    const employee = employees.find(e => e._id === att.employeeId);
                    const hours = att.checkIn && att.checkOut 
                      ? ((new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / 3600000).toFixed(1)
                      : '-';
                    return (
                      <TableRow key={att._id}>
                        <TableCell className="font-semibold">{employee?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(att.checkIn).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(att.checkIn).toLocaleTimeString()}</TableCell>
                        <TableCell>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell><Badge className={getStatusColor(att.status)}>{att.status}</Badge></TableCell>
                        <TableCell className="font-bold">{hours}h</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Monthly Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Attendance statistics for current month</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Total Days</p>
                    <p className="text-2xl font-bold">{analytics?.totalDays || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Working Days</p>
                    <p className="text-2xl font-bold">{analytics?.workingDays || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-2xl font-bold">{analytics?.attendanceRate || 0}%</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Avg Hours</p>
                    <p className="text-2xl font-bold">{analytics?.avgHours || 0}h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Attendance Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={(value) => setForm({...form, employeeId: value})}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check In *</Label>
                <Input type="datetime-local" value={form.checkIn} onChange={(e) => setForm({...form, checkIn: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Check Out</Label>
                <Input type="datetime-local" value={form.checkOut} onChange={(e) => setForm({...form, checkOut: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({...form, status: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
