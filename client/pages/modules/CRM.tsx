import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Target,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Activity,
  BarChart3,
  UserPlus,
  Star,
  AlertCircle
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

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  status: string;
  score: number;
  assignedTo?: string;
  createdAt: string;
  lastContact?: string;
}

interface Opportunity {
  _id: string;
  title: string;
  customer: string;
  customerName?: string;
  value: number;
  stage: string;
  probability: number;
  expectedClose: string;
  assignedTo?: string;
  createdAt: string;
  notes?: string;
}

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  relatedTo: string;
  relatedType: string;
  dueDate: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  tags?: string[];
  status: string;
  createdAt: string;
}

interface Analytics {
  totalLeads: number;
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  leadsBySource: Array<{ source: string; count: number }>;
  opportunitiesByStage: Array<{ stage: string; count: number; value: number }>;
  recentActivities: Activity[];
}

export default function CRM() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    name: '', email: '', phone: '', company: '', source: 'website', status: 'new', score: 0
  });
  const [opportunityForm, setOpportunityForm] = useState({
    title: '', customer: '', value: 0, stage: 'qualification', probability: 50, expectedClose: '', notes: ''
  });
  const [activityForm, setActivityForm] = useState({
    type: 'call', title: '', description: '', relatedTo: '', relatedType: 'lead', dueDate: '', status: 'pending'
  });
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', company: '', position: '', status: 'active'
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, opportunitiesRes, activitiesRes, contactsRes, analyticsRes] = await Promise.all([
        fetch('/api/crm/leads'),
        fetch('/api/crm/opportunities'),
        fetch('/api/crm/activities'),
        fetch('/api/crm/contacts'),
        fetch('/api/crm/analytics'),
      ]);

      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (opportunitiesRes.ok) setOpportunities(await opportunitiesRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      if (contactsRes.ok) setContacts(await contactsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lead CRUD
  const handleSaveLead = async () => {
    try {
      const url = editingItem ? `/api/crm/leads/${editingItem._id}` : '/api/crm/leads';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });
      
      if (response.ok) {
        fetchData();
        setShowLeadDialog(false);
        resetLeadForm();
      }
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const resetLeadForm = () => {
    setLeadForm({ name: '', email: '', phone: '', company: '', source: 'website', status: 'new', score: 0 });
    setEditingItem(null);
  };

  // Opportunity CRUD
  const handleSaveOpportunity = async () => {
    try {
      const url = editingItem ? `/api/crm/opportunities/${editingItem._id}` : '/api/crm/opportunities';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunityForm),
      });
      
      if (response.ok) {
        fetchData();
        setShowOpportunityDialog(false);
        resetOpportunityForm();
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      const response = await fetch(`/api/crm/opportunities/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const resetOpportunityForm = () => {
    setOpportunityForm({ title: '', customer: '', value: 0, stage: 'qualification', probability: 50, expectedClose: '', notes: '' });
    setEditingItem(null);
  };

  // Activity CRUD
  const handleSaveActivity = async () => {
    try {
      const url = editingItem ? `/api/crm/activities/${editingItem._id}` : '/api/crm/activities';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityForm),
      });
      
      if (response.ok) {
        fetchData();
        setShowActivityDialog(false);
        resetActivityForm();
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const resetActivityForm = () => {
    setActivityForm({ type: 'call', title: '', description: '', relatedTo: '', relatedType: 'lead', dueDate: '', status: 'pending' });
    setEditingItem(null);
  };

  // Contact CRUD
  const handleSaveContact = async () => {
    try {
      const url = editingItem ? `/api/crm/contacts/${editingItem._id}` : '/api/crm/contacts';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      
      if (response.ok) {
        fetchData();
        setShowContactDialog(false);
        resetContactForm();
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const resetContactForm = () => {
    setContactForm({ name: '', email: '', phone: '', company: '', position: '', status: 'active' });
    setEditingItem(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400",
      contacted: "bg-yellow-500/20 text-yellow-400",
      qualified: "bg-green-500/20 text-green-400",
      converted: "bg-purple-500/20 text-purple-400",
      lost: "bg-red-500/20 text-red-400",
      active: "bg-green-500/20 text-green-400",
      inactive: "bg-gray-500/20 text-gray-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      completed: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
      qualification: "bg-blue-500/20 text-blue-400",
      proposal: "bg-purple-500/20 text-purple-400",
      negotiation: "bg-orange-500/20 text-orange-400",
      closed_won: "bg-green-500/20 text-green-400",
      closed_lost: "bg-red-500/20 text-red-400",
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
            <h1 className="text-4xl font-black text-gradient mb-2">CRM - Customer Relationship Management</h1>
            <p className="text-muted-foreground">Manage leads, opportunities, and customer relationships</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <UserPlus className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics?.totalLeads || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active pipeline
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                  <Target className="w-5 h-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics?.totalOpportunities || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In progress
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics ? formatCurrency(analytics.totalValue) : '---'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total potential
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient">
                    {analytics ? `${analytics.conversionRate.toFixed(1)}%` : '---'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lead to opportunity
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Sources */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Distribution by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.leadsBySource && analytics.leadsBySource.length > 0 ? (
                      analytics.leadsBySource.map((source, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm w-24 capitalize">{source.source}</span>
                          <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-end px-3"
                              style={{ 
                                width: `${(source.count / Math.max(...analytics.leadsBySource.map(s => s.count))) * 100}%` 
                              }}
                            >
                              <span className="text-xs font-bold text-white">{source.count}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">No lead data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Opportunity Pipeline */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle>Opportunity Pipeline</CardTitle>
                  <CardDescription>By stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.opportunitiesByStage && analytics.opportunitiesByStage.length > 0 ? (
                      analytics.opportunitiesByStage.map((stage, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                            {stage.count}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold capitalize">{stage.stage.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(stage.value)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">No pipeline data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest interactions and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
                    analytics.recentActivities.slice(0, 5).map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.type === 'call' ? 'bg-blue-500/20' :
                          activity.type === 'email' ? 'bg-purple-500/20' :
                          activity.type === 'meeting' ? 'bg-green-500/20' :
                          'bg-gray-500/20'
                        }`}>
                          {activity.type === 'call' && <Phone className="w-5 h-5 text-blue-500" />}
                          {activity.type === 'email' && <Mail className="w-5 h-5 text-purple-500" />}
                          {activity.type === 'meeting' && <Calendar className="w-5 h-5 text-green-500" />}
                          {activity.type === 'task' && <CheckCircle className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {formatDate(activity.dueDate)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leads Management</CardTitle>
                    <CardDescription>Track and manage sales leads</CardDescription>
                  </div>
                  <Button 
                    className="gradient-primary"
                    onClick={() => {
                      resetLeadForm();
                      setShowLeadDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
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
                      <TableHead>Source</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads
                      .filter(l => 
                        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell className="font-semibold">{lead.name}</TableCell>
                        <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">{lead.score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingItem(lead);
                                setLeadForm({
                                  name: lead.name,
                                  email: lead.email,
                                  phone: lead.phone,
                                  company: lead.company || '',
                                  source: lead.source,
                                  status: lead.status,
                                  score: lead.score
                                });
                                setShowLeadDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteLead(lead._id)}
                            >
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

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Opportunities</CardTitle>
                    <CardDescription>Manage sales pipeline and deals</CardDescription>
                  </div>
                  <Button 
                    className="gradient-primary"
                    onClick={() => {
                      resetOpportunityForm();
                      setShowOpportunityDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Opportunity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Expected Close</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opp) => (
                      <TableRow key={opp._id}>
                        <TableCell className="font-semibold">{opp.title}</TableCell>
                        <TableCell>{opp.customerName}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(opp.value)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(opp.stage)}>
                            {opp.stage.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                style={{ width: `${opp.probability}%` }}
                              />
                            </div>
                            <span className="text-sm">{opp.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(opp.expectedClose)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingItem(opp);
                                setOpportunityForm({
                                  title: opp.title,
                                  customer: opp.customer,
                                  value: opp.value,
                                  stage: opp.stage,
                                  probability: opp.probability,
                                  expectedClose: opp.expectedClose,
                                  notes: opp.notes || ''
                                });
                                setShowOpportunityDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteOpportunity(opp._id)}
                            >
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

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activities & Tasks</CardTitle>
                    <CardDescription>Track customer interactions and follow-ups</CardDescription>
                  </div>
                  <Button 
                    className="gradient-primary"
                    onClick={() => {
                      resetActivityForm();
                      setShowActivityDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.type === 'call' ? 'bg-blue-500/20' :
                        activity.type === 'email' ? 'bg-purple-500/20' :
                        activity.type === 'meeting' ? 'bg-green-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {activity.type === 'call' && <Phone className="w-6 h-6 text-blue-500" />}
                        {activity.type === 'email' && <Mail className="w-6 h-6 text-purple-500" />}
                        {activity.type === 'meeting' && <Calendar className="w-6 h-6 text-green-500" />}
                        {activity.type === 'task' && <CheckCircle className="w-6 h-6 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {formatDate(activity.dueDate)}
                          </span>
                          <span className="capitalize">Type: {activity.relatedType}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingItem(activity);
                            setActivityForm({
                              type: activity.type,
                              title: activity.title,
                              description: activity.description,
                              relatedTo: activity.relatedTo,
                              relatedType: activity.relatedType,
                              dueDate: activity.dueDate,
                              status: activity.status
                            });
                            setShowActivityDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contact Database</CardTitle>
                    <CardDescription>Manage customer and prospect contacts</CardDescription>
                  </div>
                  <Button 
                    className="gradient-primary"
                    onClick={() => {
                      resetContactForm();
                      setShowContactDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact) => (
                    <Card key={contact._id} className="border-white/10 hover:shadow-glow transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={getStatusColor(contact.status)}>
                            {contact.status}
                          </Badge>
                        </div>
                        <CardTitle className="mt-4">{contact.name}</CardTitle>
                        <CardDescription>{contact.position}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                        {contact.company && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {contact.company}
                          </div>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(contact);
                              setContactForm({
                                name: contact.name,
                                email: contact.email,
                                phone: contact.phone,
                                company: contact.company || '',
                                position: contact.position || '',
                                status: contact.status
                              });
                              setShowContactDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Lead' : 'New Lead'}</DialogTitle>
            <DialogDescription>Add or update lead information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                  placeholder="Enter lead name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select
                  value={leadForm.source}
                  onValueChange={(value) => setLeadForm({...leadForm, source: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={leadForm.status}
                  onValueChange={(value) => setLeadForm({...leadForm, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={leadForm.score}
                  onChange={(e) => setLeadForm({...leadForm, score: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLead} className="gradient-primary">Save Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Dialog */}
      <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Opportunity' : 'New Opportunity'}</DialogTitle>
            <DialogDescription>Manage sales opportunity details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={opportunityForm.title}
                onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                placeholder="Enter opportunity title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <Input
                  value={opportunityForm.customer}
                  onChange={(e) => setOpportunityForm({...opportunityForm, customer: e.target.value})}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value *</label>
                <Input
                  type="number"
                  value={opportunityForm.value}
                  onChange={(e) => setOpportunityForm({...opportunityForm, value: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select
                  value={opportunityForm.stage}
                  onValueChange={(value) => setOpportunityForm({...opportunityForm, stage: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Close Date</label>
                <Input
                  type="date"
                  value={opportunityForm.expectedClose}
                  onChange={(e) => setOpportunityForm({...opportunityForm, expectedClose: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Probability (%): {opportunityForm.probability}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={opportunityForm.probability}
                onChange={(e) => setOpportunityForm({...opportunityForm, probability: parseInt(e.target.value)})}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                value={opportunityForm.notes}
                onChange={(e) => setOpportunityForm({...opportunityForm, notes: e.target.value})}
                placeholder="Add notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpportunityDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveOpportunity} className="gradient-primary">Save Opportunity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Activity' : 'New Activity'}</DialogTitle>
            <DialogDescription>Schedule customer interactions and tasks</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={activityForm.type}
                  onValueChange={(value) => setActivityForm({...activityForm, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={activityForm.status}
                  onValueChange={(value) => setActivityForm({...activityForm, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={activityForm.title}
                onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                placeholder="Activity title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                value={activityForm.description}
                onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                placeholder="Add description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Related Type</label>
                <Select
                  value={activityForm.relatedType}
                  onValueChange={(value) => setActivityForm({...activityForm, relatedType: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="opportunity">Opportunity</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Related To</label>
                <Input
                  value={activityForm.relatedTo}
                  onChange={(e) => setActivityForm({...activityForm, relatedTo: e.target.value})}
                  placeholder="Enter ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={activityForm.dueDate}
                onChange={(e) => setActivityForm({...activityForm, dueDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveActivity} className="gradient-primary">Save Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Contact' : 'New Contact'}</DialogTitle>
            <DialogDescription>Add or update contact information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                placeholder="Contact name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={contactForm.position}
                  onChange={(e) => setContactForm({...contactForm, position: e.target.value})}
                  placeholder="Job title"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={contactForm.status}
                onValueChange={(value) => setContactForm({...contactForm, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveContact} className="gradient-primary">Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
