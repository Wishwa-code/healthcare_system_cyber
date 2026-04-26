import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { ArrowUpIcon, ArrowDownIcon } from "../../icons";

// ── Types ────────────────────────────────────────────────────────────────────

type Metrics = {
  total_patients: number;
  patients_change_pct: number;
  todays_appointments: number;
  appointments_change_pct: number;
  opd_visits_today: number;
  opd_change_pct: number;
  ipd_admitted: number;
  ipd_change_pct: number;
  available_beds: number;
  total_beds: number;
  expiry_alerts: number;
  low_stock_items: number;
};

// ── Inline SVG icons ─────────────────────────────────────────────────────────

const PatientIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const StethIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

const BedIcon2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M2 9h20v6H2zM2 15v3M22 15v3M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
    <path d="M8 9V7a2 2 0 0 1 4 0v2" />
  </svg>
);

// ── Fallback values (used until API responds) ────────────────────────────────

const FALLBACK: Metrics = {
  total_patients: 0,
  patients_change_pct: 0,
  todays_appointments: 0,
  appointments_change_pct: 0,
  opd_visits_today: 0,
  opd_change_pct: 0,
  ipd_admitted: 0,
  ipd_change_pct: 0,
  available_beds: 0,
  total_beds: 0,
  expiry_alerts: 0,
  low_stock_items: 0,
};

// ── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function HMSMetrics() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/metrics")
      .then((res) => setData(res.data?.data ?? res.data ?? FALLBACK))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const m = data ?? FALLBACK;

  const cards = [
    {
      label: "Total Patients",
      value: m.total_patients.toLocaleString(),
      pct: m.patients_change_pct,
      icon: <PatientIcon />,
      iconBg: "bg-brand-50 text-brand-600 dark:bg-brand-500/10",
      sub: "registered patients",
    },
    {
      label: "Today's Appointments",
      value: m.todays_appointments.toLocaleString(),
      pct: m.appointments_change_pct,
      icon: <CalIcon />,
      iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-500/10",
      sub: "vs yesterday",
    },
    {
      label: "OPD Visits Today",
      value: m.opd_visits_today.toLocaleString(),
      pct: m.opd_change_pct,
      icon: <StethIcon />,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
      sub: "outpatient consultations",
    },
    {
      label: "IPD Admitted",
      value: m.ipd_admitted.toLocaleString(),
      pct: m.ipd_change_pct,
      icon: <BedIcon2 />,
      iconBg: "bg-orange-50 text-orange-600 dark:bg-orange-500/10",
      sub: `${m.available_beds} beds available`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.iconBg}`}>
            {c.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{c.label}</span>
              {loading ? (
                <Skeleton />
              ) : (
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {c.value}
                </h4>
              )}
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>

            {!loading && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  c.pct >= 0
                    ? "bg-success-50 text-success-600 dark:bg-success-500/15"
                    : "bg-error-50 text-error-600 dark:bg-error-500/15"
                }`}
              >
                {c.pct >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                {Math.abs(c.pct).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
