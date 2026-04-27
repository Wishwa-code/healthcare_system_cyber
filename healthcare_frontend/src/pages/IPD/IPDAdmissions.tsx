import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type Admission = {
  id: string;
  patient_name: string;
  ward: string;
  bed_number: string;
  admitted_by: string;
  admission_date: string;
  reason: string;
  status: "admitted" | "discharged" | "transferred";
};

// TODO: Replace with GET /ipd/admissions
const MOCK_ADMISSIONS: Admission[] = [
  { id: "a1", patient_name: "Kamal Perera", ward: "General Ward A", bed_number: "GA-12", admitted_by: "Dr. Ashan Perera", admission_date: "2026-04-25", reason: "Typhoid fever", status: "admitted" },
  { id: "a2", patient_name: "Nilanthi Silva", ward: "Cardiology Ward", bed_number: "CW-04", admitted_by: "Dr. Nisha Fernando", admission_date: "2026-04-26", reason: "Acute MI observation", status: "admitted" },
  { id: "a3", patient_name: "Roshan De Mel", ward: "Surgical Ward", bed_number: "SW-07", admitted_by: "Dr. Ravi Silva", admission_date: "2026-04-22", reason: "Post knee surgery", status: "discharged" },
  { id: "a4", patient_name: "Amara Wijesinghe", ward: "Pediatrics Ward", bed_number: "PW-02", admitted_by: "Dr. Priya Jayasena", admission_date: "2026-04-24", reason: "Viral pneumonia", status: "admitted" },
];

const STATUS_STYLES: Record<string, string> = {
  admitted: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  discharged: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  transferred: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

type Patient = { id: string; full_name: string; contact_info: string };

export default function IPDAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>(MOCK_ADMISSIONS);
  const [showForm, setShowForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ ward: "", bed_number: "", admitted_by: "", reason: "" });
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
      // TODO: POST /ipd/admissions
      const payload = { patient_id: selectedPatient.id, ...form, admission_date: new Date().toISOString().split("T")[0], status: "admitted" };
      const res = await apiClient.post("/ipd/admissions", payload);
      const newAdm: Admission = res.data?.data ?? { id: Date.now().toString(), patient_name: selectedPatient.full_name, ...form, admission_date: payload.admission_date, status: "admitted" };
      setAdmissions(prev => [newAdm, ...prev]);
      setShowForm(false);
      setForm({ ward: "", bed_number: "", admitted_by: "", reason: "" });
      setSelectedPatient(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const activeCount = admissions.filter(a => a.status === "admitted").length;

  return (
    <div className="pb-20">
      <PageMeta title="IPD Admissions | MediCare HMS" description="Inpatient admissions management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">IPD Admissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-brand-600">{activeCount}</span> currently admitted
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Admit Patient
        </button>
      </div>

      {/* Admissions table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Ward / Bed</th>
                <th className="px-6 py-4">Admitted By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {admissions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-semibold">No admissions found</td></tr>
              ) : admissions.map(a => (
                <tr key={a.id} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-xs flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0">
                        {(a.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{a.patient_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{a.ward}</p>
                    <p className="text-xs text-gray-400 font-mono">Bed {a.bed_number}</p>
                  </td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">{a.admitted_by}</td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">{a.admission_date}</td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-sm max-w-[180px] truncate">{a.reason}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{admissions.length} total record{admissions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Admit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Admit Patient</h2>
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
                { field: "ward" as const, label: "Ward", placeholder: "e.g. General Ward A" },
                { field: "bed_number" as const, label: "Bed Number", placeholder: "e.g. GA-12" },
                { field: "admitted_by" as const, label: "Admitting Doctor", placeholder: "Dr. Name" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{label}</label>
                  <input type="text" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Reason for Admission</label>
                <textarea rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Chief diagnosis or reason for admission…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Admitting…" : "Confirm Admission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
