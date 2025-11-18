import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointments = await db.collection("appointments").find().sort({ appointmentDate: -1 }).toArray();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

export const createAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointment = { ...req.body, createdAt: new Date() };
    const result = await db.collection("appointments").insertOne(appointment);
    res.json({ _id: result.insertedId, ...appointment });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

export const updateAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("appointments").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

export const deleteAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("appointments").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
};
