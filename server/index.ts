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

// CRM module routes
import { 
  getLeads, createLead, updateLead, deleteLead,
  getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity,
  getActivities, createActivity, updateActivity,
  getContacts, createContact, updateContact,
  getAnalytics
} from "./routes/crm.js";

// E-Commerce module routes
import {
  getProducts as getEcomProducts,
  createProduct as createEcomProduct,
  updateProduct as updateEcomProduct,
  deleteProduct as deleteEcomProduct,
  getOrders as getEcomOrders,
  createOrder as createEcomOrder,
  updateOrder as updateEcomOrder,
  getCustomers as getEcomCustomers,
  createCustomer as createEcomCustomer,
  updateCustomer as updateEcomCustomer,
  getReviews,
  createReview,
  updateReview,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAnalytics as getEcomAnalytics,
  getWebsiteSettings,
  saveWebsiteSettings
} from "./routes/ecommerce.js";

// Purchases module routes
import {
  getVendors, createVendor, updateVendor, deleteVendor,
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
  getRFQs, createRFQ, updateRFQ,
  getPurchasesAnalytics
} from "./routes/purchases.js";

// Inventory module routes
import {
  getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  getWarehouses, createWarehouse, updateWarehouse,
  getStockMovements, createStockMovement, updateStockMovement,
  getStockTransfers, createStockTransfer, updateStockTransfer,
  getInventoryAnalytics
} from "./routes/inventory.js";

// Manufacturing module routes
import {
  getBOMs, createBOM, updateBOM, deleteBOM,
  getProductionOrders, createProductionOrder, updateProductionOrder, deleteProductionOrder,
  getWorkOrders, createWorkOrder, updateWorkOrder,
  getQualityChecks, createQualityCheck, updateQualityCheck,
  getManufacturingAnalytics
} from "./routes/manufacturing.js";

// Accounting module routes
import {
  getAccounts, createAccount, updateAccount, deleteAccount,
  getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry,
  getInvoices, createInvoice, updateInvoice, deleteInvoice,
  getBills, createBill, updateBill, deleteBill,
  getAccountingAnalytics
} from "./routes/accounting.js";

// HR module routes
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getAttendance, createAttendance, updateAttendance, deleteAttendance,
  getLeaveRequests, createLeaveRequest, updateLeaveRequest, deleteLeaveRequest,
  getHRAnalytics
} from "./routes/hr.js";

// Payroll module routes
import {
  getPayrollRecords, createPayrollRecord, updatePayrollRecord, deletePayrollRecord,
  getSalaryComponents, createSalaryComponent, updateSalaryComponent, deleteSalaryComponent,
  getTaxRules, createTaxRule, updateTaxRule, deleteTaxRule,
  getBonuses, createBonus, updateBonus, deleteBonus,
  getPayrollAnalytics
} from "./routes/payroll.js";

// Surveys module routes
import {
  getSurveys, createSurvey, updateSurvey, deleteSurvey,
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getResponses, createResponse, deleteResponse,
  getSurveyAnalytics
} from "./routes/surveys.js";

// SMS Marketing module routes
import {
  getCampaigns, createCampaign, updateCampaign, deleteCampaign, launchCampaign,
  getContacts as getSMSContacts, createContact as createSMSContact, updateContact as updateSMSContact, deleteContact as deleteSMSContact,
  getGroups, createGroup, updateGroup, deleteGroup,
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getMessages, sendSMS,
  getAnalytics as getSMSAnalytics,
  getCampaignReports
} from "./routes/sms-marketing.js";

// Repairs module routes
import {
  getRepairs, createRepair, updateRepair, deleteRepair,
  getParts, createPart, updatePart, deletePart,
  getRepairAnalytics
} from "./routes/repairs.js";

// Barcode module routes
import {
  getProducts as getBarcodeProducts, createProduct as createBarcodeProduct,
  updateProduct as updateBarcodeProduct, deleteProduct as deleteBarcodeProduct,
  getScans, createScan
} from "./routes/barcode.js";

// Attendances module routes
import {
  getAttendanceRecords, createAttendanceRecord, checkIn, checkOut, getAttendanceAnalytics
} from "./routes/attendances.js";

// Employee Contracts module routes
import {
  getContracts, createContract, updateContract, deleteContract,
  getContractById, getContractsAnalytics, renewContract, terminateContract
} from "./routes/contracts.js";

// Employee Referrals module routes
import {
  getReferrals, createReferral, updateReferral, deleteReferral,
  getReferralBonuses, createReferralBonus, updateReferralBonus,
  getReferralAnalytics,
  getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate,
  getContractRenewals, createContractRenewal
} from "./routes/referrals.js";

