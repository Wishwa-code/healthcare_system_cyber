import PageMeta from "../../components/common/PageMeta";
import HMSMetrics from "../../components/ecommerce/HMSMetrics";
import PatientFlowChart from "../../components/ecommerce/PatientFlowChart";
import BedOccupancyWidget from "../../components/ecommerce/BedOccupancyWidget";
import WeeklyActivityChart from "../../components/ecommerce/WeeklyActivityChart";
import TodayAppointments from "../../components/ecommerce/TodayAppointments";
import PharmacyAlerts from "../../components/ecommerce/PharmacyAlerts";
import RecentPatients from "../../components/ecommerce/RecentPatients";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | MediCare HMS"
        description="Healthcare Management System — real-time operational overview"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {/* ── Row 1: KPI Metric Cards (full width) ─────────────────────── */}
        <div className="col-span-12">
          <HMSMetrics />
        </div>

        {/* ── Row 2: Patient Flow Chart + Bed Occupancy ────────────────── */}
        <div className="col-span-12 xl:col-span-8">
          <PatientFlowChart />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <BedOccupancyWidget />
        </div>

        {/* ── Row 3: Weekly Activity (full width) ──────────────────────── */}
        <div className="col-span-12">
          <WeeklyActivityChart />
        </div>

        {/* ── Row 4: Today's Appointments + Pharmacy Alerts ────────────── */}
        <div className="col-span-12 xl:col-span-7">
          <TodayAppointments />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <PharmacyAlerts />
        </div>

        {/* ── Row 5: Recently Registered Patients ──────────────────────── */}
        <div className="col-span-12">
          <RecentPatients />
        </div>

      </div>
    </>
  );
}
