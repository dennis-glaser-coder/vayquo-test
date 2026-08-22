(()=>{
'use strict';

/*
 Card recommendations are public. A VAYQUO account remains optional for
 persistence/sync, but it must never block the finished card result or the
 provider path. This listener runs after v24-auth.js and neutralizes only the
 legacy card-result gate. Other decision/account gates remain untouched.
*/
function keepGuestCardResultOpen(){
 const auth=window.VAYQUO_AUTH;
 if(auth?.getUser?.())return;
 const gate=document.getElementById('v24-auth');
 if(gate)gate.setAttribute('hidden','');
 document.documentElement.classList.remove('vq-auth-pending');
}

window.addEventListener('vayquo:card-advisor-result',()=>{
 Promise.resolve().then(keepGuestCardResultOpen);
});
})();
