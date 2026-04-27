import PageMeta from "../../components/common/PageMeta";

// TODO: Replace with GET /reports/opd?range=...
const DAILY_DATA = [
  { date: "Apr 21", consultations: 34, new_patients: 8 },
  { date: "Apr 22", consultations: 48, new_patients: 12 },
  { date: "Apr 23", consultations: 42, new_patients: 9 },
  { date: "Apr 24", consultations: 61, new_patients: 15 },
  { date: "Apr 25", consultations: 52, new_patients: 11 },
  { date: "Apr 26", consultations: 38, new_patients: 7 },
  { date: "Apr 27", consultations: 44, new_patients: 10 },
];

const DOCTOR_STATS = [
  { doctor: "Dr. Ashan Perera", specialty: "General Medicine", consultations: 156, avg_duration: "14 min", new_patients: 42 },
  { doctor: "Dr. Nisha Fernando", specialty: "Cardiology", consultations: 89, avg_duration: "22 min", new_patients: 18 },
  { doctor: "Dr. Ravi Silva", specialty: "Orthopedics", consultations: 72, avg_duration: "18 min", new_patients: 15 },
  { doctor: "Dr. Priya Jayasena", specialty: "Pediatrics", consultations: 65, avg_duration: "16 min", new_patients: 22 },
];

const CONSULTATION_TYPES = [
  { type: "General Consultation", count: 312, pct: 100 },
  { type: "Follow-up", count: 248, pct: 79 },
  { type: "Specialist Referral", count: 98, pct: 31 },
  { type: "Routine Check-up", count: 76, pct: 24 },
  { type: "Emergency Walk-in", count: 34, pct: 11 },
];

const maxConsultations = Math.max(...DAILY_DATA.map(d => d.consultations));

export default function OPDAnalytics() {
  return (
    <div className="pb-20">
      <PageMeta title="OPD Analytics | MediCare HMS" description="Outpatient department analytics and reports" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">OPD Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Outpatient department performance · Last 7 days</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Consultations", value: "382", icon: "🩺", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-100 dark:border-brand-500/20" },
          { label: "New Patients", value: "72", icon: "👤", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
          { label: "Prescriptions Issued", value: "298", icon: "💊", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20" },
          { label: "Avg per Day", value: "54.6", icon: "📈", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
        ].map(({ label, value, icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily consultations bar chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Daily Consultations (Last 7 Days)</h2>
          <div className="flex items-end gap-3 h-40">
            {DAILY_DATA.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{d.consultations}</span>
                <div className="w-full flex flex-col items-center">
                  <div className="w-full bg-brand-500 rounded-t-md transition-all"
                    style={{ height: `${(d.consultations / maxConsultations) * 120}px` }} />
                  <div className="w-full bg-blue-300 dark:bg-blue-400/70 rounded-b-md transition-all"
                    style={{ height: `${(d.new_patients / maxConsultations) * 120}px` }} />
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{d.date.split(" ")[1]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Consultations</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-400/70" /><span className="text-xs text-gray-500 dark:text-gray-400">New Patients</span></div>
          </div>
        </div>

        {/* Consultation types */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Consultation Types</h2>
          <div className="space-y-4">
            {CONSULTATION_TYPES.map((ct, i) => (
              <div key={ct.type}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{ct.type}</span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{ct.count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${ct.pct}%`, backgroundColor: `hsl(${220 + i * 30}, 80%, ${55 + i * 5}%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor performance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Doctor Performance (This Month)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Consultations</th>
                <th className="px-6 py-4">New Patients</th>
                <th className="px-6 py-4">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {DOCTOR_STATS.map(d => (
                <tr key={d.doctor} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-sm">{d.doctor}</td>
                  <td className="px-6 py-5 text-xs text-gray-500 dark:text-gray-400">{d.specialty}</td>
                  <td className="px-6 py-5 text-brand-600 dark:text-brand-400 font-black text-lg">{d.consultations}</td>
                  <td className="px-6 py-5 text-blue-600 dark:text-blue-400 font-bold">{d.new_patients}</td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-xs font-mono">{d.avg_duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
