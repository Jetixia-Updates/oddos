import React, { useState, useEffect } from "react";
import { Barcode as BarcodeIcon, Plus, Search, Package, Scan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Barcode() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [products, setProducts] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [scannedCode, setScannedCode] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    sku: '',
    category: 'product',
    price: 0,
    quantity: 0,
    location: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.all([
        fetch('/api/barcode/products').then(r => r.json()).catch(() => []),
        fetch('/api/barcode/scans').then(r => r.json()).catch(() => [])
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setScans(Array.isArray(s) ? s : []);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
      setScans([]);
    }
  };

  const handleScan = async () => {
    if (!scannedCode) return;
    await fetch('/api/barcode/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: scannedCode })
    });
    setScannedCode('');
    fetchData();
  };

  const handleSaveProduct = async () => {
    const url = editingItem ? `/api/barcode/products/${editingItem._id}` : '/api/barcode/products';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(productForm) 
    });
    fetchData();
    setShowProductDialog(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/barcode/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const resetForm = () => {
    setProductForm({ name: '', barcode: '', sku: '', category: 'product', price: 0, quantity: 0, location: '' });
  };

  const generateBarcode = () => {
    const code = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    setProductForm({...productForm, barcode: code});
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BarcodeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Barcode Management</h1>
            <p className="text-muted-foreground">Scan and manage product barcodes</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
              <CardDescription>Scan product barcodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Scan className="w-24 h-24 text-muted-foreground mb-8" />
                <div className="w-full max-w-md space-y-4">
                  <Input 
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Enter or scan barcode..."
                    className="text-center text-2xl h-16"
                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <Button onClick={handleScan} className="w-full gradient-primary h-12 text-lg">
                    <Scan className="w-5 h-5 mr-2" />
                    Scan Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scans.slice(0, 5).map((scan) => {
                  const product = products.find(p => p.barcode === scan.barcode);
                  return (
                    <div key={scan._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{product?.name || 'Unknown Product'}</p>
                        <p className="text-sm font-mono text-muted-foreground">{scan.barcode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(scan.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage barcoded products</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetForm(); 
                  setEditingItem(null); 
                  setShowProductDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell className="font-semibold">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                      <TableCell className="font-bold">${product.price}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(product); 
                            setProductForm(product); 
                            setShowProductDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(product._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>All barcode scans</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Scanned At</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan) => {
                    const product = products.find(p => p.barcode === scan.barcode);
                    return (
                      <TableRow key={scan._id}>
                        <TableCell className="font-mono text-sm">{scan.barcode}</TableCell>
                        <TableCell className="font-semibold">{product?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(scan.scannedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{scan.location || 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input 
                value={productForm.name} 
                onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                placeholder="Product name" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barcode *</Label>
                <div className="flex gap-2">
                  <Input 
                    value={productForm.barcode} 
                    onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} 
                    placeholder="123456789012" 
                  />
                  <Button type="button" onClick={generateBarcode}>Generate</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input 
                  value={productForm.sku} 
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})} 
                  placeholder="SKU-001" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input 
                  type="number"
                  value={productForm.price} 
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number"
                  value={productForm.quantity} 
                  onChange={(e) => setProductForm({...productForm, quantity: parseInt(e.target.value)})} 
                  placeholder="0" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                value={productForm.location} 
                onChange={(e) => setProductForm({...productForm, location: e.target.value})} 
                placeholder="Warehouse location" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct} className="gradient-primary">
              {editingItem ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
