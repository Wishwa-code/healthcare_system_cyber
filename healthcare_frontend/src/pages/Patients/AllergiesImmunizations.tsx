import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import {
  UserCircleIcon,
  EyeIcon,
  PencilIcon,
  CloseLineIcon,
  CheckLineIcon,
} from "../../icons";

type Patient = {
  id: string;
  full_name: string;
  blood_group: string;
  gender: string;
  dob: string;
};

type AllergyRecord = {
  id: string;
  patient_id: string;
  allergies: string;
  immunizations: string;
  updated_at: string;
};

// Tag pill parser: splits comma-separated values into tags
function parseTags(text: string) {
  if (!text) return [];
  return text
    .split(/[,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const allergyTagColors = [
  "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
];

const immuneTagColors = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
];

export default function AllergiesImmunizations() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<AllergyRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ allergies: "", immunizations: "" });
  const [saving, setSaving] = useState(false);

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

  const loadRecord = async (p: Patient) => {
    setSelectedPatient(p);
    setRecord(null);
    setEditMode(false);
    setLoading(true);
    try {
      const res = await apiClient.get(`/patients/${p.id}/allergies`);
      setRecord(res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setDraft({
      allergies: record?.allergies ?? "",
      immunizations: record?.immunizations ?? "",
    });
    setEditMode(true);
  };

  const saveRecord = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/patients/${selectedPatient.id}/allergies`, draft);
      setRecord(res.data?.data ?? res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const allergyTags = parseTags(record?.allergies ?? "");
  const immuneTags = parseTags(record?.immunizations ?? "");

  return (
    <div className="pb-20">
      <PageMeta
        title="Allergies & Immunizations | MediCare HMS"
        description="Patient allergy and immunization records"
      />

      <div className="mt-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Allergies & Immunizations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and manage patient allergy profiles and vaccination records
        </p>
      </div>

      {/* Search */}
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
        {/* Patient search results */}
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
                      onClick={() => loadRecord(p)}
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

        {/* Detail panel */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[420px]">
            {!selectedPatient ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <UserCircleIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-semibold">Select a patient to view their record</p>
              </div>
            ) : (
              <>
                {/* Panel header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold text-sm">
                      {selectedPatient.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                        {selectedPatient.full_name}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-mono uppercase">
                        #{selectedPatient.id.slice(0, 8).toUpperCase()} · {selectedPatient.blood_group}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!editMode ? (
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 text-xs font-bold hover:bg-brand-100 transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5" /> Edit
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
                          onClick={saveRecord}
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

                {/* Body */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <span className="w-7 h-7 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">Loading…</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-8">
                    {record?.updated_at && (
                      <p className="text-[11px] text-gray-400">
                        Last updated:{" "}
                        <span className="font-bold text-gray-600 dark:text-gray-300">
                          {new Date(record.updated_at).toLocaleString()}
                        </span>
                      </p>
                    )}

                    {/* Allergies section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          Known Allergies
                        </h3>
                      </div>

                      {editMode ? (
                        <textarea
                          rows={4}
                          value={draft.allergies}
                          onChange={(e) => setDraft({ ...draft, allergies: e.target.value })}
                          placeholder="List allergies separated by commas or new lines…&#10;e.g. Penicillin, Peanuts, Latex"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white transition-colors"
                        />
                      ) : allergyTags.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-4 text-sm text-gray-400 italic">
                          No known allergies recorded
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {allergyTags.map((tag, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                allergyTagColors[i % allergyTagColors.length]
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Immunizations section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          Immunization Records
                        </h3>
                      </div>

                      {editMode ? (
                        <textarea
                          rows={4}
                          value={draft.immunizations}
                          onChange={(e) => setDraft({ ...draft, immunizations: e.target.value })}
                          placeholder="List vaccinations separated by commas or new lines…&#10;e.g. COVID-19 (2022-01-15), Hepatitis B, MMR"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white transition-colors"
                        />
                      ) : immuneTags.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-4 py-4 text-sm text-gray-400 italic">
                          No immunization records found
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {immuneTags.map((tag, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                immuneTagColors[i % immuneTagColors.length]
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
