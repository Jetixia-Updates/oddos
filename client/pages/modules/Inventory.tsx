import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Warehouse, TrendingUp, Edit, Trash2, AlertTriangle, CheckCircle, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemForm, setItemForm] = useState({ name: '', sku: '', category: '', currentStock: 0, minStock: 0, maxStock: 0, unitCost: 0, unitPrice: 0, warehouseId: '', location: '' });
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '', capacity: 0, currentLoad: 0, manager: '', phone: '', email: '' });
  const [movementForm, setMovementForm] = useState({ itemId: '', itemName: '', type: 'in', quantity: 0, warehouseId: '', reference: '', notes: '', status: 'completed' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [i, w, m, t, a] = await Promise.all([
        fetch('/api/inventory/items').then(r => r.json()),
        fetch('/api/inventory/warehouses').then(r => r.json()),
        fetch('/api/inventory/movements').then(r => r.json()),
        fetch('/api/inventory/transfers').then(r => r.json()),
        fetch('/api/inventory/analytics').then(r => r.json())
      ]);
      setItems(i);
      setWarehouses(w);
      setMovements(m);
      setTransfers(t);
      setAnalytics(a);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveItem = async () => {
    const url = editingItem ? `/api/inventory/items/${editingItem._id}` : '/api/inventory/items';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemForm) });
    fetchData();
    setShowItemDialog(false);
    setItemForm({ name: '', sku: '', category: '', currentStock: 0, minStock: 0, maxStock: 0, unitCost: 0, unitPrice: 0, warehouseId: '', location: '' });
    setEditingItem(null);
  };

  const handleSaveWarehouse = async () => {
    const url = editingItem ? `/api/inventory/warehouses/${editingItem._id}` : '/api/inventory/warehouses';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(warehouseForm) });
    fetchData();
    setShowWarehouseDialog(false);
    setWarehouseForm({ name: '', location: '', capacity: 0, currentLoad: 0, manager: '', phone: '', email: '' });
    setEditingItem(null);
  };

  const handleSaveMovement = async () => {
    await fetch('/api/inventory/movements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movementForm) });
    fetchData();
    setShowMovementDialog(false);
    setMovementForm({ itemId: '', itemName: '', type: 'in', quantity: 0, warehouseId: '', reference: '', notes: '', status: 'completed' });
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/inventory/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStockStatus = (item: any) => {
    if (item.currentStock === 0) return { label: 'Out of Stock', color: 'bg-red-500/20 text-red-500' };
    if (item.currentStock <= item.minStock) return { label: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-500' };
    if (item.currentStock >= item.maxStock) return { label: 'Overstocked', color: 'bg-purple-500/20 text-purple-500' };
    return { label: 'In Stock', color: 'bg-green-500/20 text-green-500' };
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">Manage stock levels, warehouses, and movements</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Inventory Value', value: formatCurrency(analytics?.totalValue || 0), icon: TrendingUp, color: 'text-green-500', desc: 'Current stock value' },
              { title: 'Total Items', value: items.length, icon: Package, color: 'text-blue-500', desc: `${analytics?.totalWarehouses || 0} warehouses` },
              { title: 'Low Stock Items', value: analytics?.lowStockCount || 0, icon: AlertTriangle, color: 'text-yellow-500', desc: 'Below minimum level' },
              { title: 'Out of Stock', value: analytics?.outOfStockCount || 0, icon: AlertTriangle, color: 'text-red-500', desc: 'Need replenishment' }
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
              <CardHeader><CardTitle>Warehouse Distribution</CardTitle><CardDescription>Stock by location</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.warehouseDistribution?.map((wh: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{wh.name}</p><p className="text-sm text-muted-foreground">{wh.location}</p></div>
                      <div className="text-right"><p className="font-bold text-lg">{wh.itemCount} items</p><p className="text-sm text-muted-foreground">{formatCurrency(wh.totalValue)}</p></div>
                    </div>
                  ))}
                  {(!analytics?.warehouseDistribution || analytics.warehouseDistribution.length === 0) && <p className="text-center text-muted-foreground py-8">No warehouse data</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Stock Alerts</CardTitle><CardDescription>Items requiring attention</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.filter(item => item.currentStock <= item.minStock).slice(0, 5).map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div className="flex-1"><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">SKU: {item.sku}</p></div>
                        <div className="text-right"><p className="font-bold">{item.currentStock} units</p><Badge className={status.color}>{status.label}</Badge></div>
                      </div>
                    );
                  })}
                  {items.filter(item => item.currentStock <= item.minStock).length === 0 && <p className="text-center text-muted-foreground py-8">No stock alerts</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Inventory Items</CardTitle><CardDescription>Manage your stock items</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setItemForm({ name: '', sku: '', category: '', currentStock: 0, minStock: 0, maxStock: 0, unitCost: 0, unitPrice: 0, warehouseId: '', location: '' }); setEditingItem(null); setShowItemDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="font-bold">{item.currentStock}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.minStock} / {item.maxStock}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setEditingItem(item); setItemForm({ name: item.name, sku: item.sku, category: item.category, currentStock: item.currentStock, minStock: item.minStock, maxStock: item.maxStock, unitCost: item.unitCost, unitPrice: item.unitPrice, warehouseId: item.warehouseId, location: item.location }); setShowItemDialog(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('items', item._id)}><Trash2 className="w-4 h-4" /></Button>
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

        <TabsContent value="warehouses" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Warehouses</CardTitle><CardDescription>Manage warehouse locations</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setWarehouseForm({ name: '', location: '', capacity: 0, currentLoad: 0, manager: '', phone: '', email: '' }); setEditingItem(null); setShowWarehouseDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Warehouse</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => (
                  <Card key={wh._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Warehouse className="w-5 h-5 text-blue-500" /></div>
                          <div><CardTitle className="text-lg">{wh.name}</CardTitle><p className="text-sm text-muted-foreground">{wh.location}</p></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span className="font-semibold">{wh.capacity.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Current Load</span><span className="font-semibold">{((wh.currentLoad / wh.capacity) * 100).toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Manager</span><span className="font-semibold">{wh.manager}</span></div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingItem(wh); setWarehouseForm({ name: wh.name, location: wh.location, capacity: wh.capacity, currentLoad: wh.currentLoad, manager: wh.manager, phone: wh.phone, email: wh.email }); setShowWarehouseDialog(true); }}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('warehouses', wh._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Stock Movements</CardTitle><CardDescription>Track inventory changes</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setMovementForm({ itemId: '', itemName: '', type: 'in', quantity: 0, warehouseId: '', reference: '', notes: '', status: 'completed' }); setShowMovementDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Movement</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Movement #</TableHead><TableHead>Item</TableHead><TableHead>Type</TableHead><TableHead>Quantity</TableHead><TableHead>Warehouse</TableHead><TableHead>Date</TableHead><TableHead>Reference</TableHead></TableRow></TableHeader>
                <TableBody>
                  {movements.map((mvt) => (
                    <TableRow key={mvt._id}>
                      <TableCell className="font-semibold">{mvt.movementNumber}</TableCell>
                      <TableCell>{mvt.itemName}</TableCell>
                      <TableCell><Badge className={mvt.type === 'in' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}>{mvt.type === 'in' ? 'IN' : 'OUT'}</Badge></TableCell>
                      <TableCell className="font-bold">{mvt.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{mvt.warehouseName || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(mvt.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{mvt.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader><CardTitle>Stock Transfers</CardTitle><CardDescription>Inter-warehouse transfers</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Transfer #</TableHead><TableHead>Item</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Quantity</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {transfers.map((tr) => (
                    <TableRow key={tr._id}>
                      <TableCell className="font-semibold">{tr.transferNumber}</TableCell>
                      <TableCell>{tr.itemName}</TableCell>
                      <TableCell className="text-muted-foreground">{tr.fromWarehouseName}</TableCell>
                      <TableCell className="text-muted-foreground">{tr.toWarehouseName}</TableCell>
                      <TableCell className="font-bold">{tr.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(tr.createdAt)}</TableCell>
                      <TableCell><Badge className={tr.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>{tr.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Item' : 'New Item'}</DialogTitle><DialogDescription>Manage inventory item details</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Item Name *</label><Input value={itemForm.name} onChange={(e) => setItemForm({...itemForm, name: e.target.value})} placeholder="Product Name" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">SKU *</label><Input value={itemForm.sku} onChange={(e) => setItemForm({...itemForm, sku: e.target.value})} placeholder="SKU-001" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Category</label><Select value={itemForm.category} onValueChange={(value) => setItemForm({...itemForm, category: value})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="raw-materials">Raw Materials</SelectItem><SelectItem value="finished-goods">Finished Goods</SelectItem><SelectItem value="consumables">Consumables</SelectItem><SelectItem value="packaging">Packaging</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Current Stock</label><Input type="number" value={itemForm.currentStock} onChange={(e) => setItemForm({...itemForm, currentStock: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Location</label><Input value={itemForm.location} onChange={(e) => setItemForm({...itemForm, location: e.target.value})} placeholder="A-1-5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Min Stock Level</label><Input type="number" value={itemForm.minStock} onChange={(e) => setItemForm({...itemForm, minStock: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Max Stock Level</label><Input type="number" value={itemForm.maxStock} onChange={(e) => setItemForm({...itemForm, maxStock: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Unit Cost</label><Input type="number" step="0.01" value={itemForm.unitCost} onChange={(e) => setItemForm({...itemForm, unitCost: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Unit Price</label><Input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({...itemForm, unitPrice: Number(e.target.value)})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Warehouse</label><Select value={itemForm.warehouseId} onValueChange={(value) => setItemForm({...itemForm, warehouseId: value})}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map(w => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button><Button onClick={handleSaveItem} className="gradient-primary">Save Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Warehouse' : 'New Warehouse'}</DialogTitle><DialogDescription>Manage warehouse information</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Warehouse Name *</label><Input value={warehouseForm.name} onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})} placeholder="Main Warehouse" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Location *</label><Input value={warehouseForm.location} onChange={(e) => setWarehouseForm({...warehouseForm, location: e.target.value})} placeholder="City, Country" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Capacity</label><Input type="number" value={warehouseForm.capacity} onChange={(e) => setWarehouseForm({...warehouseForm, capacity: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Manager</label><Input value={warehouseForm.manager} onChange={(e) => setWarehouseForm({...warehouseForm, manager: e.target.value})} placeholder="Manager Name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input value={warehouseForm.phone} onChange={(e) => setWarehouseForm({...warehouseForm, phone: e.target.value})} placeholder="+1 234 567 8900" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={warehouseForm.email} onChange={(e) => setWarehouseForm({...warehouseForm, email: e.target.value})} placeholder="warehouse@example.com" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowWarehouseDialog(false)}>Cancel</Button><Button onClick={handleSaveWarehouse} className="gradient-primary">Save Warehouse</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Stock Movement</DialogTitle><DialogDescription>Record inventory movement</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Item *</label><Select value={movementForm.itemId} onValueChange={(value) => { const item = items.find(i => i._id === value); setMovementForm({...movementForm, itemId: value, itemName: item?.name || ''}); }}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i._id} value={i._id}>{i.name} ({i.sku})</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Type *</label><Select value={movementForm.type} onValueChange={(value) => setMovementForm({...movementForm, type: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">Stock In</SelectItem><SelectItem value="out">Stock Out</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Quantity *</label><Input type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({...movementForm, quantity: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Warehouse</label><Select value={movementForm.warehouseId} onValueChange={(value) => setMovementForm({...movementForm, warehouseId: value})}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map(w => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Reference</label><Input value={movementForm.reference} onChange={(e) => setMovementForm({...movementForm, reference: e.target.value})} placeholder="PO-12345 or SO-67890" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={movementForm.notes} onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowMovementDialog(false)}>Cancel</Button><Button onClick={handleSaveMovement} className="gradient-primary">Save Movement</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
