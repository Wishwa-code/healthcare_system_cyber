import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

type BedStatus = "available" | "occupied" | "maintenance";

type Bed = {
  id: string;
  ward: string;
  bed_number: string;
  status: BedStatus;
  patient_name?: string;
  admitted_date?: string;
};

// TODO: Replace with GET /ipd/beds
const MOCK_BEDS: Bed[] = [
  { id: "b1", ward: "General Ward A", bed_number: "GA-01", status: "occupied", patient_name: "Kamal Perera", admitted_date: "2026-04-25" },
  { id: "b2", ward: "General Ward A", bed_number: "GA-02", status: "available" },
  { id: "b3", ward: "General Ward A", bed_number: "GA-03", status: "maintenance" },
  { id: "b4", ward: "General Ward A", bed_number: "GA-04", status: "occupied", patient_name: "Amara Wijesinghe", admitted_date: "2026-04-24" },
  { id: "b5", ward: "General Ward A", bed_number: "GA-05", status: "available" },
  { id: "b6", ward: "General Ward A", bed_number: "GA-06", status: "available" },
  { id: "b7", ward: "Cardiology Ward", bed_number: "CW-01", status: "occupied", patient_name: "Nilanthi Silva", admitted_date: "2026-04-26" },
  { id: "b8", ward: "Cardiology Ward", bed_number: "CW-02", status: "available" },
  { id: "b9", ward: "Cardiology Ward", bed_number: "CW-03", status: "available" },
  { id: "b10", ward: "Cardiology Ward", bed_number: "CW-04", status: "maintenance" },
  { id: "b11", ward: "Surgical Ward", bed_number: "SW-01", status: "available" },
  { id: "b12", ward: "Surgical Ward", bed_number: "SW-02", status: "occupied", patient_name: "Pradeep Silva", admitted_date: "2026-04-20" },
  { id: "b13", ward: "Surgical Ward", bed_number: "SW-03", status: "available" },
  { id: "b14", ward: "Pediatrics Ward", bed_number: "PW-01", status: "available" },
  { id: "b15", ward: "Pediatrics Ward", bed_number: "PW-02", status: "occupied", patient_name: "Baby Nethsara", admitted_date: "2026-04-23" },
  { id: "b16", ward: "ICU", bed_number: "ICU-01", status: "occupied", patient_name: "Critical Patient", admitted_date: "2026-04-27" },
  { id: "b17", ward: "ICU", bed_number: "ICU-02", status: "available" },
  { id: "b18", ward: "ICU", bed_number: "ICU-03", status: "maintenance" },
];

const WARDS = [...new Set(MOCK_BEDS.map(b => b.ward))];

const BED_COLORS: Record<BedStatus, string> = {
  available: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400",
  occupied: "bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30",
  maintenance: "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60",
};

const BED_DOT: Record<BedStatus, string> = {
  available: "bg-emerald-500",
  occupied: "bg-brand-500",
  maintenance: "bg-gray-400",
};

export default function BedAllocation() {
  const [beds, setBeds] = useState<Bed[]>(MOCK_BEDS);
  const [filterWard, setFilterWard] = useState("");
  const [filterStatus, setFilterStatus] = useState<BedStatus | "">("");
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const filtered = beds.filter(b => {
    if (filterWard && b.ward !== filterWard) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  const available = beds.filter(b => b.status === "available").length;
  const occupied = beds.filter(b => b.status === "occupied").length;
  const maintenance = beds.filter(b => b.status === "maintenance").length;

  const groupedFiltered = WARDS.reduce<Record<string, Bed[]>>((acc, ward) => {
    const wardBeds = filtered.filter(b => b.ward === ward);
    if (wardBeds.length > 0) acc[ward] = wardBeds;
    return acc;
  }, {});

  // TODO: PUT /ipd/beds/:id to toggle status
  const toggleBedStatus = (bed: Bed) => {
    if (bed.status !== "available") return;
    setSelectedBed(bed);
  };

  return (
    <div className="pb-20">
      <PageMeta title="Bed / Ward Allocation | MediCare HMS" description="Hospital bed and ward occupancy management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Bed / Ward Allocation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{beds.length} total beds across {WARDS.length} wards</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available", value: available, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
          { label: "Occupied", value: occupied, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-100 dark:border-brand-500/20" },
          { label: "Maintenance", value: maintenance, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-700", border: "border-gray-200 dark:border-gray-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <select value={filterWard} onChange={e => setFilterWard(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:text-white">
          <option value="">All Wards</option>
          {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as BedStatus | "")}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:text-white">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto">
          {(["available", "occupied", "maintenance"] as BedStatus[]).map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${BED_DOT[s]}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bed grid by ward */}
      <div className="space-y-6">
        {Object.entries(groupedFiltered).map(([ward, wardBeds]) => (
          <div key={ward} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">{ward}</h2>
              <span className="text-xs text-gray-400">{wardBeds.filter(b => b.status === "available").length} / {wardBeds.length} available</span>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {wardBeds.map(bed => (
                <div key={bed.id}
                  onClick={() => toggleBedStatus(bed)}
                  className={`rounded-xl border p-3 transition-all ${BED_COLORS[bed.status]} ${bed.status === "available" ? "cursor-pointer" : "cursor-default"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${BED_DOT[bed.status]}`} />
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">{bed.bed_number}</span>
                  </div>
                  {bed.status === "occupied" && bed.patient_name && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium truncate">{bed.patient_name}</p>
                  )}
                  {bed.status === "occupied" && bed.admitted_date && (
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Since {bed.admitted_date}</p>
                  )}
                  {bed.status === "available" && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Available</p>
                  )}
                  {bed.status === "maintenance" && (
                    <p className="text-[10px] text-gray-400 font-medium">Maintenance</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedFiltered).length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No beds match the current filters</p>
          </div>
        )}
      </div>

      {/* Allocate Bed modal (placeholder - would open full admission flow) */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-black text-emerald-600">{selectedBed.bed_number}</span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Allocate Bed {selectedBed.bed_number}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{selectedBed.ward} — Currently available</p>
            <p className="text-xs text-gray-400 mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
              To allocate this bed, go to <strong>Admissions</strong> and select this ward and bed number when admitting a patient.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSelectedBed(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
