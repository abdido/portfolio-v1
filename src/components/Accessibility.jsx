import { useEffect } from 'react';
import { usePortfolio } from '../context/usePortfolio';
// Common keyboard/focus behavior for the existing CMS dialog and form components.
export default function Accessibility(){
  const {language}=usePortfolio();
  useEffect(()=>{
    let nextId=0;let activeDialog=null;let previousFocus=null;
    const enhance=()=>{
      document.querySelectorAll('.form-group').forEach(group=>{
        const label=group.querySelector('label');const input=group.querySelector('input,textarea,select');
        if(label&&input&&!label.htmlFor){input.id ||= `field-${++nextId}`;label.htmlFor=input.id;}
      });
      document.querySelectorAll('.modal-close').forEach(button=>button.setAttribute('aria-label',language==='EN'?'Close dialog':'Tutup dialog'));
      const overlays=[...document.querySelectorAll('.modal-overlay')];
      const dialog=overlays.at(-1)?.querySelector('.modal-content')||null;
      if(dialog!==activeDialog){
        if(activeDialog){previousFocus?.focus();document.body.style.overflow='';}
        activeDialog=dialog;
        if(dialog){
          previousFocus=document.activeElement;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.tabIndex=-1;
          const heading=dialog.querySelector('h2,h3,h4');
          if(heading){heading.id ||= `dialog-heading-${++nextId}`;dialog.setAttribute('aria-labelledby',heading.id);}
          else dialog.setAttribute('aria-label',language==='EN'?'Dialog':'Dialog');
          document.body.style.overflow='hidden';
          (dialog.querySelector('input:not([type=hidden]),button,textarea,select')||dialog).focus();
        }
      }
    };
    const keydown=e=>{
      if(!activeDialog)return;
      if(e.key==='Escape'){e.preventDefault();activeDialog.querySelector('.modal-close')?.click();}
      if(e.key==='Tab'){
        const items=[...activeDialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
        const first=items[0],last=items.at(-1);
        if(!first){e.preventDefault();activeDialog.focus();}
        else if(e.shiftKey&&(document.activeElement===first||!activeDialog.contains(document.activeElement))){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||!activeDialog.contains(document.activeElement))){e.preventDefault();first.focus();}
      }
    };
    const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true});enhance();document.addEventListener('keydown',keydown);
    return()=>{observer.disconnect();document.removeEventListener('keydown',keydown);document.body.style.overflow='';};
  },[language]);
  return null;
}
