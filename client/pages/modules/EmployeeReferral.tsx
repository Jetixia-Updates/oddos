import React, { useState, useEffect } from "react";
import { Users, UserPlus, DollarSign, Award, TrendingUp, Gift, Star, ThumbsUp, Search, Plus, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Referral {
  _id: string;
  referralCode: string;
  referredBy: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  department: string;
  resume: string;
  referralDate: string;
  status: 'pending' | 'contacted' | 'interview-scheduled' | 'accepted' | 'rejected' | 'hired';
  notes: string;
  hiringDate?: string;
}

interface Bonus {
  _id: string;
  referralId: string;
  referredBy: string;
  candidateName: string;
  position: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: string;
  paidDate?: string;
  notes: string;
}

interface ProgramSettings {
  _id?: string;
  bonusTiers: {
    junior: number;
    midLevel: number;
    senior: number;
    executive: number;
  };
  eligibilityRules: {
    probationCompleted: boolean;
    activeEmployment: boolean;
    minimumTenure: number;
  };
  paymentTerms: {
    paymentAfter: number;
    paymentSchedule: string;
  };
  programActive: boolean;
}

interface Analytics {
  totalReferrals: number;
  pending: number;
  accepted: number;
  hired: number;
  totalBonusPaid: number;
  conversionRate: number;
  topReferrers: Array<{ employeeId: string; employeeName: string; count: number; successRate: number }>;
  monthlyReferrals: Array<{ month: string; count: number }>;
  referralsByStatus: Record<string, number>;
}

export default function EmployeeReferral() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<ProgramSettings>({
    bonusTiers: { junior: 500, midLevel: 1000, senior: 2000, executive: 5000 },
    eligibilityRules: { probationCompleted: true, activeEmployment: true, minimumTenure: 3 },
    paymentTerms: { paymentAfter: 3, paymentSchedule: 'after-confirmation' },
    programActive: true
  });
  
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [referralForm, setReferralForm] = useState<Partial<Referral>>({
    referralCode: '',
    referredBy: '',
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: '',
    department: '',
    resume: '',
    referralDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    hiringDate: ''
  });

  const [bonusForm, setBonusForm] = useState<Partial<Bonus>>({
    referralId: '',
    referredBy: '',
    candidateName: '',
    position: '',
    amount: 0,
    status: 'pending',
    approvedBy: '',
    paidDate: '',
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, b, e, a, s] = await Promise.all([
        fetch('/api/referrals/referrals').then(res => res.json()).catch(() => []),
        fetch('/api/referrals/bonuses').then(res => res.json()).catch(() => []),
        fetch('/api/hr/employees').then(res => res.json()).catch(() => []),
        fetch('/api/referrals/analytics').then(res => res.json()).catch(() => null),
        fetch('/api/referrals/settings').then(res => res.json()).catch(() => null)
      ]);
      setReferrals(Array.isArray(r) ? r : []);
      setBonuses(Array.isArray(b) ? b : []);
      setEmployees(Array.isArray(e) ? e : []);
      setAnalytics(a);
      if (s) setSettings(s);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const generateReferralCode = () => {
    return `REF-${Date.now()}`;
  };

  const handleSaveReferral = async () => {
    try {
      if (!editingReferral) {
        referralForm.referralCode = generateReferralCode();
      }
      const url = editingReferral ? `/api/referrals/referrals/${editingReferral._id}` : '/api/referrals/referrals';
      await fetch(url, {
        method: editingReferral ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralForm)
      });
      fetchData();
      setShowReferralDialog(false);
      resetReferralForm();
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  };

  const handleDeleteReferral = async (id: string) => {
    if (!confirm('Delete this referral?')) return;
    try {
      await fetch(`/api/referrals/referrals/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting referral:', error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Referral['status']) => {
    try {
      await fetch(`/api/referrals/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveBonus = async () => {
    try {
      const url = editingBonus ? `/api/referrals/bonuses/${editingBonus._id}` : '/api/referrals/bonuses';
      await fetch(url, {
        method: editingBonus ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bonusForm)
      });
      fetchData();
      setShowBonusDialog(false);
      resetBonusForm();
    } catch (error) {
      console.error('Error saving bonus:', error);
    }
  };

  const handleDeleteBonus = async (id: string) => {
    if (!confirm('Delete this bonus?')) return;
    try {
      await fetch(`/api/referrals/bonuses/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
  };

  const handleApproveBonus = async (id: string) => {
    try {
      await fetch(`/api/referrals/bonuses/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error approving bonus:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await fetch(`/api/referrals/bonuses/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error marking bonus as paid:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/referrals/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetReferralForm = () => {
    setReferralForm({
      referralCode: '',
      referredBy: '',
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      position: '',
      department: '',
      resume: '',
      referralDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: '',
      hiringDate: ''
    });
    setEditingReferral(null);
  };

  const resetBonusForm = () => {
    setBonusForm({
      referralId: '',
      referredBy: '',
      candidateName: '',
      position: '',
      amount: 0,
      status: 'pending',
      approvedBy: '',
      paidDate: '',
      notes: ''
    });
    setEditingBonus(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      contacted: 'bg-blue-500/20 text-blue-500',
      'interview-scheduled': 'bg-purple-500/20 text-purple-500',
      accepted: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
      hired: 'bg-emerald-500/20 text-emerald-500',
      approved: 'bg-green-500/20 text-green-500',
      paid: 'bg-blue-500/20 text-blue-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getNextStatusOptions = (currentStatus: Referral['status']) => {
    const statusFlow: Record<string, Referral['status'][]> = {
      pending: ['contacted', 'rejected'],
      contacted: ['interview-scheduled', 'rejected'],
      'interview-scheduled': ['accepted', 'rejected'],
      accepted: ['hired', 'rejected'],
      rejected: [],
      hired: []
    };
    return statusFlow[currentStatus] || [];
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = !searchTerm || 
      referral.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employees.find(e => e._id === referral.referredBy)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || referral.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getEmployeeBonusStats = (employeeId: string) => {
    const employeeBonuses = bonuses.filter(b => b.referredBy === employeeId);
    const totalAmount = employeeBonuses.reduce((sum, b) => sum + (b.status === 'paid' ? b.amount : 0), 0);
    const pendingAmount = employeeBonuses.reduce((sum, b) => sum + (b.status === 'pending' || b.status === 'approved' ? b.amount : 0), 0);
    return { total: totalAmount, pending: pendingAmount, count: employeeBonuses.length };
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Employee Referral Program</h1>
            <p className="text-muted-foreground">Manage employee referrals and rewards</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalReferrals || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{analytics?.pending || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.accepted || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">In process</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">{analytics?.hired || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Successfully hired</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Bonus Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">${analytics?.totalBonusPaid || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Rewards distributed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top Referrers
                </CardTitle>
                <CardDescription>Employees with most successful referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topReferrers?.slice(0, 10).map((referrer, idx) => (
                    <div key={referrer.employeeId} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{referrer.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{referrer.count} successful referrals</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-500">
                          {Math.round(referrer.successRate)}% success
                        </Badge>
                      </div>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Recent Referrals
                </CardTitle>
                <CardDescription>Latest 10 referrals submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.slice(0, 10).map(referral => {
                    const referrer = employees.find(e => e._id === referral.referredBy);
                    return (
                      <div key={referral._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <p className="font-semibold">{referral.candidateName}</p>
                          <p className="text-sm text-muted-foreground">
                            Referred by {referrer?.name || 'Unknown'} • {referral.position}
                          </p>
                        </div>
                        <Badge className={getStatusBadgeClass(referral.status)}>
                          {referral.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    );
                  }) || <p className="text-center text-muted-foreground py-8">No referrals yet</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Referral Conversion Funnel
              </CardTitle>
              <CardDescription>Track referral progress through hiring stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'Pending', count: analytics?.referralsByStatus?.pending || 0, color: 'from-yellow-500 to-orange-500' },
                  { status: 'Contacted', count: analytics?.referralsByStatus?.contacted || 0, color: 'from-blue-500 to-cyan-500' },
                  { status: 'Interview Scheduled', count: analytics?.referralsByStatus?.['interview-scheduled'] || 0, color: 'from-purple-500 to-pink-500' },
                  { status: 'Accepted', count: analytics?.referralsByStatus?.accepted || 0, color: 'from-green-500 to-emerald-500' },
                  { status: 'Hired', count: analytics?.referralsByStatus?.hired || 0, color: 'from-emerald-500 to-teal-500' }
                ].map((stage, idx) => (
                  <div key={stage.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stage.status}</span>
                      <span className="text-sm font-bold">{stage.count}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${stage.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${((stage.count) / (analytics?.totalReferrals || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Referral Management</CardTitle>
                  <CardDescription>Track and manage all employee referrals</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetReferralForm(); setShowReferralDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Referral
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by candidate, referrer, or position..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interview-scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Referred By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading referrals...
                        </TableCell>
                      </TableRow>
                    ) : filteredReferrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No referrals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReferrals.map((referral) => {
                        const referrer = employees.find(e => e._id === referral.referredBy);
                        const nextStatuses = getNextStatusOptions(referral.status);
                        return (
                          <TableRow key={referral._id}>
                            <TableCell className="font-mono text-xs">{referral.referralCode}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{referral.candidateName}</p>
                                <p className="text-xs text-muted-foreground">{referral.candidateEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>{referral.position}</TableCell>
                            <TableCell className="font-semibold">{referrer?.name || 'Unknown'}</TableCell>
                            <TableCell>{new Date(referral.referralDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(referral.status)}>
                                {referral.status.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => { 
                                    setEditingReferral(referral); 
                                    setReferralForm(referral); 
                                    setShowReferralDialog(true); 
                                  }}
                                >
                                  Edit
                                </Button>
                                {nextStatuses.map(status => (
                                  <Button 
                                    key={status}
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(referral._id, status)}
                                  >
                                    {status.replace('-', ' ')}
                                  </Button>
                                ))}
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteReferral(referral._id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonuses Tab */}
        <TabsContent value="bonuses" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Referral Bonuses
                  </CardTitle>
                  <CardDescription>Manage and track referral rewards</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetBonusForm(); setShowBonusDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Bonus
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading bonuses...
                        </TableCell>
                      </TableRow>
                    ) : bonuses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No bonuses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bonuses.map((bonus) => {
                        const referrer = employees.find(e => e._id === bonus.referredBy);
                        return (
                          <TableRow key={bonus._id}>
                            <TableCell className="font-semibold">{referrer?.name || 'Unknown'}</TableCell>
                            <TableCell>{bonus.candidateName}</TableCell>
                            <TableCell>{bonus.position}</TableCell>
                            <TableCell className="font-bold text-green-500">${bonus.amount}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(bonus.status)}>
                                {bonus.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {bonus.paidDate ? new Date(bonus.paidDate).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {bonus.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApproveBonus(bonus._id)}
                                  >
                                    <ThumbsUp className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                )}
                                {bonus.status === 'approved' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500/20 text-green-500"
                                    onClick={() => handleMarkPaid(bonus._id)}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => { 
                                    setEditingBonus(bonus); 
                                    setBonusForm(bonus); 
                                    setShowBonusDialog(true); 
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteBonus(bonus._id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-500" />
                  Bonus Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Total Paid</span>
                    <span className="font-bold text-green-500">
                      ${bonuses.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Approved (Pending Payment)</span>
                    <span className="font-bold text-blue-500">
                      ${bonuses.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Awaiting Approval</span>
                    <span className="font-bold text-yellow-500">
                      ${bonuses.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="font-bold text-red-500">
                      ${bonuses.filter(b => b.status === 'rejected').reduce((sum, b) => sum + b.amount, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Top Earners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .map(emp => ({
                      ...emp,
                      stats: getEmployeeBonusStats(emp._id)
                    }))
                    .filter(emp => emp.stats.total > 0)
                    .sort((a, b) => b.stats.total - a.stats.total)
                    .slice(0, 5)
                    .map((emp, idx) => (
                      <div key={emp._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.stats.count} bonuses</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-500">${emp.stats.total}</p>
                          {emp.stats.pending > 0 && (
                            <p className="text-xs text-yellow-500">+${emp.stats.pending} pending</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Referral Program Settings
              </CardTitle>
              <CardDescription>Configure referral program rules and rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bonus Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Junior Position</Label>
                    <Input 
                      type="number" 
                      value={settings.bonusTiers.junior}
                      onChange={(e) => setSettings({
                        ...settings,
                        bonusTiers: { ...settings.bonusTiers, junior: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mid-Level Position</Label>
                    <Input 
                      type="number" 
                      value={settings.bonusTiers.midLevel}
                      onChange={(e) => setSettings({
                        ...settings,
                        bonusTiers: { ...settings.bonusTiers, midLevel: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senior Position</Label>
                    <Input 
                      type="number" 
                      value={settings.bonusTiers.senior}
                      onChange={(e) => setSettings({
                        ...settings,
                        bonusTiers: { ...settings.bonusTiers, senior: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Executive Position</Label>
                    <Input 
                      type="number" 
                      value={settings.bonusTiers.executive}
                      onChange={(e) => setSettings({
                        ...settings,
                        bonusTiers: { ...settings.bonusTiers, executive: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eligibility Rules</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.eligibilityRules.probationCompleted}
                      onChange={(e) => setSettings({
                        ...settings,
                        eligibilityRules: { ...settings.eligibilityRules, probationCompleted: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    <Label>Employee must have completed probation period</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.eligibilityRules.activeEmployment}
                      onChange={(e) => setSettings({
                        ...settings,
                        eligibilityRules: { ...settings.eligibilityRules, activeEmployment: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    <Label>Employee must be actively employed</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Minimum Tenure (months):</Label>
                    <Input 
                      type="number" 
                      className="w-32"
                      value={settings.eligibilityRules.minimumTenure}
                      onChange={(e) => setSettings({
                        ...settings,
                        eligibilityRules: { ...settings.eligibilityRules, minimumTenure: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment After (months)</Label>
                    <Input 
                      type="number" 
                      value={settings.paymentTerms.paymentAfter}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentTerms: { ...settings.paymentTerms, paymentAfter: parseInt(e.target.value) || 0 }
                      })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Bonus paid after candidate completes this many months
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Schedule</Label>
                    <Select 
                      value={settings.paymentTerms.paymentSchedule}
                      onValueChange={(value) => setSettings({
                        ...settings,
                        paymentTerms: { ...settings.paymentTerms, paymentSchedule: value }
                      })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="after-confirmation">After Confirmation Period</SelectItem>
                        <SelectItem value="next-payroll">Next Payroll Cycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Program Status</h3>
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    checked={settings.programActive}
                    onChange={(e) => setSettings({ ...settings, programActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Referral Program Active</Label>
                  <Badge className={settings.programActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                    {settings.programActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSettings} className="gradient-primary">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReferral ? 'Edit Referral' : 'New Referral'}</DialogTitle>
            <DialogDescription>Fill in the referral details below</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingReferral && (
              <div className="space-y-2">
                <Label>Referral Code</Label>
                <Input value={referralForm.referralCode} disabled className="font-mono" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Referred By *</Label>
              <Select value={referralForm.referredBy} onValueChange={(value) => setReferralForm({...referralForm, referredBy: value})}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name *</Label>
                <Input value={referralForm.candidateName} onChange={(e) => setReferralForm({...referralForm, candidateName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Candidate Email *</Label>
                <Input type="email" value={referralForm.candidateEmail} onChange={(e) => setReferralForm({...referralForm, candidateEmail: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Phone</Label>
                <Input value={referralForm.candidatePhone} onChange={(e) => setReferralForm({...referralForm, candidatePhone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Referral Date</Label>
                <Input type="date" value={referralForm.referralDate} onChange={(e) => setReferralForm({...referralForm, referralDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input value={referralForm.position} onChange={(e) => setReferralForm({...referralForm, position: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Input value={referralForm.department} onChange={(e) => setReferralForm({...referralForm, department: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Resume Link / Text</Label>
              <Textarea 
                value={referralForm.resume} 
                onChange={(e) => setReferralForm({...referralForm, resume: e.target.value})} 
                rows={3}
                placeholder="Paste resume link or key qualifications"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={referralForm.status} onValueChange={(value) => setReferralForm({...referralForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interview-scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hiring Date</Label>
                <Input type="date" value={referralForm.hiringDate} onChange={(e) => setReferralForm({...referralForm, hiringDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={referralForm.notes} 
                onChange={(e) => setReferralForm({...referralForm, notes: e.target.value})} 
                rows={3}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReferralDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveReferral} className="gradient-primary">Save Referral</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bonus Dialog */}
      <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBonus ? 'Edit Bonus' : 'New Bonus'}</DialogTitle>
            <DialogDescription>Configure referral bonus details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Referral</Label>
              <Select value={bonusForm.referralId} onValueChange={(value) => {
                const referral = referrals.find(r => r._id === value);
                if (referral) {
                  setBonusForm({
                    ...bonusForm,
                    referralId: value,
                    referredBy: referral.referredBy,
                    candidateName: referral.candidateName,
                    position: referral.position
                  });
                }
              }}>
                <SelectTrigger><SelectValue placeholder="Select referral" /></SelectTrigger>
                <SelectContent>
                  {referrals.filter(r => r.status === 'hired').map(ref => (
                    <SelectItem key={ref._id} value={ref._id}>
                      {ref.candidateName} - {ref.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Referrer</Label>
                <Select value={bonusForm.referredBy} onValueChange={(value) => setBonusForm({...bonusForm, referredBy: value})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bonus Amount *</Label>
                <Input type="number" value={bonusForm.amount} onChange={(e) => setBonusForm({...bonusForm, amount: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name</Label>
                <Input value={bonusForm.candidateName} onChange={(e) => setBonusForm({...bonusForm, candidateName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={bonusForm.position} onChange={(e) => setBonusForm({...bonusForm, position: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={bonusForm.status} onValueChange={(value) => setBonusForm({...bonusForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paid Date</Label>
                <Input type="date" value={bonusForm.paidDate} onChange={(e) => setBonusForm({...bonusForm, paidDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={bonusForm.notes} 
                onChange={(e) => setBonusForm({...bonusForm, notes: e.target.value})} 
                rows={3}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBonusDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBonus} className="gradient-primary">Save Bonus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
