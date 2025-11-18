import { Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { SalesOrder, QuotationItem } from '@shared/types';
import { ObjectId } from 'mongodb';

// Generate order number
async function generateOrderNumber(db: any): Promise<string> {
  const count = await db.collection('salesOrders').countDocuments();
  return `SO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
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

// Get all sales orders
export async function getSalesOrders(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { status, customer, paymentStatus } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    const orders = await db.collection<SalesOrder>('salesOrders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({ error: 'Failed to fetch sales orders' });
  }
}

// Get single sales order
export async function getSalesOrder(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const order = await db.collection<SalesOrder>('salesOrders')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!order) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching sales order:', error);
    res.status(500).json({ error: 'Failed to fetch sales order' });
  }
}

// Create sales order
export async function createSalesOrder(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const orderNumber = await generateOrderNumber(db);
    const totals = calculateTotals(req.body.items);
    
    const order: SalesOrder = {
      ...req.body,
      orderNumber,
      ...totals,
      status: 'draft',
      paymentStatus: 'unpaid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection<SalesOrder>('salesOrders').insertOne(order);
    const newOrder = await db.collection<SalesOrder>('salesOrders')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Failed to create sales order' });
  }
}

// Update sales order
export async function updateSalesOrder(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { _id, items, ...updateData } = req.body;
    
    let totals = {};
    if (items) {
      totals = calculateTotals(items);
    }
    
    const result = await db.collection<SalesOrder>('salesOrders').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, items, ...totals, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating sales order:', error);
    res.status(500).json({ error: 'Failed to update sales order' });
  }
}

// Delete sales order
export async function deleteSalesOrder(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const result = await db.collection<SalesOrder>('salesOrders')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    
    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Error deleting sales order:', error);
    res.status(500).json({ error: 'Failed to delete sales order' });
  }
}
