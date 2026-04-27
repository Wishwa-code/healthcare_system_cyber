import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type Patient = { id: string; full_name: string; contact_info: string; dob: string; blood_group: string };
type Consultation = {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_plan: string;
  follow_up_date: string;
};

// TODO: Replace with GET /opd/consultations
const MOCK_CONSULTATIONS: Consultation[] = [
  { id: "c1", patient_id: "p1", patient_name: "Kamal Perera", doctor_name: "Dr. Ashan Perera", date: "2026-04-27", chief_complaint: "Fever and headache", diagnosis: "Viral fever", treatment_plan: "Rest, fluids, paracetamol", follow_up_date: "2026-05-01" },
  { id: "c2", patient_id: "p2", patient_name: "Nilanthi Silva", doctor_name: "Dr. Nisha Fernando", date: "2026-04-26", chief_complaint: "Chest pain", diagnosis: "GERD", treatment_plan: "Antacids, dietary advice", follow_up_date: "" },
  { id: "c3", patient_id: "p3", patient_name: "Roshan De Mel", doctor_name: "Dr. Ravi Silva", date: "2026-04-25", chief_complaint: "Knee pain after jogging", diagnosis: "Runner's knee", treatment_plan: "Rest, NSAIDs, physiotherapy", follow_up_date: "2026-05-10" },
];

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OPDConsultation() {
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [showForm, setShowForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ chief_complaint: "", diagnosis: "", treatment_plan: "", follow_up_date: "", doctor_name: "" });
  const [saving, setSaving] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

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
      // TODO: POST /opd/consultations
      const payload = { patient_id: selectedPatient.id, ...form };
      const res = await apiClient.post("/opd/consultations", payload);
      const newItem: Consultation = res.data?.data ?? { id: Date.now().toString(), patient_name: selectedPatient.full_name, date: new Date().toISOString().split("T")[0], ...form };
      setConsultations(prev => [newItem, ...prev]);
      setShowForm(false);
      setForm({ chief_complaint: "", diagnosis: "", treatment_plan: "", follow_up_date: "", doctor_name: "" });
      setSelectedPatient(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const viewed = viewId ? consultations.find(c => c.id === viewId) : null;

  return (
    <div className="pb-20">
      <PageMeta title="OPD Consultations | MediCare HMS" description="Outpatient consultation records" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">OPD Consultations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{consultations.length} consultation record{consultations.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> New Consultation
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {consultations.map(c => (
          <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-sm flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0">
                {(c.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{c.patient_name}</p>
                <p className="text-xs text-gray-400">{c.doctor_name} · {formatDate(c.date)}</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Chief Complaint</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.chief_complaint}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Diagnosis</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.diagnosis}</p>
            </div>
            {c.follow_up_date && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow-up</p>
                <p className="text-xs font-bold text-brand-600">{formatDate(c.follow_up_date)}</p>
              </div>
            )}
            <button onClick={() => setViewId(c.id)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0">
              View
            </button>
          </div>
        ))}
        {consultations.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No consultation records yet</p>
          </div>
        )}
      </div>

      {/* New Consultation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">New OPD Consultation</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Patient search */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(selectedPatient.full_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                    </div>
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
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.full_name}</span>
                          </button></li>
                        ))}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Attending Doctor</label>
                <input type="text" value={form.doctor_name} onChange={e => setForm({...form, doctor_name: e.target.value})} placeholder="Dr. Name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              {[
                { field: "chief_complaint" as const, label: "Chief Complaint", placeholder: "Patient's main complaint…" },
                { field: "diagnosis" as const, label: "Diagnosis", placeholder: "Clinical diagnosis…" },
                { field: "treatment_plan" as const, label: "Treatment Plan", placeholder: "Medications, procedures, lifestyle advice…" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{label}</label>
                  <textarea rows={3} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Follow-up Date (optional)</label>
                <input type="date" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date: e.target.value})}
                  className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "Save Consultation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Consultation Record</h2>
              <button onClick={() => setViewId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 font-bold text-sm flex items-center justify-center shrink-0">
                  {(viewed.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{viewed.patient_name}</p>
                  <p className="text-xs text-gray-400">{viewed.doctor_name} · {formatDate(viewed.date)}</p>
                </div>
              </div>
              {[
                { label: "Chief Complaint", value: viewed.chief_complaint, color: "bg-amber-400" },
                { label: "Diagnosis", value: viewed.diagnosis, color: "bg-blue-400" },
                { label: "Treatment Plan", value: viewed.treatment_plan, color: "bg-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {value || <span className="text-gray-300 dark:text-gray-600 italic">Not recorded</span>}
                  </div>
                </div>
              ))}
              {viewed.follow_up_date && (
                <p className="text-sm text-brand-600 font-semibold">Follow-up: {formatDate(viewed.follow_up_date)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
