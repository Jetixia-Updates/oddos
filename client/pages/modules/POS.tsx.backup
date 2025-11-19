import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Search, Package, History, DollarSign, ShoppingCart, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface POSProduct {
  _id?: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
}

interface Sale {
  _id?: string;
  receiptNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  createdAt?: string;
}

interface CartItem {
  product: POSProduct;
  quantity: number;
}

export default function POS() {
  const [activeTab, setActiveTab] = useState('sales');
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');

  const [productForm, setProductForm] = useState<POSProduct>({
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    barcode: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, s, an] = await Promise.all([
        fetch('/api/pos/products').then(r => r.json()).catch(() => []),
        fetch('/api/pos/sales').then(r => r.json()).catch(() => []),
        fetch('/api/pos/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setSales(Array.isArray(s) ? s : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
      setSales([]);
      setAnalytics({});
    }
  };

  const handleSaveProduct = async () => {
    try {
      const url = editingItem ? `/api/pos/products/${editingItem._id}` : '/api/pos/products';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(productForm) 
      });
      fetchData();
      setShowProductDialog(false);
      resetProductForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/pos/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      category: '',
      price: 0,
      stock: 0,
      barcode: ''
    });
  };

  const openEditProduct = (product: POSProduct) => {
    setEditingItem(product);
    setProductForm(product);
    setShowProductDialog(true);
  };

  const addToCart = (product: POSProduct) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product._id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      const sale = {
        receiptNumber: `REC-${Date.now()}`,
        items: cart,
        total: calculateTotal(),
        paymentMethod
      };

      await fetch('/api/pos/sales', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(sale) 
      });

      alert('Sale completed successfully!');
      setCart([]);
      fetchData();
      setActiveTab('history');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale');
    }
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'cash': 'bg-green-100 text-green-800',
      'card': 'bg-blue-100 text-blue-800',
      'mobile': 'bg-purple-100 text-purple-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const filteredSales = sales.filter(s => 
    s.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-teal-500" />
            Point of Sale
          </h1>
          <p className="text-gray-500 mt-1">Process sales, manage products, and track transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Select products to add to cart</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card 
                        key={product._id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center space-y-2">
                            <Package className="w-12 h-12 mx-auto text-teal-500" />
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                            <p className="text-lg font-bold text-teal-600">${product.price.toFixed(2)}</p>
                            <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No products found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Cart is empty
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.product._id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateCartQuantity(item.product._id!, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateCartQuantity(item.product._id!, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => removeFromCart(item.product._id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="mobile">Mobile Payment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button className="w-full" onClick={handleCheckout}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Sale
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetProductForm(); setEditingItem(null); setShowProductDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.barcode}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id!)}>
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

        <TabsContent value="history" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>View all completed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No sales found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                        <TableCell>{sale.createdAt ? new Date(sale.createdAt).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{sale.items?.length || 0} items</TableCell>
                        <TableCell>${sale.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                            {sale.paymentMethod}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSales || 0}</div>
                <p className="text-xs text-muted-foreground">All time sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.todaySales || 0}</div>
                <p className="text-xs text-muted-foreground">Sales today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">All time revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.todayRevenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Revenue today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Sales by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.salesByPaymentMethod && Object.entries(analytics.salesByPaymentMethod).map(([method, count]: [string, any]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span className="capitalize">{method}</span>
                      <Badge className={getPaymentMethodColor(method)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.topProducts && analytics.topProducts.slice(0, 5).map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="truncate">{product.name}</span>
                      <Badge>{product.sales} sold</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update product details' : 'Create a new product'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  placeholder="SKU-001"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  placeholder="Electronics"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={productForm.barcode}
                onChange={(e) => setProductForm({...productForm, barcode: e.target.value})}
                placeholder="123456789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowProductDialog(false); resetProductForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingItem ? 'Update' : 'Create'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
