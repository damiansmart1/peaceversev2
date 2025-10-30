import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AccessibilitySettings {
  // Visual
  textSize: number; // 100-200%
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
  
  // Audio & Voice
  voiceNavigation: boolean;
  audioDescriptions: boolean;
  screenReader: boolean;
  textToSpeech: boolean;
  
  // Interaction
  keyboardOnly: boolean;
  focusHighlight: boolean;
  simplifiedMode: boolean;
  
  // Language & Content
  readingMode: boolean;
  showCaptions: boolean;
  signLanguage: boolean;
  
  // Connectivity
  lowBandwidth: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 100,
  highContrast: false,
  reducedMotion: false,
  dyslexicFont: false,
  voiceNavigation: false,
  audioDescriptions: false,
  screenReader: false,
  textToSpeech: false,
  keyboardOnly: false,
  focusHighlight: true,
  simplifiedMode: false,
  readingMode: false,
  showCaptions: false,
  signLanguage: false,
  lowBandwidth: false,
  offlineMode: false,
  dataSaver: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('accessibility_settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      ...defaultSettings,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersContrast,
    };
  });

  const [announcer, setAnnouncer] = useState<{ message: string; priority: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Text size
    root.style.fontSize = `${settings.textSize}%`;
    
    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Dyslexic font
    root.classList.toggle('dyslexic-font', settings.dyslexicFont);
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Focus highlight
    root.classList.toggle('enhanced-focus', settings.focusHighlight);
    
    // Simplified mode
    root.classList.toggle('simplified-mode', settings.simplifiedMode);
    
    // Reading mode
    root.classList.toggle('reading-mode', settings.readingMode);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility_settings');
  };

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncer({ message, priority });
    setTimeout(() => setAnnouncer(null), 100);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, announce }}>
      {children}
      {announcer && (
        <div
          role="status"
          aria-live={announcer.priority as 'polite' | 'assertive'}
          aria-atomic="true"
          className="sr-only"
        >
          {announcer.message}
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
