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
