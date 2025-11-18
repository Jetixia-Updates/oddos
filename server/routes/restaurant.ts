import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Tables
export const getTables: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const tables = await db.collection("restaurant_tables").find().sort({ tableNumber: 1 }).toArray();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

export const createTable: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const table = { ...req.body, createdAt: new Date() };
    const result = await db.collection("restaurant_tables").insertOne(table);
    res.json({ _id: result.insertedId, ...table });
  } catch (error) {
    res.status(500).json({ error: "Failed to create table" });
  }
};

export const updateTable: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("restaurant_tables").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update table" });
  }
};

// Orders
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.collection("restaurant_orders").find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const order = { ...req.body, orderNumber: `ORD-${Date.now()}`, createdAt: new Date() };
    const result = await db.collection("restaurant_orders").insertOne(order);
    res.json({ _id: result.insertedId, ...order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("restaurant_orders").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};

// Menu Items
export const getMenuItems: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const items = await db.collection("restaurant_menu").find().sort({ category: 1, name: 1 }).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

export const createMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const item = { ...req.body, createdAt: new Date() };
    const result = await db.collection("restaurant_menu").insertOne(item);
    res.json({ _id: result.insertedId, ...item });
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
};

export const updateMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("restaurant_menu").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

export const deleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("restaurant_menu").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};

export const getRestaurantAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalOrders, activeOrders, completedOrders] = await Promise.all([
      db.collection("restaurant_orders").countDocuments(),
      db.collection("restaurant_orders").countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
      db.collection("restaurant_orders").countDocuments({ status: 'completed' })
    ]);
    
    const revenueResult = await db.collection("restaurant_orders").aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    res.json({ totalOrders, activeOrders, completedOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
