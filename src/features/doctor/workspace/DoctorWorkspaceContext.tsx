"use client";

import { createContext, useContext, useMemo, useState } from "react";

type StaleVisitSelection = {
  visitId: string;
  message: string;
};

type DoctorWorkspaceContextValue = {
  isQueueCollapsed: boolean;
  toggleQueueCollapsed: () => void;
  setQueueCollapsed: (next: boolean) => void;
  staleVisitSelection: StaleVisitSelection | null;
  setStaleVisitSelection: (selection: StaleVisitSelection) => void;
  clearStaleVisitSelection: () => void;
  selectedVisitStatus: string | null;
  setSelectedVisitStatus: (status: string | null) => void;
};

const DoctorWorkspaceContext = createContext<DoctorWorkspaceContextValue | undefined>(undefined);

export function DoctorWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQueueCollapsed, setQueueCollapsed] = useState(false);
  const [staleVisitSelection, setStaleVisitSelection] = useState<StaleVisitSelection | null>(null);
  const [selectedVisitStatus, setSelectedVisitStatus] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      isQueueCollapsed,
      toggleQueueCollapsed: () => setQueueCollapsed((current) => !current),
      setQueueCollapsed,
      staleVisitSelection,
      setStaleVisitSelection,
      clearStaleVisitSelection: () => setStaleVisitSelection(null),
      selectedVisitStatus,
      setSelectedVisitStatus,
    }),
    [isQueueCollapsed, selectedVisitStatus, staleVisitSelection]
  );

  return (
    <DoctorWorkspaceContext.Provider value={value}>
      {children}
    </DoctorWorkspaceContext.Provider>
  );
}

export function useDoctorWorkspace() {
  const context = useContext(DoctorWorkspaceContext);

  if (!context) {
    throw new Error("useDoctorWorkspace must be used within DoctorWorkspaceProvider");
  }

  return context;
}

export function useOptionalDoctorWorkspace() {
  return useContext(DoctorWorkspaceContext);
}
