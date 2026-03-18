"use client";

import { createContext, useContext, useMemo, useState } from "react";

type DoctorWorkspaceContextValue = {
  isQueueCollapsed: boolean;
  toggleQueueCollapsed: () => void;
  setQueueCollapsed: (next: boolean) => void;
};

const DoctorWorkspaceContext = createContext<DoctorWorkspaceContextValue | undefined>(undefined);

export function DoctorWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQueueCollapsed, setQueueCollapsed] = useState(false);

  const value = useMemo(
    () => ({
      isQueueCollapsed,
      toggleQueueCollapsed: () => setQueueCollapsed((current) => !current),
      setQueueCollapsed,
    }),
    [isQueueCollapsed]
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
