import React, { useState, useEffect } from "react";
import { Factory, Plus, Search, Settings, TrendingUp, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export default function Manufacturing() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [boms, setBOMs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showBOMDialog, setShowBOMDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showWorkOrderDialog, setShowWorkOrderDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bomForm, setBOMForm] = useState({ productName: '', productCode: '', components: [], totalCost: 0, status: 'active', notes: '' });
  const [orderForm, setOrderForm] = useState({ productName: '', bomId: '', quantity: 0, startDate: '', endDate: '', priority: 'normal', status: 'draft', notes: '' });
  const [workOrderForm, setWorkOrderForm] = useState({ operation: '', productionOrderId: '', workstation: '', assignedTo: '', duration: 0, status: 'pending', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [b, o, w, q, a] = await Promise.all([
        fetch('/api/manufacturing/boms').then(r => r.json()),
        fetch('/api/manufacturing/orders').then(r => r.json()),
        fetch('/api/manufacturing/workorders').then(r => r.json()),
        fetch('/api/manufacturing/quality-checks').then(r => r.json()),
        fetch('/api/manufacturing/analytics').then(r => r.json())
      ]);
      setBOMs(b);
      setOrders(o);
      setWorkOrders(w);
      setQualityChecks(q);
      setAnalytics(a);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveBOM = async () => {
    const url = editingItem ? `/api/manufacturing/boms/${editingItem._id}` : '/api/manufacturing/boms';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bomForm) });
    fetchData();
    setShowBOMDialog(false);
    setBOMForm({ productName: '', productCode: '', components: [], totalCost: 0, status: 'active', notes: '' });
    setEditingItem(null);
  };

  const handleSaveOrder = async () => {
    const url = editingItem ? `/api/manufacturing/orders/${editingItem._id}` : '/api/manufacturing/orders';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderForm) });
    fetchData();
    setShowOrderDialog(false);
    setOrderForm({ productName: '', bomId: '', quantity: 0, startDate: '', endDate: '', priority: 'normal', status: 'draft', notes: '' });
    setEditingItem(null);
  };

  const handleSaveWorkOrder = async () => {
    await fetch('/api/manufacturing/workorders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(workOrderForm) });
    fetchData();
    setShowWorkOrderDialog(false);
    setWorkOrderForm({ operation: '', productionOrderId: '', workstation: '', assignedTo: '', duration: 0, status: 'pending', notes: '' });
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/manufacturing/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { 
      draft: 'bg-gray-500/20 text-gray-500', 
      planned: 'bg-blue-500/20 text-blue-500', 
      'in-progress': 'bg-yellow-500/20 text-yellow-500', 
      completed: 'bg-green-500/20 text-green-500', 
      cancelled: 'bg-red-500/20 text-red-500',
      active: 'bg-green-500/20 text-green-500',
      inactive: 'bg-gray-500/20 text-gray-500',
      pending: 'bg-orange-500/20 text-orange-500',
      paused: 'bg-yellow-500/20 text-yellow-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = { 
      low: 'bg-blue-500/20 text-blue-500', 
      normal: 'bg-gray-500/20 text-gray-500', 
      high: 'bg-orange-500/20 text-orange-500', 
      urgent: 'bg-red-500/20 text-red-500' 
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manufacturing</h1>
            <p className="text-muted-foreground">Manage production orders, BOMs, and quality control</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="boms">BOMs</TabsTrigger>
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="quality">Quality Checks</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Production', value: analytics?.totalProduced || 0, icon: Factory, color: 'text-blue-500', desc: 'Units produced' },
              { title: 'Active Orders', value: analytics?.activeOrders || 0, icon: Clock, color: 'text-yellow-500', desc: 'In progress' },
              { title: 'Quality Pass Rate', value: `${(analytics?.qualityPassRate || 0).toFixed(1)}%`, icon: CheckCircle, color: 'text-green-500', desc: 'Overall quality' },
              { title: 'Active BOMs', value: boms.filter(b => b.status === 'active').length, icon: Settings, color: 'text-purple-500', desc: 'Available BOMs' }
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
              <CardHeader><CardTitle>Top Products</CardTitle><CardDescription>Most manufactured items</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts?.map((product: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{product.name}</p><p className="text-sm text-muted-foreground">{product.orderCount} orders</p></div>
                      <div className="text-right"><p className="font-bold text-lg">{product.totalProduced} units</p></div>
                    </div>
                  ))}
                  {(!analytics?.topProducts || analytics.topProducts.length === 0) && <p className="text-center text-muted-foreground py-8">No production data</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Active Production Orders</CardTitle><CardDescription>Currently in progress</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.filter(o => o.status === 'in-progress').slice(0, 5).map((order) => {
                    const progress = (order.producedQuantity / order.quantity) * 100;
                    return (
                      <div key={order._id} className="p-3 rounded-lg border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1"><p className="font-semibold">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{order.productName}</p></div>
                          <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                        </div>
                        <div className="space-y-1"><div className="flex justify-between text-sm"><span>{order.producedQuantity} / {order.quantity}</span><span>{progress.toFixed(0)}%</span></div><Progress value={progress} className="h-2" /></div>
                      </div>
                    );
                  })}
                  {orders.filter(o => o.status === 'in-progress').length === 0 && <p className="text-center text-muted-foreground py-8">No active orders</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="boms" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Bills of Materials</CardTitle><CardDescription>Product manufacturing specifications</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setBOMForm({ productName: '', productCode: '', components: [], totalCost: 0, status: 'active', notes: '' }); setEditingItem(null); setShowBOMDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add BOM</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search BOMs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BOM Number</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Components</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boms.filter(b => b.productName.toLowerCase().includes(searchTerm.toLowerCase()) || b.bomNumber.toLowerCase().includes(searchTerm.toLowerCase())).map((bom) => (
                    <TableRow key={bom._id}>
                      <TableCell className="font-semibold">{bom.bomNumber}</TableCell>
                      <TableCell>{bom.productName}</TableCell>
                      <TableCell className="text-muted-foreground">{bom.productCode}</TableCell>
                      <TableCell className="text-muted-foreground">{bom.components?.length || 0} items</TableCell>
                      <TableCell className="font-bold">{formatCurrency(bom.totalCost)}</TableCell>
                      <TableCell><Badge className={getStatusColor(bom.status)}>{bom.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(bom); setBOMForm({ productName: bom.productName, productCode: bom.productCode, components: bom.components, totalCost: bom.totalCost, status: bom.status, notes: bom.notes || '' }); setShowBOMDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('boms', bom._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Production Orders</CardTitle><CardDescription>Manufacturing orders and progress</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setOrderForm({ productName: '', bomId: '', quantity: 0, startDate: '', endDate: '', priority: 'normal', status: 'draft', notes: '' }); setEditingItem(null); setShowOrderDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Order</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Product</TableHead><TableHead>Quantity</TableHead><TableHead>Produced</TableHead><TableHead>Progress</TableHead><TableHead>Start Date</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const progress = (order.producedQuantity / order.quantity) * 100;
                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell className="font-bold">{order.quantity}</TableCell>
                        <TableCell className="text-muted-foreground">{order.producedQuantity}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Progress value={progress} className="h-2 w-20" /><span className="text-xs">{progress.toFixed(0)}%</span></div></TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(order.startDate)}</TableCell>
                        <TableCell><Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge></TableCell>
                        <TableCell><Badge className={getStatusColor(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingItem(order); setOrderForm({ productName: order.productName, bomId: order.bomId, quantity: order.quantity, startDate: order.startDate, endDate: order.endDate, priority: order.priority, status: order.status, notes: order.notes || '' }); setShowOrderDialog(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('orders', order._id)}><Trash2 className="w-4 h-4" /></Button>
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

        <TabsContent value="workorders" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Work Orders</CardTitle><CardDescription>Individual manufacturing operations</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setWorkOrderForm({ operation: '', productionOrderId: '', workstation: '', assignedTo: '', duration: 0, status: 'pending', notes: '' }); setShowWorkOrderDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Work Order</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>WO #</TableHead><TableHead>Operation</TableHead><TableHead>Production Order</TableHead><TableHead>Workstation</TableHead><TableHead>Assigned To</TableHead><TableHead>Duration (hrs)</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo._id}>
                      <TableCell className="font-semibold">{wo.workOrderNumber}</TableCell>
                      <TableCell>{wo.operation}</TableCell>
                      <TableCell className="text-muted-foreground">{wo.productionOrderNumber}</TableCell>
                      <TableCell>{wo.workstation}</TableCell>
                      <TableCell className="text-muted-foreground">{wo.assignedTo}</TableCell>
                      <TableCell className="font-bold">{wo.duration}</TableCell>
                      <TableCell><Badge className={getStatusColor(wo.status)}>{wo.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader><CardTitle>Quality Checks</CardTitle><CardDescription>Quality control inspections</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Check #</TableHead><TableHead>Production Order</TableHead><TableHead>Check Type</TableHead><TableHead>Inspector</TableHead><TableHead>Date</TableHead><TableHead>Result</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                <TableBody>
                  {qualityChecks.map((qc) => (
                    <TableRow key={qc._id}>
                      <TableCell className="font-semibold">{qc.checkNumber}</TableCell>
                      <TableCell>{qc.productionOrderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{qc.checkType}</TableCell>
                      <TableCell>{qc.inspector}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(qc.checkDate)}</TableCell>
                      <TableCell><Badge className={qc.result === 'pass' ? 'bg-green-500/20 text-green-500' : qc.result === 'fail' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}>{qc.result}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{qc.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showBOMDialog} onOpenChange={setShowBOMDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit BOM' : 'New BOM'}</DialogTitle><DialogDescription>Define bill of materials</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Product Name *</label><Input value={bomForm.productName} onChange={(e) => setBOMForm({...bomForm, productName: e.target.value})} placeholder="Product Name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Product Code *</label><Input value={bomForm.productCode} onChange={(e) => setBOMForm({...bomForm, productCode: e.target.value})} placeholder="PROD-001" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Total Cost</label><Input type="number" step="0.01" value={bomForm.totalCost} onChange={(e) => setBOMForm({...bomForm, totalCost: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={bomForm.status} onValueChange={(value) => setBOMForm({...bomForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={bomForm.notes} onChange={(e) => setBOMForm({...bomForm, notes: e.target.value})} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowBOMDialog(false)}>Cancel</Button><Button onClick={handleSaveBOM} className="gradient-primary">Save BOM</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Production Order' : 'New Production Order'}</DialogTitle><DialogDescription>Create manufacturing order</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Product Name *</label><Input value={orderForm.productName} onChange={(e) => setOrderForm({...orderForm, productName: e.target.value})} placeholder="Product Name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">BOM</label><Select value={orderForm.bomId} onValueChange={(value) => setOrderForm({...orderForm, bomId: value})}><SelectTrigger><SelectValue placeholder="Select BOM" /></SelectTrigger><SelectContent>{boms.filter(b => b.status === 'active').map(b => <SelectItem key={b._id} value={b._id}>{b.productName} ({b.bomNumber})</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Quantity *</label><Input type="number" value={orderForm.quantity} onChange={(e) => setOrderForm({...orderForm, quantity: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Priority</label><Select value={orderForm.priority} onValueChange={(value) => setOrderForm({...orderForm, priority: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={orderForm.status} onValueChange={(value) => setOrderForm({...orderForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="planned">Planned</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Start Date *</label><Input type="date" value={orderForm.startDate} onChange={(e) => setOrderForm({...orderForm, startDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input type="date" value={orderForm.endDate} onChange={(e) => setOrderForm({...orderForm, endDate: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={orderForm.notes} onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})} placeholder="Production notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowOrderDialog(false)}>Cancel</Button><Button onClick={handleSaveOrder} className="gradient-primary">Save Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkOrderDialog} onOpenChange={setShowWorkOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Work Order</DialogTitle><DialogDescription>Create individual work operation</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Operation *</label><Input value={workOrderForm.operation} onChange={(e) => setWorkOrderForm({...workOrderForm, operation: e.target.value})} placeholder="Assembly, Welding, etc." /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Production Order</label><Select value={workOrderForm.productionOrderId} onValueChange={(value) => setWorkOrderForm({...workOrderForm, productionOrderId: value})}><SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger><SelectContent>{orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(o => <SelectItem key={o._id} value={o._id}>{o.orderNumber} - {o.productName}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Workstation *</label><Input value={workOrderForm.workstation} onChange={(e) => setWorkOrderForm({...workOrderForm, workstation: e.target.value})} placeholder="WS-01" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Assigned To</label><Input value={workOrderForm.assignedTo} onChange={(e) => setWorkOrderForm({...workOrderForm, assignedTo: e.target.value})} placeholder="Worker name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Duration (hrs)</label><Input type="number" value={workOrderForm.duration} onChange={(e) => setWorkOrderForm({...workOrderForm, duration: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={workOrderForm.status} onValueChange={(value) => setWorkOrderForm({...workOrderForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="paused">Paused</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={workOrderForm.notes} onChange={(e) => setWorkOrderForm({...workOrderForm, notes: e.target.value})} placeholder="Operation details..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowWorkOrderDialog(false)}>Cancel</Button><Button onClick={handleSaveWorkOrder} className="gradient-primary">Save Work Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
