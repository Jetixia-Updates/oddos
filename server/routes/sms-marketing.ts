import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Get all campaigns
export const getCampaigns: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const campaigns = await db.collection("sms_campaigns").find().sort({ createdAt: -1 }).toArray();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

// Create campaign
export const createCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const campaign = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("sms_campaigns").insertOne(campaign);
    res.json({ _id: result.insertedId, ...campaign });
  } catch (error) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
};

// Update campaign
export const updateCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("sms_campaigns").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update campaign" });
  }
};

// Delete campaign
export const deleteCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("sms_campaigns").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
};

// Launch campaign
export const launchCampaign: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    // Get campaign
    const campaign = await db.collection("sms_campaigns").findOne({ _id: new ObjectId(id) });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Get recipients
    let recipients: any[] = [];
    if (campaign.targetAudience === 'all') {
      recipients = await db.collection("sms_contacts").find({ optIn: true }).toArray();
    } else if (campaign.groupId) {
      recipients = await db.collection("sms_contacts").find({ 
        groupId: campaign.groupId,
        optIn: true 
      }).toArray();
    }

    // Create messages
    const messages = recipients.map(recipient => ({
      campaignId: campaign._id,
      recipient: recipient.phone,
      message: campaign.message,
      status: campaign.scheduledDate ? 'scheduled' : 'pending',
      senderId: campaign.senderId || 'DEFAULT',
      scheduledAt: campaign.scheduledDate ? new Date(campaign.scheduledDate) : null,
      sentAt: new Date(),
      createdAt: new Date()
    }));

    if (messages.length > 0) {
      await db.collection("sms_messages").insertMany(messages);
    }

    // Update campaign status
    await db.collection("sms_campaigns").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: campaign.scheduledDate ? 'scheduled' : 'sending',
          launchedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.json({ success: true, messagesSent: messages.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to launch campaign" });
  }
};

// Get all contacts
export const getContacts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const contacts = await db.collection("sms_contacts").find().sort({ createdAt: -1 }).toArray();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// Create contact
export const createContact: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const contact = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("sms_contacts").insertOne(contact);
    res.json({ _id: result.insertedId, ...contact });
  } catch (error) {
    res.status(500).json({ error: "Failed to create contact" });
  }
};

// Update contact
export const updateContact: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("sms_contacts").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// Delete contact
export const deleteContact: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("sms_contacts").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

// Get all groups
export const getGroups: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const groups = await db.collection("sms_groups").find().sort({ createdAt: -1 }).toArray();
    
    // Add member count to each group
    const groupsWithCount = await Promise.all(groups.map(async (group) => {
      const memberCount = await db.collection("sms_contacts").countDocuments({ groupId: group._id.toString() });
      return { ...group, memberCount };
    }));
    
    res.json(groupsWithCount);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Create group
export const createGroup: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const group = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("sms_groups").insertOne(group);
    res.json({ _id: result.insertedId, ...group });
  } catch (error) {
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Update group
export const updateGroup: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("sms_groups").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Delete group
export const deleteGroup: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("sms_groups").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete group" });
  }
};

// Get all templates
export const getTemplates: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const templates = await db.collection("sms_templates").find().sort({ createdAt: -1 }).toArray();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

// Create template
export const createTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const template = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("sms_templates").insertOne(template);
    res.json({ _id: result.insertedId, ...template });
  } catch (error) {
    res.status(500).json({ error: "Failed to create template" });
  }
};

// Update template
export const updateTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection("sms_templates").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update template" });
  }
};

// Delete template
export const deleteTemplate: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("sms_templates").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete template" });
  }
};

// Get all messages
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const messages = await db.collection("sms_messages").find().sort({ sentAt: -1 }).limit(1000).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send SMS
export const sendSMS: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { recipients, message, scheduledDate, scheduledTime, senderId, campaignId } = req.body;

    const messages = recipients.map((recipient: string) => ({
      campaignId: campaignId || null,
      recipient: recipient.trim(),
      message,
      status: scheduledDate ? 'scheduled' : 'pending',
      senderId: senderId || 'DEFAULT',
      scheduledAt: scheduledDate ? new Date(`${scheduledDate}T${scheduledTime}`) : null,
      sentAt: new Date(),
      createdAt: new Date()
    }));

    await db.collection("sms_messages").insertMany(messages);

    // Simulate sending (in production, integrate with Twilio/AWS SNS/etc)
    setTimeout(async () => {
      await db.collection("sms_messages").updateMany(
        { status: 'pending' },
        { 
          $set: { 
            status: 'delivered',
            deliveredAt: new Date()
          }
        }
      );
    }, 2000);

    res.json({ success: true, messagesSent: messages.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to send SMS" });
  }
};

// Get analytics
export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();

    const [
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      optInContacts,
      allMessages
    ] = await Promise.all([
      db.collection("sms_campaigns").countDocuments(),
      db.collection("sms_campaigns").countDocuments({ status: { $in: ['sending', 'scheduled'] } }),
      db.collection("sms_contacts").countDocuments(),
      db.collection("sms_contacts").countDocuments({ optIn: true }),
      db.collection("sms_messages").find().toArray()
    ]);

    const totalMessagesSent = allMessages.length;
    const deliveredMessages = allMessages.filter(m => m.status === 'delivered').length;
    const deliveryRate = totalMessagesSent > 0 ? (deliveredMessages / totalMessagesSent) * 100 : 0;

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      optInContacts,
      totalMessagesSent,
      deliveryRate
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Get campaign reports
export const getCampaignReports: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const messages = await db.collection("sms_messages").find({ 
      campaignId: new ObjectId(id) 
    }).toArray();

    const totalSent = messages.length;
    const delivered = messages.filter(m => m.status === 'delivered').length;
    const failed = messages.filter(m => m.status === 'failed').length;
    const pending = messages.filter(m => m.status === 'pending').length;

    res.json({
      totalSent,
      delivered,
      failed,
      pending,
      deliveryRate: totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(2) : 0,
      messages: messages.slice(0, 100) // Return last 100 messages
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign reports" });
  }
};
