(()=>{
'use strict';
const form=document.getElementById('partnerForm');if(!form)return;
const btn=document.getElementById('partnerSubmit'),status=document.getElementById('partnerStatus');
const ENDPOINT='https://fcvffslhnaqlwitaeers.supabase.co/rest/v1/vayquo_partner_interest';
const API_KEY='sb_publishable_GwUiLouKIRUOpDpp6BaZIQ_o1uRQTl8';
const clean=(v,max=1000)=>String(v||'').trim().slice(0,max);
form.addEventListener('submit',async e=>{
 e.preventDefault();status.className='p-status';status.textContent='';
 const fd=new FormData(form);if(clean(fd.get('company_website_confirm')))return;
 const categories=[...form.querySelectorAll('input[name="categories"]:checked')].map(x=>x.value);
 if(!categories.length){status.className='p-status err';status.textContent='Bitte mindestens eine Projektkategorie auswählen.';return}
 if(!form.checkValidity()){form.reportValidity();return}
 const minRaw=clean(fd.get('project_min_eur'),20).replace(/[^0-9]/g,'');
 const payload={company_name:clean(fd.get('company_name'),120),email:clean(fd.get('email'),200),website:clean(fd.get('website'),250)||null,categories,regions:clean(fd.get('regions'),250)||null,project_min_eur:minRaw?Number(minRaw):null,note:clean(fd.get('note'),1000)||null,source:'partner_page_multi_category_pilot'};
 btn.disabled=true;btn.textContent='Wird gespeichert …';
 try{
   const res=await fetch(ENDPOINT,{method:'POST',headers:{apikey:API_KEY,Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload),credentials:'omit'});
   if(!res.ok)throw new Error('save_failed');
   form.reset();status.className='p-status ok';status.textContent='Danke. Ihre Pilotanfrage ist gespeichert. Vor dem kostenpflichtigen Start stimmen wir Kategorien, Gebiet, Kriterien und Konditionen mit Ihnen ab.';btn.textContent='Pilotanfrage gespeichert ✓';
   window.dispatchEvent(new CustomEvent('vayquo:partner_interest',{detail:{categories:categories.join('.'),offer:'multi_category_pilot_49'}}));
   setTimeout(()=>{btn.disabled=false;btn.textContent='Pilotpartnerschaft anfragen →'},3000);
 }catch{
   status.className='p-status err';status.textContent='Das hat gerade nicht funktioniert. Bitte später erneut versuchen oder webmaster@vayquo.de kontaktieren.';btn.disabled=false;btn.textContent='Pilotpartnerschaft anfragen →';
 }
});
})();