(()=>{
'use strict';

const LABELS={
  mr:'Membership Rewards',
  pb:'PAYBACK',
  mm:'Miles & More'
};

function validateAll(ev){
  const save=ev.target.closest?.('#v24pb-save-all');
  if(!save)return;

  const inputs=Array.from(document.querySelectorAll('[data-v24pb-all-input]'));
  for(const input of inputs){
    const raw=String(input.value??'').trim();
    if(raw==='')continue;
    const value=Number(raw);
    if(Number.isFinite(value)&&value>=0)continue;

    ev.preventDefault();
    ev.stopImmediatePropagation();
    const id=input.dataset.v24pbAllInput;
    const label=LABELS[id]||'Punktestand';
    input.focus();
    if(typeof toast==='function')toast(`${label}: Bitte einen gültigen Stand ab 0 eingeben`);
    return;
  }
}

document.addEventListener('click',validateAll,true);
})();
