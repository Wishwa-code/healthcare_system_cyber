import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type Surgery = {
  id: string;
  patient_name: string;
  surgeon: string;
  procedure: string;
  scheduled_date: string;
  scheduled_time: string;
  theater: string;
  anesthesia_type: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "postponed";
  notes: string;
};

// TODO: Replace with GET /ipd/surgeries
const MOCK_SURGERIES: Surgery[] = [
  { id: "s1", patient_name: "Roshan De Mel", surgeon: "Dr. Ravi Silva", procedure: "Arthroscopic Knee Surgery", scheduled_date: "2026-04-28", scheduled_time: "08:00 AM", theater: "OT-1", anesthesia_type: "General", status: "scheduled", notes: "Patient on blood thinners - hold 3 days prior" },
  { id: "s2", patient_name: "Pradeep Silva", surgeon: "Dr. Ashan Perera", procedure: "Appendectomy", scheduled_date: "2026-04-27", scheduled_time: "10:30 AM", theater: "OT-2", anesthesia_type: "General", status: "in-progress", notes: "" },
  { id: "s3", patient_name: "Sunil Rajapaksa", surgeon: "Dr. Nisha Fernando", procedure: "CABG (Bypass Surgery)", scheduled_date: "2026-04-26", scheduled_time: "07:00 AM", theater: "OT-3", anesthesia_type: "General", status: "completed", notes: "Post-op ICU required" },
];

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  postponed: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

type Patient = { id: string; full_name: string; contact_info: string };

export default function SurgeryScheduling() {
  const [surgeries, setSurgeries] = useState<Surgery[]>(MOCK_SURGERIES);
  const [showForm, setShowForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ surgeon: "", procedure: "", scheduled_date: "", scheduled_time: "", theater: "", anesthesia_type: "General", notes: "" });
  const [saving, setSaving] = useState(false);

  const searchPatients = async (q: string) => {
    setPatientQuery(q);
    if (q.trim().length < 2) { setPatients([]); return; }
    try {
      const res = await apiClient.get("/patients", { params: { search: q } });
      setPatients(res.data?.data ?? res.data ?? []);
    } catch { setPatients([]); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      // TODO: POST /ipd/surgeries
      const payload = { patient_id: selectedPatient.id, ...form, status: "scheduled" };
      const res = await apiClient.post("/ipd/surgeries", payload);
      const newSurgery: Surgery = res.data?.data ?? { id: Date.now().toString(), patient_name: selectedPatient.full_name, ...form, status: "scheduled" };
      setSurgeries(prev => [newSurgery, ...prev]);
      setShowForm(false);
      setForm({ surgeon: "", procedure: "", scheduled_date: "", scheduled_time: "", theater: "", anesthesia_type: "General", notes: "" });
      setSelectedPatient(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="pb-20">
      <PageMeta title="Surgery Scheduling | MediCare HMS" description="Operating theater surgery schedule management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Surgery Scheduling</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{surgeries.filter(s => s.status === "scheduled").length} upcoming surgeries</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Schedule Surgery
        </button>
      </div>

      <div className="space-y-4">
        {surgeries.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-xs flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0">
                    {(s.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{s.patient_name}</p>
                    <p className="text-xs text-gray-400">{s.surgeon}</p>
                  </div>
                </div>
                <p className="text-base font-bold text-gray-800 dark:text-white mb-3">{s.procedure}</p>
                <div className="flex flex-wrap gap-2">
                  <InfoTag icon="📅" label={`${s.scheduled_date} at ${s.scheduled_time}`} />
                  <InfoTag icon="🏥" label={`Theater: ${s.theater}`} />
                  <InfoTag icon="💉" label={`Anesthesia: ${s.anesthesia_type}`} />
                </div>
                {s.notes && (
                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-500/20">
                    ⚠ {s.notes}
                  </p>
                )}
              </div>
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[s.status]}`}>
                  {s.status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </span>
              </div>
            </div>
          </div>
        ))}
        {surgeries.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No surgeries scheduled</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Schedule Surgery</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white flex-1">{selectedPatient.full_name}</span>
                    <button type="button" onClick={() => { setSelectedPatient(null); setPatients([]); setPatientQuery(""); }} className="text-xs text-brand-500 font-bold">Change</button>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><UserCircleIcon className="w-4 h-4" /></span>
                    <input type="text" placeholder="Search patient…" value={patientQuery} onChange={e => searchPatients(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                    {patients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                        <ul>{patients.map(p => (
                          <li key={p.id}><button type="button" onClick={() => { setSelectedPatient(p); setPatients([]); setPatientQuery(""); }}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white hover:bg-brand-50 dark:hover:bg-brand-500/10">{p.full_name}</button></li>
                        ))}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {[
                { field: "procedure" as const, label: "Procedure / Surgery Type", placeholder: "e.g. Appendectomy" },
                { field: "surgeon" as const, label: "Surgeon", placeholder: "Dr. Name" },
                { field: "theater" as const, label: "Operating Theater", placeholder: "e.g. OT-1" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{label}</label>
                  <input type="text" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Date</label>
                  <input type="date" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Time</label>
                  <input type="time" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Anesthesia Type</label>
                <select value={form.anesthesia_type} onChange={e => setForm({...form, anesthesia_type: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                  <option>General</option><option>Local</option><option>Regional</option><option>Spinal</option><option>Epidural</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes / Pre-op Instructions</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Special instructions, allergies, pre-op requirements…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Scheduling…" : "Schedule Surgery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTag({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium">
      <span>{icon}</span>{label}
    </span>
  );
}
