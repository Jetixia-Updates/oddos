import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Search, Users, TrendingUp, DollarSign, Calendar, MapPin, Clock } from "lucide-react";
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

interface Job {
  _id?: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salaryMin: number;
  salaryMax: number;
  status: 'draft' | 'published' | 'closed';
  postedDate: string;
}

interface Application {
  _id?: string;
  applicantName: string;
  jobTitle: string;
  email: string;
  phone: string;
  resumeLink: string;
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
  appliedDate: string;
}

export default function OnlineJobs() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [jobForm, setJobForm] = useState<Job>({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'full-time',
    salaryMin: 0,
    salaryMax: 0,
    status: 'draft',
    postedDate: new Date().toISOString().split('T')[0]
  });

  const [applicationForm, setApplicationForm] = useState<Application>({
    applicantName: '',
    jobTitle: '',
    email: '',
    phone: '',
    resumeLink: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [j, a, an] = await Promise.all([
        fetch('/api/jobs/jobs').then(r => r.json()).catch(() => []),
        fetch('/api/jobs/applications').then(r => r.json()).catch(() => []),
        fetch('/api/jobs/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setJobs(Array.isArray(j) ? j : []);
      setApplications(Array.isArray(a) ? a : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setJobs([]);
      setApplications([]);
      setAnalytics({});
    }
  };

  const handleSaveJob = async () => {
    try {
      const url = editingItem ? `/api/jobs/jobs/${editingItem._id}` : '/api/jobs/jobs';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(jobForm) 
      });
      fetchData();
      setShowJobDialog(false);
      resetJobForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleSaveApplication = async () => {
    try {
      const url = editingItem ? `/api/jobs/applications/${editingItem._id}` : '/api/jobs/applications';
      await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(applicationForm) 
      });
      fetchData();
      setShowApplicationDialog(false);
      resetApplicationForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await fetch(`/api/jobs/jobs/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await fetch(`/api/jobs/applications/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      department: '',
      location: '',
      type: 'full-time',
      salaryMin: 0,
      salaryMax: 0,
      status: 'draft',
      postedDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      applicantName: '',
      jobTitle: '',
      email: '',
      phone: '',
      resumeLink: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0]
    });
  };

  const openEditJob = (job: Job) => {
    setEditingItem(job);
    setJobForm(job);
    setShowJobDialog(true);
  };

  const openEditApplication = (app: Application) => {
    setEditingItem(app);
    setApplicationForm(app);
    setShowApplicationDialog(true);
  };

  const getJobStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'closed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-purple-100 text-purple-800',
      'contract': 'bg-orange-100 text-orange-800',
      'remote': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getApplicationStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'applied': 'bg-blue-100 text-blue-800',
      'screening': 'bg-purple-100 text-purple-800',
      'interview': 'bg-yellow-100 text-yellow-800',
      'offered': 'bg-green-100 text-green-800',
      'hired': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(a => 
    a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Online Jobs & Recruitment
          </h1>
          <p className="text-gray-500 mt-1">Manage job postings and track applications</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetJobForm(); setEditingItem(null); setShowJobDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Job
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No jobs found. Create your first job posting!</p>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="mt-2 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted {new Date(job.postedDate).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getJobStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Badge className={getJobTypeColor(job.type)}>
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditJob(job)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job._id!)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => { resetApplicationForm(); setEditingItem(null); setShowApplicationDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Application
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Track and manage candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app._id}>
                        <TableCell className="font-medium">{app.applicantName}</TableCell>
                        <TableCell>{app.jobTitle}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.phone}</TableCell>
                        <TableCell>
                          <Badge className={getApplicationStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditApplication(app)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteApplication(app._id!)}>
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalJobs || 0}</div>
                <p className="text-xs text-muted-foreground">All job postings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeJobs || 0}</div>
                <p className="text-xs text-muted-foreground">Currently published</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
                <p className="text-xs text-muted-foreground">All applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hired</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.hired || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully hired</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applications per Job</CardTitle>
                <CardDescription>Top jobs by application count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.applicationsPerJob && analytics.applicationsPerJob.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="truncate">{item.jobTitle}</span>
                      <Badge>{item.count} applications</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status Breakdown</CardTitle>
                <CardDescription>Current status of all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics?.applicationsByStatus && Object.entries(analytics.applicationsByStatus).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge className={getApplicationStatusColor(status)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Job' : 'Add New Job'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update job details' : 'Create a new job posting'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={jobForm.title}
                onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                placeholder="Job description and requirements"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={jobForm.department}
                  onChange={(e) => setJobForm({...jobForm, department: e.target.value})}
                  placeholder="Engineering"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={jobForm.type} onValueChange={(value: any) => setJobForm({...jobForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={jobForm.status} onValueChange={(value: any) => setJobForm({...jobForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={jobForm.salaryMin}
                  onChange={(e) => setJobForm({...jobForm, salaryMin: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={jobForm.salaryMax}
                  onChange={(e) => setJobForm({...jobForm, salaryMax: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postedDate">Posted Date</Label>
              <Input
                id="postedDate"
                type="date"
                value={jobForm.postedDate}
                onChange={(e) => setJobForm({...jobForm, postedDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowJobDialog(false); resetJobForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveJob}>
              {editingItem ? 'Update' : 'Create'} Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Application' : 'Add New Application'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update application details' : 'Record a new job application'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="applicantName">Applicant Name</Label>
              <Input
                id="applicantName"
                value={applicationForm.applicantName}
                onChange={(e) => setApplicationForm({...applicationForm, applicantName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={applicationForm.jobTitle}
                onChange={(e) => setApplicationForm({...applicationForm, jobTitle: e.target.value})}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resumeLink">Resume Link</Label>
              <Input
                id="resumeLink"
                value={applicationForm.resumeLink}
                onChange={(e) => setApplicationForm({...applicationForm, resumeLink: e.target.value})}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appStatus">Status</Label>
                <Select value={applicationForm.status} onValueChange={(value: any) => setApplicationForm({...applicationForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appliedDate">Applied Date</Label>
                <Input
                  id="appliedDate"
                  type="date"
                  value={applicationForm.appliedDate}
                  onChange={(e) => setApplicationForm({...applicationForm, appliedDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowApplicationDialog(false); resetApplicationForm(); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveApplication}>
              {editingItem ? 'Update' : 'Create'} Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
