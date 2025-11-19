import React, { useState, useEffect } from "react";
import { Globe, Plus, Search, Eye, Settings, Layout, Menu, FileText, FormInput, BarChart3, Download, Upload, Save, Trash2, Edit } from "lucide-react";
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

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImage?: string;
  author: string;
  createdDate: string;
  publishedDate?: string;
  lastModified: string;
  views: number;
  template: string;
}

interface MenuItem {
  _id: string;
  label: string;
  url: string;
  parentId?: string;
  order: number;
  target: '_self' | '_blank';
  cssClass?: string;
  isActive: boolean;
  icon?: string;
  children?: MenuItem[];
}

interface Block {
  _id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'button' | 'html' | 'form';
  content: string;
  position: string;
  settings: Record<string, any>;
  pageId?: string;
  isGlobal: boolean;
  isActive: boolean;
  order: number;
}

interface FormSubmission {
  _id: string;
  formId: string;
  formName: string;
  submittedData: Record<string, any>;
  submittedDate: string;
  ipAddress: string;
  userAgent: string;
  status: 'new' | 'read' | 'archived';
}

interface WebsiteSettings {
  _id?: string;
  siteTitle: string;
  siteDescription: string;
  siteLogo?: string;
  favicon?: string;
  headerCode?: string;
  footerCode?: string;
  analyticsCode?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  maintenanceMode: boolean;
}

interface Analytics {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalViews: number;
  totalMenuItems: number;
  totalBlocks: number;
  totalFormSubmissions: number;
  topPages: Array<{ pageId: string; pageTitle: string; views: number }>;
  recentSubmissions: number;
}

