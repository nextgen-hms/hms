// features/labOrders/components/PreviousLabOrders.tsx

"use client";
import { usePreviousLabOrders } from "../hooks/usePreviousLabOrders";

export default function PreviousLabOrders() {
  const { previousData, loading } = usePreviousLabOrders();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Previous Lab Orders</h2>

      <div className="overflow-x-auto w-[73dvw]">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <table className="border border-gray-300 w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Order Date</th>
                <th className="border px-2 py-1">Test Name</th>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Ordered By</th>
                <th className="border px-2 py-1">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {previousData.length > 0 ? (
                previousData.map((d) => (
                  <tr key={d.order_id}>
                    <td className="border px-2 py-1">{d.order_date}</td>
                    <td className="border px-2 py-1">{d.test_name}</td>
                    <td className="border px-2 py-1">{d.category}</td>
                    <td className="border px-2 py-1">{d.price}</td>
                    <td className="border px-2 py-1">{d.status}</td>
                    <td className="border px-2 py-1">{d.ordered_by}</td>
                    <td className="border px-2 py-1">{d.performed_by || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-2">
                    No lab orders available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
