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
