import React, { useState, useEffect } from "react";
import { Wrench, Plus, Search, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

export default function Repairs() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [repairs, setRepairs] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const [showPartDialog, setShowPartDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [repairForm, setRepairForm] = useState({
    referenceNumber: '',
    productName: '',
    customerName: '',
    customerPhone: '',
    issueDescription: '',
    diagnostics: '',
    status: 'pending',
    priority: 'medium',
    estimatedCost: 0,
    actualCost: 0,
    receivedDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    deliveredDate: '',
    warrantyStatus: 'in-warranty',
    assignedTechnician: ''
  });

  const [partForm, setPartForm] = useState({
    name: '',
    partNumber: '',
    category: 'spare',
    quantity: 0,
    unitPrice: 0,
    supplier: '',
    minimumStock: 10,
    location: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [r, p, an] = await Promise.all([
        fetch('/api/repairs/repairs').then(r => r.json()).catch(() => []),
        fetch('/api/repairs/parts').then(r => r.json()).catch(() => []),
        fetch('/api/repairs/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setRepairs(Array.isArray(r) ? r : []);
      setParts(Array.isArray(p) ? p : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setRepairs([]);
      setParts([]);
      setAnalytics({});
    }
  };

  const handleSaveRepair = async () => {
    const url = editingItem ? `/api/repairs/repairs/${editingItem._id}` : '/api/repairs/repairs';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(repairForm) 
    });
    fetchData();
    setShowRepairDialog(false);
    resetRepairForm();
    setEditingItem(null);
  };

  const handleSavePart = async () => {
    const url = editingItem ? `/api/repairs/parts/${editingItem._id}` : '/api/repairs/parts';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(partForm) 
    });
    fetchData();
    setShowPartDialog(false);
    resetPartForm();
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/api/repairs/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const resetRepairForm = () => {
    setRepairForm({
      referenceNumber: '',
      productName: '',
      customerName: '',
      customerPhone: '',
      issueDescription: '',
      diagnostics: '',
      status: 'pending',
      priority: 'medium',
      estimatedCost: 0,
      actualCost: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      deliveredDate: '',
      warrantyStatus: 'in-warranty',
      assignedTechnician: ''
    });
  };

  const resetPartForm = () => {
    setPartForm({
      name: '',
      partNumber: '',
      category: 'spare',
      quantity: 0,
      unitPrice: 0,
      supplier: '',
      minimumStock: 10,
      location: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      diagnosed: 'bg-blue-500/20 text-blue-500',
      repairing: 'bg-purple-500/20 text-purple-500',
      completed: 'bg-green-500/20 text-green-500',
      delivered: 'bg-teal-500/20 text-teal-500',
      cancelled: 'bg-red-500/20 text-red-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-500/20 text-gray-500',
      medium: 'bg-blue-500/20 text-blue-500',
      high: 'bg-orange-500/20 text-orange-500',
      urgent: 'bg-red-500/20 text-red-500'
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Repairs</h1>
            <p className="text-muted-foreground">Manage repair orders and spare parts</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="repairs">Repair Orders</TabsTrigger>
          <TabsTrigger value="parts">Spare Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Repairs', value: analytics?.totalRepairs || 0, icon: Wrench, color: 'text-orange-500', desc: `${analytics?.activeRepairs || 0} active` },
              { title: 'Pending', value: analytics?.pendingRepairs || 0, icon: Clock, color: 'text-yellow-500', desc: 'Awaiting diagnosis' },
              { title: 'Completed', value: analytics?.completedRepairs || 0, icon: CheckCircle, color: 'text-green-500', desc: 'This month' },
              { title: 'Revenue', value: `$${(analytics?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', desc: 'Total earnings' }
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
                <CardTitle>Recent Repairs</CardTitle>
                <CardDescription>Latest repair orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repairs.slice(0, 5).map((repair) => (
                    <div key={repair._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{repair.productName}</p>
                        <p className="text-sm text-muted-foreground">{repair.customerName}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(repair.status)}>{repair.status}</Badge>
                          <Badge className={getPriorityColor(repair.priority)}>{repair.priority}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${repair.estimatedCost}</p>
                        <p className="text-xs text-muted-foreground">{repair.referenceNumber}</p>
                      </div>
                    </div>
                  ))}
                  {repairs.length === 0 && <p className="text-center text-muted-foreground py-8">No repairs yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Low Stock Parts</CardTitle>
                <CardDescription>Parts that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parts.filter(p => p.quantity < p.minimumStock).slice(0, 5).map((part) => (
                    <div key={part._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{part.name}</p>
                        <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-500">{part.quantity}</p>
                        <p className="text-xs text-muted-foreground">Min: {part.minimumStock}</p>
                      </div>
                    </div>
                  ))}
                  {parts.filter(p => p.quantity < p.minimumStock).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">All parts well stocked</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Repair Orders</CardTitle>
                  <CardDescription>Manage all repair requests</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetRepairForm(); 
                  setEditingItem(null); 
                  setShowRepairDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Repair
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search repairs..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairs.filter(r => 
                    r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((repair) => (
                    <TableRow key={repair._id}>
                      <TableCell className="font-mono text-sm">{repair.referenceNumber}</TableCell>
                      <TableCell className="font-semibold">{repair.productName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{repair.customerName}</p>
                          <p className="text-sm text-muted-foreground">{repair.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(repair.status)}>{repair.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(repair.priority)}>{repair.priority}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">${repair.estimatedCost}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(repair.receivedDate)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(repair); 
                            setRepairForm(repair); 
                            setShowRepairDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('repairs', repair._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parts" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spare Parts Inventory</CardTitle>
                  <CardDescription>Manage spare parts stock</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetPartForm(); 
                  setEditingItem(null); 
                  setShowPartDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part._id} className={part.quantity < part.minimumStock ? 'bg-red-500/5' : ''}>
                      <TableCell className="font-semibold">{part.name}</TableCell>
                      <TableCell className="font-mono text-sm">{part.partNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{part.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${part.quantity < part.minimumStock ? 'text-red-500' : ''}`}>
                            {part.quantity}
                          </span>
                          {part.quantity < part.minimumStock && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">${part.unitPrice}</TableCell>
                      <TableCell className="text-muted-foreground">{part.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">{part.location}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(part); 
                            setPartForm(part); 
                            setShowPartDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('parts', part._id)}>Delete</Button>
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

      {/* Repair Dialog */}
      <Dialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Repair Order' : 'New Repair Order'}</DialogTitle>
            <DialogDescription>Fill in the repair details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reference Number *</Label>
                <Input 
                  value={repairForm.referenceNumber} 
                  onChange={(e) => setRepairForm({...repairForm, referenceNumber: e.target.value})} 
                  placeholder="REP-2024-001" 
                />
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input 
                  value={repairForm.productName} 
                  onChange={(e) => setRepairForm({...repairForm, productName: e.target.value})} 
                  placeholder="iPhone 14 Pro" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input 
                  value={repairForm.customerName} 
                  onChange={(e) => setRepairForm({...repairForm, customerName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Customer Phone *</Label>
                <Input 
                  value={repairForm.customerPhone} 
                  onChange={(e) => setRepairForm({...repairForm, customerPhone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Issue Description *</Label>
              <Textarea 
                value={repairForm.issueDescription} 
                onChange={(e) => setRepairForm({...repairForm, issueDescription: e.target.value})} 
                placeholder="Describe the issue..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Diagnostics</Label>
              <Textarea 
                value={repairForm.diagnostics} 
                onChange={(e) => setRepairForm({...repairForm, diagnostics: e.target.value})} 
                placeholder="Technical diagnosis..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={repairForm.status} onValueChange={(value) => setRepairForm({...repairForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="diagnosed">Diagnosed</SelectItem>
                    <SelectItem value="repairing">Repairing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={repairForm.priority} onValueChange={(value) => setRepairForm({...repairForm, priority: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warranty Status</Label>
                <Select value={repairForm.warrantyStatus} onValueChange={(value) => setRepairForm({...repairForm, warrantyStatus: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-warranty">In Warranty</SelectItem>
                    <SelectItem value="out-warranty">Out of Warranty</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <Input 
                  type="number"
                  value={repairForm.estimatedCost} 
                  onChange={(e) => setRepairForm({...repairForm, estimatedCost: parseFloat(e.target.value)})} 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <Label>Actual Cost</Label>
                <Input 
                  type="number"
                  value={repairForm.actualCost} 
                  onChange={(e) => setRepairForm({...repairForm, actualCost: parseFloat(e.target.value)})} 
                  placeholder="0.00" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Received Date</Label>
                <Input 
                  type="date"
                  value={repairForm.receivedDate} 
                  onChange={(e) => setRepairForm({...repairForm, receivedDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input 
                  type="date"
                  value={repairForm.expectedDelivery} 
                  onChange={(e) => setRepairForm({...repairForm, expectedDelivery: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Technician</Label>
              <Input 
                value={repairForm.assignedTechnician} 
                onChange={(e) => setRepairForm({...repairForm, assignedTechnician: e.target.value})} 
                placeholder="Technician name" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRepairDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRepair} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Repair Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Part Dialog */}
      <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Spare Part' : 'Add Spare Part'}</DialogTitle>
            <DialogDescription>Manage inventory part details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Name *</Label>
                <Input 
                  value={partForm.name} 
                  onChange={(e) => setPartForm({...partForm, name: e.target.value})} 
                  placeholder="LCD Screen" 
                />
              </div>
              <div className="space-y-2">
                <Label>Part Number *</Label>
                <Input 
                  value={partForm.partNumber} 
                  onChange={(e) => setPartForm({...partForm, partNumber: e.target.value})} 
                  placeholder="PN-12345" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={partForm.category} onValueChange={(value) => setPartForm({...partForm, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spare">Spare Part</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Input 
                  value={partForm.supplier} 
                  onChange={(e) => setPartForm({...partForm, supplier: e.target.value})} 
                  placeholder="Supplier name" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number"
                  value={partForm.quantity} 
                  onChange={(e) => setPartForm({...partForm, quantity: parseInt(e.target.value)})} 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input 
                  type="number"
                  value={partForm.unitPrice} 
                  onChange={(e) => setPartForm({...partForm, unitPrice: parseFloat(e.target.value)})} 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Stock</Label>
                <Input 
                  type="number"
                  value={partForm.minimumStock} 
                  onChange={(e) => setPartForm({...partForm, minimumStock: parseInt(e.target.value)})} 
                  placeholder="10" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Storage Location</Label>
              <Input 
                value={partForm.location} 
                onChange={(e) => setPartForm({...partForm, location: e.target.value})} 
                placeholder="Warehouse A, Shelf 12" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePart} className="gradient-primary">
              {editingItem ? 'Update' : 'Add'} Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
