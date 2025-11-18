import React, { useState, useEffect } from "react";
import { GraduationCap, Users, BookOpen, Award, Plus, Search, Calendar, TrendingUp, UserCheck, FileText } from "lucide-react";
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

export default function School() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [studentForm, setStudentForm] = useState({
    studentId: '',
    name: '',
    dateOfBirth: '',
    gradeClass: '',
    section: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    bloodGroup: '',
    emergencyContact: '',
    previousSchool: ''
  });

  const [classForm, setClassForm] = useState({
    name: '',
    gradeLevel: '',
    section: '',
    teacherName: '',
    subject: '',
    roomNumber: '',
    schedule: '',
    capacity: 0,
    enrolledStudents: 0,
    startTime: '',
    endTime: '',
    daysOfWeek: '',
    semester: 'Fall 2024'
  });

  const [gradeForm, setGradeForm] = useState({
    studentName: '',
    studentId: '',
    className: '',
    subject: '',
    marks: 0,
    totalMarks: 100,
    grade: 'A',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    examType: 'midterm',
    examDate: '',
    remarks: '',
    teacherName: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, c, g, an] = await Promise.all([
        fetch('/api/school/students').then(r => r.json()).catch(() => []),
        fetch('/api/school/classes').then(r => r.json()).catch(() => []),
        fetch('/api/school/grades').then(r => r.json()).catch(() => []),
        fetch('/api/school/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setStudents(Array.isArray(s) ? s : []);
      setClasses(Array.isArray(c) ? c : []);
      setGrades(Array.isArray(g) ? g : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setStudents([]);
      setClasses([]);
      setGrades([]);
      setAnalytics({});
    }
  };

  const handleSaveStudent = async () => {
    try {
      const url = editingItem ? `/api/school/students/${editingItem._id}` : '/api/school/students';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(studentForm) 
      });
      fetchData();
      setShowStudentDialog(false);
      resetStudentForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student');
    }
  };

  const handleSaveClass = async () => {
    try {
      const url = editingItem ? `/api/school/classes/${editingItem._id}` : '/api/school/classes';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(classForm) 
      });
      fetchData();
      setShowClassDialog(false);
      resetClassForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const handleSaveGrade = async () => {
    try {
      const url = editingItem ? `/api/school/grades/${editingItem._id}` : '/api/school/grades';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(gradeForm) 
      });
      fetchData();
      setShowGradeDialog(false);
      resetGradeForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/api/school/${type}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      studentId: '',
      name: '',
      dateOfBirth: '',
      gradeClass: '',
      section: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      bloodGroup: '',
      emergencyContact: '',
      previousSchool: ''
    });
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      gradeLevel: '',
      section: '',
      teacherName: '',
      subject: '',
      roomNumber: '',
      schedule: '',
      capacity: 0,
      enrolledStudents: 0,
      startTime: '',
      endTime: '',
      daysOfWeek: '',
      semester: 'Fall 2024'
    });
  };

  const resetGradeForm = () => {
    setGradeForm({
      studentName: '',
      studentId: '',
      className: '',
      subject: '',
      marks: 0,
      totalMarks: 100,
      grade: 'A',
      semester: 'Fall 2024',
      academicYear: '2024-2025',
      examType: 'midterm',
      examDate: '',
      remarks: '',
      teacherName: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-500',
      graduated: 'bg-blue-500/20 text-blue-500',
      withdrawn: 'bg-red-500/20 text-red-500',
      suspended: 'bg-orange-500/20 text-orange-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-500/20 text-green-500',
      'B': 'bg-blue-500/20 text-blue-500',
      'C': 'bg-yellow-500/20 text-yellow-500',
      'D': 'bg-orange-500/20 text-orange-500',
      'F': 'bg-red-500/20 text-red-500'
    };
    return colors[grade] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const calculatePercentage = (marks: number, total: number) => {
    return total > 0 ? ((marks / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">School Management</h1>
            <p className="text-muted-foreground">Student enrollment, classes, and academic records</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Students', value: analytics?.totalStudents || 0, icon: Users, color: 'text-blue-500', desc: 'Enrolled students' },
              { title: 'Total Classes', value: analytics?.totalClasses || 0, icon: BookOpen, color: 'text-green-500', desc: 'Active classes' },
              { title: 'Total Teachers', value: analytics?.totalTeachers || 0, icon: UserCheck, color: 'text-purple-500', desc: 'Teaching staff' },
              { title: 'Avg Attendance', value: `${analytics?.avgAttendance || 0}%`, icon: TrendingUp, color: 'text-orange-500', desc: 'This month' }
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
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>Latest student enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.slice(0, 5).map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.gradeClass} - {student.section}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                          <Badge variant="outline">{student.studentId}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{student.parentName}</p>
                        <p className="text-xs text-muted-foreground">{student.parentPhone}</p>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && <p className="text-center text-muted-foreground py-8">No students enrolled yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Active Classes</CardTitle>
                <CardDescription>Current semester classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classes.slice(0, 5).map((cls) => (
                    <div key={cls._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">{cls.subject} - {cls.teacherName}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">Room {cls.roomNumber}</Badge>
                          <Badge variant="secondary">{cls.enrolledStudents}/{cls.capacity}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{cls.gradeLevel}</p>
                        <p className="text-xs text-muted-foreground">{cls.schedule}</p>
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && <p className="text-center text-muted-foreground py-8">No classes created yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Academic performance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                  const count = grades.filter(g => g.grade === grade).length;
                  const percentage = grades.length > 0 ? ((count / grades.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={grade} className="text-center p-4 rounded-lg border border-border/50">
                      <div className={`text-3xl font-bold mb-2 ${getGradeColor(grade).split(' ')[1]}`}>{grade}</div>
                      <div className="text-2xl font-semibold">{count}</div>
                      <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Records</CardTitle>
                  <CardDescription>Manage student information and enrollment</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetStudentForm(); 
                  setEditingItem(null); 
                  setShowStudentDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Student
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search students..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade/Class</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.filter(s => 
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.parentName.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-mono">{student.studentId}</TableCell>
                      <TableCell className="font-semibold">{student.name}</TableCell>
                      <TableCell>{student.gradeClass} - {student.section}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell className="text-muted-foreground">{student.parentPhone}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(student.enrollmentDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(student); 
                            setStudentForm(student); 
                            setShowStudentDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('students', student._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {students.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students enrolled yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Class Management</CardTitle>
                  <CardDescription>Manage classes, schedules, and teachers</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetClassForm(); 
                  setEditingItem(null); 
                  setShowClassDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Class
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-semibold">{cls.name}</TableCell>
                      <TableCell>{cls.gradeLevel}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cls.section}</Badge>
                      </TableCell>
                      <TableCell>{cls.teacherName}</TableCell>
                      <TableCell className="text-muted-foreground">{cls.subject}</TableCell>
                      <TableCell className="font-mono">{cls.roomNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{cls.schedule}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cls.enrolledStudents}/{cls.capacity}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(cls); 
                            setClassForm(cls); 
                            setShowClassDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('classes', cls._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {classes.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No classes created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Grade Management</CardTitle>
                  <CardDescription>Track student performance and grades</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetGradeForm(); 
                  setEditingItem(null); 
                  setShowGradeDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Grade
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade._id}>
                      <TableCell className="font-semibold">{grade.studentName}</TableCell>
                      <TableCell>{grade.className}</TableCell>
                      <TableCell className="text-muted-foreground">{grade.subject}</TableCell>
                      <TableCell className="font-mono">
                        {grade.marks}/{grade.totalMarks} ({calculatePercentage(grade.marks, grade.totalMarks)}%)
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{grade.semester}</TableCell>
                      <TableCell className="text-muted-foreground">{grade.academicYear}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(grade); 
                            setGradeForm(grade); 
                            setShowGradeDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('grades', grade._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {grades.length === 0 && (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No grades recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Student' : 'New Student'}</DialogTitle>
            <DialogDescription>Manage student enrollment information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student ID *</Label>
                <Input 
                  value={studentForm.studentId} 
                  onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} 
                  placeholder="STU-2024-001" 
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={studentForm.name} 
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input 
                  type="date"
                  value={studentForm.dateOfBirth} 
                  onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Grade/Class *</Label>
                <Input 
                  value={studentForm.gradeClass} 
                  onChange={(e) => setStudentForm({...studentForm, gradeClass: e.target.value})} 
                  placeholder="Grade 10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input 
                  value={studentForm.section} 
                  onChange={(e) => setStudentForm({...studentForm, section: e.target.value})} 
                  placeholder="A" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Parent Name *</Label>
                <Input 
                  value={studentForm.parentName} 
                  onChange={(e) => setStudentForm({...studentForm, parentName: e.target.value})} 
                  placeholder="Jane Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone *</Label>
                <Input 
                  value={studentForm.parentPhone} 
                  onChange={(e) => setStudentForm({...studentForm, parentPhone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Email</Label>
                <Input 
                  type="email"
                  value={studentForm.parentEmail} 
                  onChange={(e) => setStudentForm({...studentForm, parentEmail: e.target.value})} 
                  placeholder="parent@example.com" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea 
                value={studentForm.address} 
                onChange={(e) => setStudentForm({...studentForm, address: e.target.value})} 
                placeholder="Full address..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Enrollment Date *</Label>
                <Input 
                  type="date"
                  value={studentForm.enrollmentDate} 
                  onChange={(e) => setStudentForm({...studentForm, enrollmentDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={studentForm.status} onValueChange={(value) => setStudentForm({...studentForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={studentForm.bloodGroup} onValueChange={(value) => setStudentForm({...studentForm, bloodGroup: value})}>
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
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input 
                  value={studentForm.emergencyContact} 
                  onChange={(e) => setStudentForm({...studentForm, emergencyContact: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Previous School</Label>
              <Input 
                value={studentForm.previousSchool} 
                onChange={(e) => setStudentForm({...studentForm, previousSchool: e.target.value})} 
                placeholder="Name of previous school" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveStudent} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Dialog */}
      <Dialog open={showClassDialog} onOpenChange={setShowClassDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Class' : 'New Class'}</DialogTitle>
            <DialogDescription>Manage class information and schedule</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input 
                  value={classForm.name} 
                  onChange={(e) => setClassForm({...classForm, name: e.target.value})} 
                  placeholder="Mathematics 101" 
                />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input 
                  value={classForm.subject} 
                  onChange={(e) => setClassForm({...classForm, subject: e.target.value})} 
                  placeholder="Mathematics" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Grade Level *</Label>
                <Input 
                  value={classForm.gradeLevel} 
                  onChange={(e) => setClassForm({...classForm, gradeLevel: e.target.value})} 
                  placeholder="Grade 10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input 
                  value={classForm.section} 
                  onChange={(e) => setClassForm({...classForm, section: e.target.value})} 
                  placeholder="A" 
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number *</Label>
                <Input 
                  value={classForm.roomNumber} 
                  onChange={(e) => setClassForm({...classForm, roomNumber: e.target.value})} 
                  placeholder="101" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher Name *</Label>
                <Input 
                  value={classForm.teacherName} 
                  onChange={(e) => setClassForm({...classForm, teacherName: e.target.value})} 
                  placeholder="Mr. Smith" 
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input 
                  value={classForm.semester} 
                  onChange={(e) => setClassForm({...classForm, semester: e.target.value})} 
                  placeholder="Fall 2024" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input 
                  type="time"
                  value={classForm.startTime} 
                  onChange={(e) => setClassForm({...classForm, startTime: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input 
                  type="time"
                  value={classForm.endTime} 
                  onChange={(e) => setClassForm({...classForm, endTime: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <Input 
                  value={classForm.daysOfWeek} 
                  onChange={(e) => setClassForm({...classForm, daysOfWeek: e.target.value})} 
                  placeholder="Mon, Wed, Fri" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Input 
                value={classForm.schedule} 
                onChange={(e) => setClassForm({...classForm, schedule: e.target.value})} 
                placeholder="Mon/Wed/Fri 9:00 AM - 10:30 AM" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity *</Label>
                <Input 
                  type="number"
                  value={classForm.capacity} 
                  onChange={(e) => setClassForm({...classForm, capacity: parseInt(e.target.value)})} 
                  placeholder="30" 
                />
              </div>
              <div className="space-y-2">
                <Label>Enrolled Students</Label>
                <Input 
                  type="number"
                  value={classForm.enrolledStudents} 
                  onChange={(e) => setClassForm({...classForm, enrolledStudents: parseInt(e.target.value)})} 
                  placeholder="0" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClassDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveClass} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Grade' : 'New Grade'}</DialogTitle>
            <DialogDescription>Record student academic performance</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Name *</Label>
                <Input 
                  value={gradeForm.studentName} 
                  onChange={(e) => setGradeForm({...gradeForm, studentName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input 
                  value={gradeForm.studentId} 
                  onChange={(e) => setGradeForm({...gradeForm, studentId: e.target.value})} 
                  placeholder="STU-2024-001" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input 
                  value={gradeForm.className} 
                  onChange={(e) => setGradeForm({...gradeForm, className: e.target.value})} 
                  placeholder="Mathematics 101" 
                />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input 
                  value={gradeForm.subject} 
                  onChange={(e) => setGradeForm({...gradeForm, subject: e.target.value})} 
                  placeholder="Mathematics" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marks Obtained *</Label>
                <Input 
                  type="number"
                  value={gradeForm.marks} 
                  onChange={(e) => setGradeForm({...gradeForm, marks: parseFloat(e.target.value)})} 
                  placeholder="85" 
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks *</Label>
                <Input 
                  type="number"
                  value={gradeForm.totalMarks} 
                  onChange={(e) => setGradeForm({...gradeForm, totalMarks: parseFloat(e.target.value)})} 
                  placeholder="100" 
                />
              </div>
              <div className="space-y-2">
                <Label>Grade *</Label>
                <Select value={gradeForm.grade} onValueChange={(value) => setGradeForm({...gradeForm, grade: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A (Excellent)</SelectItem>
                    <SelectItem value="B">B (Good)</SelectItem>
                    <SelectItem value="C">C (Average)</SelectItem>
                    <SelectItem value="D">D (Below Average)</SelectItem>
                    <SelectItem value="F">F (Fail)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select value={gradeForm.examType} onValueChange={(value) => setGradeForm({...gradeForm, examType: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input 
                  value={gradeForm.semester} 
                  onChange={(e) => setGradeForm({...gradeForm, semester: e.target.value})} 
                  placeholder="Fall 2024" 
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input 
                  value={gradeForm.academicYear} 
                  onChange={(e) => setGradeForm({...gradeForm, academicYear: e.target.value})} 
                  placeholder="2024-2025" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Input 
                  type="date"
                  value={gradeForm.examDate} 
                  onChange={(e) => setGradeForm({...gradeForm, examDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Teacher Name</Label>
                <Input 
                  value={gradeForm.teacherName} 
                  onChange={(e) => setGradeForm({...gradeForm, teacherName: e.target.value})} 
                  placeholder="Mr. Smith" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea 
                value={gradeForm.remarks} 
                onChange={(e) => setGradeForm({...gradeForm, remarks: e.target.value})} 
                placeholder="Additional comments or feedback..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveGrade} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
