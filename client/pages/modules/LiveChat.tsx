import React, { useState, useEffect } from "react";
import { MessageCircle, Plus, Search, Users, Clock, Star, TrendingUp, Activity, Phone, Mail, Eye, Trash2, CheckCircle } from "lucide-react";
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

interface Conversation {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  operatorId: string;
  status: 'active' | 'pending' | 'closed';
  startTime: string;
  endTime?: string;
  messageCount: number;
  lastMessage: string;
  rating?: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Message {
  _id: string;
  conversationId: string;
  sender: 'customer' | 'operator';
  senderId: string;
  content: string;
  timestamp: string;
  attachments: string[];
  isRead: boolean;
}

interface Operator {
  _id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  activeChats: number;
  totalChats: number;
  avgResponseTime: number;
  satisfactionRating: number;
  department: string;
  maxConcurrentChats: number;
}

interface CannedResponse {
  _id: string;
  title: string;
  content: string;
  category: string;
  shortcut: string;
  tags: string[];
  usageCount: number;
  isActive: boolean;
  createdBy: string;
}

interface Analytics {
  totalConversations: number;
  activeChats: number;
  pendingChats: number;
  closedChats: number;
  avgResponseTime: number;
  avgChatDuration: number;
  avgSatisfaction: number;
  totalMessages: number;
  conversationsByHour: Array<{ hour: string; count: number }>;
  topOperators: Array<{ operatorId: string; operatorName: string; chats: number }>;
}

export default function LiveChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [showOperatorDialog, setShowOperatorDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOperatorStatus, setFilterOperatorStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [conversationForm, setConversationForm] = useState<Partial<Conversation>>({
    customerId: '',
    customerName: '',
    customerEmail: '',
    operatorId: '',
    status: 'pending',
    startTime: new Date().toISOString(),
    messageCount: 0,
    lastMessage: '',
    tags: [],
    priority: 'medium'
  });

  const [operatorForm, setOperatorForm] = useState<Partial<Operator>>({
    name: '',
    email: '',
    status: 'offline',
    activeChats: 0,
    totalChats: 0,
    avgResponseTime: 0,
    satisfactionRating: 0,
    department: '',
    maxConcurrentChats: 5
  });

  const [responseForm, setResponseForm] = useState<Partial<CannedResponse>>({
    title: '',
    content: '',
    category: '',
    shortcut: '',
    tags: [],
    usageCount: 0,
    isActive: true,
    createdBy: ''
  });

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [conv, ops, resp, anal] = await Promise.all([
        fetch('/api/livechat/conversations').then(r => r.json()).catch(() => []),
        fetch('/api/livechat/operators').then(r => r.json()).catch(() => []),
        fetch('/api/livechat/canned-responses').then(r => r.json()).catch(() => []),
        fetch('/api/livechat/analytics').then(r => r.json()).catch(() => null)
      ]);
      setConversations(Array.isArray(conv) ? conv : []);
      setOperators(Array.isArray(ops) ? ops : []);
      setCannedResponses(Array.isArray(resp) ? resp : []);
      setAnalytics(anal);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const msgs = await fetch(`/api/livechat/messages?conversationId=${conversationId}`).then(r => r.json());
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSaveConversation = async () => {
    try {
      const url = editingConversation ? `/api/livechat/conversations/${editingConversation._id}` : '/api/livechat/conversations';
      await fetch(url, {
        method: editingConversation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationForm)
      });
      fetchData();
      setShowConversationDialog(false);
      resetConversationForm();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await fetch(`/api/livechat/conversations/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: Conversation['status']) => {
    try {
      await fetch(`/api/livechat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveOperator = async () => {
    try {
      const url = editingOperator ? `/api/livechat/operators/${editingOperator._id}` : '/api/livechat/operators';
      await fetch(url, {
        method: editingOperator ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operatorForm)
      });
      fetchData();
      setShowOperatorDialog(false);
      resetOperatorForm();
    } catch (error) {
      console.error('Error saving operator:', error);
    }
  };

  const handleDeleteOperator = async (id: string) => {
    if (!confirm('Delete this operator?')) return;
    try {
      await fetch(`/api/livechat/operators/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  };

  const handleSaveResponse = async () => {
    try {
      const url = editingResponse ? `/api/livechat/canned-responses/${editingResponse._id}` : '/api/livechat/canned-responses';
      await fetch(url, {
        method: editingResponse ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseForm)
      });
      fetchData();
      setShowResponseDialog(false);
      resetResponseForm();
    } catch (error) {
      console.error('Error saving canned response:', error);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('Delete this canned response?')) return;
    try {
      await fetch(`/api/livechat/canned-responses/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!viewingConversation || !newMessage.trim()) return;
    try {
      await fetch('/api/livechat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: viewingConversation._id,
          sender: 'operator',
          content: newMessage,
          timestamp: new Date().toISOString()
        })
      });
      setNewMessage('');
      fetchMessages(viewingConversation._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resetConversationForm = () => {
    setConversationForm({
      customerId: '',
      customerName: '',
      customerEmail: '',
      operatorId: '',
      status: 'pending',
      startTime: new Date().toISOString(),
      messageCount: 0,
      lastMessage: '',
      tags: [],
      priority: 'medium'
    });
    setEditingConversation(null);
  };

  const resetOperatorForm = () => {
    setOperatorForm({
      name: '',
      email: '',
      status: 'offline',
      activeChats: 0,
      totalChats: 0,
      avgResponseTime: 0,
      satisfactionRating: 0,
      department: '',
      maxConcurrentChats: 5
    });
    setEditingOperator(null);
  };

  const resetResponseForm = () => {
    setResponseForm({
      title: '',
      content: '',
      category: '',
      shortcut: '',
      tags: [],
      usageCount: 0,
      isActive: true,
      createdBy: ''
    });
    setEditingResponse(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-green-500/20 text-green-500',
      pending: 'bg-yellow-500/20 text-yellow-500',
      closed: 'bg-gray-500/20 text-gray-500',
      online: 'bg-green-500/20 text-green-500',
      offline: 'bg-gray-500/20 text-gray-500',
      away: 'bg-yellow-500/20 text-yellow-500',
      busy: 'bg-red-500/20 text-red-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getPriorityBadgeClass = (priority: string) => {
    const classes: Record<string, string> = {
      low: 'bg-blue-500/20 text-blue-500',
      medium: 'bg-yellow-500/20 text-yellow-500',
      high: 'bg-orange-500/20 text-orange-500',
      urgent: 'bg-red-500/20 text-red-500'
    };
    return classes[priority] || 'bg-gray-500/20 text-gray-500';
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOperators = operators.filter(op => {
    const matchesSearch = !searchTerm || 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterOperatorStatus === 'all' || op.status === filterOperatorStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Live Chat</h1>
            <p className="text-muted-foreground">Real-time customer support and engagement</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="responses">Canned Responses</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalConversations || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Chats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.activeChats || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{analytics?.avgResponseTime || 0}s</div>
                <p className="text-xs text-muted-foreground mt-1">Response speed</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
                  {analytics?.avgSatisfaction?.toFixed(1) || 0}
                  <Star className="w-6 h-6 fill-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Real-Time Statistics
                </CardTitle>
                <CardDescription>Current chat activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Active Chats</span>
                    <Badge className="bg-green-500/20 text-green-500">{analytics?.activeChats || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Pending Chats</span>
                    <Badge className="bg-yellow-500/20 text-yellow-500">{analytics?.pendingChats || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Closed Today</span>
                    <Badge className="bg-gray-500/20 text-gray-500">{analytics?.closedChats || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Total Messages</span>
                    <Badge className="bg-blue-500/20 text-blue-500">{analytics?.totalMessages || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Avg Chat Duration</span>
                    <span className="font-bold">{formatDuration(analytics?.avgChatDuration || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Top Operators
                </CardTitle>
                <CardDescription>Most active chat operators today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topOperators?.slice(0, 5).map((op, idx) => (
                    <div key={op.operatorId} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{op.operatorName}</p>
                        <p className="text-sm text-muted-foreground">{op.chats} conversations handled</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500">
                        <Users className="w-3 h-3 mr-1" />{op.chats}
                      </Badge>
                    </div>
                  )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Conversations by Hour
              </CardTitle>
              <CardDescription>Chat volume distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.conversationsByHour?.map((stat) => (
                  <div key={stat.hour} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.hour}</span>
                      <span className="text-sm font-bold">{stat.count} chats</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${((stat.count) / Math.max(...(analytics?.conversationsByHour?.map(s => s.count) || [1]))) * 100}%` }}
                      />
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Conversation Management</CardTitle>
                  <CardDescription>Track and manage all customer conversations</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetConversationForm(); setShowConversationDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Conversation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by customer name, email, or message..." 
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Last Message</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Loading conversations...
                        </TableCell>
                      </TableRow>
                    ) : filteredConversations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No conversations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConversations.map((conv) => {
                        const operator = operators.find(op => op._id === conv.operatorId);
                        return (
                          <TableRow key={conv._id}>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{conv.customerName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />{conv.customerEmail}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{operator?.name || 'Unassigned'}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(conv.status)}>{conv.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityBadgeClass(conv.priority)}>{conv.priority}</Badge>
                            </TableCell>
                            <TableCell>{new Date(conv.startTime).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-500/20 text-blue-500">{conv.messageCount}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{conv.lastMessage}</TableCell>
                            <TableCell>
                              {conv.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                  <span className="font-semibold">{conv.rating}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setViewingConversation(conv);
                                    fetchMessages(conv._id);
                                    setShowMessagesDialog(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => { 
                                    setEditingConversation(conv); 
                                    setConversationForm(conv); 
                                    setShowConversationDialog(true); 
                                  }}
                                >
                                  Edit
                                </Button>
                                {conv.status !== 'closed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(conv._id, 'closed')}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteConversation(conv._id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Chat Operators</CardTitle>
                  <CardDescription>Manage chat operators and their performance</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetOperatorForm(); setShowOperatorDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Operator
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search operators..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterOperatorStatus} onValueChange={setFilterOperatorStatus}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOperators.map(operator => (
                  <Card key={operator._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{operator.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{operator.email}</p>
                          <Badge className={getStatusBadgeClass(operator.status)}>{operator.status}</Badge>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                          {operator.name.charAt(0)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Active Chats</p>
                          <p className="font-bold text-green-500">{operator.activeChats}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Chats</p>
                          <p className="font-bold">{operator.totalChats}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Response</p>
                          <p className="font-bold text-blue-500">{operator.avgResponseTime}s</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-bold text-yellow-500 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500" />{operator.satisfactionRating}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-semibold">{operator.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Max Concurrent Chats</p>
                        <p className="font-semibold">{operator.maxConcurrentChats}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingOperator(operator); setOperatorForm(operator); setShowOperatorDialog(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteOperator(operator._id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Canned Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Canned Responses</CardTitle>
                  <CardDescription>Pre-written response templates library</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetResponseForm(); setShowResponseDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Response
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Shortcut</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading responses...
                        </TableCell>
                      </TableRow>
                    ) : cannedResponses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No canned responses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      cannedResponses.map((response) => (
                        <TableRow key={response._id}>
                          <TableCell className="font-semibold">{response.title}</TableCell>
                          <TableCell>
                            <Badge className="bg-purple-500/20 text-purple-500">{response.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 rounded bg-white/10 text-xs">{response.shortcut}</code>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{response.content}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-500">{response.usageCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={response.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                              {response.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { 
                                  setEditingResponse(response); 
                                  setResponseForm(response); 
                                  setShowResponseDialog(true); 
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteResponse(response._id)}>
                                <Trash2 className="w-3 h-3" />
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
      </Tabs>

      {/* Conversation Dialog */}
      <Dialog open={showConversationDialog} onOpenChange={setShowConversationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingConversation ? 'Edit Conversation' : 'New Conversation'}</DialogTitle>
            <DialogDescription>Manage conversation details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={conversationForm.customerName} onChange={(e) => setConversationForm({...conversationForm, customerName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Customer Email *</Label>
                <Input type="email" value={conversationForm.customerEmail} onChange={(e) => setConversationForm({...conversationForm, customerEmail: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign Operator</Label>
                <Select value={conversationForm.operatorId} onValueChange={(value) => setConversationForm({...conversationForm, operatorId: value})}>
                  <SelectTrigger><SelectValue placeholder="Select operator" /></SelectTrigger>
                  <SelectContent>
                    {operators.map(op => <SelectItem key={op._id} value={op._id}>{op.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={conversationForm.status} onValueChange={(value) => setConversationForm({...conversationForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={conversationForm.priority} onValueChange={(value) => setConversationForm({...conversationForm, priority: value as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConversationDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveConversation} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Operator Dialog */}
      <Dialog open={showOperatorDialog} onOpenChange={setShowOperatorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOperator ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
            <DialogDescription>Configure operator details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={operatorForm.name} onChange={(e) => setOperatorForm({...operatorForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={operatorForm.email} onChange={(e) => setOperatorForm({...operatorForm, email: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={operatorForm.department} onChange={(e) => setOperatorForm({...operatorForm, department: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={operatorForm.status} onValueChange={(value) => setOperatorForm({...operatorForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Concurrent Chats</Label>
              <Input type="number" value={operatorForm.maxConcurrentChats} onChange={(e) => setOperatorForm({...operatorForm, maxConcurrentChats: parseInt(e.target.value) || 5})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOperatorDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveOperator} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canned Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingResponse ? 'Edit Canned Response' : 'New Canned Response'}</DialogTitle>
            <DialogDescription>Create reusable response templates</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={responseForm.title} onChange={(e) => setResponseForm({...responseForm, title: e.target.value})} placeholder="e.g., Welcome Message" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={responseForm.category} onChange={(e) => setResponseForm({...responseForm, category: e.target.value})} placeholder="e.g., Greetings" />
              </div>
              <div className="space-y-2">
                <Label>Shortcut</Label>
                <Input value={responseForm.shortcut} onChange={(e) => setResponseForm({...responseForm, shortcut: e.target.value})} placeholder="e.g., /welcome" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea value={responseForm.content} onChange={(e) => setResponseForm({...responseForm, content: e.target.value})} rows={5} placeholder="Response content..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={responseForm.isActive} onChange={(e) => setResponseForm({...responseForm, isActive: e.target.checked})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveResponse} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>
              {viewingConversation?.customerName} - {viewingConversation?.customerEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-white/5 rounded-lg">
              {messages.map(msg => (
                <div key={msg._id} className={`flex ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'operator' ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
