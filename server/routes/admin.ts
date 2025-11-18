import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Users
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.collection("users").find().sort({ createdAt: -1 }).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const user = { ...req.body, createdAt: new Date(), lastLogin: null };
    const result = await db.collection("users").insertOne(user);
    res.json({ _id: result.insertedId, ...user });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Roles
export const getRoles: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const roles = await db.collection("roles").find().sort({ name: 1 }).toArray();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

export const createRole: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const role = { ...req.body, createdAt: new Date() };
    const result = await db.collection("roles").insertOne(role);
    res.json({ _id: result.insertedId, ...role });
  } catch (error) {
    res.status(500).json({ error: "Failed to create role" });
  }
};

export const updateRole: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("roles").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
};

export const deleteRole: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("roles").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
};

export const getAdminAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalUsers, activeUsers, totalRoles] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("users").countDocuments({ status: 'active' }),
      db.collection("roles").countDocuments()
    ]);
    const activeSessions = activeUsers; // Simplified
    res.json({ totalUsers, activeUsers, totalRoles, activeSessions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
