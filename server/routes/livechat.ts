import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Chat Conversations
export const getConversations: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const conversations = await db.collection("chat_conversations").find().sort({ lastMessageAt: -1 }).toArray();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const createConversation: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const conversation = { 
      ...req.body, 
      createdAt: new Date(),
      lastMessageAt: new Date(),
      status: 'active'
    };
    const result = await db.collection("chat_conversations").insertOne(conversation);
    res.json({ _id: result.insertedId, ...conversation });
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const updateConversation: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("chat_conversations").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update conversation" });
  }
};

// Chat Messages
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { conversationId } = req.query;
    const query = conversationId ? { conversationId } : {};
    const messages = await db.collection("chat_messages").find(query).sort({ createdAt: -1 }).limit(100).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const message = { 
      ...req.body, 
      createdAt: new Date(),
      status: 'sent'
    };
    const result = await db.collection("chat_messages").insertOne(message);
    
    // Update conversation last message time
    if (message.conversationId) {
      await db.collection("chat_conversations").updateOne(
        { _id: new ObjectId(message.conversationId) },
        { $set: { lastMessageAt: new Date() } }
      );
    }
    
    res.json({ _id: result.insertedId, ...message });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Chat Operators
export const getOperators: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const operators = await db.collection("chat_operators").find().toArray();
    res.json(operators);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch operators" });
  }
};

export const createOperator: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const operator = { ...req.body, createdAt: new Date(), status: 'offline' };
    const result = await db.collection("chat_operators").insertOne(operator);
    res.json({ _id: result.insertedId, ...operator });
  } catch (error) {
    res.status(500).json({ error: "Failed to create operator" });
  }
};

export const updateOperatorStatus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { status } = req.body;
    await db.collection("chat_operators").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, lastSeen: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update operator status" });
  }
};

// Chat Analytics
export const getChatAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalConversations, activeConversations, totalMessages, onlineOperators] = await Promise.all([
      db.collection("chat_conversations").countDocuments(),
      db.collection("chat_conversations").countDocuments({ status: 'active' }),
      db.collection("chat_messages").countDocuments(),
      db.collection("chat_operators").countDocuments({ status: 'online' })
    ]);
    
    res.json({ totalConversations, activeConversations, totalMessages, onlineOperators });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Canned Responses
export const getCannedResponses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const responses = await db.collection("chat_canned_responses").find().sort({ title: 1 }).toArray();
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch canned responses" });
  }
};

export const createCannedResponse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const response = { ...req.body, createdAt: new Date() };
    const result = await db.collection("chat_canned_responses").insertOne(response);
    res.json({ _id: result.insertedId, ...response });
  } catch (error) {
    res.status(500).json({ error: "Failed to create canned response" });
  }
};

export const updateCannedResponse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("chat_canned_responses").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update canned response" });
  }
};

export const deleteCannedResponse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("chat_canned_responses").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete canned response" });
  }
};
