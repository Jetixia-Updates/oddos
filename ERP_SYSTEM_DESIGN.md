# Enterprise Resource Planning (ERP) System - Design & Specification

## System Overview

A complete, modular ERP system designed for multi-domain businesses including Trading, Manufacturing, Services, HR, Medical, Schools, Real Estate, and Restaurants. The system follows Odoo's design patterns with a card-based layout, quiet colors, and intuitive user interfaces.

---

## Architecture Overview

```
ERP System
├── Core Infrastructure
│   ├── User Management & Authentication
│   ├── Permission System (Role-Based Access Control)
│   ├── Audit Trail & Logging
│   ├── Dashboard & Analytics
│   └── Settings & Configuration
├── Sales & Marketing
│   ├── CRM Module
│   └── Sales Module
├── Procurement & Supply Chain
│   ├── Purchases Module
│   └── Inventory Module
├── Finance & Accounting
│   ├── Accounting Module
│   └── Payroll Module
├── Human Resources
│   └── HR Module
├── Operations
│   ├── Projects Module
│   ├── Manufacturing Module
│   ├── POS Module
│   └── Services Module
├── Vertical Solutions
│   ├── School Management
│   ├── Medical Management
│   ├── Real Estate
│   └── Restaurant & Food Ordering
├── Customer Support
│   ├── Helpdesk Module
│   └── E-Commerce Module
└── System Administration
    └── Administration & Permissions Module
```

---

# MODULE SPECIFICATIONS

## 1. CRM (Customer Relationship Management)

### Summary

Manage all customer interactions, sales leads, opportunities, and customer communications in one centralized platform.

### Database Schema

#### Customers Table

```sql
- id (Primary Key)
- name (String) - Company/Individual name
- email (String, Unique)
- phone (String)
- address (Text)
- city (String)
- country (String)
- customer_type (Enum: Individual, Company)
- credit_limit (Decimal)
- payment_terms (Foreign Key → Payment Terms)
- last_interaction (DateTime)
- lifetime_value (Decimal) - Calculated
- status (Enum: Active, Inactive, Suspended)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Leads Table

```sql
- id (Primary Key)
- name (String)
- email (String)
- phone (String)
- company (String)
- source (Enum: Website, Email, Phone, Referral, Advertisement, Cold Call)
- assigned_to (Foreign Key → Sales Rep)
- status (Enum: New, Qualified, Contacted, Proposal Sent, Negotiation, Won, Lost)
- expected_revenue (Decimal)
- lead_score (Integer: 0-100)
- probability (Percent)
- expected_close_date (Date)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Opportunities Table

```sql
- id (Primary Key)
- name (String)
- customer_id (Foreign Key → Customers)
- lead_id (Foreign Key → Leads, Nullable)
- assigned_to (Foreign Key → Sales Rep)
- stage (Enum: Prospecting, Analysis, Proposal, Negotiation, Commitment, Won, Lost)
- amount (Decimal)
- probability (Percent)
- expected_close_date (Date)
- sales_rep_id (Foreign Key → Users)
- notes (Text)
- activities_count (Integer) - Calculated
- created_at (DateTime)
- updated_at (DateTime)
```

#### Activities Table

```sql
- id (Primary Key)
- opportunity_id (Foreign Key → Opportunities, Nullable)
- customer_id (Foreign Key → Customers, Nullable)
- lead_id (Foreign Key → Leads, Nullable)
- type (Enum: Email, Phone Call, Meeting, Task, Note)
- subject (String)
- description (Text)
- due_date (DateTime)
- assigned_to (Foreign Key → Users)
- done (Boolean)
- status (Enum: Pending, Completed, Cancelled)
- created_at (DateTime)
- updated_at (DateTime)
```

### UI Views

1. **Dashboard**: Sales pipeline, lead conversion funnel, top customers, revenue forecast
2. **Customers List**: Sortable table with filters (status, credit limit, city)
3. **Customer Form**: Full customer details, interactions history, linked opportunities
4. **Leads List**: Kanban board by source and status
5. **Leads Form**: Lead details, scoring system, automated conversion
6. **Opportunities List**: Kanban by stage with drag-and-drop
7. **Opportunities Form**: Full opportunity details, activities timeline, related documents
8. **Activities Timeline**: All interactions linked to customer/lead/opportunity

### Actions & Automations

- Auto-score leads based on engagement (email opens, form submissions, profile views)
- Auto-convert qualified leads to opportunities
- Send follow-up reminders for overdue activities
- Generate proposals automatically when opportunity reaches "Proposal" stage
- Send automatic emails on lead assignment

### User Permissions

- CRM Manager: Full access to all CRM data, can manage teams and reports
- Sales Rep: Can only see assigned customers, leads, and opportunities
- Team Lead: Can see team members' data and generate reports
- Customer Portal: Limited access to view own opportunities and related documents

### Workflow State Machine

```
LEADS: New → Qualified → Contacted → Proposal Sent → Negotiation → Won/Lost
OPPORTUNITIES: Prospecting → Analysis → Proposal → Negotiation → Commitment → Won/Lost
ACTIVITIES: Pending → Completed/Cancelled
```

### ERD Relationships

```
Customers 1←→N Opportunities
Customers 1←→N Activities
Leads 1←→N Opportunities (Optional)
Leads 1←→N Activities
Opportunities 1←→N Activities
Users 1←→N Opportunities (assigned_to)
Users 1←→N Activities (assigned_to)
```

### Ninja Dashboard Example

- **Total Customers**: KPI card showing growth percentage
- **Pipeline Value**: Gauge chart showing current vs. target
- **Lead Conversion Rate**: Line chart over time
- **Top 5 Opportunities**: Table with amounts and probabilities
- **Activity Heatmap**: Shows busiest days/times
- **Revenue Forecast**: Animated bar chart by month with confidence intervals

---

## 2. Sales Module

### Summary

Manage quotations, sales orders, and invoices with integrated workflow from opportunity to revenue recognition.

### Database Schema

#### Quotations Table

```sql
- id (Primary Key)
- quote_number (String, Unique)
- customer_id (Foreign Key → Customers)
- opportunity_id (Foreign Key → Opportunities)
- quote_date (Date)
- expiry_date (Date)
- validity_period (Integer) - Days
- status (Enum: Draft, Sent, Confirmed, Won, Cancelled, Expired)
- assigned_to (Foreign Key → Sales Rep)
- discount_type (Enum: Percent, Fixed Amount)
- discount_value (Decimal)
- tax_amount (Decimal) - Calculated
- total_amount (Decimal) - Calculated
- notes (Text)
- terms_and_conditions (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Quotation Items Table

```sql
- id (Primary Key)
- quotation_id (Foreign Key → Quotations)
- product_id (Foreign Key → Products)
- description (String, Optional override)
- quantity (Decimal)
- unit_price (Decimal)
- discount (Percent)
- line_total (Decimal) - Calculated
- sequence (Integer) - For ordering items
```

#### Sales Orders Table

```sql
- id (Primary Key)
- order_number (String, Unique)
- customer_id (Foreign Key → Customers)
- quotation_id (Foreign Key → Quotations, Nullable)
- order_date (Date)
- required_delivery_date (Date)
- sales_rep_id (Foreign Key → Sales Rep)
- warehouse_id (Foreign Key → Warehouses, Nullable)
- status (Enum: Draft, Confirmed, Processing, Partly Shipped, Shipped, Delivered, Cancelled)
- payment_status (Enum: Not Paid, Partially Paid, Fully Paid)
- shipping_address (Text)
- delivery_address (Text)
- incoterm (Enum: FOB, CIF, EXW, etc.)
- transportation_method (Enum: Ground, Air, Sea, Railway)
- subtotal (Decimal) - Calculated
- shipping_cost (Decimal)
- tax_amount (Decimal)
- total_amount (Decimal) - Calculated
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Sales Order Items Table

```sql
- id (Primary Key)
- sales_order_id (Foreign Key → Sales Orders)
- product_id (Foreign Key → Products)
- description (String, Optional)
- quantity (Decimal)
- unit_price (Decimal)
- discount (Percent)
- line_total (Decimal) - Calculated
- shipped_quantity (Decimal)
- remaining_quantity (Decimal) - Calculated
- sequence (Integer)
```

### UI Views

1. **Sales Dashboard**: Sales by product, revenue trends, top customers, fulfillment rate
2. **Quotations List**: Table/Kanban by status, quick filters
3. **Quotation Form**: Customer selection, items, automatic calculations, PDF preview
4. **Sales Orders List**: Timeline/Kanban view, fulfillment status indicators
5. **Sales Order Form**: Full order details, linked quotation, shipment tracking
6. **Invoices List**: Payment status indicators, aging report
7. **Invoice Form**: Auto-generated from SO, payment tracking

### Actions & Automations

- Auto-create sales order from confirmed quotation
- Auto-create invoice from confirmed sales order
- Send quotation PDF by email automatically
- Send order confirmation and shipment notifications
- Auto-generate packing slips and shipping labels
- Apply automatic discounts based on customer tier and order value
- Send late payment reminders

### User Permissions

- Sales Manager: Full access, can approve discounts above threshold
- Sales Rep: Can create and manage own quotations and orders
- Finance: View-only access to orders and invoices
- Warehouse: Can see pending orders and update shipment status
- Accounts: Can view and manage invoices

### Workflow State Machine

```
QUOTATIONS: Draft → Sent → Confirmed → Won (or Cancelled/Expired)
SALES ORDERS: Draft → Confirmed → Processing → Partly Shipped → Shipped → Delivered (or Cancelled)
PAYMENT STATUS: Not Paid → Partially Paid → Fully Paid
```

### ERD Relationships

```
Quotations 1←→N Quotation Items
Quotations N←→1 Customers
Quotations N←→1 Opportunities
Sales Orders 1←→N Sales Order Items
Sales Orders N←→1 Customers
Sales Orders N←→1 Quotations (Optional)
Sales Order Items N←→1 Products
Quotation Items N←→1 Products
```

### Ninja Dashboard Example

- **Total Sales Value**: KPI with month-over-month growth
- **Orders Pipeline**: Funnel chart showing order progression
- **Top 10 Products**: Horizontal bar chart by revenue
- **Sales by Region**: Geographic map or donut chart
- **Fulfillment Rate**: Gauge showing percentage shipped on time
- **Revenue Forecast**: Animated projection based on open orders

---

## 3. Purchases Module

### Summary

Manage purchase orders, vendor relationships, and procurement workflows.

### Database Schema

#### Vendors Table

```sql
- id (Primary Key)
- name (String)
- email (String)
- phone (String)
- address (Text)
- city (String)
- country (String)
- vendor_type (Enum: Supplier, Manufacturer, Distributor, Service Provider)
- payment_terms (Foreign Key → Payment Terms)
- lead_time (Integer) - Days
- rating (Decimal: 1-5)
- status (Enum: Active, Inactive, Blocked)
- primary_contact (String)
- tax_id (String)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Purchase Requisitions Table

```sql
- id (Primary Key)
- requisition_number (String, Unique)
- requested_by (Foreign Key → Users)
- department_id (Foreign Key → Departments, Nullable)
- required_date (Date)
- purpose (Text)
- status (Enum: Draft, Submitted, Approved, Rejected, Cancelled)
- approved_by (Foreign Key → Users, Nullable)
- approval_date (DateTime, Nullable)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Purchase Requisition Items Table

