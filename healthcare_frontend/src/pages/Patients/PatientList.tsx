import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashBinIcon,
  UserCircleIcon,
} from "../../icons";

type Patient = {
  id: string;
  full_name: string;
  blood_group: string;
  dob: string;
  gender: string;
  contact_info: string;
};

type Filters = {
  search: string;
  gender: string;
  blood_group: string;
};

function calcAge(dob: string): number {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const bloodGroupColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-50 text-red-600",
  "B+": "bg-orange-100 text-orange-700",
  "B-": "bg-orange-50 text-orange-600",
  "AB+": "bg-purple-100 text-purple-700",
  "AB-": "bg-purple-50 text-purple-600",
  "O+": "bg-blue-100 text-blue-700",
  "O-": "bg-blue-50 text-blue-600",
};

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    gender: "",
    blood_group: "",
  });

  const fetchPatients = useCallback(async (f: Filters = filters) => {
    setLoading(true);
    try {
      const res = await apiClient.get("/patients", { params: f });
      setPatients(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPatients(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(filters);
  };

  const clearFilters = () => {
    const reset: Filters = { search: "", gender: "", blood_group: "" };
    setFilters(reset);
    fetchPatients(reset);
  };

  const confirmDelete = async (id: string) => {
    try {
      await apiClient.delete(`/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="relative pb-20">
      <PageMeta title="Patient List | MediCare HMS" description="Manage all registered patients" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Patient List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {patients.length} registered patient{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={ROUTES.PATIENT_REGISTRATION}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Register Patient
        </Link>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Name / Patient ID
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <UserCircleIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search patients…"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Blood Group
            </label>
            <select
              value={filters.blood_group}
              onChange={(e) => setFilters({ ...filters, blood_group: e.target.value })}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">Any Blood Group</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-3 flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-8 py-2 rounded-full bg-brand-500 text-white text-sm font-bold shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <span className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-500">
                      Loading Patients…
                    </p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <UserCircleIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="font-semibold text-gray-500 dark:text-gray-400">
                        No patients found
                      </p>
                      <p className="text-xs text-gray-400">
                        Try adjusting filters or register a new patient
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="group hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-colors"
                  >
                    <td className="px-6 py-5 text-center font-bold text-gray-300 dark:text-gray-600 text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-100 dark:border-brand-500/20 shrink-0">
                          {p.full_name
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {p.full_name}
                          </p>
                          <p className="text-[11px] text-gray-400 uppercase tracking-tight font-mono">
                            #{p.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                          bloodGroupColors[p.blood_group] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          p.gender === "Male"
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
                            : p.gender === "Female"
                            ? "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.gender}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-700 dark:text-gray-300">
                      {calcAge(p.dob)} yrs
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                      {p.contact_info}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(ROUTES.PATIENT_EHR + "?patient=" + p.id)
                          }
                          className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all border border-gray-100 dark:border-gray-700"
                          title="View EHR"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              ROUTES.PATIENT_REGISTRATION + "?edit=" + p.id
                            )
                          }
                          className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all border border-gray-100 dark:border-gray-700"
                          title="Edit Patient"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2.5 bg-gray-50 hover:bg-error-50 text-gray-400 hover:text-error-500 dark:bg-gray-900 dark:hover:bg-error-500/10 rounded-xl transition-all border border-gray-100 dark:border-gray-700"
                          title="Delete Patient"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {patients.length} record{patients.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Previous
            </button>
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 max-w-sm w-full mx-4">
            <div className="w-14 h-14 rounded-2xl bg-error-50 dark:bg-error-500/10 flex items-center justify-center mx-auto mb-5">
              <TrashBinIcon className="w-7 h-7 text-error-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
              Delete Patient?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-7">
              This will permanently remove the patient record and all associated EHR data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
