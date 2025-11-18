import { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";

// Patients
export const getPatients: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const patients = await db.collection("medical_patients").find().sort({ createdAt: -1 }).toArray();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
};

export const createPatient: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const patient = { ...req.body, patientId: `PAT-${Date.now()}`, createdAt: new Date() };
    const result = await db.collection("medical_patients").insertOne(patient);
    res.json({ _id: result.insertedId, ...patient });
  } catch (error) {
    res.status(500).json({ error: "Failed to create patient" });
  }
};

export const updatePatient: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("medical_patients").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update patient" });
  }
};

export const deletePatient: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("medical_patients").deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete patient" });
  }
};

// Medical Appointments
export const getMedicalAppointments: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointments = await db.collection("medical_appointments").find().sort({ appointmentDate: -1 }).toArray();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

export const createMedicalAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointment = { ...req.body, createdAt: new Date() };
    const result = await db.collection("medical_appointments").insertOne(appointment);
    res.json({ _id: result.insertedId, ...appointment });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

export const updateMedicalAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("medical_appointments").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

// Prescriptions
export const getPrescriptions: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const prescriptions = await db.collection("prescriptions").find().sort({ dateIssued: -1 }).toArray();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
};

export const createPrescription: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const prescription = { ...req.body, dateIssued: new Date() };
    const result = await db.collection("prescriptions").insertOne(prescription);
    res.json({ _id: result.insertedId, ...prescription });
  } catch (error) {
    res.status(500).json({ error: "Failed to create prescription" });
  }
};

export const updatePrescription: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("prescriptions").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update prescription" });
  }
};

export const getMedicalAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalPatients, todayAppointments, activePrescriptions] = await Promise.all([
      db.collection("medical_patients").countDocuments(),
      db.collection("medical_appointments").countDocuments({ 
        appointmentDate: { $gte: today.toISOString() },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      db.collection("prescriptions").countDocuments()
    ]);
    
    const revenue = 0; // Placeholder
    res.json({ totalPatients, todayAppointments, activePrescriptions, revenue });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
