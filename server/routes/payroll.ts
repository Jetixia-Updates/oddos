import { RequestHandler } from "express";
import { getDatabase } from "../db";
import { ObjectId } from "mongodb";

// Payroll Records
export const getPayrollRecords: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const records = await db.collection('payroll_records').find().sort({ payPeriodStart: -1 }).toArray();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
};

export const createPayrollRecord: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const payrollNumber = `PAY-${Date.now().toString().slice(-6)}`;
    
    // Calculate totals
    const basicSalary = req.body.basicSalary || 0;
    const allowances = req.body.allowances || 0;
    const deductions = req.body.deductions || 0;
    const tax = req.body.tax || 0;
    const grossPay = basicSalary + allowances;
    const netPay = grossPay - deductions - tax;
    
    const record = { 
      ...req.body,
      payrollNumber,
      grossPay,
      netPay,
      status: req.body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('payroll_records').insertOne(record);
    res.json({ _id: result.insertedId, ...record });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payroll record' });
  }
};

export const updatePayrollRecord: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    // Recalculate if needed
    const basicSalary = req.body.basicSalary || 0;
    const allowances = req.body.allowances || 0;
    const deductions = req.body.deductions || 0;
    const tax = req.body.tax || 0;
    const grossPay = basicSalary + allowances;
    const netPay = grossPay - deductions - tax;
    
    const update = { 
      ...req.body, 
      grossPay,
      netPay,
      updatedAt: new Date() 
    };
    await db.collection('payroll_records').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payroll record' });
  }
};

export const deletePayrollRecord: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('payroll_records').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payroll record' });
  }
};

// Salary Components
export const getSalaryComponents: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const components = await db.collection('payroll_salary_components').find().toArray();
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch salary components' });
  }
};

export const createSalaryComponent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const component = { 
      ...req.body,
      status: req.body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('payroll_salary_components').insertOne(component);
    res.json({ _id: result.insertedId, ...component });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create salary component' });
  }
};

export const updateSalaryComponent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('payroll_salary_components').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update salary component' });
  }
};

export const deleteSalaryComponent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('payroll_salary_components').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete salary component' });
  }
};

// Tax Rules
export const getTaxRules: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const rules = await db.collection('payroll_tax_rules').find().toArray();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tax rules' });
  }
};

export const createTaxRule: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const rule = { 
      ...req.body,
      status: req.body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('payroll_tax_rules').insertOne(rule);
    res.json({ _id: result.insertedId, ...rule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tax rule' });
  }
};

export const updateTaxRule: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('payroll_tax_rules').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tax rule' });
  }
};

export const deleteTaxRule: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('payroll_tax_rules').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tax rule' });
  }
};

// Bonuses
export const getBonuses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bonuses = await db.collection('payroll_bonuses').find().sort({ date: -1 }).toArray();
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
};

export const createBonus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bonusNumber = `BON-${Date.now().toString().slice(-6)}`;
    const bonus = { 
      ...req.body,
      bonusNumber,
      status: req.body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('payroll_bonuses').insertOne(bonus);
    res.json({ _id: result.insertedId, ...bonus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bonus' });
  }
};

export const updateBonus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('payroll_bonuses').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bonus' });
  }
};

export const deleteBonus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('payroll_bonuses').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bonus' });
  }
};

// Analytics
export const getPayrollAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [records, bonuses, components] = await Promise.all([
      db.collection('payroll_records').find().toArray(),
      db.collection('payroll_bonuses').find().toArray(),
      db.collection('payroll_salary_components').find().toArray()
    ]);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const currentMonthRecords = records.filter(r => {
      const recordDate = new Date(r.payPeriodStart);
      return recordDate >= currentMonth;
    });

    const totalPayroll = currentMonthRecords.reduce((sum, r) => sum + (r.netPay || 0), 0);
    const totalGross = currentMonthRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0);
    const totalDeductions = currentMonthRecords.reduce((sum, r) => sum + (r.deductions || 0), 0);
    const totalTax = currentMonthRecords.reduce((sum, r) => sum + (r.tax || 0), 0);
    const totalBonuses = bonuses.filter(b => b.status === 'approved').reduce((sum, b) => sum + (b.amount || 0), 0);
    
    const processedPayroll = currentMonthRecords.filter(r => r.status === 'paid').length;
    const pendingPayroll = currentMonthRecords.filter(r => r.status === 'draft' || r.status === 'approved').length;
    
    const avgSalary = currentMonthRecords.length > 0 
      ? totalPayroll / currentMonthRecords.length 
      : 0;

    res.json({
      totalPayroll,
      totalGross,
      totalDeductions,
      totalTax,
      totalBonuses,
      processedPayroll,
      pendingPayroll,
      avgSalary,
      employeeCount: currentMonthRecords.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
