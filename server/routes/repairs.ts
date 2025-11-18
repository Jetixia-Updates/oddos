import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Get all repairs
export const getRepairs: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const repairs = await db.collection("repairs").find().sort({ receivedDate: -1 }).toArray();
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repairs" });
  }
};

// Create repair
export const createRepair: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const repair = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("repairs").insertOne(repair);
    res.json({ _id: result.insertedId, ...repair });
  } catch (error) {
    res.status(500).json({ error: "Failed to create repair" });
  }
};

// Update repair
export const updateRepair: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("repairs").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update repair" });
  }
};

// Delete repair
export const deleteRepair: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("repairs").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete repair" });
  }
};

// Get all parts
export const getParts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const parts = await db.collection("repair_parts").find().sort({ name: 1 }).toArray();
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parts" });
  }
};

// Create part
export const createPart: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const part = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("repair_parts").insertOne(part);
    res.json({ _id: result.insertedId, ...part });
  } catch (error) {
    res.status(500).json({ error: "Failed to create part" });
  }
};

// Update part
export const updatePart: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("repair_parts").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update part" });
  }
};

// Delete part
export const deletePart: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("repair_parts").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete part" });
  }
};

// Get analytics
export const getRepairAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();

    const [
      totalRepairs,
      activeRepairs,
      pendingRepairs,
      completedRepairs,
      allRepairs
    ] = await Promise.all([
      db.collection("repairs").countDocuments(),
      db.collection("repairs").countDocuments({ status: { $in: ['diagnosed', 'repairing'] } }),
      db.collection("repairs").countDocuments({ status: 'pending' }),
      db.collection("repairs").countDocuments({ status: 'completed' }),
      db.collection("repairs").find().toArray()
    ]);

    const totalRevenue = allRepairs.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);

    res.json({
      totalRepairs,
      activeRepairs,
      pendingRepairs,
      completedRepairs,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
