import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsProps {
  onSearchOpen: () => void;
}

export default function KeyboardShortcuts({ onSearchOpen }: KeyboardShortcutsProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen();
      }

      // Cmd/Ctrl + / for help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        navigate('/safety');
      }

      // Alt + 1-9 for quick navigation
      if (e.altKey && !isNaN(Number(e.key))) {
        e.preventDefault();
        const routes = ['/', '/voice', '/community', '/radio', '/challenges', '/proposals', '/profile'];
        const index = Number(e.key) - 1;
        if (routes[index]) {
          navigate(routes[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, onSearchOpen]);

  return null;
}