// Projects module routes
import {
  getProjects, createProject, updateProject, deleteProject,
  getTasks, createTask, updateTask,
  getProjectsAnalytics
} from "./routes/projects.js";

// Restaurant module routes
import {
  getTables, createTable, updateTable,
  getOrders as getRestaurantOrders, createOrder as createRestaurantOrder, updateOrder as updateRestaurantOrder,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  getRestaurantAnalytics
} from "./routes/restaurant.js";

// POS module routes
import {
  getProducts as getPOSProducts, createProduct as createPOSProduct,
  updateProduct as updatePOSProduct, deleteProduct as deletePOSProduct,
  getSales, createSale,
  getCustomers as getPOSCustomers, createCustomer as createPOSCustomer,
  updateCustomer as updatePOSCustomer,
  getPOSAnalytics
} from "./routes/pos.js";

// Helpdesk module routes
import {
  getTickets, createTicket, updateTicket, deleteTicket,
  getHelpdeskAnalytics
} from "./routes/helpdesk.js";

// Appointments module routes
import {
  getAppointments as getAppointmentsList, createAppointment as createAppointmentRecord,
  updateAppointment as updateAppointmentRecord, deleteAppointment as deleteAppointmentRecord
} from "./routes/appointments.js";

// Notes module routes
import {
  getNotes, createNote, updateNote, deleteNote
} from "./routes/notes.js";

// Skills Management module routes
import {
  getSkills, createSkill, updateSkill, deleteSkill,
  getEmployeeSkills, assignSkillToEmployee
} from "./routes/skills.js";

// Online Jobs module routes
import {
  getJobs, createJob, updateJob, deleteJob,
  getApplications, createApplication
} from "./routes/onlineJobs.js";

// Live Chat module routes
import {
  getConversations as getChatConversations, createConversation as createChatConversation, updateConversation as updateChatConversation,
  getMessages as getChatMessages, sendMessage as sendChatMessage,
  getOperators as getChatOperators, createOperator as createChatOperator, updateOperatorStatus as updateChatOperatorStatus,
  getChatAnalytics,
  getCannedResponses as getChatCannedResponses, createCannedResponse as createChatCannedResponse, updateCannedResponse as updateChatCannedResponse, deleteCannedResponse as deleteChatCannedResponse
} from "./routes/livechat.js";

// VoIP module routes
import {
  getCalls as getVoIPCalls, createCall as createVoIPCall, updateCall as updateVoIPCall, deleteCall as deleteVoIPCall,
  getActiveCalls as getVoIPActiveCalls, transferCall as transferVoIPCall,
  getPhoneNumbers as getVoIPPhoneNumbers, createPhoneNumber as createVoIPPhoneNumber, updatePhoneNumber as updateVoIPPhoneNumber, deletePhoneNumber as deleteVoIPPhoneNumber,
  getRecordings as getVoIPRecordings, createRecording as createVoIPRecording, deleteRecording as deleteVoIPRecording,
  getVoIPAnalytics,
  getCallQueue as getVoIPCallQueue, addToQueue as addVoIPToQueue
} from "./routes/voip.js";

// Email Marketing module routes
import {
  getCampaigns as getEmailCampaigns, createCampaign as createEmailCampaign,
  updateCampaign as updateEmailCampaign, deleteCampaign as deleteEmailCampaign, launchCampaign as launchEmailCampaign,
  getLists as getEmailLists, createList as createEmailList, updateList as updateEmailList, deleteList as deleteEmailList,
  getSubscribers as getEmailSubscribers, createSubscriber as createEmailSubscriber, updateSubscriber as updateEmailSubscriber, deleteSubscriber as deleteEmailSubscriber,
  getTemplates as getEmailTemplates, createTemplate as createEmailTemplate,
  updateTemplate as updateEmailTemplate, deleteTemplate as deleteEmailTemplate,
  getEmailAnalytics, sendEmail
} from "./routes/emailmarketing.js";

// Website Builder module routes
import {
  getPages as getWebsitePages, createPage as createWebsitePage, updatePage as updateWebsitePage, deletePage as deleteWebsitePage, publishPage as publishWebsitePage,
  getMenus as getWebsiteMenus, createMenu as createWebsiteMenu, updateMenu as updateWebsiteMenu, deleteMenu as deleteWebsiteMenu,
  getBlocks as getWebsiteBlocks, createBlock as createWebsiteBlock, updateBlock as updateWebsiteBlock, deleteBlock as deleteWebsiteBlock,
  getSettings as getWebsiteSettings, updateSettings as updateWebsiteSettings,
  getWebsiteAnalytics,
  getForms as getWebsiteForms, createForm as createWebsiteForm, getFormSubmissions as getWebsiteFormSubmissions
} from "./routes/website.js";

