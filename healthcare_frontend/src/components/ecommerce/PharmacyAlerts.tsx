import { useEffect, useState } from "react";
import { Link } from "react-router";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";

type AlertItem = {
  id: string;
  item_name: string;
  expiry_date: string;
  stock_quantity: number;
  days_to_expiry: number;
  type: "expiry" | "low_stock";
};

function daysLabel(days: number) {
  if (days <= 0) return "Expired";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days}d`;
}

function urgencyColor(days: number) {
  if (days <= 0) return "text-error-600 bg-error-50 dark:bg-error-500/10";
  if (days <= 7) return "text-orange-600 bg-orange-50 dark:bg-orange-500/10";
  return "text-amber-600 bg-amber-50 dark:bg-amber-500/10";
}

export default function PharmacyAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/pharmacy-alerts")
      .then((res) => setAlerts(res.data?.data ?? res.data ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const expiryAlerts = alerts.filter((a) => a.type === "expiry");
  const stockAlerts = alerts.filter((a) => a.type === "low_stock");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 sm:px-6 sm:pt-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
            Pharmacy Alerts
            {alerts.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error-500 text-white text-[10px] font-bold">
                {alerts.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Expiry & low stock warnings
          </p>
        </div>
        <Link
          to={ROUTES.PHARMACY_EXPIRY_ALERTS}
          className="text-xs font-bold text-brand-500 hover:text-brand-600 uppercase tracking-widest"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-gray-200 dark:text-gray-700">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          </svg>
          <p className="text-sm font-medium">No alerts — pharmacy is all clear!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* Expiry Section */}
          {expiryAlerts.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-error-50/50 dark:bg-error-500/5">
                <p className="text-[10px] font-bold text-error-600 uppercase tracking-widest">
                  ⚠ Near-Expiry Drugs ({expiryAlerts.length})
                </p>
              </div>
              {expiryAlerts.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {a.item_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.expiry_date).toLocaleDateString()} · {a.stock_quantity} units left
                    </p>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${urgencyColor(a.days_to_expiry)}`}>
                    {daysLabel(a.days_to_expiry)}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Low Stock Section */}
          {stockAlerts.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-amber-50/50 dark:bg-amber-500/5">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  📦 Low Stock ({stockAlerts.length})
                </p>
              </div>
              {stockAlerts.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {a.item_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Only {a.stock_quantity} units remaining
                    </p>
                  </div>
                  <span className="ml-3 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-xs font-bold text-amber-600 shrink-0">
                    Restock
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
