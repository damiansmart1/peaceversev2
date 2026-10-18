import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslationContext } from '@/components/TranslationProvider';

// Radix owns dialog focus. This component only manages route content focus.
export default function FocusManager() {
 const {pathname} = useLocation(); const {announce} = useAccessibility(); const {t} = useTranslationContext();
 useEffect(() => {
  let focused = false;
  const update = () => {
   const route = document.querySelector('[data-route-content]');
   if (!route) return;
   const main = route.querySelector('main, [role="main"]') || route.querySelector('.container') || route.firstElementChild;
   if (!(main instanceof HTMLElement)) return;
   if (main.tagName !== 'MAIN') main.setAttribute('role','main');
   main.id='main-content'; main.tabIndex=-1;
   if (!focused && !document.querySelector('[role="dialog"]')) {
    focused=true; main.focus({preventScroll:true});
    announce(`${t('a11y.opened')}: ${main.querySelector('h1')?.textContent || document.title}`);
   }
  };
  const timer=window.setTimeout(update,150);
  const observer=new MutationObserver(update);
  const route=document.querySelector('[data-route-content]'); if(route) observer.observe(route,{childList:true,subtree:true});
  return ()=>{window.clearTimeout(timer);observer.disconnect();};
 },[pathname,announce]);
 return null;
}
