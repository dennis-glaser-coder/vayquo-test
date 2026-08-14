(()=>{
'use strict';

const SUPABASE_URL='https://fcvffslhnaqlwitaeers.supabase.co';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const SESSION_KEY='vayquo:authSession';
const RECOVERY_KEY='vayquo:passwordRecovery';
let mounted=false;
let registerPending=false;

function authRoot(){return document.getElementById('v24-auth');}
function messageEl(){return document.getElementById('v24a-msg');}
function emailEl(){return document.getElementById('v24a-email');}
function isRegister(){return !!authRoot()?.querySelector('[data-v24a-mode="register"].active');}
function appRedirect(){return `${location.origin}${location.pathname}`;}
function showMessage(text,error=false){
 const el=messageEl();if(!el)return;
 el.textContent=text||'';
 el.className=`v24a-msg${text?' show':''}${error?' error':''}`;
}
function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}

function addStyle(){
 if(document.getElementById('v24-auth-polish-style'))return;
 const style=document.createElement('style');
 style.id='v24-auth-polish-style';
 style.textContent=`
  .v24a-social{display:none!important}
  .v24a-forgot-wrap{display:flex;justify-content:flex-end;margin-top:8px}.v24a-forgot{border:0;background:transparent;padding:2px;color:#60716d;font:750 11px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;text-decoration:underline;text-decoration-color:rgba(96,113,109,.35);text-underline-offset:3px}.v24a-forgot[hidden]{display:none!important}.v24a-forgot[disabled]{opacity:.5}
  #v24-reset{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 0,#173b37 0,#0b2020 42%,#071719 100%);box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
  #v24-reset[hidden]{display:none!important}.v24r-card{width:min(100%,430px);background:#f7f3ec;color:#172c2a;border-radius:30px;padding:28px 24px 24px;box-shadow:0 30px 80px rgba(0,0,0,.3);box-sizing:border-box}.v24r-brand{font-size:13px;font-weight:900;letter-spacing:.22em}.v24r-card h1{margin:18px 0 7px;font-size:30px;line-height:1.05;letter-spacing:-.04em}.v24r-sub{margin:0 0 20px;color:#77827f;font-size:14px;line-height:1.45}.v24r-field{display:block;margin-top:12px}.v24r-field span{display:block;margin:0 0 6px 2px;font-size:11px;font-weight:800;color:#566662}.v24r-field input{width:100%;height:52px;border:1px solid #dcd8cf;border-radius:15px;background:#fffdf9;color:#172c2a;padding:0 14px;box-sizing:border-box;font:600 16px inherit;outline:none}.v24r-primary{width:100%;height:52px;margin-top:18px;border:0;border-radius:15px;background:#173f38;color:#fff;font:800 15px inherit}.v24r-primary[disabled]{opacity:.55}.v24r-msg{display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#eee9df;color:#635d52;font-size:12px;line-height:1.4}.v24r-msg.show{display:block}.v24r-msg.error{background:#f4e5e2;color:#925950}.v24r-success{text-align:center}.v24r-success h1{margin-top:16px}.v24r-check{width:54px;height:54px;margin:20px auto 0;border-radius:50%;display:grid;place-items:center;background:#e4eee9;color:#173f38;font-size:28px;font-weight:900}
 `;
 document.head.appendChild(style);
}

async function requestPasswordReset(button){
 const email=String(emailEl()?.value||'').trim().toLowerCase();
 if(!email||!email.includes('@')){showMessage('Bitte zuerst deine E-Mail-Adresse eingeben.',true);emailEl()?.focus();return;}
 button.disabled=true;showMessage('');
 try{
  const url=`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(appRedirect())}`;
  const res=await fetch(url,{method:'POST',cache:'no-store',headers:{apikey:API_KEY,'Content-Type':'application/json'},body:JSON.stringify({email})});
  if(!res.ok){
   let body=null;try{body=await res.json();}catch{}
   const msg=String(body?.msg||body?.message||body?.error_description||body?.error||'');
   if(/rate limit|too many/i.test(msg))throw new Error('RATE_LIMIT');
   throw new Error('RESET_FAILED');
  }
  showMessage('Reset-Link gesendet. Bitte prüfe dein E-Mail-Postfach und auch den Spam-Ordner.');
 }catch(e){
  showMessage(e.message==='RATE_LIMIT'?'Zu viele Anfragen. Bitte kurz warten und erneut versuchen.':'Der Reset-Link konnte gerade nicht gesendet werden. Bitte versuche es erneut.',true);
 }finally{button.disabled=false;}
}

function syncForgotVisibility(){
 const btn=document.getElementById('v24a-forgot');if(!btn)return;
 btn.hidden=isRegister();
}

function watchRegistrationResult(){
 const started=Date.now();
 const tick=()=>{
  if(!registerPending)return;
  const root=authRoot();
  if(!root||root.hidden){registerPending=false;return;}
  const submit=document.getElementById('v24a-submit');
  const msg=messageEl();
  if(msg?.classList.contains('error')){registerPending=false;return;}
  if(!isRegister()&&submit&&!submit.disabled){
   registerPending=false;
   showMessage('Bestätigungs-E-Mail gesendet. Bitte bestätige deine E-Mail-Adresse und prüfe auch den Spam-Ordner.');
   return;
  }
  if(Date.now()-started<12000)setTimeout(tick,120);else registerPending=false;
 };
 setTimeout(tick,120);
}

function mountAuthExtras(){
 const root=authRoot();
 const form=document.getElementById('v24a-form');
 const pass=document.getElementById('v24a-password');
 if(!root||!form||!pass)return;
 const sub=root.querySelector('.v24a-sub');
 if(sub)sub.textContent='VAYQUO zeigt dir, was du sinnvoll nutzen solltest – und was du besser behältst.';
 addStyle();
 if(!document.getElementById('v24a-forgot')){
  const wrap=document.createElement('div');wrap.className='v24a-forgot-wrap';
  wrap.innerHTML='<button class="v24a-forgot" id="v24a-forgot" type="button">Passwort vergessen?</button>';
  const label=pass.closest('.v24a-field')||pass.parentElement;
  label?.insertAdjacentElement('afterend',wrap);
  wrap.querySelector('button')?.addEventListener('click',ev=>void requestPasswordReset(ev.currentTarget));
 }
 if(!form.dataset.v24PolishBound){
  form.dataset.v24PolishBound='1';
  form.addEventListener('submit',()=>{
   if(isRegister()){
    registerPending=true;
    watchRegistrationResult();
   }
  });
  root.querySelectorAll('[data-v24a-mode]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(syncForgotVisibility,0)));
 }
 syncForgotVisibility();
 mounted=true;
}

function recoveryActive(){try{return sessionStorage.getItem(RECOVERY_KEY)==='1';}catch{return false;}}
function clearRecovery(){try{sessionStorage.removeItem(RECOVERY_KEY);}catch{}}
function resetMessage(text,error=false){
 const el=document.getElementById('v24r-msg');if(!el)return;
 el.textContent=text||'';el.className=`v24r-msg${text?' show':''}${error?' error':''}`;
}

function showResetOverlay(){
 if(!recoveryActive()||document.getElementById('v24-reset'))return;
 addStyle();
 const root=document.createElement('div');root.id='v24-reset';
 root.innerHTML=`<section class="v24r-card"><div class="v24r-brand">VAYQUO</div><div id="v24r-form-wrap"><h1>Neues Passwort festlegen.</h1><p class="v24r-sub">Wähle ein neues Passwort für dein VAYQUO-Konto.</p><form id="v24r-form"><label class="v24r-field"><span>Neues Passwort</span><input id="v24r-pass1" type="password" autocomplete="new-password" minlength="8" required></label><label class="v24r-field"><span>Passwort wiederholen</span><input id="v24r-pass2" type="password" autocomplete="new-password" minlength="8" required></label><div class="v24r-msg" id="v24r-msg" role="status"></div><button class="v24r-primary" id="v24r-submit" type="submit">Passwort speichern</button></form></div></section>`;
 document.body.appendChild(root);
 root.querySelector('#v24r-form')?.addEventListener('submit',submitNewPassword);
}

async function submitNewPassword(ev){
 ev.preventDefault();
 const p1=String(document.getElementById('v24r-pass1')?.value||'');
 const p2=String(document.getElementById('v24r-pass2')?.value||'');
 if(p1.length<8){resetMessage('Das Passwort muss mindestens 8 Zeichen lang sein.',true);return;}
 if(p1!==p2){resetMessage('Die beiden Passwörter stimmen nicht überein.',true);return;}
 const session=readSession();
 if(!session?.access_token){resetMessage('Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.',true);return;}
 const btn=document.getElementById('v24r-submit');if(btn)btn.disabled=true;resetMessage('');
 try{
  const res=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',cache:'no-store',headers:{apikey:API_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({password:p1})});
  if(!res.ok){let body=null;try{body=await res.json();}catch{};throw new Error(String(body?.message||body?.msg||body?.error||'RESET_FAILED'));}
  clearRecovery();
  const wrap=document.getElementById('v24r-form-wrap');
  if(wrap)wrap.innerHTML='<div class="v24r-success"><div class="v24r-check">✓</div><h1>Passwort geändert.</h1><p class="v24r-sub">Du bist weiterhin angemeldet und kannst VAYQUO direkt nutzen.</p><button class="v24r-primary" id="v24r-continue" type="button">Weiter zu VAYQUO</button></div>';
  document.getElementById('v24r-continue')?.addEventListener('click',()=>document.getElementById('v24-reset')?.remove());
 }catch(e){
  const msg=String(e.message||'');
  resetMessage(/expired|invalid|jwt/i.test(msg)?'Der Reset-Link ist abgelaufen. Bitte fordere einen neuen an.':'Das Passwort konnte gerade nicht geändert werden. Bitte versuche es erneut.',true);
  if(btn)btn.disabled=false;
 }
}

function boot(){
 addStyle();
 mountAuthExtras();
 showResetOverlay();
 try{
  const callbackError=sessionStorage.getItem('vayquo:authCallbackError');
  if(callbackError){sessionStorage.removeItem('vayquo:authCallbackError');setTimeout(()=>showMessage('Der Link konnte nicht verarbeitet werden. Bitte fordere einen neuen an.',true),80);}
 }catch{}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>{
 if(!mounted||!document.getElementById('v24a-forgot'))mountAuthExtras();
 showResetOverlay();
}).observe(document.documentElement,{childList:true,subtree:true});
})();