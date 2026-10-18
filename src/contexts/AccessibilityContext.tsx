import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import { clampTextSize } from '@/lib/accessibilitySpeech';

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
  speechToText: boolean;
  
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
  speechToText: false,
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
    let stored: string | null = null;
    try { stored = localStorage.getItem('accessibility_settings'); } catch { /* Storage can be blocked. */ }
    if (stored) {
      try {
        const saved = JSON.parse(stored);
        return { ...defaultSettings, ...saved, textSize: clampTextSize(Number(saved.textSize ?? 100)) };
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
    try { localStorage.setItem('accessibility_settings', JSON.stringify(settings)); } catch { /* Preferences still work for this session. */ }
    
    // Apply settings to document
    const root = document.documentElement;
    
    // Text size
    root.style.fontSize = `${clampTextSize(settings.textSize)}%`;
    root.classList.toggle('large-text', settings.textSize > 120);
    
    root.classList.toggle('reduced-motion', settings.reducedMotion);
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

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: key === 'textSize' ? clampTextSize(Number(value)) : value }));
  }, []);

  const resetSettings = () => {
    setSettings(defaultSettings);
    try { localStorage.removeItem('accessibility_settings'); } catch { /* Storage can be blocked. */ }
  };

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncer({ message, priority });
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, announce }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcer?.priority === 'polite' ? announcer.message : ''}</div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{announcer?.priority === 'assertive' ? announcer.message : ''}</div>
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
