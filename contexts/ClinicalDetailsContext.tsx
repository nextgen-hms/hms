// contexts/SidebarContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  activeTabClinicalDetails: string;
  setActiveTabClinicalDetails: (tab: string) => void;
};

const ClinicalDetailsContext = createContext<SidebarContextType | undefined>(undefined);

export const ClinicalDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTabClinicalDetails, setActiveTabClinicalDetails] = useState("Menstrual History");
  return (
    <ClinicalDetailsContext.Provider value={{ activeTabClinicalDetails, setActiveTabClinicalDetails }}>
      {children}
    </ClinicalDetailsContext.Provider>
  );
};

export const useClinicalDetails = () => {
  const ctx = useContext(ClinicalDetailsContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
};
