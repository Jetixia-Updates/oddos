import React, { useState, useEffect } from "react";
import { Calendar, Plus, Search, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  _id?: string;
  title: string;
  clientName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
}

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<Appointment>({
    title: '',
    clientName: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    duration: 60,
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [a, an] = await Promise.all([
        fetch('/api/appointments/appointments').then(r => r.json()).catch(() => []),
        fetch('/api/appointments/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setAppointments(Array.isArray(a) ? a : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setAppointments([]);
      setAnalytics({});
    }
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `/api/appointments/appointments/${editingItem._id}` : '/api/appointments/appointments';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      fetchData();
      setShowDialog(false);
      resetForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await fetch(`/api/appointments/appointments/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      clientName: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00',
      duration: 60,
      status: 'scheduled',
      notes: ''
    });
  };

  const openEdit = (item: Appointment) => {
    setEditingItem(item);
    setForm(item);
    setShowDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = appointments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = appointments.filter(a => 
    a.appointmentDate === new Date().toISOString().split('T')[0]
  ).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const groupAppointmentsByDate = () => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      if (!grouped[apt.appointmentDate]) {
        grouped[apt.appointmentDate] = [];
      }
      grouped[apt.appointmentDate].push(apt);
    });
    return grouped;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Appointments
          </h1>
          <p className="text-gray-500 mt-1">Manage appointments and schedules</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.todayAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.weekAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.monthAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>View appointments by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupAppointmentsByDate()).sort(([dateA], [dateB]) => 
                  dateA.localeCompare(dateB)
                ).slice(0, 7).map(([date, appts]) => (
                  <div key={date} className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold mb-2">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-2">
                      {appts.map(apt => (
                        <div key={apt._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{apt.title}</p>
                            <p className="text-sm text-muted-foreground">{apt.clientName} - {apt.appointmentTime}</p>
                          </div>
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetForm(); setEditingItem(null); setShowDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Appointment
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>Manage all appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt._id}>
                        <TableCell className="font-medium">{apt.title}</TableCell>
                        <TableCell>{apt.clientName}</TableCell>
                        <TableCell>{new Date(apt.appointmentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{apt.appointmentTime}</TableCell>
                        <TableCell>{apt.duration} min</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(apt)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(apt._id!)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments scheduled for today
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <Card key={apt._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{apt.appointmentTime}</div>
                            <div className="text-xs text-muted-foreground">{apt.duration} min</div>
                          </div>
                          <div className="border-l-2 border-indigo-500 pl-4">
                            <h3 className="font-semibold text-lg">{apt.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {apt.clientName}
                            </p>
                            {apt.notes && (
                              <p className="text-sm mt-1">{apt.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(apt.status)}>
                            {apt.status}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => openEdit(apt)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Appointment' : 'Add New Appointment'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update appointment details' : 'Create a new appointment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Consultation, Meeting, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm({...form, clientName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) => setForm({...form, appointmentDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={form.appointmentTime}
                  onChange={(e) => setForm({...form, appointmentTime: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({...form, duration: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: any) => setForm({...form, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Update' : 'Create'} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
