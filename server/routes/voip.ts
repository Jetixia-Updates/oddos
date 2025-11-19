import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Calls
export const getCalls: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const calls = await db.collection("voip_calls").find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch calls" });
  }
};

export const createCall: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const call = { 
      ...req.body, 
      callId: `CALL-${Date.now()}`,
      createdAt: new Date(),
      status: 'initiated'
    };
    const result = await db.collection("voip_calls").insertOne(call);
    res.json({ _id: result.insertedId, ...call });
  } catch (error) {
    res.status(500).json({ error: "Failed to create call" });
  }
};

export const updateCall: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("voip_calls").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update call" });
  }
};

// Phone Numbers
export const getPhoneNumbers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const numbers = await db.collection("voip_phone_numbers").find().sort({ number: 1 }).toArray();
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch phone numbers" });
  }
};

export const createPhoneNumber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const number = { ...req.body, createdAt: new Date(), status: 'active' };
    const result = await db.collection("voip_phone_numbers").insertOne(number);
    res.json({ _id: result.insertedId, ...number });
  } catch (error) {
    res.status(500).json({ error: "Failed to create phone number" });
  }
};

export const updatePhoneNumber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("voip_phone_numbers").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update phone number" });
  }
};

export const deletePhoneNumber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("voip_phone_numbers").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete phone number" });
  }
};

// Call Recordings
export const getRecordings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const recordings = await db.collection("voip_recordings").find().sort({ createdAt: -1 }).toArray();
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
};

export const createRecording: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const recording = { ...req.body, createdAt: new Date() };
    const result = await db.collection("voip_recordings").insertOne(recording);
    res.json({ _id: result.insertedId, ...recording });
  } catch (error) {
    res.status(500).json({ error: "Failed to create recording" });
  }
};

// VoIP Analytics
export const getVoIPAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalCalls, completedCalls, missedCalls, activeNumbers] = await Promise.all([
      db.collection("voip_calls").countDocuments(),
      db.collection("voip_calls").countDocuments({ status: 'completed' }),
      db.collection("voip_calls").countDocuments({ status: 'missed' }),
      db.collection("voip_phone_numbers").countDocuments({ status: 'active' })
    ]);
    
    const durationResult = await db.collection("voip_calls").aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgDuration: { $avg: "$duration" }, totalDuration: { $sum: "$duration" } } }
    ]).toArray();
    
    const avgDuration = durationResult[0]?.avgDuration || 0;
    const totalDuration = durationResult[0]?.totalDuration || 0;
    
    res.json({ totalCalls, completedCalls, missedCalls, activeNumbers, avgDuration, totalDuration });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Call Queue
export const getCallQueue: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const queue = await db.collection("voip_call_queue").find().sort({ position: 1 }).toArray();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch call queue" });
  }
};

export const addToQueue: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const queueItem = { ...req.body, createdAt: new Date(), status: 'waiting' };
    const result = await db.collection("voip_call_queue").insertOne(queueItem);
    res.json({ _id: result.insertedId, ...queueItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to add to queue" });
  }
};

// Delete Call
export const deleteCall: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("voip_calls").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete call" });
  }
};

// Delete Recording
export const deleteRecording: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("voip_recordings").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete recording" });
  }
};

// Get Active Calls (ongoing calls)
export const getActiveCalls: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const activeCalls = await db.collection("voip_calls")
      .find({ status: 'ongoing' })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(activeCalls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active calls" });
  }
};

// Transfer Call
export const transferCall: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { transferTo, transferReason } = req.body;
    
    await db.collection("voip_calls").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          transferredTo: transferTo,
          transferReason,
          transferredAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    res.json({ success: true, message: 'Call transferred successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to transfer call" });
  }
};
