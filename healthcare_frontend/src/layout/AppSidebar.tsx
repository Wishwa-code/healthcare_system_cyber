import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
  PieChartIcon,
  CloseLineIcon,
  CalenderIcon,
} from "../icons";

import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../routes/paths";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  badgeColor?: string;
  subItems?: {
    name: string;
    path: string;
    badge?: string;
    badgeColor?: string;
  }[];
};

// ── Inline SVG icons for healthcare concepts ──────────────────────────────────

const HeartPulseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const BedIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 9h20v6H2zM2 15v3M22 15v3M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
    <path d="M8 9V7a2 2 0 0 1 4 0v2" />
  </svg>
);

const PillIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="M8.5 8.5 15.5 15.5" />
  </svg>
);

const StethoscopeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } =
    useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const navItems: NavItem[] = useMemo(
    () => [
      // ── Dashboard ──────────────────────────────────────────────────
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: ROUTES.DASHBOARD,
      },

      // ── Patient Management ─────────────────────────────────────────
      {
        icon: <UserCircleIcon />,
        name: "Patient Management",
        subItems: [
          { name: "Patient Registration", path: ROUTES.PATIENT_REGISTRATION },
          { name: "Patient List", path: ROUTES.PATIENTS_LIST },
          { name: "EHR / EMR Records", path: ROUTES.PATIENT_EHR },
          { name: "Medical History", path: ROUTES.PATIENT_HISTORY },
          { name: "Allergies & Immunizations", path: ROUTES.PATIENT_IMMUNIZATIONS },
        ],
      },

      // ── Appointments & Scheduling ──────────────────────────────────
      {
        icon: <CalenderIcon />,
        name: "Appointments",
        subItems: [
          { name: "Book Appointment", path: ROUTES.APPOINTMENTS_BOOK },
          { name: "Appointments List", path: ROUTES.APPOINTMENTS_LIST },
          { name: "Doctor Availability", path: ROUTES.DOCTOR_AVAILABILITY },
          {
            name: "Queue Management",
            path: ROUTES.QUEUE_MANAGEMENT,
            badge: "Live",
            badgeColor: "green",
          },
        ],
      },

      // ── OPD ───────────────────────────────────────────────────────
      {
        icon: <StethoscopeIcon />,
        name: "OPD – Outpatient",
        subItems: [
          { name: "Consultations", path: ROUTES.OPD_CONSULTATION },
          { name: "Vital Signs", path: ROUTES.OPD_VITALS },
          { name: "Digital Prescriptions", path: ROUTES.OPD_PRESCRIPTIONS },
        ],
      },

      // ── IPD ───────────────────────────────────────────────────────
      {
        icon: <BedIcon />,
        name: "IPD – Inpatient",
        subItems: [
          { name: "Admissions", path: ROUTES.IPD_ADMISSIONS },
          { name: "Bed / Ward Allocation", path: ROUTES.IPD_BED_ALLOCATION },
          { name: "Surgery Scheduling", path: ROUTES.IPD_SURGERY },
          { name: "Nursing Notes", path: ROUTES.IPD_NURSING_NOTES },
          { name: "Transfer & Discharge", path: ROUTES.IPD_TRANSFER_DISCHARGE },
        ],
      },

      // ── Pharmacy & Inventory ──────────────────────────────────────
      {
        icon: <PillIcon />,
        name: "Pharmacy & Inventory",
        subItems: [
          { name: "Digital Prescriptions", path: ROUTES.PHARMACY_PRESCRIPTIONS },
          { name: "Stock Management", path: ROUTES.PHARMACY_STOCK },
          {
            name: "Expiry Alerts",
            path: ROUTES.PHARMACY_EXPIRY_ALERTS,
            badge: "!",
            badgeColor: "red",
          },
          { name: "Surgical Supplies", path: ROUTES.INVENTORY_SUPPLIES },
        ],
      },

      // ── Reports & Analytics ───────────────────────────────────────
      {
        icon: <PieChartIcon />,
        name: "Reports & Analytics",
        subItems: [
          { name: "Overview", path: ROUTES.REPORTS_OVERVIEW },
          { name: "OPD Analytics", path: ROUTES.REPORTS_OPD },
          { name: "IPD Analytics", path: ROUTES.REPORTS_IPD },
          { name: "Pharmacy Reports", path: ROUTES.REPORTS_PHARMACY },
        ],
      },
    ],
    []
  );

  // Auto-open submenu that matches current route
  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ index });
            matched = true;
          }
        });
      }
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive, navItems]);

  // Update height for animated drawer
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev?.index === index ? null : { index }));
  };

  const isSidebarVisible = isExpanded || isHovered || isMobileOpen;

  // Badge color helper
  const badgeClasses = (color?: string) => {
    if (color === "green")
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    if (color === "red")
      return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";
    return "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400";
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group ${
                  openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>

                {isSidebarVisible && (
                  <>
                    <span className="menu-item-text flex-1 text-left">{nav.name}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : "text-gray-400"
                      }`}
                    />
                  </>
                )}
              </button>

              {isSidebarVisible && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`main-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    height:
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`main-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-1 space-y-0.5 ml-8 border-l border-gray-100 dark:border-gray-700/60 pl-3">
                    {nav.subItems.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item flex items-center justify-between gap-2 ${
                            isActive(sub.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {sub.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badgeClasses(
                                sub.badgeColor
                              )}`}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {isSidebarVisible && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Mobile: profile header ─────────────────────────────────── */}
      <div className="lg:hidden p-4 border-b mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mx-1 mt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.logo || "/assets/images/users/avatar-1.jpg"}
              className="rounded-full border-2 border-white shadow-sm w-12 h-12 object-cover"
              alt="Profile"
            />
            <div className="overflow-hidden">
              <h6 className="mb-0 font-bold text-gray-900 dark:text-white truncate">
                {user?.full_name}
              </h6>
              <span className="text-gray-500 text-[11px]">Healthcare Staff</span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <CloseLineIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Brand logo (desktop) ───────────────────────────────────── */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          {/* Healthcare cross icon */}
          <div className="min-w-[42px] w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-5 13h-4v-4H6v-4h4V4h4v4h4v4h-4v4Z" />
            </svg>
          </div>

          {isSidebarVisible && (
            <div className="flex flex-col justify-center">
              <span className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate max-w-[180px]">
                {user?.company_name || "MediCare HMS"}
              </span>
              <span className="text-gray-400 text-xs font-medium">
                Healthcare Management
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:text-center" : ""
                }`}
              >
                {isSidebarVisible ? "Main Menu" : <HorizontaLDots className="size-5 mx-auto" />}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 py-4">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to={ROUTES.PROFILE}
              className="menu-item group text-gray-600 dark:text-gray-400"
            >
              <span className="menu-item-icon-size">
                <UserCircleIcon />
              </span>
              {isSidebarVisible && (
                <span className="menu-item-text">My Profile</span>
              )}
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="menu-item group text-error-600 hover:text-error-700 w-full text-left"
            >
              <span className="menu-item-icon-size">
                <CloseLineIcon className="text-error-500" />
              </span>
              {isSidebarVisible && (
                <span className="menu-item-text">Logout</span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default AppSidebar;
