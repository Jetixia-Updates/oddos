import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// ==================== LEADS ====================
export const getLeads: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const leads = await db.collection("crm_leads").find().toArray();
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

export const createLead: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newLead = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("crm_leads").insertOne(newLead);
    res.json({ _id: result.insertedId, ...newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: "Failed to create lead" });
  }
};

export const updateLead: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("crm_leads").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: "Failed to update lead" });
  }
};

export const deleteLead: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("crm_leads").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: "Failed to delete lead" });
  }
};

// ==================== OPPORTUNITIES ====================
export const getOpportunities: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const opportunities = await db.collection("crm_opportunities").find().toArray();
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: "Failed to fetch opportunities" });
  }
};

export const createOpportunity: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newOpportunity = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("crm_opportunities").insertOne(newOpportunity);
    res.json({ _id: result.insertedId, ...newOpportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: "Failed to create opportunity" });
  }
};

export const updateOpportunity: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("crm_opportunities").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: "Failed to update opportunity" });
  }
};

export const deleteOpportunity: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("crm_opportunities").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: "Failed to delete opportunity" });
  }
};

// ==================== ACTIVITIES ====================
export const getActivities: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const activities = await db.collection("crm_activities").find().toArray();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

export const createActivity: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newActivity = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("crm_activities").insertOne(newActivity);
    res.json({ _id: result.insertedId, ...newActivity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: "Failed to create activity" });
  }
};

export const updateActivity: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("crm_activities").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: "Failed to update activity" });
  }
};

// ==================== CONTACTS ====================
export const getContacts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const contacts = await db.collection("crm_contacts").find().toArray();
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

export const createContact: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newContact = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("crm_contacts").insertOne(newContact);
    res.json({ _id: result.insertedId, ...newContact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: "Failed to create contact" });
  }
};

export const updateContact: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("crm_contacts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// ==================== ANALYTICS ====================
export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get basic counts
    const totalLeads = await db.collection("crm_leads").countDocuments();
    const totalOpportunities = await db.collection("crm_opportunities").countDocuments();
    
    // Calculate total pipeline value
    const opportunities = await db.collection("crm_opportunities").find().toArray();
    const totalValue = opportunities.reduce((sum, opp: any) => sum + (opp.value || 0), 0);
    
    // Calculate conversion rate
    const wonOpportunities = await db.collection("crm_opportunities").countDocuments({ stage: 'won' });
    const conversionRate = totalLeads > 0 ? (wonOpportunities / totalLeads * 100).toFixed(1) : '0.0';
    
    // Lead sources distribution
    const leadsAgg = await db.collection("crm_leads").aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]).toArray();
    
    const leadSources = leadsAgg.map((item: any) => ({
      source: item._id || 'unknown',
      count: item.count
    }));
    
    // Opportunity pipeline by stage
    const oppAgg = await db.collection("crm_opportunities").aggregate([
      { $group: { _id: "$stage", value: { $sum: "$value" }, count: { $sum: 1 } } }
    ]).toArray();
    
    const opportunityPipeline = oppAgg.map((item: any) => ({
      stage: item._id || 'unknown',
      value: item.value || 0,
      count: item.count
    }));
    
    // Recent activities
    const recentActivities = await db.collection("crm_activities")
      .find()
      .sort({ dueDate: -1 })
      .limit(10)
      .toArray();
    
    res.json({
      totalLeads,
      totalOpportunities,
      totalValue,
      conversionRate,
      leadSources,
      opportunityPipeline,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