// Admin module routes
import {
  getUsers, createUser, updateUser, deleteUser,
  getRoles, createRole, updateRole, deleteRole,
  getAdminAnalytics
} from "./routes/admin.js";

// Medical module routes
import {
  getPatients as getMedicalPatients, createPatient as createMedicalPatient,
  updatePatient as updateMedicalPatient, deletePatient as deleteMedicalPatient,
  getMedicalAppointments, createMedicalAppointment, updateMedicalAppointment,
  getPrescriptions, createPrescription, updatePrescription,
  getMedicalAnalytics
} from "./routes/medical.js";

// School module routes
import {
  getStudents, createStudent, updateStudent, deleteStudent,
  getClasses, createClass, updateClass, deleteClass,
  getGrades, createGrade, updateGrade,
  getSchoolAnalytics
} from "./routes/school.js";

// Real Estate module routes
import {
  getProperties, createProperty, updateProperty, deleteProperty,
  getTenants, createTenant, updateTenant, deleteTenant,
  getLeases, createLease, updateLease, deleteLease,
  getRealEstateAnalytics
} from "./routes/realestate.js";

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

  // CRM - Leads API routes
  app.get("/api/crm/leads", getLeads);
  app.post("/api/crm/leads", createLead);
  app.put("/api/crm/leads/:id", updateLead);
  app.delete("/api/crm/leads/:id", deleteLead);

  // CRM - Opportunities API routes
  app.get("/api/crm/opportunities", getOpportunities);
  app.post("/api/crm/opportunities", createOpportunity);
  app.put("/api/crm/opportunities/:id", updateOpportunity);
  app.delete("/api/crm/opportunities/:id", deleteOpportunity);

  // CRM - Activities API routes
  app.get("/api/crm/activities", getActivities);
  app.post("/api/crm/activities", createActivity);
  app.put("/api/crm/activities/:id", updateActivity);

  // CRM - Contacts API routes
  app.get("/api/crm/contacts", getContacts);
  app.post("/api/crm/contacts", createContact);
  app.put("/api/crm/contacts/:id", updateContact);

  // CRM - Analytics API route
  app.get("/api/crm/analytics", getAnalytics);

  // E-Commerce - Products API routes
  app.get("/api/ecommerce/products", getEcomProducts);
  app.post("/api/ecommerce/products", createEcomProduct);
  app.put("/api/ecommerce/products/:id", updateEcomProduct);
  app.delete("/api/ecommerce/products/:id", deleteEcomProduct);

  // E-Commerce - Orders API routes
  app.get("/api/ecommerce/orders", getEcomOrders);
  app.post("/api/ecommerce/orders", createEcomOrder);
  app.put("/api/ecommerce/orders/:id", updateEcomOrder);

  // E-Commerce - Customers API routes
  app.get("/api/ecommerce/customers", getEcomCustomers);
  app.post("/api/ecommerce/customers", createEcomCustomer);
  app.put("/api/ecommerce/customers/:id", updateEcomCustomer);

  // E-Commerce - Reviews API routes
  app.get("/api/ecommerce/reviews", getReviews);
  app.post("/api/ecommerce/reviews", createReview);
  app.put("/api/ecommerce/reviews/:id", updateReview);

  // E-Commerce - Coupons API routes
  app.get("/api/ecommerce/coupons", getCoupons);
  app.post("/api/ecommerce/coupons", createCoupon);
  app.put("/api/ecommerce/coupons/:id", updateCoupon);
  app.delete("/api/ecommerce/coupons/:id", deleteCoupon);

  // E-Commerce - Analytics API route
  app.get("/api/ecommerce/analytics", getEcomAnalytics);

  // E-Commerce - Website Settings API routes
  app.get("/api/ecommerce/website-settings", getWebsiteSettings);
  app.post("/api/ecommerce/website-settings", saveWebsiteSettings);

  // Purchases - Vendors API routes
  app.get("/api/purchases/vendors", getVendors);
  app.post("/api/purchases/vendors", createVendor);
  app.put("/api/purchases/vendors/:id", updateVendor);
  app.delete("/api/purchases/vendors/:id", deleteVendor);

  // Purchases - Purchase Orders API routes
  app.get("/api/purchases/orders", getPurchaseOrders);
  app.post("/api/purchases/orders", createPurchaseOrder);
  app.put("/api/purchases/orders/:id", updatePurchaseOrder);
  app.delete("/api/purchases/orders/:id", deletePurchaseOrder);

  // Purchases - RFQs API routes
  app.get("/api/purchases/rfqs", getRFQs);
  app.post("/api/purchases/rfqs", createRFQ);
  app.put("/api/purchases/rfqs/:id", updateRFQ);

  // Purchases - Analytics API route
  app.get("/api/purchases/analytics", getPurchasesAnalytics);

  // Inventory - Items API routes
  app.get("/api/inventory/items", getInventoryItems);
  app.post("/api/inventory/items", createInventoryItem);
  app.put("/api/inventory/items/:id", updateInventoryItem);
  app.delete("/api/inventory/items/:id", deleteInventoryItem);

  // Inventory - Warehouses API routes
  app.get("/api/inventory/warehouses", getWarehouses);
  app.post("/api/inventory/warehouses", createWarehouse);
  app.put("/api/inventory/warehouses/:id", updateWarehouse);

  // Inventory - Stock Movements API routes
  app.get("/api/inventory/movements", getStockMovements);
  app.post("/api/inventory/movements", createStockMovement);
  app.put("/api/inventory/movements/:id", updateStockMovement);

  // Inventory - Stock Transfers API routes
  app.get("/api/inventory/transfers", getStockTransfers);
  app.post("/api/inventory/transfers", createStockTransfer);
  app.put("/api/inventory/transfers/:id", updateStockTransfer);

  // Inventory - Analytics API route
  app.get("/api/inventory/analytics", getInventoryAnalytics);

  // Manufacturing - BOMs API routes
  app.get("/api/manufacturing/boms", getBOMs);
  app.post("/api/manufacturing/boms", createBOM);
  app.put("/api/manufacturing/boms/:id", updateBOM);
  app.delete("/api/manufacturing/boms/:id", deleteBOM);

  // Manufacturing - Production Orders API routes
  app.get("/api/manufacturing/orders", getProductionOrders);
  app.post("/api/manufacturing/orders", createProductionOrder);
  app.put("/api/manufacturing/orders/:id", updateProductionOrder);
  app.delete("/api/manufacturing/orders/:id", deleteProductionOrder);

  // Manufacturing - Work Orders API routes
  app.get("/api/manufacturing/workorders", getWorkOrders);
  app.post("/api/manufacturing/workorders", createWorkOrder);
  app.put("/api/manufacturing/workorders/:id", updateWorkOrder);

  // Manufacturing - Quality Checks API routes
  app.get("/api/manufacturing/quality-checks", getQualityChecks);
  app.post("/api/manufacturing/quality-checks", createQualityCheck);
  app.put("/api/manufacturing/quality-checks/:id", updateQualityCheck);

  // Manufacturing - Analytics API route
  app.get("/api/manufacturing/analytics", getManufacturingAnalytics);

  // Accounting - Chart of Accounts API routes
  app.get("/api/accounting/accounts", getAccounts);
  app.post("/api/accounting/accounts", createAccount);
  app.put("/api/accounting/accounts/:id", updateAccount);
  app.delete("/api/accounting/accounts/:id", deleteAccount);

  // Accounting - Journal Entries API routes
  app.get("/api/accounting/journal-entries", getJournalEntries);
  app.post("/api/accounting/journal-entries", createJournalEntry);
  app.put("/api/accounting/journal-entries/:id", updateJournalEntry);
  app.delete("/api/accounting/journal-entries/:id", deleteJournalEntry);

  // Accounting - Invoices API routes
  app.get("/api/accounting/invoices", getInvoices);
  app.post("/api/accounting/invoices", createInvoice);
  app.put("/api/accounting/invoices/:id", updateInvoice);
  app.delete("/api/accounting/invoices/:id", deleteInvoice);

  // Accounting - Bills API routes
  app.get("/api/accounting/bills", getBills);
  app.post("/api/accounting/bills", createBill);
  app.put("/api/accounting/bills/:id", updateBill);
  app.delete("/api/accounting/bills/:id", deleteBill);

  // Accounting - Analytics API route
  app.get("/api/accounting/analytics", getAccountingAnalytics);

  // HR - Employees API routes
  app.get("/api/hr/employees", getEmployees);
  app.post("/api/hr/employees", createEmployee);
  app.put("/api/hr/employees/:id", updateEmployee);
  app.delete("/api/hr/employees/:id", deleteEmployee);

  // HR - Departments API routes
  app.get("/api/hr/departments", getDepartments);
  app.post("/api/hr/departments", createDepartment);
  app.put("/api/hr/departments/:id", updateDepartment);
  app.delete("/api/hr/departments/:id", deleteDepartment);

  // HR - Attendance API routes
  app.get("/api/hr/attendance", getAttendance);
  app.post("/api/hr/attendance", createAttendance);
  app.put("/api/hr/attendance/:id", updateAttendance);
  app.delete("/api/hr/attendance/:id", deleteAttendance);

  // HR - Leave Requests API routes
  app.get("/api/hr/leave-requests", getLeaveRequests);
  app.post("/api/hr/leave-requests", createLeaveRequest);
  app.put("/api/hr/leave-requests/:id", updateLeaveRequest);
  app.delete("/api/hr/leave-requests/:id", deleteLeaveRequest);

  // HR - Analytics API route
  app.get("/api/hr/analytics", getHRAnalytics);

  // Payroll - Records API routes
  app.get("/api/payroll/records", getPayrollRecords);
  app.post("/api/payroll/records", createPayrollRecord);
  app.put("/api/payroll/records/:id", updatePayrollRecord);
  app.delete("/api/payroll/records/:id", deletePayrollRecord);

  // Payroll - Salary Components API routes
  app.get("/api/payroll/salary-components", getSalaryComponents);
  app.post("/api/payroll/salary-components", createSalaryComponent);
  app.put("/api/payroll/salary-components/:id", updateSalaryComponent);
  app.delete("/api/payroll/salary-components/:id", deleteSalaryComponent);

  // Payroll - Tax Rules API routes
  app.get("/api/payroll/tax-rules", getTaxRules);
  app.post("/api/payroll/tax-rules", createTaxRule);
  app.put("/api/payroll/tax-rules/:id", updateTaxRule);
  app.delete("/api/payroll/tax-rules/:id", deleteTaxRule);

  // Payroll - Bonuses API routes
  app.get("/api/payroll/bonuses", getBonuses);
  app.post("/api/payroll/bonuses", createBonus);
  app.put("/api/payroll/bonuses/:id", updateBonus);
  app.delete("/api/payroll/bonuses/:id", deleteBonus);

  // Payroll - Analytics API route
  app.get("/api/payroll/analytics", getPayrollAnalytics);

  // Surveys API routes
  app.get("/api/surveys/surveys", getSurveys);
  app.post("/api/surveys/surveys", createSurvey);
  app.put("/api/surveys/surveys/:id", updateSurvey);
  app.delete("/api/surveys/surveys/:id", deleteSurvey);

  // Surveys - Questions API routes
  app.get("/api/surveys/questions", getQuestions);
  app.post("/api/surveys/questions", createQuestion);
  app.put("/api/surveys/questions/:id", updateQuestion);
  app.delete("/api/surveys/questions/:id", deleteQuestion);

  // Surveys - Responses API routes
  app.get("/api/surveys/responses", getResponses);
  app.post("/api/surveys/responses", createResponse);
  app.delete("/api/surveys/responses/:id", deleteResponse);

  // Surveys - Analytics API route
  app.get("/api/surveys/analytics", getSurveyAnalytics);

  // SMS Marketing - Campaigns API routes
  app.get("/api/sms/campaigns", getCampaigns);
  app.post("/api/sms/campaigns", createCampaign);
  app.put("/api/sms/campaigns/:id", updateCampaign);
  app.delete("/api/sms/campaigns/:id", deleteCampaign);
  app.post("/api/sms/campaigns/:id/launch", launchCampaign);

  // SMS Marketing - Contacts API routes
  app.get("/api/sms/contacts", getSMSContacts);
  app.post("/api/sms/contacts", createSMSContact);
  app.put("/api/sms/contacts/:id", updateSMSContact);
  app.delete("/api/sms/contacts/:id", deleteSMSContact);

  // SMS Marketing - Groups API routes
  app.get("/api/sms/groups", getGroups);
  app.post("/api/sms/groups", createGroup);
  app.put("/api/sms/groups/:id", updateGroup);
  app.delete("/api/sms/groups/:id", deleteGroup);

  // SMS Marketing - Templates API routes
  app.get("/api/sms/templates", getTemplates);
  app.post("/api/sms/templates", createTemplate);
  app.put("/api/sms/templates/:id", updateTemplate);
  app.delete("/api/sms/templates/:id", deleteTemplate);

  // SMS Marketing - Messages API routes
  app.get("/api/sms/messages", getMessages);
  app.post("/api/sms/send", sendSMS);

  // SMS Marketing - Analytics & Reports API routes
  app.get("/api/sms/analytics", getSMSAnalytics);
  app.get("/api/sms/reports/:id", getCampaignReports);

  // Repairs API routes
  app.get("/api/repairs/repairs", getRepairs);
  app.post("/api/repairs/repairs", createRepair);
  app.put("/api/repairs/repairs/:id", updateRepair);
  app.delete("/api/repairs/repairs/:id", deleteRepair);
  app.get("/api/repairs/parts", getParts);
  app.post("/api/repairs/parts", createPart);
  app.put("/api/repairs/parts/:id", updatePart);
  app.delete("/api/repairs/parts/:id", deletePart);
  app.get("/api/repairs/analytics", getRepairAnalytics);

  // Barcode API routes
  app.get("/api/barcode/products", getBarcodeProducts);
  app.post("/api/barcode/products", createBarcodeProduct);
  app.put("/api/barcode/products/:id", updateBarcodeProduct);
  app.delete("/api/barcode/products/:id", deleteBarcodeProduct);
  app.get("/api/barcode/scans", getScans);
  app.post("/api/barcode/scan", createScan);

  // Attendances API routes
  app.get("/api/attendances/records", getAttendanceRecords);
  app.post("/api/attendances/records", createAttendanceRecord);
  app.post("/api/attendances/check-in", checkIn);
  app.put("/api/attendances/records/:id/check-out", checkOut);
  app.get("/api/attendances/analytics", getAttendanceAnalytics);

  // Employee Contracts API routes
  app.get("/api/contracts/contracts", getContracts);
  app.get("/api/contracts/contracts/:id", getContractById);
  app.post("/api/contracts/contracts", createContract);
  app.put("/api/contracts/contracts/:id", updateContract);
  app.delete("/api/contracts/contracts/:id", deleteContract);
  app.get("/api/contracts/analytics", getContractsAnalytics);
  app.put("/api/contracts/contracts/:id/renew", renewContract);
  app.put("/api/contracts/contracts/:id/terminate", terminateContract);

  // Employee Referrals API routes
  app.get("/api/referrals/referrals", getReferrals);
  app.post("/api/referrals/referrals", createReferral);
  app.put("/api/referrals/referrals/:id", updateReferral);
  app.delete("/api/referrals/referrals/:id", deleteReferral);
  app.get("/api/referrals/bonuses", getReferralBonuses);
  app.post("/api/referrals/bonuses", createReferralBonus);
  app.put("/api/referrals/bonuses/:id", updateReferralBonus);
  app.get("/api/referrals/analytics", getReferralAnalytics);
  app.get("/api/referrals/templates", getContractTemplates);
  app.post("/api/referrals/templates", createContractTemplate);
  app.put("/api/referrals/templates/:id", updateContractTemplate);
  app.delete("/api/referrals/templates/:id", deleteContractTemplate);
  app.get("/api/referrals/renewals", getContractRenewals);
  app.post("/api/referrals/renewals", createContractRenewal);

  // Projects API routes
  app.get("/api/projects/projects", getProjects);
  app.post("/api/projects/projects", createProject);
  app.put("/api/projects/projects/:id", updateProject);
  app.delete("/api/projects/projects/:id", deleteProject);
  app.get("/api/projects/tasks", getTasks);
  app.post("/api/projects/tasks", createTask);
  app.put("/api/projects/tasks/:id", updateTask);
  app.get("/api/projects/analytics", getProjectsAnalytics);

  // Restaurant API routes
  app.get("/api/restaurant/tables", getTables);
  app.post("/api/restaurant/tables", createTable);
  app.put("/api/restaurant/tables/:id", updateTable);
  app.get("/api/restaurant/orders", getRestaurantOrders);
  app.post("/api/restaurant/orders", createRestaurantOrder);
  app.put("/api/restaurant/orders/:id", updateRestaurantOrder);
  app.get("/api/restaurant/menu", getMenuItems);
  app.post("/api/restaurant/menu", createMenuItem);
  app.put("/api/restaurant/menu/:id", updateMenuItem);
  app.delete("/api/restaurant/menu/:id", deleteMenuItem);
  app.get("/api/restaurant/analytics", getRestaurantAnalytics);

  // POS API routes
  app.get("/api/pos/products", getPOSProducts);
  app.post("/api/pos/products", createPOSProduct);
  app.put("/api/pos/products/:id", updatePOSProduct);
  app.delete("/api/pos/products/:id", deletePOSProduct);
  app.get("/api/pos/sales", getSales);
  app.post("/api/pos/sales", createSale);
  app.get("/api/pos/customers", getPOSCustomers);
  app.post("/api/pos/customers", createPOSCustomer);
  app.put("/api/pos/customers/:id", updatePOSCustomer);
  app.get("/api/pos/analytics", getPOSAnalytics);

  // Helpdesk API routes
  app.get("/api/helpdesk/tickets", getTickets);
  app.post("/api/helpdesk/tickets", createTicket);
  app.put("/api/helpdesk/tickets/:id", updateTicket);
  app.delete("/api/helpdesk/tickets/:id", deleteTicket);
  app.get("/api/helpdesk/analytics", getHelpdeskAnalytics);

  // Appointments API routes
  app.get("/api/appointments/appointments", getAppointmentsList);
  app.post("/api/appointments/appointments", createAppointmentRecord);
  app.put("/api/appointments/appointments/:id", updateAppointmentRecord);
  app.delete("/api/appointments/appointments/:id", deleteAppointmentRecord);

  // Notes API routes
  app.get("/api/notes/notes", getNotes);
  app.post("/api/notes/notes", createNote);
  app.put("/api/notes/notes/:id", updateNote);
  app.delete("/api/notes/notes/:id", deleteNote);

  // Skills Management API routes
  app.get("/api/skills/skills", getSkills);
  app.post("/api/skills/skills", createSkill);
  app.put("/api/skills/skills/:id", updateSkill);
  app.delete("/api/skills/skills/:id", deleteSkill);
  app.get("/api/skills/employee-skills", getEmployeeSkills);
  app.post("/api/skills/employee-skills", assignSkillToEmployee);

  // Online Jobs API routes
  app.get("/api/jobs/jobs", getJobs);
  app.post("/api/jobs/jobs", createJob);
  app.put("/api/jobs/jobs/:id", updateJob);
  app.delete("/api/jobs/jobs/:id", deleteJob);
  app.get("/api/jobs/applications", getApplications);
  app.post("/api/jobs/applications", createApplication);

  // Live Chat API routes
  app.get("/api/livechat/conversations", getChatConversations);
  app.post("/api/livechat/conversations", createChatConversation);
  app.put("/api/livechat/conversations/:id", updateChatConversation);
  app.get("/api/livechat/messages", getChatMessages);
  app.post("/api/livechat/messages", sendChatMessage);
  app.get("/api/livechat/operators", getChatOperators);
  app.post("/api/livechat/operators", createChatOperator);
  app.put("/api/livechat/operators/:id", updateChatOperatorStatus);
  app.get("/api/livechat/analytics", getChatAnalytics);
  app.get("/api/livechat/canned-responses", getChatCannedResponses);
  app.post("/api/livechat/canned-responses", createChatCannedResponse);
  app.put("/api/livechat/canned-responses/:id", updateChatCannedResponse);
  app.delete("/api/livechat/canned-responses/:id", deleteChatCannedResponse);

  // VoIP API routes
  app.get("/api/voip/calls", getVoIPCalls);
  app.post("/api/voip/calls", createVoIPCall);
  app.put("/api/voip/calls/:id", updateVoIPCall);
  app.delete("/api/voip/calls/:id", deleteVoIPCall);
  app.get("/api/voip/calls/active", getVoIPActiveCalls);
  app.post("/api/voip/calls/:id/transfer", transferVoIPCall);
  app.get("/api/voip/phone-numbers", getVoIPPhoneNumbers);
  app.post("/api/voip/phone-numbers", createVoIPPhoneNumber);
  app.put("/api/voip/phone-numbers/:id", updateVoIPPhoneNumber);
  app.delete("/api/voip/phone-numbers/:id", deleteVoIPPhoneNumber);
  app.get("/api/voip/recordings", getVoIPRecordings);
  app.post("/api/voip/recordings", createVoIPRecording);
  app.delete("/api/voip/recordings/:id", deleteVoIPRecording);
  app.get("/api/voip/analytics", getVoIPAnalytics);
  app.get("/api/voip/queue", getVoIPCallQueue);
  app.post("/api/voip/queue", addVoIPToQueue);

  // Email Marketing API routes
  app.get("/api/email/campaigns", getEmailCampaigns);
  app.post("/api/email/campaigns", createEmailCampaign);
  app.put("/api/email/campaigns/:id", updateEmailCampaign);
  app.delete("/api/email/campaigns/:id", deleteEmailCampaign);
  app.post("/api/email/campaigns/:id/launch", launchEmailCampaign);
  app.get("/api/email/lists", getEmailLists);
  app.post("/api/email/lists", createEmailList);
  app.put("/api/email/lists/:id", updateEmailList);
  app.delete("/api/email/lists/:id", deleteEmailList);
  app.get("/api/email/subscribers", getEmailSubscribers);
  app.post("/api/email/subscribers", createEmailSubscriber);
  app.put("/api/email/subscribers/:id", updateEmailSubscriber);
  app.delete("/api/email/subscribers/:id", deleteEmailSubscriber);
  app.get("/api/email/templates", getEmailTemplates);
  app.post("/api/email/templates", createEmailTemplate);
  app.put("/api/email/templates/:id", updateEmailTemplate);
  app.delete("/api/email/templates/:id", deleteEmailTemplate);
  app.get("/api/email/analytics", getEmailAnalytics);
  app.post("/api/email/send", sendEmail);

  // Website Builder API routes
  app.get("/api/website/pages", getWebsitePages);
  app.post("/api/website/pages", createWebsitePage);
  app.put("/api/website/pages/:id", updateWebsitePage);
  app.delete("/api/website/pages/:id", deleteWebsitePage);
  app.post("/api/website/pages/:id/publish", publishWebsitePage);
  app.get("/api/website/menus", getWebsiteMenus);
  app.post("/api/website/menus", createWebsiteMenu);
  app.put("/api/website/menus/:id", updateWebsiteMenu);
  app.delete("/api/website/menus/:id", deleteWebsiteMenu);
  app.get("/api/website/blocks", getWebsiteBlocks);
  app.post("/api/website/blocks", createWebsiteBlock);
  app.put("/api/website/blocks/:id", updateWebsiteBlock);
  app.delete("/api/website/blocks/:id", deleteWebsiteBlock);
  app.get("/api/website/settings", getWebsiteSettings);
  app.put("/api/website/settings", updateWebsiteSettings);
  app.get("/api/website/analytics", getWebsiteAnalytics);
  app.get("/api/website/forms", getWebsiteForms);
  app.post("/api/website/forms", createWebsiteForm);
  app.get("/api/website/forms/:id/submissions", getWebsiteFormSubmissions);

  // Admin API routes
  app.get("/api/admin/users", getUsers);
  app.post("/api/admin/users", createUser);
  app.put("/api/admin/users/:id", updateUser);
  app.delete("/api/admin/users/:id", deleteUser);
  app.get("/api/admin/roles", getRoles);
  app.post("/api/admin/roles", createRole);
  app.put("/api/admin/roles/:id", updateRole);
  app.delete("/api/admin/roles/:id", deleteRole);
  app.get("/api/admin/analytics", getAdminAnalytics);

  // Medical API routes
  app.get("/api/medical/patients", getMedicalPatients);
  app.post("/api/medical/patients", createMedicalPatient);
  app.put("/api/medical/patients/:id", updateMedicalPatient);
  app.delete("/api/medical/patients/:id", deleteMedicalPatient);
  app.get("/api/medical/appointments", getMedicalAppointments);
  app.post("/api/medical/appointments", createMedicalAppointment);
  app.put("/api/medical/appointments/:id", updateMedicalAppointment);
  app.get("/api/medical/prescriptions", getPrescriptions);
  app.post("/api/medical/prescriptions", createPrescription);
  app.put("/api/medical/prescriptions/:id", updatePrescription);
  app.get("/api/medical/analytics", getMedicalAnalytics);

  // School API routes
  app.get("/api/school/students", getStudents);
  app.post("/api/school/students", createStudent);
  app.put("/api/school/students/:id", updateStudent);
  app.delete("/api/school/students/:id", deleteStudent);
  app.get("/api/school/classes", getClasses);
  app.post("/api/school/classes", createClass);
  app.put("/api/school/classes/:id", updateClass);
  app.delete("/api/school/classes/:id", deleteClass);
  app.get("/api/school/grades", getGrades);
  app.post("/api/school/grades", createGrade);
  app.put("/api/school/grades/:id", updateGrade);
  app.get("/api/school/analytics", getSchoolAnalytics);

  // Real Estate API routes
  app.get("/api/realestate/properties", getProperties);
  app.post("/api/realestate/properties", createProperty);
  app.put("/api/realestate/properties/:id", updateProperty);
  app.delete("/api/realestate/properties/:id", deleteProperty);
  app.get("/api/realestate/tenants", getTenants);
  app.post("/api/realestate/tenants", createTenant);
  app.put("/api/realestate/tenants/:id", updateTenant);
  app.delete("/api/realestate/tenants/:id", deleteTenant);
  app.get("/api/realestate/leases", getLeases);
  app.post("/api/realestate/leases", createLease);
  app.put("/api/realestate/leases/:id", updateLease);
  app.delete("/api/realestate/leases/:id", deleteLease);
  app.get("/api/realestate/analytics", getRealEstateAnalytics);

  return app;
}
