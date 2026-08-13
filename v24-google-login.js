(()=>{
'use strict';

const SUPABASE_URL='https://fcvffslhnaqlwitaeers.supabase.co';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const REDIRECT='https://vayquo.de/';
let googleEnabled=false;
let checking=false;

function addStyle(){
 if(document.getElementById('v24-google-style'))return;
 const style=document.createElement('style');
 style.id='v24-google-style';
 style.textContent=`
 .v24g-wrap{margin:0 0 16px}.v24g-button{width:100%;height:50px;border:1px solid #d9d5cd;border-radius:15px;background:#fff;color:#25322f;display:flex;align-items:center;justify-content:center;gap:10px;font:800 14px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;box-shadow:0 1px 2px rgba(0,0,0,.03)}.v24g-button:active{transform:translateY(1px)}.v24g-mark{width:18px;height:18px;display:grid;place-items:center;font:900 17px Arial,sans-serif;color:#4285f4}.v24g-sep{display:flex;align-items:center;gap:10px;margin:14px 0 2px;color:#9a9f9c;font-size:10px}.v24g-sep:before,.v24g-sep:after{content:"";height:1px;flex:1;background:#dedad2}
 `;
 document.head.appendChild(style);
}

async function checkProvider(){
 if(checking)return;
 checking=true;
 try{
  const res=await fetch(`${SUPABASE_URL}/auth/v1/settings`,{cache:'no-store',headers:{apikey:API_KEY}});
  if(!res.ok)return;
  const body=await res.json();
  googleEnabled=body?.external?.google===true;
  if(googleEnabled)mount();
 }catch{}finally{checking=false;}
}

function startGoogle(){
 const url=new URL(`${SUPABASE_URL}/auth/v1/authorize`);
 url.searchParams.set('provider','google');
 url.searchParams.set('redirect_to',REDIRECT);
 location.assign(url.toString());
}

function mount(){
 if(!googleEnabled)return;
 const form=document.getElementById('v24a-form');
 if(!form||document.getElementById('v24g-wrap'))return;
 addStyle();
 const wrap=document.createElement('div');
 wrap.id='v24g-wrap';wrap.className='v24g-wrap';
 wrap.innerHTML='<button class="v24g-button" id="v24g-button" type="button"><span class="v24g-mark" aria-hidden="true">G</span><span>Mit Google anmelden</span></button><div class="v24g-sep"><span>oder</span></div>';
 form.insertBefore(wrap,form.firstChild);
 document.getElementById('v24g-button')?.addEventListener('click',startGoogle);
}

function boot(){
 checkProvider();
 if(googleEnabled)mount();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>{if(googleEnabled)mount();}).observe(document.documentElement,{childList:true,subtree:true});
})();
