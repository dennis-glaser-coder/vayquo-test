(()=>{
'use strict';

const SESSION_KEY='vayquo:authSession';
const TARGETS=new Set([
 'https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-flight-search',
 'https://fcvffslhnaqlwitaeers.supabase.co/functions/v1/vayquo-award-search'
]);
const nativeFetch=window.fetch.bind(window);

function readSession(){
 try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}
}
function targetUrl(input){
 try{
  const raw=typeof input==='string'?input:input?.url;
  if(!raw)return '';
  const url=new URL(raw,location.href);
  url.search='';url.hash='';
  return url.href;
 }catch{return '';}
}
async function accessToken(){
 let session=readSession();
 const expiresAt=Number(session?.expires_at)||0;
 const needsRefresh=!session?.access_token||(expiresAt&&expiresAt-Date.now()<90000);
 if(needsRefresh&&typeof window.VAYQUO_AUTH?.sync==='function'){
  try{await window.VAYQUO_AUTH.sync();}catch{}
  session=readSession();
 }
 return String(session?.access_token||'');
}

window.fetch=async function(input,init={}){
 if(!TARGETS.has(targetUrl(input)))return nativeFetch(input,init);
 const token=await accessToken();
 const inherited=(typeof Request!=='undefined'&&input instanceof Request)?input.headers:undefined;
 const headers=new Headers(init?.headers||inherited||{});
 if(token)headers.set('Authorization',`Bearer ${token}`);
 return nativeFetch(input,{...init,headers});
};
})();
