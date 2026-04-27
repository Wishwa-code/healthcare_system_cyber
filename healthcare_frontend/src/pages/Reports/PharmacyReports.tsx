import PageMeta from "../../components/common/PageMeta";

// TODO: Replace with GET /reports/pharmacy
const TOP_DRUGS = [
  { name: "Paracetamol 500mg", dispensed: 1840, revenue: 2760, pct: 100 },
  { name: "Amlodipine 5mg", dispensed: 920, revenue: 7820, pct: 50 },
  { name: "Ibuprofen 400mg", dispensed: 760, revenue: 1520, pct: 41 },
  { name: "Metformin 500mg", dispensed: 640, revenue: 4480, pct: 35 },
  { name: "ORS Sachet", dispensed: 510, revenue: 1530, pct: 28 },
  { name: "Omeprazole 20mg", dispensed: 482, revenue: 3374, pct: 26 },
];

const MONTHLY_REVENUE = [
  { month: "Nov", revenue: 312000, dispensed: 4820 },
  { month: "Dec", revenue: 285000, dispensed: 4250 },
  { month: "Jan", revenue: 398000, dispensed: 5640 },
  { month: "Feb", revenue: 362000, dispensed: 5180 },
  { month: "Mar", revenue: 421000, dispensed: 6020 },
  { month: "Apr", revenue: 387000, dispensed: 5490 },
];

const CATEGORY_BREAKDOWN = [
  { category: "Analgesics", items: 4, revenue: 18400, pct: 100 },
  { category: "Antihypertensives", items: 3, revenue: 14200, pct: 77 },
  { category: "Antibiotics", items: 5, revenue: 12800, pct: 70 },
  { category: "Antidiabetics", items: 3, revenue: 9600, pct: 52 },
  { category: "Antacids / GI", items: 4, revenue: 7400, pct: 40 },
  { category: "IV Fluids", items: 2, revenue: 6200, pct: 34 },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE.map(d => d.revenue));

export default function PharmacyReports() {
  const totalRevenue = MONTHLY_REVENUE.reduce((s, d) => s + d.revenue, 0);
  const totalDispensed = MONTHLY_REVENUE.reduce((s, d) => s + d.dispensed, 0);

  return (
    <div className="pb-20">
      <PageMeta title="Pharmacy Reports | MediCare HMS" description="Pharmacy dispensing and revenue analytics" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pharmacy Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dispensing activity and revenue analytics · Last 6 months</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `LKR ${(totalRevenue / 1000).toFixed(0)}K`, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", icon: "💰" },
          { label: "Items Dispensed", value: totalDispensed.toLocaleString(), color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-100 dark:border-brand-500/20", icon: "💊" },
          { label: "Prescriptions", value: "1,842", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20", icon: "📋" },
          { label: "Pending Today", value: "8", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", icon: "⏳" },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Monthly Revenue Trend</h2>
          <div className="flex items-end gap-3 h-40">
            {MONTHLY_REVENUE.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{(d.revenue / 1000).toFixed(0)}K</span>
                <div className="w-full bg-emerald-500 rounded-t-md transition-all" style={{ height: `${(d.revenue / maxRevenue) * 128}px` }} />
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Revenue by Category</h2>
          <div className="space-y-4">
            {CATEGORY_BREAKDOWN.map((c, i) => (
              <div key={c.category}>
                <div className="flex justify-between items-center mb-1.5">
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{c.category}</span>
                    <span className="text-xs text-gray-400 ml-2">({c.items} items)</span>
                  </div>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">LKR {c.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: `hsl(${140 + i * 25}, 70%, ${45 + i * 5}%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top drugs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Dispensed Drugs (This Month)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Drug</th>
                <th className="px-6 py-4">Units Dispensed</th>
                <th className="px-6 py-4">Revenue (LKR)</th>
                <th className="px-6 py-4">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {TOP_DRUGS.map((d, i) => (
                <tr key={d.name} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5 text-xs font-black text-gray-300 dark:text-gray-600">#{i + 1}</td>
                  <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-sm">{d.name}</td>
                  <td className="px-6 py-5 text-brand-600 dark:text-brand-400 font-black text-lg">{d.dispensed.toLocaleString()}</td>
                  <td className="px-6 py-5 text-emerald-600 dark:text-emerald-400 font-bold">{d.revenue.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-400">{d.pct}%</span>
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
