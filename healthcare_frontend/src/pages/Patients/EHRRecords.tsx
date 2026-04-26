import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import {
  EyeIcon,
  UserCircleIcon,
  CloseLineIcon,
  PencilIcon,
  CheckLineIcon,
} from "../../icons";

type Patient = {
  id: string;
  full_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  contact_info: string;
};

type EHR = {
  id: string;
  patient_id: string;
  allergies: string;
  medical_history: string;
  immunizations: string;
  updated_at: string;
};

export default function EHRRecords() {
  const navigate = useNavigate();

  // Search / patient lookup
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Selected patient EHR
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [ehr, setEhr] = useState<EHR | null>(null);
  const [ehrLoading, setEhrLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<Partial<EHR>>({});
  const [saving, setSaving] = useState(false);

  const searchPatients = useCallback(async (e: React.FormEvent) => {
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
  }, [query]);

  const loadEHR = async (p: Patient) => {
    setSelectedPatient(p);
    setEhr(null);
    setEditMode(false);
    setEhrLoading(true);
    try {
      const res = await apiClient.get(`/patients/${p.id}/ehr`);
      setEhr(res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEhrLoading(false);
    }
  };

  const saveEHR = async () => {
    if (!selectedPatient || !editDraft) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/patients/${selectedPatient.id}/ehr`, editDraft);
      setEhr(res.data?.data ?? res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setEditDraft({
      allergies: ehr?.allergies ?? "",
      medical_history: ehr?.medical_history ?? "",
      immunizations: ehr?.immunizations ?? "",
    });
    setEditMode(true);
  };

  const textArea = (
    field: keyof EHR,
    label: string,
    placeholder: string,
    color: string
  ) => (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          {label}
        </h3>
      </div>
      {editMode ? (
        <textarea
          rows={5}
          value={(editDraft[field] as string) ?? ""}
          onChange={(e) => setEditDraft({ ...editDraft, [field]: e.target.value })}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white transition-colors"
        />
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 min-h-[80px] whitespace-pre-wrap leading-relaxed">
          {(ehr?.[field] as string) || (
            <span className="text-gray-300 dark:text-gray-600 italic">Not recorded</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <PageMeta title="EHR / EMR Records | MediCare HMS" description="Electronic Health Records" />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          EHR / EMR Records
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Search a patient to view or update their Electronic Health Record
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={searchPatients}
        className="flex gap-3 mb-6"
      >
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <UserCircleIcon className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by patient name or ID…"
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
        {/* Patient results list */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Results
              </h2>
              {patients.length > 0 && (
                <span className="text-xs font-bold text-brand-500">
                  {patients.length} patient{patients.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {searching ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">
                  Searching…
                </p>
              </div>
            ) : !searched ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <UserCircleIcon className="w-10 h-10 text-gray-200 dark:text-gray-700" />
                <p className="text-sm font-medium">Search for a patient above</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <p className="text-sm font-medium">No patients found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {patients.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => loadEHR(p)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
                        selectedPatient?.id === p.id
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {p.full_name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {p.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 uppercase tracking-tight font-mono">
                          #{p.id.slice(0, 8).toUpperCase()} · {p.blood_group}
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

        {/* EHR Detail Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px]">
            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <EyeIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-semibold">Select a patient to view EHR</p>
              </div>
            ) : (
              <>
                {/* Panel header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      {selectedPatient.full_name}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono uppercase">
                      #{selectedPatient.id.slice(0, 8).toUpperCase()} · {selectedPatient.blood_group} · {selectedPatient.gender}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!editMode ? (
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 text-xs font-bold hover:bg-brand-100 transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5" /> Edit EHR
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditMode(false)}
                          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CloseLineIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={saveEHR}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-60"
                        >
                          {saving ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckLineIcon className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* EHR content */}
                {ehrLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">
                      Loading EHR…
                    </p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {ehr?.updated_at && (
                      <p className="text-[11px] text-gray-400 font-medium">
                        Last updated:{" "}
                        <span className="font-bold text-gray-600 dark:text-gray-300">
                          {new Date(ehr.updated_at).toLocaleString()}
                        </span>
                      </p>
                    )}
                    {textArea("allergies", "Allergies", "List known drug/food/environmental allergies…", "bg-red-400")}
                    {textArea("medical_history", "Medical History", "Past diagnoses, surgeries, chronic conditions…", "bg-blue-400")}
                    {textArea("immunizations", "Immunizations", "Vaccination records and dates…", "bg-emerald-400")}
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
