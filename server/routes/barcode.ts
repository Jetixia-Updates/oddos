import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const products = await db.collection("barcode_products").find().sort({ name: 1 }).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const product = { ...req.body, createdAt: new Date() };
    const result = await db.collection("barcode_products").insertOne(product);
    res.json({ _id: result.insertedId, ...product });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("barcode_products").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("barcode_products").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const getScans: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const scans = await db.collection("barcode_scans").find().sort({ scannedAt: -1 }).limit(100).toArray();
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scans" });
  }
};

export const createScan: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const scan = { ...req.body, scannedAt: new Date() };
    const result = await db.collection("barcode_scans").insertOne(scan);
    res.json({ _id: result.insertedId, ...scan });
  } catch (error) {
    res.status(500).json({ error: "Failed to create scan" });
  }
};
