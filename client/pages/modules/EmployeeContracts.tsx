import React, { useState, useEffect } from "react";
import { FileText, Plus, Search, Download, RefreshCw, XCircle, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
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

interface Contract {
  _id: string;
  employeeId: string;
  contractType: 'permanent' | 'temporary' | 'contract' | 'internship' | 'probation';
  startDate: string;
  endDate: string;
  salary: number;
  currency: 'USD' | 'EUR' | 'SAR' | 'AED';
  position: string;
  department: string;
  benefits: string;
  terms: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'suspended';
  signedDate: string;
  probationPeriod: number;
  noticePeriod: number;
  workingHours: number;
}

interface Template {
  _id: string;
  name: string;
  contractType: string;
  defaultSalary: number;
  defaultBenefits: string;
  defaultTerms: string;
  isActive: boolean;
}

interface RenewalRecord {
  _id: string;
  contractId: string;
  oldEndDate: string;
  newEndDate: string;
  oldSalary: number;
  newSalary: number;
  renewalDate: string;
  notes: string;
}

interface Analytics {
  totalContracts: number;
  activeContracts: number;
  expiringSoon: number;
  expired: number;
  contractsByType: Record<string, number>;
  averageSalaryByType: Record<string, number>;
  monthlyStats: Array<{ month: string; count: number }>;
}

export default function EmployeeContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Contract | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Partial<Contract>>({
    employeeId: '',
    contractType: 'permanent',
    startDate: '',
    endDate: '',
    salary: 0,
    currency: 'USD',
    position: '',
    department: '',
    benefits: '',
    terms: '',
    status: 'draft',
    signedDate: '',
    probationPeriod: 0,
    noticePeriod: 30,
    workingHours: 40
  });

  const [templateForm, setTemplateForm] = useState<Partial<Template>>({
    name: '',
    contractType: 'permanent',
    defaultSalary: 0,
    defaultBenefits: '',
    defaultTerms: '',
    isActive: true
  });

  const [renewalForm, setRenewalForm] = useState({
    newEndDate: '',
    newSalary: 0,
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, e, t, r, a] = await Promise.all([
        fetch('/api/contracts/contracts').then(r => r.json()).catch(() => []),
        fetch('/api/hr/employees').then(r => r.json()).catch(() => []),
        fetch('/api/contracts/templates').then(r => r.json()).catch(() => []),
        fetch('/api/contracts/renewals').then(r => r.json()).catch(() => []),
        fetch('/api/contracts/analytics').then(r => r.json()).catch(() => null)
      ]);
      setContracts(Array.isArray(c) ? c : []);
      setEmployees(Array.isArray(e) ? e : []);
      setTemplates(Array.isArray(t) ? t : []);
      setRenewals(Array.isArray(r) ? r : []);
      setAnalytics(a);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `/api/contracts/contracts/${editingItem._id}` : '/api/contracts/contracts';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      fetchData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contract?')) return;
    try {
      await fetch(`/api/contracts/contracts/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handleRenew = async () => {
    if (!renewingContract) return;
    try {
      await fetch(`/api/contracts/contracts/${renewingContract._id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewalForm)
      });
      fetchData();
      setShowRenewalDialog(false);
      setRenewingContract(null);
      setRenewalForm({ newEndDate: '', newSalary: 0, notes: '' });
    } catch (error) {
      console.error('Error renewing contract:', error);
    }
  };

  const handleTerminate = async (id: string) => {
    if (!confirm('Terminate this contract?')) return;
    try {
      await fetch(`/api/contracts/contracts/${id}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error terminating contract:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const url = editingTemplate ? `/api/contracts/templates/${editingTemplate._id}` : '/api/contracts/templates';
      await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });
      fetchData();
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', contractType: 'permanent', defaultSalary: 0, defaultBenefits: '', defaultTerms: '', isActive: true });
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await fetch(`/api/contracts/templates/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const useTemplate = (template: Template) => {
    setForm({
      ...form,
      contractType: template.contractType as any,
      salary: template.defaultSalary,
      benefits: template.defaultBenefits,
      terms: template.defaultTerms
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setForm({
      employeeId: '',
      contractType: 'permanent',
      startDate: '',
      endDate: '',
      salary: 0,
      currency: 'USD',
      position: '',
      department: '',
      benefits: '',
      terms: '',
      status: 'draft',
      signedDate: '',
      probationPeriod: 0,
      noticePeriod: 30,
      workingHours: 40
    });
    setEditingItem(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-500',
      active: 'bg-green-500/20 text-green-500',
      expired: 'bg-red-500/20 text-red-500',
      terminated: 'bg-orange-500/20 text-orange-500',
      suspended: 'bg-yellow-500/20 text-yellow-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      permanent: 'bg-blue-500/20 text-blue-500',
      temporary: 'bg-purple-500/20 text-purple-500',
      contract: 'bg-cyan-500/20 text-cyan-500',
      internship: 'bg-pink-500/20 text-pink-500',
      probation: 'bg-amber-500/20 text-amber-500'
    };
    return classes[type] || 'bg-gray-500/20 text-gray-500';
  };

  const isExpiringSoon = (endDate: string) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const filteredContracts = contracts.filter(contract => {
    const employee = employees.find(e => e._id === contract.employeeId);
    const matchesSearch = !searchTerm || 
      (employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contract.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.contractType === filterType;
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const expiringContracts = contracts.filter(c => c.status === 'active' && c.endDate && isExpiringSoon(c.endDate));
  const contractsDueForRenewal = contracts.filter(c => {
    if (!c.endDate || c.status !== 'active') return false;
    const end = new Date(c.endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Employee Contracts</h1>
            <p className="text-muted-foreground">Comprehensive contract management system</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalContracts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.activeContracts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">{analytics?.expiringSoon || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{analytics?.expired || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Past end date</p>
              </CardContent>
            </Card>
          </div>

          {expiringContracts.length > 0 && (
            <Card className="glass border-white/10 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-orange-500">Contracts Expiring Soon</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringContracts.slice(0, 5).map(contract => {
                    const employee = employees.find(e => e._id === contract.employeeId);
                    const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={contract._id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                        <div>
                          <p className="font-semibold">{employee?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{contract.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-500">{daysLeft} days left</p>
                          <p className="text-sm text-muted-foreground">{new Date(contract.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Recent Contracts</CardTitle>
                <CardDescription>Last 10 contracts added</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts.slice(0, 10).map(contract => {
                    const employee = employees.find(e => e._id === contract.employeeId);
                    return (
                      <div key={contract._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <p className="font-semibold">{employee?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{contract.position}</p>
                        </div>
                        <Badge className={getStatusBadgeClass(contract.status)}>{contract.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Contract Type Breakdown</CardTitle>
                <CardDescription>Distribution by contract type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.contractsByType || {}).map(([type, count]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${((count as number) / (analytics?.totalContracts || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Contract Management</CardTitle>
                  <CardDescription>Manage all employee contracts</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetForm(); setShowDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by employee, position, or department..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Loading contracts...
                        </TableCell>
                      </TableRow>
                    ) : filteredContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No contracts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContracts.map((contract) => {
                        const employee = employees.find(e => e._id === contract.employeeId);
                        return (
                          <TableRow key={contract._id}>
                            <TableCell className="font-semibold">{employee?.name || 'Unknown'}</TableCell>
                            <TableCell><Badge className={getTypeBadgeClass(contract.contractType)}>{contract.contractType}</Badge></TableCell>
                            <TableCell>{contract.position}</TableCell>
                            <TableCell>{contract.department}</TableCell>
                            <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {contract.endDate ? (
                                <span className={isExpiringSoon(contract.endDate) ? 'text-orange-500 font-semibold' : ''}>
                                  {new Date(contract.endDate).toLocaleDateString()}
                                </span>
                              ) : 'Indefinite'}
                            </TableCell>
                            <TableCell className="font-bold">{contract.salary} {contract.currency}</TableCell>
                            <TableCell><Badge className={getStatusBadgeClass(contract.status)}>{contract.status}</Badge></TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingItem(contract); setForm(contract); setShowDialog(true); }}>Edit</Button>
                                <Button size="sm" variant="ghost" onClick={() => { setRenewingContract(contract); setRenewalForm({ ...renewalForm, newSalary: contract.salary }); setShowRenewalDialog(true); }}>
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleTerminate(contract._id)}>
                                  <XCircle className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(contract._id)}>Delete</Button>
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

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contract Templates</CardTitle>
                  <CardDescription>Reusable contract templates library</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { setEditingTemplate(null); setShowTemplateDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge className={getTypeBadgeClass(template.contractType)}>{template.contractType}</Badge>
                        </div>
                        <Badge className={template.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Default Salary</p>
                        <p className="font-bold">${template.defaultSalary}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => useTemplate(template)}>Use Template</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setTemplateForm(template); setShowTemplateDialog(true); }}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template._id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renewals Tab */}
        <TabsContent value="renewals" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Contracts Due for Renewal</CardTitle>
              <CardDescription>Contracts ending in the next 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Current Salary</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractsDueForRenewal.map(contract => {
                    const employee = employees.find(e => e._id === contract.employeeId);
                    const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={contract._id}>
                        <TableCell className="font-semibold">{employee?.name || 'Unknown'}</TableCell>
                        <TableCell>{contract.position}</TableCell>
                        <TableCell><Badge className={getTypeBadgeClass(contract.contractType)}>{contract.contractType}</Badge></TableCell>
                        <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold">{contract.salary} {contract.currency}</TableCell>
                        <TableCell>
                          <Badge className={daysLeft <= 30 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}>
                            {daysLeft} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => { setRenewingContract(contract); setRenewalForm({ newEndDate: '', newSalary: contract.salary, notes: '' }); setShowRenewalDialog(true); }}>
                            <RefreshCw className="w-3 h-3 mr-2" />Renew
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Renewal History</CardTitle>
              <CardDescription>Past contract renewals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Old End Date</TableHead>
                    <TableHead>New End Date</TableHead>
                    <TableHead>Old Salary</TableHead>
                    <TableHead>New Salary</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renewals.map(renewal => {
                    const contract = contracts.find(c => c._id === renewal.contractId);
                    const employee = employees.find(e => e._id === contract?.employeeId);
                    return (
                      <TableRow key={renewal._id}>
                        <TableCell className="font-semibold">{employee?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(renewal.renewalDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(renewal.oldEndDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-green-500 font-semibold">{new Date(renewal.newEndDate).toLocaleDateString()}</TableCell>
                        <TableCell>{renewal.oldSalary}</TableCell>
                        <TableCell className="text-green-500 font-semibold">{renewal.newSalary}</TableCell>
                        <TableCell>{renewal.notes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Contract Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Total Contracts</span>
                    <span className="font-bold">{analytics?.totalContracts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Active Contracts</span>
                    <span className="font-bold text-green-500">{analytics?.activeContracts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Expiring Soon</span>
                    <span className="font-bold text-orange-500">{analytics?.expiringSoon || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Expired</span>
                    <span className="font-bold text-red-500">{analytics?.expired || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Average Salary by Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics?.averageSalaryByType || {}).map(([type, avg]) => (
                  <div key={type} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium capitalize">{type}</span>
                    <span className="font-bold">${Math.round(avg as number).toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Contract Statistics</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.monthlyStats?.map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">{stat.month}</span>
                    <span className="font-bold">{stat.count} contracts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Contract' : 'New Contract'}</DialogTitle>
            <DialogDescription>Fill in the contract details below</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={form.employeeId} onValueChange={(value) => setForm({...form, employeeId: value})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contract Type *</Label>
                <Select value={form.contractType} onValueChange={(value) => setForm({...form, contractType: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position *</Label>
                <Input value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Input value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Signed Date</Label>
                <Input type="date" value={form.signedDate} onChange={(e) => setForm({...form, signedDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary *</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(value) => setForm({...form, currency: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Probation Period (months)</Label>
                <Input type="number" value={form.probationPeriod} onChange={(e) => setForm({...form, probationPeriod: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Notice Period (days)</Label>
                <Input type="number" value={form.noticePeriod} onChange={(e) => setForm({...form, noticePeriod: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Working Hours/Week</Label>
                <Input type="number" value={form.workingHours} onChange={(e) => setForm({...form, workingHours: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({...form, status: value as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Benefits</Label>
              <Textarea value={form.benefits} onChange={(e) => setForm({...form, benefits: e.target.value})} rows={3} placeholder="Health insurance, annual leave, etc." />
            </div>
            <div className="space-y-2">
              <Label>Terms & Conditions</Label>
              <Textarea value={form.terms} onChange={(e) => setForm({...form, terms: e.target.value})} rows={4} placeholder="Contract terms and conditions..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gradient-primary">Save Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>Create a reusable contract template</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input value={templateForm.name} onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g., Standard Permanent Contract" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Type *</Label>
                <Select value={templateForm.contractType} onValueChange={(value) => setTemplateForm({...templateForm, contractType: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Salary</Label>
                <Input type="number" value={templateForm.defaultSalary} onChange={(e) => setTemplateForm({...templateForm, defaultSalary: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default Benefits</Label>
              <Textarea value={templateForm.defaultBenefits} onChange={(e) => setTemplateForm({...templateForm, defaultBenefits: e.target.value})} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Default Terms</Label>
              <Textarea value={templateForm.defaultTerms} onChange={(e) => setTemplateForm({...templateForm, defaultTerms: e.target.value})} rows={4} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={templateForm.isActive} onChange={(e) => setTemplateForm({...templateForm, isActive: e.target.checked})} />
              <Label>Active Template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} className="gradient-primary">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renewal Dialog */}
      <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Contract</DialogTitle>
            <DialogDescription>
              {renewingContract && employees.find(e => e._id === renewingContract.employeeId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>New End Date *</Label>
              <Input type="date" value={renewalForm.newEndDate} onChange={(e) => setRenewalForm({...renewalForm, newEndDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>New Salary *</Label>
              <Input type="number" value={renewalForm.newSalary} onChange={(e) => setRenewalForm({...renewalForm, newSalary: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={renewalForm.notes} onChange={(e) => setRenewalForm({...renewalForm, notes: e.target.value})} rows={3} placeholder="Renewal notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>Cancel</Button>
            <Button onClick={handleRenew} className="gradient-primary">Renew Contract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
