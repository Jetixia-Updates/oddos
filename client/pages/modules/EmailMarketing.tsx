import React, { useState, useEffect } from "react";
import { Mail, Plus, Search, Send, TrendingUp, Users, Eye, BarChart3, Download, Upload, FileText, Clock, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  content: string;
  fromName: string;
  fromEmail: string;
  recipientListIds: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledDate?: string;
  sentDate?: string;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  tags: string[];
}

interface EmailList {
  _id: string;
  name: string;
  description: string;
  subscriberCount: number;
  isActive: boolean;
  createdDate: string;
  tags: string[];
}

interface Subscriber {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  listIds: string[];
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'pending';
  subscribedDate: string;
  source: string;
  tags: string[];
  customFields: Record<string, any>;
}

interface Template {
  _id: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: string;
  thumbnail?: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
}

interface Analytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSubscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgBounceRate: number;
  campaignPerformance: Array<{ campaignName: string; openRate: number; clickRate: number }>;
  subscriberGrowth: Array<{ month: string; count: number }>;
  topPerformingCampaigns: Array<{ campaignId: string; campaignName: string; openRate: number }>;
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<EmailList[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [showSubscriberDialog, setShowSubscriberDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingList, setEditingList] = useState<EmailList | null>(null);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterListId, setFilterListId] = useState('all');
  const [loading, setLoading] = useState(true);

  const [campaignForm, setCampaignForm] = useState<Partial<Campaign>>({
    name: '',
    subject: '',
    content: '',
    fromName: '',
    fromEmail: '',
    recipientListIds: [],
    status: 'draft',
    scheduledDate: '',
    tags: []
  });

  const [listForm, setListForm] = useState<Partial<EmailList>>({
    name: '',
    description: '',
    subscriberCount: 0,
    isActive: true,
    createdDate: new Date().toISOString().split('T')[0],
    tags: []
  });

  const [subscriberForm, setSubscriberForm] = useState<Partial<Subscriber>>({
    email: '',
    firstName: '',
    lastName: '',
    listIds: [],
    status: 'subscribed',
    subscribedDate: new Date().toISOString().split('T')[0],
    source: 'manual',
    tags: [],
    customFields: {}
  });

  const [templateForm, setTemplateForm] = useState<Partial<Template>>({
    name: '',
    description: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: '',
    isActive: true,
    usageCount: 0,
    createdBy: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [camp, lst, sub, temp, anal] = await Promise.all([
        fetch('/api/email/campaigns').then(r => r.json()).catch(() => []),
        fetch('/api/email/lists').then(r => r.json()).catch(() => []),
        fetch('/api/email/subscribers').then(r => r.json()).catch(() => []),
        fetch('/api/email/templates').then(r => r.json()).catch(() => []),
        fetch('/api/email/analytics').then(r => r.json()).catch(() => null)
      ]);
      setCampaigns(Array.isArray(camp) ? camp : []);
      setLists(Array.isArray(lst) ? lst : []);
      setSubscribers(Array.isArray(sub) ? sub : []);
      setTemplates(Array.isArray(temp) ? temp : []);
      setAnalytics(anal);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSaveCampaign = async () => {
    try {
      const url = editingCampaign ? `/api/email/campaigns/${editingCampaign._id}` : '/api/email/campaigns';
      await fetch(url, {
        method: editingCampaign ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });
      fetchData();
      setShowCampaignDialog(false);
      resetCampaignForm();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await fetch(`/api/email/campaigns/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleLaunchCampaign = async (id: string) => {
    if (!confirm('Launch this campaign now?')) return;
    try {
      await fetch(`/api/email/campaigns/${id}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchData();
    } catch (error) {
      console.error('Error launching campaign:', error);
    }
  };

  const handleSaveList = async () => {
    try {
      const url = editingList ? `/api/email/lists/${editingList._id}` : '/api/email/lists';
      await fetch(url, {
        method: editingList ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listForm)
      });
      fetchData();
      setShowListDialog(false);
      resetListForm();
    } catch (error) {
      console.error('Error saving list:', error);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('Delete this list?')) return;
    try {
      await fetch(`/api/email/lists/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleSaveSubscriber = async () => {
    try {
      const url = editingSubscriber ? `/api/email/subscribers/${editingSubscriber._id}` : '/api/email/subscribers';
      await fetch(url, {
        method: editingSubscriber ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriberForm)
      });
      fetchData();
      setShowSubscriberDialog(false);
      resetSubscriberForm();
    } catch (error) {
      console.error('Error saving subscriber:', error);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      await fetch(`/api/email/subscribers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const url = editingTemplate ? `/api/email/templates/${editingTemplate._id}` : '/api/email/templates';
      await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });
      fetchData();
      setShowTemplateDialog(false);
      resetTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await fetch(`/api/email/templates/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleUseTemplate = (template: Template) => {
    setCampaignForm({
      ...campaignForm,
      subject: template.subject,
      content: template.htmlContent
    });
    setShowCampaignDialog(true);
  };

  const handleExportSubscribers = () => {
    // Export functionality
    const csv = subscribers.map(s => `${s.email},${s.firstName},${s.lastName},${s.status}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      fromName: '',
      fromEmail: '',
      recipientListIds: [],
      status: 'draft',
      scheduledDate: '',
      tags: []
    });
    setEditingCampaign(null);
  };

  const resetListForm = () => {
    setListForm({
      name: '',
      description: '',
      subscriberCount: 0,
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      tags: []
    });
    setEditingList(null);
  };

  const resetSubscriberForm = () => {
    setSubscriberForm({
      email: '',
      firstName: '',
      lastName: '',
      listIds: [],
      status: 'subscribed',
      subscribedDate: new Date().toISOString().split('T')[0],
      source: 'manual',
      tags: [],
      customFields: {}
    });
    setEditingSubscriber(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      category: '',
      isActive: true,
      usageCount: 0,
      createdBy: ''
    });
    setEditingTemplate(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-500',
      scheduled: 'bg-blue-500/20 text-blue-500',
      sending: 'bg-yellow-500/20 text-yellow-500',
      sent: 'bg-green-500/20 text-green-500',
      paused: 'bg-orange-500/20 text-orange-500',
      subscribed: 'bg-green-500/20 text-green-500',
      unsubscribed: 'bg-red-500/20 text-red-500',
      bounced: 'bg-orange-500/20 text-orange-500',
      pending: 'bg-yellow-500/20 text-yellow-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const filteredCampaigns = campaigns.filter(camp => {
    const matchesSearch = !searchTerm || 
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || camp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesList = filterListId === 'all' || sub.listIds.includes(filterListId);
    return matchesSearch && matchesList;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Email Marketing</h1>
            <p className="text-muted-foreground">Create and manage email campaigns</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalCampaigns || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.activeCampaigns || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Running now</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{analytics?.totalSubscribers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Email addresses</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{analytics?.avgOpenRate?.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Campaign average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Campaign Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Average Open Rate</span>
                    <span className="font-bold text-green-500">{analytics?.avgOpenRate?.toFixed(2) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Average Click Rate</span>
                    <span className="font-bold text-blue-500">{analytics?.avgClickRate?.toFixed(2) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Average Bounce Rate</span>
                    <span className="font-bold text-orange-500">{analytics?.avgBounceRate?.toFixed(2) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Total Lists</span>
                    <span className="font-bold">{lists.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Active Subscribers</span>
                    <span className="font-bold text-green-500">{subscribers.filter(s => s.status === 'subscribed').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Top Performing Campaigns
                </CardTitle>
                <CardDescription>Highest open rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topPerformingCampaigns?.slice(0, 5).map((camp, idx) => (
                    <div key={camp.campaignId} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{camp.campaignName}</p>
                        <p className="text-sm text-muted-foreground">Open Rate: {camp.openRate.toFixed(1)}%</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">{camp.openRate.toFixed(1)}%</Badge>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Subscriber Growth
              </CardTitle>
              <CardDescription>Monthly subscriber trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.subscriberGrowth?.map((stat) => (
                  <div key={stat.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.month}</span>
                      <span className="text-sm font-bold">{stat.count} subscribers</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                        style={{ width: `${((stat.count) / Math.max(...(analytics?.subscriberGrowth?.map(s => s.count) || [1]))) * 100}%` }}
                      />
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Email Campaigns</CardTitle>
                  <CardDescription>Create and manage email campaigns</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetCampaignForm(); setShowCampaignDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search campaigns..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Loading campaigns...
                        </TableCell>
                      </TableRow>
                    ) : filteredCampaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No campaigns found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign._id}>
                          <TableCell className="font-semibold">{campaign.name}</TableCell>
                          <TableCell>{campaign.subject}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(campaign.status)}>{campaign.status}</Badge>
                          </TableCell>
                          <TableCell>{campaign.totalRecipients}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-500">{campaign.sentCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-500">{campaign.openRate?.toFixed(1) || 0}%</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-blue-500">{campaign.clickRate?.toFixed(1) || 0}%</span>
                          </TableCell>
                          <TableCell>
                            {campaign.sentDate ? new Date(campaign.sentDate).toLocaleDateString() : 
                             campaign.scheduledDate ? new Date(campaign.scheduledDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { 
                                  setEditingCampaign(campaign); 
                                  setCampaignForm(campaign); 
                                  setShowCampaignDialog(true); 
                                }}
                              >
                                Edit
                              </Button>
                              {campaign.status === 'draft' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleLaunchCampaign(campaign._id)}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Launch
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(campaign._id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Email Lists</CardTitle>
                  <CardDescription>Manage subscriber lists</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetListForm(); setShowListDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lists.map(list => (
                  <Card key={list._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{list.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                        </div>
                        <Badge className={list.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                          {list.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-sm font-medium">Subscribers</span>
                        <Badge className="bg-blue-500/20 text-blue-500">
                          <Users className="w-3 h-3 mr-1" />{list.subscriberCount}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-semibold">{new Date(list.createdDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingList(list); setListForm(list); setShowListDialog(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteList(list._id)}>
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>Manage email subscribers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" />Import
                  </Button>
                  <Button variant="outline" onClick={handleExportSubscribers}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button className="gradient-primary" onClick={() => { resetSubscriberForm(); setShowSubscriberDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />Add Subscriber
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search subscribers..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterListId} onValueChange={setFilterListId}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lists</SelectItem>
                    {lists.map(list => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Lists</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Subscribed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading subscribers...
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscribers.map((subscriber) => (
                        <TableRow key={subscriber._id}>
                          <TableCell className="font-semibold">{subscriber.email}</TableCell>
                          <TableCell>{subscriber.firstName} {subscriber.lastName}</TableCell>
                          <TableCell>
                            <Badge className="bg-purple-500/20 text-purple-500">{subscriber.listIds.length} lists</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(subscriber.status)}>{subscriber.status}</Badge>
                          </TableCell>
                          <TableCell>{subscriber.source}</TableCell>
                          <TableCell>{new Date(subscriber.subscribedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { 
                                  setEditingSubscriber(subscriber); 
                                  setSubscriberForm(subscriber); 
                                  setShowSubscriberDialog(true); 
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteSubscriber(subscriber._id)}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Reusable email templates library</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetTemplateForm(); setShowTemplateDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          <Badge className="mt-2 bg-blue-500/20 text-blue-500">{template.category}</Badge>
                        </div>
                        <Badge className={template.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Subject</p>
                        <p className="font-semibold truncate">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Usage Count</p>
                        <p className="font-bold text-green-500">{template.usageCount}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => handleUseTemplate(template)}>
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setTemplateForm(template); setShowTemplateDialog(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template._id)}>
                          Delete
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

      {/* Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
            <DialogDescription>Configure campaign details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input value={campaignForm.name} onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})} placeholder="e.g., Summer Sale 2024" />
            </div>
            <div className="space-y-2">
              <Label>Email Subject *</Label>
              <Input value={campaignForm.subject} onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})} placeholder="Email subject line" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input value={campaignForm.fromName} onChange={(e) => setCampaignForm({...campaignForm, fromName: e.target.value})} placeholder="Your Company" />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input type="email" value={campaignForm.fromEmail} onChange={(e) => setCampaignForm({...campaignForm, fromEmail: e.target.value})} placeholder="noreply@company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Content *</Label>
              <Textarea value={campaignForm.content} onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})} rows={10} placeholder="Email HTML content..." />
            </div>
            <div className="space-y-2">
              <Label>Recipient Lists</Label>
              <Select value={campaignForm.recipientListIds?.[0]} onValueChange={(value) => setCampaignForm({...campaignForm, recipientListIds: [value]})}>
                <SelectTrigger><SelectValue placeholder="Select lists" /></SelectTrigger>
                <SelectContent>
                  {lists.map(list => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm({...campaignForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="datetime-local" value={campaignForm.scheduledDate?.slice(0, 16)} onChange={(e) => setCampaignForm({...campaignForm, scheduledDate: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCampaign} className="gradient-primary">Save Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingList ? 'Edit List' : 'New List'}</DialogTitle>
            <DialogDescription>Configure list details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>List Name *</Label>
              <Input value={listForm.name} onChange={(e) => setListForm({...listForm, name: e.target.value})} placeholder="e.g., Newsletter Subscribers" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={listForm.description} onChange={(e) => setListForm({...listForm, description: e.target.value})} rows={3} placeholder="List description..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={listForm.isActive} onChange={(e) => setListForm({...listForm, isActive: e.target.checked})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveList} className="gradient-primary">Save List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscriber Dialog */}
      <Dialog open={showSubscriberDialog} onOpenChange={setShowSubscriberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}</DialogTitle>
            <DialogDescription>Manage subscriber details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={subscriberForm.email} onChange={(e) => setSubscriberForm({...subscriberForm, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={subscriberForm.firstName} onChange={(e) => setSubscriberForm({...subscriberForm, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={subscriberForm.lastName} onChange={(e) => setSubscriberForm({...subscriberForm, lastName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={subscriberForm.status} onValueChange={(value) => setSubscriberForm({...subscriberForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input value={subscriberForm.source} onChange={(e) => setSubscriberForm({...subscriberForm, source: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lists</Label>
              <Select value={subscriberForm.listIds?.[0]} onValueChange={(value) => setSubscriberForm({...subscriberForm, listIds: [value]})}>
                <SelectTrigger><SelectValue placeholder="Select lists" /></SelectTrigger>
                <SelectContent>
                  {lists.map(list => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriberDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSubscriber} className="gradient-primary">Save Subscriber</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
            <DialogDescription>Create reusable email template</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g., Welcome Email" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={templateForm.category} onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})} placeholder="e.g., Promotional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={templateForm.description} onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})} placeholder="Template description" />
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input value={templateForm.subject} onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})} placeholder="Email subject" />
            </div>
            <div className="space-y-2">
              <Label>HTML Content *</Label>
              <Textarea value={templateForm.htmlContent} onChange={(e) => setTemplateForm({...templateForm, htmlContent: e.target.value})} rows={10} placeholder="HTML content..." />
            </div>
            <div className="space-y-2">
              <Label>Plain Text Content</Label>
              <Textarea value={templateForm.textContent} onChange={(e) => setTemplateForm({...templateForm, textContent: e.target.value})} rows={5} placeholder="Plain text version..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={templateForm.isActive} onChange={(e) => setTemplateForm({...templateForm, isActive: e.target.checked})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} className="gradient-primary">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
            <DialogDescription>Upload a CSV file with subscriber data</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>CSV File</Label>
              <Input type="file" accept=".csv" />
              <p className="text-xs text-muted-foreground">Format: email, firstName, lastName, status</p>
            </div>
            <div className="space-y-2">
              <Label>Add to List</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select list" /></SelectTrigger>
                <SelectContent>
                  {lists.map(list => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button className="gradient-primary">
              <Upload className="w-4 h-4 mr-2" />Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
