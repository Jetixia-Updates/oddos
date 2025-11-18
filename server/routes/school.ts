import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Students
export const getStudents: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const students = await db.collection("students").find().sort({ enrollmentDate: -1 }).toArray();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const createStudent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const student = { ...req.body, studentId: `STU-${Date.now()}`, enrollmentDate: new Date() };
    const result = await db.collection("students").insertOne(student);
    res.json({ _id: result.insertedId, ...student });
  } catch (error) {
    res.status(500).json({ error: "Failed to create student" });
  }
};

export const updateStudent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("students").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update student" });
  }
};

export const deleteStudent: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("students").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
};

// Classes
export const getClasses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const classes = await db.collection("classes").find().sort({ gradeLevel: 1, name: 1 }).toArray();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

export const createClass: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const classData = { ...req.body, createdAt: new Date() };
    const result = await db.collection("classes").insertOne(classData);
    res.json({ _id: result.insertedId, ...classData });
  } catch (error) {
    res.status(500).json({ error: "Failed to create class" });
  }
};

export const updateClass: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("classes").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update class" });
  }
};

export const deleteClass: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("classes").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete class" });
  }
};

// Grades
export const getGrades: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const grades = await db.collection("grades").find().sort({ academicYear: -1, semester: -1 }).toArray();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grades" });
  }
};

export const createGrade: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const grade = { ...req.body, createdAt: new Date() };
    const result = await db.collection("grades").insertOne(grade);
    res.json({ _id: result.insertedId, ...grade });
  } catch (error) {
    res.status(500).json({ error: "Failed to create grade" });
  }
};

export const updateGrade: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("grades").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update grade" });
  }
};

export const getSchoolAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const [totalStudents, totalClasses] = await Promise.all([
      db.collection("students").countDocuments({ status: 'active' }),
      db.collection("classes").countDocuments()
    ]);
    const totalTeachers = 0; // Placeholder
    const avgAttendance = 85; // Placeholder
    res.json({ totalStudents, totalClasses, totalTeachers, avgAttendance });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
