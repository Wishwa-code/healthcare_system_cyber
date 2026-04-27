import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon, EyeIcon } from "../../icons";

type Prescription = {
  id: string;
  patient_name: string;
  doctor_name: string;
  issued_at: string;
  status: "active" | "dispensed" | "expired";
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
};

// TODO: Replace with GET /opd/prescriptions
const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx1", patient_name: "Kamal Perera", doctor_name: "Dr. Ashan Perera", issued_at: "2026-04-27", status: "active",
    medications: [
      { name: "Paracetamol 500mg", dosage: "1 tab", frequency: "TID", duration: "5 days" },
      { name: "ORS Sachet", dosage: "1 sachet", frequency: "BD", duration: "3 days" },
    ],
  },
  {
    id: "rx2", patient_name: "Nilanthi Silva", doctor_name: "Dr. Nisha Fernando", issued_at: "2026-04-26", status: "dispensed",
    medications: [
      { name: "Amlodipine 5mg", dosage: "1 tab", frequency: "OD", duration: "30 days" },
      { name: "Aspirin 75mg", dosage: "1 tab", frequency: "OD", duration: "30 days" },
    ],
  },
  {
    id: "rx3", patient_name: "Roshan De Mel", doctor_name: "Dr. Ravi Silva", issued_at: "2026-04-25", status: "dispensed",
    medications: [
      { name: "Ibuprofen 400mg", dosage: "1 tab", frequency: "TID", duration: "7 days" },
      { name: "Omeprazole 20mg", dosage: "1 tab", frequency: "BD", duration: "7 days" },
    ],
  },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  dispensed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  expired: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

type Patient = { id: string; full_name: string; contact_info: string };

export default function OPDPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [showForm, setShowForm] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [saving, setSaving] = useState(false);

  const searchPatients = async (q: string) => {
    setPatientQuery(q);
    if (q.trim().length < 2) { setPatients([]); return; }
    try {
      const res = await apiClient.get("/patients", { params: { search: q } });
      setPatients(res.data?.data ?? res.data ?? []);
    } catch { setPatients([]); }
  };

  const addMed = () => setMedications(prev => [...prev, { name: "", dosage: "", frequency: "", duration: "" }]);
  const removeMed = (i: number) => setMedications(prev => prev.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: string, value: string) =>
    setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      // TODO: POST /opd/prescriptions
      const payload = { patient_id: selectedPatient.id, doctor_name: doctorName, medications };
      const res = await apiClient.post("/opd/prescriptions", payload);
      const newRx: Prescription = res.data?.data ?? {
        id: Date.now().toString(), patient_name: selectedPatient.full_name, doctor_name: doctorName,
        issued_at: new Date().toISOString().split("T")[0], status: "active", medications,
      };
      setPrescriptions(prev => [newRx, ...prev]);
      setShowForm(false);
      setSelectedPatient(null); setDoctorName("");
      setMedications([{ name: "", dosage: "", frequency: "", duration: "" }]);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const viewed = viewId ? prescriptions.find(p => p.id === viewId) : null;

  return (
    <div className="pb-20">
      <PageMeta title="OPD Prescriptions | MediCare HMS" description="Digital prescription management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Digital Prescriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Issue Prescription
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {prescriptions.map(rx => (
          <div key={rx.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-sm flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0">
                  {(rx.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{rx.patient_name}</p>
                  <p className="text-xs text-gray-400">{rx.doctor_name} · {rx.issued_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[rx.status]}`}>
                  {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                </span>
                <button onClick={() => setViewId(rx.id)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all">
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {rx.medications.map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                  <span className="font-bold">{m.name}</span>
                  <span className="text-gray-400">·</span>
                  <span>{m.dosage} {m.frequency} × {m.duration}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Issue Prescription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Issue Prescription</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
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
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Prescribing Doctor</label>
                <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Medications</label>
                  <button type="button" onClick={addMed} className="text-xs font-bold text-brand-500 hover:text-brand-700">+ Add</button>
                </div>
                <div className="space-y-3">
                  {medications.map((m, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <input type="text" value={m.name} onChange={e => updateMed(i, "name", e.target.value)} placeholder="Drug name & strength"
                        className="col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white" />
                      <input type="text" value={m.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} placeholder="Dose (e.g. 1 tab)"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white" />
                      <input type="text" value={m.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} placeholder="Freq (OD/BD/TID)"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white" />
                      <input type="text" value={m.duration} onChange={e => updateMed(i, "duration", e.target.value)} placeholder="Duration (e.g. 7 days)"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:text-white" />
                      {medications.length > 1 && (
                        <button type="button" onClick={() => removeMed(i)} className="text-xs text-red-500 font-bold text-right">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Issuing…" : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Prescription</h2>
              <button onClick={() => setViewId(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-bold text-gray-900 dark:text-white">{viewed.patient_name}</p>
                <p className="text-xs text-gray-400">{viewed.doctor_name} · {viewed.issued_at}</p>
                <span className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[viewed.status]}`}>
                  {viewed.status.charAt(0).toUpperCase() + viewed.status.slice(1)}
                </span>
              </div>
              <div className="space-y-3">
                {viewed.medications.map((m, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.dosage} · {m.frequency} · {m.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
