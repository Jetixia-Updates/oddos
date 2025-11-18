import { Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { Quotation, QuotationItem } from '@shared/types';
import { ObjectId } from 'mongodb';

// Generate quotation number
async function generateQuotationNumber(db: any): Promise<string> {
  const count = await db.collection('quotations').countDocuments();
  return `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
}

// Calculate totals
function calculateTotals(items: QuotationItem[]) {
  const subtotal = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const discountAmount = itemSubtotal * (item.discount / 100);
    return sum + (itemSubtotal - discountAmount);
  }, 0);

  const taxAmount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const discountAmount = itemSubtotal * (item.discount / 100);
    const taxableAmount = itemSubtotal - discountAmount;
    return sum + (taxableAmount * (item.tax / 100));
  }, 0);

  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total, discountAmount: 0 };
}

// Get all quotations
export async function getQuotations(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { status, customer } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    
    const quotations = await db.collection<Quotation>('quotations')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
}

// Get single quotation
export async function getQuotation(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const quotation = await db.collection<Quotation>('quotations')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: 'Failed to fetch quotation' });
  }
}

// Create quotation
export async function createQuotation(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const quotationNumber = await generateQuotationNumber(db);
    const totals = calculateTotals(req.body.items);
    
    const quotation: Quotation = {
      ...req.body,
      quotationNumber,
      ...totals,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection<Quotation>('quotations').insertOne(quotation);
    const newQuotation = await db.collection<Quotation>('quotations')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
}

// Update quotation
export async function updateQuotation(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { _id, items, ...updateData } = req.body;
    
    let totals = {};
    if (items) {
      totals = calculateTotals(items);
    }
    
    const result = await db.collection<Quotation>('quotations').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, items, ...totals, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ error: 'Failed to update quotation' });
  }
}

// Delete quotation
export async function deleteQuotation(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const result = await db.collection<Quotation>('quotations')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ error: 'Failed to delete quotation' });
  }
}
