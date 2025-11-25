import React, { createContext, useContext, useState, ReactNode } from 'react';

interface JurisdictionContextType {
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
}

const JurisdictionContext = createContext<JurisdictionContextType | undefined>(undefined);

export const JurisdictionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <JurisdictionContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </JurisdictionContext.Provider>
  );
};

export const useJurisdiction = () => {
  const context = useContext(JurisdictionContext);
  if (context === undefined) {
    throw new Error('useJurisdiction must be used within a JurisdictionProvider');
  }
  return context;
};
