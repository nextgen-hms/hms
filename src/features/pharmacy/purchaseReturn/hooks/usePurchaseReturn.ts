"use client";

import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

export interface PurchaseItem {
    id: number;
    medicine_id: number;
    brand_name: string;
    generic_name: string;
    dosage: string;
    form: string;
    quantity: number;
    sub_quantity: number;
    unit_cost: number;
    batch_id: number;
    batch_number: string;
    expiry_date: string;
    return_quantity?: number;
    return_sub_quantity?: number;
}

export interface PurchaseInvoice {
    purchase_id: number;
    invoice_no: string;
    invoice_timestamp: string;
    party_name: string;
    total_amount: number;
    items: PurchaseItem[];
}

export const usePurchaseReturn = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const searchPurchases = useCallback(async (query: string) => {
        if (!query.trim()) {
            setInvoices([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/pharmacy/purchase/search?query=${query}`);
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            toast.error("Failed to search purchases");
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                searchPurchases(searchQuery);
                setShowResults(true);
            } else {
                setInvoices([]);
                setShowResults(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchPurchases]);

    const handleSelectInvoice = (invoice: PurchaseInvoice) => {
        setSelectedInvoice({
            ...invoice,
            items: invoice.items.map(item => ({
                ...item,
                return_quantity: 0,
                return_sub_quantity: 0
            }))
        });
        setInvoices([]);
        setSearchQuery("");
        setShowResults(false);
        setFocusedIndex(-1);
    };

    const updateReturnQty = (itemId: number, qty: number, isSub: boolean = false) => {
        if (!selectedInvoice) return;

        setSelectedInvoice({
            ...selectedInvoice,
            items: selectedInvoice.items.map(item => {
                if (item.id === itemId) {
                    if (isSub) {
                        return { ...item, return_sub_quantity: Math.min(qty, item.sub_quantity) };
                    }
                    return { ...item, return_quantity: Math.min(qty, item.quantity) };
                }
                return item;
            })
        });
    };

    const submitReturn = async () => {
        if (!selectedInvoice || !reason.trim()) {
            toast.error("Please provide a reason and select items");
            return;
        }

        const itemsToReturn = selectedInvoice.items.filter(
            item => (item.return_quantity || 0) > 0 || (item.return_sub_quantity || 0) > 0
        );

        if (itemsToReturn.length === 0) {
            toast.error("Set return quantities for at least one item");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/pharmacy/purchase/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    purchase_id: selectedInvoice.purchase_id,
                    reason,
                    created_by: 1, // Assume admin for now
                    items: itemsToReturn.map(item => ({
                        medicine_id: item.medicine_id,
                        batch_id: item.batch_id,
                        quantity: item.return_quantity || 0,
                        sub_quantity: item.return_sub_quantity || 0,
                        unit_cost: item.unit_cost
                    }))
                })
            });

            if (res.ok) {
                toast.success("Purchase return processed");
                setSelectedInvoice(null);
                setReason("");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to process return");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        invoices,
        selectedInvoice,
        isSearching,
        isSubmitting,
        reason,
        setReason,
        showResults,
        setShowResults,
        focusedIndex,
        setFocusedIndex,
        searchPurchases,
        handleSelectInvoice,
        updateReturnQty,
        submitReturn,
        setSelectedInvoice
    };
};
