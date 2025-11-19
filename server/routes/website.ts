import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Pages
export const getPages: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const pages = await db.collection("website_pages").find().sort({ createdAt: -1 }).toArray();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
};

export const createPage: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const page = { 
      ...req.body, 
      slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      status: 'draft'
    };
    const result = await db.collection("website_pages").insertOne(page);
    res.json({ _id: result.insertedId, ...page });
  } catch (error) {
    res.status(500).json({ error: "Failed to create page" });
  }
};

export const updatePage: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_pages").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update page" });
  }
};

export const deletePage: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_pages").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete page" });
  }
};

export const publishPage: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_pages").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'published', publishedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to publish page" });
  }
};

// Menus
export const getMenus: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const menus = await db.collection("website_menus").find().sort({ position: 1 }).toArray();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menus" });
  }
};

export const createMenu: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const menu = { ...req.body, createdAt: new Date() };
    const result = await db.collection("website_menus").insertOne(menu);
    res.json({ _id: result.insertedId, ...menu });
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu" });
  }
};

export const updateMenu: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_menus").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update menu" });
  }
};

export const deleteMenu: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_menus").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete menu" });
  }
};

// Blocks/Sections
export const getBlocks: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const blocks = await db.collection("website_blocks").find().sort({ name: 1 }).toArray();
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blocks" });
  }
};

export const createBlock: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const block = { ...req.body, createdAt: new Date() };
    const result = await db.collection("website_blocks").insertOne(block);
    res.json({ _id: result.insertedId, ...block });
  } catch (error) {
    res.status(500).json({ error: "Failed to create block" });
  }
};

export const updateBlock: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_blocks").updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update block" });
  }
};

export const deleteBlock: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("website_blocks").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete block" });
  }
};

// Website Settings
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.collection("website_settings").findOne({ type: 'general' });
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    await db.collection("website_settings").updateOne(
      { type: 'general' },
      { $set: { ...req.body, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// Website Analytics
export const getWebsiteAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalPages, publishedPages, draftPages, totalVisits] = await Promise.all([
      db.collection("website_pages").countDocuments(),
      db.collection("website_pages").countDocuments({ status: 'published' }),
      db.collection("website_pages").countDocuments({ status: 'draft' }),
      db.collection("website_visits").countDocuments()
    ]);
    
    res.json({ totalPages, publishedPages, draftPages, totalVisits });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Forms
export const getForms: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const forms = await db.collection("website_forms").find().sort({ name: 1 }).toArray();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

export const createForm: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const form = { ...req.body, createdAt: new Date() };
    const result = await db.collection("website_forms").insertOne(form);
    res.json({ _id: result.insertedId, ...form });
  } catch (error) {
    res.status(500).json({ error: "Failed to create form" });
  }
};

export const getFormSubmissions: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { formId } = req.query;
    const query = formId ? { formId } : {};
    const submissions = await db.collection("website_form_submissions").find(query).sort({ submittedAt: -1 }).toArray();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch form submissions" });
  }
};
