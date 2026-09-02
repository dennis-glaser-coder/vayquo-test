(()=>{
'use strict';
const URL='https://fcvffslhnaqlwitaeers.supabase.co';
const KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const client=window.supabase.createClient(URL,KEY);
const $=s=>document.querySelector(s);
const token=decodeURIComponent((location.hash||'').slice(1)).trim();
const offers=$('#vcOffers'),status=$('#vcStatus');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=c=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format((c||0)/100);
const projectName=v=>({pv:'Photovoltaik',heating:'Heizung',kitchen:'Küche',bath:'Bad'})[v]||v;
const DETAIL_LABELS={pv:['ANLAGE','SPEICHER / TECHNIK'],heating:['SYSTEM / LEISTUNG','HERSTELLER / MODELL'],kitchen:['PLANUNG / UMFANG','GERÄTE / MATERIAL'],bath:['SANIERUNGSUMFANG','SANITÄR / MATERIAL']};
function priceText(o){if(o.provider_price_min_cents!=null&&o.provider_price_max_cents!=null)return `${money(o.provider_price_min_cents)} – ${money(o.provider_price_max_cents)}`;if(o.provider_price_min_cents!=null)return `ab ${money(o.provider_price_min_cents)}`;if(o.provider_price_max_cents!=null)return `bis ${money(o.provider_price_max_cents)}`;return'Noch ohne Preisindikation'}
function validToken(){return /^[A-Za-z0-9_-]{32,100}$/.test(token)}
function detailGrid(o){const d=o.provider_details||{},labels=DETAIL_LABELS[o.project_type]||['LEISTUNG','AUSSTATTUNG'];const rows=[[labels[0],d.primary_spec],[labels[1],d.secondary_spec],['ENTHALTEN',d.included],['VERFÜGBARKEIT',d.availability]].filter(([,v])=>v);if(!rows.length)return'';return `<div class="vc-details">${rows.map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>`}
function completeness(o){const d=o.provider_details||{},values=[o.provider_price_min_cents!=null||o.provider_price_max_cents!=null,d.primary_spec,d.secondary_spec,d.included,d.availability].filter(Boolean).length;return values>=5?'SEHR GUT VERGLEICHBAR':values>=3?'GUT VERGLEICHBAR':'ERSTE RÜCKMELDUNG'}
async function load(){
 if(!validToken()){status.textContent='Dieser Projektlink ist ungültig oder unvollständig.';offers.innerHTML='';return}
 status.textContent='Rückmeldungen werden geladen …';
 const {data,error}=await client.rpc('vayquo_customer_matches',{p_token:token});
 if(error){status.textContent='Die Rückmeldungen konnten gerade nicht geladen werden.';return}
 const rows=data||[];
 if(!rows.length){status.textContent='Noch keine Anbieter-Rückmeldung. Dein Sofort-Check bleibt davon unabhängig.';offers.innerHTML='<div class="vc-empty"><b>Du musst hier nicht warten.</b><span>Deine VAYQUO-Einordnung hast du bereits. Diese Seite ist nur für optionale konkrete Anbieter-Rückmeldungen. Sobald ein Betrieb reagiert, erscheint seine strukturierte Antwort hier.</span></div>';return}
 status.textContent=`${rows.length} strukturierte Rückmeldung${rows.length===1?'':'en'} für dein Projekt.`;
 offers.innerHTML=rows.map(o=>`<article class="vc-offer"><div class="vc-offer-top"><div><small>${esc(projectName(o.project_type))} · ${esc(o.region)}</small><h3>${esc(o.company_name)}</h3></div><span>${esc(completeness(o))}</span></div><div class="vc-price"><small>PREISINDIKATION</small><b>${esc(priceText(o))}</b><span>unverbindlich · auf Basis deiner Projektangaben</span></div>${detailGrid(o)}${o.provider_note?`<div class="vc-note"><small>HINWEIS DES BETRIEBS</small><p>${esc(o.provider_note)}</p></div>`:''}<div class="vc-offer-foot">${o.selected?'<div class="vc-selected">✓ Du hast diesen Betrieb freigegeben. Nur dieser Betrieb kann deinen Kontakt für dieses Projekt öffnen.</div>':`<button data-select="${esc(o.match_id)}" type="button">Diesen Betrieb auswählen →</button><small>Erst mit diesem Klick erlaubst du genau diesem Betrieb, deine Kontaktdaten zu öffnen.</small>`}</div></article>`).join('');
 offers.querySelectorAll('[data-select]').forEach(btn=>btn.addEventListener('click',()=>selectPartner(btn)))
}
async function selectPartner(btn){if(!validToken())return;btn.disabled=true;const old=btn.textContent;btn.textContent='Wird freigegeben …';const {data,error}=await client.rpc('vayquo_customer_select_partner',{p_token:token,p_match_id:btn.dataset.select});if(error||!data){btn.disabled=false;btn.textContent=old;alert('Die Freigabe konnte gerade nicht gespeichert werden. Bitte versuche es erneut.');return}await load()}
$('#vcRefresh').addEventListener('click',load);
load();
})();