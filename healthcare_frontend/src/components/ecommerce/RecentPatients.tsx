import { useEffect, useState } from "react";
import { Link } from "react-router";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";

type RecentPatient = {
  id: string;
  full_name: string;
  blood_group: string;
  gender: string;
  registered_at: string;
  status: string;
};

const bloodGroupColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-50 text-red-600",
  "B+": "bg-orange-100 text-orange-700",
  "B-": "bg-orange-50 text-orange-600",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-50 text-purple-600",
  "O+": "bg-blue-100 text-blue-700",
  "O-": "bg-blue-50 text-blue-600",
};

function timeAgo(dt: string) {
  if (!dt) return "";
  const diff = Math.floor((Date.now() - new Date(dt).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentPatients() {
  const [patients, setPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/recent-patients")
      .then((res) => setPatients(res.data?.data ?? res.data ?? []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recently Registered
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Latest patient registrations
          </p>
        </div>
        <Link
          to={ROUTES.PATIENTS_LIST}
          className="text-xs font-bold text-brand-500 hover:text-brand-600 uppercase tracking-widest"
        >
          All Patients →
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          No patients registered recently
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-gray-800">
                {["Patient", "Blood", "Gender", "Registered"].map((h) => (
                  <th
                    key={h}
                    className="py-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {patients.slice(0, 7).map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {p.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white/90 text-sm">
                          {p.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono uppercase">
                          #{p.id.slice(0, 6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                        bloodGroupColors[p.blood_group] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.blood_group}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                    {p.gender}
                  </td>
                  <td className="py-3 text-xs text-gray-400 font-medium">
                    {timeAgo(p.registered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
