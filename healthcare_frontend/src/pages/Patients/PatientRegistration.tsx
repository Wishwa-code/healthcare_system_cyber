import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { CheckCircleIcon, UserCircleIcon } from "../../icons";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type PatientForm = {
  full_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string;
};

const empty: PatientForm = {
  full_name: "",
  dob: "",
  gender: "",
  blood_group: "",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  emergency_name: "",
  emergency_phone: "",
  emergency_relation: "",
};

type FieldError = Partial<PatientForm>;

function validate(f: PatientForm): FieldError {
  const e: FieldError = {};
  if (!f.full_name.trim()) e.full_name = "Full name is required";
  // if (!f.dob) e.dob = "Date of birth is required";
  if (!f.gender) e.gender = "Gender is required";
  if (!f.blood_group) e.blood_group = "Blood group is required";
  if (!f.contact_phone.trim()) e.contact_phone = "Phone number is required";
  return e;
}

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const isEdit = !!editId;

  const [form, setForm] = useState<PatientForm>(empty);
  const [errors, setErrors] = useState<FieldError>({});
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await apiClient.get(`/patients/${editId}`);
        const p = res.data?.data ?? res.data;
        setForm({
          full_name: p.full_name ?? "",
          dob: p.dob ?? "",
          gender: p.gender ?? "",
          blood_group: p.blood_group ?? "",
          contact_phone: p.contact_info ?? "",
          contact_email: p.contact_email ?? "",
          contact_address: p.contact_address ?? "",
          emergency_name: p.emergency_name ?? "",
          emergency_phone: p.emergency_phone ?? "",
          emergency_relation: p.emergency_relation ?? "",
        });
      } catch (err) {
        console.error("Failed to load patient", err);
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId]);

  const set = (field: keyof PatientForm, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        dob: form.dob,
        gender: form.gender,
        blood_group: form.blood_group,
        contact_info: form.contact_phone,
        contact_email: form.contact_email,
        contact_address: form.contact_address,
        emergency_name: form.emergency_name,
        emergency_phone: form.emergency_phone,
        emergency_relation: form.emergency_relation,
      };
      if (isEdit) {
        await apiClient.put(`/patients/${editId}`, payload);
      } else {
        await apiClient.post("/patients", payload);
      }
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.PATIENTS_LIST), 1500);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Field helpers ──────────────────────────────────────────────────────────

  const Field = ({
    label,
    id,
    children,
    error,
    required,
  }: {
    label: string;
    id: string;
    children: React.ReactNode;
    error?: string;
    required?: boolean;
  }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-error-500 font-medium">{error}</p>
      )}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full rounded-xl border ${
      err
        ? "border-error-400 bg-error-50 dark:bg-error-500/5"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    } px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors dark:text-white`;

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
          <CheckCircleIcon className="w-8 h-8 text-success-500" />
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          Patient {isEdit ? "updated" : "registered"} successfully!
        </p>
        <p className="text-sm text-gray-400">Redirecting to patient list…</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageMeta
        title={`${isEdit ? "Edit" : "Register"} Patient | MediCare HMS`}
        description="Patient registration form"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 mt-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
          <UserCircleIcon className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Patient" : "Patient Registration"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? "Update existing patient demographics"
              : "Register a new patient into the system"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Demographics ─────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 rounded-full bg-brand-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Patient Demographics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name" id="full_name" error={errors.full_name} required>
              <input
                id="full_name"
                type="text"
                placeholder="e.g. Amal Perera"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                className={inputCls(errors.full_name)}
              />
            </Field>

            <Field label="Date of Birth" id="dob" error={errors.dob} required>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                className={inputCls(errors.dob)}
              />
            </Field>

            <Field label="Gender" id="gender" error={errors.gender} required>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={inputCls(errors.gender)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Blood Group" id="blood_group" error={errors.blood_group} required>
              <select
                id="blood_group"
                value={form.blood_group}
                onChange={(e) => set("blood_group", e.target.value)}
                className={inputCls(errors.blood_group)}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* ── Section 2: Contact ──────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Phone Number" id="contact_phone" error={errors.contact_phone} required>
              <input
                id="contact_phone"
                type="tel"
                placeholder="+94 77 123 4567"
                value={form.contact_phone}
                onChange={(e) => set("contact_phone", e.target.value)}
                className={inputCls(errors.contact_phone)}
              />
            </Field>

            <Field label="Email Address" id="contact_email">
              <input
                id="contact_email"
                type="email"
                placeholder="patient@example.com"
                value={form.contact_email}
                onChange={(e) => set("contact_email", e.target.value)}
                className={inputCls()}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Home Address" id="contact_address">
                <textarea
                  id="contact_address"
                  rows={3}
                  placeholder="Street, City, Province"
                  value={form.contact_address}
                  onChange={(e) => set("contact_address", e.target.value)}
                  className={inputCls() + " resize-none"}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Section 3: Emergency Contact ────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 rounded-full bg-orange-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Emergency Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Contact Name" id="emergency_name">
              <input
                id="emergency_name"
                type="text"
                placeholder="e.g. Sunil Perera"
                value={form.emergency_name}
                onChange={(e) => set("emergency_name", e.target.value)}
                className={inputCls()}
              />
            </Field>

            <Field label="Contact Phone" id="emergency_phone">
              <input
                id="emergency_phone"
                type="tel"
                placeholder="+94 77 000 0000"
                value={form.emergency_phone}
                onChange={(e) => set("emergency_phone", e.target.value)}
                className={inputCls()}
              />
            </Field>

            <Field label="Relationship" id="emergency_relation">
              <select
                id="emergency_relation"
                value={form.emergency_relation}
                onChange={(e) => set("emergency_relation", e.target.value)}
                className={inputCls()}
              >
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PATIENTS_LIST)}
            className="px-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition-colors flex items-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {saving ? "Saving…" : isEdit ? "Update Patient" : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
