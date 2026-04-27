import { useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { PlusIcon, UserCircleIcon } from "../../icons";

type Patient = { id: string; full_name: string; contact_info: string };
type Doctor = { id: string; full_name: string; specialty: string; department: string };
type TimeSlot = { time: string; available: boolean };

// TODO: Replace with GET /doctors
const MOCK_DOCTORS: Doctor[] = [
  { id: "d1", full_name: "Dr. Ashan Perera", specialty: "General Medicine", department: "OPD" },
  { id: "d2", full_name: "Dr. Nisha Fernando", specialty: "Cardiology", department: "Cardiology" },
  { id: "d3", full_name: "Dr. Ravi Silva", specialty: "Orthopedics", department: "Surgery" },
  { id: "d4", full_name: "Dr. Priya Jayasena", specialty: "Pediatrics", department: "Pediatrics" },
];

// TODO: Replace with GET /doctors/:id/availability?date=...
const MOCK_SLOTS: TimeSlot[] = [
  { time: "08:00 AM", available: true },
  { time: "08:30 AM", available: false },
  { time: "09:00 AM", available: true },
  { time: "09:30 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "02:00 PM", available: true },
  { time: "02:30 PM", available: false },
  { time: "03:00 PM", available: true },
  { time: "03:30 PM", available: true },
];

const APPT_TYPES = ["General Consultation", "Follow-up", "Specialist Referral", "Emergency", "Routine Check-up", "Lab Review"];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-200 text-right truncate max-w-[55%]">{value}</span>
    </div>
  );
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchPatients = async (q: string) => {
    setPatientQuery(q);
    if (q.trim().length < 2) { setPatients([]); return; }
    setPatientLoading(true);
    try {
      const res = await apiClient.get("/patients", { params: { search: q } });
      setPatients(res.data?.data ?? res.data ?? []);
    } catch { setPatients([]); }
    finally { setPatientLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor || !appointmentDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      // TODO: POST /appointments
      await apiClient.post("/appointments", {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctor,
        date: appointmentDate,
        time: selectedSlot,
        type: appointmentType,
        notes,
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.APPOINTMENTS_LIST), 1800);
    } catch (err) {
      console.error("Failed to book appointment", err);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appointment Booked!</h2>
        <p className="text-sm text-gray-500">Redirecting…</p>
      </div>
    );
  }

  const selectedDoctorObj = MOCK_DOCTORS.find(d => d.id === selectedDoctor);

  return (
    <div className="pb-20">
      <PageMeta title="Book Appointment | MediCare HMS" description="Schedule a new patient appointment" />

      <div className="flex items-center justify-between mt-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Schedule a new appointment for a patient</p>
        </div>
        <button onClick={() => navigate(ROUTES.APPOINTMENTS_LIST)}
          className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          View All
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Patient */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5">1 · Patient</h2>
            {selectedPatient ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {(selectedPatient.full_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white">{selectedPatient.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedPatient.contact_info}</p>
                </div>
                <button type="button" onClick={() => { setSelectedPatient(null); setPatients([]); setPatientQuery(""); }}
                  className="text-xs font-bold text-brand-500 hover:text-brand-700 transition-colors">Change</button>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><UserCircleIcon className="w-4 h-4" /></span>
                <input type="text" placeholder="Search patient by name or ID…" value={patientQuery}
                  onChange={e => searchPatients(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors dark:text-white" />
                {(patients.length > 0 || patientLoading) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                    {patientLoading ? (
                      <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
                        <span className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />Searching…
                      </div>
                    ) : (
                      <ul>{patients.map(p => (
                        <li key={p.id}>
                          <button type="button" onClick={() => { setSelectedPatient(p); setPatients([]); setPatientQuery(""); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {(p.full_name ?? "").split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.full_name}</p>
                              <p className="text-xs text-gray-400">{p.contact_info}</p>
                            </div>
                          </button>
                        </li>
                      ))}</ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5">2 · Doctor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_DOCTORS.map(d => (
                <button key={d.id} type="button" onClick={() => setSelectedDoctor(d.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selectedDoctor === d.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500/50"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    selectedDoctor === d.id ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                    {d.full_name.split(" ").slice(1).map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{d.full_name}</p>
                    <p className="text-xs text-gray-400">{d.specialty} · {d.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Slots */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5">3 · Date & Time</h2>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Date</label>
              <input type="date" min={today} value={appointmentDate}
                onChange={e => { setAppointmentDate(e.target.value); setSelectedSlot(""); }}
                className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors dark:text-white" />
            </div>
            {appointmentDate && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Slots</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {MOCK_SLOTS.map(slot => (
                    <button key={slot.time} type="button" disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        !slot.available ? "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : selectedSlot === slot.time ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-brand-50 hover:text-brand-600"}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5">4 · Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Type</label>
                <select value={appointmentType} onChange={e => setAppointmentType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                  <option value="">Select type…</option>
                  {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Notes</label>
                <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for visit, special instructions…"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none dark:text-white" />
              </div>
            </div>
          </div>

          <div className="bg-brand-50 dark:bg-brand-500/10 rounded-2xl border border-brand-100 dark:border-brand-500/20 p-5 space-y-3">
            <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Summary</h3>
            <SummaryRow label="Patient" value={selectedPatient?.full_name ?? "—"} />
            <SummaryRow label="Doctor" value={selectedDoctorObj?.full_name ?? "—"} />
            <SummaryRow label="Date" value={appointmentDate || "—"} />
            <SummaryRow label="Time" value={selectedSlot || "—"} />
            <SummaryRow label="Type" value={appointmentType || "—"} />
          </div>

          <button type="submit"
            disabled={!selectedPatient || !selectedDoctor || !appointmentDate || !selectedSlot || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-colors shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <PlusIcon className="w-4 h-4" />}
            {submitting ? "Booking…" : "Confirm Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
