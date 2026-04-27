import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { PlusIcon, EyeIcon, TrashBinIcon } from "../../icons";

type Appointment = {
  id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  type: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes: string;
};

// TODO: Replace with GET /appointments
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "a1", patient_name: "Kamal Perera", doctor_name: "Dr. Ashan Perera", date: "2026-04-27", time: "09:00 AM", type: "General Consultation", status: "scheduled", notes: "Fever for 3 days" },
  { id: "a2", patient_name: "Nilanthi Silva", doctor_name: "Dr. Nisha Fernando", date: "2026-04-27", time: "10:30 AM", type: "Follow-up", status: "in-progress", notes: "Post-surgery review" },
  { id: "a3", patient_name: "Roshan De Mel", doctor_name: "Dr. Ravi Silva", date: "2026-04-26", time: "02:00 PM", type: "Routine Check-up", status: "completed", notes: "" },
  { id: "a4", patient_name: "Amara Wijesinghe", doctor_name: "Dr. Priya Jayasena", date: "2026-04-26", time: "11:00 AM", type: "Emergency", status: "cancelled", notes: "Patient did not show" },
  { id: "a5", patient_name: "Sunil Rajapaksa", doctor_name: "Dr. Ashan Perera", date: "2026-04-28", time: "08:30 AM", type: "Lab Review", status: "scheduled", notes: "Blood test results" },
];

const STATUS_STYLES: Record<Appointment["status"], string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  "no-show": "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

const STATUS_LABELS: Record<Appointment["status"], string> = {
  scheduled: "Scheduled",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No Show",
};

export default function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: GET /appointments?status=...&date=...
      const res = await apiClient.get("/appointments", {
        params: { status: filterStatus || undefined, date: filterDate || undefined },
      });
      setAppointments(res.data?.data ?? res.data ?? []);
    } catch {
      // Fallback to mock while backend is being built
      setAppointments(MOCK_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => { fetchAppointments(); }, []);

  const handleDelete = async (id: string) => {
    try {
      // TODO: DELETE /appointments/:id
      await apiClient.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch {
      setAppointments(prev => prev.filter(a => a.id !== id)); // optimistic for mock
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = appointments.filter(a => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterDate && a.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="pb-20">
      <PageMeta title="Appointments List | MediCare HMS" description="All scheduled appointments" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} appointment{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => navigate(ROUTES.APPOINTMENTS_BOOK)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Date</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilterStatus(""); setFilterDate(""); fetchAppointments(); }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <span className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-500">Loading…</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center">
                  <p className="font-semibold text-gray-400">No appointments found</p>
                  <p className="text-xs text-gray-300 mt-1">Try adjusting filters or book a new appointment</p>
                </td></tr>
              ) : filtered.map((a, idx) => (
                <tr key={a.id} className="group hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-gray-300 dark:text-gray-600">{idx + 1}</td>
                  <td className="px-6 py-5 font-semibold text-gray-900 dark:text-white">{a.patient_name}</td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400">{a.doctor_name}</td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{a.date}</p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">{a.type}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-all" title="View">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(a.id)}
                        className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 dark:bg-gray-900 dark:hover:bg-red-500/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-all" title="Cancel">
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Cancel Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-gray-500 text-center mb-7">This will cancel the appointment. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">Keep</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">Cancel Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
