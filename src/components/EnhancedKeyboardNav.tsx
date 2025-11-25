import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { toast } from '@/hooks/use-toast';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export default function EnhancedKeyboardNav() {
  const { settings, announce } = useAccessibility();
  const { t } = useTranslationContext();
  const navigate = useNavigate();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      // Navigation shortcuts
      { key: 'h', alt: true, action: () => navigate('/'), description: 'Go to Home' },
      { key: 'c', alt: true, action: () => navigate('/community'), description: 'Go to Community Hub' },
      { key: 'p', alt: true, action: () => navigate('/proposals'), description: 'Go to Polls & Proposals' },
      { key: 'i', alt: true, action: () => navigate('/incidents'), description: 'Go to Incident Reporting' },
      { key: 'v', alt: true, action: () => navigate('/verification'), description: 'Go to Verification' },
      
      // Accessibility shortcuts
      { key: '=', ctrl: true, action: () => {
        const newSize = Math.min(settings.textSize + 10, 200);
        announce(`Text size increased to ${newSize}%`, 'polite');
      }, description: 'Increase text size' },
      { key: '-', ctrl: true, action: () => {
        const newSize = Math.max(settings.textSize - 10, 80);
        announce(`Text size decreased to ${newSize}%`, 'polite');
      }, description: 'Decrease text size' },
      
      // Help
      { key: '?', shift: true, action: () => {
        showShortcuts();
      }, description: 'Show keyboard shortcuts' },
      
      // Skip to main content
      { key: 'm', alt: true, action: () => {
        const main = document.getElementById('main-content');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth', block: 'start' });
          announce('Skipped to main content', 'polite');
        }
      }, description: 'Skip to main content' },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const shortcut = shortcuts.find(s => {
        return s.key === event.key &&
               !!s.ctrl === event.ctrlKey &&
               !!s.alt === event.altKey &&
               !!s.shift === event.shiftKey;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, navigate, announce]);

  const showShortcuts = () => {
    toast({
      title: t('keyboard.shortcuts_title'),
      description: (
        <div className="space-y-2 text-sm">
          <p><kbd>Alt + H</kbd> - Go to Home</p>
          <p><kbd>Alt + C</kbd> - Go to Community Hub</p>
          <p><kbd>Alt + P</kbd> - Go to Polls & Proposals</p>
          <p><kbd>Alt + I</kbd> - Go to Incident Reporting</p>
          <p><kbd>Alt + V</kbd> - Go to Verification</p>
          <p><kbd>Alt + M</kbd> - Skip to main content</p>
          <p><kbd>Ctrl + =</kbd> - Increase text size</p>
          <p><kbd>Ctrl + -</kbd> - Decrease text size</p>
          <p><kbd>Shift + ?</kbd> - Show shortcuts</p>
        </div>
      ),
    });
  };

  return null;
}
