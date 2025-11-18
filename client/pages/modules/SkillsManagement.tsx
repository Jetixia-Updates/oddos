import React, { useState, useEffect } from "react";
import { Award, Plus, Search, GraduationCap, Target, TrendingUp, Calendar, Users } from "lucide-react";
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

interface Skill {
  _id?: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'management';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

interface EmployeeSkill {
  _id?: string;
  employeeName: string;
  skillName: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  acquiredDate: string;
  expiryDate: string;
  certificationName: string;
  issuer: string;
}

export default function SkillsManagement() {
  const [activeTab, setActiveTab] = useState('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [showEmployeeSkillDialog, setShowEmployeeSkillDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [skillForm, setSkillForm] = useState<Skill>({
    name: '',
    category: 'technical',
    level: 'intermediate',
    description: ''
  });

  const [employeeSkillForm, setEmployeeSkillForm] = useState<EmployeeSkill>({
    employeeName: '',
    skillName: '',
    proficiency: 'intermediate',
    acquiredDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    certificationName: '',
    issuer: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, es, an] = await Promise.all([
        fetch('/api/skills/skills').then(r => r.json()).catch(() => []),
        fetch('/api/skills/employee-skills').then(r => r.json()).catch(() => []),
        fetch('/api/skills/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setSkills(Array.isArray(s) ? s : []);
      setEmployeeSkills(Array.isArray(es) ? es : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setSkills([]);
      setEmployeeSkills([]);
      setAnalytics({});
    }
  };

  const handleSaveSkill = async () => {
    try {
      const url = editingItem ? `/api/skills/skills/${editingItem._id}` : '/api/skills/skills';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(skillForm) 
      });
      fetchData();
      setShowSkillDialog(false);
      resetSkillForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const handleSaveEmployeeSkill = async () => {
    try {
      const url = editingItem ? `/api/skills/employee-skills/${editingItem._id}` : '/api/skills/employee-skills';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(employeeSkillForm) 
      });
      fetchData();
      setShowEmployeeSkillDialog(false);
      resetEmployeeSkillForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving employee skill:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await fetch(`/api/skills/skills/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleDeleteEmployeeSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee skill?')) return;
    try {
      await fetch(`/api/skills/employee-skills/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting employee skill:', error);
    }
  };

  const resetSkillForm = () => {
    setSkillForm({
      name: '',
      category: 'technical',
      level: 'intermediate',
      description: ''
    });
  };

  const resetEmployeeSkillForm = () => {
    setEmployeeSkillForm({
      employeeName: '',
      skillName: '',
      proficiency: 'intermediate',
      acquiredDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      certificationName: '',
      issuer: ''
    });
  };

  const openEditSkill = (skill: Skill) => {
    setEditingItem(skill);
    setSkillForm(skill);
    setShowSkillDialog(true);
  };

  const openEditEmployeeSkill = (es: EmployeeSkill) => {
    setEditingItem(es);
    setEmployeeSkillForm(es);
    setShowEmployeeSkillDialog(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'technical': 'bg-blue-100 text-blue-800',
      'soft': 'bg-green-100 text-green-800',
      'language': 'bg-purple-100 text-purple-800',
      'management': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-gray-100 text-gray-800',
      'intermediate': 'bg-blue-100 text-blue-800',
      'advanced': 'bg-purple-100 text-purple-800',
      'expert': 'bg-green-100 text-green-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeSkills = employeeSkills.filter(es => 
    es.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    es.skillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const certifications = employeeSkills.filter(es => es.certificationName && es.certificationName.trim() !== '');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="w-8 h-8 text-amber-500" />
            Skills Management
          </h1>
          <p className="text-gray-500 mt-1">Track and manage employee skills and certifications</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="employee-skills">Employee Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetSkillForm(); setEditingItem(null); setShowSkillDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSkills || 0}</div>
                <p className="text-xs text-muted-foreground">Registered skills</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Technical</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.technicalSkills || 0}</div>
                <p className="text-xs text-muted-foreground">Technical skills</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Soft Skills</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.softSkills || 0}</div>
                <p className="text-xs text-muted-foreground">Soft skills</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Languages</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.languageSkills || 0}</div>
                <p className="text-xs text-muted-foreground">Language skills</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skills Library</CardTitle>
              <CardDescription>Manage organizational skills</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No skills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSkills.map((skill) => (
                      <TableRow key={skill._id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(skill.category)}>
                            {skill.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(skill.level)}>
                            {skill.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{skill.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditSkill(skill)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteSkill(skill._id!)}>
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

        <TabsContent value="employee-skills" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetEmployeeSkillForm(); setEditingItem(null); setShowEmployeeSkillDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Assign Skill
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Skills</CardTitle>
              <CardDescription>Track skills assigned to employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Proficiency</TableHead>
                    <TableHead>Acquired</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployeeSkills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No employee skills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployeeSkills.map((es) => (
                      <TableRow key={es._id}>
                        <TableCell className="font-medium">{es.employeeName}</TableCell>
                        <TableCell>{es.skillName}</TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(es.proficiency)}>
                            {es.proficiency}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(es.acquiredDate).toLocaleDateString()}</TableCell>
                        <TableCell>{es.expiryDate ? new Date(es.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditEmployeeSkill(es)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEmployeeSkill(es._id!)}>
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

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Track employee certifications and their validity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No certifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    certifications.map((cert) => {
                      const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                      const isExpiringSoon = cert.expiryDate && 
                        new Date(cert.expiryDate) > new Date() && 
                        new Date(cert.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
                      
                      return (
                        <TableRow key={cert._id}>
                          <TableCell className="font-medium">{cert.employeeName}</TableCell>
                          <TableCell>{cert.certificationName}</TableCell>
                          <TableCell>{cert.skillName}</TableCell>
                          <TableCell>{cert.issuer}</TableCell>
                          <TableCell>{new Date(cert.acquiredDate).toLocaleDateString()}</TableCell>
                          <TableCell>{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={
                              isExpired ? 'bg-red-100 text-red-800' :
                              isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update skill details' : 'Create a new skill'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skillName">Skill Name</Label>
              <Input
                id="skillName"
                value={skillForm.name}
                onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                placeholder="JavaScript, Leadership, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={skillForm.category} onValueChange={(value: any) => setSkillForm({...skillForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="soft">Soft Skills</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select value={skillForm.level} onValueChange={(value: any) => setSkillForm({...skillForm, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={skillForm.description}
                onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}
                placeholder="Describe the skill"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSkillDialog(false); resetSkillForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSkill}>
              {editingItem ? 'Update' : 'Create'} Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmployeeSkillDialog} onOpenChange={setShowEmployeeSkillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Employee Skill' : 'Assign Skill to Employee'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update employee skill details' : 'Assign a skill to an employee'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={employeeSkillForm.employeeName}
                onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, employeeName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skillName">Skill Name</Label>
              <Input
                id="skillName"
                value={employeeSkillForm.skillName}
                onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, skillName: e.target.value})}
                placeholder="JavaScript, Project Management, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proficiency">Proficiency Level</Label>
              <Select value={employeeSkillForm.proficiency} onValueChange={(value: any) => setEmployeeSkillForm({...employeeSkillForm, proficiency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="acquiredDate">Acquired Date</Label>
                <Input
                  id="acquiredDate"
                  type="date"
                  value={employeeSkillForm.acquiredDate}
                  onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, acquiredDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={employeeSkillForm.expiryDate}
                  onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, expiryDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certificationName">Certification Name (Optional)</Label>
              <Input
                id="certificationName"
                value={employeeSkillForm.certificationName}
                onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, certificationName: e.target.value})}
                placeholder="AWS Certified Developer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issuer">Issuer (Optional)</Label>
              <Input
                id="issuer"
                value={employeeSkillForm.issuer}
                onChange={(e) => setEmployeeSkillForm({...employeeSkillForm, issuer: e.target.value})}
                placeholder="Amazon Web Services"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEmployeeSkillDialog(false); resetEmployeeSkillForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEmployeeSkill}>
              {editingItem ? 'Update' : 'Assign'} Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
