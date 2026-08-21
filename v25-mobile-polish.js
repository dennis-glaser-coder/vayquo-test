(()=>{
'use strict';
const $=s=>document.querySelector(s);
function boot(){
 const screen=$('#screen-check');
 if(!screen||$('#vq-tools'))return;
 const cards=[...screen.querySelectorAll(':scope > .card')];
 const core=cards.find(c=>c.querySelector('#program'));
 const importer=cards.find(c=>c.classList.contains('importbox'));
 const live=$('#v25-live-cash');
 if(core){
   core.classList.add('vq-core-card');
   screen.prepend(core);
 }
 const tools=document.createElement('div');
 tools.id='vq-tools';tools.className='vq-tools';
 tools.innerHTML=`<button class="vq-tool" type="button" data-vq-tool="import"><small>OPTIONAL</small><b>Angebotstext einfügen</b></button><button class="vq-tool" type="button" data-vq-tool="live"><small>OPTIONAL</small><b>Live-Barpreis suchen</b></button>`;
 if(core)core.insertAdjacentElement('afterend',tools);else screen.prepend(tools);
 if(importer)importer.classList.add('vq-collapsed');
 if(live)live.classList.add('vq-collapsed');
 function toggle(kind){
   const target=kind==='import'?importer:live;if(!target)return;
   const was=target.classList.contains('vq-collapsed');
   [importer,live].filter(Boolean).forEach(x=>x.classList.add('vq-collapsed'));
   if(was){target.classList.remove('vq-collapsed');target.scrollIntoView({behavior:'smooth',block:'nearest'});}
 }
 tools.addEventListener('click',e=>{const b=e.target.closest('[data-vq-tool]');if(b)toggle(b.dataset.vqTool);});
}
function wait(){let tries=0;const t=setInterval(()=>{tries++;if($('#screen-check')&&($('#v25-live-cash')||tries>15)){clearInterval(t);boot();}},80);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
})();