import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { connectToDatabase } from "./db/connection.js";
import { 
  getPatients, 
  getAppointments, 
  createPatient, 
  createAppointment,
  getHospitalStats 
} from "./routes/hospital.js";

// Sales module routes
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from "./routes/customers.js";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "./routes/products.js";
import { getQuotations, getQuotation, createQuotation, updateQuotation, deleteQuotation } from "./routes/quotations.js";
import { getSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder, deleteSalesOrder } from "./routes/salesOrders.js";
import { getSalesAnalytics } from "./routes/analytics.js";

export function createServer() {
  const app = express();

  // Initialize MongoDB connection
  connectToDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Hospital API routes
  app.get("/api/hospital/patients", getPatients);
  app.post("/api/hospital/patients", createPatient);
  app.get("/api/hospital/appointments", getAppointments);
  app.post("/api/hospital/appointments", createAppointment);
  app.get("/api/hospital/stats", getHospitalStats);

  // Sales - Customers API routes
  app.get("/api/sales/customers", getCustomers);
  app.get("/api/sales/customers/:id", getCustomer);
  app.post("/api/sales/customers", createCustomer);
  app.put("/api/sales/customers/:id", updateCustomer);
  app.delete("/api/sales/customers/:id", deleteCustomer);

  // Sales - Products API routes
  app.get("/api/sales/products", getProducts);
  app.get("/api/sales/products/:id", getProduct);
  app.post("/api/sales/products", createProduct);
  app.put("/api/sales/products/:id", updateProduct);
  app.delete("/api/sales/products/:id", deleteProduct);

  // Sales - Quotations API routes
  app.get("/api/sales/quotations", getQuotations);
  app.get("/api/sales/quotations/:id", getQuotation);
  app.post("/api/sales/quotations", createQuotation);
  app.put("/api/sales/quotations/:id", updateQuotation);
  app.delete("/api/sales/quotations/:id", deleteQuotation);

  // Sales - Orders API routes
  app.get("/api/sales/orders", getSalesOrders);
  app.get("/api/sales/orders/:id", getSalesOrder);
  app.post("/api/sales/orders", createSalesOrder);
  app.put("/api/sales/orders/:id", updateSalesOrder);
  app.delete("/api/sales/orders/:id", deleteSalesOrder);

  // Sales - Analytics API route
  app.get("/api/sales/analytics", getSalesAnalytics);

  return app;
}
