import { RequestHandler } from "express";
import { getDatabase } from "../db.js";

// Get all hospital patients
export const getPatients: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const patients = await db.collection('patients').find({}).toArray();
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
};

// Get all appointments
export const getAppointments: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointments = await db.collection('appointments').find({}).toArray();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
};

// Create new patient
export const createPatient: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const patientData = req.body;
    
    const result = await db.collection('patients').insertOne({
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ success: true, data: { id: result.insertedId, ...patientData } });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ success: false, error: 'Failed to create patient' });
  }
};

// Create new appointment
export const createAppointment: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const appointmentData = req.body;
    
    const result = await db.collection('appointments').insertOne({
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({ success: true, data: { id: result.insertedId, ...appointmentData } });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
};

// Get hospital statistics
export const getHospitalStats: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [patientsCount, appointmentsCount, todayAppointments] = await Promise.all([
      db.collection('patients').countDocuments(),
      db.collection('appointments').countDocuments(),
      db.collection('appointments').countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalPatients: patientsCount,
        totalAppointments: appointmentsCount,
        todayAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching hospital stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};
