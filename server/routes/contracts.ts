import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getContracts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const contracts = await db.collection("employee_contracts").find().sort({ startDate: -1 }).toArray();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
};

export const createContract: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const contract = { ...req.body, createdAt: new Date() };
    const result = await db.collection("employee_contracts").insertOne(contract);
    res.json({ _id: result.insertedId, ...contract });
  } catch (error) {
    res.status(500).json({ error: "Failed to create contract" });
  }
};

export const updateContract: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("employee_contracts").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update contract" });
  }
};

export const deleteContract: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("employee_contracts").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contract" });
  }
};

export const getContractById: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const contract = await db.collection("employee_contracts").findOne({ _id: new ObjectId(id) });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contract" });
  }
};

export const getContractsAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalContracts, activeContracts, expiringSoon, expired] = await Promise.all([
      db.collection("employee_contracts").countDocuments(),
      db.collection("employee_contracts").countDocuments({ status: 'active' }),
      db.collection("employee_contracts").countDocuments({ 
        status: 'active',
        endDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        }
      }),
      db.collection("employee_contracts").countDocuments({ status: 'expired' })
    ]);
    
    res.json({ totalContracts, activeContracts, expiringSoon, expired });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export const renewContract: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { newEndDate, salary } = req.body;
    
    await db.collection("employee_contracts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { endDate: newEndDate, salary, status: 'active', renewedAt: new Date() } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to renew contract" });
  }
};

export const terminateContract: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { terminationReason, terminationDate } = req.body;
    
    await db.collection("employee_contracts").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'terminated', 
          terminationReason,
          terminationDate: terminationDate || new Date()
        } 
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to terminate contract" });
  }
};
