// Shared types for the entire application

export interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  type: 'lead' | 'customer' | 'partner';
  status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  assignedTo?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  _id?: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  image?: string;
  isActive: boolean;
  tax?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuotationItem {
  product: string; // Product ID
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface Quotation {
  _id?: string;
  quotationNumber: string;
  customer: string; // Customer ID
  customerName?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  notes?: string;
  terms?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalesOrder {
  _id?: string;
  orderNumber: string;
  quotationId?: string;
  customer: string; // Customer ID
  customerName?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: 'draft' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod?: string;
  deliveryDate?: Date;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  salesOrderId?: string;
  customer: string; // Customer ID
  customerName?: string;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    orders: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}
