"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useFormBuilderStore, type BuilderMode } from "@/stores/formBuilderStore";

interface FormBuilderContextValue {
  mode: BuilderMode;
  setMode: (mode: BuilderMode) => void;
  // convenient selections
  selectedStepId?: string;
  selectedFieldId?: string;
}

const FormBuilderContext = createContext<FormBuilderContextValue | undefined>(undefined);

export const FormBuilderProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const mode = useFormBuilderStore((s) => s.ui.mode);
  const setMode = useFormBuilderStore((s) => s.setMode);
  const selectedStepId = useFormBuilderStore((s) => s.ui.selectedStepId);
  const selectedFieldId = useFormBuilderStore((s) => s.ui.selectedFieldId);

  const value = useMemo(
    () => ({ mode, setMode, selectedStepId, selectedFieldId }),
    [mode, setMode, selectedStepId, selectedFieldId]
  );

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};

export const useFormBuilderContext = () => {
  const ctx = useContext(FormBuilderContext);
  if (!ctx) throw new Error("useFormBuilderContext must be used within FormBuilderProvider");
  return ctx;
};
