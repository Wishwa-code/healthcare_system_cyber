import PageMeta from "../../components/common/PageMeta";

// TODO: Replace with GET /reports/overview
const MOCK_KPI = {
  today: { consultations: 42, admissions: 8, discharges: 5, prescriptions: 38, revenue: 184500 },
  week: { consultations: 287, admissions: 51, discharges: 44, prescriptions: 261, revenue: 1240000 },
  month: { consultations: 1142, admissions: 198, discharges: 182, prescriptions: 1030, revenue: 4875000 },
};

const TREND_DATA = [
  { label: "Mon", consultations: 38, admissions: 6 },
  { label: "Tue", consultations: 52, admissions: 9 },
  { label: "Wed", consultations: 45, admissions: 7 },
  { label: "Thu", consultations: 61, admissions: 11 },
  { label: "Fri", consultations: 48, admissions: 8 },
  { label: "Sat", consultations: 27, admissions: 5 },
  { label: "Sun", consultations: 16, admissions: 5 },
];

const TOP_DIAGNOSES = [
  { name: "Viral Fever", count: 87, pct: 100 },
  { name: "Hypertension", count: 64, pct: 74 },
  { name: "Diabetes Mellitus", count: 58, pct: 67 },
  { name: "Respiratory Infection", count: 51, pct: 59 },
  { name: "Musculoskeletal Pain", count: 44, pct: 51 },
];

const WARD_OCCUPANCY = [
  { ward: "General Ward A", beds: 20, occupied: 15 },
  { ward: "Cardiology Ward", beds: 12, occupied: 9 },
  { ward: "Surgical Ward", beds: 15, occupied: 10 },
  { ward: "Pediatrics Ward", beds: 10, occupied: 6 },
  { ward: "ICU", beds: 6, occupied: 4 },
];

export default function ReportsOverview() {
  const maxConsultations = Math.max(...TREND_DATA.map(d => d.consultations));

  return (
    <div className="pb-20">
      <PageMeta title="Reports Overview | MediCare HMS" description="Hospital-wide analytics and KPI dashboard" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Hospital-wide performance overview · Today, {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Today", data: MOCK_KPI.today },
          { label: "This Week", data: MOCK_KPI.week },
          { label: "This Month", data: MOCK_KPI.month },
        ].map(({ label, data }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</h2>
            <div className="space-y-3">
              {[
                { k: "Consultations", v: data.consultations, color: "text-brand-600" },
                { k: "Admissions", v: data.admissions, color: "text-blue-600" },
                { k: "Discharges", v: data.discharges, color: "text-emerald-600" },
                { k: "Prescriptions", v: data.prescriptions, color: "text-purple-600" },
              ].map(({ k, v, color }) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                  <span className={`text-xl font-black ${color}`}>{v.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">LKR {data.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly trend chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Weekly Consultations</h2>
          <div className="flex items-end gap-3 h-36">
            {TREND_DATA.map(d => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{d.consultations}</span>
                <div className="w-full rounded-t-lg bg-brand-500/20 dark:bg-brand-500/30 relative overflow-hidden"
                  style={{ height: `${(d.consultations / maxConsultations) * 100}px` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-lg transition-all" style={{ height: "100%" }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top diagnoses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top Diagnoses (This Month)</h2>
          <div className="space-y-4">
            {TOP_DIAGNOSES.map((d, i) => (
              <div key={d.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 w-4">#{i + 1}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{d.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ward occupancy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Ward Occupancy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {WARD_OCCUPANCY.map(w => {
            const pct = Math.round((w.occupied / w.beds) * 100);
            const color = pct >= 90 ? "text-red-600 dark:text-red-400" : pct >= 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
            const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
            return (
              <div key={w.ward} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-700" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                      className={barColor.replace("bg-", "stroke-")}
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-black ${color}`}>{pct}%</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">{w.ward}</p>
                <p className="text-xs text-gray-400 text-center">{w.occupied}/{w.beds} beds</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
