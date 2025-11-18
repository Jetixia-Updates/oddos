import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Search, TrendingUp, Edit, Trash2, Eye, Share2, BarChart3, Users, CheckCircle, Clock } from "lucide-react";
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

export default function Surveys() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    category: 'customer_satisfaction',
    status: 'draft',
    isPublic: true,
    allowAnonymous: false,
    startDate: '',
    endDate: '',
    thankYouMessage: ''
  });

  const [questionForm, setQuestionForm] = useState({
    surveyId: '',
    surveyTitle: '',
    question: '',
    questionType: 'multiple_choice',
    isRequired: true,
    options: ['', ''],
    order: 1
  });

  const [responseForm, setResponseForm] = useState({
    surveyId: '',
    respondentName: '',
    respondentEmail: '',
    answers: [] as any[],
    completedAt: '',
    timeSpent: 0
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, q, r, an] = await Promise.all([
        fetch('/api/surveys/surveys').then(r => r.json()).catch(() => []),
        fetch('/api/surveys/questions').then(r => r.json()).catch(() => []),
        fetch('/api/surveys/responses').then(r => r.json()).catch(() => []),
        fetch('/api/surveys/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setSurveys(Array.isArray(s) ? s : []);
      setQuestions(Array.isArray(q) ? q : []);
      setResponses(Array.isArray(r) ? r : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setSurveys([]);
      setQuestions([]);
      setResponses([]);
      setAnalytics({});
    }
  };

  const handleSaveSurvey = async () => {
    const url = editingItem ? `/api/surveys/surveys/${editingItem._id}` : '/api/surveys/surveys';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(surveyForm) 
    });
    fetchData();
    setShowSurveyDialog(false);
    setSurveyForm({
      title: '',
      description: '',
      category: 'customer_satisfaction',
      status: 'draft',
      isPublic: true,
      allowAnonymous: false,
      startDate: '',
      endDate: '',
      thankYouMessage: ''
    });
    setEditingItem(null);
  };

  const handleSaveQuestion = async () => {
    const url = editingItem ? `/api/surveys/questions/${editingItem._id}` : '/api/surveys/questions';
    await fetch(url, { 
      method: editingItem ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(questionForm) 
    });
    fetchData();
    setShowQuestionDialog(false);
    setQuestionForm({
      surveyId: '',
      surveyTitle: '',
      question: '',
      questionType: 'multiple_choice',
      isRequired: true,
      options: ['', ''],
      order: 1
    });
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await fetch(`/api/surveys/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handlePublishSurvey = async (surveyId: string) => {
    await fetch(`/api/surveys/surveys/${surveyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' })
    });
    fetchData();
  };

  const addOption = () => {
    setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length > 2) {
      const newOptions = questionForm.options.filter((_, i) => i !== index);
      setQuestionForm({ ...questionForm, options: newOptions });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-500',
      published: 'bg-green-500/20 text-green-500',
      closed: 'bg-red-500/20 text-red-500',
      scheduled: 'bg-blue-500/20 text-blue-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      customer_satisfaction: 'bg-blue-500/20 text-blue-500',
      employee_feedback: 'bg-purple-500/20 text-purple-500',
      market_research: 'bg-green-500/20 text-green-500',
      event_feedback: 'bg-orange-500/20 text-orange-500',
      product_review: 'bg-pink-500/20 text-pink-500',
      other: 'bg-gray-500/20 text-gray-500'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getSurveyQuestions = (surveyId: string) => {
    return questions.filter(q => q.surveyId === surveyId);
  };

  const getSurveyResponses = (surveyId: string) => {
    return responses.filter(r => r.surveyId === surveyId);
  };

  const calculateCompletionRate = (surveyId: string) => {
    const surveyResponses = getSurveyResponses(surveyId);
    const completed = surveyResponses.filter(r => r.completedAt).length;
    return surveyResponses.length > 0 ? ((completed / surveyResponses.length) * 100).toFixed(1) : '0';
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Surveys</h1>
            <p className="text-muted-foreground">Create surveys, collect feedback, and analyze responses</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Surveys', value: analytics?.totalSurveys || 0, icon: ClipboardCheck, color: 'text-blue-500', desc: `${analytics?.activeSurveys || 0} active` },
              { title: 'Total Responses', value: analytics?.totalResponses || 0, icon: Users, color: 'text-green-500', desc: 'All time' },
              { title: 'Avg Completion', value: `${(analytics?.avgCompletionRate || 0).toFixed(1)}%`, icon: CheckCircle, color: 'text-purple-500', desc: 'Completion rate' },
              { title: 'Avg Time', value: `${(analytics?.avgTimeSpent || 0).toFixed(1)}m`, icon: Clock, color: 'text-orange-500', desc: 'Per survey' }
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
                <CardTitle>Recent Surveys</CardTitle>
                <CardDescription>Latest survey performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surveys.slice(0, 5).map((survey) => (
                    <div key={survey._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <p className="font-semibold">{survey.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getCategoryColor(survey.category)}>{survey.category}</Badge>
                          <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{getSurveyResponses(survey._id).length}</p>
                        <p className="text-xs text-muted-foreground">responses</p>
                      </div>
                    </div>
                  ))}
                  {surveys.length === 0 && <p className="text-center text-muted-foreground py-8">No surveys yet</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Survey Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['customer_satisfaction', 'employee_feedback', 'market_research', 'event_feedback', 'product_review'].map((category) => {
                    const count = surveys.filter(s => s.category === category).length;
                    const percentage = surveys.length > 0 ? (count / surveys.length) * 100 : 0;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Survey Management</CardTitle>
                  <CardDescription>Create and manage your surveys</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  setSurveyForm({
                    title: '',
                    description: '',
                    category: 'customer_satisfaction',
                    status: 'draft',
                    isPublic: true,
                    allowAnonymous: false,
                    startDate: '',
                    endDate: '',
                    thankYouMessage: ''
                  }); 
                  setEditingItem(null); 
                  setShowSurveyDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />New Survey
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search surveys..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((survey) => (
                    <TableRow key={survey._id}>
                      <TableCell className="font-semibold">{survey.title}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(survey.category)}>
                          {survey.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getSurveyQuestions(survey._id).length}</TableCell>
                      <TableCell className="font-bold">{getSurveyResponses(survey._id).length}</TableCell>
                      <TableCell className="text-muted-foreground">{calculateCompletionRate(survey._id)}%</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(survey.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {survey.status === 'draft' && (
                            <Button size="sm" variant="ghost" onClick={() => handlePublishSurvey(survey._id)}>
                              <Share2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(survey); 
                            setSurveyForm(survey); 
                            setShowSurveyDialog(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('surveys', survey._id)}>
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

        <TabsContent value="questions" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Survey Questions</CardTitle>
                  <CardDescription>Manage questions for your surveys</CardDescription>
                </div>
                <Button className="gradient-primary" onClick={() => { 
                  setQuestionForm({
                    surveyId: '',
                    surveyTitle: '',
                    question: '',
                    questionType: 'multiple_choice',
                    isRequired: true,
                    options: ['', ''],
                    order: 1
                  }); 
                  setEditingItem(null); 
                  setShowQuestionDialog(true); 
                }}>
                  <Plus className="w-4 h-4 mr-2" />Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell className="font-semibold">{question.surveyTitle}</TableCell>
                      <TableCell className="max-w-md truncate">{question.question}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.questionType.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        {question.isRequired ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{question.order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { 
                            setEditingItem(question); 
                            setQuestionForm(question); 
                            setShowQuestionDialog(true); 
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('questions', question._id)}>
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

        <TabsContent value="responses" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Survey Responses</CardTitle>
              <CardDescription>View and analyze survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response._id}>
                      <TableCell className="font-semibold">
                        {surveys.find(s => s._id === response.surveyId)?.title || 'Unknown'}
                      </TableCell>
                      <TableCell>{response.respondentName || 'Anonymous'}</TableCell>
                      <TableCell className="text-muted-foreground">{response.respondentEmail || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(response.completedAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{response.timeSpent}m</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Survey' : 'Create New Survey'}</DialogTitle>
            <DialogDescription>Fill in the survey details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Survey Title *</Label>
              <Input 
                value={surveyForm.title} 
                onChange={(e) => setSurveyForm({...surveyForm, title: e.target.value})} 
                placeholder="Customer Satisfaction Survey" 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={surveyForm.description} 
                onChange={(e) => setSurveyForm({...surveyForm, description: e.target.value})} 
                placeholder="Tell us about your experience..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={surveyForm.category} onValueChange={(value) => setSurveyForm({...surveyForm, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
                    <SelectItem value="employee_feedback">Employee Feedback</SelectItem>
                    <SelectItem value="market_research">Market Research</SelectItem>
                    <SelectItem value="event_feedback">Event Feedback</SelectItem>
                    <SelectItem value="product_review">Product Review</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={surveyForm.status} onValueChange={(value) => setSurveyForm({...surveyForm, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={surveyForm.startDate} 
                  onChange={(e) => setSurveyForm({...surveyForm, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={surveyForm.endDate} 
                  onChange={(e) => setSurveyForm({...surveyForm, endDate: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thank You Message</Label>
              <Textarea 
                value={surveyForm.thankYouMessage} 
                onChange={(e) => setSurveyForm({...surveyForm, thankYouMessage: e.target.value})} 
                placeholder="Thank you for completing this survey!"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Public Survey</p>
                <p className="text-sm text-muted-foreground">Anyone with the link can access</p>
              </div>
              <Switch 
                checked={surveyForm.isPublic} 
                onCheckedChange={(checked) => setSurveyForm({...surveyForm, isPublic: checked})} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Allow Anonymous Responses</p>
                <p className="text-sm text-muted-foreground">Users don't need to provide identity</p>
              </div>
              <Switch 
                checked={surveyForm.allowAnonymous} 
                onCheckedChange={(checked) => setSurveyForm({...surveyForm, allowAnonymous: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSurveyDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSurvey} className="gradient-primary">
              {editingItem ? 'Update Survey' : 'Create Survey'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>Create a question for your survey</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Survey *</Label>
              <Select 
                value={questionForm.surveyId} 
                onValueChange={(value) => {
                  const survey = surveys.find(s => s._id === value);
                  setQuestionForm({...questionForm, surveyId: value, surveyTitle: survey?.title || ''});
                }}
              >
                <SelectTrigger><SelectValue placeholder="Choose a survey" /></SelectTrigger>
                <SelectContent>
                  {surveys.map(survey => (
                    <SelectItem key={survey._id} value={survey._id}>{survey.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea 
                value={questionForm.question} 
                onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})} 
                placeholder="How satisfied are you with our service?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionForm.questionType} onValueChange={(value) => setQuestionForm({...questionForm, questionType: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="text">Text Response</SelectItem>
                    <SelectItem value="rating">Rating Scale</SelectItem>
                    <SelectItem value="yes_no">Yes/No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input 
                  type="number" 
                  value={questionForm.order} 
                  onChange={(e) => setQuestionForm({...questionForm, order: Number(e.target.value)})} 
                />
              </div>
            </div>
            {(questionForm.questionType === 'multiple_choice' || questionForm.questionType === 'single_choice') && (
              <div className="space-y-2">
                <Label>Options</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={option} 
                      onChange={(e) => updateOption(index, e.target.value)} 
                      placeholder={`Option ${index + 1}`}
                    />
                    {questionForm.options.length > 2 && (
                      <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addOption} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />Add Option
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Required Question</p>
                <p className="text-sm text-muted-foreground">User must answer this question</p>
              </div>
              <Switch 
                checked={questionForm.isRequired} 
                onCheckedChange={(checked) => setQuestionForm({...questionForm, isRequired: checked})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion} className="gradient-primary">
              {editingItem ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
