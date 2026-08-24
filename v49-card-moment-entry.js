(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

function cardId(root){
 const provider=q('.v28ca-provider[href]',root);
 const href=String(provider?.getAttribute('href')||'').toLowerCase();
 const name=text(q('.v28ca-card h3',root)).toLowerCase();
 if(href.includes('/platinum-card/')||name.includes('american express platinum'))return 'amex_platinum';
 if(href.includes('/goldcard/')||name.includes('american express gold card'))return 'amex_gold';
 return '';
}

function ensureStyle(){
 if(q('#v49-moment-style'))return;
 const style=document.createElement('style');style.id='v49-moment-style';style.textContent=`
 .v49-moment-link{min-height:43px;margin-top:9px;border:1px solid #d9d4ca;border-radius:14px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f2eee6;color:#31443f;text-decoration:none;font:850 10.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;box-sizing:border-box}
 .v49-moment-link small{display:block;color:#8b7047;font-size:7.5px;letter-spacing:.1em;font-weight:900}.v49-moment-link b{display:block;margin-top:2px;font-size:10.5px}.v49-moment-link span:last-child{font-size:17px;color:#7c8783}
 `;document.head.appendChild(style);
}

function decorate(){
 const root=q('#v28-card-advisor');
 if(!root||root.hidden)return;
 const actions=q('.v28ca-actions',root),result=q('.v28ca-card',root);
 if(!actions||!result)return;
 const id=cardId(root);
 const existing=q('.v49-moment-link',root);
 if(!id){existing?.remove();return;}
 if(existing?.dataset?.v49MomentCard===id)return;
 existing?.remove();ensureStyle();
 const link=document.createElement('a');
 link.className='v49-moment-link';
 link.dataset.v49MomentCard=id;
 link.href=`/moment.html?card=${encodeURIComponent(id)}`;
 link.innerHTML='<span><small>VAYQUO MOMENT</small><b>Ist jetzt ein guter Zeitpunkt?</b></span><span>›</span>';
 actions.insertAdjacentElement('afterend',link);
}

function schedule(){[0,120,360,800].forEach(ms=>setTimeout(decorate,ms));}
window.addEventListener('vayquo:card-advisor-open',schedule);
window.addEventListener('pageshow',schedule);
document.addEventListener('click',ev=>{if(ev.target.closest?.('.v28ca-next,.v28ca-back,[data-v28ca-choice],.v28ca-restart'))schedule();});
})();
