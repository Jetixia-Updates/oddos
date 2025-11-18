import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// ==================== VENDORS ====================
export const getVendors: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const vendors = await db.collection("purchases_vendors").find().toArray();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

export const createVendor: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newVendor = {
      ...req.body,
      totalPurchases: 0,
      totalSpent: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("purchases_vendors").insertOne(newVendor);
    res.json({ _id: result.insertedId, ...newVendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: "Failed to create vendor" });
  }
};

export const updateVendor: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("purchases_vendors").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: "Failed to update vendor" });
  }
};

export const deleteVendor: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("purchases_vendors").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: "Failed to delete vendor" });
  }
};

// ==================== PURCHASE ORDERS ====================
export const getPurchaseOrders: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.collection("purchases_orders").find().toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
};

export const createPurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      ...req.body,
      orderNumber,
      status: req.body.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("purchases_orders").insertOne(newOrder);
    res.json({ _id: result.insertedId, ...newOrder });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ message: "Failed to create purchase order" });
  }
};

export const updatePurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("purchases_orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ message: "Failed to update purchase order" });
  }
};

export const deletePurchaseOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("purchases_orders").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ message: "Failed to delete purchase order" });
  }
};

// ==================== RFQs (Request for Quotation) ====================
export const getRFQs: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const rfqs = await db.collection("purchases_rfqs").find().toArray();
    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({ message: "Failed to fetch RFQs" });
  }
};

export const createRFQ: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const rfqNumber = `RFQ-${Date.now().toString().slice(-6)}`;
    const newRFQ = {
      ...req.body,
      rfqNumber,
      status: req.body.status || 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("purchases_rfqs").insertOne(newRFQ);
    res.json({ _id: result.insertedId, ...newRFQ });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ message: "Failed to create RFQ" });
  }
};

export const updateRFQ: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("purchases_rfqs").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating RFQ:', error);
    res.status(500).json({ message: "Failed to update RFQ" });
  }
};

// ==================== ANALYTICS ====================
export const getPurchasesAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const orders = await db.collection("purchases_orders").find().toArray();
    const vendors = await db.collection("purchases_vendors").find().toArray();
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeVendors = vendors.filter(v => v.status === 'active').length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const pendingOrders = orders.filter(o => o.status === 'draft' || o.status === 'sent').length;
    const completedOrders = orders.filter(o => o.status === 'received').length;
    
    const topVendors = vendors
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 5)
      .map(v => ({
        name: v.name,
        totalSpent: v.totalSpent || 0,
        totalOrders: v.totalPurchases || 0
      }));
    
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    res.json({
      totalOrders,
      totalSpent,
      activeVendors,
      avgOrderValue,
      pendingOrders,
      completedOrders,
      topVendors,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching purchases analytics:', error);
    res.status(500).json({ message: "Failed to fetch purchases analytics" });
  }
};
