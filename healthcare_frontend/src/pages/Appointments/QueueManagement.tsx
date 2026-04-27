import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";

type QueueEntry = {
  id: string;
  token: number;
  patient_name: string;
  doctor_name: string;
  type: string;
  status: "waiting" | "in-progress" | "completed" | "skipped";
  arrived_at: string;
};

// TODO: Replace with GET /appointments/queue
const MOCK_QUEUE: QueueEntry[] = [
  { id: "q1", token: 1, patient_name: "Kamal Perera", doctor_name: "Dr. Ashan Perera", type: "General Consultation", status: "completed", arrived_at: "08:45 AM" },
  { id: "q2", token: 2, patient_name: "Nilanthi Silva", doctor_name: "Dr. Ashan Perera", type: "Follow-up", status: "in-progress", arrived_at: "09:00 AM" },
  { id: "q3", token: 3, patient_name: "Roshan De Mel", doctor_name: "Dr. Ashan Perera", type: "Routine Check-up", status: "waiting", arrived_at: "09:30 AM" },
  { id: "q4", token: 4, patient_name: "Amara Wijesinghe", doctor_name: "Dr. Ashan Perera", type: "Lab Review", status: "waiting", arrived_at: "09:45 AM" },
  { id: "q5", token: 5, patient_name: "Sunil Rajapaksa", doctor_name: "Dr. Nisha Fernando", type: "Cardiology", status: "in-progress", arrived_at: "09:15 AM" },
  { id: "q6", token: 6, patient_name: "Kamala Fernando", doctor_name: "Dr. Nisha Fernando", type: "Follow-up", status: "waiting", arrived_at: "09:50 AM" },
  { id: "q7", token: 7, patient_name: "Pradeep Silva", doctor_name: "Dr. Ravi Silva", type: "Orthopedics", status: "waiting", arrived_at: "10:00 AM" },
];

const STATUS_NEXT: Record<QueueEntry["status"], QueueEntry["status"] | null> = {
  waiting: "in-progress",
  "in-progress": "completed",
  completed: null,
  skipped: null,
};

const STATUS_STYLES: Record<QueueEntry["status"], string> = {
  waiting: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  skipped: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

const STATUS_LABELS: Record<QueueEntry["status"], string> = {
  waiting: "Waiting",
  "in-progress": "In Progress",
  completed: "Completed",
  skipped: "Skipped",
};

export default function QueueManagement() {
  const [queue, setQueue] = useState<QueueEntry[]>(MOCK_QUEUE);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = async () => {
    try {
      // TODO: GET /appointments/queue
      const res = await apiClient.get("/appointments/queue");
      setQueue(res.data?.data ?? res.data ?? []);
      setLastRefresh(new Date());
    } catch {
      // keep mock data
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchQueue();
    intervalRef.current = setInterval(fetchQueue, 30000); // auto-refresh every 30s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const advanceStatus = async (entry: QueueEntry) => {
    const next = STATUS_NEXT[entry.status];
    if (!next) return;
    setQueue(prev => prev.map(q => q.id === entry.id ? { ...q, status: next } : q));
    try {
      // TODO: PUT /appointments/queue/:id/status
      await apiClient.put(`/appointments/queue/${entry.id}/status`, { status: next });
    } catch { /* revert on failure is optional */ }
  };

  const skipEntry = async (entry: QueueEntry) => {
    setQueue(prev => prev.map(q => q.id === entry.id ? { ...q, status: "skipped" } : q));
    try {
      await apiClient.put(`/appointments/queue/${entry.id}/status`, { status: "skipped" });
    } catch {}
  };

  const waiting = queue.filter(q => q.status === "waiting").length;
  const inProgress = queue.filter(q => q.status === "in-progress").length;
  const completed = queue.filter(q => q.status === "completed").length;

  return (
    <div className="pb-20">
      <PageMeta title="Queue Management | MediCare HMS" description="Live OPD queue management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Queue Management
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          </div>
        </div>
        <button onClick={fetchQueue} disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Waiting", value: waiting, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
          { label: "In Progress", value: inProgress, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
          { label: "Completed", value: completed, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-5 text-center`}>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-center">Token</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Arrived</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {queue.map(entry => (
                <tr key={entry.id} className={`transition-colors ${
                  entry.status === "in-progress" ? "bg-blue-50/50 dark:bg-blue-500/5"
                  : entry.status === "completed" || entry.status === "skipped" ? "opacity-50"
                  : "hover:bg-gray-50/60 dark:hover:bg-gray-700/20"}`}>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-black ${
                      entry.status === "in-progress" ? "bg-blue-500 text-white"
                      : entry.status === "completed" ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                      {entry.token}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{entry.patient_name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{entry.doctor_name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{entry.type}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs font-mono">{entry.arrived_at}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {STATUS_NEXT[entry.status] && (
                        <button onClick={() => advanceStatus(entry)}
                          className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors">
                          {entry.status === "waiting" ? "Start" : "Complete"}
                        </button>
                      )}
                      {entry.status === "waiting" && (
                        <button onClick={() => skipEntry(entry)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          Skip
                        </button>
                      )}
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
