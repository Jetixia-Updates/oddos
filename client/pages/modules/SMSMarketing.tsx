import React, { useState, useEffect } from "react";
import { Smartphone, Plus, Search, Send, Users, TrendingUp, Edit, Trash2, Clock, CheckCircle, XCircle, MessageSquare, BarChart3, FileText, Calendar } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

export default function SMSMarketing() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [smsCount, setSmsCount] = useState(1);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'promotional',
    status: 'draft',
    scheduledDate: '',
    scheduledTime: '',
    targetAudience: 'all',
    groupId: '',
    message: '',
    senderId: '',
    trackClicks: true,
    trackReplies: true
  });

  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: 'US',
    groupId: '',
    tags: [] as string[],
    optIn: true,
    notes: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'promotional',
    message: '',
    variables: [] as string[],
    isActive: true
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    isActive: true
  });

  const [sendForm, setSendForm] = useState({
    recipients: [] as string[],
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    senderId: '',
    campaignId: ''
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const message = campaignForm.message || sendForm.message || templateForm.message;
    setCharCount(message.length);
    setSmsCount(Math.ceil(message.length / 160) || 1);
  }, [campaignForm.message, sendForm.message, templateForm.message]);

  const fetchData = async () => {
    try {
      const [c, cont, t, m, g, an] = await Promise.all([
        fetch('/api/sms/campaigns').then(r => r.json()).catch(() => []),
        fetch('/api/sms/contacts').then(r => r.json()).catch(() => []),
        fetch('/api/sms/templates').then(r => r.json()).catch(() => []),
        fetch('/api/sms/messages').then(r => r.json()).catch(() => []),
        fetch('/api/sms/groups').then(r => r.json()).catch(() => []),
        fetch('/api/sms/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setCampaigns(Array.isArray(c) ? c : []);
      setContacts(Array.isArray(cont) ? cont : []);
      setTemplates(Array.isArray(t) ? t : []);
      setMessages(Array.isArray(m) ? m : []);
      setGroups(Array.isArray(g) ? g : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setCampaigns([]);
      setContacts([]);
      setTemplates([]);
      setMessages([]);
      setGroups([]);
      setAnalytics({});
    }
  };

  const handleSaveCampaign = async () => {
    const url = editingItem ? `/api/sms/campaigns/${editingItem._id}` : '/api/sms/campaigns';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(campaignForm) 
    });
    fetchData();
    setShowCampaignDialog(false);
    resetCampaignForm();
    setEditingItem(null);
  };

  const handleSaveContact = async () => {
    const url = editingItem ? `/api/sms/contacts/${editingItem._id}` : '/api/sms/contacts';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(contactForm) 
    });
    fetchData();
    setShowContactDialog(false);
    resetContactForm();
    setEditingItem(null);
  };

  const handleSaveTemplate = async () => {
    const url = editingItem ? `/api/sms/templates/${editingItem._id}` : '/api/sms/templates';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(templateForm) 
    });
    fetchData();
    setShowTemplateDialog(false);
    resetTemplateForm();
    setEditingItem(null);
  };

  const handleSaveGroup = async () => {
    const url = editingItem ? `/api/sms/groups/${editingItem._id}` : '/api/sms/groups';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(groupForm) 
    });
    fetchData();
    setShowGroupDialog(false);
    resetGroupForm();
    setEditingItem(null);
  };

  const handleSendSMS = async () => {
    await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sendForm)
    });
    fetchData();
    setShowSendDialog(false);
    resetSendForm();
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to launch this campaign?')) return;
    await fetch(`/api/sms/campaigns/${campaignId}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    fetchData();
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/api/sms/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      type: 'promotional',
      status: 'draft',
      scheduledDate: '',
      scheduledTime: '',
      targetAudience: 'all',
      groupId: '',
      message: '',
      senderId: '',
      trackClicks: true,
      trackReplies: true
    });
  };

  const resetContactForm = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      country: 'US',
      groupId: '',
      tags: [],
      optIn: true,
      notes: ''
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      category: 'promotional',
      message: '',
      variables: [],
      isActive: true
    });
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      tags: [],
      isActive: true
    });
  };

  const resetSendForm = () => {
    setSendForm({
      recipients: [],
      message: '',
      scheduledDate: '',
      scheduledTime: '',
      senderId: '',
      campaignId: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-500',
      scheduled: 'bg-blue-500/20 text-blue-500',
      sending: 'bg-yellow-500/20 text-yellow-500',
      sent: 'bg-green-500/20 text-green-500',
      failed: 'bg-red-500/20 text-red-500',
      paused: 'bg-orange-500/20 text-orange-500',
      delivered: 'bg-green-500/20 text-green-500',
      pending: 'bg-yellow-500/20 text-yellow-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      promotional: 'bg-purple-500/20 text-purple-500',
      transactional: 'bg-blue-500/20 text-blue-500',
      notification: 'bg-green-500/20 text-green-500',
      reminder: 'bg-orange-500/20 text-orange-500',
      alert: 'bg-red-500/20 text-red-500'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateTime = (date: string) => new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const calculateDeliveryRate = (campaignId: string) => {
    const campaignMessages = messages.filter(m => m.campaignId === campaignId);
    const delivered = campaignMessages.filter(m => m.status === 'delivered').length;
    return campaignMessages.length > 0 ? ((delivered / campaignMessages.length) * 100).toFixed(1) : '0';
  };

  const useTemplate = (template: any) => {
    setCampaignForm({ ...campaignForm, message: template.message });
    setSendForm({ ...sendForm, message: template.message });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SMS Marketing</h1>
            <p className="text-muted-foreground">Design, send and track SMS campaigns</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button className="gradient-primary" onClick={() => setShowSendDialog(true)}>
              <Send className="w-4 h-4 mr-2" />Send SMS Now
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Campaigns', value: analytics?.totalCampaigns || 0, icon: MessageSquare, color: 'text-pink-500', desc: `${analytics?.activeCampaigns || 0} active` },
              { title: 'Total Contacts', value: analytics?.totalContacts || 0, icon: Users, color: 'text-blue-500', desc: `${analytics?.optInContacts || 0} opted in` },
              { title: 'Messages Sent', value: analytics?.totalMessagesSent || 0, icon: Send, color: 'text-green-500', desc: 'All time' },
              { title: 'Delivery Rate', value: `${(analytics?.deliveryRate || 0).toFixed(1)}%`, icon: CheckCircle, color: 'text-purple-500', desc: 'Success rate' }
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
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Latest campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{campaign.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getTypeColor(campaign.type)}>{campaign.type}</Badge>
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{messages.filter(m => m.campaignId === campaign._id).length}</p>
                        <p className="text-xs text-muted-foreground">{calculateDeliveryRate(campaign._id)}% delivered</p>
                      </div>
                    </div>
                  ))}
                  {campaigns.length === 0 && <p className="text-center text-muted-foreground py-8">No campaigns yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Message Statistics</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Delivered', count: messages.filter(m => m.status === 'delivered').length, color: 'bg-green-500' },
                    { label: 'Pending', count: messages.filter(m => m.status === 'pending').length, color: 'bg-yellow-500' },
                    { label: 'Failed', count: messages.filter(m => m.status === 'failed').length, color: 'bg-red-500' },
                    { label: 'Scheduled', count: campaigns.filter(c => c.status === 'scheduled').length, color: 'bg-blue-500' }
                  ].map((stat, idx) => {
                    const total = messages.length || 1;
                    const percentage = (stat.count / total) * 100;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{stat.label}</span>
                          <span className="font-bold">{stat.count}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className={`${stat.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign Management</CardTitle>
                  <CardDescription>Create and manage SMS campaigns</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetCampaignForm(); 
                  setEditingItem(null); 
                  setShowCampaignDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search campaigns..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((campaign) => {
                    const campaignMessages = messages.filter(m => m.campaignId === campaign._id);
                    return (
                      <TableRow key={campaign._id}>
                        <TableCell className="font-semibold">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(campaign.type)}>{campaign.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {campaign.targetAudience === 'all' ? contacts.length : groups.find(g => g._id === campaign.groupId)?.memberCount || 0}
                        </TableCell>
                        <TableCell className="font-bold">{campaignMessages.length}</TableCell>
                        <TableCell className="text-muted-foreground">{calculateDeliveryRate(campaign._id)}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          {campaign.scheduledDate ? formatDateTime(campaign.scheduledDate) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {campaign.status === 'draft' && (
                              <Button size="sm" variant="ghost" onClick={() => handleLaunchCampaign(campaign._id)}>
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => { 
                              setEditingItem(campaign); 
                              setCampaignForm(campaign); 
                              setShowCampaignDialog(true); 
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete('campaigns', campaign._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Management</CardTitle>
                  <CardDescription>Manage your SMS contact list</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetContactForm(); 
                  setEditingItem(null); 
                  setShowContactDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Opt-In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell className="font-semibold">{contact.firstName} {contact.lastName}</TableCell>
                      <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contact.country}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {groups.find(g => g._id === contact.groupId)?.name || 'None'}
                      </TableCell>
                      <TableCell>
                        {contact.optIn ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(contact); 
                            setContactForm(contact); 
                            setShowContactDialog(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('contacts', contact._id)}>
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

        <TabsContent value="templates" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>Reusable SMS templates</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetTemplateForm(); 
                  setEditingItem(null); 
                  setShowTemplateDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getTypeColor(template.category)}>{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{template.message}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => useTemplate(template)}>
                          Use Template
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { 
                          setEditingItem(template); 
                          setTemplateForm(template); 
                          setShowTemplateDialog(true); 
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete('templates', template._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Groups</CardTitle>
                  <CardDescription>Organize contacts into groups</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  resetGroupForm(); 
                  setEditingItem(null); 
                  setShowGroupDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => {
                  const memberCount = contacts.filter(c => c.groupId === group._id).length;
                  return (
                    <Card key={group._id} className="glass border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold">{memberCount}</p>
                            <p className="text-sm text-muted-foreground">members</p>
                          </div>
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(group); 
                            setGroupForm(group); 
                            setShowGroupDialog(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('groups', group._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>All sent and scheduled messages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Delivered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message._id}>
                      <TableCell className="font-mono text-sm">{message.recipient}</TableCell>
                      <TableCell className="max-w-md truncate">{message.message}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaigns.find(c => c._id === message.campaignId)?.name || 'Direct'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(message.sentAt)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {message.deliveredAt ? formatDateTime(message.deliveredAt) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
            <DialogDescription>Design your SMS marketing campaign</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input 
                value={campaignForm.name} 
                onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})} 
                placeholder="Summer Sale 2024" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={campaignForm.description} 
                onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})} 
                placeholder="Campaign description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select value={campaignForm.type} onValueChange={(value) => setCampaignForm({...campaignForm, type: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm({...campaignForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input 
                  value={campaignForm.senderId} 
                  onChange={(e) => setCampaignForm({...campaignForm, senderId: e.target.value})} 
                  placeholder="BRAND" 
                  maxLength={11}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={campaignForm.targetAudience} onValueChange={(value) => setCampaignForm({...campaignForm, targetAudience: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="group">Specific Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {campaignForm.targetAudience === 'group' && (
                <div className="space-y-2">
                  <Label>Select Group</Label>
                  <Select value={campaignForm.groupId} onValueChange={(value) => setCampaignForm({...campaignForm, groupId: value})}>
                    <SelectTrigger><SelectValue placeholder="Choose group" /></SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input 
                  type="date" 
                  value={campaignForm.scheduledDate} 
                  onChange={(e) => setCampaignForm({...campaignForm, scheduledDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Time</Label>
                <Input 
                  type="time" 
                  value={campaignForm.scheduledTime} 
                  onChange={(e) => setCampaignForm({...campaignForm, scheduledTime: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea 
                value={campaignForm.message} 
                onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})} 
                placeholder="Your SMS message here..."
                rows={4}
                maxLength={1600}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{charCount} characters</span>
                <span>{smsCount} SMS</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Track Clicks</p>
                <p className="text-sm text-muted-foreground">Monitor link clicks in messages</p>
              </div>
              <Switch 
                checked={campaignForm.trackClicks} 
                onCheckedChange={(checked) => setCampaignForm({...campaignForm, trackClicks: checked})} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Track Replies</p>
                <p className="text-sm text-muted-foreground">Monitor customer responses</p>
              </div>
              <Switch 
                checked={campaignForm.trackReplies} 
                onCheckedChange={(checked) => setCampaignForm({...campaignForm, trackReplies: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCampaign} className="gradient-primary">
              {editingItem ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>Manage contact information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input 
                  value={contactForm.firstName} 
                  onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})} 
                  placeholder="John" 
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input 
                  value={contactForm.lastName} 
                  onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})} 
                  placeholder="Doe" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input 
                  value={contactForm.phone} 
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} 
                  placeholder="+1234567890" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={contactForm.email} 
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})} 
                  placeholder="john@example.com" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={contactForm.country} onValueChange={(value) => setContactForm({...contactForm, country: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="AE">UAE</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Group</Label>
                <Select value={contactForm.groupId || 'none'} onValueChange={(value) => setContactForm({...contactForm, groupId: value === 'none' ? '' : value})}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={contactForm.notes} 
                onChange={(e) => setContactForm({...contactForm, notes: e.target.value})} 
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Opt-In Status</p>
                <p className="text-sm text-muted-foreground">Contact agrees to receive SMS</p>
              </div>
              <Switch 
                checked={contactForm.optIn} 
                onCheckedChange={(checked) => setContactForm({...contactForm, optIn: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveContact} className="gradient-primary">
              {editingItem ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>Create reusable message templates</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input 
                value={templateForm.name} 
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})} 
                placeholder="Welcome Message" 
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({...templateForm, category: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea 
                value={templateForm.message} 
                onChange={(e) => setTemplateForm({...templateForm, message: e.target.value})} 
                placeholder="Hi {name}, welcome to our service!"
                rows={4}
                maxLength={1600}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{charCount} characters</span>
                <span>{smsCount} SMS</span>
              </div>
              <p className="text-xs text-muted-foreground">Use {'{name}'}, {'{company}'}, {'{code}'} for variables</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Active Template</p>
                <p className="text-sm text-muted-foreground">Available for use in campaigns</p>
              </div>
              <Switch 
                checked={templateForm.isActive} 
                onCheckedChange={(checked) => setTemplateForm({...templateForm, isActive: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} className="gradient-primary">
              {editingItem ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Group' : 'Create New Group'}</DialogTitle>
            <DialogDescription>Organize contacts into groups</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Group Name *</Label>
              <Input 
                value={groupForm.name} 
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})} 
                placeholder="VIP Customers" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={groupForm.description} 
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})} 
                placeholder="Group description..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Active Group</p>
                <p className="text-sm text-muted-foreground">Available for targeting</p>
              </div>
              <Switch 
                checked={groupForm.isActive} 
                onCheckedChange={(checked) => setGroupForm({...groupForm, isActive: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveGroup} className="gradient-primary">
              {editingItem ? 'Update Group' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send SMS Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send SMS Now</DialogTitle>
            <DialogDescription>Send immediate SMS to contacts</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Recipients (comma separated) *</Label>
              <Textarea 
                value={sendForm.recipients.join(', ')} 
                onChange={(e) => setSendForm({...sendForm, recipients: e.target.value.split(',').map(r => r.trim())})} 
                placeholder="+1234567890, +9876543210"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Sender ID</Label>
              <Input 
                value={sendForm.senderId} 
                onChange={(e) => setSendForm({...sendForm, senderId: e.target.value})} 
                placeholder="BRAND" 
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea 
                value={sendForm.message} 
                onChange={(e) => setSendForm({...sendForm, message: e.target.value})} 
                placeholder="Your SMS message..."
                rows={4}
                maxLength={1600}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{charCount} characters</span>
                <span>{smsCount} SMS per recipient</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Date (Optional)</Label>
                <Input 
                  type="date" 
                  value={sendForm.scheduledDate} 
                  onChange={(e) => setSendForm({...sendForm, scheduledDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Schedule Time (Optional)</Label>
                <Input 
                  type="time" 
                  value={sendForm.scheduledTime} 
                  onChange={(e) => setSendForm({...sendForm, scheduledTime: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={handleSendSMS} className="gradient-primary">
              <Send className="w-4 h-4 mr-2" />
              {sendForm.scheduledDate ? 'Schedule SMS' : 'Send Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
