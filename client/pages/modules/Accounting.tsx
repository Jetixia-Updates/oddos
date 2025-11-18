import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Search, TrendingUp, TrendingDown, Edit, Trash2, FileText, Receipt, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountForm, setAccountForm] = useState({ accountName: '', accountCode: '', accountType: 'asset', balance: 0, currency: 'USD', description: '' });
  const [journalForm, setJournalForm] = useState({ reference: '', entryDate: '', description: '', debitAccount: '', creditAccount: '', amount: 0, status: 'draft' });
  const [invoiceForm, setInvoiceForm] = useState({ customerName: '', invoiceDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' });
  const [billForm, setBillForm] = useState({ vendorName: '', billDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [a, j, i, b, an] = await Promise.all([
        fetch('/api/accounting/accounts').then(r => r.json()).catch(() => []),
        fetch('/api/accounting/journal-entries').then(r => r.json()).catch(() => []),
        fetch('/api/accounting/invoices').then(r => r.json()).catch(() => []),
        fetch('/api/accounting/bills').then(r => r.json()).catch(() => []),
        fetch('/api/accounting/analytics').then(r => r.json()).catch(() => ({}))
      ]);
      setAccounts(Array.isArray(a) ? a : []);
      setJournalEntries(Array.isArray(j) ? j : []);
      setInvoices(Array.isArray(i) ? i : []);
      setBills(Array.isArray(b) ? b : []);
      setAnalytics(an || {});
    } catch (error) {
      console.error('Error:', error);
      setAccounts([]);
      setJournalEntries([]);
      setInvoices([]);
      setBills([]);
      setAnalytics({});
    }
  };

  const handleSaveAccount = async () => {
    const url = editingItem ? `/api/accounting/accounts/${editingItem._id}` : '/api/accounting/accounts';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountForm) });
    fetchData();
    setShowAccountDialog(false);
    setAccountForm({ accountName: '', accountCode: '', accountType: 'asset', balance: 0, currency: 'USD', description: '' });
    setEditingItem(null);
  };

  const handleSaveJournal = async () => {
    const url = editingItem ? `/api/accounting/journal-entries/${editingItem._id}` : '/api/accounting/journal-entries';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(journalForm) });
    fetchData();
    setShowJournalDialog(false);
    setJournalForm({ reference: '', entryDate: '', description: '', debitAccount: '', creditAccount: '', amount: 0, status: 'draft' });
    setEditingItem(null);
  };

  const handleSaveInvoice = async () => {
    const url = editingItem ? `/api/accounting/invoices/${editingItem._id}` : '/api/accounting/invoices';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceForm) });
    fetchData();
    setShowInvoiceDialog(false);
    setInvoiceForm({ customerName: '', invoiceDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' });
    setEditingItem(null);
  };

  const handleSaveBill = async () => {
    const url = editingItem ? `/api/accounting/bills/${editingItem._id}` : '/api/accounting/bills';
    await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(billForm) });
    fetchData();
    setShowBillDialog(false);
    setBillForm({ vendorName: '', billDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' });
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/accounting/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-500', posted: 'bg-blue-500/20 text-blue-500', paid: 'bg-green-500/20 text-green-500', partial: 'bg-yellow-500/20 text-yellow-500', overdue: 'bg-red-500/20 text-red-500', cancelled: 'bg-red-500/20 text-red-500' };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground">Manage accounts, journal entries, invoices and bills</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Revenue', value: formatCurrency(analytics?.totalRevenue || 0), icon: TrendingUp, color: 'text-green-500', desc: 'Total income' },
              { title: 'Expenses', value: formatCurrency(analytics?.totalExpenses || 0), icon: TrendingDown, color: 'text-red-500', desc: 'Total costs' },
              { title: 'Net Profit', value: formatCurrency(analytics?.netProfit || 0), icon: DollarSign, color: analytics?.netProfit >= 0 ? 'text-green-500' : 'text-red-500', desc: `${(analytics?.profitMargin || 0).toFixed(1)}% margin` },
              { title: 'Cash Balance', value: formatCurrency(analytics?.cashBalance || 0), icon: CreditCard, color: 'text-blue-500', desc: 'Available funds' }
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
              <CardHeader><CardTitle>Receivables & Payables</CardTitle><CardDescription>Outstanding amounts</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-green-500/5">
                    <div><p className="text-sm text-muted-foreground">Accounts Receivable</p><p className="text-2xl font-bold text-green-500">{formatCurrency(analytics?.totalReceivables || 0)}</p></div>
                    <Receipt className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-red-500/5">
                    <div><p className="text-sm text-muted-foreground">Accounts Payable</p><p className="text-2xl font-bold text-red-500">{formatCurrency(analytics?.totalPayables || 0)}</p></div>
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-3 rounded-lg border border-border/50 text-center"><p className="text-sm text-muted-foreground">Overdue Invoices</p><p className="text-2xl font-bold text-orange-500">{analytics?.overdueInvoices || 0}</p></div>
                    <div className="p-3 rounded-lg border border-border/50 text-center"><p className="text-sm text-muted-foreground">Overdue Bills</p><p className="text-2xl font-bold text-orange-500">{analytics?.overdueBills || 0}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader><CardTitle>Account Balances</CardTitle><CardDescription>Top accounts by balance</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accounts.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 6).map((account) => (
                    <div key={account._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                      <div className="flex-1"><p className="font-semibold">{account.accountName}</p><p className="text-sm text-muted-foreground">{account.accountCode} • {account.accountType}</p></div>
                      <p className="font-bold text-lg">{formatCurrency(account.balance)}</p>
                    </div>
                  ))}
                  {accounts.length === 0 && <p className="text-center text-muted-foreground py-8">No accounts</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Chart of Accounts</CardTitle><CardDescription>Manage accounting accounts</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setAccountForm({ accountName: '', accountCode: '', accountType: 'asset', balance: 0, currency: 'USD', description: '' }); setEditingItem(null); setShowAccountDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Account</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Account Code</TableHead><TableHead>Account Name</TableHead><TableHead>Type</TableHead><TableHead>Balance</TableHead><TableHead>Currency</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.filter(a => a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || a.accountCode.toLowerCase().includes(searchTerm.toLowerCase())).map((account) => (
                    <TableRow key={account._id}>
                      <TableCell className="font-semibold">{account.accountCode}</TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell><Badge variant="outline">{account.accountType}</Badge></TableCell>
                      <TableCell className="font-bold">{formatCurrency(account.balance)}</TableCell>
                      <TableCell className="text-muted-foreground">{account.currency}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(account); setAccountForm({ accountName: account.accountName, accountCode: account.accountCode, accountType: account.accountType, balance: account.balance, currency: account.currency, description: account.description || '' }); setShowAccountDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('accounts', account._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Journal Entries</CardTitle><CardDescription>Record financial transactions</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setJournalForm({ reference: '', entryDate: '', description: '', debitAccount: '', creditAccount: '', amount: 0, status: 'draft' }); setEditingItem(null); setShowJournalDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Entry</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Entry #</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Debit Account</TableHead><TableHead>Credit Account</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {journalEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-semibold">{entry.entryNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(entry.entryDate)}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.debitAccount}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.creditAccount}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(entry.amount)}</TableCell>
                      <TableCell><Badge className={getStatusColor(entry.status)}>{entry.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(entry); setJournalForm({ reference: entry.reference, entryDate: entry.entryDate, description: entry.description, debitAccount: entry.debitAccount, creditAccount: entry.creditAccount, amount: entry.amount, status: entry.status }); setShowJournalDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('journal-entries', entry._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Customer Invoices</CardTitle><CardDescription>Manage sales invoices</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setInvoiceForm({ customerName: '', invoiceDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' }); setEditingItem(null); setShowInvoiceDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Invoice</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Invoice Date</TableHead><TableHead>Due Date</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-semibold">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell><Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(invoice); setInvoiceForm({ customerName: invoice.customerName, invoiceDate: invoice.invoiceDate, dueDate: invoice.dueDate, items: invoice.items, subtotal: invoice.subtotal, tax: invoice.tax, totalAmount: invoice.totalAmount, status: invoice.status, notes: invoice.notes || '' }); setShowInvoiceDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('invoices', invoice._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Vendor Bills</CardTitle><CardDescription>Manage purchase bills</CardDescription></div>
                <Button className="gradient-primary" onClick={() => { setBillForm({ vendorName: '', billDate: '', dueDate: '', items: [], subtotal: 0, tax: 0, totalAmount: 0, status: 'draft', notes: '' }); setEditingItem(null); setShowBillDialog(true); }}><Plus className="w-4 h-4 mr-2" />New Bill</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Bill #</TableHead><TableHead>Vendor</TableHead><TableHead>Bill Date</TableHead><TableHead>Due Date</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill._id}>
                      <TableCell className="font-semibold">{bill.billNumber}</TableCell>
                      <TableCell>{bill.vendorName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(bill.billDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(bill.dueDate)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(bill.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(bill.paidAmount)}</TableCell>
                      <TableCell><Badge className={getStatusColor(bill.status)}>{bill.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingItem(bill); setBillForm({ vendorName: bill.vendorName, billDate: bill.billDate, dueDate: bill.dueDate, items: bill.items, subtotal: bill.subtotal, tax: bill.tax, totalAmount: bill.totalAmount, status: bill.status, notes: bill.notes || '' }); setShowBillDialog(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete('bills', bill._id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Account' : 'New Account'}</DialogTitle><DialogDescription>Manage chart of accounts</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Account Name *</label><Input value={accountForm.accountName} onChange={(e) => setAccountForm({...accountForm, accountName: e.target.value})} placeholder="Cash Account" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Account Code *</label><Input value={accountForm.accountCode} onChange={(e) => setAccountForm({...accountForm, accountCode: e.target.value})} placeholder="1001" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Account Type</label><Select value={accountForm.accountType} onValueChange={(value) => setAccountForm({...accountForm, accountType: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asset">Asset</SelectItem><SelectItem value="liability">Liability</SelectItem><SelectItem value="equity">Equity</SelectItem><SelectItem value="revenue">Revenue</SelectItem><SelectItem value="expense">Expense</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank">Bank</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">Balance</label><Input type="number" step="0.01" value={accountForm.balance} onChange={(e) => setAccountForm({...accountForm, balance: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Currency</label><Select value={accountForm.currency} onValueChange={(value) => setAccountForm({...accountForm, currency: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="SAR">SAR</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={accountForm.description} onChange={(e) => setAccountForm({...accountForm, description: e.target.value})} placeholder="Account description..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAccountDialog(false)}>Cancel</Button><Button onClick={handleSaveAccount} className="gradient-primary">Save Account</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle><DialogDescription>Record financial transaction</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Reference</label><Input value={journalForm.reference} onChange={(e) => setJournalForm({...journalForm, reference: e.target.value})} placeholder="REF-001" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Entry Date *</label><Input type="date" value={journalForm.entryDate} onChange={(e) => setJournalForm({...journalForm, entryDate: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Description *</label><Input value={journalForm.description} onChange={(e) => setJournalForm({...journalForm, description: e.target.value})} placeholder="Transaction description" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Debit Account</label><Input value={journalForm.debitAccount} onChange={(e) => setJournalForm({...journalForm, debitAccount: e.target.value})} placeholder="Account code" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Credit Account</label><Input value={journalForm.creditAccount} onChange={(e) => setJournalForm({...journalForm, creditAccount: e.target.value})} placeholder="Account code" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Amount *</label><Input type="number" step="0.01" value={journalForm.amount} onChange={(e) => setJournalForm({...journalForm, amount: Number(e.target.value)})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={journalForm.status} onValueChange={(value) => setJournalForm({...journalForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="posted">Posted</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowJournalDialog(false)}>Cancel</Button><Button onClick={handleSaveJournal} className="gradient-primary">Save Entry</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Invoice' : 'New Invoice'}</DialogTitle><DialogDescription>Create customer invoice</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Customer Name *</label><Input value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({...invoiceForm, customerName: e.target.value})} placeholder="Customer name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Invoice Date *</label><Input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({...invoiceForm, invoiceDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Due Date *</label><Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Subtotal</label><Input type="number" step="0.01" value={invoiceForm.subtotal} onChange={(e) => { const sub = Number(e.target.value); setInvoiceForm({...invoiceForm, subtotal: sub, totalAmount: sub + invoiceForm.tax}); }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tax</label><Input type="number" step="0.01" value={invoiceForm.tax} onChange={(e) => { const tx = Number(e.target.value); setInvoiceForm({...invoiceForm, tax: tx, totalAmount: invoiceForm.subtotal + tx}); }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Total</label><Input type="number" step="0.01" value={invoiceForm.totalAmount} readOnly className="bg-muted" /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={invoiceForm.status} onValueChange={(value) => setInvoiceForm({...invoiceForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="posted">Posted</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Invoice notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button><Button onClick={handleSaveInvoice} className="gradient-primary">Save Invoice</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Bill' : 'New Bill'}</DialogTitle><DialogDescription>Create vendor bill</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium">Vendor Name *</label><Input value={billForm.vendorName} onChange={(e) => setBillForm({...billForm, vendorName: e.target.value})} placeholder="Vendor name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Bill Date *</label><Input type="date" value={billForm.billDate} onChange={(e) => setBillForm({...billForm, billDate: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Due Date *</label><Input type="date" value={billForm.dueDate} onChange={(e) => setBillForm({...billForm, dueDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Subtotal</label><Input type="number" step="0.01" value={billForm.subtotal} onChange={(e) => { const sub = Number(e.target.value); setBillForm({...billForm, subtotal: sub, totalAmount: sub + billForm.tax}); }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Tax</label><Input type="number" step="0.01" value={billForm.tax} onChange={(e) => { const tx = Number(e.target.value); setBillForm({...billForm, tax: tx, totalAmount: billForm.subtotal + tx}); }} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Total</label><Input type="number" step="0.01" value={billForm.totalAmount} readOnly className="bg-muted" /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label><Select value={billForm.status} onValueChange={(value) => setBillForm({...billForm, status: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="posted">Posted</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium">Notes</label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2" value={billForm.notes} onChange={(e) => setBillForm({...billForm, notes: e.target.value})} placeholder="Bill notes..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowBillDialog(false)}>Cancel</Button><Button onClick={handleSaveBill} className="gradient-primary">Save Bill</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
