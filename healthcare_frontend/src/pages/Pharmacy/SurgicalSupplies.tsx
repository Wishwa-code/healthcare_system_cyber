import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

type Supply = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  supplier: string;
  last_restocked: string;
  status: "in-stock" | "low" | "out-of-stock";
};

// TODO: Replace with GET /pharmacy/supplies
const MOCK_SUPPLIES: Supply[] = [
  { id: "sup1", name: "Surgical Gloves (Size M)", category: "PPE", quantity: 500, unit: "pairs", unit_price: 15, supplier: "SafeGlove Ltd", last_restocked: "2026-04-20", status: "in-stock" },
  { id: "sup2", name: "Sterile Gauze 10x10cm", category: "Wound Care", quantity: 80, unit: "packs", unit_price: 25, supplier: "MedDress Co", last_restocked: "2026-04-15", status: "low" },
  { id: "sup3", name: "Surgical Sutures 3-0", category: "Sutures", quantity: 0, unit: "boxes", unit_price: 350, supplier: "SurgiSupply", last_restocked: "2026-03-10", status: "out-of-stock" },
  { id: "sup4", name: "Disposable Syringes 5mL", category: "Injection", quantity: 1200, unit: "units", unit_price: 8, supplier: "MediPharm Ltd", last_restocked: "2026-04-22", status: "in-stock" },
  { id: "sup5", name: "Surgical Mask N95", category: "PPE", quantity: 150, unit: "pieces", unit_price: 120, supplier: "SafeBreath", last_restocked: "2026-04-18", status: "low" },
  { id: "sup6", name: "Scalpel Blades #22", category: "Instruments", quantity: 60, unit: "blades", unit_price: 45, supplier: "SurgiSupply", last_restocked: "2026-04-10", status: "in-stock" },
];

const STATUS_STYLES: Record<string, string> = {
  "in-stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  low: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "out-of-stock": "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

type FormData = Omit<Supply, "id">;
const EMPTY_FORM: FormData = { name: "", category: "", quantity: 0, unit: "units", unit_price: 0, supplier: "", last_restocked: "", status: "in-stock" };

export default function SurgicalSupplies() {
  const [supplies, setSupplies] = useState<Supply[]>(MOCK_SUPPLIES);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s: Supply) => { setEditId(s.id); setForm({ name: s.name, category: s.category, quantity: s.quantity, unit: s.unit, unit_price: s.unit_price, supplier: s.supplier, last_restocked: s.last_restocked, status: s.status }); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        // TODO: PUT /pharmacy/supplies/:id
        await apiClient.put(`/pharmacy/supplies/${editId}`, form);
        setSupplies(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      } else {
        // TODO: POST /pharmacy/supplies
        const res = await apiClient.post("/pharmacy/supplies", form);
        const newItem: Supply = res.data?.data ?? { id: Date.now().toString(), ...form };
        setSupplies(prev => [newItem, ...prev]);
      }
    } catch {
      if (editId) setSupplies(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      else setSupplies(prev => [{ id: Date.now().toString(), ...form }, ...prev]);
    } finally { setSaving(false); setShowForm(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiClient.delete(`/pharmacy/supplies/${id}`); } catch {}
    setSupplies(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
  };

  const filtered = filterStatus ? supplies.filter(s => s.status === filterStatus) : supplies;

  return (
    <div className="pb-20">
      <PageMeta title="Surgical Supplies | MediCare HMS" description="Surgical and consumable supplies inventory" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Surgical Supplies</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-red-500 font-semibold">{supplies.filter(s => s.status === "out-of-stock").length} out of stock</span>
            {" · "}
            <span className="text-amber-500 font-semibold">{supplies.filter(s => s.status === "low").length} low</span>
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Add Supply
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:text-white">
          <option value="">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 transition-all ${item.status === "out-of-stock" ? "border-red-200 dark:border-red-500/30" : item.status === "low" ? "border-amber-200 dark:border-amber-500/30" : "border-gray-200 dark:border-gray-700"}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${STATUS_STYLES[item.status]}`}>
                {item.status === "out-of-stock" ? "Out" : item.status === "in-stock" ? "In Stock" : "Low"}
              </span>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Quantity</span>
                <span className={`font-bold ${item.status === "out-of-stock" ? "text-red-600 dark:text-red-400" : item.status === "low" ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-gray-300"}`}>{item.quantity} {item.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Unit Price</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono">LKR {item.unit_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Supplier</span>
                <span className="text-gray-600 dark:text-gray-400">{item.supplier}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Last Restocked</span>
                <span className="text-gray-600 dark:text-gray-400">{item.last_restocked || "—"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <PencilIcon className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setDeleteId(item.id)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                <TrashBinIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm py-20 text-center">
            <p className="text-gray-400 font-semibold">No supplies found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">{editId ? "Edit Supply" : "Add Supply"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { field: "name" as const, label: "Item Name", placeholder: "e.g. Surgical Gloves (Size M)" },
                { field: "category" as const, label: "Category", placeholder: "e.g. PPE" },
                { field: "supplier" as const, label: "Supplier", placeholder: "Supplier name" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{label}</label>
                  <input type="text" value={form[field] as string} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Unit</label>
                  <input type="text" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="e.g. pairs, units, packs"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Unit Price (LKR)</label>
                  <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value) || 0})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Supply["status"]})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                    <option value="in-stock">In Stock</option><option value="low">Low</option><option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Last Restocked</label>
                <input type="date" value={form.last_restocked} onChange={e => setForm({...form, last_restocked: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Saving…" : editId ? "Save Changes" : "Add Supply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Remove Supply?</h3>
            <p className="text-sm text-gray-500 mb-7">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400">Keep</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
