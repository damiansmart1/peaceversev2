import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '@/contexts/AccessibilityContext';

/**
 * FocusManager handles focus management for accessibility
 * - Moves focus to main content on route change
 * - Manages focus trap for modals
 * - Restores focus after dialogs close
 */
export default function FocusManager() {
  const location = useLocation();
  const { announce } = useAccessibility();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // On route change, focus main content and announce
    const main = document.getElementById('main-content');
    if (main) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        main.focus();
        
        // Announce page change
        const title = document.title.split('|')[0].trim();
        announce(`Navigated to ${title}`, 'assertive');
      }, 100);
    }
  }, [location.pathname, announce]);

  useEffect(() => {
    // Store focus before opening dialogs
    const handleDialogOpen = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.getAttribute('role') === 'dialog') {
        previousFocusRef.current = document.activeElement as HTMLElement;
      }
    };

    // Restore focus after closing dialogs
    const handleDialogClose = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.getAttribute('role') === 'dialog' && previousFocusRef.current) {
        setTimeout(() => {
          previousFocusRef.current?.focus();
          previousFocusRef.current = null;
        }, 100);
      }
    };

    document.addEventListener('focusin', handleDialogOpen);
    document.addEventListener('focusout', handleDialogClose);

    return () => {
      document.removeEventListener('focusin', handleDialogOpen);
      document.removeEventListener('focusout', handleDialogClose);
    };
  }, []);

  return null;
}
