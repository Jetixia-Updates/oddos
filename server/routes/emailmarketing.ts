import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Email Campaigns
export const getCampaigns: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const campaigns = await db.collection("email_campaigns").find().sort({ createdAt: -1 }).toArray();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

export const createCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const campaign = { 
      ...req.body, 
      campaignId: `EMAIL-${Date.now()}`,
      createdAt: new Date(),
      status: 'draft'
    };
    const result = await db.collection("email_campaigns").insertOne(campaign);
    res.json({ _id: result.insertedId, ...campaign });
  } catch (error) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

export const updateCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_campaigns").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update campaign" });
  }
};

export const deleteCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_campaigns").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
};

export const launchCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_campaigns").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'sending', launchedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};

// Email Lists
export const getLists: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const lists = await db.collection("email_lists").find().sort({ name: 1 }).toArray();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lists" });
  }
};

export const createList: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const list = { ...req.body, createdAt: new Date(), subscriberCount: 0 };
    const result = await db.collection("email_lists").insertOne(list);
    res.json({ _id: result.insertedId, ...list });
  } catch (error) {
    res.status(500).json({ error: "Failed to create list" });
  }
};

export const updateList: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_lists").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update list" });
  }
};

export const deleteList: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_lists").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete list" });
  }
};

// Subscribers
export const getSubscribers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const subscribers = await db.collection("email_subscribers").find().sort({ subscribedAt: -1 }).toArray();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

export const createSubscriber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const subscriber = { ...req.body, subscribedAt: new Date(), status: 'active' };
    const result = await db.collection("email_subscribers").insertOne(subscriber);
    res.json({ _id: result.insertedId, ...subscriber });
  } catch (error) {
    res.status(500).json({ error: "Failed to create subscriber" });
  }
};

export const updateSubscriber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_subscribers").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update subscriber" });
  }
};

export const deleteSubscriber: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_subscribers").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
};

// Email Templates
export const getTemplates: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const templates = await db.collection("email_templates").find().sort({ name: 1 }).toArray();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

export const createTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const template = { ...req.body, createdAt: new Date() };
    const result = await db.collection("email_templates").insertOne(template);
    res.json({ _id: result.insertedId, ...template });
  } catch (error) {
    res.status(500).json({ error: "Failed to create template" });
  }
};

export const updateTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_templates").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update template" });
  }
};

export const deleteTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("email_templates").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete template" });
  }
};

// Email Analytics
export const getEmailAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalCampaigns, activeCampaigns, totalSubscribers, totalSent] = await Promise.all([
      db.collection("email_campaigns").countDocuments(),
      db.collection("email_campaigns").countDocuments({ status: 'sending' }),
      db.collection("email_subscribers").countDocuments({ status: 'active' }),
      db.collection("email_sent").countDocuments()
    ]);
    
    const statsResult = await db.collection("email_sent").aggregate([
      { $group: { 
        _id: null, 
        opened: { $sum: { $cond: ["$opened", 1, 0] } },
        clicked: { $sum: { $cond: ["$clicked", 1, 0] } },
        bounced: { $sum: { $cond: ["$bounced", 1, 0] } }
      }}
    ]).toArray();
    
    const stats = statsResult[0] || { opened: 0, clicked: 0, bounced: 0 };
    
    res.json({ 
      totalCampaigns, 
      activeCampaigns, 
      totalSubscribers, 
      totalSent,
      openRate: totalSent > 0 ? (stats.opened / totalSent * 100).toFixed(2) : 0,
      clickRate: totalSent > 0 ? (stats.clicked / totalSent * 100).toFixed(2) : 0,
      bounceRate: totalSent > 0 ? (stats.bounced / totalSent * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Send Email
export const sendEmail: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const email = { ...req.body, sentAt: new Date(), status: 'sent' };
    const result = await db.collection("email_sent").insertOne(email);
    res.json({ _id: result.insertedId, ...email });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
};
