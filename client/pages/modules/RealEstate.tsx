import React, { useState, useEffect } from "react";
import { Building2, Home, Users, FileText, Plus, Search, MapPin, DollarSign, Key, Calendar } from "lucide-react";
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

export default function RealEstate() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showPropertyDialog, setShowPropertyDialog] = useState(false);
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [showLeaseDialog, setShowLeaseDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [propertyForm, setPropertyForm] = useState({
    propertyId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'apartment',
    size: 0,
    bedrooms: 0,
    bathrooms: 0,
    price: 0,
    status: 'available',
    amenities: '',
    description: '',
    yearBuilt: '',
    parkingSpaces: 0,
    petFriendly: false
  });

  const [tenantForm, setTenantForm] = useState({
    tenantName: '',
    phone: '',
    email: '',
    idPassport: '',
    occupation: '',
    employer: '',
    monthlyIncome: 0,
    propertyAssigned: '',
    moveInDate: '',
    leaseStart: '',
    leaseEnd: '',
    depositPaid: 0,
    emergencyContact: '',
    previousAddress: ''
  });

  const [leaseForm, setLeaseForm] = useState({
    leaseId: '',
    property: '',
    propertyAddress: '',
    tenant: '',
    tenantName: '',
    startDate: '',
    endDate: '',
    monthlyRent: 0,
    securityDeposit: 0,
    status: 'active',
    paymentDueDate: 1,
    terms: '',
    renewalOption: false,
    utilities: '',
    specialConditions: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, t, l, an] = await Promise.all([
        fetch('/api/realestate/properties').then(r => r.json()).catch(() => []),
        fetch('/api/realestate/tenants').then(r => r.json()).catch(() => []),
        fetch('/api/realestate/leases').then(r => r.json()).catch(() => []),
        fetch('/api/realestate/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setProperties(Array.isArray(p) ? p : []);
      setTenants(Array.isArray(t) ? t : []);
      setLeases(Array.isArray(l) ? l : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setProperties([]);
      setTenants([]);
      setLeases([]);
      setAnalytics({});
    }
  };

  const handleSaveProperty = async () => {
    try {
      const url = editingItem ? `/api/realestate/properties/${editingItem._id}` : '/api/realestate/properties';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(propertyForm) 
      });
      fetchData();
      setShowPropertyDialog(false);
      resetPropertyForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property');
    }
  };

  const handleSaveTenant = async () => {
    try {
      const url = editingItem ? `/api/realestate/tenants/${editingItem._id}` : '/api/realestate/tenants';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(tenantForm) 
      });
      fetchData();
      setShowTenantDialog(false);
      resetTenantForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Failed to save tenant');
    }
  };

  const handleSaveLease = async () => {
    try {
      const url = editingItem ? `/api/realestate/leases/${editingItem._id}` : '/api/realestate/leases';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(leaseForm) 
      });
      fetchData();
      setShowLeaseDialog(false);
      resetLeaseForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving lease:', error);
      alert('Failed to save lease');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/api/realestate/${type}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    }
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      propertyId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      type: 'apartment',
      size: 0,
      bedrooms: 0,
      bathrooms: 0,
      price: 0,
      status: 'available',
      amenities: '',
      description: '',
      yearBuilt: '',
      parkingSpaces: 0,
      petFriendly: false
    });
  };

  const resetTenantForm = () => {
    setTenantForm({
      tenantName: '',
      phone: '',
      email: '',
      idPassport: '',
      occupation: '',
      employer: '',
      monthlyIncome: 0,
      propertyAssigned: '',
      moveInDate: '',
      leaseStart: '',
      leaseEnd: '',
      depositPaid: 0,
      emergencyContact: '',
      previousAddress: ''
    });
  };

  const resetLeaseForm = () => {
    setLeaseForm({
      leaseId: '',
      property: '',
      propertyAddress: '',
      tenant: '',
      tenantName: '',
      startDate: '',
      endDate: '',
      monthlyRent: 0,
      securityDeposit: 0,
      status: 'active',
      paymentDueDate: 1,
      terms: '',
      renewalOption: false,
      utilities: '',
      specialConditions: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500/20 text-green-500',
      occupied: 'bg-blue-500/20 text-blue-500',
      maintenance: 'bg-orange-500/20 text-orange-500',
      reserved: 'bg-purple-500/20 text-purple-500',
      active: 'bg-green-500/20 text-green-500',
      expired: 'bg-red-500/20 text-red-500',
      terminated: 'bg-gray-500/20 text-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Real Estate</h1>
            <p className="text-muted-foreground">Property and tenant management system</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Properties', value: analytics?.totalProperties || 0, icon: Building2, color: 'text-blue-500', desc: 'All properties' },
              { title: 'Occupied', value: analytics?.occupiedProperties || 0, icon: Key, color: 'text-green-500', desc: 'Currently occupied' },
              { title: 'Total Tenants', value: analytics?.totalTenants || 0, icon: Users, color: 'text-purple-500', desc: 'Active tenants' },
              { title: 'Monthly Revenue', value: formatCurrency(analytics?.monthlyRevenue || 0), icon: DollarSign, color: 'text-orange-500', desc: 'This month' }
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
                <CardTitle>Available Properties</CardTitle>
                <CardDescription>Properties ready for lease</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.filter(p => p.status === 'available').slice(0, 5).map((property) => (
                    <div key={property._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{property.address}</p>
                        <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{property.type}</Badge>
                          <Badge variant="secondary">{property.bedrooms}BR / {property.bathrooms}BA</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-500">{formatCurrency(property.price)}</p>
                        <p className="text-xs text-muted-foreground">{property.size} sqft</p>
                      </div>
                    </div>
                  ))}
                  {properties.filter(p => p.status === 'available').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No available properties</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Active Leases</CardTitle>
                <CardDescription>Current lease agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leases.filter(l => l.status === 'active').slice(0, 5).map((lease) => (
                    <div key={lease._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{lease.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{lease.propertyAddress}</p>
                        <Badge className={getStatusColor(lease.status)} className="mt-1">{lease.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(lease.monthlyRent)}/mo</p>
                        <p className="text-xs text-muted-foreground">Due: {lease.paymentDueDate}</p>
                        <p className="text-xs text-muted-foreground">Ends: {formatDate(lease.endDate)}</p>
                      </div>
                    </div>
                  ))}
                  {leases.filter(l => l.status === 'active').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No active leases</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Property Distribution</CardTitle>
              <CardDescription>Properties by type and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['apartment', 'house', 'commercial', 'land'].map((type) => {
                  const count = properties.filter(p => p.type === type).length;
                  const available = properties.filter(p => p.type === type && p.status === 'available').length;
                  return (
                    <div key={type} className="text-center p-4 rounded-lg border border-border/50">
                      <div className="text-2xl font-bold mb-2 capitalize">{type}</div>
                      <div className="text-3xl font-semibold text-blue-500">{count}</div>
                      <p className="text-xs text-muted-foreground mt-1">{available} available</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Management</CardTitle>
                  <CardDescription>Manage property listings and details</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetPropertyForm(); 
                  setEditingItem(null); 
                  setShowPropertyDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search properties..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Bed/Bath</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.filter(p => 
                    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((property) => (
                    <TableRow key={property._id}>
                      <TableCell className="font-mono">{property.propertyId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{property.address}</p>
                          <p className="text-sm text-muted-foreground">{property.city}, {property.state} {property.zipCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{property.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{property.size} sqft</TableCell>
                      <TableCell>{property.bedrooms} / {property.bathrooms}</TableCell>
                      <TableCell className="font-bold text-green-500">{formatCurrency(property.price)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(property); 
                            setPropertyForm(property); 
                            setShowPropertyDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('properties', property._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {properties.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No properties added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tenant Management</CardTitle>
                  <CardDescription>Manage tenant information and contacts</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetTenantForm(); 
                  setEditingItem(null); 
                  setShowTenantDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Tenant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Move-In</TableHead>
                    <TableHead>Lease Period</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant._id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{tenant.tenantName}</p>
                          <p className="text-sm text-muted-foreground">{tenant.occupation}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{tenant.phone}</p>
                          <p className="text-sm text-muted-foreground">{tenant.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tenant.propertyAssigned}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(tenant.moveInDate)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(tenant.leaseStart)}</p>
                          <p className="text-sm text-muted-foreground">to {formatDate(tenant.leaseEnd)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(tenant.depositPaid)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(tenant); 
                            setTenantForm(tenant); 
                            setShowTenantDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('tenants', tenant._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {tenants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tenants registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leases" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lease Management</CardTitle>
                  <CardDescription>Manage lease agreements and terms</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetLeaseForm(); 
                  setEditingItem(null); 
                  setShowLeaseDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Lease
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lease ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Start / End</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leases.map((lease) => (
                    <TableRow key={lease._id}>
                      <TableCell className="font-mono">{lease.leaseId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{lease.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">Due: Day {lease.paymentDueDate}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{lease.tenantName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(lease.startDate)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(lease.endDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-500">{formatCurrency(lease.monthlyRent)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(lease.securityDeposit)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lease.status)}>{lease.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(lease); 
                            setLeaseForm(lease); 
                            setShowLeaseDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('leases', lease._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {leases.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No leases created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Property Dialog */}
      <Dialog open={showPropertyDialog} onOpenChange={setShowPropertyDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Property' : 'New Property'}</DialogTitle>
            <DialogDescription>Manage property information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property ID *</Label>
                <Input 
                  value={propertyForm.propertyId} 
                  onChange={(e) => setPropertyForm({...propertyForm, propertyId: e.target.value})} 
                  placeholder="PROP-2024-001" 
                />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={propertyForm.type} onValueChange={(value) => setPropertyForm({...propertyForm, type: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input 
                value={propertyForm.address} 
                onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})} 
                placeholder="123 Main Street" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input 
                  value={propertyForm.city} 
                  onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})} 
                  placeholder="New York" 
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input 
                  value={propertyForm.state} 
                  onChange={(e) => setPropertyForm({...propertyForm, state: e.target.value})} 
                  placeholder="NY" 
                />
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input 
                  value={propertyForm.zipCode} 
                  onChange={(e) => setPropertyForm({...propertyForm, zipCode: e.target.value})} 
                  placeholder="10001" 
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Size (sqft) *</Label>
                <Input 
                  type="number"
                  value={propertyForm.size} 
                  onChange={(e) => setPropertyForm({...propertyForm, size: parseFloat(e.target.value)})} 
                  placeholder="1200" 
                />
              </div>
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input 
                  type="number"
                  value={propertyForm.bedrooms} 
                  onChange={(e) => setPropertyForm({...propertyForm, bedrooms: parseInt(e.target.value)})} 
                  placeholder="2" 
                />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input 
                  type="number"
                  value={propertyForm.bathrooms} 
                  onChange={(e) => setPropertyForm({...propertyForm, bathrooms: parseFloat(e.target.value)})} 
                  placeholder="2" 
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Parking</Label>
                <Input 
                  type="number"
                  value={propertyForm.parkingSpaces} 
                  onChange={(e) => setPropertyForm({...propertyForm, parkingSpaces: parseInt(e.target.value)})} 
                  placeholder="1" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($/month) *</Label>
                <Input 
                  type="number"
                  value={propertyForm.price} 
                  onChange={(e) => setPropertyForm({...propertyForm, price: parseFloat(e.target.value)})} 
                  placeholder="2500" 
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={propertyForm.status} onValueChange={(value) => setPropertyForm({...propertyForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year Built</Label>
                <Input 
                  value={propertyForm.yearBuilt} 
                  onChange={(e) => setPropertyForm({...propertyForm, yearBuilt: e.target.value})} 
                  placeholder="2020" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <Input 
                value={propertyForm.amenities} 
                onChange={(e) => setPropertyForm({...propertyForm, amenities: e.target.value})} 
                placeholder="Pool, Gym, Parking, etc." 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={propertyForm.description} 
                onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})} 
                placeholder="Property description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPropertyDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProperty} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Dialog */}
      <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Tenant' : 'New Tenant'}</DialogTitle>
            <DialogDescription>Manage tenant information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tenant Name *</Label>
                <Input 
                  value={tenantForm.tenantName} 
                  onChange={(e) => setTenantForm({...tenantForm, tenantName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label>ID/Passport *</Label>
                <Input 
                  value={tenantForm.idPassport} 
                  onChange={(e) => setTenantForm({...tenantForm, idPassport: e.target.value})} 
                  placeholder="ID123456" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input 
                  value={tenantForm.phone} 
                  onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={tenantForm.email} 
                  onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})} 
                  placeholder="tenant@example.com" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input 
                  value={tenantForm.occupation} 
                  onChange={(e) => setTenantForm({...tenantForm, occupation: e.target.value})} 
                  placeholder="Software Engineer" 
                />
              </div>
              <div className="space-y-2">
                <Label>Employer</Label>
                <Input 
                  value={tenantForm.employer} 
                  onChange={(e) => setTenantForm({...tenantForm, employer: e.target.value})} 
                  placeholder="Company Name" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Income</Label>
                <Input 
                  type="number"
                  value={tenantForm.monthlyIncome} 
                  onChange={(e) => setTenantForm({...tenantForm, monthlyIncome: parseFloat(e.target.value)})} 
                  placeholder="5000" 
                />
              </div>
              <div className="space-y-2">
                <Label>Property Assigned</Label>
                <Input 
                  value={tenantForm.propertyAssigned} 
                  onChange={(e) => setTenantForm({...tenantForm, propertyAssigned: e.target.value})} 
                  placeholder="123 Main Street" 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Move-In Date</Label>
                <Input 
                  type="date"
                  value={tenantForm.moveInDate} 
                  onChange={(e) => setTenantForm({...tenantForm, moveInDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Lease Start *</Label>
                <Input 
                  type="date"
                  value={tenantForm.leaseStart} 
                  onChange={(e) => setTenantForm({...tenantForm, leaseStart: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Lease End *</Label>
                <Input 
                  type="date"
                  value={tenantForm.leaseEnd} 
                  onChange={(e) => setTenantForm({...tenantForm, leaseEnd: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deposit Paid *</Label>
              <Input 
                type="number"
                value={tenantForm.depositPaid} 
                onChange={(e) => setTenantForm({...tenantForm, depositPaid: parseFloat(e.target.value)})} 
                placeholder="2500" 
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input 
                value={tenantForm.emergencyContact} 
                onChange={(e) => setTenantForm({...tenantForm, emergencyContact: e.target.value})} 
                placeholder="Name and phone number" 
              />
            </div>
            <div className="space-y-2">
              <Label>Previous Address</Label>
              <Textarea 
                value={tenantForm.previousAddress} 
                onChange={(e) => setTenantForm({...tenantForm, previousAddress: e.target.value})} 
                placeholder="Previous residential address..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTenantDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTenant} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lease Dialog */}
      <Dialog open={showLeaseDialog} onOpenChange={setShowLeaseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Lease' : 'New Lease'}</DialogTitle>
            <DialogDescription>Manage lease agreement details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease ID *</Label>
                <Input 
                  value={leaseForm.leaseId} 
                  onChange={(e) => setLeaseForm({...leaseForm, leaseId: e.target.value})} 
                  placeholder="LEASE-2024-001" 
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={leaseForm.status} onValueChange={(value) => setLeaseForm({...leaseForm, status: value})}>
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
                <Label>Property Address *</Label>
                <Input 
                  value={leaseForm.propertyAddress} 
                  onChange={(e) => setLeaseForm({...leaseForm, propertyAddress: e.target.value})} 
                  placeholder="123 Main Street" 
                />
              </div>
              <div className="space-y-2">
                <Label>Tenant Name *</Label>
                <Input 
                  value={leaseForm.tenantName} 
                  onChange={(e) => setLeaseForm({...leaseForm, tenantName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input 
                  type="date"
                  value={leaseForm.startDate} 
                  onChange={(e) => setLeaseForm({...leaseForm, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input 
                  type="date"
                  value={leaseForm.endDate} 
                  onChange={(e) => setLeaseForm({...leaseForm, endDate: e.target.value})} 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent *</Label>
                <Input 
                  type="number"
                  value={leaseForm.monthlyRent} 
                  onChange={(e) => setLeaseForm({...leaseForm, monthlyRent: parseFloat(e.target.value)})} 
                  placeholder="2500" 
                />
              </div>
              <div className="space-y-2">
                <Label>Security Deposit *</Label>
                <Input 
                  type="number"
                  value={leaseForm.securityDeposit} 
                  onChange={(e) => setLeaseForm({...leaseForm, securityDeposit: parseFloat(e.target.value)})} 
                  placeholder="2500" 
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Due (Day)</Label>
                <Input 
                  type="number"
                  value={leaseForm.paymentDueDate} 
                  onChange={(e) => setLeaseForm({...leaseForm, paymentDueDate: parseInt(e.target.value)})} 
                  placeholder="1" 
                  min="1"
                  max="31"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Utilities Included</Label>
              <Input 
                value={leaseForm.utilities} 
                onChange={(e) => setLeaseForm({...leaseForm, utilities: e.target.value})} 
                placeholder="Water, Electricity, Gas, etc." 
              />
            </div>
            <div className="space-y-2">
              <Label>Lease Terms</Label>
              <Textarea 
                value={leaseForm.terms} 
                onChange={(e) => setLeaseForm({...leaseForm, terms: e.target.value})} 
                placeholder="Standard lease terms and conditions..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Special Conditions</Label>
              <Textarea 
                value={leaseForm.specialConditions} 
                onChange={(e) => setLeaseForm({...leaseForm, specialConditions: e.target.value})} 
                placeholder="Any special conditions or agreements..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaseDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLease} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Lease
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
