import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Referrals
export const getReferrals: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const referrals = await db.collection("employee_referrals").find().sort({ createdAt: -1 }).toArray();
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
};

export const createReferral: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const referral = { 
      ...req.body, 
      referralCode: `REF-${Date.now()}`,
      createdAt: new Date(),
      status: 'pending'
    };
    const result = await db.collection("employee_referrals").insertOne(referral);
    res.json({ _id: result.insertedId, ...referral });
  } catch (error) {
    res.status(500).json({ error: "Failed to create referral" });
  }
};

export const updateReferral: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("employee_referrals").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update referral" });
  }
};

export const deleteReferral: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("employee_referrals").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete referral" });
  }
};

// Referral Bonuses
export const getReferralBonuses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bonuses = await db.collection("referral_bonuses").find().sort({ createdAt: -1 }).toArray();
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bonuses" });
  }
};

export const createReferralBonus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bonus = { ...req.body, createdAt: new Date() };
    const result = await db.collection("referral_bonuses").insertOne(bonus);
    res.json({ _id: result.insertedId, ...bonus });
  } catch (error) {
    res.status(500).json({ error: "Failed to create bonus" });
  }
};

export const updateReferralBonus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("referral_bonuses").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update bonus" });
  }
};

// Referral Analytics
export const getReferralAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalReferrals, pendingReferrals, acceptedReferrals, hiredReferrals] = await Promise.all([
      db.collection("employee_referrals").countDocuments(),
      db.collection("employee_referrals").countDocuments({ status: 'pending' }),
      db.collection("employee_referrals").countDocuments({ status: 'accepted' }),
      db.collection("employee_referrals").countDocuments({ status: 'hired' })
    ]);
    
    const bonusesResult = await db.collection("referral_bonuses").aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    
    const totalBonusPaid = bonusesResult[0]?.total || 0;
    
    res.json({ 
      totalReferrals, 
      pendingReferrals, 
      acceptedReferrals, 
      hiredReferrals,
      totalBonusPaid 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Contract Templates
export const getContractTemplates: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const templates = await db.collection("contract_templates").find().sort({ name: 1 }).toArray();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

export const createContractTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const template = { ...req.body, createdAt: new Date() };
    const result = await db.collection("contract_templates").insertOne(template);
    res.json({ _id: result.insertedId, ...template });
  } catch (error) {
    res.status(500).json({ error: "Failed to create template" });
  }
};

export const updateContractTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("contract_templates").updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update template" });
  }
};

export const deleteContractTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("contract_templates").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete template" });
  }
};

// Contract Renewals
export const getContractRenewals: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const renewals = await db.collection("contract_renewals").find().sort({ renewalDate: -1 }).toArray();
    res.json(renewals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch renewals" });
  }
};

export const createContractRenewal: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const renewal = { ...req.body, createdAt: new Date() };
    const result = await db.collection("contract_renewals").insertOne(renewal);
    res.json({ _id: result.insertedId, ...renewal });
  } catch (error) {
    res.status(500).json({ error: "Failed to create renewal" });
  }
};

export const getContractsAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalContracts, activeContracts, expiringSoon, expired] = await Promise.all([
      db.collection("employee_contracts").countDocuments(),
      db.collection("employee_contracts").countDocuments({ status: 'active' }),
      db.collection("employee_contracts").countDocuments({ 
        status: 'active',
        endDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        }
      }),
      db.collection("employee_contracts").countDocuments({ status: 'expired' })
    ]);
    
    res.json({ totalContracts, activeContracts, expiringSoon, expired });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
