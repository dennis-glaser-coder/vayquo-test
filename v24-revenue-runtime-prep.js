(()=>{
'use strict';

// PREPARATION ONLY.
// This file performs no network requests, sets no cookies and writes no browser storage.

const MAX_EVENTS=200;
const memory=[];

const slots=new Set([
 'after_value_demonstrated',
 'complex_award_help',
 'accommodation_missing_after_trip_intent',
 'activity_after_destination_known',
 'international_connectivity_relevant',
 'car_missing_after_trip_intent',
 'after_card_gap_analysis'
]);
const channels=new Set(['expedia','getyourguide','airalo','amex_cards','vayquo_pro','concierge']);

const schema={
 journey_stage_viewed:{stage:new Set(['understand_balance','recommend_best_use','validate_concrete_option','trip_intent','booking_confirmed','pre_departure','post_trip','retain'])},
 value_result_shown:{resultType:new Set(['best_use','concrete_offer_value','flight_option','transfer_baseline'])},
 trip_intent_detected:{intentLevel:new Set(['exploring','planning','ready_to_book'])},
 commercial_slot_eligible:{slot:slots,channel:channels},
 commercial_slot_blocked:{slot:slots,channel:channels,reason:new Set(['commercial_live_off','partner_not_ready','tracking_not_ready','legal_gate_closed','user_need_missing','channel_disabled'])},
 commercial_offer_viewed:{slot:slots,channel:channels},
 commercial_offer_clicked:{slot:slots,channel:channels},
 subscription_interest:{source:new Set(['after_value','alerts','optimizer','other'])},
 concierge_interest:{source:new Set(['complex_award','high_value_trip','user_request','other'])},
 card_check_started:{},
 card_result_ready:{authState:new Set(['guest','signed_in'])},
 card_registration_gate_shown:{},
 card_registration_gate_completed:{},
 card_result_shown:{},
 card_external_click:{destination:new Set(['provider','affiliate'])}
};

function sanitize(name,payload={}){
 const fields=schema[name];
 if(!fields||!payload||typeof payload!=='object'||Array.isArray(payload))return null;
 const clean={};
 for(const [key,allowed] of Object.entries(fields)){
  const value=payload[key];
  if(typeof value==='string'&&allowed.has(value))clean[key]=value;
 }
 return clean;
}

function record(name,payload={}){
 const clean=sanitize(name,payload);
 if(clean===null)return false;
 const event={name,payload:clean,ts:Date.now()};
 memory.push(event);
 if(memory.length>MAX_EVENTS)memory.shift();
 document.dispatchEvent(new CustomEvent('vayquo:revenue-prep-event',{detail:event}));
 return true;
}

function snapshot(){return memory.map(event=>({...event,payload:{...event.payload}}));}
function counts(){return memory.reduce((out,event)=>{out[event.name]=(out[event.name]||0)+1;return out;},{});}
function reset(){memory.length=0;}

window.VAYQUORevenuePrep=Object.freeze({
 version:'1.1.0-prep',
 mode:'preparation_only',
 persistence:'memory_only',
 record,
 snapshot,
 counts,
 reset
});
})();
