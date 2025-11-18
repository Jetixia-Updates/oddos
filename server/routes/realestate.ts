import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Properties
export const getProperties: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const properties = await db.collection("properties").find().sort({ createdAt: -1 }).toArray();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const createProperty: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const property = { ...req.body, propertyId: `PROP-${Date.now()}`, createdAt: new Date() };
    const result = await db.collection("properties").insertOne(property);
    res.json({ _id: result.insertedId, ...property });
  } catch (error) {
    res.status(500).json({ error: "Failed to create property" });
  }
};

export const updateProperty: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("properties").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update property" });
  }
};

export const deleteProperty: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("properties").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete property" });
  }
};

// Tenants
export const getTenants: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const tenants = await db.collection("tenants").find().sort({ moveInDate: -1 }).toArray();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
};

export const createTenant: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const tenant = { ...req.body, createdAt: new Date() };
    const result = await db.collection("tenants").insertOne(tenant);
    res.json({ _id: result.insertedId, ...tenant });
  } catch (error) {
    res.status(500).json({ error: "Failed to create tenant" });
  }
};

export const updateTenant: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("tenants").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update tenant" });
  }
};

export const deleteTenant: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("tenants").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete tenant" });
  }
};

// Leases
export const getLeases: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const leases = await db.collection("leases").find().sort({ startDate: -1 }).toArray();
    res.json(leases);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leases" });
  }
};

export const createLease: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const lease = { ...req.body, leaseId: `LSE-${Date.now()}`, createdAt: new Date() };
    const result = await db.collection("leases").insertOne(lease);
    res.json({ _id: result.insertedId, ...lease });
  } catch (error) {
    res.status(500).json({ error: "Failed to create lease" });
  }
};

export const updateLease: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("leases").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lease" });
  }
};

export const deleteLease: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("leases").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete lease" });
  }
};

export const getRealEstateAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalProperties, occupiedProperties, totalTenants] = await Promise.all([
      db.collection("properties").countDocuments(),
      db.collection("properties").countDocuments({ status: 'occupied' }),
      db.collection("tenants").countDocuments()
    ]);
    
    const leasesResult = await db.collection("leases").aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: "$monthlyRent" } } }
    ]).toArray();
    
    const monthlyRevenue = leasesResult[0]?.total || 0;
    res.json({ totalProperties, occupiedProperties, totalTenants, monthlyRevenue });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
