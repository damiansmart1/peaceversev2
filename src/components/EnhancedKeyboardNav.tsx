import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function EnhancedKeyboardNav() {
 const navigate=useNavigate();
 useEffect(()=>{
  const handler=(event:KeyboardEvent)=>{
   if(event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || !event.altKey || document.querySelector('[role="dialog"]')) return;
   if(event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"],[role="combobox"]')) return;
   const paths:Record<string,string>={h:'/',c:'/community',p:'/proposals',i:'/incidents',v:'/verification'};
   if(paths[event.key]) {event.preventDefault();navigate(paths[event.key]);}
   if(event.key==='m') {event.preventDefault();document.getElementById('main-content')?.focus();}
  };
  window.addEventListener('keydown',handler);return ()=>window.removeEventListener('keydown',handler);
 },[navigate]);
 return null;
}
