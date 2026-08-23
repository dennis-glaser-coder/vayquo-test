(()=>{
'use strict';

/*
  The Ratgeber entry is owned by v24-ratgeber-entry.js.
  Keep it as a standalone, visible Start-page card. The former v38 integration
  hid that card and duplicated it inside the card-advisor block.
*/
function restoreStandaloneRatgeber(){
  document.getElementById('v38-ratgeber-card-advisor-style')?.remove();
  document.querySelectorAll('.v38-ratgeber-inline').forEach(el=>el.remove());
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',restoreStandaloneRatgeber,{once:true});
}else{
  restoreStandaloneRatgeber();
}

window.addEventListener('pageshow',restoreStandaloneRatgeber);
})();
