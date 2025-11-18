import React, { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({
    employeeId: '',
    contractType: 'permanent',
    startDate: '',
    endDate: '',
    salary: 0,
    currency: 'USD',
    status: 'active',
    terms: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [c, e] = await Promise.all([
        fetch('/api/contracts/contracts').then(r => r.json()).catch(() => []),
        fetch('/api/hr/employees').then(r => r.json()).catch(() => [])
      ]);
      setContracts(Array.isArray(c) ? c : []);
      setEmployees(Array.isArray(e) ? e : []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    const url = editingItem ? `/api/contracts/contracts/${editingItem._id}` : '/api/contracts/contracts';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    fetchData();
    setShowDialog(false);
    setForm({ employeeId: '', contractType: 'permanent', startDate: '', endDate: '', salary: 0, currency: 'USD', status: 'active', terms: '' });
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contract?')) return;
    await fetch(`/api/contracts/contracts/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Employee Contracts</h1>
            <p className="text-muted-foreground">Manage employment contracts</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Contracts</CardTitle>
                <Button className="gradient-primary" onClick={() => { setEditingItem(null); setShowDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.filter(c => c.status === 'active').map((contract) => {
                    const employee = employees.find(e => e._id === contract.employeeId);
                    return (
                      <TableRow key={contract._id}>
                        <TableCell className="font-semibold">{employee?.name || 'Unknown'}</TableCell>
                        <TableCell><Badge>{contract.contractType}</Badge></TableCell>
                        <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Indefinite'}</TableCell>
                        <TableCell className="font-bold">${contract.salary} {contract.currency}</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-500">{contract.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingItem(contract); setForm(contract); setShowDialog(true); }}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(contract._id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card className="glass border-white/10">
            <CardHeader><CardTitle>Expired Contracts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No expired contracts</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className="glass border-white/10">
            <CardHeader><CardTitle>All Contracts</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => {
                    const employee = employees.find(e => e._id === contract.employeeId);
                    return (
                      <TableRow key={contract._id}>
                        <TableCell>{employee?.name || 'Unknown'}</TableCell>
                        <TableCell><Badge>{contract.contractType}</Badge></TableCell>
                        <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>${contract.salary}</TableCell>
                        <TableCell><Badge>{contract.status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Contract' : 'New Contract'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={(value) => setForm({...form, employeeId: value})}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Type</Label>
                <Select value={form.contractType} onValueChange={(value) => setForm({...form, contractType: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({...form, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary *</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({...form, salary: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(value) => setForm({...form, currency: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
