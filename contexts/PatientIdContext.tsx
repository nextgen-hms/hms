"use client"
import { createContext, useContext, useMemo, useState } from "react";

type PatientContextType = {
    patientId: string | null;
    setPatientId: (id: string | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientContextProvider({ children }: { children: React.ReactNode }) {
    const [patientId, setPatientId] = useState<string | null>("");



    const value = useMemo(() => ({ patientId, setPatientId }), [patientId]);

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    )
}

export function usePatient(): PatientContextType {
    const ctx = useContext(PatientContext);
    if (!ctx) {
        throw new Error("usePatient must be used within a patientProvider");
    }
    return ctx;
}