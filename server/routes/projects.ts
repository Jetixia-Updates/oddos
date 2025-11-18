import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Projects
export const getProjects: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const projects = await db.collection("projects").find().sort({ createdAt: -1 }).toArray();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const createProject: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const project = { ...req.body, createdAt: new Date() };
    const result = await db.collection("projects").insertOne(project);
    res.json({ _id: result.insertedId, ...project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("projects").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("projects").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// Tasks
export const getTasks: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const tasks = await db.collection("project_tasks").find().sort({ createdAt: -1 }).toArray();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const createTask: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const task = { ...req.body, createdAt: new Date() };
    const result = await db.collection("project_tasks").insertOne(task);
    res.json({ _id: result.insertedId, ...task });
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("project_tasks").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const getProjectsAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalProjects, activeProjects, completedProjects, totalTasks] = await Promise.all([
      db.collection("projects").countDocuments(),
      db.collection("projects").countDocuments({ status: 'in-progress' }),
      db.collection("projects").countDocuments({ status: 'completed' }),
      db.collection("project_tasks").countDocuments()
    ]);
    res.json({ totalProjects, activeProjects, completedProjects, totalTasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
