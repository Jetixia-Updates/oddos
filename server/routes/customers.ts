import { Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { Customer } from '@shared/types';
import { ObjectId } from 'mongodb';

// Get all customers
export async function getCustomers(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { type, status } = req.query;
    
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const customers = await db.collection<Customer>('customers')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

// Get single customer
export async function getCustomer(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const customer = await db.collection<Customer>('customers')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
}

// Create customer
export async function createCustomer(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const customer: Customer = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection<Customer>('customers').insertOne(customer);
    const newCustomer = await db.collection<Customer>('customers')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

// Update customer
export async function updateCustomer(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection<Customer>('customers').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

// Delete customer
export async function deleteCustomer(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const result = await db.collection<Customer>('customers')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}
