import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  department: string;
  avatar: string;
};

type SlotStatus = "available" | "booked" | "blocked";

type Slot = {
  time: string;
  status: SlotStatus;
  patient?: string;
};

// TODO: Replace with GET /doctors
const MOCK_DOCTORS: Doctor[] = [
  { id: "d1", full_name: "Dr. Ashan Perera", specialty: "General Medicine", department: "OPD", avatar: "AP" },
  { id: "d2", full_name: "Dr. Nisha Fernando", specialty: "Cardiology", department: "Cardiology", avatar: "NF" },
  { id: "d3", full_name: "Dr. Ravi Silva", specialty: "Orthopedics", department: "Surgery", avatar: "RS" },
  { id: "d4", full_name: "Dr. Priya Jayasena", specialty: "Pediatrics", department: "Pediatrics", avatar: "PJ" },
];

// TODO: Replace with GET /doctors/:id/availability?date=...
const MOCK_SLOTS: Record<string, Slot[]> = {
  d1: [
    { time: "08:00 AM", status: "booked", patient: "Kamal Perera" },
    { time: "08:30 AM", status: "available" },
    { time: "09:00 AM", status: "booked", patient: "Nilanthi Silva" },
    { time: "09:30 AM", status: "available" },
    { time: "10:00 AM", status: "blocked" },
    { time: "10:30 AM", status: "available" },
    { time: "11:00 AM", status: "booked", patient: "Roshan De Mel" },
    { time: "02:00 PM", status: "available" },
    { time: "02:30 PM", status: "available" },
    { time: "03:00 PM", status: "booked", patient: "Amara Wijesinghe" },
    { time: "03:30 PM", status: "available" },
    { time: "04:00 PM", status: "blocked" },
  ],
  d2: [
    { time: "09:00 AM", status: "booked", patient: "Sunil Rajapaksa" },
    { time: "09:30 AM", status: "available" },
    { time: "10:00 AM", status: "available" },
    { time: "10:30 AM", status: "booked", patient: "Kamala Fernando" },
    { time: "11:00 AM", status: "available" },
    { time: "02:00 PM", status: "available" },
    { time: "02:30 PM", status: "blocked" },
    { time: "03:00 PM", status: "available" },
  ],
  d3: [
    { time: "08:00 AM", status: "available" },
    { time: "09:00 AM", status: "booked", patient: "Pradeep Silva" },
    { time: "10:00 AM", status: "available" },
    { time: "11:00 AM", status: "available" },
    { time: "01:00 PM", status: "blocked" },
    { time: "02:00 PM", status: "available" },
    { time: "03:00 PM", status: "booked", patient: "Renuka Perera" },
  ],
  d4: [
    { time: "08:30 AM", status: "available" },
    { time: "09:30 AM", status: "booked", patient: "Baby Nethsara" },
    { time: "10:30 AM", status: "available" },
    { time: "11:00 AM", status: "available" },
    { time: "02:00 PM", status: "available" },
    { time: "03:30 PM", status: "booked", patient: "Dulani Dias" },
  ],
};

const SLOT_STYLES: Record<SlotStatus, string> = {
  available: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  booked: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20",
  blocked: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600",
};

export default function DoctorAvailability() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const slots = selectedDoctor ? (MOCK_SLOTS[selectedDoctor] ?? []) : [];
  const available = slots.filter(s => s.status === "available").length;
  const booked = slots.filter(s => s.status === "booked").length;

  return (
    <div className="pb-20">
      <PageMeta title="Doctor Availability | MediCare HMS" description="View doctor schedule and available appointment slots" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Doctor Availability</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View available slots and schedules by doctor</p>
        </div>
        <div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor list */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Doctors</h2>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {MOCK_DOCTORS.map(d => {
                const dSlots = MOCK_SLOTS[d.id] ?? [];
                const avail = dSlots.filter(s => s.status === "available").length;
                return (
                  <li key={d.id}>
                    <button onClick={() => setSelectedDoctor(d.id)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${
                        selectedDoctor === d.id
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/40"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        selectedDoctor === d.id ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                        {d.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{d.full_name}</p>
                        <p className="text-xs text-gray-400">{d.specialty}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${avail > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-gray-100 text-gray-400 dark:bg-gray-700"}`}>
                        {avail} free
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Slots panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px]">
            {!selectedDoctor ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm">Select a doctor to view availability</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">
                        {MOCK_DOCTORS.find(d => d.id === selectedDoctor)?.full_name}
                      </h2>
                      <p className="text-xs text-gray-400">{selectedDate}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-emerald-600">{available}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-brand-600">{booked}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booked</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700">
                  {[
                    { label: "Available", color: "bg-emerald-400" },
                    { label: "Booked", color: "bg-brand-500" },
                    { label: "Blocked", color: "bg-gray-300 dark:bg-gray-600" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slots.map(slot => (
                    <div key={slot.time} className={`rounded-xl border p-3 ${SLOT_STYLES[slot.status]}`}>
                      <p className="text-xs font-bold">{slot.time}</p>
                      {slot.status === "booked" && (
                        <p className="text-[10px] mt-1 font-medium truncate opacity-70">{slot.patient}</p>
                      )}
                      {slot.status === "blocked" && (
                        <p className="text-[10px] mt-1 opacity-60">Blocked</p>
                      )}
                      {slot.status === "available" && (
                        <p className="text-[10px] mt-1 opacity-70">Open</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
