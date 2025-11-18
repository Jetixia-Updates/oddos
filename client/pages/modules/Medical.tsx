import React, { useState, useEffect } from "react";
import { Stethoscope, UserPlus, Calendar, Pill, Plus, Search, DollarSign, Users, Activity, Clock } from "lucide-react";
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

export default function Medical() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [patientForm, setPatientForm] = useState({
    patientId: '',
    name: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    emergencyContact: '',
    address: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'consultation',
    status: 'scheduled',
    notes: '',
    duration: 30
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientName: '',
    doctorName: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    diagnosis: '',
    dateIssued: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, a, pr, an] = await Promise.all([
        fetch('/api/medical/patients').then(r => r.json()).catch(() => []),
        fetch('/api/medical/appointments').then(r => r.json()).catch(() => []),
        fetch('/api/medical/prescriptions').then(r => r.json()).catch(() => []),
        fetch('/api/medical/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setPatients(Array.isArray(p) ? p : []);
      setAppointments(Array.isArray(a) ? a : []);
      setPrescriptions(Array.isArray(pr) ? pr : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setPatients([]);
      setAppointments([]);
      setPrescriptions([]);
      setAnalytics({});
    }
  };

  const handleSavePatient = async () => {
    const url = editingItem ? `/api/medical/patients/${editingItem._id}` : '/api/medical/patients';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(patientForm) 
    });
    fetchData();
    setShowPatientDialog(false);
    resetPatientForm();
    setEditingItem(null);
  };

  const handleSaveAppointment = async () => {
    const url = editingItem ? `/api/medical/appointments/${editingItem._id}` : '/api/medical/appointments';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(appointmentForm) 
    });
    fetchData();
    setShowAppointmentDialog(false);
    resetAppointmentForm();
    setEditingItem(null);
  };

  const handleSavePrescription = async () => {
    const url = editingItem ? `/api/medical/prescriptions/${editingItem._id}` : '/api/medical/prescriptions';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(prescriptionForm) 
    });
    fetchData();
    setShowPrescriptionDialog(false);
    resetPrescriptionForm();
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/api/medical/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const resetPatientForm = () => {
    setPatientForm({
      patientId: '',
      name: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      email: '',
      bloodGroup: '',
      allergies: '',
      medicalHistory: '',
      emergencyContact: '',
      address: ''
    });
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patientName: '',
      doctorName: '',
      appointmentDate: '',
      appointmentTime: '',
      type: 'consultation',
      status: 'scheduled',
      notes: '',
      duration: 30
    });
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      patientName: '',
      doctorName: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      diagnosis: '',
      dateIssued: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-500/20 text-blue-500',
      completed: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
      'no-show': 'bg-gray-500/20 text-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index: number) => {
    const newMeds = prescriptionForm.medications.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, medications: newMeds });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...prescriptionForm.medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setPrescriptionForm({ ...prescriptionForm, medications: newMeds });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medical</h1>
            <p className="text-muted-foreground">Healthcare and patient management system</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Patients', value: analytics?.totalPatients || 0, icon: Users, color: 'text-blue-500', desc: 'Registered patients' },
              { title: "Today's Appointments", value: analytics?.todayAppointments || 0, icon: Calendar, color: 'text-green-500', desc: 'Scheduled today' },
              { title: 'Active Prescriptions', value: analytics?.activePrescriptions || 0, icon: Pill, color: 'text-purple-500', desc: 'Currently active' },
              { title: 'Revenue', value: `$${(analytics?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-orange-500', desc: 'This month' }
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
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.filter(a => a.status === 'scheduled').slice(0, 5).map((appt) => (
                    <div key={appt._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{appt.patientName}</p>
                        <p className="text-sm text-muted-foreground">Dr. {appt.doctorName}</p>
                        <Badge className={getStatusColor(appt.status)} className="mt-1">{appt.type}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(appt.appointmentDate)}</p>
                        <p className="text-sm text-muted-foreground">{appt.appointmentTime}</p>
                      </div>
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Latest patient registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{patient.gender}</Badge>
                          {patient.bloodGroup && <Badge variant="outline">{patient.bloodGroup}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">{patient.patientId}</p>
                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && <p className="text-center text-muted-foreground py-8">No patients yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Records</CardTitle>
                  <CardDescription>Manage patient information</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetPatientForm(); 
                  setEditingItem(null); 
                  setShowPatientDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search patients..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.filter(p => 
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.phone.includes(searchTerm)
                  ).map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-mono">{patient.patientId}</TableCell>
                      <TableCell className="font-semibold">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.gender}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{patient.bloodGroup || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(patient); 
                            setPatientForm(patient); 
                            setShowPatientDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('patients', patient._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Manage patient appointments</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetAppointmentForm(); 
                  setEditingItem(null); 
                  setShowAppointmentDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt._id}>
                      <TableCell className="font-semibold">{appt.patientName}</TableCell>
                      <TableCell>Dr. {appt.doctorName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(appt.appointmentDate)}</TableCell>
                      <TableCell className="font-medium">{appt.appointmentTime}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{appt.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appt.status)}>{appt.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(appt); 
                            setAppointmentForm(appt); 
                            setShowAppointmentDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('appointments', appt._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>Manage medical prescriptions</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetPrescriptionForm(); 
                  setEditingItem(null); 
                  setShowPrescriptionDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Prescription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Medications</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((rx) => (
                    <TableRow key={rx._id}>
                      <TableCell className="font-semibold">{rx.patientName}</TableCell>
                      <TableCell>Dr. {rx.doctorName}</TableCell>
                      <TableCell className="text-muted-foreground">{rx.diagnosis}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rx.medications?.slice(0, 2).map((med: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{med.name}</Badge>
                          ))}
                          {rx.medications?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{rx.medications.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(rx.dateIssued)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(rx); 
                            setPrescriptionForm(rx); 
                            setShowPrescriptionDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('prescriptions', rx._id)}>Delete</Button>
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

      {/* Patient Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Patient' : 'New Patient'}</DialogTitle>
            <DialogDescription>Manage patient information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient ID *</Label>
                <Input 
                  value={patientForm.patientId} 
                  onChange={(e) => setPatientForm({...patientForm, patientId: e.target.value})} 
                  placeholder="P-2024-001" 
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={patientForm.name} 
                  onChange={(e) => setPatientForm({...patientForm, name: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input 
                  type="date"
                  value={patientForm.dateOfBirth} 
                  onChange={(e) => setPatientForm({...patientForm, dateOfBirth: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={patientForm.gender} onValueChange={(value) => setPatientForm({...patientForm, gender: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={patientForm.bloodGroup} onValueChange={(value) => setPatientForm({...patientForm, bloodGroup: value})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input 
                  value={patientForm.phone} 
                  onChange={(e) => setPatientForm({...patientForm, phone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={patientForm.email} 
                  onChange={(e) => setPatientForm({...patientForm, email: e.target.value})} 
                  placeholder="patient@example.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={patientForm.address} 
                onChange={(e) => setPatientForm({...patientForm, address: e.target.value})} 
                placeholder="Full address" 
              />
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input 
                value={patientForm.allergies} 
                onChange={(e) => setPatientForm({...patientForm, allergies: e.target.value})} 
                placeholder="List any allergies" 
              />
            </div>
            <div className="space-y-2">
              <Label>Medical History</Label>
              <Textarea 
                value={patientForm.medicalHistory} 
                onChange={(e) => setPatientForm({...patientForm, medicalHistory: e.target.value})} 
                placeholder="Previous medical conditions, surgeries, etc."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact *</Label>
              <Input 
                value={patientForm.emergencyContact} 
                onChange={(e) => setPatientForm({...patientForm, emergencyContact: e.target.value})} 
                placeholder="Name and phone number" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePatient} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
            <DialogDescription>Schedule a patient appointment</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input 
                  value={appointmentForm.patientName} 
                  onChange={(e) => setAppointmentForm({...appointmentForm, patientName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor Name *</Label>
                <Input 
                  value={appointmentForm.doctorName} 
                  onChange={(e) => setAppointmentForm({...appointmentForm, doctorName: e.target.value})} 
                  placeholder="Dr. Smith" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Appointment Date *</Label>
                <Input 
                  type="date"
                  value={appointmentForm.appointmentDate} 
                  onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Appointment Time *</Label>
                <Input 
                  type="time"
                  value={appointmentForm.appointmentTime} 
                  onChange={(e) => setAppointmentForm({...appointmentForm, appointmentTime: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={appointmentForm.type} onValueChange={(value) => setAppointmentForm({...appointmentForm, type: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="checkup">Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={appointmentForm.status} onValueChange={(value) => setAppointmentForm({...appointmentForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input 
                  type="number"
                  value={appointmentForm.duration} 
                  onChange={(e) => setAppointmentForm({...appointmentForm, duration: parseInt(e.target.value)})} 
                  placeholder="30" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={appointmentForm.notes} 
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})} 
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAppointment} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Prescription' : 'New Prescription'}</DialogTitle>
            <DialogDescription>Create medical prescription</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input 
                  value={prescriptionForm.patientName} 
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, patientName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor Name *</Label>
                <Input 
                  value={prescriptionForm.doctorName} 
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, doctorName: e.target.value})} 
                  placeholder="Dr. Smith" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Diagnosis *</Label>
              <Input 
                value={prescriptionForm.diagnosis} 
                onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})} 
                placeholder="Medical diagnosis" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Medications</Label>
                <Button type="button" size="sm" variant="outline" onClick={addMedication}>
                  <Plus className="w-3 h-3 mr-1" />Add Medication
                </Button>
              </div>
              {prescriptionForm.medications.map((med, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 p-3 border rounded-lg">
                  <Input 
                    placeholder="Name"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  />
                  <Input 
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  />
                  <Input 
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  />
                  <Input 
                    placeholder="Duration"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  />
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeMedication(index)}
                    disabled={prescriptionForm.medications.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Date Issued</Label>
              <Input 
                type="date"
                value={prescriptionForm.dateIssued} 
                onChange={(e) => setPrescriptionForm({...prescriptionForm, dateIssued: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea 
                value={prescriptionForm.notes} 
                onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})} 
                placeholder="Additional instructions..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePrescription} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
