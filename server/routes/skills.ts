import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getSkills: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const skills = await db.collection("skills").find().sort({ name: 1 }).toArray();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};

export const createSkill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const skill = { ...req.body, createdAt: new Date() };
    const result = await db.collection("skills").insertOne(skill);
    res.json({ _id: result.insertedId, ...skill });
  } catch (error) {
    res.status(500).json({ error: "Failed to create skill" });
  }
};

export const updateSkill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("skills").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update skill" });
  }
};

export const deleteSkill: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("skills").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete skill" });
  }
};

export const getEmployeeSkills: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const employeeSkills = await db.collection("employee_skills").find().toArray();
    res.json(employeeSkills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee skills" });
  }
};

export const assignSkillToEmployee: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const assignment = { ...req.body, createdAt: new Date() };
    const result = await db.collection("employee_skills").insertOne(assignment);
    res.json({ _id: result.insertedId, ...assignment });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign skill" });
  }
};
