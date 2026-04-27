import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type TransferRecord = {
  id: string;
  patient_name: string;
  type: "transfer" | "discharge";
  from_ward: string;
  to_ward?: string;
  authorized_by: string;
  date: string;
  reason: string;
  discharge_condition?: "stable" | "critical" | "against-advice";
  notes: string;
};

// TODO: Replace with GET /ipd/transfers
const MOCK_RECORDS: TransferRecord[] = [
  { id: "t1", patient_name: "Roshan De Mel", type: "discharge", from_ward: "Surgical Ward — SW-07", authorized_by: "Dr. Ravi Silva", date: "2026-04-26", reason: "Recovery complete post knee surgery", discharge_condition: "stable", notes: "Prescribed NSAIDs for 7 days. Follow-up in 2 weeks." },
  { id: "t2", patient_name: "Pradeep Silva", type: "transfer", from_ward: "General Ward A — GA-03", to_ward: "ICU — ICU-01", authorized_by: "Dr. Ashan Perera", date: "2026-04-27", reason: "Deteriorating respiratory status", notes: "Requires ventilator support." },
  { id: "t3", patient_name: "Kamala Fernando", type: "discharge", from_ward: "Cardiology Ward — CW-02", authorized_by: "Dr. Nisha Fernando", date: "2026-04-25", reason: "Stable after medication adjustment", discharge_condition: "stable", notes: "Continue Amlodipine, low salt diet. Follow-up in 1 month." },
];

const TYPE_STYLES: Record<string, string> = {
  discharge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  transfer: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const CONDITION_STYLES: Record<string, string> = {
  stable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  "against-advice": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

type Patient = { id: string; full_name: string };

export default function TransferDischarge() {
  const [records, setRecords] = useState<TransferRecord[]>(MOCK_RECORDS);
  const [showForm, setShowForm] = useState(false);
  const [recordType, setRecordType] = useState<"transfer" | "discharge">("discharge");
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ from_ward: "", to_ward: "", authorized_by: "", reason: "", discharge_condition: "stable" as string, notes: "" });
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
      // TODO: POST /ipd/transfers
      const payload = { patient_id: selectedPatient.id, type: recordType, ...form, date: new Date().toISOString().split("T")[0] };
      const res = await apiClient.post("/ipd/transfers", payload);
      const newRecord: TransferRecord = res.data?.data ?? { id: Date.now().toString(), patient_name: selectedPatient.full_name, type: recordType, ...form, date: payload.date };
      setRecords(prev => [newRecord, ...prev]);
      setShowForm(false);
      setForm({ from_ward: "", to_ward: "", authorized_by: "", reason: "", discharge_condition: "stable", notes: "" });
      setSelectedPatient(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="pb-20">
      <PageMeta title="Transfer & Discharge | MediCare HMS" description="IPD patient transfer and discharge management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Transfer & Discharge</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{records.length} record{records.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> New Record
        </button>
      </div>

      <div className="space-y-4">
        {records.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-sm flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0 mt-0.5">
                  {(r.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{r.patient_name}</p>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold ${TYPE_STYLES[r.type]}`}>
                      {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                    </span>
                    {r.discharge_condition && (
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold ${CONDITION_STYLES[r.discharge_condition]}`}>
                        {r.discharge_condition.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>From: <span className="font-semibold text-gray-700 dark:text-gray-300">{r.from_ward}</span></span>
                    {r.to_ward && <span>→ <span className="font-semibold text-gray-700 dark:text-gray-300">{r.to_ward}</span></span>}
                    <span>By: {r.authorized_by}</span>
                    <span>{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.reason}</p>
                  {r.notes && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2">{r.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No transfer or discharge records</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">New Record</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Record type toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                {(["discharge", "transfer"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setRecordType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${recordType === t ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

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

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">From Ward / Bed</label>
                <input type="text" value={form.from_ward} onChange={e => setForm({...form, from_ward: e.target.value})} placeholder="e.g. General Ward A — GA-01"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              {recordType === "transfer" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">To Ward / Bed</label>
                  <input type="text" value={form.to_ward} onChange={e => setForm({...form, to_ward: e.target.value})} placeholder="e.g. ICU — ICU-01"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              )}
              {recordType === "discharge" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Discharge Condition</label>
                  <select value={form.discharge_condition} onChange={e => setForm({...form, discharge_condition: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                    <option value="stable">Stable</option><option value="critical">Critical</option><option value="against-advice">Against Medical Advice</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Authorized By</label>
                <input type="text" value={form.authorized_by} onChange={e => setForm({...form, authorized_by: e.target.value})} placeholder="Dr. Name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Reason</label>
                <input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Reason for discharge/transfer…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes / Instructions</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Post-discharge instructions, medications, follow-up…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Saving…" : `Record ${recordType.charAt(0).toUpperCase() + recordType.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
