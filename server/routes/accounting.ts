import { RequestHandler } from "express";
import { getDatabase } from "../db";
import { ObjectId } from "mongodb";

// Chart of Accounts
export const getAccounts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const accounts = await db.collection('accounting_accounts').find().toArray();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const createAccount: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const accountNumber = `ACC-${Date.now().toString().slice(-6)}`;
    const account = { 
      ...req.body, 
      accountNumber,
      balance: req.body.balance || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('accounting_accounts').insertOne(account);
    res.json({ _id: result.insertedId, ...account });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const updateAccount: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('accounting_accounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

export const deleteAccount: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('accounting_accounts').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Journal Entries
export const getJournalEntries: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const entries = await db.collection('accounting_journal_entries').find().sort({ entryDate: -1 }).toArray();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

export const createJournalEntry: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const entryNumber = `JE-${Date.now().toString().slice(-6)}`;
    const entry = { 
      ...req.body, 
      entryNumber,
      status: req.body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('accounting_journal_entries').insertOne(entry);
    res.json({ _id: result.insertedId, ...entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
};

export const updateJournalEntry: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('accounting_journal_entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
};

export const deleteJournalEntry: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('accounting_journal_entries').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
};

// Invoices
export const getInvoices: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const invoices = await db.collection('accounting_invoices').find().sort({ invoiceDate: -1 }).toArray();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const createInvoice: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoice = { 
      ...req.body, 
      invoiceNumber,
      status: req.body.status || 'draft',
      paidAmount: req.body.paidAmount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('accounting_invoices').insertOne(invoice);
    res.json({ _id: result.insertedId, ...invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('accounting_invoices').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('accounting_invoices').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

// Bills
export const getBills: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bills = await db.collection('accounting_bills').find().sort({ billDate: -1 }).toArray();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const createBill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const billNumber = `BILL-${Date.now().toString().slice(-6)}`;
    const bill = { 
      ...req.body, 
      billNumber,
      status: req.body.status || 'draft',
      paidAmount: req.body.paidAmount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('accounting_bills').insertOne(bill);
    res.json({ _id: result.insertedId, ...bill });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
};

export const updateBill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('accounting_bills').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bill' });
  }
};

export const deleteBill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('accounting_bills').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bill' });
  }
};

// Analytics
export const getAccountingAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [invoices, bills, accounts] = await Promise.all([
      db.collection('accounting_invoices').find().toArray(),
      db.collection('accounting_bills').find().toArray(),
      db.collection('accounting_accounts').find().toArray()
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalExpenses = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalReceivables = invoices.filter(i => i.status !== 'paid').reduce((sum, inv) => sum + ((inv.totalAmount || 0) - (inv.paidAmount || 0)), 0);
    const totalPayables = bills.filter(b => b.status !== 'paid').reduce((sum, bill) => sum + ((bill.totalAmount || 0) - (bill.paidAmount || 0)), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const overdueInvoices = invoices.filter(i => 
      i.status !== 'paid' && new Date(i.dueDate) < new Date()
    ).length;
    
    const overdueBills = bills.filter(b => 
      b.status !== 'paid' && new Date(b.dueDate) < new Date()
    ).length;

    const cashBalance = accounts
      .filter(a => a.accountType === 'cash' || a.accountType === 'bank')
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalReceivables,
      totalPayables,
      cashBalance,
      overdueInvoices,
      overdueBills,
      profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
