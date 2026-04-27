import { lazy } from "react";
import { ROUTES } from "./paths";

// Dashboard
const Home = lazy(() => import("../pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("../pages/UserProfiles"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Blank = lazy(() => import("../pages/Blank"));
const FormElements = lazy(() => import("../pages/Forms/FormElements"));

// ── Patient Management ─────────────────────────────────────────────────────
const PatientList = lazy(() => import("../pages/Patients/PatientList"));
const PatientRegistration = lazy(() => import("../pages/Patients/PatientRegistration"));
const EHRRecords = lazy(() => import("../pages/Patients/EHRRecords"));
const MedicalHistory = lazy(() => import("../pages/Patients/MedicalHistory"));
const AllergiesImmunizations = lazy(() => import("../pages/Patients/AllergiesImmunizations"));

// ── Appointments ────────────────────────────────────────────────────────────
const BookAppointment = lazy(() => import("../pages/Appointments/BookAppointment"));
const AppointmentList = lazy(() => import("../pages/Appointments/AppointmentList"));
const DoctorAvailability = lazy(() => import("../pages/Appointments/DoctorAvailability"));
const QueueManagement = lazy(() => import("../pages/Appointments/QueueManagement"));

// ── OPD ─────────────────────────────────────────────────────────────────────
const OPDConsultation = lazy(() => import("../pages/OPD/OPDConsultation"));
const VitalSigns = lazy(() => import("../pages/OPD/VitalSigns"));
const OPDPrescriptions = lazy(() => import("../pages/OPD/OPDPrescriptions"));

// ── IPD ─────────────────────────────────────────────────────────────────────
const IPDAdmissions = lazy(() => import("../pages/IPD/IPDAdmissions"));
const BedAllocation = lazy(() => import("../pages/IPD/BedAllocation"));
const SurgeryScheduling = lazy(() => import("../pages/IPD/SurgeryScheduling"));
const NursingNotes = lazy(() => import("../pages/IPD/NursingNotes"));
const TransferDischarge = lazy(() => import("../pages/IPD/TransferDischarge"));

// ── Pharmacy ─────────────────────────────────────────────────────────────────
const PharmacyPrescriptions = lazy(() => import("../pages/Pharmacy/PharmacyPrescriptions"));
const StockManagement = lazy(() => import("../pages/Pharmacy/StockManagement"));
const ExpiryAlerts = lazy(() => import("../pages/Pharmacy/ExpiryAlerts"));
const SurgicalSupplies = lazy(() => import("../pages/Pharmacy/SurgicalSupplies"));

// ── Reports ──────────────────────────────────────────────────────────────────
const ReportsOverview = lazy(() => import("../pages/Reports/ReportsOverview"));
const OPDAnalytics = lazy(() => import("../pages/Reports/OPDAnalytics"));
const IPDAnalytics = lazy(() => import("../pages/Reports/IPDAnalytics"));
const PharmacyReports = lazy(() => import("../pages/Reports/PharmacyReports"));

// ── Legacy (keep for backward compatibility / other modules still using them) ──
const CreateProduct = lazy(() => import("../pages/Products/CreateProduct"));
const ProductList = lazy(() => import("../pages/Products/ProductList"));
const CreateCustomer = lazy(() => import("../pages/Customers/CreateCustomer"));
const CustomerList = lazy(() => import("../pages/Customers/CustomerList"));
const CreateLeasing = lazy(() => import("../pages/Leasing/CreateLeasing"));
const SuppliersManagement = lazy(() => import("../pages/Partners/SuppliersManagement"));
const SeizersManagement = lazy(() => import("../pages/Partners/SeizersManagement"));
const IntroducersManagement = lazy(() => import("../pages/Partners/IntroducersManagement"));
const ValuationCompaniesManagement = lazy(() => import("../pages/Partners/ValuationCompaniesManagement"));
const InsuranceCompaniesManagement = lazy(() => import("../pages/Partners/InsuranceCompaniesManagement"));
const AuctionCompaniesManagement = lazy(() => import("../pages/Partners/AuctionCompaniesManagement"));
const VehicleYardsManagement = lazy(() => import("../pages/Partners/VehicleYardsManagement"));
const BasicTables = lazy(() => import("../pages/Tables/BasicTables"));
const Alerts = lazy(() => import("../pages/UiElements/Alerts"));
const Avatars = lazy(() => import("../pages/UiElements/Avatars"));
const Badges = lazy(() => import("../pages/UiElements/Badges"));
const Buttons = lazy(() => import("../pages/UiElements/Buttons"));
const Images = lazy(() => import("../pages/UiElements/Images"));
const Videos = lazy(() => import("../pages/UiElements/Videos"));
const LineChart = lazy(() => import("../pages/Charts/LineChart"));
const BarChart = lazy(() => import("../pages/Charts/BarChart"));

// Auth
const SignIn = lazy(() => import("../pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("../pages/AuthPages/SignUp"));
const NotFound = lazy(() => import("../pages/OtherPage/NotFound"));

export const publicRoutes = [
  { path: ROUTES.SIGNIN, element: <SignIn /> },
  { path: ROUTES.SIGNUP, element: <SignUp /> },
  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
];

export const privateRoutes = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { path: ROUTES.DASHBOARD, element: <Home /> },
  { path: ROUTES.PROFILE, element: <UserProfiles /> },
  { path: ROUTES.CALENDAR, element: <Calendar /> },
  { path: ROUTES.BLANK, element: <Blank /> },
  { path: ROUTES.FORM_ELEMENTS, element: <FormElements /> },

  // ── Patient Management ────────────────────────────────────────────────────
  { path: ROUTES.PATIENTS_LIST, element: <PatientList /> },
  { path: ROUTES.PATIENT_REGISTRATION, element: <PatientRegistration /> },
  { path: ROUTES.PATIENT_EHR, element: <EHRRecords /> },
  { path: ROUTES.PATIENT_HISTORY, element: <MedicalHistory /> },
  { path: ROUTES.PATIENT_IMMUNIZATIONS, element: <AllergiesImmunizations /> },

  // ── Appointments ─────────────────────────────────────────────────────────
  { path: ROUTES.APPOINTMENTS_BOOK, element: <BookAppointment /> },
  { path: ROUTES.APPOINTMENTS_LIST, element: <AppointmentList /> },
  { path: ROUTES.DOCTOR_AVAILABILITY, element: <DoctorAvailability /> },
  { path: ROUTES.QUEUE_MANAGEMENT, element: <QueueManagement /> },

  // ── OPD ──────────────────────────────────────────────────────────────────
  { path: ROUTES.OPD_CONSULTATION, element: <OPDConsultation /> },
  { path: ROUTES.OPD_VITALS, element: <VitalSigns /> },
  { path: ROUTES.OPD_PRESCRIPTIONS, element: <OPDPrescriptions /> },

  // ── IPD ──────────────────────────────────────────────────────────────────
  { path: ROUTES.IPD_ADMISSIONS, element: <IPDAdmissions /> },
  { path: ROUTES.IPD_BED_ALLOCATION, element: <BedAllocation /> },
  { path: ROUTES.IPD_SURGERY, element: <SurgeryScheduling /> },
  { path: ROUTES.IPD_NURSING_NOTES, element: <NursingNotes /> },
  { path: ROUTES.IPD_TRANSFER_DISCHARGE, element: <TransferDischarge /> },

  // ── Pharmacy ─────────────────────────────────────────────────────────────
  { path: ROUTES.PHARMACY_PRESCRIPTIONS, element: <PharmacyPrescriptions /> },
  { path: ROUTES.PHARMACY_STOCK, element: <StockManagement /> },
  { path: ROUTES.PHARMACY_EXPIRY_ALERTS, element: <ExpiryAlerts /> },
  { path: ROUTES.INVENTORY_SUPPLIES, element: <SurgicalSupplies /> },

  // ── Reports ──────────────────────────────────────────────────────────────
  { path: ROUTES.REPORTS_OVERVIEW, element: <ReportsOverview /> },
  { path: ROUTES.REPORTS_OPD, element: <OPDAnalytics /> },
  { path: ROUTES.REPORTS_IPD, element: <IPDAnalytics /> },
  { path: ROUTES.REPORTS_PHARMACY, element: <PharmacyReports /> },

  // ── Legacy routes (other modules - keep until migrated) ───────────────────
  { path: ROUTES.CREATE_PRODUCT, element: <CreateProduct /> },
  { path: ROUTES.EDIT_PRODUCT, element: <CreateProduct /> },
  { path: ROUTES.PRODUCTS_LIST, element: <ProductList /> },
  { path: ROUTES.CREATE_CUSTOMER, element: <CreateCustomer /> },
  { path: ROUTES.CUSTOMERS_LIST, element: <CustomerList /> },
  { path: ROUTES.EDIT_CUSTOMER, element: <CreateCustomer /> },
  { path: ROUTES.CREATE_LEASE, element: <CreateLeasing /> },
  { path: ROUTES.SUPPLIERS, element: <SuppliersManagement /> },
  { path: ROUTES.SEIZERS, element: <SeizersManagement /> },
  { path: ROUTES.INTRODUCERS, element: <IntroducersManagement /> },
  { path: ROUTES.VALUATION_COMPANIES, element: <ValuationCompaniesManagement /> },
  { path: ROUTES.INSURANCE_COMPANIES, element: <InsuranceCompaniesManagement /> },
  { path: ROUTES.AUCTION_COMPANIES, element: <AuctionCompaniesManagement /> },
  { path: ROUTES.VEHICLE_YARDS, element: <VehicleYardsManagement /> },
  { path: ROUTES.BASIC_TABLES, element: <BasicTables /> },
  { path: ROUTES.ALERTS, element: <Alerts /> },
  { path: ROUTES.AVATARS, element: <Avatars /> },
  { path: ROUTES.BADGE, element: <Badges /> },
  { path: ROUTES.BUTTONS, element: <Buttons /> },
  { path: ROUTES.IMAGES, element: <Images /> },
  { path: ROUTES.VIDEOS, element: <Videos /> },
  { path: ROUTES.LINE_CHART, element: <LineChart /> },
  { path: ROUTES.BAR_CHART, element: <BarChart /> },
];
