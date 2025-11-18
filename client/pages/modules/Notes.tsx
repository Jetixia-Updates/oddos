import React, { useState, useEffect } from "react";
import { StickyNote, Plus, Search, FileText, Tag, Pin, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  _id?: string;
  title: string;
  content: string;
  category: 'personal' | 'work' | 'ideas' | 'important';
  tags: string;
  pinned: boolean;
  lastUpdated?: string;
}

export default function Notes() {
  const [activeTab, setActiveTab] = useState('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [form, setForm] = useState<Note>({
    title: '',
    content: '',
    category: 'personal',
    tags: '',
    pinned: false
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await fetch('/api/notes/notes').then(r => r.json()).catch(() => []);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setNotes([]);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingItem ? `/api/notes/notes/${editingItem._id}` : '/api/notes/notes';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      fetchData();
      setShowDialog(false);
      resetForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await fetch(`/api/notes/notes/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      await fetch(`/api/notes/notes/${note._id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...note, pinned: !note.pinned }) 
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      category: 'personal',
      tags: '',
      pinned: false
    });
  };

  const openEdit = (item: Note) => {
    setEditingItem(item);
    setForm(item);
    setShowDialog(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'personal': 'bg-blue-100 text-blue-800',
      'work': 'bg-purple-100 text-purple-800',
      'ideas': 'bg-yellow-100 text-yellow-800',
      'important': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.tags.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') {
      return matchesSearch && (selectedCategory === 'all' || n.category === selectedCategory);
    } else if (activeTab === 'personal') {
      return matchesSearch && n.category === 'personal';
    } else if (activeTab === 'shared') {
      return matchesSearch && (n.category === 'work' || n.category === 'important');
    }
    return matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const regularNotes = filteredNotes.filter(n => !n.pinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {note.pinned && <Pin className="w-4 h-4 text-red-500 fill-red-500" />}
              {note.title}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getCategoryColor(note.category)}>
                {note.category}
              </Badge>
              {note.tags && note.tags.split(',').map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); togglePin(note); }}
          >
            <Pin className={`w-4 h-4 ${note.pinned ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">
            {note.lastUpdated ? new Date(note.lastUpdated).toLocaleDateString() : 'Just now'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(note)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(note._id!)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <StickyNote className="w-8 h-8 text-yellow-500" />
            Notes
          </h1>
          <p className="text-gray-500 mt-1">Manage your notes and ideas</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="shared">Work & Important</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="ideas">Ideas</SelectItem>
              <SelectItem value="important">Important</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setEditingItem(null); setShowDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Note
          </Button>
        </div>

        <TabsContent value="all" className="space-y-6">
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pin className="w-5 h-5" />
                Pinned Notes
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            </div>
          )}

          <div>
            {pinnedNotes.length > 0 && <h2 className="text-xl font-semibold mb-4">All Notes</h2>}
            {regularNotes.length === 0 && pinnedNotes.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No notes found. Create your first note!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularNotes.map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {filteredNotes.filter(n => n.pinned).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pin className="w-5 h-5" />
                Pinned Notes
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.filter(n => n.pinned).map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            </div>
          )}

          <div>
            {filteredNotes.filter(n => n.pinned).length > 0 && <h2 className="text-xl font-semibold mb-4">Personal Notes</h2>}
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No personal notes found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.filter(n => !n.pinned).map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          {filteredNotes.filter(n => n.pinned).length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Pin className="w-5 h-5" />
                Pinned Notes
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.filter(n => n.pinned).map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            </div>
          )}

          <div>
            {filteredNotes.filter(n => n.pinned).length > 0 && <h2 className="text-xl font-semibold mb-4">Work & Important Notes</h2>}
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No work or important notes found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.filter(n => !n.pinned).map((note) => (
                  <NoteCard key={note._id} note={note} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update note details' : 'Create a new note'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Note title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                placeholder="Write your note here..."
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value: any) => setForm({...form, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="ideas">Ideas</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({...form, tags: e.target.value})}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={form.pinned}
                onChange={(e) => setForm({...form, pinned: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="pinned">Pin this note</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Update' : 'Create'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
