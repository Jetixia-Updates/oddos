import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// ==================== BILL OF MATERIALS (BOM) ====================
export const getBOMs: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const boms = await db.collection("manufacturing_boms").find().toArray();
    res.json(boms);
  } catch (error) {
    console.error('Error fetching BOMs:', error);
    res.status(500).json({ message: "Failed to fetch BOMs" });
  }
};

export const createBOM: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const bomNumber = `BOM-${Date.now().toString().slice(-6)}`;
    const newBOM = {
      ...req.body,
      bomNumber,
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("manufacturing_boms").insertOne(newBOM);
    res.json({ _id: result.insertedId, ...newBOM });
  } catch (error) {
    console.error('Error creating BOM:', error);
    res.status(500).json({ message: "Failed to create BOM" });
  }
};

export const updateBOM: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("manufacturing_boms").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating BOM:', error);
    res.status(500).json({ message: "Failed to update BOM" });
  }
};

export const deleteBOM: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("manufacturing_boms").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "BOM deleted successfully" });
  } catch (error) {
    console.error('Error deleting BOM:', error);
    res.status(500).json({ message: "Failed to delete BOM" });
  }
};

// ==================== PRODUCTION ORDERS ====================
export const getProductionOrders: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.collection("manufacturing_orders").find().toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching production orders:', error);
    res.status(500).json({ message: "Failed to fetch production orders" });
  }
};

export const createProductionOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orderNumber = `MO-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      ...req.body,
      orderNumber,
      status: req.body.status || 'draft',
      producedQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("manufacturing_orders").insertOne(newOrder);
    res.json({ _id: result.insertedId, ...newOrder });
  } catch (error) {
    console.error('Error creating production order:', error);
    res.status(500).json({ message: "Failed to create production order" });
  }
};

export const updateProductionOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("manufacturing_orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating production order:', error);
    res.status(500).json({ message: "Failed to update production order" });
  }
};

export const deleteProductionOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("manufacturing_orders").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Production order deleted successfully" });
  } catch (error) {
    console.error('Error deleting production order:', error);
    res.status(500).json({ message: "Failed to delete production order" });
  }
};

// ==================== WORK ORDERS ====================
export const getWorkOrders: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const workOrders = await db.collection("manufacturing_workorders").find().toArray();
    res.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ message: "Failed to fetch work orders" });
  }
};

export const createWorkOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const workOrderNumber = `WO-${Date.now().toString().slice(-6)}`;
    const newWorkOrder = {
      ...req.body,
      workOrderNumber,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("manufacturing_workorders").insertOne(newWorkOrder);
    res.json({ _id: result.insertedId, ...newWorkOrder });
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(500).json({ message: "Failed to create work order" });
  }
};

export const updateWorkOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("manufacturing_workorders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating work order:', error);
    res.status(500).json({ message: "Failed to update work order" });
  }
};

// ==================== QUALITY CHECKS ====================
export const getQualityChecks: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const checks = await db.collection("manufacturing_quality_checks").find().toArray();
    res.json(checks);
  } catch (error) {
    console.error('Error fetching quality checks:', error);
    res.status(500).json({ message: "Failed to fetch quality checks" });
  }
};

export const createQualityCheck: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const checkNumber = `QC-${Date.now().toString().slice(-6)}`;
    const newCheck = {
      ...req.body,
      checkNumber,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("manufacturing_quality_checks").insertOne(newCheck);
    res.json({ _id: result.insertedId, ...newCheck });
  } catch (error) {
    console.error('Error creating quality check:', error);
    res.status(500).json({ message: "Failed to create quality check" });
  }
};

export const updateQualityCheck: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("manufacturing_quality_checks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating quality check:', error);
    res.status(500).json({ message: "Failed to update quality check" });
  }
};

// ==================== ANALYTICS ====================
export const getManufacturingAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const orders = await db.collection("manufacturing_orders").find().toArray();
    const workOrders = await db.collection("manufacturing_workorders").find().toArray();
    const qualityChecks = await db.collection("manufacturing_quality_checks").find().toArray();
    
    const totalProduction = orders.reduce((sum, order) => sum + (order.producedQuantity || 0), 0);
    const activeOrders = orders.filter(o => o.status === 'in_progress').length;
    const completedOrders = orders.filter(o => o.status === 'done').length;
    const qualityPassRate = qualityChecks.length > 0 
      ? (qualityChecks.filter(qc => qc.result === 'pass').length / qualityChecks.length) * 100 
      : 0;
    
    const productionByProduct = orders.reduce((acc: any[], order) => {
      const existing = acc.find(p => p.product === order.productName);
      if (existing) {
        existing.quantity += order.producedQuantity || 0;
      } else {
        acc.push({ product: order.productName, quantity: order.producedQuantity || 0 });
      }
      return acc;
    }, []).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    res.json({
      totalProduction,
      activeOrders,
      completedOrders,
      qualityPassRate,
      totalWorkOrders: workOrders.length,
      pendingQualityChecks: qualityChecks.filter(qc => qc.status === 'pending').length,
      productionByProduct,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching manufacturing analytics:', error);
    res.status(500).json({ message: "Failed to fetch manufacturing analytics" });
  }
};
