import { RequestHandler } from "express";
import { getDatabase } from "../db/connection";
import { ObjectId } from "mongodb";

// ==================== PRODUCTS ====================
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const products = await db.collection("ecommerce_products").find().toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json([]);
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newProduct = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("ecommerce_products").insertOne(newProduct);
    res.json({ _id: result.insertedId, ...newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("ecommerce_products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("ecommerce_products").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// ==================== ORDERS ====================
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = await db.collection("ecommerce_orders").find().toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.json([]);
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Generate order number
    const orderCount = await db.collection("ecommerce_orders").countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
    
    const newOrder = {
      ...req.body,
      orderNumber,
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection("ecommerce_orders").insertOne(newOrder);
    res.json({ _id: result.insertedId, ...newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("ecommerce_orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// ==================== CUSTOMERS ====================
export const getCustomers: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const customers = await db.collection("ecommerce_customers").find().toArray();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.json([]);
  }
};

export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newCustomer = {
      ...req.body,
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("ecommerce_customers").insertOne(newCustomer);
    res.json({ _id: result.insertedId, ...newCustomer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: "Failed to create customer" });
  }
};

export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("ecommerce_customers").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: "Failed to update customer" });
  }
};

// ==================== REVIEWS ====================
export const getReviews: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const reviews = await db.collection("ecommerce_reviews").find().toArray();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.json([]);
  }
};

export const createReview: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newReview = {
      ...req.body,
      date: new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("ecommerce_reviews").insertOne(newReview);
    res.json({ _id: result.insertedId, ...newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

export const updateReview: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("ecommerce_reviews").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

// ==================== COUPONS ====================
export const getCoupons: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const coupons = await db.collection("ecommerce_coupons").find().toArray();
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.json([]);
  }
};

export const createCoupon: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const newCoupon = {
      ...req.body,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await db.collection("ecommerce_coupons").insertOne(newCoupon);
    res.json({ _id: result.insertedId, ...newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

export const updateCoupon: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("ecommerce_coupons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    res.json({ _id: id, ...updateData });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

export const deleteCoupon: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    await db.collection("ecommerce_coupons").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};

// ==================== ANALYTICS ====================
export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get total orders count
    const totalOrders = await db.collection("ecommerce_orders").countDocuments();
    
    // Get total customers count
    const totalCustomers = await db.collection("ecommerce_customers").countDocuments();
    
    // Calculate total revenue
    const orders = await db.collection("ecommerce_orders").find().toArray();
    const totalRevenue = orders.reduce((sum, order: any) => sum + (order.total || 0), 0);
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get top products by revenue
    const productSales: Record<string, { name: string; revenue: number; sales: number }> = {};
    
    orders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.productId || item.productName;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.productName,
              revenue: 0,
              sales: 0
            };
          }
          productSales[productId].revenue += item.price * item.quantity;
          productSales[productId].sales += item.quantity;
        });
      }
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get recent orders
    const recentOrders = await db.collection("ecommerce_orders")
      .find()
      .sort({ orderDate: -1 })
      .limit(10)
      .toArray();
    
    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      topProducts: [],
      recentOrders: []
    });
  }
};

// ==================== WEBSITE SETTINGS ====================
export const getWebsiteSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.collection("ecommerce_settings").findOne({ type: "website" });
    res.json(settings || {});
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.json({});
  }
};

export const saveWebsiteSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const settingsData = {
      ...req.body,
      type: "website",
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection("ecommerce_settings").updateOne(
      { type: "website" },
      { $set: settingsData },
      { upsert: true }
    );
    
    res.json({ success: true, ...settingsData });
  } catch (error) {
    console.error('Error saving website settings:', error);
    res.status(500).json({ message: "Failed to save website settings" });
  }
};
