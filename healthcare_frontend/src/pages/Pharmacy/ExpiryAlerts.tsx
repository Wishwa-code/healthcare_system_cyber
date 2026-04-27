import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

type ExpiryItem = {
  id: string;
  name: string;
  category: string;
  batch_number: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  supplier: string;
  days_until_expiry: number;
};

// TODO: Replace with GET /pharmacy/expiry-alerts
const MOCK_EXPIRY: ExpiryItem[] = [
  { id: "e1", name: "Amoxicillin 250mg", category: "Antibiotic", batch_number: "AMX-2025-044", quantity: 150, unit: "capsules", expiry_date: "2026-03-31", supplier: "PharmaCare", days_until_expiry: -27 },
  { id: "e2", name: "Ibuprofen 400mg", category: "NSAID", batch_number: "IBU-2026-007", quantity: 80, unit: "tablets", expiry_date: "2026-06-15", supplier: "MediPharm Ltd", days_until_expiry: 49 },
  { id: "e3", name: "Metformin 500mg", category: "Antidiabetic", batch_number: "MTF-2026-003", quantity: 340, unit: "tablets", expiry_date: "2026-07-01", supplier: "DiaCare", days_until_expiry: 65 },
  { id: "e4", name: "Amlodipine 5mg", category: "Antihypertensive", batch_number: "AML-2025-032", quantity: 1200, unit: "tablets", expiry_date: "2026-08-31", supplier: "CardioSupply Co", days_until_expiry: 126 },
  { id: "e5", name: "Atorvastatin 10mg", category: "Statin", batch_number: "ATV-2026-008", quantity: 600, unit: "tablets", expiry_date: "2026-09-15", supplier: "HeartMed", days_until_expiry: 141 },
];

function getSeverity(days: number): { label: string; color: string; bg: string; border: string } {
  if (days < 0) return { label: "Expired", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30" };
  if (days <= 30) return { label: "Critical", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30" };
  if (days <= 60) return { label: "Warning", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30" };
  return { label: "Notice", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/30" };
}

export default function ExpiryAlerts() {
  const [filter, setFilter] = useState<"all" | "expired" | "30" | "60" | "90">("all");

  const filtered = MOCK_EXPIRY.filter(item => {
    if (filter === "expired") return item.days_until_expiry < 0;
    if (filter === "30") return item.days_until_expiry >= 0 && item.days_until_expiry <= 30;
    if (filter === "60") return item.days_until_expiry >= 0 && item.days_until_expiry <= 60;
    if (filter === "90") return item.days_until_expiry >= 0 && item.days_until_expiry <= 90;
    return true;
  }).sort((a, b) => a.days_until_expiry - b.days_until_expiry);

  const expired = MOCK_EXPIRY.filter(i => i.days_until_expiry < 0).length;
  const critical = MOCK_EXPIRY.filter(i => i.days_until_expiry >= 0 && i.days_until_expiry <= 30).length;
  const warning = MOCK_EXPIRY.filter(i => i.days_until_expiry > 30 && i.days_until_expiry <= 60).length;
  const notice = MOCK_EXPIRY.filter(i => i.days_until_expiry > 60 && i.days_until_expiry <= 90).length;

  return (
    <div className="pb-20">
      <PageMeta title="Expiry Alerts | MediCare HMS" description="Track and manage expiring pharmacy stock" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Expiry Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor stock items expiring within the next 90 days</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Expired", value: expired, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20", key: "expired" as const },
          { label: "< 30 days", value: critical, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20", key: "30" as const },
          { label: "< 60 days", value: warning, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", key: "60" as const },
          { label: "< 90 days", value: notice, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", key: "90" as const },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(filter === s.key ? "all" : s.key)}
            className={`${s.bg} border ${s.border} rounded-2xl p-5 text-center transition-all ${filter === s.key ? "ring-2 ring-offset-2 ring-brand-400 dark:ring-offset-gray-900" : ""}`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const sev = getSeverity(item.days_until_expiry);
          return (
            <div key={item.id} className={`rounded-2xl border ${sev.border} ${sev.bg} p-5`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-white/70 dark:bg-black/20 ${sev.color}`}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.category}</span>
                    <span>Batch: <span className="font-mono">{item.batch_number}</span></span>
                    <span>Qty: <span className="font-semibold">{item.quantity} {item.unit}</span></span>
                    <span>Supplier: {item.supplier}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${sev.color}`}>
                    {item.days_until_expiry < 0
                      ? `${Math.abs(item.days_until_expiry)}d ago`
                      : `${item.days_until_expiry}d left`}
                  </p>
                  <p className="text-xs text-gray-400">Expires: {item.expiry_date}</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No items match the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
