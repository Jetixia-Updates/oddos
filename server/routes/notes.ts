import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getNotes: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const notes = await db.collection("notes").find().sort({ updatedAt: -1 }).toArray();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const createNote: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const note = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("notes").insertOne(note);
    res.json({ _id: result.insertedId, ...note });
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const updateNote: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("notes").updateOne({ _id: new ObjectId(id) }, { $set: { ...req.body, updatedAt: new Date() } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("notes").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
};
