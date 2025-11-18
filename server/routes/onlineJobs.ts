import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getJobs: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const jobs = await db.collection("online_jobs").find().sort({ postedDate: -1 }).toArray();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const createJob: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const job = { ...req.body, postedDate: new Date(), createdAt: new Date() };
    const result = await db.collection("online_jobs").insertOne(job);
    res.json({ _id: result.insertedId, ...job });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

export const updateJob: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("online_jobs").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

export const deleteJob: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("online_jobs").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};

export const getApplications: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const applications = await db.collection("job_applications").find().sort({ appliedDate: -1 }).toArray();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

export const createApplication: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const application = { ...req.body, appliedDate: new Date(), createdAt: new Date() };
    const result = await db.collection("job_applications").insertOne(application);
    res.json({ _id: result.insertedId, ...application });
  } catch (error) {
    res.status(500).json({ error: "Failed to create application" });
  }
};
