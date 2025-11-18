import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// Surveys
export const getSurveys: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const surveys = await db.collection('surveys').find().sort({ createdAt: -1 }).toArray();
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
};

export const createSurvey: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const surveyNumber = `SRV-${Date.now().toString().slice(-6)}`;
    const survey = {
      ...req.body,
      surveyNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('surveys').insertOne(survey);
    res.json({ _id: result.insertedId, ...survey });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
};

export const updateSurvey: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('surveys').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update survey' });
  }
};

export const deleteSurvey: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('surveys').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
};

// Questions
export const getQuestions: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const questions = await db.collection('survey_questions').find().sort({ order: 1 }).toArray();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const createQuestion: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const question = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('survey_questions').insertOne(question);
    res.json({ _id: result.insertedId, ...question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const updateQuestion: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    await db.collection('survey_questions').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('survey_questions').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Responses
export const getResponses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const responses = await db.collection('survey_responses').find().sort({ completedAt: -1 }).toArray();
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

export const createResponse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const response = {
      ...req.body,
      submittedAt: new Date()
    };
    const result = await db.collection('survey_responses').insertOne(response);
    res.json({ _id: result.insertedId, ...response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create response' });
  }
};

export const deleteResponse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection('survey_responses').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete response' });
  }
};

// Analytics
export const getSurveyAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const surveys = await db.collection('surveys').find().toArray();
    const responses = await db.collection('survey_responses').find().toArray();
    
    const totalSurveys = surveys.length;
    const activeSurveys = surveys.filter(s => s.status === 'published').length;
    const totalResponses = responses.length;
    
    // Calculate completion rate
    const completedResponses = responses.filter(r => r.completedAt).length;
    const avgCompletionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
    
    // Calculate average time spent
    const totalTime = responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const avgTimeSpent = totalResponses > 0 ? totalTime / totalResponses : 0;
    
    res.json({
      totalSurveys,
      activeSurveys,
      totalResponses,
      avgCompletionRate,
      avgTimeSpent
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
