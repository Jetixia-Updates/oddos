import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Products
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const products = await db.collection("pos_products").find().sort({ name: 1 }).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching POS products:', error);
    res.json([]);
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const product = { ...req.body, createdAt: new Date() };
    const result = await db.collection("pos_products").insertOne(product);
    res.json({ _id: result.insertedId, ...product });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("pos_products").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("pos_products").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Sales
export const getSales: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const sales = await db.collection("pos_sales").find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(sales);
  } catch (error) {
    console.error('Error fetching POS sales:', error);
    res.json([]);
  }
};

export const createSale: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const sale = { 
      ...req.body, 
      receiptNumber: `RCP-${Date.now()}`,
      createdAt: new Date() 
    };
    const result = await db.collection("pos_sales").insertOne(sale);
    res.json({ _id: result.insertedId, ...sale });
  } catch (error) {
    res.status(500).json({ error: "Failed to create sale" });
  }
};

export const getPOSAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalSales, todaySales] = await Promise.all([
      db.collection("pos_sales").countDocuments(),
      db.collection("pos_sales").countDocuments({ createdAt: { $gte: today } })
    ]);
    
    const revenueResult = await db.collection("pos_sales").aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    
    const todayRevenueResult = await db.collection("pos_sales").aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();

    // Top selling products
    const topProducts = await db.collection("pos_sales").aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product.name",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.product.price", "$items.quantity"] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          sales: 1,
          revenue: 1
        }
      }
    ]).toArray();
    
    const totalRevenue = revenueResult[0]?.total || 0;
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const todayTransactions = todaySales;
    
    res.json({ 
      totalSales, 
      todaySales: todayRevenue, 
      totalRevenue, 
      todayTransactions,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching POS analytics:', error);
    res.json({ 
      totalSales: 0, 
      todaySales: 0, 
      totalRevenue: 0,
      todayTransactions: 0,
      topProducts: []
    });
  }
};

// Customers
export const getCustomers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const customers = await db.collection("pos_customers").find().sort({ name: 1 }).toArray();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching POS customers:', error);
    res.json([]);
  }
};

export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const customer = { 
      ...req.body, 
      totalPurchases: 0,
      points: 0,
      createdAt: new Date() 
    };
    const result = await db.collection("pos_customers").insertOne(customer);
    res.json({ _id: result.insertedId, ...customer });
  } catch (error) {
    console.error('Error creating POS customer:', error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("pos_customers").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating POS customer:', error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};
