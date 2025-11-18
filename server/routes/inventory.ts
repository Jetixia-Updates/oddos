import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// ==================== PRODUCTS/ITEMS ====================
export const getInventoryItems: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const items = await db.collection("inventory_items").find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
};

export const createInventoryItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newItem = {
      ...req.body,
      currentStock: req.body.currentStock || 0,
      reservedStock: 0,
      availableStock: req.body.currentStock || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("inventory_items").insertOne(newItem);
    res.json({ _id: result.insertedId, ...newItem });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: "Failed to create inventory item" });
  }
};

export const updateInventoryItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("inventory_items").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: "Failed to update inventory item" });
  }
};

export const deleteInventoryItem: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("inventory_items").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: "Failed to delete inventory item" });
  }
};

// ==================== WAREHOUSES ====================
export const getWarehouses: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const warehouses = await db.collection("inventory_warehouses").find().toArray();
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: "Failed to fetch warehouses" });
  }
};

export const createWarehouse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newWarehouse = {
      ...req.body,
      totalItems: 0,
      totalValue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("inventory_warehouses").insertOne(newWarehouse);
    res.json({ _id: result.insertedId, ...newWarehouse });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: "Failed to create warehouse" });
  }
};

export const updateWarehouse: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("inventory_warehouses").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ message: "Failed to update warehouse" });
  }
};

// ==================== STOCK MOVEMENTS ====================
export const getStockMovements: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const movements = await db.collection("inventory_movements").find().sort({ createdAt: -1 }).toArray();
    res.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ message: "Failed to fetch stock movements" });
  }
};

export const createStockMovement: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const movementNumber = `MV-${Date.now().toString().slice(-6)}`;
    const newMovement = {
      ...req.body,
      movementNumber,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection("inventory_movements").insertOne(newMovement);
    
    // Update stock levels if movement is completed
    if (newMovement.status === 'completed') {
      const itemId = new ObjectId(newMovement.itemId);
      const item = await db.collection("inventory_items").findOne({ _id: itemId });
      
      if (item) {
        let newStock = item.currentStock;
        if (newMovement.type === 'in') {
          newStock += newMovement.quantity;
        } else if (newMovement.type === 'out') {
          newStock -= newMovement.quantity;
        }
        
        await db.collection("inventory_items").updateOne(
          { _id: itemId },
          { $set: { currentStock: newStock, availableStock: newStock - (item.reservedStock || 0) } }
        );
      }
    }
    
    res.json({ _id: result.insertedId, ...newMovement });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ message: "Failed to create stock movement" });
  }
};

export const updateStockMovement: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("inventory_movements").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating stock movement:', error);
    res.status(500).json({ message: "Failed to update stock movement" });
  }
};

// ==================== STOCK TRANSFERS ====================
export const getStockTransfers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const transfers = await db.collection("inventory_transfers").find().sort({ createdAt: -1 }).toArray();
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching stock transfers:', error);
    res.status(500).json({ message: "Failed to fetch stock transfers" });
  }
};

export const createStockTransfer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const transferNumber = `TR-${Date.now().toString().slice(-6)}`;
    const newTransfer = {
      ...req.body,
      transferNumber,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("inventory_transfers").insertOne(newTransfer);
    res.json({ _id: result.insertedId, ...newTransfer });
  } catch (error) {
    console.error('Error creating stock transfer:', error);
    res.status(500).json({ message: "Failed to create stock transfer" });
  }
};

export const updateStockTransfer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("inventory_transfers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating stock transfer:', error);
    res.status(500).json({ message: "Failed to update stock transfer" });
  }
};

// ==================== ANALYTICS ====================
export const getInventoryAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const items = await db.collection("inventory_items").find().toArray();
    const warehouses = await db.collection("inventory_warehouses").find().toArray();
    const movements = await db.collection("inventory_movements").find().toArray();
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + ((item.currentStock || 0) * (item.unitCost || 0)), 0);
    const lowStockItems = items.filter(item => item.currentStock <= item.minStock).length;
    const outOfStockItems = items.filter(item => item.currentStock === 0).length;
    
    const stockByWarehouse = warehouses.map(wh => ({
      name: wh.name,
      capacity: wh.capacity || 0,
      used: items.filter(item => item.warehouseId === wh._id.toString()).reduce((sum, item) => sum + item.currentStock, 0)
    }));
    
    const recentMovements = movements.slice(0, 10);
    
    res.json({
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalWarehouses: warehouses.length,
      stockByWarehouse,
      recentMovements
    });
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ message: "Failed to fetch inventory analytics" });
  }
};
