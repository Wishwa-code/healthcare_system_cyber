import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { UserCircleIcon, EyeIcon } from "../../icons";

type Patient = {
  id: string;
  full_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  contact_info: string;
};

type HistoryRecord = {
  id: string;
  patient_id: string;
  medical_history: string;
  updated_at: string;
};

// Attempt to parse a flat text into "timeline" entries separated by newlines
function parseHistoryLines(text: string) {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const searchPatients = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await apiClient.get("/patients", { params: { search: query } });
      setPatients(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const loadHistory = async (p: Patient) => {
    setSelectedPatient(p);
    setRecord(null);
    setLoading(true);
    try {
      const res = await apiClient.get(`/patients/${p.id}/history`);
      setRecord(res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const historyLines = parseHistoryLines(record?.medical_history ?? "");

  return (
    <div className="pb-20">
      <PageMeta title="Medical History | MediCare HMS" description="Patient medical history records" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Medical History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View a patient's complete medical history timeline
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={searchPatients} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <UserCircleIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search patient by name or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-11 pr-4 py-3 text-sm outline-none focus:border-brand-500 transition-colors dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-7 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PATIENTS_LIST)}
          className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          All Patients
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Patient Results
              </h2>
            </div>

            {searching ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">Searching…</p>
              </div>
            ) : !searched ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <UserCircleIcon className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                <p className="text-sm font-medium">Search for a patient above</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-gray-400">No patients found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {patients.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => loadHistory(p)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
                        selectedPatient?.id === p.id
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {p.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {p.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-tight font-mono">
                          #{p.id.slice(0, 8).toUpperCase()} · {p.gender}
                        </p>
                      </div>
                      {selectedPatient?.id === p.id && (
                        <EyeIcon className="w-4 h-4 text-brand-500 ml-auto shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* History timeline panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px]">
            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <UserCircleIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-semibold">Select a patient to view history</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold">
                    {selectedPatient.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      {selectedPatient.full_name}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {selectedPatient.blood_group} · {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">Loading…</p>
                  </div>
                ) : !record || !record.medical_history ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                    <p className="text-sm font-medium">No medical history recorded</p>
                    <button
                      onClick={() => navigate(ROUTES.PATIENT_EHR)}
                      className="text-xs font-bold text-brand-500 hover:underline"
                    >
                      Add via EHR Records →
                    </button>
                  </div>
                ) : (
                  <div className="p-6">
                    {record.updated_at && (
                      <p className="text-[11px] text-gray-400 mb-6">
                        Last updated:{" "}
                        <span className="font-bold text-gray-600 dark:text-gray-300">
                          {new Date(record.updated_at).toLocaleString()}
                        </span>
                      </p>
                    )}

                    {/* Timeline */}
                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent dark:from-brand-800 dark:via-brand-900 rounded-full" />

                      <div className="space-y-5">
                        {historyLines.length > 0 ? (
                          historyLines.map((line, i) => (
                            <div key={i} className="relative">
                              {/* Dot */}
                              <span className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-brand-400 bg-white dark:bg-gray-800 shadow-sm" />
                              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {line}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="relative">
                            <span className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-brand-400 bg-white dark:bg-gray-800 shadow-sm" />
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {record.medical_history}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
