export const ROUTES = {
  // Public Routes
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  RESET_PASSWORD: "/reset-password",

  // Authenticated Routes
  DASHBOARD: "/",
  PROFILE: "/profile",
  CALENDAR: "/calendar",
  BLANK: "/blank",

  // ── Patient Management ──────────────────────────────────────────
  PATIENT_REGISTRATION: "/patients/register",
  PATIENTS_LIST: "/patients",
  EDIT_PATIENT: "/patients/edit/:id",
  PATIENT_EHR: "/patients/ehr",
  PATIENT_HISTORY: "/patients/history",
  PATIENT_ALLERGIES: "/patients/allergies",
  PATIENT_IMMUNIZATIONS: "/patients/immunizations",

  // ── Appointments & Scheduling ───────────────────────────────────
  APPOINTMENTS_BOOK: "/appointments/book",
  APPOINTMENTS_LIST: "/appointments",
  DOCTOR_AVAILABILITY: "/appointments/doctor-availability",
  QUEUE_MANAGEMENT: "/appointments/queue",

  // ── OPD (Outpatient) ────────────────────────────────────────────
  OPD_CONSULTATION: "/opd/consultation",
  OPD_VITALS: "/opd/vitals",
  OPD_PRESCRIPTIONS: "/opd/prescriptions",

  // ── IPD (Inpatient) ─────────────────────────────────────────────
  IPD_ADMISSIONS: "/ipd/admissions",
  IPD_BED_ALLOCATION: "/ipd/beds",
  IPD_SURGERY: "/ipd/surgery",
  IPD_NURSING_NOTES: "/ipd/nursing-notes",
  IPD_TRANSFER_DISCHARGE: "/ipd/transfer-discharge",

  // ── Pharmacy & Inventory ────────────────────────────────────────
  PHARMACY_PRESCRIPTIONS: "/pharmacy/prescriptions",
  PHARMACY_STOCK: "/pharmacy/stock",
  PHARMACY_EXPIRY_ALERTS: "/pharmacy/expiry-alerts",
  INVENTORY_SUPPLIES: "/pharmacy/supplies",

  // ── Reports ─────────────────────────────────────────────────────
  REPORTS_OVERVIEW: "/reports",
  REPORTS_OPD: "/reports/opd",
  REPORTS_IPD: "/reports/ipd",
  REPORTS_PHARMACY: "/reports/pharmacy",

  // Fallback
  FORM_ELEMENTS: "/form-elements",
  NOT_FOUND: "*",

  // ── Legacy (keep until leasing pages are migrated) ───────────────
  CREATE_PRODUCT: "/products/create",
  EDIT_PRODUCT: "/products/edit/:id",
  PRODUCTS_LIST: "/products",
  CREATE_CUSTOMER: "/customers/create",
  CUSTOMERS_LIST: "/customers",
  EDIT_CUSTOMER: "/customers/edit/:id",
  CREATE_LEASE: "/leasing/create",
  DRAFT_LEASES: "/leasing/drafts",
  SUPPLIERS: "/leasing-partners/suppliers",
  SEIZERS: "/leasing-partners/seizers",
  INTRODUCERS: "/leasing-partners/introducers",
  VALUATION_COMPANIES: "/leasing-partners/valuation-companies",
  INSURANCE_COMPANIES: "/leasing-partners/insurance-companies",
  AUCTION_COMPANIES: "/leasing-partners/auction-companies",
  VEHICLE_YARDS: "/leasing-partners/vehicle-yards",
  BASIC_TABLES: "/basic-tables",
  ALERTS: "/alerts",
  AVATARS: "/avatars",
  BADGE: "/badge",
  BUTTONS: "/buttons",
  IMAGES: "/images",
  VIDEOS: "/videos",
  LINE_CHART: "/line-chart",
  BAR_CHART: "/bar-chart",
} as const;