export default function WebsiteBuilder() {
  const [pages, setPages] = useState<Page[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteTitle: '',
    siteDescription: '',
    socialMedia: {},
    contactInfo: {},
    maintenanceMode: false
  });
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [viewingForm, setViewingForm] = useState<FormSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBlockType, setFilterBlockType] = useState('all');
  const [loading, setLoading] = useState(true);

  const [pageForm, setPageForm] = useState<Partial<Page>>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    featuredImage: '',
    author: '',
    template: 'default',
    views: 0
  });

  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    label: '',
    url: '',
    parentId: '',
    order: 0,
    target: '_self',
    cssClass: '',
    isActive: true,
    icon: ''
  });

  const [blockForm, setBlockForm] = useState<Partial<Block>>({
    name: '',
    type: 'text',
    content: '',
    position: 'main',
    settings: {},
    pageId: '',
    isGlobal: false,
    isActive: true,
    order: 0
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pg, mn, blk, frm, stg, anal] = await Promise.all([
        fetch('/api/website/pages').then(r => r.json()).catch(() => []),
        fetch('/api/website/menus').then(r => r.json()).catch(() => []),
        fetch('/api/website/blocks').then(r => r.json()).catch(() => []),
        fetch('/api/website/forms').then(r => r.json()).catch(() => []),
        fetch('/api/website/settings').then(r => r.json()).catch(() => null),
        fetch('/api/website/analytics').then(r => r.json()).catch(() => null)
      ]);
      setPages(Array.isArray(pg) ? pg : []);
      setMenuItems(Array.isArray(mn) ? mn : []);
      setBlocks(Array.isArray(blk) ? blk : []);
      setForms(Array.isArray(frm) ? frm : []);
      if (stg) setSettings(stg);
      setAnalytics(anal);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleSavePage = async () => {
    try {
      if (!editingPage && pageForm.title) {
        pageForm.slug = pageForm.slug || pageForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      }
      const url = editingPage ? `/api/website/pages/${editingPage._id}` : '/api/website/pages';
      await fetch(url, {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm)
      });
      fetchData();
      setShowPageDialog(false);
      resetPageForm();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      await fetch(`/api/website/pages/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const handlePublishPage = async (id: string) => {
    try {
      await fetch(`/api/website/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published', publishedDate: new Date().toISOString() })
      });
      fetchData();
    } catch (error) {
      console.error('Error publishing page:', error);
    }
  };

  const handleSaveMenu = async () => {
    try {
      const url = editingMenu ? `/api/website/menus/${editingMenu._id}` : '/api/website/menus';
      await fetch(url, {
        method: editingMenu ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });
      fetchData();
      setShowMenuDialog(false);
      resetMenuForm();
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await fetch(`/api/website/menus/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const handleSaveBlock = async () => {
    try {
      const url = editingBlock ? `/api/website/blocks/${editingBlock._id}` : '/api/website/blocks';
      await fetch(url, {
        method: editingBlock ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm)
      });
      fetchData();
      setShowBlockDialog(false);
      resetBlockForm();
    } catch (error) {
      console.error('Error saving block:', error);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Delete this block?')) return;
    try {
      await fetch(`/api/website/blocks/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/website/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleExportForms = () => {
    const csv = forms.map(f => `${f.formName},${f.submittedDate},${JSON.stringify(f.submittedData)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-submissions.csv';
    a.click();
  };

  const resetPageForm = () => {
    setPageForm({
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      featuredImage: '',
      author: '',
      template: 'default',
      views: 0
    });
    setEditingPage(null);
  };

  const resetMenuForm = () => {
    setMenuForm({
      label: '',
      url: '',
      parentId: '',
      order: 0,
      target: '_self',
      cssClass: '',
      isActive: true,
      icon: ''
    });
    setEditingMenu(null);
  };

  const resetBlockForm = () => {
    setBlockForm({
      name: '',
      type: 'text',
      content: '',
      position: 'main',
      settings: {},
      pageId: '',
      isGlobal: false,
      isActive: true,
      order: 0
    });
    setEditingBlock(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      published: 'bg-green-500/20 text-green-500',
      draft: 'bg-yellow-500/20 text-yellow-500',
      archived: 'bg-gray-500/20 text-gray-500',
      new: 'bg-blue-500/20 text-blue-500',
      read: 'bg-purple-500/20 text-purple-500'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getBlockTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      text: <FileText className="w-4 h-4" />,
      image: <Eye className="w-4 h-4" />,
      video: <Eye className="w-4 h-4" />,
      button: <Layout className="w-4 h-4" />,
      html: <Globe className="w-4 h-4" />,
      form: <FormInput className="w-4 h-4" />
    };
    return icons[type] || <Layout className="w-4 h-4" />;
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = !searchTerm || 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || page.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = !searchTerm || 
      block.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterBlockType === 'all' || block.type === filterBlockType;
    return matchesSearch && matchesType;
  });

  const buildMenuTree = (items: MenuItem[], parentId?: string): MenuItem[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: buildMenuTree(items, item._id)
      }));
  };

  const menuTree = buildMenuTree(menuItems);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Website Builder</h1>
            <p className="text-muted-foreground">Build and manage your website content</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalPages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All pages</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{analytics?.publishedPages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Live pages</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{analytics?.draftPages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Work in progress</p>
              </CardContent>
            </Card>
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{analytics?.totalViews || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Page views</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Website Pages</CardTitle>
                  <CardDescription>Manage all website pages</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetPageForm(); setShowPageDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Page
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search pages..." 
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
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading pages...
                        </TableCell>
                      </TableRow>
                    ) : filteredPages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No pages found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPages.map((page) => (
                        <TableRow key={page._id}>
                          <TableCell className="font-semibold">{page.title}</TableCell>
                          <TableCell className="font-mono text-xs">/{page.slug}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(page.status)}>{page.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-500">{page.views}</Badge>
                          </TableCell>
                          <TableCell>{page.author}</TableCell>
                          <TableCell>{new Date(page.lastModified).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(`/${page.slug}`, '_blank')}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => { 
                                  setEditingPage(page); 
                                  setPageForm(page); 
                                  setShowPageDialog(true); 
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              {page.status === 'draft' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handlePublishPage(page._id)}
                                >
                                  Publish
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleDeletePage(page._id)}>
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

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Navigation Menus</CardTitle>
                  <CardDescription>Manage website navigation structure</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetMenuForm(); setShowMenuDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Menu Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuTree.map(item => (
                  <Card key={item._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Menu className="w-5 h-5 text-purple-500" />
                          <div>
                            <CardTitle className="text-lg">{item.label}</CardTitle>
                            <p className="text-sm text-muted-foreground">{item.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={item.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingMenu(item); setMenuForm(item); setShowMenuDialog(true); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteMenu(item._id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {item.children && item.children.length > 0 && (
                      <CardContent>
                        <div className="pl-8 space-y-2">
                          {item.children.map(child => (
                            <div key={child._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                              <div>
                                <p className="font-semibold">{child.label}</p>
                                <p className="text-xs text-muted-foreground">{child.url}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingMenu(child); setMenuForm(child); setShowMenuDialog(true); }}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteMenu(child._id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocks Tab */}
        <TabsContent value="blocks" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Content Blocks</CardTitle>
                  <CardDescription>Reusable content components</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { resetBlockForm(); setShowBlockDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />New Block
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search blocks..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterBlockType} onValueChange={setFilterBlockType}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBlocks.map(block => (
                  <Card key={block._id} className="glass border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          {getBlockTypeIcon(block.type)}
                          <div>
                            <CardTitle className="text-lg">{block.name}</CardTitle>
                            <Badge className="mt-1 bg-blue-500/20 text-blue-500">{block.type}</Badge>
                          </div>
                        </div>
                        <Badge className={block.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                          {block.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Position</p>
                        <p className="font-semibold capitalize">{block.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Scope</p>
                        <Badge className={block.isGlobal ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-500/20 text-gray-500'}>
                          {block.isGlobal ? 'Global' : 'Page Specific'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingBlock(block); setBlockForm(block); setShowBlockDialog(true); }}>
                          <Edit className="w-3 h-3 mr-1" />Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteBlock(block._id)}>
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

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Form Submissions</CardTitle>
                  <CardDescription>View and manage form submissions</CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportForms}>
                  <Download className="w-4 h-4 mr-2" />Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form Name</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading submissions...
                        </TableCell>
                      </TableRow>
                    ) : forms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No submissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      forms.map((form) => (
                        <TableRow key={form._id}>
                          <TableCell className="font-semibold">{form.formName}</TableCell>
                          <TableCell>{new Date(form.submittedDate).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeClass(form.status)}>{form.status}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{form.ipAddress}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setViewingForm(form);
                                setShowFormDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />View
                            </Button>
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Website Settings
              </CardTitle>
              <CardDescription>Configure website settings and SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Title</Label>
                    <Input 
                      value={settings.siteTitle}
                      onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Site Description</Label>
                    <Input 
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input 
                      value={settings.siteLogo || ''}
                      onChange={(e) => setSettings({...settings, siteLogo: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon URL</Label>
                    <Input 
                      value={settings.favicon || ''}
                      onChange={(e) => setSettings({...settings, favicon: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={settings.contactInfo.email || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: {...settings.contactInfo, email: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={settings.contactInfo.phone || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: {...settings.contactInfo, phone: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input 
                      value={settings.contactInfo.address || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        contactInfo: {...settings.contactInfo, address: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input 
                      value={settings.socialMedia.facebook || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMedia: {...settings.socialMedia, facebook: e.target.value}
                      })}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter</Label>
                    <Input 
                      value={settings.socialMedia.twitter || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMedia: {...settings.socialMedia, twitter: e.target.value}
                      })}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input 
                      value={settings.socialMedia.instagram || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMedia: {...settings.socialMedia, instagram: e.target.value}
                      })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input 
                      value={settings.socialMedia.linkedin || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialMedia: {...settings.socialMedia, linkedin: e.target.value}
                      })}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Header Code</Label>
                    <Textarea 
                      value={settings.headerCode || ''}
                      onChange={(e) => setSettings({...settings, headerCode: e.target.value})}
                      rows={3}
                      placeholder="HTML code for header..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Code</Label>
                    <Textarea 
                      value={settings.footerCode || ''}
                      onChange={(e) => setSettings({...settings, footerCode: e.target.value})}
                      rows={3}
                      placeholder="HTML code for footer..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Analytics Code</Label>
                    <Textarea 
                      value={settings.analyticsCode || ''}
                      onChange={(e) => setSettings({...settings, analyticsCode: e.target.value})}
                      rows={3}
                      placeholder="Google Analytics or other tracking code..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label>Maintenance Mode</Label>
                  <Badge className={settings.maintenanceMode ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}>
                    {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSettings} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'New Page'}</DialogTitle>
            <DialogDescription>Configure page details and SEO</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Title *</Label>
                <Input value={pageForm.title} onChange={(e) => setPageForm({...pageForm, title: e.target.value})} placeholder="About Us" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={pageForm.slug} onChange={(e) => setPageForm({...pageForm, slug: e.target.value})} placeholder="about-us" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea value={pageForm.content} onChange={(e) => setPageForm({...pageForm, content: e.target.value})} rows={10} placeholder="Page HTML content..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={pageForm.status} onValueChange={(value) => setPageForm({...pageForm, status: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={pageForm.template} onValueChange={(value) => setPageForm({...pageForm, template: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                    <SelectItem value="sidebar">With Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input value={pageForm.seoTitle} onChange={(e) => setPageForm({...pageForm, seoTitle: e.target.value})} placeholder="SEO optimized title" />
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea value={pageForm.seoDescription} onChange={(e) => setPageForm({...pageForm, seoDescription: e.target.value})} rows={3} placeholder="Meta description..." />
            </div>
            <div className="space-y-2">
              <Label>SEO Keywords</Label>
              <Input value={pageForm.seoKeywords} onChange={(e) => setPageForm({...pageForm, seoKeywords: e.target.value})} placeholder="keyword1, keyword2, keyword3" />
            </div>
            <div className="space-y-2">
              <Label>Featured Image URL</Label>
              <Input value={pageForm.featuredImage} onChange={(e) => setPageForm({...pageForm, featuredImage: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPageDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePage} className="gradient-primary">Save Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Dialog */}
      <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>Configure menu item settings</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={menuForm.label} onChange={(e) => setMenuForm({...menuForm, label: e.target.value})} placeholder="Home" />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={menuForm.url} onChange={(e) => setMenuForm({...menuForm, url: e.target.value})} placeholder="/" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Menu</Label>
                <Select value={menuForm.parentId} onValueChange={(value) => setMenuForm({...menuForm, parentId: value})}>
                  <SelectTrigger><SelectValue placeholder="None (Top Level)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {menuItems.filter(m => !m.parentId).map(item => (
                      <SelectItem key={item._id} value={item._id}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={menuForm.order} onChange={(e) => setMenuForm({...menuForm, order: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={menuForm.target} onValueChange={(value) => setMenuForm({...menuForm, target: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Window</SelectItem>
                    <SelectItem value="_blank">New Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CSS Class</Label>
                <Input value={menuForm.cssClass} onChange={(e) => setMenuForm({...menuForm, cssClass: e.target.value})} placeholder="menu-class" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={menuForm.isActive} onChange={(e) => setMenuForm({...menuForm, isActive: e.target.checked})} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMenu} className="gradient-primary">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Block' : 'New Block'}</DialogTitle>
            <DialogDescription>Configure content block</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Block Name *</Label>
                <Input value={blockForm.name} onChange={(e) => setBlockForm({...blockForm, name: e.target.value})} placeholder="Header Banner" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={blockForm.type} onValueChange={(value) => setBlockForm({...blockForm, type: value as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea value={blockForm.content} onChange={(e) => setBlockForm({...blockForm, content: e.target.value})} rows={5} placeholder="Block content..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={blockForm.position} onValueChange={(value) => setBlockForm({...blockForm, position: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="main">Main</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={blockForm.order} onChange={(e) => setBlockForm({...blockForm, order: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={blockForm.isGlobal} onChange={(e) => setBlockForm({...blockForm, isGlobal: e.target.checked})} />
                <Label>Global Block (appears on all pages)</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={blockForm.isActive} onChange={(e) => setBlockForm({...blockForm, isActive: e.target.checked})} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBlock} className="gradient-primary">Save Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form View Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Submission</DialogTitle>
            <DialogDescription>{viewingForm?.formName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted Date</p>
                <p className="font-bold">{viewingForm && new Date(viewingForm.submittedDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-bold font-mono">{viewingForm?.ipAddress}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Submitted Data</Label>
              <div className="p-4 rounded-lg bg-white/5 space-y-2">
                {viewingForm && Object.entries(viewingForm.submittedData).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 rounded bg-white/5">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
