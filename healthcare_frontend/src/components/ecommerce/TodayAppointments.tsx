import { useEffect, useState } from "react";
import { Link } from "react-router";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import Badge from "../ui/badge/Badge";

type Appointment = {
  id: string;
  patient_name: string;
  doctor_name: string;
  scheduled_time: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed";
};

const statusColor = (s: Appointment["status"]) => {
  if (s === "Confirmed") return "success";
  if (s === "Pending") return "warning";
  if (s === "Cancelled") return "error";
  return "light";
};

function formatTime(dt: string) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dt;
  }
}

export default function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard/today-appointments")
      .then((res) => setAppointments(res.data?.data ?? res.data ?? []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Today's Appointments
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to={ROUTES.APPOINTMENTS_LIST}
          className="text-xs font-bold text-brand-500 hover:text-brand-600 uppercase tracking-widest"
        >
          View All →
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead>
            <tr className="border-y border-gray-100 dark:border-gray-800">
              {["Time", "Patient", "Doctor", "Status"].map((h) => (
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
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <span className="inline-block w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                  No appointments scheduled for today
                </td>
              </tr>
            ) : (
              appointments.slice(0, 6).map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 text-xs">
                      {formatTime(a.scheduled_time)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {a.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                        {a.patient_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 text-sm">
                    Dr. {a.doctor_name}
                  </td>
                  <td className="py-3">
                    <Badge size="sm" color={statusColor(a.status)}>
                      {a.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
