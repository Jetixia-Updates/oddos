import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Plus, Search, ClipboardList, BookOpen, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

interface RestaurantTable {
  _id?: string;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface Order {
  _id?: string;
  orderNumber: string;
  tableNumber: number;
  items: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed';
  waiter: string;
  createdAt?: string;
}

interface MenuItem {
  _id?: string;
  name: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  price: number;
  description: string;
  available: boolean;
}

export default function Restaurant() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [tableForm, setTableForm] = useState<RestaurantTable>({
    tableNumber: 1,
    capacity: 4,
    status: 'available'
  });

  const [orderForm, setOrderForm] = useState<Order>({
    orderNumber: '',
    tableNumber: 1,
    items: '',
    total: 0,
    status: 'pending',
    waiter: ''
  });

  const [menuForm, setMenuForm] = useState<MenuItem>({
    name: '',
    category: 'main',
    price: 0,
    description: '',
    available: true
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, o, m, an] = await Promise.all([
        fetch('/api/restaurant/tables').then(r => r.json()).catch(() => []),
        fetch('/api/restaurant/orders').then(r => r.json()).catch(() => []),
        fetch('/api/restaurant/menu').then(r => r.json()).catch(() => []),
        fetch('/api/restaurant/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setTables(Array.isArray(t) ? t : []);
      setOrders(Array.isArray(o) ? o : []);
      setMenuItems(Array.isArray(m) ? m : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setTables([]);
      setOrders([]);
      setMenuItems([]);
      setAnalytics({});
    }
  };

  const handleSaveTable = async () => {
    try {
      const url = editingItem ? `/api/restaurant/tables/${editingItem._id}` : '/api/restaurant/tables';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(tableForm) 
      });
      fetchData();
      setShowTableDialog(false);
      resetTableForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving table:', error);
    }
  };

  const handleSaveOrder = async () => {
    try {
      const url = editingItem ? `/api/restaurant/orders/${editingItem._id}` : '/api/restaurant/orders';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(orderForm) 
      });
      fetchData();
      setShowOrderDialog(false);
      resetOrderForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleSaveMenu = async () => {
    try {
      const url = editingItem ? `/api/restaurant/menu/${editingItem._id}` : '/api/restaurant/menu';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(menuForm) 
      });
      fetchData();
      setShowMenuDialog(false);
      resetMenuForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await fetch(`/api/restaurant/tables/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await fetch(`/api/restaurant/orders/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await fetch(`/api/restaurant/menu/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const resetTableForm = () => {
    setTableForm({
      tableNumber: 1,
      capacity: 4,
      status: 'available'
    });
  };

  const resetOrderForm = () => {
    setOrderForm({
      orderNumber: '',
      tableNumber: 1,
      items: '',
      total: 0,
      status: 'pending',
      waiter: ''
    });
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      category: 'main',
      price: 0,
      description: '',
      available: true
    });
  };

  const openEditTable = (table: RestaurantTable) => {
    setEditingItem(table);
    setTableForm(table);
    setShowTableDialog(true);
  };

  const openEditOrder = (order: Order) => {
    setEditingItem(order);
    setOrderForm(order);
    setShowOrderDialog(true);
  };

  const openEditMenu = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm(item);
    setShowMenuDialog(true);
  };

  const getTableStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'occupied': 'bg-red-100 text-red-800',
      'reserved': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'preparing': 'bg-blue-100 text-blue-800',
      'ready': 'bg-yellow-100 text-yellow-800',
      'served': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'appetizer': 'bg-orange-100 text-orange-800',
      'main': 'bg-blue-100 text-blue-800',
      'dessert': 'bg-pink-100 text-pink-800',
      'beverage': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredTables = tables.filter(t => 
    t.tableNumber.toString().includes(searchTerm)
  );

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.waiter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenu = menuItems.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-rose-500" />
            Restaurant Management
          </h1>
          <p className="text-gray-500 mt-1">Manage tables, orders, and menu items</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">All time orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeOrders || 0}</div>
                <p className="text-xs text-muted-foreground">Currently processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.completedOrders || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully served</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Total revenue</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Table Status</CardTitle>
                <CardDescription>Current table availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.tablesByStatus && Object.entries(analytics.tablesByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge className={getTableStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Orders by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.ordersByStatus && Object.entries(analytics.ordersByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge className={getOrderStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetTableForm(); setEditingItem(null); setShowTableDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Table
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Manage restaurant tables</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No tables found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTables.map((table) => (
                      <TableRow key={table._id}>
                        <TableCell className="font-medium">Table {table.tableNumber}</TableCell>
                        <TableCell>{table.capacity} persons</TableCell>
                        <TableCell>
                          <Badge className={getTableStatusColor(table.status)}>
                            {table.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditTable(table)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTable(table._id!)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetOrderForm(); setEditingItem(null); setShowOrderDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage restaurant orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waiter</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>Table {order.tableNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.items}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.waiter}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditOrder(order)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order._id!)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetMenuForm(); setEditingItem(null); setShowMenuDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage restaurant menu</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenu.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No menu items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMenu.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                        <TableCell>
                          <Badge className={item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {item.available ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditMenu(item)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteMenu(item._id!)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Table' : 'Add New Table'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update table details' : 'Create a new table'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                value={tableForm.tableNumber}
                onChange={(e) => setTableForm({...tableForm, tableNumber: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={tableForm.capacity}
                onChange={(e) => setTableForm({...tableForm, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={tableForm.status} onValueChange={(value: any) => setTableForm({...tableForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTableDialog(false); resetTableForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTable}>
              {editingItem ? 'Update' : 'Create'} Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Order' : 'Add New Order'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update order details' : 'Create a new order'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderForm.orderNumber}
                onChange={(e) => setOrderForm({...orderForm, orderNumber: e.target.value})}
                placeholder="ORD-001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                value={orderForm.tableNumber}
                onChange={(e) => setOrderForm({...orderForm, tableNumber: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="items">Items (comma-separated)</Label>
              <Textarea
                id="items"
                value={orderForm.items}
                onChange={(e) => setOrderForm({...orderForm, items: e.target.value})}
                placeholder="Burger, Fries, Soda"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total">Total ($)</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={orderForm.total}
                onChange={(e) => setOrderForm({...orderForm, total: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orderStatus">Status</Label>
              <Select value={orderForm.status} onValueChange={(value: any) => setOrderForm({...orderForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="waiter">Waiter</Label>
              <Input
                id="waiter"
                value={orderForm.waiter}
                onChange={(e) => setOrderForm({...orderForm, waiter: e.target.value})}
                placeholder="John Doe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowOrderDialog(false); resetOrderForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrder}>
              {editingItem ? 'Update' : 'Create'} Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update menu item details' : 'Create a new menu item'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                placeholder="Grilled Chicken"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={menuForm.category} onValueChange={(value: any) => setMenuForm({...menuForm, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appetizer">Appetizer</SelectItem>
                  <SelectItem value="main">Main Course</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={menuForm.price}
                onChange={(e) => setMenuForm({...menuForm, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                placeholder="Delicious grilled chicken with herbs"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={menuForm.available}
                onChange={(e) => setMenuForm({...menuForm, available: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="available">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMenuDialog(false); resetMenuForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveMenu}>
              {editingItem ? 'Update' : 'Create'} Menu Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
