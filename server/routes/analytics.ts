import { Request, Response } from 'express';
import { getDatabase } from '../db/connection.js';
import { SalesAnalytics } from '@shared/types';

export async function getSalesAnalytics(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    
    // Get total revenue and orders
    const ordersCollection = db.collection('salesOrders');
    const orders = await ordersCollection.find({ status: { $ne: 'cancelled' } }).toArray();
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    
    // Get total customers
    const totalCustomers = await db.collection('customers').countDocuments();
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate conversion rate (customers who placed orders)
    const customersWithOrders = new Set(orders.map(o => o.customer)).size;
    const conversionRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
    
    // Get top products
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const productId = item.product;
        const existing = productSales.get(productId) || { 
          name: item.productName || 'Unknown', 
          quantity: 0, 
          revenue: 0 
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        productSales.set(productId, existing);
      });
    });
    
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get top customers
    const customerSales = new Map<string, { name: string; orders: number; revenue: number }>();
    
    orders.forEach(order => {
      const customerId = order.customer;
      const existing = customerSales.get(customerId) || { 
        name: order.customerName || 'Unknown', 
        orders: 0, 
        revenue: 0 
      };
      existing.orders += 1;
      existing.revenue += order.total;
      customerSales.set(customerId, existing);
    });
    
    const topCustomers = Array.from(customerSales.entries())
      .map(([customerId, data]) => ({
        customerId,
        customerName: data.name,
        orders: data.orders,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get revenue by month (last 12 months)
    const revenueByMonth = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      revenueByMonth.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length,
      });
    }
    
    const analytics: SalesAnalytics = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      conversionRate,
      topProducts,
      topCustomers,
      revenueByMonth,
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
}
