import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Edit, Trash2, Calculator, Receipt, Wallet, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [showTaxDialog, setShowTaxDialog] = useState(false);
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [payrollForm, setPayrollForm] = useState({ employeeId: '', employeeName: '', payPeriodStart: '', payPeriodEnd: '', basicSalary: 0, allowances: 0, deductions: 0, tax: 0, grossPay: 0, netPay: 0, status: 'draft' });
  const [componentForm, setComponentForm] = useState({ name: '', componentType: 'allowance', calculationType: 'fixed', amount: 0, description: '', status: 'active' });
  const [taxForm, setTaxForm] = useState({ name: '', minIncome: 0, maxIncome: 0, taxPercentage: 0, description: '', status: 'active' });
  const [bonusForm, setBonusForm] = useState({ employeeId: '', employeeName: '', amount: 0, bonusDate: '', reason: '', status: 'pending' });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const gross = payrollForm.basicSalary + payrollForm.allowances;
    const net = gross - payrollForm.deductions - payrollForm.tax;
    setPayrollForm(prev => ({ ...prev, grossPay: gross, netPay: net }));
  }, [payrollForm.basicSalary, payrollForm.allowances, payrollForm.deductions, payrollForm.tax]);

  const fetchData = async () => {
    try {
      const [pr, sc, tr, b, an] = await Promise.all([
        fetch('/api/payroll/records').then(r => r.json()).catch(() => []),
        fetch('/api/payroll/salary-components').then(r => r.json()).catch(() => []),
        fetch('/api/payroll/tax-rules').then(r => r.json()).catch(() => []),
        fetch('/api/payroll/bonuses').then(r => r.json()).catch(() => []),
        fetch('/api/payroll/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setPayrollRecords(Array.isArray(pr) ? pr : []);
      setSalaryComponents(Array.isArray(sc) ? sc : []);
      setTaxRules(Array.isArray(tr) ? tr : []);
      setBonuses(Array.isArray(b) ? b : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setPayrollRecords([]);
      setSalaryComponents([]);
      setTaxRules([]);
      setBonuses([]);
      setAnalytics({});
    }
  };

  const handleSavePayroll = async () => {
    const url = editingItem ? `/api/payroll/records/${editingItem._id}` : '/api/payroll/records';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payrollForm) });
    fetchData();
    setShowPayrollDialog(false);
    setPayrollForm({ employeeId: '', employeeName: '', payPeriodStart: '', payPeriodEnd: '', basicSalary: 0, allowances: 0, deductions: 0, tax: 0, grossPay: 0, netPay: 0, status: 'draft' });
    setEditingItem(null);
  };

  const handleSaveComponent = async () => {
    const url = editingItem ? `/api/payroll/salary-components/${editingItem._id}` : '/api/payroll/salary-components';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(componentForm) });
    fetchData();
    setShowComponentDialog(false);
    setComponentForm({ name: '', componentType: 'allowance', calculationType: 'fixed', amount: 0, description: '', status: 'active' });
    setEditingItem(null);
  };

  const handleSaveTax = async () => {
    const url = editingItem ? `/api/payroll/tax-rules/${editingItem._id}` : '/api/payroll/tax-rules';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(taxForm) });
    fetchData();
    setShowTaxDialog(false);
    setTaxForm({ name: '', minIncome: 0, maxIncome: 0, taxPercentage: 0, description: '', status: 'active' });
    setEditingItem(null);
  };

  const handleSaveBonus = async () => {
    const url = editingItem ? `/api/payroll/bonuses/${editingItem._id}` : '/api/payroll/bonuses';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bonusForm) });
    fetchData();
    setShowBonusDialog(false);
    setBonusForm({ employeeId: '', employeeName: '', amount: 0, bonusDate: '', reason: '', status: 'pending' });
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/payroll/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-500', approved: 'bg-blue-500/20 text-blue-500', paid: 'bg-green-500/20 text-green-500', pending: 'bg-yellow-500/20 text-yellow-500', active: 'bg-green-500/20 text-green-500', inactive: 'bg-gray-500/20 text-gray-500', cancelled: 'bg-red-500/20 text-red-500' };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Process payroll, manage components, and track bonuses</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="components">Salary Components</TabsTrigger>
          <TabsTrigger value="tax">Tax Rules</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Payroll', value: formatCurrency(analytics?.totalPayroll || 0), icon: Wallet, color: 'text-purple-500', desc: 'This month' },
              { title: 'Avg Salary', value: formatCurrency(analytics?.avgSalary || 0), icon: TrendingUp, color: 'text-blue-500', desc: `${analytics?.employeeCount || 0} employees` },
              { title: 'Processed', value: analytics?.processedPayroll || 0, icon: Receipt, color: 'text-green-500', desc: 'Paid records' },
              { title: 'Pending', value: analytics?.pendingPayroll || 0, icon: Calculator, color: 'text-yellow-500', desc: 'Awaiting processing' }
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
              <CardHeader><CardTitle>Payroll Breakdown</CardTitle><CardDescription>Current month distribution</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gross Pay</span>
                      <span className="font-bold text-green-500">{formatCurrency(analytics?.totalGross || 0)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deductions</span>
                      <span className="font-bold text-orange-500">{formatCurrency(analytics?.totalDeductions || 0)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: analytics?.totalGross ? `${(analytics?.totalDeductions / analytics?.totalGross) * 100}%` : '0%'}}></div></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-bold text-red-500">{formatCurrency(analytics?.totalTax || 0)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: analytics?.totalGross ? `${(analytics?.totalTax / analytics?.totalGross) * 100}%` : '0%'}}></div></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bonuses</span>
                      <span className="font-bold text-blue-500">{formatCurrency(analytics?.totalBonuses || 0)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: analytics?.totalGross ? `${(analytics?.totalBonuses / analytics?.totalGross) * 100}%` : '0%'}}></div></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Net Payroll</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(analytics?.totalPayroll || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Recent Payroll Records</CardTitle><CardDescription>Latest processed records</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payrollRecords.slice(0, 6).map((record) => (
                    <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{record.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{record.payrollNumber} • {formatDate(record.payPeriodStart)}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold">{formatCurrency(record.netPay)}</p>
                        <p className="text-xs text-muted-foreground">Net Pay</p>
                      </div>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>
                  ))}
                  {payrollRecords.length === 0 && <p className="text-center text-muted-foreground py-8">No payroll records</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Payroll Records</CardTitle><CardDescription>Process employee payroll</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setPayrollForm({ employeeId: '', employeeName: '', payPeriodStart: '', payPeriodEnd: '', basicSalary: 0, allowances: 0, deductions: 0, tax: 0, grossPay: 0, netPay: 0, status: 'draft' }); setEditingItem(null); setShowPayrollDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Payroll</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Payroll #</TableHead><TableHead>Employee</TableHead><TableHead>Period</TableHead><TableHead>Basic Salary</TableHead><TableHead>Allowances</TableHead><TableHead>Deductions</TableHead><TableHead>Tax</TableHead><TableHead>Net Pay</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-semibold">{record.payrollNumber}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(record.payPeriodStart)} - {formatDate(record.payPeriodEnd)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell className="text-green-500">{formatCurrency(record.allowances)}</TableCell>
                      <TableCell className="text-orange-500">{formatCurrency(record.deductions)}</TableCell>
                      <TableCell className="text-red-500">{formatCurrency(record.tax)}</TableCell>
                      <TableCell className="font-bold text-lg">{formatCurrency(record.netPay)}</TableCell>
                      <TableCell><Badge className={getStatusColor(record.status)}>{record.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(record); setPayrollForm({ employeeId: record.employeeId, employeeName: record.employeeName, payPeriodStart: record.payPeriodStart, payPeriodEnd: record.payPeriodEnd, basicSalary: record.basicSalary, allowances: record.allowances, deductions: record.deductions, tax: record.tax, grossPay: record.grossPay, netPay: record.netPay, status: record.status }); setShowPayrollDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('records', record._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Salary Components</CardTitle><CardDescription>Manage allowances and deductions</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setComponentForm({ name: '', componentType: 'allowance', calculationType: 'fixed', amount: 0, description: '', status: 'active' }); setEditingItem(null); setShowComponentDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Component</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div>Allowances</h3>
                  <div className="space-y-3">
                    {salaryComponents.filter(c => c.componentType === 'allowance').map((comp) => (
                      <Card key={comp._id} className="glass border-white/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{comp.name}</h4>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingItem(comp); setComponentForm({ name: comp.name, componentType: comp.componentType, calculationType: comp.calculationType, amount: comp.amount, description: comp.description, status: comp.status }); setShowComponentDialog(true); }}><Edit className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete('salary-components', comp._id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{comp.calculationType}</span>
                            <span className="font-bold text-green-500">{comp.calculationType === 'percentage' ? `${comp.amount}%` : formatCurrency(comp.amount)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Deductions</h3>
                  <div className="space-y-3">
                    {salaryComponents.filter(c => c.componentType === 'deduction').map((comp) => (
                      <Card key={comp._id} className="glass border-white/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{comp.name}</h4>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingItem(comp); setComponentForm({ name: comp.name, componentType: comp.componentType, calculationType: comp.calculationType, amount: comp.amount, description: comp.description, status: comp.status }); setShowComponentDialog(true); }}><Edit className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete('salary-components', comp._id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{comp.calculationType}</span>
                            <span className="font-bold text-orange-500">{comp.calculationType === 'percentage' ? `${comp.amount}%` : formatCurrency(comp.amount)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Tax Rules</CardTitle><CardDescription>Configure tax brackets</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setTaxForm({ name: '', minIncome: 0, maxIncome: 0, taxPercentage: 0, description: '', status: 'active' }); setEditingItem(null); setShowTaxDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Tax Rule</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Rule Name</TableHead><TableHead>Income Range</TableHead><TableHead>Tax Rate</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {taxRules.map((rule) => (
                    <TableRow key={rule._id}>
                      <TableCell className="font-semibold">{rule.name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(rule.minIncome)} - {rule.maxIncome === 999999999 ? 'Above' : formatCurrency(rule.maxIncome)}</TableCell>
                      <TableCell className="font-bold text-red-500">{rule.taxPercentage}%</TableCell>
                      <TableCell><Badge className={getStatusColor(rule.status)}>{rule.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(rule); setTaxForm({ name: rule.name, minIncome: rule.minIncome, maxIncome: rule.maxIncome, taxPercentage: rule.taxPercentage, description: rule.description, status: rule.status }); setShowTaxDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('tax-rules', rule._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonuses" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Bonuses</CardTitle><CardDescription>Track employee bonuses</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setBonusForm({ employeeId: '', employeeName: '', amount: 0, bonusDate: '', reason: '', status: 'pending' }); setEditingItem(null); setShowBonusDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Bonus</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Bonus #</TableHead><TableHead>Employee</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus._id}>
                      <TableCell className="font-semibold">{bonus.bonusNumber}</TableCell>
                      <TableCell>{bonus.employeeName}</TableCell>
                      <TableCell className="font-bold text-blue-500">{formatCurrency(bonus.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(bonus.bonusDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{bonus.reason}</TableCell>
                      <TableCell><Badge className={getStatusColor(bonus.status)}>{bonus.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(bonus); setBonusForm({ employeeId: bonus.employeeId, employeeName: bonus.employeeName, amount: bonus.amount, bonusDate: bonus.bonusDate, reason: bonus.reason, status: bonus.status }); setShowBonusDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('bonuses', bonus._id)}><Trash2 className="w-4 h-4" /></Button>
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

      <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Payroll Record' : 'New Payroll Record'}</DialogTitle><DialogDescription>Process employee payroll</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Employee *</label><Input value={payrollForm.employeeName} onChange={(e) => setPayrollForm({...payrollForm, employeeName: e.target.value})} placeholder="Employee name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={payrollForm.status} onValueChange={(value) => setPayrollForm({...payrollForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Period Start *</label><Input type="date" value={payrollForm.payPeriodStart} onChange={(e) => setPayrollForm({...payrollForm, payPeriodStart: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Period End *</label><Input type="date" value={payrollForm.payPeriodEnd} onChange={(e) => setPayrollForm({...payrollForm, payPeriodEnd: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Basic Salary *</label><Input type="number" value={payrollForm.basicSalary} onChange={(e) => setPayrollForm({...payrollForm, basicSalary: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Allowances</label><Input type="number" value={payrollForm.allowances} onChange={(e) => setPayrollForm({...payrollForm, allowances: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Deductions</label><Input type="number" value={payrollForm.deductions} onChange={(e) => setPayrollForm({...payrollForm, deductions: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tax</label><Input type="number" value={payrollForm.tax} onChange={(e) => setPayrollForm({...payrollForm, tax: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div><label className="text-sm font-medium text-muted-foreground">Gross Pay</label><p className="text-2xl font-bold text-green-500">{formatCurrency(payrollForm.grossPay)}</p></div>
              <div><label className="text-sm font-medium text-muted-foreground">Net Pay</label><p className="text-2xl font-bold text-primary">{formatCurrency(payrollForm.netPay)}</p></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowPayrollDialog(false)}>Cancel</Button><Button onClick={handleSavePayroll} className="gradient-primary">Save Payroll</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showComponentDialog} onOpenChange={setShowComponentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Component' : 'New Salary Component'}</DialogTitle><DialogDescription>Configure allowance or deduction</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Component Name *</label><Input value={componentForm.name} onChange={(e) => setComponentForm({...componentForm, name: e.target.value})} placeholder="Housing Allowance" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Type</label><Select value={componentForm.componentType} onValueChange={(value) => setComponentForm({...componentForm, componentType: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="allowance">Allowance</SelectItem><SelectItem value="deduction">Deduction</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Calculation</label><Select value={componentForm.calculationType} onValueChange={(value) => setComponentForm({...componentForm, calculationType: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fixed">Fixed Amount</SelectItem><SelectItem value="percentage">Percentage</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Amount *</label><Input type="number" value={componentForm.amount} onChange={(e) => setComponentForm({...componentForm, amount: Number(e.target.value)})} placeholder={componentForm.calculationType === 'percentage' ? '10' : '500'} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={componentForm.status} onValueChange={(value) => setComponentForm({...componentForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={componentForm.description} onChange={(e) => setComponentForm({...componentForm, description: e.target.value})} placeholder="Component details..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowComponentDialog(false)}>Cancel</Button><Button onClick={handleSaveComponent} className="gradient-primary">Save Component</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTaxDialog} onOpenChange={setShowTaxDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Tax Rule' : 'New Tax Rule'}</DialogTitle><DialogDescription>Configure tax bracket</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Rule Name *</label><Input value={taxForm.name} onChange={(e) => setTaxForm({...taxForm, name: e.target.value})} placeholder="Standard Tax Bracket" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Min Income *</label><Input type="number" value={taxForm.minIncome} onChange={(e) => setTaxForm({...taxForm, minIncome: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Max Income *</label><Input type="number" value={taxForm.maxIncome} onChange={(e) => setTaxForm({...taxForm, maxIncome: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tax Rate (%) *</label><Input type="number" value={taxForm.taxPercentage} onChange={(e) => setTaxForm({...taxForm, taxPercentage: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={taxForm.status} onValueChange={(value) => setTaxForm({...taxForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={taxForm.description} onChange={(e) => setTaxForm({...taxForm, description: e.target.value})} placeholder="Tax rule details..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTaxDialog(false)}>Cancel</Button><Button onClick={handleSaveTax} className="gradient-primary">Save Tax Rule</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Bonus' : 'New Bonus'}</DialogTitle><DialogDescription>Award employee bonus</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Employee *</label><Input value={bonusForm.employeeName} onChange={(e) => setBonusForm({...bonusForm, employeeName: e.target.value})} placeholder="Employee name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Amount *</label><Input type="number" value={bonusForm.amount} onChange={(e) => setBonusForm({...bonusForm, amount: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Bonus Date *</label><Input type="date" value={bonusForm.bonusDate} onChange={(e) => setBonusForm({...bonusForm, bonusDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={bonusForm.status} onValueChange={(value) => setBonusForm({...bonusForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Reason *</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={bonusForm.reason} onChange={(e) => setBonusForm({...bonusForm, reason: e.target.value})} placeholder="Performance bonus, sales achievement, etc." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowBonusDialog(false)}>Cancel</Button><Button onClick={handleSaveBonus} className="gradient-primary">Save Bonus</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
