import { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Calendar, 
  Stethoscope, 
  Plus,
  Search,
  Filter,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  nationalId: string;
  lastVisit?: string;
}

interface Appointment {
  _id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface HospitalStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
}

export default function Hospital() {
  const [stats, setStats] = useState<HospitalStats>({ totalPatients: 0, totalAppointments: 0, todayAppointments: 0 });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, patientsRes, appointmentsRes] = await Promise.all([
        fetch('/api/hospital/stats'),
        fetch('/api/hospital/patients'),
        fetch('/api/hospital/appointments')
      ]);

      const statsData = await statsRes.json();
      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (patientsData.success) setPatients(patientsData.data);
      if (appointmentsData.success) setAppointments(appointmentsData.data);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-indigo-600">
              نظام إدارة المستشفى - ERP KSA
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              نظام متكامل لإدارة العيادات والمستشفيات حسب المعايير السعودية
            </p>
          </div>
          <Button className="gradient-primary shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            إضافة مريض جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-white/20 shadow-xl hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المرضى</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{stats.totalPatients}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                نشط في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المواعيد اليوم</CardTitle>
              <Calendar className="h-5 w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{stats.todayAppointments}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                موعد مجدول
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
              <Stethoscope className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{stats.totalAppointments}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                <Activity className="w-3 h-3 inline mr-1" />
                في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20 shadow-xl hover:shadow-glow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">التقارير</CardTitle>
              <FileText className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">125</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                تقرير طبي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:shadow-glow transition-all">
              <Users className="w-6 h-6" />
              <span className="text-sm">إضافة مريض</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:shadow-glow transition-all">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">حجز موعد</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:shadow-glow transition-all">
              <Stethoscope className="w-6 h-6" />
              <span className="text-sm">فحص طبي</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 hover:shadow-glow transition-all">
              <FileText className="w-6 h-6" />
              <span className="text-sm">تقرير طبي</span>
            </Button>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="glass border-white/20 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>المرضى المسجلين</CardTitle>
                <CardDescription>قائمة بجميع المرضى في النظام</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="البحث..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا يوجد مرضى مسجلين. قم بإضافة مريض جديد للبدء.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>العمر</TableHead>
                    <TableHead>الجنس</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>رقم الهوية</TableHead>
                    <TableHead>آخر زيارة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.nationalId}</TableCell>
                      <TableCell>{patient.lastVisit || 'لا يوجد'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">عرض</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="glass border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>المواعيد القادمة</CardTitle>
            <CardDescription>جدول المواعيد المحجوزة</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد مواعيد مجدولة حالياً.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المريض</TableHead>
                    <TableHead>اسم الطبيب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>نوع الفحص</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell className="font-medium">{appointment.patientName}</TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.type}</TableCell>
                      <TableCell>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
