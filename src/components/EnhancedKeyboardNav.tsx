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
      { key: 'v', alt: true, action: () => navigate('/voice'), description: 'Go to Voice' },
      { key: 'c', alt: true, action: () => navigate('/community'), description: 'Go to Community' },
      { key: 'p', alt: true, action: () => navigate('/proposals'), description: 'Go to Proposals' },
      { key: 'r', alt: true, action: () => navigate('/radio'), description: 'Go to Radio' },
      
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
          <p><kbd>Alt + H</kbd> - {t('keyboard.home')}</p>
          <p><kbd>Alt + V</kbd> - {t('keyboard.voice')}</p>
          <p><kbd>Alt + C</kbd> - {t('keyboard.community')}</p>
          <p><kbd>Alt + P</kbd> - {t('keyboard.proposals')}</p>
          <p><kbd>Alt + M</kbd> - {t('keyboard.skip_to_main')}</p>
          <p><kbd>Ctrl + =</kbd> - {t('keyboard.increase_text')}</p>
          <p><kbd>Ctrl + -</kbd> - {t('keyboard.decrease_text')}</p>
          <p><kbd>Shift + ?</kbd> - {t('keyboard.show_shortcuts')}</p>
        </div>
      ),
    });
  };

  return null;
}
