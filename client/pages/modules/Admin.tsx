import React, { useState, useEffect } from "react";
import { Settings, Users, Shield, Plus, Search, Key, UserCheck, UserX, AlertCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    status: 'active',
    password: '',
    phone: '',
    department: '',
    lastLogin: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      sales: { read: false, write: false, delete: false },
      crm: { read: false, write: false, delete: false },
      hr: { read: false, write: false, delete: false },
      accounting: { read: false, write: false, delete: false },
      inventory: { read: false, write: false, delete: false },
      projects: { read: false, write: false, delete: false },
      manufacturing: { read: false, write: false, delete: false },
      purchasing: { read: false, write: false, delete: false }
    }
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [u, r, an] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()).catch(() => []),
        fetch('/api/admin/roles').then(r => r.json()).catch(() => []),
        fetch('/api/admin/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setUsers([]);
      setRoles([]);
      setAnalytics({});
    }
  };

  const handleSaveUser = async () => {
    const url = editingItem ? `/api/admin/users/${editingItem._id}` : '/api/admin/users';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(userForm) 
    });
    fetchData();
    setShowUserDialog(false);
    resetUserForm();
    setEditingItem(null);
  };

  const handleSaveRole = async () => {
    const url = editingItem ? `/api/admin/roles/${editingItem._id}` : '/api/admin/roles';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(roleForm) 
    });
    fetchData();
    setShowRoleDialog(false);
    resetRoleForm();
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUserAction = async (userId: string, action: string) => {
    await fetch(`/api/admin/users/${userId}/${action}`, { method: 'POST' });
    fetchData();
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      status: 'active',
      password: '',
      phone: '',
      department: '',
      lastLogin: '',
      createdDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: {
        sales: { read: false, write: false, delete: false },
        crm: { read: false, write: false, delete: false },
        hr: { read: false, write: false, delete: false },
        accounting: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        projects: { read: false, write: false, delete: false },
        manufacturing: { read: false, write: false, delete: false },
        purchasing: { read: false, write: false, delete: false }
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-500',
      inactive: 'bg-gray-500/20 text-gray-500',
      suspended: 'bg-red-500/20 text-red-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never';

  const updatePermission = (module: string, type: string, value: boolean) => {
    setRoleForm({
      ...roleForm,
      permissions: {
        ...roleForm.permissions,
        [module]: { ...roleForm.permissions[module], [type]: value }
      }
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">System administration and user management</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-500', desc: 'All system users' },
              { title: 'Active Users', value: analytics?.activeUsers || 0, icon: UserCheck, color: 'text-green-500', desc: 'Currently active' },
              { title: 'Total Roles', value: analytics?.totalRoles || 0, icon: Shield, color: 'text-purple-500', desc: 'Permission roles' },
              { title: 'Active Sessions', value: analytics?.activeSessions || 0, icon: Key, color: 'text-orange-500', desc: 'Online now' }
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
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">Last: {formatDate(user.lastLogin)}</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-center text-muted-foreground py-8">No users yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>System Roles</CardTitle>
                <CardDescription>Configured permission roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roles.slice(0, 5).map((role) => (
                    <div key={role._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <Shield className="w-5 h-5 text-purple-500 ml-auto" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.keys(role.permissions || {}).length} modules
                        </p>
                      </div>
                    </div>
                  ))}
                  {roles.length === 0 && <p className="text-center text-muted-foreground py-8">No roles configured</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and access</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetUserForm(); 
                  setEditingItem(null); 
                  setShowUserDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => 
                    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-semibold">{user.username}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(user); 
                            setUserForm(user); 
                            setShowUserDialog(true); 
                          }}>Edit</Button>
                          {user.status === 'active' ? (
                            <Button size="sm" variant="ghost" onClick={() => handleUserAction(user._id, 'deactivate')}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleUserAction(user._id, 'activate')}>
                              Activate
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('users', user._id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Configure role-based access control</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetRoleForm(); 
                  setEditingItem(null); 
                  setShowRoleDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell className="font-semibold">{role.name}</TableCell>
                      <TableCell className="text-muted-foreground">{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(role.permissions || {}).map(([module, perms]: [string, any]) => {
                            const hasAny = perms.read || perms.write || perms.delete;
                            return hasAny ? (
                              <Badge key={module} variant="secondary" className="text-xs">
                                {module}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(role); 
                            setRoleForm(role); 
                            setShowRoleDialog(true); 
                          }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('roles', role._id)}>Delete</Button>
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

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit User' : 'New User'}</DialogTitle>
            <DialogDescription>Manage user account details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input 
                  value={userForm.username} 
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})} 
                  placeholder="johndoe" 
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={userForm.fullName} 
                  onChange={(e) => setUserForm({...userForm, fullName: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={userForm.email} 
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})} 
                  placeholder="john@example.com" 
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={userForm.phone} 
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password {!editingItem && '*'}</Label>
                <Input 
                  type="password"
                  value={userForm.password} 
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})} 
                  placeholder={editingItem ? "Leave blank to keep current" : "Enter password"} 
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input 
                  value={userForm.department} 
                  onChange={(e) => setUserForm({...userForm, department: e.target.value})} 
                  placeholder="IT Department" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={userForm.status} onValueChange={(value) => setUserForm({...userForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Role' : 'New Role'}</DialogTitle>
            <DialogDescription>Configure role permissions</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Role Name *</Label>
              <Input 
                value={roleForm.name} 
                onChange={(e) => setRoleForm({...roleForm, name: e.target.value})} 
                placeholder="Sales Manager" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={roleForm.description} 
                onChange={(e) => setRoleForm({...roleForm, description: e.target.value})} 
                placeholder="Describe the role..."
                rows={2}
              />
            </div>
            <div className="space-y-4">
              <Label className="text-base font-semibold">Module Permissions</Label>
              <div className="border rounded-lg p-4 space-y-4">
                {Object.entries(roleForm.permissions).map(([module, perms]: [string, any]) => (
                  <div key={module} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium capitalize">{module}</span>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={perms.read} 
                          onCheckedChange={(checked) => updatePermission(module, 'read', !!checked)}
                        />
                        <Label className="cursor-pointer">Read</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={perms.write} 
                          onCheckedChange={(checked) => updatePermission(module, 'write', !!checked)}
                        />
                        <Label className="cursor-pointer">Write</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={perms.delete} 
                          onCheckedChange={(checked) => updatePermission(module, 'delete', !!checked)}
                        />
                        <Label className="cursor-pointer">Delete</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} className="gradient-primary">
              {editingItem ? 'Update' : 'Create'} Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