```sql
- id (Primary Key)
- requisition_id (Foreign Key → Purchase Requisitions)
- product_id (Foreign Key → Products)
- quantity (Decimal)
- estimated_unit_price (Decimal)
- notes (Text)
- sequence (Integer)
```

#### Purchase Orders Table

```sql
- id (Primary Key)
- po_number (String, Unique)
- vendor_id (Foreign Key → Vendors)
- requisition_id (Foreign Key → Purchase Requisitions, Nullable)
- order_date (Date)
- expected_delivery_date (Date)
- ordered_by (Foreign Key → Users)
- status (Enum: Draft, Sent, Confirmed, Partly Received, Received, Cancelled)
- payment_status (Enum: Not Paid, Partially Paid, Fully Paid)
- payment_method (Enum: Bank Transfer, Credit Card, Cash, Check)
- warehouse_id (Foreign Key → Warehouses)
- subtotal (Decimal)
- shipping_cost (Decimal)
- tax_amount (Decimal)
- total_cost (Decimal)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Purchase Order Items Table

```sql
- id (Primary Key)
- purchase_order_id (Foreign Key → Purchase Orders)
- product_id (Foreign Key → Products)
- quantity (Decimal)
- unit_price (Decimal)
- received_quantity (Decimal)
- remaining_quantity (Decimal)
- line_total (Decimal)
- sequence (Integer)
```

#### Goods Receipt Notes (GRN) Table

```sql
- id (Primary Key)
- grn_number (String, Unique)
- purchase_order_id (Foreign Key → Purchase Orders)
- received_date (Date)
- received_by (Foreign Key → Users)
- warehouse_id (Foreign Key → Warehouses)
- notes (Text)
- status (Enum: Draft, Received, Inspected, Rejected)
- created_at (DateTime)
- updated_at (DateTime)
```

### UI Views

1. **Purchase Dashboard**: Spend analysis, supplier performance, cost trends
2. **Vendors List**: Table with ratings and payment terms
3. **Vendor Form**: Contact details, performance metrics, payment history
4. **Purchase Requisitions**: List and form for internal requests
5. **Purchase Orders List**: Status filters, timeline view
6. **Purchase Order Form**: Auto-calculated costs, payment tracking
7. **GRN (Goods Receipt) Form**: Inspection and quality checks

### Actions & Automations

- Auto-send purchase orders to vendor emails
- Auto-generate GRN from confirmed PO
- Request quotations from multiple vendors
- Auto-create payment schedule based on payment terms
- Send delivery reminders to vendors
- Auto-block vendors with quality issues
- Compare supplier quotes and recommend best option

### User Permissions

- Procurement Manager: Full access, can approve POs
- Buyer: Can create and send purchase orders
- Warehouse: Can receive goods and create GRNs
- Finance: Can view POs and manage payments
- Department Head: Can submit purchase requisitions

### Workflow State Machine

```
REQUISITIONS: Draft → Submitted → Approved (or Rejected)
PURCHASE ORDERS: Draft → Sent → Confirmed → Partly Received → Received (or Cancelled)
GRN: Draft → Received → Inspected (or Rejected)
```

---

## 4. Inventory Module

### Summary

Complete inventory management including stock tracking, warehouse management, and stock movements.

### Database Schema

#### Products Table

```sql
- id (Primary Key)
- sku (String, Unique)
- name (String)
- description (Text)
- category_id (Foreign Key → Product Categories)
- unit_of_measure (Enum: Piece, Kg, Liter, Meter, etc.)
- cost_price (Decimal)
- selling_price (Decimal)
- reorder_level (Decimal)
- reorder_quantity (Decimal)
- weight (Decimal)
- dimensions (String) - L x W x H
- barcode (String, Nullable)
- supplier_id (Foreign Key → Vendors, Nullable)
- is_active (Boolean)
- is_serialized (Boolean) - For tracking serial numbers
- batch_tracking (Boolean) - For expiration dates
- image_url (String, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Stock/Inventory Table

```sql
- id (Primary Key)
- product_id (Foreign Key → Products)
- warehouse_id (Foreign Key → Warehouses)
- quantity_on_hand (Decimal)
- quantity_reserved (Decimal)
- quantity_available (Decimal) - Calculated: on_hand - reserved
- quantity_in_transit (Decimal)
- last_count_date (Date)
- reorder_level (Decimal)
- reorder_quantity (Decimal)
- updated_at (DateTime)
```

#### Warehouses Table

```sql
- id (Primary Key)
- name (String)
- code (String, Unique)
- address (Text)
- city (String)
- is_default (Boolean)
- manager_id (Foreign Key → Users)
- capacity (Decimal)
- current_usage (Decimal) - Calculated
- status (Enum: Active, Inactive)
- created_at (DateTime)
```

#### Stock Movements Table

```sql
- id (Primary Key)
- product_id (Foreign Key → Products)
- warehouse_id (Foreign Key → Warehouses)
- type (Enum: Purchase Receipt, Sales Dispatch, Adjustment, Transfer, Consumption, Damage)
- quantity (Decimal)
- reference_type (String) - PO, SO, Adjustment, etc.
- reference_id (String) - ID of the referenced document
- movement_date (DateTime)
- created_by (Foreign Key → Users)
- reason (Text, Nullable)
- notes (Text, Nullable)
- created_at (DateTime)
```

#### Stock Transfers Table

```sql
- id (Primary Key)
- transfer_number (String, Unique)
- from_warehouse_id (Foreign Key → Warehouses)
- to_warehouse_id (Foreign Key → Warehouses)
- transfer_date (Date)
- expected_arrival_date (Date)
- status (Enum: Draft, Sent, In Transit, Received, Cancelled)
- created_by (Foreign Key → Users)
- approved_by (Foreign Key → Users, Nullable)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Stock Transfer Items Table

```sql
- id (Primary Key)
- transfer_id (Foreign Key → Stock Transfers)
- product_id (Foreign Key → Products)
- quantity (Decimal)
- received_quantity (Decimal)
- sequence (Integer)
```

#### Stock Count (Cycle Count) Table

```sql
- id (Primary Key)
- count_number (String, Unique)
- warehouse_id (Foreign Key → Warehouses)
- count_date (Date)
- counted_by (Foreign Key → Users)
- approved_by (Foreign Key → Users, Nullable)
- status (Enum: Draft, In Progress, Completed, Approved)
- variance_percentage (Decimal) - Calculated
- notes (Text)
- created_at (DateTime)
```

### UI Views

1. **Inventory Dashboard**: Stock health, low stock alerts, inventory turnover, valuation
2. **Product Catalog List**: Filterable table with SKU, price, stock level
3. **Product Form**: Full product details, images, supplier info, pricing history
4. **Stock Levels**: Real-time view of each warehouse stock
5. **Stock Movements**: Timeline of all movements with filters
6. **Stock Transfers**: List and form for inter-warehouse transfers
7. **Cycle Count**: Form for physical inventory counting
8. **Warehouse Manager**: Visual floor plan with stock levels by location

### Actions & Automations

- Auto-create purchase order when stock falls below reorder level
- Auto-reserve stock when sales order is confirmed
- Auto-release reservation when order is shipped
- Send low stock alerts to warehouse manager
- Auto-calculate reorder point based on demand forecast
- Generate inventory valuation reports (FIFO, LIFO, Weighted Average)
- Flag slow-moving items for review
- Auto-archive products with no movement for 12 months

### User Permissions

- Inventory Manager: Full access to all inventory functions
- Warehouse Staff: Can perform stock movements and transfers
- Purchase Manager: Can view stock levels and create POs
- Sales: View-only access to stock availability
- Auditor: View-only access with historical data

### Workflow State Machine

```
STOCK TRANSFERS: Draft → Sent → In Transit → Received (or Cancelled)
CYCLE COUNT: Draft → In Progress → Completed → Approved
STOCK MOVEMENTS: Immediate (no workflow)
```

---

## 5. Accounting Module

### Summary

Complete financial management including general ledger, accounts receivable/payable, and financial reporting.

### Database Schema

#### Chart of Accounts Table

```sql
- id (Primary Key)
- account_code (String, Unique)
- account_name (String)
- account_type (Enum: Asset, Liability, Equity, Revenue, Expense, Cost of Goods Sold)
- account_category (Enum: Current Asset, Fixed Asset, Current Liability, Long-term Liability, etc.)
- parent_account_id (Foreign Key → Chart of Accounts, Nullable) - For hierarchy
- is_active (Boolean)
- is_header (Boolean) - For summary accounts
- opening_balance (Decimal)
- created_at (DateTime)
```

#### Journal Entries Table

```sql
- id (Primary Key)
- entry_number (String, Unique)
- journal_id (Foreign Key → Journals)
- entry_date (Date)
- posted_date (Date, Nullable)
- description (String)
- reference (String, Nullable) - Invoice #, PO #, etc.
- posted (Boolean)
- status (Enum: Draft, Posted)
- created_by (Foreign Key → Users)
- posted_by (Foreign Key → Users, Nullable)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Journal Entry Lines Table

```sql
- id (Primary Key)
- journal_entry_id (Foreign Key ��� Journal Entries)
- account_id (Foreign Key → Chart of Accounts)
- debit (Decimal)
- credit (Decimal)
- description (String, Nullable)
- cost_center_id (Foreign Key → Cost Centers, Nullable)
- sequence (Integer)
```

#### Journals Table

```sql
- id (Primary Key)
- name (String)
- code (String, Unique)
- type (Enum: General, Sales, Purchase, Cash, Bank)
- is_active (Boolean)
- sequence (Integer)
```

#### Invoices (AP/AR) Table

```sql
- id (Primary Key)
- invoice_number (String, Unique)
- invoice_type (Enum: Sales Invoice, Purchase Invoice, Credit Note, Debit Note)
- party_id (Foreign Key → Customers/Vendors)
- invoice_date (Date)
- due_date (Date)
- status (Enum: Draft, Submitted, Confirmed, Partially Paid, Fully Paid, Cancelled, Overdue)
- amount (Decimal)
- paid_amount (Decimal)
- remaining_amount (Decimal)
- tax_amount (Decimal)
- reference_number (String, Nullable)
- description (Text)
- notes (Text)
- created_at (DateTime)
```

#### Payments Table

```sql
- id (Primary Key)
- payment_number (String, Unique)
- invoice_id (Foreign Key → Invoices)
- payment_date (Date)
- payment_method (Enum: Bank Transfer, Cash, Check, Credit Card, Online)
- amount (Decimal)
- reference_number (String, Nullable)
- bank_account_id (Foreign Key → Bank Accounts, Nullable)
- created_by (Foreign Key → Users)
- notes (Text)
- created_at (DateTime)
```

#### Bank Accounts Table

```sql
- id (Primary Key)
- bank_name (String)
- account_number (String, Unique)
- account_name (String)
- currency (String)
- account_type (Enum: Checking, Savings, Credit Card)
- opening_balance (Decimal)
- current_balance (Decimal)
- is_active (Boolean)
- reconciliation_date (Date)
```

#### Cost Centers Table

```sql
- id (Primary Key)
- code (String, Unique)
- name (String)
- description (Text)
- manager_id (Foreign Key → Users)
- budget (Decimal, Nullable)
- is_active (Boolean)
```

### UI Views

1. **Accounting Dashboard**: Cash flow, AP/AR aging, bank balance, financial ratio KPIs
2. **Chart of Accounts**: Hierarchical list with balances
3. **General Ledger**: Filtered view by account with detailed transactions
4. **Journal Entries**: List and form for manual entries
5. **Accounts Receivable**: Aging report, customer statements, payment tracking
6. **Accounts Payable**: Vendor statements, payment schedules, outstanding invoices
7. **Trial Balance**: Debit/Credit comparison report
8. **Financial Statements**: P&L, Balance Sheet, Cash Flow Statement
9. **Bank Reconciliation**: Match bank statement with journal entries
10. **Reports**: Comprehensive financial reporting

### Actions & Automations

- Auto-create journal entries from sales/purchase invoices
- Auto-create payments from bank deposits
- Auto-reconcile matched transactions
- Auto-generate payment reminders for overdue invoices
- Auto-calculate late payment interest
- Auto-generate tax reports (GST, VAT)
- Auto-calculate financial ratios and alerts on anomalies
- Auto-generate consolidated financial statements

### User Permissions

- Accountant: Can create and post journal entries
- Finance Manager: Full access, approves invoices and payments
- CFO: Full access including financial statements
- Bank: View-only access to reconciliation
- Audit: View-only with full history access

### Workflow State Machine

```
INVOICES: Draft → Submitted → Confirmed → Partially Paid → Fully Paid (or Cancelled)
JOURNAL ENTRIES: Draft → Posted
PAYMENTS: Pending → Processed
```

---

## 6. HR (Human Resources) Module

### Summary

Complete HR management including employee data, attendance, leaves, and performance management.

### Database Schema

#### Employees Table

```sql
- id (Primary Key)
- employee_id (String, Unique)
- first_name (String)
- last_name (String)
- email (String, Unique)
- phone (String)
- date_of_birth (Date)
- gender (Enum: Male, Female, Other)
- address (Text)
- city (String)
- country (String)
- nationality (String)
- marital_status (Enum: Single, Married, Divorced, Widowed)
- date_of_joining (Date)
- date_of_leaving (Date, Nullable)
- employee_type (Enum: Full-time, Part-time, Contractual, Intern)
- department_id (Foreign Key → Departments)
- designation_id (Foreign Key → Designations)
- manager_id (Foreign Key → Employees, Nullable)
- employment_status (Enum: Active, On Leave, Suspended, Resigned, Retired)
- identification_number (String, Nullable) - Passport, National ID, etc.
- bank_account (String, Nullable)
- pfund_account (String, Nullable)
- photograph_url (String, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Departments Table

```sql
- id (Primary Key)
- name (String, Unique)
- code (String, Unique)
- manager_id (Foreign Key → Employees, Nullable)
- parent_department_id (Foreign Key → Departments, Nullable)
- is_active (Boolean)
- created_at (DateTime)
```

#### Designations Table

```sql
- id (Primary Key)
- name (String)
- grade (String, Nullable)
- description (Text)
- category (Enum: Management, Staff, Worker, Intern)
- is_active (Boolean)
- created_at (DateTime)
```

#### Attendance Table

```sql
- id (Primary Key)
- employee_id (Foreign Key → Employees)
- attendance_date (Date)
- check_in_time (DateTime)
- check_out_time (DateTime)
- working_hours (Decimal) - Calculated
- status (Enum: Present, Absent, Half Day, Late, On Leave, Excused Absence)
- notes (String, Nullable)
- verified_by (Foreign Key → Users, Nullable)
- created_at (DateTime)
```

#### Leave Requests Table

```sql
- id (Primary Key)
- leave_number (String, Unique)
- employee_id (Foreign Key → Employees)
- leave_type_id (Foreign Key → Leave Types)
- start_date (Date)
- end_date (Date)
- total_days (Integer) - Calculated
- reason (Text)
- status (Enum: Draft, Submitted, Approved, Rejected, Cancelled)
- approved_by (Foreign Key → Users, Nullable)
- approval_date (DateTime, Nullable)
- attachment_url (String, Nullable)
- notes (Text)
- created_at (DateTime)
```

#### Leave Types Table

```sql
- id (Primary Key)
- name (String) - Sick Leave, Vacation, Maternity, etc.
- code (String, Unique)
- annual_allocation (Integer) - Days per year
- carryover_allowed (Boolean)
- max_carryover (Integer) - Days
- requires_document (Boolean)
- is_paid (Boolean)
- is_active (Boolean)
```

#### Skills Table

```sql
- id (Primary Key)
- employee_id (Foreign Key → Employees)
- skill_name (String)
- proficiency_level (Enum: Beginner, Intermediate, Advanced, Expert)
- years_of_experience (Integer)
- certification_url (String, Nullable)
- created_at (DateTime)
```

#### Performance Appraisal Table

```sql
- id (Primary Key)
- appraisal_number (String, Unique)
- employee_id (Foreign Key → Employees)
- appraisal_period (String) - Q1, Q2, etc. or Year
- reviewer_id (Foreign Key → Employees)
- start_date (Date)
- end_date (Date)
- overall_rating (Decimal: 1-5)
- status (Enum: Draft, Submitted, Reviewed, Completed)
- goals_achieved (Integer) - Out of total
- performance_notes (Text)
- promotion_recommended (Boolean)
- next_review_date (Date)
- created_at (DateTime)
```

### UI Views

1. **HR Dashboard**: Headcount, turnover rate, leave balance, upcoming reviews
2. **Employee Directory**: Table/Card view with search and filters
3. **Employee Form**: Full employee details, documents, history
4. **Organization Chart**: Visual hierarchy of departments and teams
5. **Attendance Tracker**: Calendar view with daily attendance
6. **Leave Requests**: List and form with approval workflow
7. **Performance Reviews**: Form with ratings and feedback
8. **Skills Matrix**: Grid showing skills across team members
9. **Reports**: Turnover, attendance trends, payroll data

### Actions & Automations

- Auto-calculate working hours from check-in/out
- Send leave request approval notifications
- Auto-approve leave within entitlement
- Send work anniversary reminders
- Auto-calculate leave balance
- Send performance review reminders at scheduled intervals
- Auto-mark birthday celebrations
- Generate monthly attendance reports

### User Permissions

- HR Manager: Full access to employee data and reports
- Manager: Can approve leave requests, view team members' data
- Employees: View own data, apply for leave, view performance
- Payroll: Can view salary-related employee data
- Admin: Full system access

### Workflow State Machine

```
LEAVE REQUESTS: Draft → Submitted → Approved (or Rejected)
PERFORMANCE APPRAISAL: Draft → Submitted → Reviewed → Completed
```

---

## 7. Payroll Module

### Summary

Complete payroll processing including salary calculations, tax deductions, and statutory compliance.

### Database Schema

#### Salary Structures Table

```sql
- id (Primary Key)
- name (String)
- code (String, Unique)
- description (Text)
- is_active (Boolean)
- created_at (DateTime)
```

#### Salary Structure Components Table

```sql
- id (Primary Key)
- salary_structure_id (Foreign Key → Salary Structures)
- component_id (Foreign Key → Salary Components)
- amount (Decimal)
- is_percentage (Boolean)
- percentage_value (Decimal, Nullable)
- sequence (Integer)
```

#### Salary Components Table

```sql
- id (Primary Key)
- name (String) - Basic Salary, HRA, DA, PF, Income Tax, etc.
- code (String, Unique)
- component_type (Enum: Earning, Deduction, Statutory)
- is_active (Boolean)
- created_at (DateTime)
```

#### Payroll Table

```sql
- id (Primary Key)
- payroll_number (String, Unique)
- month (String) - YYYY-MM
- year (Integer)
- status (Enum: Draft, Generated, Submitted, Approved, Processed, Paid)
- total_employees (Integer)
- total_salary (Decimal)
- total_deductions (Decimal)
- net_payable (Decimal)
- generated_by (Foreign Key → Users)
- approved_by (Foreign Key → Users, Nullable)
- processed_date (DateTime, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Payroll Entries Table

```sql
- id (Primary Key)
- payroll_id (Foreign Key → Payroll)
- employee_id (Foreign Key → Employees)
- basic_salary (Decimal)
- earnings (Decimal) - HRA, DA, etc.
- total_earnings (Decimal)
- deductions (Decimal) - PF, Income Tax, etc.
- net_salary (Decimal)
- status (Enum: Draft, Processed, Paid)
- payment_date (Date, Nullable)
- payment_method (Enum: Bank Transfer, Check, Cash)
- bank_account_id (Foreign Key → Bank Accounts, Nullable)
- notes (Text)
- created_at (DateTime)
```

#### Payroll Entry Details Table

```sql
- id (Primary Key)
- payroll_entry_id (Foreign Key → Payroll Entries)
- component_id (Foreign Key → Salary Components)
- amount (Decimal)
- component_type (Enum: Earning, Deduction)
```

#### Tax Slabs Table

```sql
- id (Primary Key)
- name (String) - Income Tax Slab, etc.
- effective_from (Date)
- effective_to (Date)
- min_amount (Decimal)
- max_amount (Decimal)
- tax_percentage (Decimal)
- cess_percentage (Decimal, Nullable)
```

### UI Views

1. **Payroll Dashboard**: Monthly payroll summary, salary trends, statutory compliance
2. **Salary Structures**: List and form for defining company salary structures
3. **Employee Salary Assignments**: Link employees to salary structures
4. **Monthly Payroll**: Generate and process monthly payroll
5. **Payroll Register**: Detailed view of all employee salaries for the period
6. **Salary Slips**: Individual employee salary statements
7. **Tax Reports**: Income tax, statutory deductions summary
8. **Reports**: Payroll summary, statutory contributions, cost analysis

### Actions & Automations

- Auto-calculate salary based on structure on specified date
- Auto-apply tax based on current tax slabs and employee information
- Auto-generate salary slips
- Auto-send salary notifications to employees
- Auto-create payment records for bank transfers
- Auto-update attendance-based deductions (late arrival, absent days)
- Auto-generate statutory reports (IT returns, Form 16, etc.)
- Auto-notify of salary processing completion

### User Permissions

- Payroll Manager: Full payroll processing access
- Finance Manager: Can approve payroll and manage master data
- HR: Can view salary structure and employee assignments
- Employee: Can view own salary slip
- Accounts: Can see payroll expenses for journalizing

### Workflow State Machine

```
PAYROLL: Draft → Generated → Submitted → Approved → Processed → Paid
PAYROLL ENTRIES: Draft → Processed → Paid
```

---

## 8. Projects Module

### Summary

Complete project management with resource allocation, milestone tracking, and time tracking.

### Database Schema

#### Projects Table

```sql
- id (Primary Key)
- project_code (String, Unique)
- name (String)
- description (Text)
- client_id (Foreign Key → Customers, Nullable)
- start_date (Date)
- end_date (Date)
- planned_days (Integer) - Calculated from dates
- status (Enum: Proposal, Approved, In Progress, On Hold, Completed, Cancelled)
- budget (Decimal)
- actual_cost (Decimal) - Calculated
- project_manager_id (Foreign Key → Users)
- team_lead_id (Foreign Key → Users, Nullable)
- category (Enum: Software, Construction, Consulting, Manufacturing, etc.)
- priority (Enum: Low, Medium, High, Critical)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Tasks Table

```sql
- id (Primary Key)
- task_code (String, Unique)
- project_id (Foreign Key → Projects)
- name (String)
- description (Text)
- parent_task_id (Foreign Key → Tasks, Nullable) - For sub-tasks
- assigned_to (Foreign Key → Users)
- status (Enum: New, In Progress, On Hold, Completed, Cancelled)
- priority (Enum: Low, Medium, High, Urgent)
- start_date (Date)
- end_date (Date)
- estimated_hours (Decimal)
- actual_hours (Decimal) - From time tracking
- progress_percentage (Integer: 0-100)
- depends_on_task_id (Foreign Key → Tasks, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Project Team Members Table

```sql
- id (Primary Key)
- project_id (Foreign Key → Projects)
- user_id (Foreign Key → Users)
- role (String) - Developer, Designer, Tester, etc.
- allocation_percentage (Integer: 0-100)
- start_date (Date)
- end_date (Date, Nullable)
- added_by (Foreign Key → Users)
```

#### Milestones Table

```sql
- id (Primary Key)
- milestone_code (String, Unique)
- project_id (Foreign Key → Projects)
- name (String)
- description (Text)
- target_date (Date)
- status (Enum: Planned, In Progress, Completed, Delayed)
- completion_percentage (Integer)
- related_tasks_count (Integer)
- created_at (DateTime)
```

#### Time Entries Table

```sql
- id (Primary Key)
- entry_number (String, Unique)
- task_id (Foreign Key → Tasks)
- employee_id (Foreign Key → Employees)
- entry_date (Date)
- hours (Decimal)
- description (Text)
- billable (Boolean)
- status (Enum: Draft, Submitted, Approved)
- approved_by (Foreign Key → Users, Nullable)
- created_at (DateTime)
```

#### Project Issues/Risks Table

```sql
- id (Primary Key)
- issue_number (String, Unique)
- project_id (Foreign Key → Projects)
- type (Enum: Issue, Risk, Change Request)
- title (String)
- description (Text)
- reported_by (Foreign Key → Users)
- assigned_to (Foreign Key → Users, Nullable)
- severity (Enum: Low, Medium, High, Critical)
- status (Enum: Open, In Progress, Resolved, Closed)
- resolution (Text, Nullable)
- target_resolution_date (Date)
- created_at (DateTime)
```

### UI Views

1. **Projects Dashboard**: Project status overview, timeline view, resource allocation, budget vs. actual
2. **Projects List**: Table/Kanban view with filters and sorting
3. **Project Form**: Full project details, team assignment, budget tracking
4. **Gantt Chart**: Visual timeline of tasks and dependencies
5. **Kanban Board**: Task status board with drag-and-drop
6. **Task Details**: Subtasks, time tracking, attachments, comments
7. **Milestone View**: Timeline of milestones with dependencies
8. **Time Tracking**: Daily time entry form and summary report
9. **Resource Allocation**: Grid showing team member availability
10. **Project Reports**: Budget analysis, timeline variance, team productivity

### Actions & Automations

- Auto-mark task complete when all subtasks are done
- Auto-update project progress based on task completion
- Send task assignment notifications
- Send deadline reminder alerts for overdue tasks
- Auto-calculate actual hours from time entries
- Auto-mark milestone as delayed if target date passes
- Auto-create change request when scope changes
- Auto-send project status reports
- Auto-calculate project ROI

### User Permissions

- Project Manager: Full project access, can manage team and budget
- Team Members: Can view project details, update own tasks and time entries
- Resource Manager: Can view resource allocation and availability
- Finance: View-only access to budget and costs
- Client: Limited view of project progress (if configured)

### Workflow State Machine

```
PROJECTS: Proposal → Approved → In Progress → (On Hold) → Completed (or Cancelled)
TASKS: New → In Progress → (On Hold) → Completed (or Cancelled)
TIME ENTRIES: Draft → Submitted → Approved
ISSUES: Open → In Progress → Resolved → Closed
```

---

## 9. Manufacturing Module

### Summary

Complete manufacturing management including bill of materials, production orders, and quality control.

### Database Schema

#### Bill of Materials (BOM) Table

```sql
- id (Primary Key)
- bom_number (String, Unique)
- product_id (Foreign Key → Products)
- name (String)
- version (String) - v1.0, v1.1, etc.
- status (Enum: Draft, Active, Inactive, Obsolete)
- effective_from (Date)
- created_by (Foreign Key → Users)
- approved_by (Foreign Key → Users, Nullable)
- approval_date (DateTime, Nullable)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### BOM Components Table

```sql
- id (Primary Key)
- bom_id (Foreign Key → Bill of Materials)
- component_product_id (Foreign Key → Products)
- quantity (Decimal)
- unit_of_measure (String)
- waste_percentage (Decimal) - Scrap/loss factor
- operation_id (Foreign Key → Operations, Nullable)
- sequence (Integer)
```

#### Production Orders Table

```sql
- id (Primary Key)
- po_number (String, Unique)
- bom_id (Foreign Key → Bill of Materials)
- product_id (Foreign Key → Products)
- quantity (Decimal)
- unit_of_measure (String)
- scheduled_start_date (Date)
- scheduled_end_date (Date)
- actual_start_date (Date, Nullable)
- actual_end_date (Date, Nullable)
- status (Enum: Planned, Confirmed, In Progress, Completed, Cancelled)
- planned_cost (Decimal)
- actual_cost (Decimal)
- warehouse_id (Foreign Key → Warehouses)
- created_by (Foreign Key → Users)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Production Order Operations Table

```sql
- id (Primary Key)
- production_order_id (Foreign Key → Production Orders)
- operation_id (Foreign Key → Operations)
- sequence (Integer)
- scheduled_start (DateTime)
- scheduled_end (DateTime)
- actual_start (DateTime, Nullable)
- actual_end (DateTime, Nullable)
- status (Enum: Pending, In Progress, Completed)
- output_quantity (Decimal, Nullable)
- downtime_minutes (Integer)
- notes (Text)
```

#### Operations Table

```sql
- id (Primary Key)
- operation_code (String, Unique)
- name (String) - Cutting, Welding, Assembly, etc.
- description (Text)
- machine_id (Foreign Key → Machines, Nullable)
- standard_time (Decimal) - Hours
- labor_cost_per_hour (Decimal)
- machine_cost_per_hour (Decimal)
- is_outsourced (Boolean)
- created_at (DateTime)
```

#### Machines Table

```sql
- id (Primary Key)
- machine_code (String, Unique)
- name (String)
- model (String)
- capacity (Decimal)
- status (Enum: Operational, Maintenance, Broken, Decommissioned)
- purchase_date (Date)
- last_maintenance_date (Date)
- next_maintenance_date (Date)
- operator_required (Boolean)
- created_at (DateTime)
```

#### Quality Inspection Table

```sql
- id (Primary Key)
- inspection_number (String, Unique)
- production_order_id (Foreign Key → Production Orders)
- inspection_date (Date)
- inspected_by (Foreign Key → Users)
- sample_size (Integer)
- defects_found (Integer)
- status (Enum: Passed, Failed, Hold)
- notes (Text)
- attachment_url (String, Nullable)
- created_at (DateTime)
```

#### Work Orders Table

```sql
- id (Primary Key)
- work_order_number (String, Unique)
- production_order_id (Foreign Key → Production Orders)
- assigned_to (Foreign Key → Employees)
- operation_id (Foreign Key → Operations)
- start_date (Date)
- end_date (Date)
- status (Enum: Pending, In Progress, Completed, Cancelled)
- created_at (DateTime)
```

### UI Views

1. **Manufacturing Dashboard**: Production status, schedule adherence, defect rate, machine utilization
2. **BOM List**: Versioned bills of materials with component details
3. **BOM Form**: Component management with waste factors
4. **Production Orders**: List with status filters and scheduling timeline
5. **Production Order Form**: Resource and operation scheduling
6. **Shop Floor Control**: Real-time view of active production orders and operations
7. **Quality Inspection**: Forms and inspection reports
8. **Machine Maintenance**: Schedule and track maintenance tasks
9. **Work Order Tracking**: Shop floor work order assignments and updates
10. **Manufacturing Reports**: Efficiency, defect rates, cost analysis

### Actions & Automations

- Auto-generate work orders from production order operations
- Auto-reserve raw materials from inventory for production orders
- Auto-release finished goods to inventory when production is complete
- Auto-flag quality issues when defect rate exceeds threshold
- Auto-schedule preventive maintenance for machines
- Auto-calculate production costs based on operations and materials
- Send work order assignments to shop floor
- Auto-generate production order from sales order

### User Permissions

- Production Manager: Full access to production planning and execution
- Quality Inspector: Can perform quality inspections
- Shop Floor Supervisor: Can update work order status
- Maintenance Technician: Can record maintenance activities
- Finance: View-only access to production costs

### Workflow State Machine

```
PRODUCTION ORDERS: Planned → Confirmed → In Progress → Completed (or Cancelled)
OPERATIONS: Pending → In Progress → Completed
QUALITY INSPECTION: Auto-triggered, results mark pass/fail/hold
WORK ORDERS: Pending → In Progress → Completed
```

---

## 10. POS (Point of Sale) Module

### Summary

Retail and restaurant point of sale system with sales terminals, inventory sync, and payment processing.

### Database Schema

#### POS Terminals Table

```sql
- id (Primary Key)
- terminal_id (String, Unique)
- name (String)
- location (String) - Checkout counter 1, Table 5, etc.
- warehouse_id (Foreign Key → Warehouses)
- is_active (Boolean)
- created_at (DateTime)
```

#### POS Transactions Table

```sql
- id (Primary Key)
- transaction_number (String, Unique)
- terminal_id (Foreign Key → POS Terminals)
- customer_id (Foreign Key → Customers, Nullable)
- cashier_id (Foreign Key → Users)
- transaction_date (DateTime)
- subtotal (Decimal)
- discount (Decimal)
- tax_amount (Decimal)
- total_amount (Decimal)
- payment_method (Enum: Cash, Card, Check, Digital Wallet, Mixed)
- status (Enum: Pending, Completed, Cancelled, Refunded)
- reference_number (String, Nullable)
- notes (String, Nullable)
- created_at (DateTime)
```

#### POS Transaction Items Table

```sql
- id (Primary Key)
- transaction_id (Foreign Key → POS Transactions)
- product_id (Foreign Key → Products)
- quantity (Decimal)
- unit_price (Decimal)
- discount (Decimal)
- line_total (Decimal)
- notes (String, Nullable)
- sequence (Integer)
```

#### Discounts/Promotions Table

```sql
- id (Primary Key)
- discount_code (String, Unique)
- name (String)
- description (Text)
- discount_type (Enum: Percent, Fixed Amount, BOGO, Free Item)
- discount_value (Decimal)
- applicable_to (Enum: All Products, Specific Category, Specific Product)
- start_date (DateTime)
- end_date (DateTime)
- usage_limit (Integer, Nullable)
- usage_count (Integer)
- is_active (Boolean)
- created_at (DateTime)
```

#### POS Cash Register Table

```sql
- id (Primary Key)
- register_number (String, Unique)
- terminal_id (Foreign Key → POS Terminals)
- cashier_id (Foreign Key → Users)
- shift_date (Date)
- opening_balance (Decimal)
- closing_balance (Decimal)
- expected_cash (Decimal) - Calculated from transactions
- variance (Decimal) - Calculated
- status (Enum: Open, Closed, Reconciled)
- opened_at (DateTime)
- closed_at (DateTime, Nullable)
- notes (Text)
```

#### POS Reconciliation Table

```sql
- id (Primary Key)
- reconciliation_number (String, Unique)
- register_id (Foreign Key → POS Cash Register)
- reconciliation_date (DateTime)
- cash_tendered (Decimal)
- expected_amount (Decimal)
- variance (Decimal)
- variance_percentage (Decimal)
- status (Enum: Pending, Verified, Cleared)
- verified_by (Foreign Key → Users, Nullable)
- notes (Text)
```

### UI Views

1. **POS Dashboard**: Today's sales, top products, payment method breakdown
2. **POS Terminal Interface**: Product search/browse, shopping cart, payment processing
3. **Cash Register**: Opening balance, transactions list, closing procedures
4. **Discounts/Promotions**: Management of active promotions
5. **Transaction History**: Detailed list with filters
6. **Daily Settlement**: Cash register reconciliation
7. **POS Reports**: Sales by hour, by product, by payment method
8. **Refunds/Returns**: Process customer returns

### Actions & Automations

- Auto-print receipt
- Auto-update inventory on transaction completion
- Auto-create sales order from POS transaction for later fulfillment
- Auto-apply available discounts
- Auto-process payment and generate payment reference
- Auto-sync inventory with main warehouse
- Auto-notify when low stock is sold
- Auto-send customer receipt via email/SMS

### User Permissions

- Store Manager: Full POS access, can override prices, void transactions
- Cashier: Can process transactions, limited price modifications
- Shift Supervisor: Can open/close registers, handle refunds
- Finance: View-only access to transactions
- Admin: System configuration and reporting

### Workflow State Machine

```
TRANSACTIONS: Pending → Completed (or Cancelled/Refunded)
CASH REGISTER: Open → Closed → Reconciled
REFUNDS: Request → Approved (or Rejected) → Processed
```

---

## 11. E-Commerce Module

### Summary

Online store with product catalog, shopping cart, order management, and customer reviews.

### Database Schema

#### Online Store Configuration Table

```sql
- id (Primary Key)
- store_name (String)
- domain (String)
- description (Text)
- logo_url (String)
- is_active (Boolean)
- currency (String)
- primary_warehouse_id (Foreign Key → Warehouses)
- payment_gateway (String) - Stripe, PayPal, etc.
- shipping_provider (String)
```

#### Product Categories (E-Commerce) Table

```sql
- id (Primary Key)
- name (String)
- slug (String, Unique) - For URL
- description (Text)
- image_url (String)
- parent_category_id (Foreign Key → Categories, Nullable)
- is_active (Boolean)
- meta_title (String, Nullable)
- meta_description (String, Nullable)
- created_at (DateTime)
```

#### Product Listings Table

```sql
- id (Primary Key)
- product_id (Foreign Key → Products)
- category_id (Foreign Key → Product Categories)
- title (String) - May differ from product name
- description (Text) - Extended description for e-commerce
- short_description (String)
- image_urls (JSON Array) - Multiple images
- video_url (String, Nullable)
- price (Decimal) - May differ from list price
- compare_price (Decimal, Nullable) - Strike-through price
- cost (Decimal)
- weight (Decimal)
- stock_status (Enum: In Stock, Out of Stock, Pre-order)
- sku (String, Unique)
- is_featured (Boolean)
- rating (Decimal: 1-5)
- review_count (Integer)
- meta_title (String)
- meta_description (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Shopping Cart Table

```sql
- id (Primary Key)
- customer_id (Foreign Key → Customers)
- session_id (String, Nullable) - For guest users
- created_at (DateTime)
- updated_at (DateTime)
```

#### Cart Items Table

```sql
- id (Primary Key)
- cart_id (Foreign Key → Shopping Cart)
- product_id (Foreign Key → Product Listings)
- quantity (Decimal)
- added_at (DateTime)
- notes (String, Nullable)
```

#### Online Orders Table

```sql
- id (Primary Key)
- order_number (String, Unique)
- customer_email (String)
- customer_name (String)
- customer_phone (String)
- order_date (DateTime)
- status (Enum: Pending Payment, Processing, Shipped, Delivered, Cancelled, Returned)
- payment_status (Enum: Unpaid, Paid, Refunded, Partially Refunded)
- billing_address (JSON)
- shipping_address (JSON)
- shipping_method (String)
- tracking_number (String, Nullable)
- subtotal (Decimal)
- shipping_cost (Decimal)
- tax (Decimal)
- discount (Decimal)
- total (Decimal)
- payment_method (Enum: Credit Card, Debit Card, PayPal, Bank Transfer)
- notes (Text)
- customer_notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Product Reviews Table

```sql
- id (Primary Key)
- product_id (Foreign Key → Product Listings)
- customer_email (String)
- customer_name (String)
- rating (Integer: 1-5)
- title (String)
- comment (Text)
- helpful_count (Integer)
- status (Enum: Pending, Approved, Rejected)
- verified_purchase (Boolean)
- created_at (DateTime)
```

#### Wish List Table

```sql
- id (Primary Key)
- customer_id (Foreign Key → Customers)
- product_id (Foreign Key → Product Listings)
- added_at (DateTime)
```

### UI Views (Customer-Facing)

1. **Product Catalog**: Category browsing, search, filters by price/rating
2. **Product Detail**: Images, reviews, specifications, related products
3. **Shopping Cart**: Items, quantities, subtotal, checkout button
4. **Checkout**: Billing/shipping address, payment method selection
5. **Order Confirmation**: Thank you page, order number, expected delivery
6. **Order Tracking**: Real-time shipment tracking
7. **Account Dashboard**: Order history, wish list, saved addresses, reviews
8. **Review Submission**: Post-purchase review form

### UI Views (Admin)

1. **E-Commerce Dashboard**: Sales, traffic, conversion rate, top products
2. **Product Listings Management**: Add/edit listings with SEO options
3. **Orders List**: Processing and fulfillment tracking
4. **Order Form**: Full order details, status updates
5. **Reviews Moderation**: Approve/reject customer reviews
6. **Wish List Analytics**: Popular products, conversion data
7. **Shipping Management**: Integration with carriers, label generation
8. **Reports**: Revenue, conversion funnel, product performance

### Actions & Automations

- Auto-sync product prices and stock from main inventory
- Auto-create order from online checkout
- Auto-send order confirmation email
- Auto-update tracking information
- Auto-send delivery notifications
- Auto-request review post-delivery
- Auto-apply promotional discounts at checkout
- Auto-recommend related products
- Auto-manage wish list reminders

### User Permissions

- Store Owner: Full access to all settings and analytics
- Product Manager: Manage product listings and content
- Sales/Customer Service: Can view orders, process returns
- Admin: Full system access

### Workflow State Machine

```
ORDERS: Pending Payment → Processing → Shipped → Delivered (or Cancelled)
REVIEWS: Pending → Approved (or Rejected)
```

---

## 12. Helpdesk Module

### Summary

Customer support ticketing system with SLA management and knowledge base.

### Database Schema

#### Support Tickets Table

```sql
- id (Primary Key)
- ticket_number (String, Unique)
- customer_id (Foreign Key → Customers)
- subject (String)
- description (Text)
- attachment_urls (JSON Array)
- category (Enum: Sales, Technical, Billing, General Inquiry)
- priority (Enum: Low, Medium, High, Critical)
- status (Enum: New, Open, On Hold, Pending Customer, Resolved, Closed)
- assigned_to (Foreign Key → Users, Nullable)
- assigned_date (DateTime, Nullable)
- created_date (DateTime)
- resolved_date (DateTime, Nullable)
- closed_date (DateTime, Nullable)
- first_response_time (DateTime, Nullable)
- sla_breach (Boolean)
- tags (JSON Array)
- customer_rating (Integer: 1-5, Nullable)
- satisfaction_comment (Text, Nullable)
- notes (Text)
```

#### Support Ticket Messages Table

```sql
- id (Primary Key)
- ticket_id (Foreign Key → Support Tickets)
- sender_type (Enum: Customer, Support Agent)
- sender_name (String)
- sender_id (Foreign Key → Users, Nullable)
- message (Text)
- attachment_urls (JSON Array)
- created_at (DateTime)
- internal (Boolean) - Only visible to support team
```

#### SLA (Service Level Agreement) Table

```sql
- id (Primary Key)
- name (String)
- description (Text)
- priority_level (Enum: Low, Medium, High, Critical)
- first_response_time (Integer) - Hours
- resolution_time (Integer) - Hours
- is_active (Boolean)
```

#### Knowledge Base Categories Table

```sql
- id (Primary Key)
- name (String)
- slug (String, Unique)
- description (Text)
- parent_category_id (Foreign Key → KB Categories, Nullable)
- order (Integer)
- is_active (Boolean)
```

#### Knowledge Base Articles Table

```sql
- id (Primary Key)
- article_number (String, Unique)
- title (String)
- slug (String, Unique)
- category_id (Foreign Key → Knowledge Base Categories)
- content (Text)
- author_id (Foreign Key → Users)
- status (Enum: Draft, Published, Archived)
- views_count (Integer)
- helpful_count (Integer)
- unhelpful_count (Integer)
- linked_products (JSON Array)
- tags (JSON Array)
- meta_title (String)
- meta_description (String)
- published_at (DateTime, Nullable)
- updated_at (DateTime)
```

### UI Views

1. **Helpdesk Dashboard**: Open tickets, SLA compliance, average resolution time, team performance
2. **Tickets List**: Table with filters by status, priority, assigned agent
3. **Ticket Form**: Full ticket details, conversation thread, notes
4. **Ticket Assignment**: Queue management and auto-assignment
5. **Knowledge Base**: Public-facing search and article browsing
6. **KB Management**: Create/edit articles with rich text editor
7. **Reports**: Resolution time, satisfaction scores, ticket volume trends
8. **Customer Portal**: Submit tickets, track status, search knowledge base

### Actions & Automations

- Auto-create ticket from customer email
- Auto-assign tickets based on category and workload
- Auto-send acknowledgment to customer
- Send SLA breach alerts to support manager
- Auto-escalate high-priority tickets
- Auto-suggest knowledge base articles
- Auto-close resolved tickets after confirmation
- Send satisfaction survey after ticket closure
- Auto-update ticket status based on rules

### User Permissions

- Helpdesk Manager: Full access, SLA management, reporting
- Support Agent: Can assign and respond to tickets
- Team Lead: Can reassign tickets, access team reports
- Customer: View own tickets, submit new tickets
- Knowledge Base Editor: Manage KB articles

### Workflow State Machine

```
TICKETS: New → Open → (On Hold/Pending Customer) → Resolved → Closed
KNOWLEDGE BASE: Draft → Published (or Archived)
```

---

## 13. School Management Module

### Summary

Complete school management system with student enrollment, classes, attendance, and academic records.

### Database Schema

#### Schools/Campuses Table

```sql
- id (Primary Key)
- name (String)
- code (String, Unique)
- address (Text)
- city (String)
- principal_id (Foreign Key → Employees)
- phone (String)
- email (String)
- website (String)
- established_date (Date)
- status (Enum: Active, Inactive)
```

#### Academic Years Table

```sql
- id (Primary Key)
- name (String) - 2024-2025
- start_date (Date)
- end_date (Date)
- is_current (Boolean)
- status (Enum: Planned, In Progress, Completed)
```

#### Classes/Grades Table

```sql
- id (Primary Key)
- name (String) - Grade 1A, Grade 10B, etc.
- grade_level (Integer) - 1, 2, 3, ..., 12
- section (String, Nullable)
- academic_year_id (Foreign Key → Academic Years)
- class_teacher_id (Foreign Key → Employees)
- capacity (Integer)
- current_strength (Integer) - Calculated
- classroom_number (String, Nullable)
- created_at (DateTime)
```

#### Students Table

```sql
- id (Primary Key)
- student_id (String, Unique)
- first_name (String)
- last_name (String)
- date_of_birth (Date)
- gender (Enum: Male, Female, Other)
- student_email (String, Nullable)
- phone (String, Nullable)
- address (Text)
- city (String)
- country (String)
- father_name (String)
- father_phone (String)
- mother_name (String)
- mother_phone (String)
- emergency_contact (String)
- enrollment_date (Date)
- current_class_id (Foreign Key → Classes)
- status (Enum: Active, Inactive, Graduated, Transferred Out)
- photograph_url (String, Nullable)
- created_at (DateTime)
```

#### Subjects Table

```sql
- id (Primary Key)
- name (String) - Mathematics, English, etc.
- code (String, Unique)
- description (Text)
- max_marks (Decimal)
- passing_marks (Decimal)
- credit_hours (Integer)
- is_active (Boolean)
```

#### Class Subjects Table

```sql
- id (Primary Key)
- class_id (Foreign Key → Classes)
- subject_id (Foreign Key → Subjects)
- teacher_id (Foreign Key → Employees)
- sessions_per_week (Integer)
- academic_year_id (Foreign Key → Academic Years)
```

#### Attendance Records Table

```sql
- id (Primary Key)
- student_id (Foreign Key → Students)
- attendance_date (Date)
- status (Enum: Present, Absent, Late, Leave, Excused)
- remarks (String, Nullable)
```

#### Marks/Grades Table

```sql
- id (Primary Key)
- student_id (Foreign Key → Students)
- subject_id (Foreign Key → Subjects)
- academic_year_id (Foreign Key → Academic Years)
- exam_type (Enum: Unit Test, Mid Term, Final Exam, Assignment)
- marks_obtained (Decimal)
- max_marks (Decimal)
- percentage (Decimal) - Calculated
- grade (String) - A, B, C, etc.
- remarks (String, Nullable)
- recorded_by (Foreign Key → Employees)
- recorded_at (DateTime)
```

#### Report Cards Table

```sql
- id (Primary Key)
- report_card_number (String, Unique)
- student_id (Foreign Key → Students)
- academic_year_id (Foreign Key → Academic Years)
- term (Enum: Term 1, Term 2, Term 3)
- generated_date (Date)
- overall_percentage (Decimal) - Calculated
- overall_grade (String)
- class_rank (Integer)
- class_strength (Integer)
- teacher_comments (Text)
- principal_signature (Boolean)
```

#### Fees/Tuition Table

```sql
- id (Primary Key)
- fee_type_id (Foreign Key → Fee Types)
- student_id (Foreign Key → Students)
- academic_year_id (Foreign Key → Academic Years)
- amount (Decimal)
- due_date (Date)
- paid_amount (Decimal)
- payment_date (Date, Nullable)
- status (Enum: Unpaid, Partially Paid, Fully Paid)
```

#### Fee Types Table

```sql
- id (Primary Key)
- name (String) - Tuition Fee, Exam Fee, Transport Fee, etc.
- amount (Decimal)
- frequency (Enum: One-time, Monthly, Quarterly, Annually)
- is_mandatory (Boolean)
```

### UI Views

1. **School Dashboard**: Total students, classes, attendance %, top performers, fee collection status
2. **Students Directory**: List with search, filters by class/status
3. **Student Profile**: Full details, attendance, marks, fee status
4. **Classes Management**: Student enrollment, subject assignment
5. **Attendance Tracker**: Daily/monthly view with summary
6. **Marks Entry**: Form for recording marks by exam
7. **Report Card Generator**: View and download report cards
8. **Fee Management**: Billing, payment tracking, reminders
9. **Teacher Dashboard**: Class list, attendance, marks entry
10. **Parent Portal**: View child's performance, attendance, fees

### Actions & Automations

- Auto-calculate average marks and grades
- Auto-generate report cards
- Auto-send attendance alerts to parents
- Auto-send fee reminders
- Auto-promote students to next class
- Auto-calculate class rank based on performance
- Auto-detect low attendance and alert parents
- Auto-generate academic transcripts
- Auto-send performance certificates

### User Permissions

- Principal: Full access
- Class Teacher: Can manage class attendance and marks
- Subject Teacher: Can enter marks for assigned subjects
- Administrator: Manage enrollment, fees, reports
- Accountant: Manage fee collection and reporting
- Parent: View own child's data only
- Student: View own grades and attendance

### Workflow State Machine

```
ENROLLMENT: New → Active (or Inactive/Graduated)
ACADEMIC YEAR: Planned → In Progress → Completed
ATTENDANCE: Present/Absent/Late (No workflow)
MARKS: Recorded → Published in Report Card
FEE: Unpaid → Partially Paid → Fully Paid
```

---

## 14. Medical Management Module

### Summary

Complete healthcare management system with patient records, appointments, and medical history.

### Database Schema

#### Departments/Specialties Table

```sql
- id (Primary Key)
- name (String) - Cardiology, Orthopedics, etc.
- code (String, Unique)
- description (Text)
- head_doctor_id (Foreign Key → Doctors)
- phone (String)
- is_active (Boolean)
```

#### Doctors Table

```sql
- id (Primary Key)
- doctor_id (String, Unique)
- first_name (String)
- last_name (String)
- specialization_id (Foreign Key → Departments)
- email (String, Unique)
- phone (String)
- qualification (String)
- registration_number (String)
- license_expiry (Date)
- office_hours (JSON) - Days and hours
- consultation_fee (Decimal)
- photo_url (String, Nullable)
- bio (Text)
- status (Enum: Active, On Leave, Retired)
- created_at (DateTime)
```

#### Patients Table

```sql
- id (Primary Key)
- patient_id (String, Unique)
- first_name (String)
- last_name (String)
- date_of_birth (Date)
- gender (Enum: Male, Female, Other)
- blood_group (String) - A+, O-, etc.
- email (String)
- phone (String)
- address (Text)
- city (String)
- country (String)
- emergency_contact_name (String)
- emergency_contact_phone (String)
- insurance_provider (String, Nullable)
- insurance_policy_number (String, Nullable)
- registration_date (Date)
- allergies (Text)
- chronic_conditions (Text)
- photo_url (String, Nullable)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Appointments Table

```sql
- id (Primary Key)
- appointment_number (String, Unique)
- patient_id (Foreign Key → Patients)
- doctor_id (Foreign Key → Doctors)
- appointment_date (DateTime)
- duration_minutes (Integer)
- status (Enum: Scheduled, Confirmed, Completed, Cancelled, No-show)
- appointment_type (Enum: Consultation, Follow-up, Emergency)
- chief_complaint (Text)
- notes (Text)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Medical History Table

```sql
- id (Primary Key)
- patient_id (Foreign Key → Patients)
- appointment_id (Foreign Key → Appointments)
- visit_date (Date)
- chief_complaint (Text)
- history_of_present_illness (Text)
- past_medical_history (Text)
- past_surgical_history (Text)
- medications_currently_taking (Text)
- family_history (Text)
- social_history (Text)
- review_of_systems (Text)
- physical_examination (Text)
- diagnosis (Text)
- treatment_plan (Text)
- follow_up_date (Date, Nullable)
- doctor_id (Foreign Key → Doctors)
- created_at (DateTime)
```

#### Prescriptions Table

```sql
- id (Primary Key)
- prescription_number (String, Unique)
- appointment_id (Foreign Key → Appointments)
- patient_id (Foreign Key → Patients)
- doctor_id (Foreign Key → Doctors)
- prescription_date (Date)
- validity_days (Integer)
- status (Enum: Active, Completed, Cancelled, Expired)
- notes (Text)
```

#### Prescription Items Table

```sql
- id (Primary Key)
- prescription_id (Foreign Key → Prescriptions)
- medicine_name (String)
- strength (String) - 250mg, 5ml, etc.
- dosage (String) - 1 tablet, 2 spoons, etc.
- frequency (String) - Twice daily, Every 6 hours, etc.
- duration_days (Integer)
- instructions (Text)
- quantity (Integer)
```

#### Lab Tests Table

```sql
- id (Primary Key)
- test_code (String, Unique)
- test_name (String)
- description (Text)
- normal_range (String)
- unit (String)
- sample_type (Enum: Blood, Urine, Saliva, Tissue, etc.)
- test_cost (Decimal)
- turnaround_time_hours (Integer)
- is_active (Boolean)
```

#### Lab Test Orders Table

```sql
- id (Primary Key)
- order_number (String, Unique)
- patient_id (Foreign Key → Patients)
- doctor_id (Foreign Key → Doctors)
- order_date (Date)
- test_id (Foreign Key → Lab Tests)
- status (Enum: Ordered, Sample Collected, Processing, Completed)
- result (Text, Nullable)
- result_date (Date, Nullable)
- normal_status (Enum: Normal, Abnormal, Critical, Pending)
- notes (Text)
```

#### Billing/Invoicing Table

```sql
- id (Primary Key)
- invoice_number (String, Unique)
- patient_id (Foreign Key → Patients)
- invoice_date (Date)
- consultation_fee (Decimal)
- procedure_charges (Decimal)
- medicine_charges (Decimal)
- lab_charges (Decimal)
- room_charges (Decimal)
- other_charges (Decimal)
- discount (Decimal)
- total_amount (Decimal)
- paid_amount (Decimal)
- payment_status (Enum: Unpaid, Partially Paid, Fully Paid)
- payment_method (Enum: Cash, Card, Insurance, Check)
- insurance_claim_status (Enum: Pending, Approved, Rejected)
- created_at (DateTime)
```

### UI Views

1. **Medical Dashboard**: Patient count, appointments today, pending tests, revenue, bed occupancy
2. **Patient Directory**: List with search, filters by condition
3. **Patient Profile**: Medical history, current medications, allergies, insurance info
4. **Appointment Scheduler**: Calendar view, booking form, reminder notifications
5. **Doctor's Clinic Portal**: Today's appointments, medical history review, prescription writing
6. **Medical Records**: Structured medical history, visit notes, diagnoses
7. **Prescription Management**: Issue and track prescriptions
8. **Lab Test Management**: Order, track results, download reports
9. **Billing**: Generate invoices, track payments, insurance claims
10. **Reports**: Patient analytics, doctor performance, revenue, lab results

### Actions & Automations

- Auto-generate appointment reminders (SMS/Email)
- Auto-send insurance claims
- Auto-calculate billing based on services
- Auto-flag allergies and drug interactions
- Auto-send prescription refill reminders
- Auto-schedule follow-up appointments
- Auto-generate lab result notifications
- Auto-archive old patient records
- Auto-send health checkup reminders

### User Permissions

- Doctor: Can create medical records, prescriptions, view assigned patients
- Nurse: Can manage appointments, patient check-in, vitals recording
- Receptionist: Can schedule appointments, manage patient intake
- Lab Technician: Can update lab test results
- Accountant: Manage billing and payments
- Admin: Full system access
- Patient: View own medical records, appointments, results
- Insurance: View insurance claim information

### Workflow State Machine

```
APPOINTMENTS: Scheduled → Confirmed → Completed (or Cancelled/No-show)
PRESCRIPTIONS: Active → Completed (or Cancelled/Expired)
LAB TESTS: Ordered → Sample Collected → Processing → Completed
INVOICES: Unpaid → Partially Paid → Fully Paid
INSURANCE CLAIMS: Pending → Approved (or Rejected)
```

---

## 15. Real Estate Module

### Summary

Complete real estate management with property listings, transactions, and tenant management.

### Database Schema

#### Properties Table

```sql
- id (Primary Key)
- property_code (String, Unique)
- name (String)
- property_type (Enum: Residential, Commercial, Industrial, Land, Mixed Use)
- address (Text)
- city (String)
- country (String)
- latitude (Decimal)
- longitude (Decimal)
- size_sqft (Decimal)
- size_sqm (Decimal) - Calculated
- bedrooms (Integer)
- bathrooms (Integer)
- parking_spaces (Integer)
- year_built (Integer)
- property_condition (Enum: New, Excellent, Good, Fair, Poor)
- amenities (JSON Array) - Pool, Gym, Security, etc.
- images_urls (JSON Array)
- video_url (String, Nullable)
- description (Text)
- owner_id (Foreign Key → Owners)
- purchase_price (Decimal)
- current_market_value (Decimal)
- property_status (Enum: Available, Rented, Sold, Under Maintenance, Inactive)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Owners Table

```sql
- id (Primary Key)
- owner_id (String, Unique)
- name (String)
- email (String)
- phone (String)
- address (Text)
- identification_type (String) - Passport, ID, etc.
- identification_number (String)
- bank_account (String, Nullable)
- photo_url (String, Nullable)
- properties_count (Integer)
- total_rental_income (Decimal)
- status (Enum: Active, Inactive)
- created_at (DateTime)
```

#### Property Listings Table

```sql
- id (Primary Key)
- property_id (Foreign Key → Properties)
- listing_date (Date)
- listing_expiry (Date)
- asking_price (Decimal)
- currency (String)
- listing_type (Enum: For Rent, For Sale, For Lease)
- description (Text, Nullable) - May differ from property description
- agent_id (Foreign Key → Agents)
- is_featured (Boolean)
- views_count (Integer)
- inquiries_count (Integer)
- status (Enum: Active, Inactive, Expired, Sold, Rented)
- created_at (DateTime)
```

#### Agents Table

```sql
- id (Primary Key)
- agent_id (String, Unique)
- first_name (String)
- last_name (String)
- email (String, Unique)
- phone (String)
- agency_id (Foreign Key → Agencies)
- license_number (String)
- license_expiry (Date)
- specialization (String) - Residential, Commercial, etc.
- photo_url (String)
- properties_listed (Integer)
- total_sales_value (Decimal)
- average_deal_value (Decimal)
- commission_percentage (Decimal)
- status (Enum: Active, Inactive, Suspended)
- created_at (DateTime)
```

#### Agencies Table

```sql
- id (Primary Key)
- agency_code (String, Unique)
- name (String)
- email (String)
- phone (String)
- address (Text)
- city (String)
- website (String)
- owner_name (String)
- agency_type (Enum: Individual, Partnership, Corporation)
- license_number (String)
- agents_count (Integer)
- total_properties (Integer)
- is_active (Boolean)
```

#### Tenants Table

```sql
- id (Primary Key)
- tenant_id (String, Unique)
- first_name (String)
- last_name (String)
- email (String)
- phone (String)
- occupation (String)
- employer (String)
- monthly_income (Decimal)
- identification_type (String)
- identification_number (String)
- emergency_contact (String)
- photo_url (String, Nullable)
- status (Enum: Active, Inactive, Blacklisted)
- created_at (DateTime)
```

#### Leases Table

```sql
- id (Primary Key)
- lease_number (String, Unique)
- property_id (Foreign Key → Properties)
- tenant_id (Foreign Key → Tenants)
- owner_id (Foreign Key → Owners)
- lease_start_date (Date)
- lease_end_date (Date)
- lease_duration_months (Integer)
- monthly_rent (Decimal)
- security_deposit (Decimal)
- lease_status (Enum: Draft, Active, Expired, Terminated, Renewed)
- utilities_included (Boolean)
- utilities_amount (Decimal, Nullable)
- maintenance_responsibility (Enum: Owner, Tenant, Shared)
- renewal_option (Boolean)
- lease_document_url (String, Nullable)
- created_at (DateTime)
```

#### Rent Payments Table

```sql
- id (Primary Key)
- payment_number (String, Unique)
- lease_id (Foreign Key → Leases)
- payment_date (Date)
- amount (Decimal)
- payment_method (Enum: Bank Transfer, Check, Cash, Online)
- status (Enum: Pending, Received, Overdue, Late)
- reference_number (String)
- notes (Text)
- received_by (Foreign Key → Users)
- created_at (DateTime)
```

#### Maintenance Requests Table

```sql
- id (Primary Key)
- request_number (String, Unique)
- property_id (Foreign Key → Properties)
- lease_id (Foreign Key → Leases, Nullable)
- requested_by (String) - Tenant or Agent
- request_date (Date)
- description (Text)
- priority (Enum: Low, Medium, High, Urgent)
- status (Enum: New, Assigned, In Progress, Completed, Cancelled)
- assigned_to (Foreign Key → Maintenance Staff)
- completion_date (Date, Nullable)
- cost (Decimal, Nullable)
- notes (Text)
- created_at (DateTime)
```

#### Transactions (Sales/Leases) Table

```sql
- id (Primary Key)
- transaction_number (String, Unique)
- property_id (Foreign Key → Properties)
- transaction_type (Enum: Sale, Lease)
- buyer_id (Foreign Key → Tenants/Customers, Nullable)
- seller_id (Foreign Key → Owners)
- transaction_date (Date)
- transaction_amount (Decimal)
- down_payment (Decimal, Nullable)
- balance_amount (Decimal)
- agent_id (Foreign Key → Agents)
- agent_commission (Decimal)
- status (Enum: Initiated, In Progress, Completed, Cancelled)
- completion_date (Date, Nullable)
- notes (Text)
- created_at (DateTime)
```

### UI Views

1. **Real Estate Dashboard**: Properties count, rental income, occupancy %, transaction value, market analysis
2. **Properties List**: Map and list view with filters, advanced search
3. **Property Form**: Full property details, images, amenities, valuation
4. **Property Listings**: Active listings by agent, performance metrics
5. **Tenant Management**: Directory, lease tracking, payment history
6. **Lease Management**: Active leases, renewal tracking, terms
7. **Rent Collection**: Payment tracking, overdue reminders, receipts
8. **Maintenance Tracking**: Request management, cost tracking
9. **Agent Performance**: Sales/lease volume, commission tracking
10. **Financial Reports**: Rental income, expenses, ROI analysis

### Actions & Automations

- Auto-create rent payment reminders
- Auto-mark rent as overdue after due date
- Auto-send lease renewal reminders
- Auto-calculate property valuation
- Auto-generate tenant move-out checklists
- Auto-send maintenance request confirmations
- Auto-calculate agent commissions
- Auto-generate property inspection schedules
- Auto-archive expired listings

### User Permissions

- Property Manager: Full access to properties and tenants
- Agent: Can manage listings, track leads, view assigned properties
- Owner: View own properties and rental income
- Tenant Portal: View lease, pay rent, submit maintenance requests
- Finance: View-only access to financial reports
- Admin: Full system access

### Workflow State Machine

```
PROPERTY LISTINGS: Active → (Inactive) → Sold/Rented (or Expired)
LEASES: Draft → Active → (Renewed) → Expired (or Terminated)
RENT PAYMENTS: Pending → Received (or Late/Overdue)
MAINTENANCE REQUESTS: New → Assigned → In Progress → Completed
TRANSACTIONS: Initiated → In Progress → Completed (or Cancelled)
```

---

## 16. Restaurant & Food Ordering Module

### Summary

Complete restaurant management with menu, orders, delivery, and kitchen operations.

### Database Schema

#### Restaurant Configuration Table

```sql
- id (Primary Key)
- restaurant_name (String)
- address (Text)
- city (String)
- phone (String)
- email (String)
- cuisine_type (JSON Array) - Italian, Chinese, etc.
- opening_hours (JSON) - Days and hours
- seating_capacity (Integer)
- logo_url (String)
- is_operational (Boolean)
```

#### Menu Categories Table

```sql
- id (Primary Key)
- category_name (String) - Appetizers, Main Course, Desserts, Drinks, etc.
- description (Text)
- image_url (String)
- order_sequence (Integer)
- is_active (Boolean)
```

#### Menu Items Table

```sql
- id (Primary Key)
- item_code (String, Unique)
- name (String)
- description (Text)
- category_id (Foreign Key → Menu Categories)
- price (Decimal)
- cost (Decimal)
- spicy_level (Enum: Mild, Medium, Hot, Extra Hot)
- vegetarian (Boolean)
- allergens (JSON Array) - Nuts, Gluten, Dairy, etc.
- image_url (String)
- ingredients (Text)
- preparation_time_minutes (Integer)
- available_quantities (Integer, Nullable)
- is_available (Boolean)
- is_popular (Boolean)
- rating (Decimal: 1-5)
- review_count (Integer)
- created_at (DateTime)
```

#### Menu Item Variants Table

```sql
- id (Primary Key)
- menu_item_id (Foreign Key → Menu Items)
- variant_type (Enum: Size, Spice Level, Add-ons, etc.)
- variant_value (String) - Small, Medium, Large, Extra Hot, etc.
- additional_price (Decimal)
```

#### Tables Table

```sql
- id (Primary Key)
- table_number (String, Unique)
- capacity (Integer) - Number of seats
- location (String) - Hall, Private Room, Outdoor, etc.
- status (Enum: Available, Occupied, Reserved, Maintenance)
- QR_code (String, Nullable) - For digital menu access
```

#### Reservations Table

```sql
- id (Primary Key)
- reservation_number (String, Unique)
- customer_name (String)
- customer_phone (String)
- customer_email (String, Nullable)
- reservation_date (Date)
- reservation_time (Time)
- number_of_guests (Integer)
- table_id (Foreign Key → Tables)
- special_requests (Text)
- status (Enum: Confirmed, Checked In, Completed, Cancelled, No-show)
- created_at (DateTime)
```

#### Dine-in Orders Table

```sql
- id (Primary Key)
- order_number (String, Unique)
- table_id (Foreign Key → Tables)
- order_time (DateTime)
- customer_name (String, Nullable)
- waiter_assigned (Foreign Key → Employees)
- status (Enum: New, Kitchen Processing, Ready, Served, Completed, Cancelled)
- subtotal (Decimal)
- tax (Decimal)
- service_charge (Decimal)
- discount (Decimal)
- total_amount (Decimal)
- payment_status (Enum: Unpaid, Paid)
- payment_method (Enum: Cash, Card, Online)
- notes (String)
- created_at (DateTime)
```

#### Online Delivery Orders Table

```sql
- id (Primary Key)
- order_number (String, Unique)
- customer_id (Foreign Key → Customers)
- customer_name (String)
- customer_phone (String)
- delivery_address (Text)
- delivery_latitude (Decimal)
- delivery_longitude (Decimal)
- order_time (DateTime)
- delivery_time (DateTime, Nullable)
- status (Enum: Pending, Confirmed, Preparing, Ready, Out For Delivery, Delivered, Cancelled)
- subtotal (Decimal)
- delivery_charge (Decimal)
- tax (Decimal)
- discount (Decimal)
- total_amount (Decimal)
- payment_status (Enum: Pending, Paid)
- payment_method (Enum: Card, Online, Cash on Delivery)
- delivery_agent_id (Foreign Key → Delivery Partners)
- rating (Integer: 1-5, Nullable)
- feedback (Text, Nullable)
- notes (String)
- created_at (DateTime)
```

#### Order Items Table

```sql
- id (Primary Key)
- order_id (Foreign Key → Orders)
- menu_item_id (Foreign Key ��� Menu Items)
- quantity (Integer)
- unit_price (Decimal)
- special_instructions (Text, Nullable)
- item_status (Enum: New, Preparing, Ready, Served, Cancelled)
- preparation_start_time (DateTime, Nullable)
- preparation_end_time (DateTime, Nullable)
```

#### Kitchen Queue Table

```sql
- id (Primary Key)
- order_id (Foreign Key → Orders)
- station (Enum: Grill, Fryer, Prep, Pastry, Bar)
- item_count (Integer)
- priority (Enum: Normal, High, Urgent)
- status (Enum: Pending, In Progress, Completed)
- assigned_chef (Foreign Key → Employees)
```

#### Delivery Partners Table

```sql
- id (Primary Key)
- partner_id (String, Unique)
- name (String)
- phone (String)
- vehicle_type (Enum: Bike, Scooter, Car)
- vehicle_number (String)
- status (Enum: Available, On Delivery, Offline)
- current_location_lat (Decimal)
- current_location_lng (Decimal)
- delivery_count (Integer)
- rating (Decimal: 1-5)
- total_earnings (Decimal)
```

#### Reviews Table

```sql
- id (Primary Key)
- order_id (Foreign Key → Orders)
- customer_name (String)
- rating (Integer: 1-5)
- food_quality (Integer: 1-5)
- delivery_quality (Integer: 1-5)
- comment (Text)
- photos_urls (JSON Array)
- status (Enum: Pending Approval, Approved, Rejected)
- created_at (DateTime)
```

### UI Views

1. **Restaurant Dashboard**: Today's orders, revenue, table occupancy, kitchen status, delivery tracking
2. **Menu Management**: Categories, items, pricing, images, availability
3. **Dine-in Ordering**: Table selection, order placement, order tracking
4. **Online Ordering**: Menu browsing, cart, checkout, delivery address
5. **Kitchen Display System (KDS)**: Real-time order queue by station, preparation status
6. **Table Management**: Availability, reservations, status tracking
7. **Reservation System**: Booking, check-in/out, availability calendar
8. **Delivery Tracking**: Real-time map, driver location, delivery status
9. **Admin Dashboard**: Sales analysis, staff performance, inventory
10. **Customer Portal**: Order history, reviews, favorites, reorder

### Actions & Automations

- Auto-send order confirmation (SMS/Email)
- Auto-update kitchen display based on order
- Auto-assign delivery agent based on location and load
- Auto-send delivery tracking link
- Auto-send delivery completed notification
- Auto-request review post-delivery
- Auto-apply discounts based on time and loyalty
- Auto-manage table status and reservations
- Auto-generate daily sales reports
- Auto-flag popular items for restocking

### User Permissions

- Restaurant Manager: Full access to orders, inventory, staff, analytics
- Waiter: Can take dine-in orders, view table status
- Kitchen Staff: Can see assigned orders, update status
- Delivery Agent: Can accept/reject deliveries, update location
- Cashier: Can process payments
- Admin: Full system access
- Customer: Can browse menu, place orders, track delivery

### Workflow State Machine

```
DINE-IN ORDERS: New → Kitchen Processing → Ready → Served → Completed (or Cancelled)
DELIVERY ORDERS: Pending → Confirmed → Preparing → Ready → Out For Delivery → Delivered (or Cancelled)
RESERVATIONS: Confirmed → Checked In → Completed (or Cancelled/No-show)
KITCHEN QUEUE: Pending → In Progress → Completed
```

---

## 17. Administration & Permissions Module

### Summary

System-wide administration, user management, role-based access control, and audit trails.

### Database Schema

#### Users Table

```sql
- id (Primary Key)
- username (String, Unique)
- email (String, Unique)
- password_hash (String) - Bcrypt hashed
- first_name (String)
- last_name (String)
- phone (String, Nullable)
- photo_url (String, Nullable)
- status (Enum: Active, Inactive, Suspended)
- last_login (DateTime)
- password_reset_required (Boolean)
- two_factor_enabled (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

#### Roles Table

```sql
- id (Primary Key)
- role_name (String, Unique) - Admin, Manager, Staff, Viewer, etc.
- description (Text)
- is_system_role (Boolean) - System roles cannot be deleted
- permissions_count (Integer)
- users_count (Integer)
- created_at (DateTime)
```

#### Permissions Table

```sql
- id (Primary Key)
- permission_code (String, Unique)
- description (String)
- module (String) - CRM, Sales, Purchases, etc.
- action (String) - Create, Read, Update, Delete, Approve, etc.
- resource_type (String) - Customer, Order, Invoice, etc.
```

#### Role Permissions Table

```sql
- id (Primary Key)
- role_id (Foreign Key → Roles)
- permission_id (Foreign Key → Permissions)
```

#### User Roles Table

```sql
- id (Primary Key)
- user_id (Foreign Key → Users)
- role_id (Foreign Key → Roles)
- assigned_date (DateTime)
- assigned_by (Foreign Key → Users)
```

#### User Department Assignment Table

```sql
- id (Primary Key)
- user_id (Foreign Key → Users)
- department_id (Foreign Key → Departments)
- role_in_department (String)
- assignment_date (DateTime)
```

#### Audit Log Table

```sql
- id (Primary Key)
- user_id (Foreign Key → Users)
- action (String) - Created, Updated, Deleted, Approved, etc.
- module (String)
- resource_type (String)
- resource_id (String)
- old_values (JSON) - Before changes
- new_values (JSON) - After changes
- ip_address (String)
- timestamp (DateTime)
- status (Enum: Success, Failure)
- error_message (String, Nullable)
```

#### System Settings Table

```sql
- id (Primary Key)
- setting_key (String, Unique)
- setting_value (String/JSON)
- data_type (Enum: String, Number, Boolean, JSON, Date)
- description (Text)
- updated_by (Foreign Key → Users)
- updated_at (DateTime)
```

#### Email Templates Table

```sql
- id (Primary Key)
- template_code (String, Unique)
- template_name (String)
- subject (String)
- body (Text) - HTML with placeholders
- use_case (String) - Order Confirmation, Invoice, etc.
- is_active (Boolean)
- created_by (Foreign Key → Users)
- updated_at (DateTime)
```

#### API Keys Table

```sql
- id (Primary Key)
- api_key (String, Unique, Encrypted)
- api_name (String)
- user_id (Foreign Key → Users)
- permissions (JSON Array)
- last_used (DateTime, Nullable)
- expires_at (DateTime, Nullable)
- is_active (Boolean)
- created_at (DateTime)
```

### UI Views

1. **Admin Dashboard**: System health, user statistics, recent activities, security alerts
2. **Users Management**: List, form, role assignment, permission grants
3. **Roles Management**: Create/edit roles, assign permissions
4. **Permissions Matrix**: Visual grid of roles vs. permissions
5. **Audit Trail**: Searchable log of all system changes with details
6. **System Settings**: Configure system-wide parameters
7. **Email Templates**: Manage transactional email templates
8. **API Keys Management**: Generate and manage API keys
9. **Backup Management**: Schedule and execute backups
10. **System Health**: Database, server status, performance metrics

### Actions & Automations

- Auto-log all user activities
- Auto-send suspicious activity alerts to admins
- Auto-expire API keys
- Auto-enforce password policies (expiry, complexity)
- Auto-backup database at configured intervals
- Auto-send login alerts for unusual activity
- Auto-purge old audit logs based on retention policy
- Auto-disable inactive accounts
- Auto-update system when new versions available

### User Permissions

- Super Admin: Full system access
- Admin: Can manage users, roles, permissions
- Manager: Can manage users within department
- Auditor: View-only access to audit logs

### Additional Features

- Single Sign-On (SSO) integration support
- Multi-factor authentication (MFA)
- Password reset flow
- API documentation and testing
- Data export functionality
- System backup and restore
- Database migration tools

---

# SYSTEM-WIDE FEATURES

## User Authentication & Authorization

- User registration and login
- Password reset and change
- Session management
- Multi-factor authentication
- SSO integration (OAuth, LDAP)

## Notification System

- Email notifications
- SMS alerts
- In-app notifications
- Push notifications for mobile
- Notification preferences per user

## Search & Filtering

- Full-text search across modules
- Advanced filters and saved searches
- Bulk operations (select multiple, perform action)
- Export data (Excel, PDF, CSV)

## Reporting & Analytics

- Standard reports for each module
- Custom report builder
- Scheduled report delivery
- Dashboard widgets
- Data visualization (charts, graphs, maps)

## Integration Points

- REST API for third-party integrations
- Webhook support for event notifications
- Export integrations (Accounting software, CRM, etc.)
- Payment gateway integrations
- Email and SMS gateway integration

## Mobile Applications

- Mobile app for key operations (Sales, Inventory, HR, Field Sales)
- Offline functionality for critical features
- Sync when connection available

## Customization

- Custom fields per module
- Custom workflows and automations
- Branding customization
- Field-level security

---

# ODOO-LIKE DESIGN SYSTEM

## Color Palette (Quiet & Professional)

- **Primary**: #2C3E50 (Dark Blue-Gray)
- **Secondary**: #34495E (Medium Gray-Blue)
- **Accent**: #3498DB (Sky Blue)
- **Success**: #27AE60 (Green)
- **Warning**: #F39C12 (Orange)
- **Danger**: #E74C3C (Red)
- **Background**: #ECF0F1 (Light Gray)
- **Text**: #2C3E50 (Dark Gray)

## Layout Components

- Top navigation bar (Logo, Search, User menu, Notifications)
- Sidebar (Module navigation, collapsible)
- Main content area (Breadcrumbs, page title, filters)
- Card-based layouts for data display
- Responsive design (Desktop, Tablet, Mobile)

## Typography

- **Headings**: Inter/Roboto, Bold, sizes H1-H6
- **Body**: Inter/Roboto, Regular, 14px
- **Labels**: Inter/Roboto, Medium, 12px

## UI Patterns

- List views with inline actions
- Form views with sections and tabs
- Kanban boards for status/category grouping
- Gantt charts for timeline visualization
- Tree views for hierarchical data
- Matrix/Grid views for cross-tabulation
- Dashboard widgets (KPIs, charts, tables)

## Icons

- Lucide React icons throughout
- Consistent icon sizing
- Icon colors matching semantic meaning

---

This comprehensive document provides the complete blueprint for building a production-ready ERP system. Each module can be developed incrementally, with the core infrastructure (Users, Roles, Permissions, Notifications) being foundational for all other modules.
