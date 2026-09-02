(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_project_requests';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const CONSENT_VERSION='2026-09-02-v1';

const PROJECTS={
 pv:{label:'Photovoltaik',questions:[
  {id:'property',title:'Auf was soll die Anlage?',hint:'Damit können wir die Größenordnung besser einordnen.',options:[['detached','Freistehendes Haus'],['semi_row','Doppel- oder Reihenhaus'],['multi','Mehrfamilienhaus'],['commercial','Gewerbegebäude']]},
  {id:'ownership',title:'Gehört dir die Immobilie?',hint:'Für Planung und Umsetzung ist das entscheidend.',options:[['owner','Ja, ich bin Eigentümer:in'],['co_owner','Miteigentum / WEG'],['tenant','Nein'],['other','Anders']]},
  {id:'roof',title:'Welche Dachform hast du?',hint:'Wenn du unsicher bist, ist das völlig okay.',options:[['pitched','Satteldach'],['flat','Flachdach'],['hipped','Walmdach'],['unknown','Weiß ich nicht']]},
  {id:'storage',title:'Soll ein Stromspeicher dazu?',hint:'Das beeinflusst Investition und Eigenverbrauch deutlich.',options:[['yes','Ja'],['no','Nein'],['unsure','Noch offen']]},
  {id:'model',title:'Kaufen oder mieten?',hint:'VAYQUO berücksichtigt deinen bevorzugten Weg.',options:[['buy','Kaufen'],['rent','Mieten / Pachten'],['unsure','Noch offen']]},
  {id:'timeframe',title:'Wann soll die Anlage kommen?',hint:'So können wir nur passende Kapazitäten berücksichtigen.',options:[['now','So schnell wie möglich'],['1_3m','In 1–3 Monaten'],['3_6m','In 3–6 Monaten'],['later','Später']]}
 ]},
 heating:{label:'Heizung',questions:[
  {id:'future_heating',title:'Was möchtest du künftig?',hint:'Falls du noch unsicher bist, reicht auch das.',options:[['heatpump','Wärmepumpe'],['pellet','Pellet / Holz'],['other','Andere Heizung'],['unsure','Beratung gewünscht']]},
  {id:'current_heating',title:'Womit heizt du aktuell?',hint:'Das bestimmt den Aufwand beim Umstieg.',options:[['gas','Gas'],['oil','Öl'],['electric','Strom'],['wood','Holz / Pellet'],['new','Neubau / Erstinstallation'],['other','Andere']]},
  {id:'property',title:'Um welche Immobilie geht es?',hint:'Eine grobe Einordnung reicht.',options:[['detached','Einfamilienhaus'],['semi_row','Doppel- / Reihenhaus'],['multi','Mehrfamilienhaus'],['commercial','Gewerbe']]},
  {id:'area',title:'Wie viel Fläche wird beheizt?',hint:'Bitte die ungefähr beheizte Wohnfläche wählen.',options:[['under120','Unter 120 m²'],['120_180','120–180 m²'],['180_250','180–250 m²'],['over250','Über 250 m²']]},
  {id:'emitters',title:'Wie wird die Wärme verteilt?',hint:'Heizkörper und Fußbodenheizung stellen unterschiedliche Anforderungen.',options:[['radiators','Heizkörper'],['floor','Fußbodenheizung'],['mixed','Beides'],['unknown','Weiß ich nicht']]},
  {id:'timeframe',title:'Wann soll modernisiert werden?',hint:'So können wir passend zur Entscheidungsreife matchen.',options:[['now','So schnell wie möglich'],['1_3m','In 1–3 Monaten'],['3_6m','In 3–6 Monaten'],['later','Später']]}
 ]},
 kitchen:{label:'Küche',questions:[
  {id:'shape',title:'Welche Küchenform stellst du dir vor?',hint:'Wenn du noch offen bist, wähle einfach „Noch offen“.',options:[['line','Küchenzeile'],['l','L-Küche'],['u','U-Küche'],['island','Küche mit Insel'],['open','Noch offen']]},
  {id:'style',title:'Welcher Stil passt zu dir?',hint:'Das hilft bei der Auswahl geeigneter Küchenstudios.',options:[['modern','Modern'],['classic','Klassisch'],['country','Landhaus'],['open','Noch offen']]},
  {id:'appliances',title:'Sollen Geräte enthalten sein?',hint:'Das verändert den Gesamtwert des Projekts deutlich.',options:[['yes','Ja, komplett'],['partial','Teilweise'],['no','Nein'],['unsure','Noch offen']]},
  {id:'budget',title:'Welches Budget planst du?',hint:'Eine grobe Spanne reicht vollkommen.',options:[['under10','Unter 10.000 €'],['10_15','10.000–15.000 €'],['15_25','15.000–25.000 €'],['25plus','Über 25.000 €']]},
  {id:'timeframe',title:'Wann soll die Küche stehen?',hint:'So berücksichtigen wir nur sinnvolle Optionen.',options:[['now','So schnell wie möglich'],['1_3m','In 1–3 Monaten'],['3_6m','In 3–6 Monaten'],['later','Später']]}
 ]},
 bath:{label:'Bad',questions:[
  {id:'scope',title:'Was soll im Bad passieren?',hint:'Damit lässt sich der Projektumfang direkt einordnen.',options:[['full','Komplettsanierung'],['partial','Teilsanierung'],['shower','Dusche / Wanne umbauen'],['new','Neubau']]},
  {id:'size',title:'Wie groß ist das Bad ungefähr?',hint:'Eine grobe Spanne genügt.',options:[['under6','Unter 6 m²'],['6_10','6–10 m²'],['10_15','10–15 m²'],['15plus','Über 15 m²']]},
  {id:'accessible',title:'Ist Barrierefreiheit wichtig?',hint:'Zum Beispiel bodengleiche Dusche oder breitere Bewegungsflächen.',options:[['yes','Ja'],['no','Nein'],['maybe','Vielleicht / teilweise']]},
  {id:'budget',title:'Welches Budget planst du?',hint:'Eine grobe Spanne reicht.',options:[['under15','Unter 15.000 €'],['15_25','15.000–25.000 €'],['25_40','25.000–40.000 €'],['40plus','Über 40.000 €']]},
  {id:'timeframe',title:'Wann soll es losgehen?',hint:'So berücksichtigen wir die passende Projektphase.',options:[['now','So schnell wie möglich'],['1_3m','In 1–3 Monaten'],['3_6m','In 3–6 Monaten'],['later','Später']]}
 ]}
};

const state={project:null,index:0,answers:{},submitted:false};
const wizard=$('#vqWizard');
function emit(name){window.dispatchEvent(new CustomEvent('vayquo:revenue',{detail:{name,category:state.project||'',route:'lead',budget:budgetNumber()}}))}
function source(){try{const p=new URLSearchParams(location.search);return (p.get('utm_source')||p.get('source')||document.referrer||'direct').slice(0,120)}catch{return'direct'}}
function budgetNumber(){const b=state.answers.budget||'';return ({under10:9000,'10_15':12500,'15_25':20000,'25plus':30000,under15:12000,'25_40':32500,'40plus':45000})[b]||0}
function currentQuestions(){return state.project?PROJECTS[state.project].questions:[]}
function setScreen(mode){$('#vqQuestionScreen').hidden=mode!=='question';$('#vqContactScreen').hidden=mode!=='contact';$('#vqSuccess').hidden=mode!=='success'}
function progress(){const total=currentQuestions().length+1;const pos=Math.min(total,state.index+1);$('#vqProgressBar').style.width=`${Math.round(pos/total*100)}%`}
function renderQuestion(){const qs=currentQuestions(),q=qs[state.index];if(!q){showContact();return}setScreen('question');$('#vqStepLabel').textContent=`${String(state.index+1).padStart(2,'0')} · ${PROJECTS[state.project].label.toUpperCase()}`;$('#vqQuestion').textContent=q.title;$('#vqQuestionHint').textContent=q.hint||'';$('#vqOptions').innerHTML=q.options.map(([value,label])=>`<button class="vq-option" type="button" data-answer="${value}"><span>${label}</span></button>`).join('');$$('[data-answer]',$('#vqOptions')).forEach(btn=>btn.addEventListener('click',()=>{state.answers[q.id]=btn.dataset.answer;state.index++;renderQuestion()}));progress();$('#vqBack').style.visibility=state.index===0?'visible':'visible'}
function openProject(project){if(!PROJECTS[project])return;state.project=project;state.index=0;state.answers={};state.submitted=false;wizard.classList.add('open');wizard.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';emit('revenue_flow_start');renderQuestion()}
function closeWizard(){wizard.classList.remove('open');wizard.setAttribute('aria-hidden','true');document.body.style.overflow='hidden';state.project=null;state.index=0;state.answers={};setScreen('question')}
function showContact(){setScreen('contact');progress();$('#vqFirstName').focus({preventScroll:true});emit('revenue_result')}
function back(){if($('#vqSuccess').hidden===false){closeWizard();return}if($('#vqContactScreen').hidden===false){state.index=Math.max(0,currentQuestions().length-1);renderQuestion();return}if(state.index>0){state.index--;renderQuestion()}else closeWizard()}
function validateContact(){const first=$('#vqFirstName').value.trim(),postcode=$('#vqPostcode').value.trim(),email=$('#vqEmail').value.trim(),phone=$('#vqPhone').value.trim(),consent=$('#vqConsent').checked;if(!first)return'Bitte deinen Vornamen eingeben.';if(!/^\d{5}$/.test(postcode))return'Bitte eine gültige 5-stellige PLZ eingeben.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return'Bitte eine gültige E-Mail-Adresse eingeben.';if(phone.replace(/\D/g,'').length<6)return'Bitte eine gültige Telefonnummer eingeben.';if(!consent)return'Bitte der Vermittlung an passende Fachbetriebe zustimmen.';return''}
async function submitRequest(e){e.preventDefault();if(state.submitted)return;const status=$('#vqFormStatus'),error=validateContact();if(error){status.textContent=error;return}if($('#vqWebsiteConfirm').value){status.textContent='';return}const btn=$('#vqSubmit');btn.disabled=true;status.textContent='';emit('revenue_primary_click');const payload={project_type:state.project,postcode:$('#vqPostcode').value.trim(),first_name:$('#vqFirstName').value.trim(),email:$('#vqEmail').value.trim(),phone:$('#vqPhone').value.trim(),answers:state.answers,budget_bucket:state.answers.budget||null,timeframe:state.answers.timeframe||null,consent_share:true,consent_version:CONSENT_VERSION,source:source(),status:'new'};try{const res=await fetch(ENDPOINT,{method:'POST',headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});if(!res.ok)throw new Error(`HTTP ${res.status}`);state.submitted=true;setScreen('success');$('#vqProgressBar').style.width='100%';emit('revenue_request_success')}catch(err){console.error('VAYQUO request failed',err);status.textContent='Das hat gerade nicht geklappt. Bitte versuche es noch einmal.';btn.disabled=false}}

$$('[data-project]').forEach(btn=>btn.addEventListener('click',()=>{state.project=btn.dataset.project;emit('revenue_intent');openProject(btn.dataset.project)}));
$('#vqClose').addEventListener('click',closeWizard);$('#vqBack').addEventListener('click',back);$('#vqContactForm').addEventListener('submit',submitRequest);$('#vqNewProject').addEventListener('click',()=>{closeWizard()});
if(!location.hash){try{history.scrollRestoration='manual'}catch{}requestAnimationFrame(()=>window.scrollTo(0,0))}
})();