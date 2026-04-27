import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

type StockItem = {
  id: string;
  name: string;
  category: string;
  batch_number: string;
  quantity: number;
  unit: string;
  unit_price: number;
  expiry_date: string;
  supplier: string;
  reorder_level: number;
};

// TODO: Replace with GET /pharmacy/stock
const MOCK_STOCK: StockItem[] = [
  { id: "s1", name: "Paracetamol 500mg", category: "Analgesic", batch_number: "PCM-2026-001", quantity: 5000, unit: "tablets", unit_price: 1.5, expiry_date: "2027-12-31", supplier: "MediPharm Ltd", reorder_level: 500 },
  { id: "s2", name: "Amlodipine 5mg", category: "Antihypertensive", batch_number: "AML-2025-032", quantity: 1200, unit: "tablets", unit_price: 8.5, expiry_date: "2026-08-31", supplier: "CardioSupply Co", reorder_level: 200 },
  { id: "s3", name: "Ibuprofen 400mg", category: "NSAID", batch_number: "IBU-2026-007", quantity: 80, unit: "tablets", unit_price: 2.0, expiry_date: "2026-06-15", supplier: "MediPharm Ltd", reorder_level: 300 },
  { id: "s4", name: "ORS Sachet", category: "Electrolyte", batch_number: "ORS-2026-011", quantity: 2400, unit: "sachets", unit_price: 3.0, expiry_date: "2027-06-30", supplier: "HydraHealth", reorder_level: 200 },
  { id: "s5", name: "Amoxicillin 250mg", category: "Antibiotic", batch_number: "AMX-2025-044", quantity: 150, unit: "capsules", unit_price: 12.0, expiry_date: "2026-03-31", supplier: "PharmaCare", reorder_level: 200 },
  { id: "s6", name: "Normal Saline 0.9% 500mL", category: "IV Fluid", batch_number: "NS-2026-019", quantity: 320, unit: "bags", unit_price: 45.0, expiry_date: "2027-01-31", supplier: "IVFluid Pro", reorder_level: 50 },
];

const CATEGORIES = [...new Set(MOCK_STOCK.map(s => s.category))];

type FormData = Omit<StockItem, "id">;

const EMPTY_FORM: FormData = { name: "", category: "", batch_number: "", quantity: 0, unit: "tablets", unit_price: 0, expiry_date: "", supplier: "", reorder_level: 100 };

export default function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>(MOCK_STOCK);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (item: StockItem) => {
    setEditId(item.id);
    setForm({ name: item.name, category: item.category, batch_number: item.batch_number, quantity: item.quantity, unit: item.unit, unit_price: item.unit_price, expiry_date: item.expiry_date, supplier: item.supplier, reorder_level: item.reorder_level });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        // TODO: PUT /pharmacy/stock/:id
        await apiClient.put(`/pharmacy/stock/${editId}`, form);
        setStock(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      } else {
        // TODO: POST /pharmacy/stock
        const res = await apiClient.post("/pharmacy/stock", form);
        const newItem: StockItem = res.data?.data ?? { id: Date.now().toString(), ...form };
        setStock(prev => [newItem, ...prev]);
      }
      setShowForm(false);
    } catch {
      // Optimistic update for mock
      if (editId) {
        setStock(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      } else {
        setStock(prev => [{ id: Date.now().toString(), ...form }, ...prev]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: DELETE /pharmacy/stock/:id
      await apiClient.delete(`/pharmacy/stock/${id}`);
    } catch {}
    setStock(prev => prev.filter(s => s.id !== id));
    setDeleteId(null);
  };

  const filtered = stock.filter(s => {
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterSearch && !s.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const isLow = (item: StockItem) => item.quantity <= item.reorder_level;
  const isExpiringSoon = (item: StockItem) => {
    const days = (new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 90;
  };
  const isExpired = (item: StockItem) => new Date(item.expiry_date).getTime() < Date.now();

  return (
    <div className="pb-20">
      <PageMeta title="Stock Management | MediCare HMS" description="Pharmacy stock and inventory management" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stock.length} items · <span className="text-red-500 font-semibold">{stock.filter(isLow).length} low stock</span></p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <PlusIcon className="w-5 h-5" /> Add Stock Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <input type="text" placeholder="Search by name…" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:text-white flex-1 min-w-[180px]" />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:text-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/60 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Drug / Item</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(item => (
                <tr key={item.id} className={`transition-colors ${isLow(item) || isExpired(item) ? "bg-red-50/30 dark:bg-red-500/5" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"}`}>
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-500 dark:text-gray-400 font-mono">{item.batch_number}</td>
                  <td className="px-6 py-5">
                    <span className={`font-bold text-sm ${isLow(item) ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {item.quantity.toLocaleString()} {item.unit}
                    </span>
                    {isLow(item) && <p className="text-[10px] text-red-500 font-bold">⚠ Below reorder</p>}
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400 text-sm font-mono">LKR {item.unit_price.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <span className={`text-xs font-bold ${isExpired(item) ? "text-red-600 dark:text-red-400" : isExpiringSoon(item) ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"}`}>
                      {item.expiry_date}
                      {isExpired(item) && " (Expired)"}
                      {!isExpired(item) && isExpiringSoon(item) && " (Soon)"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs text-gray-500 dark:text-gray-400">{item.supplier}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(item)}
                        className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)}
                        className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 dark:bg-gray-900 dark:hover:bg-red-500/10 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-semibold">No stock items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white">{editId ? "Edit Stock Item" : "Add Stock Item"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { field: "name" as const, label: "Drug / Item Name", placeholder: "e.g. Paracetamol 500mg" },
                { field: "category" as const, label: "Category", placeholder: "e.g. Analgesic" },
                { field: "batch_number" as const, label: "Batch Number", placeholder: "e.g. PCM-2026-001" },
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
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white">
                    <option>tablets</option><option>capsules</option><option>sachets</option><option>vials</option><option>bags</option><option>bottles</option><option>units</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Unit Price (LKR)</label>
                  <input type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value) || 0})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Reorder Level</label>
                  <input type="number" value={form.reorder_level} onChange={e => setForm({...form, reorder_level: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold disabled:opacity-50">
                  {saving ? "Saving…" : editId ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Remove Stock Item?</h3>
            <p className="text-sm text-gray-500 text-center mb-7">This action cannot be undone.</p>
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
