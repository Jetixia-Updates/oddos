import React, { useState, useEffect } from "react";
import { Headphones, Plus, Search, Ticket, BarChart3, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
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

interface HelpdeskTicket {
  _id?: string;
  ticketNumber: string;
  subject: string;
  description: string;
  customer: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo: string;
  createdAt?: string;
}

export default function Helpdesk() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [ticketForm, setTicketForm] = useState<HelpdeskTicket>({
    ticketNumber: '',
    subject: '',
    description: '',
    customer: '',
    priority: 'normal',
    status: 'open',
    assignedTo: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [t, an] = await Promise.all([
        fetch('/api/helpdesk/tickets').then(r => r.json()).catch(() => []),
        fetch('/api/helpdesk/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setTickets(Array.isArray(t) ? t : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setTickets([]);
      setAnalytics({});
    }
  };

  const handleSaveTicket = async () => {
    try {
      const url = editingItem ? `/api/helpdesk/tickets/${editingItem._id}` : '/api/helpdesk/tickets';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(ticketForm) 
      });
      fetchData();
      setShowTicketDialog(false);
      resetTicketForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await fetch(`/api/helpdesk/tickets/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const resetTicketForm = () => {
    setTicketForm({
      ticketNumber: '',
      subject: '',
      description: '',
      customer: '',
      priority: 'normal',
      status: 'open',
      assignedTo: ''
    });
  };

  const openEditTicket = (ticket: HelpdeskTicket) => {
    setEditingItem(ticket);
    setTicketForm(ticket);
    setShowTicketDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="w-8 h-8 text-violet-500" />
            Helpdesk
          </h1>
          <p className="text-gray-500 mt-1">Manage support tickets and customer inquiries</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalTickets || 0}</div>
                <p className="text-xs text-muted-foreground">All time tickets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.openTickets || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.inProgressTickets || 0}</div>
                <p className="text-xs text-muted-foreground">Being worked on</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.resolvedTickets || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully resolved</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Status Distribution</CardTitle>
                <CardDescription>Tickets by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.ticketsByStatus && Object.entries(analytics.ticketsByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                      <Badge className={getStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Tickets by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.ticketsByPriority && Object.entries(analytics.ticketsByPriority).map(([priority, count]: [string, any]) => (
                    <div key={priority} className="flex justify-between items-center">
                      <span className="capitalize">{priority}</span>
                      <Badge className={getPriorityColor(priority)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetTicketForm(); setEditingItem(null); setShowTicketDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Ticket
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage customer support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket._id}>
                        <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>{ticket.customer}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.assignedTo}</TableCell>
                        <TableCell>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditTicket(ticket)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTicket(ticket._id!)}>
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

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resolution Trends</CardTitle>
                <CardDescription>Average resolution time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Resolution Time</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analytics?.avgResolutionTime || '0'} hours
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fastest Resolution</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics?.fastestResolution || '0'} hours
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Slowest Resolution</span>
                    <Badge className="bg-red-100 text-red-800">
                      {analytics?.slowestResolution || '0'} hours
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Trends</CardTitle>
                <CardDescription>Monthly ticket statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analytics?.thisMonth || 0} tickets
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Month</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {analytics?.lastMonth || 0} tickets
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trend</span>
                    <Badge className={analytics?.trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {analytics?.trend > 0 ? '↑' : '↓'} {Math.abs(analytics?.trend || 0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Ticket' : 'Add New Ticket'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update ticket details' : 'Create a new support ticket'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ticketNumber">Ticket Number</Label>
              <Input
                id="ticketNumber"
                value={ticketForm.ticketNumber}
                onChange={(e) => setTicketForm({...ticketForm, ticketNumber: e.target.value})}
                placeholder="TKT-001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={ticketForm.customer}
                onChange={(e) => setTicketForm({...ticketForm, customer: e.target.value})}
                placeholder="Customer name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value: any) => setTicketForm({...ticketForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={ticketForm.status} onValueChange={(value: any) => setTicketForm({...ticketForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={ticketForm.assignedTo}
                onChange={(e) => setTicketForm({...ticketForm, assignedTo: e.target.value})}
                placeholder="Agent name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTicketDialog(false); resetTicketForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTicket}>
              {editingItem ? 'Update' : 'Create'} Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
