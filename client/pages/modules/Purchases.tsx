import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search, Users, FileText, TrendingUp, Edit, Trash2, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Purchases() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rfqs, setRFQs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', address: '', contactPerson: '', paymentTerms: 'net30', status: 'active' });
  const [orderForm, setOrderForm] = useState({ vendorId: '', vendorName: '', items: [], subtotal: 0, tax: 0, total: 0, status: 'draft', expectedDate: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [v, o, r, a] = await Promise.all([
        fetch('/api/purchases/vendors').then(r => r.json()).catch(() => []),
        fetch('/api/purchases/orders').then(r => r.json()).catch(() => []),
        fetch('/api/purchases/rfqs').then(r => r.json()).catch(() => []),
        fetch('/api/purchases/analytics').then(r => r.json()).catch(() => null)
      ]);
      setVendors(Array.isArray(v) ? v : []);
      setOrders(Array.isArray(o) ? o : []);
      setRFQs(Array.isArray(r) ? r : []);
      setAnalytics(a);
    } catch (error) {
      console.error('Error:', error);
      setVendors([]);
      setOrders([]);
      setRFQs([]);
      setAnalytics(null);
    }
  };

  const handleSaveVendor = async () => {
    const url = editingItem ? `/api/purchases/vendors/${editingItem._id}` : '/api/purchases/vendors';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(vendorForm) });
    fetchData();
    setShowVendorDialog(false);
    setVendorForm({ name: '', email: '', phone: '', address: '', contactPerson: '', paymentTerms: 'net30', status: 'active' });
    setEditingItem(null);
  };

  const handleSaveOrder = async () => {
    const url = editingItem ? `/api/purchases/orders/${editingItem._id}` : '/api/purchases/orders';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderForm) });
    fetchData();
    setShowOrderDialog(false);
    setOrderForm({ vendorId: '', vendorName: '', items: [], subtotal: 0, tax: 0, total: 0, status: 'draft', expectedDate: '', notes: '' });
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/purchases/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-500', sent: 'bg-blue-500/20 text-blue-500', confirmed: 'bg-purple-500/20 text-purple-500', received: 'bg-green-500/20 text-green-500', cancelled: 'bg-red-500/20 text-red-500', active: 'bg-green-500/20 text-green-500', inactive: 'bg-gray-500/20 text-gray-500' };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Purchases</h1>
            <p className="text-muted-foreground">Manage vendors, purchase orders, and procurement</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Spent', value: formatCurrency(analytics?.totalSpent || 0), icon: DollarSign, color: 'text-green-500', desc: 'Across all vendors' },
              { title: 'Total Orders', value: analytics?.totalOrders || 0, icon: Package, color: 'text-blue-500', desc: `${analytics?.pendingOrders || 0} pending` },
              { title: 'Active Vendors', value: analytics?.activeVendors || 0, icon: Users, color: 'text-purple-500', desc: 'Registered vendors' },
              { title: 'Avg Order Value', value: formatCurrency(analytics?.avgOrderValue || 0), icon: TrendingUp, color: 'text-orange-500', desc: 'Per purchase order' }
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
              <CardHeader><CardTitle>Top Vendors</CardTitle><CardDescription>Highest spending by vendor</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topVendors?.map((vendor: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{vendor.name}</p><p className="text-sm text-muted-foreground">{vendor.totalOrders} orders</p></div>
                      <p className="font-bold text-lg">{formatCurrency(vendor.totalSpent)}</p>
                    </div>
                  ))}
                  {(!analytics?.topVendors || analytics.topVendors.length === 0) && <p className="text-center text-muted-foreground py-8">No vendors data</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Recent Orders</CardTitle><CardDescription>Latest purchase orders</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.recentOrders?.slice(0, 5).map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{order.orderNumber}</p><p className="text-sm text-muted-foreground">{order.vendorName}</p></div>
                      <div className="text-right"><p className="font-bold">{formatCurrency(order.total)}</p><Badge className={getStatusColor(order.status)}>{order.status}</Badge></div>
                    </div>
                  ))}
                  {(!analytics?.recentOrders || analytics.recentOrders.length === 0) && <p className="text-center text-muted-foreground py-8">No recent orders</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Vendor Management</CardTitle><CardDescription>Manage your supplier relationships</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setVendorForm({ name: '', email: '', phone: '', address: '', contactPerson: '', paymentTerms: 'net30', status: 'active' }); setEditingItem(null); setShowVendorDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Vendor</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search vendors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())).map((vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell className="font-semibold">{vendor.name}</TableCell>
                      <TableCell>{vendor.contactPerson}</TableCell>
                      <TableCell className="text-muted-foreground">{vendor.email}</TableCell>
                      <TableCell className="text-muted-foreground">{vendor.phone}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(vendor.totalSpent)}</TableCell>
                      <TableCell><Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(vendor); setVendorForm({ name: vendor.name, email: vendor.email, phone: vendor.phone, address: vendor.address, contactPerson: vendor.contactPerson, paymentTerms: vendor.paymentTerms, status: vendor.status }); setShowVendorDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('vendors', vendor._id)}><Trash2 className="w-4 h-4" /></Button>
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
                <div><CardTitle>Purchase Orders</CardTitle><CardDescription>Track and manage purchase orders</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setOrderForm({ vendorId: '', vendorName: '', items: [], subtotal: 0, tax: 0, total: 0, status: 'draft', expectedDate: '', notes: '' }); setEditingItem(null); setShowOrderDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Order</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Order #</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead><TableHead>Expected</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.expectedDate)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
                      <TableCell><Badge className={getStatusColor(order.status)}>{order.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(order); setOrderForm({ vendorId: order.vendorId, vendorName: order.vendorName, items: order.items, subtotal: order.subtotal, tax: order.tax, total: order.total, status: order.status, expectedDate: order.expectedDate, notes: order.notes || '' }); setShowOrderDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('orders', order._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfqs" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader><CardTitle>Request for Quotations</CardTitle><CardDescription>Manage RFQs sent to vendors</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>RFQ #</TableHead><TableHead>Vendor</TableHead><TableHead>Sent Date</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rfqs.map((rfq) => (
                    <TableRow key={rfq._id}>
                      <TableCell className="font-semibold">{rfq.rfqNumber}</TableCell>
                      <TableCell>{rfq.vendorName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(rfq.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(rfq.dueDate)}</TableCell>
                      <TableCell><Badge className={getStatusColor(rfq.status)}>{rfq.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-white/10"><CardHeader><CardTitle>Pending Orders</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-yellow-500">{analytics?.pendingOrders || 0}</div><p className="text-sm text-muted-foreground mt-2">Awaiting confirmation</p></CardContent></Card>
            <Card className="glass border-white/10"><CardHeader><CardTitle>Completed Orders</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-green-500">{analytics?.completedOrders || 0}</div><p className="text-sm text-muted-foreground mt-2">Successfully received</p></CardContent></Card>
            <Card className="glass border-white/10"><CardHeader><CardTitle>Total Vendors</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold text-blue-500">{vendors.length}</div><p className="text-sm text-muted-foreground mt-2">{analytics?.activeVendors || 0} active</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Vendor' : 'New Vendor'}</DialogTitle><DialogDescription>Manage vendor information</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Vendor Name *</label><Input value={vendorForm.name} onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})} placeholder="ABC Suppliers" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Contact Person *</label><Input value={vendorForm.contactPerson} onChange={(e) => setVendorForm({...vendorForm, contactPerson: e.target.value})} placeholder="John Doe" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Email *</label><Input type="email" value={vendorForm.email} onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})} placeholder="vendor@example.com" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Phone *</label><Input value={vendorForm.phone} onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})} placeholder="+1 234 567 8900" /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Address</label><Input value={vendorForm.address} onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})} placeholder="123 Main St" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Payment Terms</label><Select value={vendorForm.paymentTerms} onValueChange={(value) => setVendorForm({...vendorForm, paymentTerms: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="immediate">Immediate</SelectItem><SelectItem value="net15">Net 15</SelectItem><SelectItem value="net30">Net 30</SelectItem><SelectItem value="net45">Net 45</SelectItem><SelectItem value="net60">Net 60</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={vendorForm.status} onValueChange={(value) => setVendorForm({...vendorForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowVendorDialog(false)}>Cancel</Button><Button onClick={handleSaveVendor} className="gradient-primary">Save Vendor</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle><DialogDescription>Create or update purchase order</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Vendor *</label><Select value={orderForm.vendorId} onValueChange={(value) => { const vendor = vendors.find(v => v._id === value); setOrderForm({...orderForm, vendorId: value, vendorName: vendor?.name || ''}); }}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Expected Date *</label><Input type="date" value={orderForm.expectedDate} onChange={(e) => setOrderForm({...orderForm, expectedDate: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={orderForm.status} onValueChange={(value) => setOrderForm({...orderForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="received">Received</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={orderForm.notes} onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowOrderDialog(false)}>Cancel</Button><Button onClick={handleSaveOrder} className="gradient-primary">Save Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
