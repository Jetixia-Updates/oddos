import React, { useState, useEffect } from "react";
import { Store, Plus, Search, Filter, Package, ShoppingBag, Users, DollarSign, BarChart3, Eye, Edit, Trash2, Truck, Star, Check, X, Tag, MessageSquare, Globe, Link, Settings, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  stock: number;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  tags: string[];
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  shippingAddress: string;
  orderDate: string;
  trackingNumber?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface Review {
  _id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number; sales: number }>;
  recentOrders: Order[];
}

interface WebsiteSettings {
  _id?: string;
  storeName: string;
  storeUrl: string;
  storeDescription: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  language: string;
  enableLiveMode: boolean;
  apiKey: string;
  webhookUrl: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  shipping?: {
    freeShippingThreshold?: number;
    standardShippingCost?: number;
    expressShippingCost?: number;
  };
}

export default function ECommerce() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    storeName: '',
    storeUrl: '',
    storeDescription: '',
    logo: '',
    favicon: '',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    currency: 'USD',
    language: 'en',
    enableLiveMode: false,
    apiKey: '',
    webhookUrl: '',
    socialMedia: {},
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    shipping: {
      freeShippingThreshold: 0,
      standardShippingCost: 0,
      expressShippingCost: 0
    }
  });
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    comparePrice: 0,
    category: 'electronics',
    stock: 0,
    images: [] as string[],
    status: 'active' as 'active' | 'draft' | 'archived',
    featured: false,
    tags: [] as string[]
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 1,
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    fetchReviews();
    fetchCoupons();
    fetchAnalytics();
    fetchWebsiteSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/ecommerce/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/ecommerce/orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setOrders([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/ecommerce/customers');
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setCustomers([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/ecommerce/reviews');
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setReviews([]);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/ecommerce/coupons');
      const data = await response.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setCoupons([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/ecommerce/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchWebsiteSettings = async () => {
    try {
      const response = await fetch('/api/ecommerce/website-settings');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setWebsiteSettings({
            ...websiteSettings,
            ...data,
            seo: data.seo || {
              metaTitle: '',
              metaDescription: '',
              keywords: []
            },
            shipping: data.shipping || {
              freeShippingThreshold: 0,
              standardShippingCost: 0,
              expressShippingCost: 0
            }
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveWebsiteSettings = async () => {
    try {
      const response = await fetch('/api/ecommerce/website-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteSettings)
      });
      if (response.ok) {
        await fetchWebsiteSettings();
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateApiKey = () => {
    const key = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setWebsiteSettings({...websiteSettings, apiKey: key});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleSaveProduct = async () => {
    try {
      const url = editingItem ? `/api/ecommerce/products/${editingItem._id}` : '/api/ecommerce/products';
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      if (response.ok) {
        await fetchProducts();
        setShowProductDialog(false);
        resetProductForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/ecommerce/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch(`/api/ecommerce/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveCoupon = async () => {
    try {
      const url = editingItem ? `/api/ecommerce/coupons/${editingItem._id}` : '/api/ecommerce/coupons';
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponForm)
      });
      if (response.ok) {
        await fetchCoupons();
        setShowCouponDialog(false);
        resetCouponForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await fetch(`/api/ecommerce/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      await fetchReviews();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await fetch(`/api/ecommerce/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      await fetchReviews();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', sku: '', description: '', price: 0, comparePrice: 0, category: 'electronics', stock: 0, images: [], status: 'active', featured: false, tags: [] });
    setEditingItem(null);
  };

  const resetCouponForm = () => {
    setCouponForm({ code: '', type: 'percentage', value: 0, minPurchase: 0, maxDiscount: 0, usageLimit: 1, startDate: '', endDate: '', status: 'active' });
    setEditingItem(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-500', draft: 'bg-gray-500/20 text-gray-500', archived: 'bg-red-500/20 text-red-500',
      pending: 'bg-yellow-500/20 text-yellow-500', processing: 'bg-blue-500/20 text-blue-500', shipped: 'bg-purple-500/20 text-purple-500',
      delivered: 'bg-green-500/20 text-green-500', cancelled: 'bg-red-500/20 text-red-500', paid: 'bg-green-500/20 text-green-500',
      refunded: 'bg-orange-500/20 text-orange-500', failed: 'bg-red-500/20 text-red-500', approved: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500', inactive: 'bg-gray-500/20 text-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">E-Commerce</h1>
            <p className="text-muted-foreground">Manage your online store, products, and orders</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">+8.2% from last month</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="w-5 h-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalCustomers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">+15.3% from last month</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(analytics?.averageOrderValue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">+5.7% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div className="flex-1">
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                        <p className="font-bold text-lg">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
                    analytics.recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div className="flex-1">
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.total)}</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Catalog</CardTitle>
                  <CardDescription>Manage your products and inventory</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetProductForm(); setShowProductDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            {product.featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(product.price)}</TableCell>
                      <TableCell><Badge variant={product.stock > 0 ? "outline" : "destructive"}>{product.stock} units</Badge></TableCell>
                      <TableCell><Badge className={getStatusColor(product.status)}>{product.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setEditingItem(product);
                            setProductForm({ name: product.name, sku: product.sku, description: product.description, price: product.price, comparePrice: product.comparePrice || 0, category: product.category, stock: product.stock, images: product.images, status: product.status, featured: product.featured, tags: product.tags });
                            setShowProductDialog(true);
                          }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product._id)}><Trash2 className="w-4 h-4" /></Button>
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
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Track and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
                      <TableCell><Badge className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge></TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order._id, value as Order['status'])}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost"><Truck className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>Manage your customer relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <Card key={customer._id} className="border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                      </div>
                      <CardTitle className="mt-4">{customer.name}</CardTitle>
                      <CardDescription>{customer.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Orders:</span>
                        <span className="font-bold">{customer.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-bold">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Member Since:</span>
                        <span className="font-medium">{formatDate(customer.joinDate)}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-4">
                        <MessageSquare className="w-4 h-4 mr-2" />Contact
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Product Reviews</CardTitle>
              <CardDescription>Moderate customer reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{review.customerName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.productName}</p>
                        <p className="text-sm">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(review.date)}</p>
                      </div>
                      <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                    </div>
                    {review.status === 'pending' && (
                      <div className="flex gap-2 pt-3 border-t border-border/50">
                        <Button size="sm" variant="outline" onClick={() => handleApproveReview(review._id)}>
                          <Check className="w-4 h-4 mr-2" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectReview(review._id)}>
                          <X className="w-4 h-4 mr-2" />Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discount Coupons</CardTitle>
                  <CardDescription>Create and manage promotional codes</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetCouponForm(); setShowCouponDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Create Coupon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <Card key={coupon._id} className="border-white/10 hover:shadow-glow transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Tag className="w-6 h-6 text-white" />
                        </div>
                        <Badge className={getStatusColor(coupon.status)}>{coupon.status}</Badge>
                      </div>
                      <CardTitle className="mt-4 font-mono text-2xl">{coupon.code}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-3xl font-bold">{coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}</p>
                        <p className="text-xs text-muted-foreground">Discount</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Min Purchase:</span>
                        <span className="font-medium">{formatCurrency(coupon.minPurchase)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Usage:</span>
                        <span className="font-medium">{coupon.usageCount} / {coupon.usageLimit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span className="font-medium">{formatDate(coupon.endDate)}</span>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border/50">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                          setEditingItem(coupon);
                          setCouponForm({ code: coupon.code, type: coupon.type, value: coupon.value, minPurchase: coupon.minPurchase, maxDiscount: coupon.maxDiscount || 0, usageLimit: coupon.usageLimit, startDate: coupon.startDate, endDate: coupon.endDate, status: coupon.status });
                          setShowCouponDialog(true);
                        }}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Configure your online store basic settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store Name *</label>
                      <Input value={websiteSettings.storeName} onChange={(e) => setWebsiteSettings({...websiteSettings, storeName: e.target.value})} placeholder="My E-Commerce Store" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Store URL *</label>
                      <Input value={websiteSettings.storeUrl} onChange={(e) => setWebsiteSettings({...websiteSettings, storeUrl: e.target.value})} placeholder="https://mystore.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Store Description</label>
                    <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={websiteSettings.storeDescription} onChange={(e) => setWebsiteSettings({...websiteSettings, storeDescription: e.target.value})} placeholder="Brief description of your store..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Currency</label>
                      <Select value={websiteSettings.currency} onValueChange={(value) => setWebsiteSettings({...websiteSettings, currency: value})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <Select value={websiteSettings.language} onValueChange={(value) => setWebsiteSettings({...websiteSettings, language: value})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Color</label>
                      <div className="flex gap-2">
                        <Input type="color" value={websiteSettings.primaryColor} onChange={(e) => setWebsiteSettings({...websiteSettings, primaryColor: e.target.value})} className="h-10 w-20" />
                        <Input value={websiteSettings.primaryColor} onChange={(e) => setWebsiteSettings({...websiteSettings, primaryColor: e.target.value})} placeholder="#6366f1" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Optimize your store for search engines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Title</label>
                    <Input value={websiteSettings.seo?.metaTitle || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, seo: {...(websiteSettings.seo || {}), metaTitle: e.target.value}})} placeholder="Your Store - Best Products Online" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Description</label>
                    <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={websiteSettings.seo?.metaDescription || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, seo: {...(websiteSettings.seo || {}), metaDescription: e.target.value}})} placeholder="Shop the best products at amazing prices..." />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Shipping Configuration</CardTitle>
                  <CardDescription>Set up shipping costs and thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Free Shipping Threshold</label>
                      <Input type="number" value={websiteSettings.shipping?.freeShippingThreshold || 0} onChange={(e) => setWebsiteSettings({...websiteSettings, shipping: {...(websiteSettings.shipping || {}), freeShippingThreshold: parseFloat(e.target.value) || 0}})} placeholder="100.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Standard Shipping</label>
                      <Input type="number" value={websiteSettings.shipping?.standardShippingCost || 0} onChange={(e) => setWebsiteSettings({...websiteSettings, shipping: {...(websiteSettings.shipping || {}), standardShippingCost: parseFloat(e.target.value) || 0}})} placeholder="5.99" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Express Shipping</label>
                      <Input type="number" value={websiteSettings.shipping?.expressShippingCost || 0} onChange={(e) => setWebsiteSettings({...websiteSettings, shipping: {...(websiteSettings.shipping || {}), expressShippingCost: parseFloat(e.target.value) || 0}})} placeholder="15.99" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Facebook</label>
                      <Input value={websiteSettings.socialMedia?.facebook || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, socialMedia: {...(websiteSettings.socialMedia || {}), facebook: e.target.value}})} placeholder="https://facebook.com/yourstore" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instagram</label>
                      <Input value={websiteSettings.socialMedia?.instagram || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, socialMedia: {...(websiteSettings.socialMedia || {}), instagram: e.target.value}})} placeholder="https://instagram.com/yourstore" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Twitter</label>
                      <Input value={websiteSettings.socialMedia?.twitter || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, socialMedia: {...(websiteSettings.socialMedia || {}), twitter: e.target.value}})} placeholder="https://twitter.com/yourstore" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LinkedIn</label>
                      <Input value={websiteSettings.socialMedia?.linkedin || ''} onChange={(e) => setWebsiteSettings({...websiteSettings, socialMedia: {...(websiteSettings.socialMedia || {}), linkedin: e.target.value}})} placeholder="https://linkedin.com/company/yourstore" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset</Button>
                <Button onClick={handleSaveWebsiteSettings} className="gradient-primary">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Save Settings
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Live Mode</CardTitle>
                      <CardDescription>Enable your store</CardDescription>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={websiteSettings.enableLiveMode} onChange={(e) => setWebsiteSettings({...websiteSettings, enableLiveMode: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  {websiteSettings.enableLiveMode ? (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-500 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="font-semibold">Store is Live</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Your store is accepting orders</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-muted-foreground">Store is in test mode</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>API Integration</CardTitle>
                  <CardDescription>Connect your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex gap-2">
                      <Input type="password" value={websiteSettings.apiKey} readOnly placeholder="Generate API key" className="flex-1 font-mono text-xs" />
                      <Button size="sm" variant="outline" onClick={() => setShowApiKeyDialog(true)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={generateApiKey}>
                    <Settings className="w-4 h-4 mr-2" />Generate New Key
                  </Button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Webhook URL</label>
                    <Input value={websiteSettings.webhookUrl} onChange={(e) => setWebsiteSettings({...websiteSettings, webhookUrl: e.target.value})} placeholder="https://yoursite.com/webhook" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Access your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open(websiteSettings.storeUrl, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />Visit Store
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => copyToClipboard(websiteSettings.storeUrl)}>
                    <Copy className="w-4 h-4 mr-2" />Copy Store URL
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => copyToClipboard(websiteSettings.apiKey)}>
                    <Link className="w-4 h-4 mr-2" />Copy API Key
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Integration Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-semibold">Step 1: Install SDK</p>
                    <code className="block text-xs bg-background p-2 rounded">npm install @yourstore/ecommerce-sdk</code>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-semibold">Step 2: Initialize</p>
                    <code className="block text-xs bg-background p-2 rounded">
                      {'const store = new ECommerce({'}
                      <br />{'  apiKey: "your-api-key",'}
                      <br />{'  storeUrl: "your-store-url"'}
                      <br />{'})'}
                    </code>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-semibold">Step 3: Fetch Products</p>
                    <code className="block text-xs bg-background p-2 rounded">const products = await store.getProducts()</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Product' : 'New Product'}</DialogTitle>
            <DialogDescription>Add or update product information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} placeholder="PROD-001" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Product description..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compare Price</label>
                <Input type="number" value={productForm.comparePrice} onChange={(e) => setProductForm({...productForm, comparePrice: parseFloat(e.target.value) || 0})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="toys">Toys</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={productForm.status} onValueChange={(value) => setProductForm({...productForm, status: value as 'active' | 'draft' | 'archived'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={productForm.featured} onChange={(e) => setProductForm({...productForm, featured: e.target.checked})} className="w-4 h-4" />
              <label htmlFor="featured" className="text-sm font-medium">Featured Product</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} className="gradient-primary">Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
            <DialogDescription>Set up discount code and conditions</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code *</label>
              <Input value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="SUMMER2024" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={couponForm.type} onValueChange={(value) => setCouponForm({...couponForm, type: value as 'percentage' | 'fixed'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value *</label>
                <Input type="number" value={couponForm.value} onChange={(e) => setCouponForm({...couponForm, value: parseFloat(e.target.value) || 0})} placeholder={couponForm.type === 'percentage' ? '10' : '50.00'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Purchase</label>
                <Input type="number" value={couponForm.minPurchase} onChange={(e) => setCouponForm({...couponForm, minPurchase: parseFloat(e.target.value) || 0})} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Limit</label>
                <Input type="number" value={couponForm.usageLimit} onChange={(e) => setCouponForm({...couponForm, usageLimit: parseInt(e.target.value) || 1})} placeholder="100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={couponForm.startDate} onChange={(e) => setCouponForm({...couponForm, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={couponForm.endDate} onChange={(e) => setCouponForm({...couponForm, endDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={couponForm.status} onValueChange={(value) => setCouponForm({...couponForm, status: value as 'active' | 'inactive'})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCoupon} className="gradient-primary">Save Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key</DialogTitle>
            <DialogDescription>Use this key to integrate with your website. Keep it secure!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted font-mono text-sm break-all">
              {websiteSettings.apiKey || 'No API key generated yet'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(websiteSettings.apiKey)}>
                <Copy className="w-4 h-4 mr-2" />Copy
              </Button>
              <Button variant="outline" className="flex-1" onClick={generateApiKey}>
                <Settings className="w-4 h-4 mr-2" />Regenerate
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground">⚠️ Regenerating will invalidate the old key and may break existing integrations.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowApiKeyDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
