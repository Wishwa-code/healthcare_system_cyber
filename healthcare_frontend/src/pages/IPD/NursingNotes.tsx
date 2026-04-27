import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { UserCircleIcon, PlusIcon } from "../../icons";

type NursingNote = {
  id: string;
  patient_name: string;
  ward: string;
  nurse_name: string;
  note_time: string;
  note_type: "observation" | "medication" | "procedure" | "incident" | "general";
  content: string;
};

// TODO: Replace with GET /ipd/nursing-notes
const MOCK_NOTES: NursingNote[] = [
  { id: "n1", patient_name: "Kamal Perera", ward: "General Ward A — GA-01", nurse_name: "Nurse Lakshmi", note_time: "2026-04-27T08:00:00Z", note_type: "observation", content: "Patient resting comfortably. Temperature 37.8°C, BP 130/85. Complains of mild headache. Increased IV fluids as per Dr. Perera's order." },
  { id: "n2", patient_name: "Nilanthi Silva", ward: "Cardiology Ward — CW-01", nurse_name: "Nurse Anura", note_time: "2026-04-27T09:30:00Z", note_type: "medication", content: "Administered Amlodipine 5mg OD as prescribed. Patient tolerated well. No adverse reactions noted." },
  { id: "n3", patient_name: "Roshan De Mel", ward: "Surgical Ward — SW-02", nurse_name: "Nurse Priya", note_time: "2026-04-26T14:00:00Z", note_type: "procedure", content: "Post-op wound dressing changed. Wound healing well, no signs of infection. Patient reported pain level 4/10. Notified surgeon." },
  { id: "n4", patient_name: "Amara Wijesinghe", ward: "Pediatrics Ward — PW-02", nurse_name: "Nurse Kamala", note_time: "2026-04-27T10:00:00Z", note_type: "general", content: "Child alert and interactive. Eating well. Fever subsided to 36.9°C. Family present and informed about progress." },
];

const TYPE_STYLES: Record<NursingNote["note_type"], string> = {
  observation: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  medication: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  procedure: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  incident: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  general: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

type Patient = { id: string; full_name: string };

export default function NursingNotes() {
  const [notes, setNotes] = useState<NursingNote[]>(MOCK_NOTES);
  const [showForm, setShowForm] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ ward: "", nurse_name: "", note_type: "observation" as NursingNote["note_type"], content: "" });
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
      // TODO: POST /ipd/nursing-notes
      const payload = { patient_id: selectedPatient.id, ...form };
      const res = await apiClient.post("/ipd/nursing-notes", payload);
      const newNote: NursingNote = res.data?.data ?? {
        id: Date.now().toString(), patient_name: selectedPatient.full_name,
        note_time: new Date().toISOString(), ...form,
      };
      setNotes(prev => [newNote, ...prev]);
      setShowForm(false);
      setForm({ ward: "", nurse_name: "", note_type: "observation", content: "" });
      setSelectedPatient(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="pb-20">
      <PageMeta title="Nursing Notes | MediCare HMS" description="IPD nursing observation and care notes" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nursing Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{notes.length} note{notes.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Add Note
        </button>
      </div>

      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-bold text-sm flex items-center justify-center border border-brand-100 dark:border-brand-500/20 shrink-0 mt-0.5">
                {(note.patient_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{note.patient_name}</p>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <p className="text-xs text-gray-400">{note.ward}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${TYPE_STYLES[note.note_type]}`}>
                    {note.note_type.charAt(0).toUpperCase() + note.note_type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{note.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs text-gray-400">{note.nurse_name}</p>
                  <span className="text-gray-200 dark:text-gray-700">·</span>
                  <p className="text-xs text-gray-400 font-mono">{new Date(note.note_time).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No nursing notes yet</p>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Add Nursing Note</h2>
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
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Ward / Bed</label>
                <input type="text" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} placeholder="e.g. General Ward A — GA-01"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Nurse Name</label>
                <input type="text" value={form.nurse_name} onChange={e => setForm({...form, nurse_name: e.target.value})} placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Note Type</label>
                <select value={form.note_type} onChange={e => setForm({...form, note_type: e.target.value as NursingNote["note_type"]})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                  <option value="observation">Observation</option>
                  <option value="medication">Medication</option>
                  <option value="procedure">Procedure</option>
                  <option value="incident">Incident</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Note</label>
                <textarea rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Clinical observation, medication administered, procedure performed…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={!selectedPatient || !form.content || saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Saving…" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
