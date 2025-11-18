import { Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { Product } from '@shared/types';
import { ObjectId } from 'mongodb';

// Get all products
export async function getProducts(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { category, isActive } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const products = await db.collection<Product>('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// Get single product
export async function getProduct(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const product = await db.collection<Product>('products')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

// Create product
export async function createProduct(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const product: Product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection<Product>('products').insertOne(product);
    const newProduct = await db.collection<Product>('products')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

// Update product
export async function updateProduct(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const { _id, ...updateData } = req.body;
    
    const result = await db.collection<Product>('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

// Delete product
export async function deleteProduct(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const result = await db.collection<Product>('products')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}
