import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { EyeIcon } from "../../icons";

type PharmacyPrescription = {
  id: string;
  patient_name: string;
  doctor_name: string;
  issued_date: string;
  dispensed_date?: string;
  status: "pending" | "dispensed" | "partially-dispensed";
  medications: { name: string; dosage: string; quantity: string; dispensed: boolean }[];
};

// TODO: Replace with GET /pharmacy/prescriptions
const MOCK_PRESCRIPTIONS: PharmacyPrescription[] = [
  {
    id: "rx1", patient_name: "Kamal Perera", doctor_name: "Dr. Ashan Perera", issued_date: "2026-04-27", status: "pending",
    medications: [
      { name: "Paracetamol 500mg", dosage: "1 tab TID", quantity: "15 tabs", dispensed: false },
      { name: "ORS Sachet", dosage: "1 sachet BD", quantity: "6 sachets", dispensed: false },
    ],
  },
  {
    id: "rx2", patient_name: "Nilanthi Silva", doctor_name: "Dr. Nisha Fernando", issued_date: "2026-04-26", dispensed_date: "2026-04-26", status: "dispensed",
    medications: [
      { name: "Amlodipine 5mg", dosage: "1 tab OD", quantity: "30 tabs", dispensed: true },
      { name: "Aspirin 75mg", dosage: "1 tab OD", quantity: "30 tabs", dispensed: true },
    ],
  },
  {
    id: "rx3", patient_name: "Roshan De Mel", doctor_name: "Dr. Ravi Silva", issued_date: "2026-04-25", status: "partially-dispensed",
    medications: [
      { name: "Ibuprofen 400mg", dosage: "1 tab TID", quantity: "21 tabs", dispensed: true },
      { name: "Omeprazole 20mg", dosage: "1 tab BD", quantity: "14 tabs", dispensed: false },
    ],
  },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  dispensed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "partially-dispensed": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(MOCK_PRESCRIPTIONS);
  const [viewId, setViewId] = useState<string | null>(null);
  const [dispensing, setDispensing] = useState<string | null>(null);

  const dispense = async (id: string) => {
    setDispensing(id);
    try {
      // TODO: PUT /pharmacy/prescriptions/:id/dispense
      await apiClient.put(`/pharmacy/prescriptions/${id}/dispense`);
      setPrescriptions(prev => prev.map(p => p.id === id
        ? { ...p, status: "dispensed", dispensed_date: new Date().toISOString().split("T")[0], medications: p.medications.map(m => ({ ...m, dispensed: true })) }
        : p));
    } catch {
      // Optimistic for mock
      setPrescriptions(prev => prev.map(p => p.id === id
        ? { ...p, status: "dispensed", dispensed_date: new Date().toISOString().split("T")[0], medications: p.medications.map(m => ({ ...m, dispensed: true })) }
        : p));
    } finally {
      setDispensing(null);
    }
  };

  const viewed = viewId ? prescriptions.find(p => p.id === viewId) : null;

  return (
    <div className="pb-20">
      <PageMeta title="Pharmacy Prescriptions | MediCare HMS" description="Prescription dispensing management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pharmacy Prescriptions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-bold text-amber-600">{prescriptions.filter(p => p.status === "pending").length}</span> pending dispensal
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Issued</th>
                <th className="px-6 py-4">Medications</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {prescriptions.map(rx => (
                <tr key={rx.id} className="hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900 dark:text-white">{rx.patient_name}</td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">{rx.doctor_name}</td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-xs">{rx.issued_date}</td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{rx.medications.length} item{rx.medications.length !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{rx.medications.filter(m => m.dispensed).length} dispensed</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[rx.status]}`}>
                      {rx.status === "partially-dispensed" ? "Partial" : rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewId(rx.id)}
                        className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {rx.status !== "dispensed" && (
                        <button onClick={() => dispense(rx.id)} disabled={dispensing === rx.id}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-60">
                          {dispensing === rx.id ? "…" : "Dispense All"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* View Modal */}
      {viewed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">Prescription Details</h2>
              <button onClick={() => setViewId(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-bold text-gray-900 dark:text-white">{viewed.patient_name}</p>
                <p className="text-xs text-gray-400">{viewed.doctor_name} · {viewed.issued_date}</p>
                <span className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[viewed.status]}`}>
                  {viewed.status === "partially-dispensed" ? "Partially Dispensed" : viewed.status.charAt(0).toUpperCase() + viewed.status.slice(1)}
                </span>
              </div>
              <div className="space-y-3">
                {viewed.medications.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${m.dispensed ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.dosage} · {m.quantity}</p>
                      </div>
                      <span className={`text-xs font-bold ${m.dispensed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {m.dispensed ? "✓ Dispensed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
