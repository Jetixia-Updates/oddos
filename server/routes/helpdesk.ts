import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

export const getTickets: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const tickets = await db.collection("helpdesk_tickets").find().sort({ createdAt: -1 }).toArray();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

export const createTicket: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const ticket = { ...req.body, createdAt: new Date(), ticketNumber: `TKT-${Date.now()}` };
    const result = await db.collection("helpdesk_tickets").insertOne(ticket);
    res.json({ _id: result.insertedId, ...ticket });
  } catch (error) {
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

export const updateTicket: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("helpdesk_tickets").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update ticket" });
  }
};

export const deleteTicket: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("helpdesk_tickets").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
};

export const getHelpdeskAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [total, open, inProgress, resolved] = await Promise.all([
      db.collection("helpdesk_tickets").countDocuments(),
      db.collection("helpdesk_tickets").countDocuments({ status: 'open' }),
      db.collection("helpdesk_tickets").countDocuments({ status: 'in-progress' }),
      db.collection("helpdesk_tickets").countDocuments({ status: 'resolved' })
    ]);
    res.json({ total, open, inProgress, resolved });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
