import PageMeta from "../../components/common/PageMeta";

// TODO: Replace with GET /reports/ipd
const WARD_DATA = [
  { ward: "General Ward A", admissions: 48, discharges: 44, avg_los: 3.2, occupancy_pct: 75 },
  { ward: "Cardiology Ward", admissions: 21, discharges: 19, avg_los: 5.1, occupancy_pct: 75 },
  { ward: "Surgical Ward", admissions: 18, discharges: 16, avg_los: 4.8, occupancy_pct: 67 },
  { ward: "Pediatrics Ward", admissions: 15, discharges: 14, avg_los: 2.9, occupancy_pct: 60 },
  { ward: "ICU", admissions: 8, discharges: 6, avg_los: 7.2, occupancy_pct: 67 },
];

const ADMISSION_REASONS = [
  { reason: "Viral Infection", count: 28, pct: 100 },
  { reason: "Cardiac Conditions", count: 21, pct: 75 },
  { reason: "Post-Surgical Care", count: 18, pct: 64 },
  { reason: "Respiratory Issues", count: 15, pct: 54 },
  { reason: "Fractures/Trauma", count: 12, pct: 43 },
  { reason: "Pediatric Illness", count: 10, pct: 36 },
];

const MONTHLY_TREND = [
  { month: "Nov", admissions: 168, discharges: 161 },
  { month: "Dec", admissions: 142, discharges: 138 },
  { month: "Jan", admissions: 195, discharges: 188 },
  { month: "Feb", admissions: 178, discharges: 172 },
  { month: "Mar", admissions: 210, discharges: 204 },
  { month: "Apr", admissions: 198, discharges: 182 },
];

const maxAdm = Math.max(...MONTHLY_TREND.map(d => d.admissions));

export default function IPDAnalytics() {
  const totalAdmissions = WARD_DATA.reduce((s, w) => s + w.admissions, 0);
  const totalDischarges = WARD_DATA.reduce((s, w) => s + w.discharges, 0);
  const avgLOS = (WARD_DATA.reduce((s, w) => s + w.avg_los * w.admissions, 0) / totalAdmissions).toFixed(1);

  return (
    <div className="pb-20">
      <PageMeta title="IPD Analytics | MediCare HMS" description="Inpatient department analytics and reports" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">IPD Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Inpatient department performance · This month</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Admissions", value: totalAdmissions.toString(), color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-100 dark:border-brand-500/20", icon: "🏥" },
          { label: "Total Discharges", value: totalDischarges.toString(), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", icon: "✅" },
          { label: "Avg Length of Stay", value: `${avgLOS}d`, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", icon: "⏱" },
          { label: "Currently Admitted", value: (totalAdmissions - totalDischarges).toString(), color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", icon: "🛏" },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Monthly Admissions vs Discharges</h2>
          <div className="flex items-end gap-4 h-40">
            {MONTHLY_TREND.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5">
                  <div className="flex-1 bg-brand-500 rounded-t-md transition-all" style={{ height: `${(d.admissions / maxAdm) * 128}px` }} />
                  <div className="flex-1 bg-emerald-400 dark:bg-emerald-500 rounded-t-md transition-all" style={{ height: `${(d.discharges / maxAdm) * 128}px` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500" /><span className="text-xs text-gray-500">Admissions</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400" /><span className="text-xs text-gray-500">Discharges</span></div>
          </div>
        </div>

        {/* Admission reasons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top Admission Reasons</h2>
          <div className="space-y-4">
            {ADMISSION_REASONS.map((r, i) => (
              <div key={r.reason}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{r.reason}</span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{r.count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: `hsl(${200 + i * 25}, 75%, ${50 + i * 5}%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ward breakdown table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ward Breakdown (This Month)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Ward</th>
                <th className="px-6 py-4">Admissions</th>
                <th className="px-6 py-4">Discharges</th>
                <th className="px-6 py-4">Avg LOS</th>
                <th className="px-6 py-4">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {WARD_DATA.map(w => (
                <tr key={w.ward} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-sm">{w.ward}</td>
                  <td className="px-6 py-5 text-brand-600 dark:text-brand-400 font-black text-lg">{w.admissions}</td>
                  <td className="px-6 py-5 text-emerald-600 dark:text-emerald-400 font-bold">{w.discharges}</td>
                  <td className="px-6 py-5 text-amber-600 dark:text-amber-400 font-bold">{w.avg_los} days</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${w.occupancy_pct >= 90 ? "bg-red-500" : w.occupancy_pct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${w.occupancy_pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${w.occupancy_pct >= 90 ? "text-red-600 dark:text-red-400" : w.occupancy_pct >= 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{w.occupancy_pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
