import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type Patient = { id: string; full_name: string; contact_info: string };
type VitalRecord = {
  id: string;
  patient_name: string;
  recorded_by: string;
  recorded_at: string;
  temperature: string;
  blood_pressure: string;
  pulse: string;
  respiratory_rate: string;
  spo2: string;
  weight: string;
  height: string;
};

// TODO: Replace with GET /opd/vitals
const MOCK_VITALS: VitalRecord[] = [
  { id: "v1", patient_name: "Kamal Perera", recorded_by: "Nurse Lakshmi", recorded_at: "2026-04-27T09:00:00Z", temperature: "38.2", blood_pressure: "125/82", pulse: "92", respiratory_rate: "18", spo2: "97", weight: "72", height: "172" },
  { id: "v2", patient_name: "Nilanthi Silva", recorded_by: "Nurse Anura", recorded_at: "2026-04-27T10:30:00Z", temperature: "36.8", blood_pressure: "118/76", pulse: "74", respiratory_rate: "16", spo2: "99", weight: "58", height: "163" },
  { id: "v3", patient_name: "Roshan De Mel", recorded_by: "Nurse Lakshmi", recorded_at: "2026-04-26T14:00:00Z", temperature: "36.6", blood_pressure: "130/85", pulse: "80", respiratory_rate: "15", spo2: "98", weight: "85", height: "178" },
];

const VITAL_RANGES: Record<string, { label: string; unit: string; normal: string; warn: (v: string) => boolean }> = {
  temperature: { label: "Temperature", unit: "°C", normal: "36.1–37.2", warn: v => parseFloat(v) > 37.5 || parseFloat(v) < 35.5 },
  blood_pressure: { label: "Blood Pressure", unit: "mmHg", normal: "< 120/80", warn: v => { const [s] = v.split("/").map(Number); return s > 140 || s < 90; } },
  pulse: { label: "Pulse", unit: "bpm", normal: "60–100", warn: v => parseFloat(v) > 100 || parseFloat(v) < 60 },
  respiratory_rate: { label: "Resp. Rate", unit: "/min", normal: "12–20", warn: v => parseFloat(v) > 20 || parseFloat(v) < 12 },
  spo2: { label: "SpO₂", unit: "%", normal: "≥ 95", warn: v => parseFloat(v) < 95 },
};

export default function VitalSigns() {
  const [vitals, setVitals] = useState<VitalRecord[]>(MOCK_VITALS);
  const [showForm, setShowForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ temperature: "", blood_pressure: "", pulse: "", respiratory_rate: "", spo2: "", weight: "", height: "", recorded_by: "" });
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
      // TODO: POST /opd/vitals
      const payload = { patient_id: selectedPatient.id, ...form };
      const res = await apiClient.post("/opd/vitals", payload);
      const newVital: VitalRecord = res.data?.data ?? {
        id: Date.now().toString(),
        patient_name: selectedPatient.full_name,
        recorded_at: new Date().toISOString(),
        ...form,
      };
      setVitals(prev => [newVital, ...prev]);
      setShowForm(false);
      setForm({ temperature: "", blood_pressure: "", pulse: "", respiratory_rate: "", spo2: "", weight: "", height: "", recorded_by: "" });
      setSelectedPatient(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="pb-20">
      <PageMeta title="Vital Signs | MediCare HMS" description="Patient vital signs records" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Vital Signs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Record and monitor patient vitals</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Record Vitals
        </button>
      </div>

      {/* Vitals table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Temp (°C)</th>
                <th className="px-6 py-4">BP (mmHg)</th>
                <th className="px-6 py-4">Pulse (bpm)</th>
                <th className="px-6 py-4">RR (/min)</th>
                <th className="px-6 py-4">SpO₂ (%)</th>
                <th className="px-6 py-4">Wt/Ht</th>
                <th className="px-6 py-4">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {vitals.map(v => (
                <tr key={v.id} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{v.patient_name}</p>
                    <p className="text-xs text-gray-400">{v.recorded_by}</p>
                  </td>
                  <VitalCell value={v.temperature} warn={VITAL_RANGES.temperature.warn(v.temperature)} />
                  <VitalCell value={v.blood_pressure} warn={VITAL_RANGES.blood_pressure.warn(v.blood_pressure)} />
                  <VitalCell value={v.pulse} warn={VITAL_RANGES.pulse.warn(v.pulse)} />
                  <VitalCell value={v.respiratory_rate} warn={VITAL_RANGES.respiratory_rate.warn(v.respiratory_rate)} />
                  <VitalCell value={`${v.spo2}%`} warn={VITAL_RANGES.spo2.warn(v.spo2)} />
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">
                    {v.weight && <span>{v.weight} kg</span>}
                    {v.weight && v.height && <span> / </span>}
                    {v.height && <span>{v.height} cm</span>}
                    {!v.weight && !v.height && "—"}
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-400">{new Date(v.recorded_at).toLocaleString()}</td>
                </tr>
              ))}
              {vitals.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-semibold">No vitals recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Normal ranges reference */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Normal Ranges Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.values(VITAL_RANGES).map(r => (
            <div key={r.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{r.label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mt-0.5">{r.normal} {r.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Record Vital Signs</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Patient search */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
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
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white hover:bg-brand-50 dark:hover:bg-brand-500/10">
                            {p.full_name}
                          </button></li>
                        ))}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Recorded By</label>
                <input type="text" value={form.recorded_by} onChange={e => setForm({...form, recorded_by: e.target.value})} placeholder="Nurse / Doctor name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: "temperature" as const, label: "Temperature (°C)", placeholder: "e.g. 37.0" },
                  { field: "blood_pressure" as const, label: "Blood Pressure", placeholder: "e.g. 120/80" },
                  { field: "pulse" as const, label: "Pulse (bpm)", placeholder: "e.g. 75" },
                  { field: "respiratory_rate" as const, label: "Resp. Rate (/min)", placeholder: "e.g. 16" },
                  { field: "spo2" as const, label: "SpO₂ (%)", placeholder: "e.g. 98" },
                  { field: "weight" as const, label: "Weight (kg)", placeholder: "e.g. 70" },
                  { field: "height" as const, label: "Height (cm)", placeholder: "e.g. 170" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
                    <input type="text" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={!selectedPatient || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "Save Vitals"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function VitalCell({ value, warn }: { value: string; warn: boolean }) {
  return (
    <td className="px-6 py-5">
      <span className={`font-mono text-sm font-bold ${warn ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
        {value || "—"}
        {warn && value && <span className="ml-1 text-xs">⚠</span>}
      </span>
    </td>
  );
}
