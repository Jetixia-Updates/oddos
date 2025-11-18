import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Package,
  Eye,
  Edit,
  Trash2,
  Download,
  Send
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface QuotationItem {
  product: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  customer: string;
  customerName?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  validUntil: string;
  createdAt: string;
}

interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  customerName?: string;
  items: QuotationItem[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export default function Sales() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, productsRes, quotationsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch('/api/sales/customers'),
        fetch('/api/sales/products'),
        fetch('/api/sales/quotations'),
        fetch('/api/sales/orders'),
        fetch('/api/sales/analytics'),
      ]);

      if (customersRes.ok) setCustomers(await customersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (quotationsRes.ok) setQuotations(await quotationsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-400",
      sent: "bg-blue-500/20 text-blue-400",
      accepted: "bg-green-500/20 text-green-400",
      confirmed: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      cancelled: "bg-red-500/20 text-red-400",
      processing: "bg-yellow-500/20 text-yellow-400",
      delivered: "bg-green-500/20 text-green-400",
      paid: "bg-green-500/20 text-green-400",
      unpaid: "bg-red-500/20 text-red-400",
      partial: "bg-orange-500/20 text-orange-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gradient mb-2">Sales Management</h1>
            <p className="text-muted-foreground">Manage your entire sales pipeline from leads to orders</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics ? formatCurrency(analytics.totalRevenue) : '---'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics?.totalOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="w-5 h-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics?.totalCustomers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics ? `${analytics.conversionRate.toFixed(1)}% conversion` : '---'}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics ? formatCurrency(analytics.averageOrderValue) : '---'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +5.3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Last 12 months revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {analytics?.revenueByMonth && analytics.revenueByMonth.length > 0 ? (
                      <div className="w-full space-y-2">
                        {analytics.revenueByMonth.slice(-6).map((month, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-xs w-16">{month.month}</span>
                            <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-end px-3"
                                style={{ 
                                  width: `${(month.revenue / Math.max(...analytics.revenueByMonth.map(m => m.revenue))) * 100}%` 
                                }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {formatCurrency(month.revenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No revenue data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                      analytics.topProducts.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.quantity} units sold
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gradient">
                              {formatCurrency(product.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">No product data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest sales orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Customers & Leads</CardTitle>
                    <CardDescription>Manage your customer database</CardDescription>
                  </div>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers
                      .filter(c => 
                        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-semibold">{customer.name}</TableCell>
                        <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.company || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>Manage products and pricing</CardDescription>
                  </div>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product._id} className="border-white/10 hover:shadow-glow transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <CardTitle className="mt-4">{product.name}</CardTitle>
                        <CardDescription className="font-mono">{product.sku}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gradient">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {product.stock} units
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quotations</CardTitle>
                    <CardDescription>Manage sales quotations and proposals</CardDescription>
                  </div>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quotation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quote) => (
                      <TableRow key={quote._id}>
                        <TableCell className="font-mono font-bold">
                          {quote.quotationNumber}
                        </TableCell>
                        <TableCell>{quote.customerName}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(quote.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(quote.validUntil)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(quote.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Send">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Download">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Orders</CardTitle>
                    <CardDescription>Track and manage confirmed orders</CardDescription>
                  </div>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono font-bold">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Download Invoice">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
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
      </div>
    </div>
  );
}
