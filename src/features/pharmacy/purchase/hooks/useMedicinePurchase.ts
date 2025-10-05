"use client"
import { useEffect, useState } from "react";
import { MedicinePurchaseFormType, Party, Medicine } from "../types";
import * as api from "../api";
import { toast } from "react-hot-toast";

export function useMedicinePurchase() {
  const [parties, setParties] = useState<Party[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<MedicinePurchaseFormType>({
    party_id: "",
    invoice_no: "",
    payment_status: "Unpaid",
    medicines: [{ medicine_id: "", qty: "", unit_cost: "", batch_no: "", expiry_date: "" }],
  });

  // Fetch parties & medicines on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const partiesData = await api.fetchParties();
        const medicinesData = await api.fetchMedicines();
        setParties(partiesData);
        setMedicines(medicinesData);
        setFilteredMedicines(medicinesData);
      } catch (err: any) {
        toast.error(err.message);
      }
    }
    fetchData();
  }, []);

  // Filter medicines by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMedicines(medicines);
    } else {
      setFilteredMedicines(
        medicines.filter(
          (m) =>
            m.medicine_id.includes(searchTerm) ||
            m.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, medicines]);

  // Update a medicine row
  const handleMedicineChange = (index: number, field: keyof MedicinePurchaseFormType["medicines"][0], value: string) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData({ ...formData, medicines: updated });
  };

  // Add a new medicine row
  const addMedicineRow = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { medicine_id: "", qty: "", unit_cost: "", batch_no: "", expiry_date: "" }],
    });
  };

  // Remove a medicine row
  const removeMedicineRow = (index: number) => {
    const updated = [...formData.medicines];
    updated.splice(index, 1);
    setFormData({ ...formData, medicines: updated });
  };

  // Submit form
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (!formData.party_id || !formData.invoice_no) {
        toast.error("Please select a party and enter invoice number");
        return;
      }
      for (const med of formData.medicines) {
        if (!med.medicine_id || !med.qty || !med.unit_cost) {
          toast.error("Please fill all medicine details");
          return;
        }
      }
      await api.postMedicinePurchase(formData);
      toast.success("Purchase saved successfully");
      // Reset form after submission
      setFormData({
        party_id: "",
        invoice_no: "",
        payment_status: "Unpaid",
        medicines: [{ medicine_id: "", qty: "", unit_cost: "", batch_no: "", expiry_date: "" }],
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return {
    parties,
    medicines: filteredMedicines,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    handleMedicineChange,
    addMedicineRow,
    removeMedicineRow,
    handleSubmit,
  };
}
