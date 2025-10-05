// features/pharmacy/medicinePurchase/components/MedicinePurchaseForm.tsx

"use client";
import { useMedicinePurchase } from "../hooks/useMedicinePurchase";

export default function MedicinePurchaseForm() {
  const {
    parties,
    medicines,
    searchTerm,
    setSearchTerm,
    formData,
    handleMedicineChange,
    addMedicineRow,
    removeMedicineRow,
    handleSubmit,
  } = useMedicinePurchase();

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">💊 New Medicine Purchase</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Party selection */}
        <div>
          <label htmlFor="party" className="block font-medium mb-1">
            Supplier / Party <span className="text-red-500">*</span>
          </label>
          <select
            id="party"
            value={formData.party_id}
            onChange={(e) => (formData.party_id = e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Party --</option>
            {parties.map((party) => (
              <option key={party.party_id} value={party.party_id}>
                {party.name}
              </option>
            ))}
          </select>
        </div>

        {/* Invoice info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="invoice_no" className="block font-medium mb-1">
              Invoice No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="invoice_no"
              value={formData.invoice_no}
              onChange={(e) => (formData.invoice_no = e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="payment_status" className="block font-medium mb-1">
              Payment Status
            </label>
            <select
              id="payment_status"
              value={formData.payment_status}
              onChange={(e) => (formData.payment_status = e.target.value as any)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Medicine search */}
        <div>
          <label htmlFor="search" className="block font-medium mb-1">
            Search Medicine
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, ID, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Medicine rows */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Medicines</h3>
          {formData.medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end mb-2 border border-gray-200 p-3 rounded">
              <select
                value={med.medicine_id}
                onChange={(e) => handleMedicineChange(index, "medicine_id", e.target.value)}
                className="col-span-2 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Medicine --</option>
                {medicines.map((m) => (
                  <option key={m.medicine_id} value={m.medicine_id}>
                    {m.brand_name} ({m.generic_name}) - {m.category}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                min={1}
                value={med.qty}
                onChange={(e) => handleMedicineChange(index, "qty", e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Unit Cost"
                step="0.01"
                min={0}
                value={med.unit_cost}
                onChange={(e) => handleMedicineChange(index, "unit_cost", e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Batch No"
                value={med.batch_no}
                onChange={(e) => handleMedicineChange(index, "batch_no", e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                value={med.expiry_date}
                onChange={(e) => handleMedicineChange(index, "expiry_date", e.target.value)}
                className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {formData.medicines.length > 1 && (
                <button type="button" onClick={() => removeMedicineRow(index)} className="text-red-500 text-sm font-semibold hover:text-red-700 transition">
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMedicineRow}
            className="mt-2 px-3 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            + Add Another Medicine
          </button>
        </div>

        <div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition">
            Save Purchase
          </button>
        </div>
      </form>
    </div>
  );
}
