(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VayquoEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const num=v=>Number.isFinite(Number(v))?Number(v):0,clamp=v=>Math.max(0,num(v));
const roundUp=(v,s=1)=>{s=Math.max(1,Math.trunc(num(s)||1));return Math.ceil(clamp(v)/s)*s;};
const metric=(label,value)=>({label,value}),detail=(label,value)=>({label,value});
const result=(kind,title,copy,metrics=[],details=[],code='OK')=>({kind,title,copy,metrics,details,code});
function transfer(rules,from,to){return (rules?.directTransfers||[]).find(x=>x.from===from&&x.to===to&&x.status==='active')||null;}
function interTransfer(rules,from,to){return (rules?.interProgramTransfers||[]).find(x=>x.from===from&&x.to===to&&x.status==='active')||null;}
function pbCashValue(rules){return num(rules?.redemptionAlternatives?.paybackCashValue?.valueCentsPerPoint||1)/100;}
function mrFloorPerPoint(rules){const t=transfer(rules,'mr_de','payback_de');return t?(num(t.targetUnits)/num(t.sourceUnits))*pbCashValue(rules):null;}
function sourceNeeded(targetNeeded,edge){let need=Math.ceil(clamp(targetNeeded)*(num(edge?.sourceUnits)||1)/(num(edge?.targetUnits)||1));need=roundUp(need,num(edge?.sourceStep)||1);if(num(edge?.minimumSource))need=Math.max(need,num(edge.minimumSource));return Math.ceil(need);}
function targetProduced(sourceAmount,edge){return Math.floor(clamp(sourceAmount)/(num(edge?.sourceUnits)||1)*(num(edge?.targetUnits)||1));}
function pathPolicy(rules,path){return (rules?.pathPolicies||[]).find(p=>JSON.stringify(p.path)===JSON.stringify(path))||null;}
function allowedPath(rules,path){const p=pathPolicy(rules,path);return !p||p.status==='allowed';}
function activeEdges(rules){return [...(rules?.directTransfers||[]).filter(x=>x.status==='active'),...(rules?.interProgramTransfers||[]).filter(x=>x.status==='active')];}
function paths(rules,source,target,maxEdges=2){const edges=activeEdges(rules),out=[];function walk(node,path,used){if(used.length>maxEdges)return;if(node===target&&used.length){if(allowedPath(rules,path))out.push({path:[...path],edges:[...used]});return;}for(const e of edges){if(e.from!==node||path.includes(e.to))continue;walk(e.to,[...path,e.to],[...used,e]);}}walk(source,[source],[]);return out;}
function sourceNeededForPath(targetNeeded,path){let need=Math.ceil(clamp(targetNeeded));for(let i=path.edges.length-1;i>=0;i--)need=sourceNeeded(need,path.edges[i]);return need;}
function bestMrPath(rules,target,targetNeeded){return paths(rules,'mr_de',target,2).map(p=>({...p,source:sourceNeededForPath(targetNeeded,p)})).sort((a,b)=>a.source-b.source||a.edges.length-b.edges.length)[0]||null;}
function reachableMrTargets(rules){return Object.keys(rules?.programs||{}).filter(id=>!['mr_de','payback_de','miles_and_more'].includes(id)&&bestMrPath(rules,id,1000)).sort((a,b)=>String(rules.programs[a]?.name||a).localeCompare(String(rules.programs[b]?.name||b),'de'));}
function pathDays(path){let days=0,unknown=false;for(const e of path?.edges||[]){const d=e.estimatedBusinessDaysMax??e.estimatedBusinessDays;if(Number.isFinite(Number(d)))days+=Number(d);else if(e.timing!=='immediate')unknown=true;}return unknown?null:days;}
function pathLabel(rules,path){const n=id=>id==='mr_de'?'Membership Rewards':id==='payback_de'?'PAYBACK':rules?.programs?.[id]?.name||id;return path.path.map(n).join(' → ');}
function evaluate(input,rules){
 const target=input?.target,cash=clamp(input?.cash),award=clamp(input?.award),copay=clamp(input?.copay),existing=clamp(input?.existing);
 const b={mr:clamp(input?.balances?.mr),pb:clamp(input?.balances?.pb),mm:clamp(input?.balances?.mm)};
 if(!rules)return result('warn','Regeln nicht geladen.','VAYQUO kann ohne aktuelle Regeln keine Entscheidung treffen.',[],[],'NO_RULES');
 if(input?.comparable===false)return result('warn','Noch nicht prüfbar.','Der Barpreis ist nicht sicher vergleichbar. VAYQUO trifft deshalb bewusst keine Empfehlung.',[],[],'NOT_COMPARABLE');
 if(!(cash>0)||!(award>0))return result('warn','Eingabe unvollständig.','Barpreis und benötigte Punkte oder Meilen müssen größer als null sein.',[],[],'INVALID_INPUT');
 if(copay>=cash)return result('bad','Bar bezahlen.','Die Zuzahlung ist bereits mindestens so hoch wie der Barpreis.',[metric('Barpreis',cash),metric('Zuzahlung',copay)],[],'COPAY_GE_CASH');
 const saving=cash-copay;
 if(target==='payback_de'){
  const floor=pbCashValue(rules),opp=award*floor,net=saving-opp,valueCt=saving/award*100;
  if(b.pb<award)return result('warn','PAYBACK-Punkte reichen noch nicht.',`Dir fehlen ${Math.ceil(award-b.pb)} PAYBACK Punkte für dieses Angebot.`,[metric('points_needed',award),metric('points_balance',b.pb),metric('value_cents',valueCt)],[detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'PB_SHORTFALL');
  if(net>0)return result('good','PAYBACK-Angebot schlägt den Barwert.','Dieses konkrete Angebot bringt mehr als die garantierte Barauszahlung der eingesetzten PAYBACK Punkte.',[metric('value_cents',valueCt),metric('advantage_eur',net)],[detail('points',award),detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'PB_BEATS_CASH');
  return result('bad','PAYBACK behalten – bar zahlen.','Die garantierte Barauszahlung der PAYBACK Punkte ist mindestens genauso gut.',[metric('value_cents',valueCt),metric('disadvantage_eur',Math.abs(net))],[detail('points',award),detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'PB_CASH_BETTER');
 }
 if(target==='mr_de'){
  const floor=mrFloorPerPoint(rules);if(floor===null)return result('warn','MR-Unterwert fehlt.','Der aktuelle MR→PAYBACK-Unterwert ist in den Regeln nicht verfügbar.',[],[],'NO_MR_FLOOR');
  const opp=award*floor,net=saving-opp,valueCt=saving/award*100;
  if(b.mr<award)return result('warn','Membership Rewards reichen noch nicht.',`Dir fehlen ${Math.ceil(award-b.mr)} MR für dieses Angebot.`,[metric('mr_needed',award),metric('mr_balance',b.mr),metric('value_cents',valueCt)],[detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'MR_DIRECT_SHORTFALL');
  if(net>0)return result('good','Membership Rewards einsetzen.','Dieses konkrete Angebot schlägt den sicheren MR-Unterwert über PAYBACK.',[metric('value_cents',valueCt),metric('advantage_eur',net)],[detail('mr',award),detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'MR_BEATS_FLOOR');
  return result('bad','MR behalten – bar zahlen.','Dieses Angebot liegt nicht über dem sicheren MR-Unterwert über PAYBACK.',[metric('value_cents',valueCt),metric('disadvantage_eur',Math.abs(net))],[detail('mr',award),detail('safe_value_eur',opp),detail('cash_saved_eur',saving)],'MR_FLOOR_BETTER');
 }
 if(target==='miles_and_more'){
  const shortage=Math.max(0,award-b.mm),valueCt=saving/award*100,details=[detail('award',award),detail('existing_mm',b.mm),detail('cash_saved_eur',saving)];
  if(shortage===0)return result('good','Mit deinen Meilen buchbar.','VAYQUO zeigt den echten Gegenwert dieses Angebots, ohne einen garantierten Miles-&-More-Barwert zu erfinden.',[metric('value_cents',valueCt),metric('cash_saved_eur',saving)],details,'MM_BOOKABLE');
  const edge=interTransfer(rules,'payback_de','miles_and_more');
  if(edge){const pbNeeded=sourceNeeded(shortage,edge),produced=targetProduced(pbNeeded,edge);if(b.pb>=pbNeeded){const opp=pbNeeded*pbCashValue(rules),left=Math.max(0,produced-shortage);details.push(detail('pb_needed',pbNeeded),detail('pb_safe_value_eur',opp));if(left)details.push(detail('mm_leftover_after_booking',left));return result('warn','Mit PAYBACK auffüllbar.','PAYBACK kann den Fehlbetrag auffüllen. VAYQUO berücksichtigt Mindesttransfer und den sicheren PAYBACK-Barwert.',[metric('missing_miles',shortage),metric('pb_transfer',pbNeeded)],details,'MM_TOPUP_PB');}details.push(detail('pb_needed',pbNeeded),detail('pb_balance',b.pb));}
  return result('warn','Noch nicht mit deinem Stand buchbar.',`Dir fehlen ${Math.round(shortage)} Miles & More Meilen. Ein ungeklärter MR→PAYBACK→Miles-&-More-Kettenweg wird nicht empfohlen.`,[metric('missing_miles',shortage),metric('value_cents',valueCt)],details,'MM_SHORTFALL');
 }
 const shortfall=Math.max(0,award-existing),valueCt=saving/award*100;
 if(shortfall===0)return result('good','Mit vorhandenem Airline-Guthaben buchbar.','Es ist kein Membership-Rewards-Transfer nötig.',[metric('value_cents',valueCt),metric('cash_saved_eur',saving)],[detail('target',target),detail('award',award),detail('existing',existing)],'TARGET_BOOKABLE');
 const path=bestMrPath(rules,target,shortfall);if(!path)return result('warn','Kein freigegebener MR-Transferweg.','VAYQUO findet in den aktuellen Regeln keinen freigegebenen Weg zu diesem Programm.',[],[],'NO_PATH');
 const needed=path.source,days=pathDays(path),details=[detail('target',target),detail('award',award),detail('existing',existing),detail('mr_needed',needed),detail('path',pathLabel(rules,path)),detail('days',days)];
 if(b.mr<needed)return result('warn','Membership Rewards reichen noch nicht.',`Für den günstigsten freigegebenen Transferweg fehlen dir ${Math.round(needed-b.mr)} MR.`,[metric('mr_needed',needed),metric('mr_balance',b.mr)],details,'MR_SHORTFALL');
 if(existing>0)return result('warn','Transfer möglich – gemischter Bestand.','Vorhandene Airline-Meilen und neue Membership Rewards werden gemeinsam eingesetzt. VAYQUO zeigt die Struktur, aber keinen künstlich exakten MR-Gegenwert.',[metric('mr_transfer',needed),metric('cash_saved_eur',saving)],details,'MIXED_BALANCE');
 const floor=mrFloorPerPoint(rules);if(floor===null)return result('warn','Transfer möglich.','Der sichere MR-Unterwert ist gerade nicht verfügbar; deshalb keine finale Geldentscheidung.',[],details,'NO_MR_FLOOR');
 const opp=needed*floor,net=saving-opp;details.push(detail('mr_safe_value_eur',opp),detail('copay_eur',copay));
 if(net>0)return result('good','Prämienweg ist rechnerisch stärker.','Die Bargeldersparnis liegt über dem sicheren Unterwert der benötigten Membership Rewards. Prämienplatz unmittelbar vor dem Transfer erneut prüfen.',[metric('advantage_eur',net),metric('mr_needed',needed)],details,'AWARD_BEATS_FLOOR');
 return result('bad','MR behalten – bar zahlen.','Der sichere Unterwert der benötigten Membership Rewards ist mindestens so hoch wie die Bargeldersparnis dieses Angebots.',[metric('disadvantage_eur',Math.abs(net)),metric('mr_needed',needed)],details,'CASH_BEATS_AWARD');
}
return {pbCashValue,mrFloorPerPoint,sourceNeeded,targetProduced,bestMrPath,reachableMrTargets,pathDays,pathLabel,evaluate};
});