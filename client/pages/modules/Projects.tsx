import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Search, FolderKanban, CheckSquare, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
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

interface Project {
  _id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  teamMembers: string;
}

interface Task {
  _id?: string;
  taskName: string;
  project: string;
  assignedTo: string;
  status: 'to-do' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  description: string;
}

export default function Projects() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [projectForm, setProjectForm] = useState<Project>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    teamMembers: ''
  });

  const [taskForm, setTaskForm] = useState<Task>({
    taskName: '',
    project: '',
    assignedTo: '',
    status: 'to-do',
    priority: 'medium',
    dueDate: '',
    description: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [proj, tsk, an] = await Promise.all([
        fetch('/api/projects/projects').then(r => r.json()).catch(() => []),
        fetch('/api/projects/tasks').then(r => r.json()).catch(() => []),
        fetch('/api/projects/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setProjects(Array.isArray(proj) ? proj : []);
      setTasks(Array.isArray(tsk) ? tsk : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setProjects([]);
      setTasks([]);
      setAnalytics({});
    }
  };

  const handleSaveProject = async () => {
    try {
      const url = editingItem ? `/api/projects/projects/${editingItem._id}` : '/api/projects/projects';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(projectForm) 
      });
      fetchData();
      setShowProjectDialog(false);
      resetProjectForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleSaveTask = async () => {
    try {
      const url = editingItem ? `/api/projects/tasks/${editingItem._id}` : '/api/projects/tasks';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(taskForm) 
      });
      fetchData();
      setShowTaskDialog(false);
      resetTaskForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/projects/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/projects/tasks/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'planning',
      priority: 'medium',
      budget: 0,
      teamMembers: ''
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      taskName: '',
      project: '',
      assignedTo: '',
      status: 'to-do',
      priority: 'medium',
      dueDate: '',
      description: ''
    });
  };

  const openEditProject = (project: Project) => {
    setEditingItem(project);
    setProjectForm(project);
    setShowProjectDialog(true);
  };

  const openEditTask = (task: Task) => {
    setEditingItem(task);
    setTaskForm(task);
    setShowTaskDialog(true);
  };

  const getProjectStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'to-do': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-purple-100 text-purple-800',
      'done': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Projects Management
          </h1>
          <p className="text-gray-500 mt-1">Manage projects, tasks, and team collaboration</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">All time projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeProjects || 0}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.completedProjects || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalTasks || 0}</div>
                <p className="text-xs text-muted-foreground">All project tasks</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Projects by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.projectsByStatus && Object.entries(analytics.projectsByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                      <Badge className={getProjectStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.tasksByStatus && Object.entries(analytics.tasksByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                      <Badge className={getTaskStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetProjectForm(); setEditingItem(null); setShowProjectDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Projects List</CardTitle>
              <CardDescription>Manage all your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                        <TableCell>
                          <Badge className={getProjectStatusColor(project.status)}>
                            {project.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        </TableCell>
                        <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>${project.budget.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditProject(project)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project._id!)}>
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

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetTaskForm(); setEditingItem(null); setShowTaskDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tasks List</CardTitle>
              <CardDescription>Manage all project tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">{task.taskName}</TableCell>
                        <TableCell>{task.project}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditTask(task)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task._id!)}>
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
      </Tabs>

      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update project details' : 'Create a new project'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                placeholder="Enter project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={projectForm.status} onValueChange={(value: any) => setProjectForm({...projectForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={projectForm.priority} onValueChange={(value: any) => setProjectForm({...projectForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({...projectForm, budget: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teamMembers">Team Members (comma-separated)</Label>
              <Input
                id="teamMembers"
                value={projectForm.teamMembers}
                onChange={(e) => setProjectForm({...projectForm, teamMembers: e.target.value})}
                placeholder="John Doe, Jane Smith"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowProjectDialog(false); resetProjectForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>
              {editingItem ? 'Update' : 'Create'} Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update task details' : 'Create a new task'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={taskForm.taskName}
                onChange={(e) => setTaskForm({...taskForm, taskName: e.target.value})}
                placeholder="Enter task name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={taskForm.project}
                onChange={(e) => setTaskForm({...taskForm, project: e.target.value})}
                placeholder="Enter project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                placeholder="Enter assignee name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="taskStatus">Status</Label>
                <Select value={taskForm.status} onValueChange={(value: any) => setTaskForm({...taskForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-do">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTaskDialog(false); resetTaskForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              {editingItem ? 'Update' : 'Create'} Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
