(()=>{
'use strict';
document.addEventListener('click',e=>{
 const btn=e.target instanceof Element?e.target.closest('[data-open-flow][data-example]'):null;if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 const key=btn.dataset.example;const examples={workshop:'18 m² Werkstatt, 8.000 €, Makita vorhanden, Möbelbau',kitchen:'Neue Küche, 15.000 €, 12 m², modern, komplett geplant und eingebaut',pv:'Photovoltaik mit Speicher, Einfamilienhaus, Budget 18.000 €',gym:'Home Gym, 5.000 €, 12 m², Muskelaufbau und Kraft'};
 const input=document.getElementById('vqIntent'),start=document.getElementById('vqStart');if(!input||!start||!examples[key])return;
 input.value=examples[key];input.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(()=>start.click(),0);
},true);
})();