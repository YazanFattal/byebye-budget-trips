'use strict';
const calculatorDrafts=new Map();
const calculatorKey=(id,p)=>TripFavourites.key(id,{...p,arrivalAirports:undefined,currency:undefined});
let activeCalculator=null;
const calcMoney=value=>TripCurrency.money(value,trip.currency||'EUR',true);
const calcAmountField=name=>!['rooms','buffer'].includes(name);
const calcDisplay=(name,value)=>value===''?'':calcAmountField(name)?currencyAmount(Number(value),trip.currency||'EUR'):String(value);
const calcBase=(name,value)=>value===''?'':calcAmountField(name)?String(Number(value)/TripCurrency.rate(trip.currency||'EUR')):String(value);
function calculateCurrencyDraft(values,p,expedition){
  const rate=TripCurrency.rate(p.currency||'EUR');
  const local=Object.fromEntries(Object.entries(values).map(([name,value])=>[name,value===''?'':calcAmountField(name)?Math.round(Number(value)*rate*100)/100:value]));
  const result=TripBudget.calculate(local,{...p,budget:p.budget*rate,inputRate:rate},expedition);
  return Object.fromEntries(Object.entries(result).map(([name,value])=>[name,typeof value==='number'?value/rate:value]));
}
function calculatorMatch(match,p){
  const draft=calculatorDrafts.get(calculatorKey(match.destination.id,p));
  if(!draft?.edited)return match;
  const costs=calculateCurrencyDraft(draft.values,p,match.destination.countryCode==='AQ');
  return costs.status==='ready'?{...match,costs,withinBudget:costs.withinBudget,personal:true}:match;
}
function renderBudgetCalculator(d,costs=null){
  const key=calculatorKey(d.id,trip),expedition=d.countryCode==='AQ';
  const initial=TripBudget.defaults(costs,trip,expedition);
  if(!calculatorDrafts.has(key))calculatorDrafts.set(key,{values:{...initial},edited:false});
  activeCalculator={key,d,preferences:{...trip},initial,expedition,hasEstimate:!!costs};
  const draft=calculatorDrafts.get(key);
  const field=(name,label,hint,{max=1000000,step='.01',min=0}={})=>`<div class="calc-field"><label for="calc-${name}">${label}</label><input id="calc-${name}" name="${name}" type="number" min="${min}" max="${calcAmountField(name)?max*TripCurrency.rate(trip.currency||'EUR'):max}" step="${step}" inputmode="${name==='rooms'?'numeric':'decimal'}" value="${escapeHtml(calcDisplay(name,draft.values[name]))}" placeholder="Enter amount" required aria-describedby="calc-${name}-hint calc-${name}-error"><span class="calc-hint" id="calc-${name}-hint">${hint}</span><span class="calc-field-error" id="calc-${name}-error" hidden></span></div>`;
  return `<section class="budget-calculator" aria-labelledby="calc-title"><p class="eyebrow">MAKE THE NUMBERS YOURS</p><h3 id="calc-title">Your trip calculator.</h3><p class="calc-context">${trip.travellers} adult${trip.travellers===1?'':'s'} · ${trip.nights} nights · ${trip.nights+1} days · all amounts in ${trip.currency||'EUR'}</p><p class="calc-intro">${costs?'Start with our planning amounts, then replace them with your own costs.':'Enter your own costs to see what fits. Use 0 for anything already included or not needed.'}</p><form id="budget-calculator-form" novalidate><div class="calculator-fields">${field('flights','Return flights · '+TripCurrency.symbol(trip.currency||'EUR'),`Total for all ${trip.travellers} travellers, including bags`)}${expedition?field('packageTotal','Expedition / stay · '+TripCurrency.symbol(trip.currency||'EUR'),'Whole-group package total; avoid counting included costs twice'):field('nightly','Room price / night · '+TripCurrency.symbol(trip.currency||'EUR'),'Per room, including taxes')+field('rooms','Rooms needed',`Multiplied by ${trip.nights} nights`,{min:1,max:8,step:'1'})}${field('foodDaily','Food / person / day · '+TripCurrency.symbol(trip.currency||'EUR'),`Multiplied by ${trip.nights+1} days and ${trip.travellers} travellers`)}${field('transport','Transport & activities · '+TripCurrency.symbol(trip.currency||'EUR'),'Whole trip, for everyone')}${field('extras','Other costs · '+TripCurrency.symbol(trip.currency||'EUR'),'Whole trip, for everyone')}${field('buffer','Extra allowance · %','Added to the subtotal',{max:100})}</div><button class="text-button calc-reset" type="button" id="reset-calculator">${costs?'Reset to planning amounts':'Clear my amounts'}</button></form><div class="calculator-result" aria-live="polite" aria-atomic="true"><p id="calc-result-label">YOUR ESTIMATE</p><output class="calc-total" id="calc-total">Add your costs</output><p class="calc-person" id="calc-person"></p><div class="calc-budget-status" id="calc-budget-status"></div><dl class="calc-breakdown" id="calc-breakdown" hidden></dl></div><p class="calc-footnote">Your budget: ${P.money(trip.budget)}. Entries stay while you compare trips in this tab; reloading clears them. Amounts are your estimates, not confirmed offers.</p></section>`;
}
function bindBudgetCalculator(){
  const form=$('#budget-calculator-form');if(!form||!activeCalculator)return;
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',()=>{
    const draft=calculatorDrafts.get(activeCalculator.key);draft.edited=true;
    for(const input of form.querySelectorAll('input'))draft.values[input.name]=calcBase(input.name,input.value);
    refreshBudgetCalculator();
  });
  $('#reset-calculator').onclick=()=>{
    calculatorDrafts.set(activeCalculator.key,{values:{...activeCalculator.initial},edited:false});
    for(const input of form.querySelectorAll('input'))input.value=calcDisplay(input.name,activeCalculator.initial[input.name]);
    refreshBudgetCalculator();
  };
  refreshBudgetCalculator();
}
function refreshBudgetCalculator(){
  const a=activeCalculator,draft=calculatorDrafts.get(a.key),result=calculateCurrencyDraft(draft.values,a.preferences,a.expedition),ready=result.status==='ready';
  for(const input of $('#budget-calculator-form').querySelectorAll('input')){
    const error=result.errors?.[input.name],node=$(`#calc-${input.name}-error`);
    input.setAttribute('aria-invalid',String(!!error));node.hidden=!error;node.textContent=error||'';
  }
  $('#calc-result-label').textContent=a.hasEstimate&&!draft.edited?'PLANNING ESTIMATE · EDIT ABOVE':'YOUR OWN TRIP ESTIMATE';
  $('#calc-total').textContent=ready?calcMoney(result.total):result.status==='invalid'?'Check your amounts':'Add your costs';
  $('#calc-person').textContent=ready?`${calcMoney(result.perPerson)} per person · ${a.preferences.travellers} adults`:'Enter every cost above, including 0 where appropriate.';
  const status=$('#calc-budget-status');status.classList.toggle('over',ready&&!result.withinBudget);
  status.textContent=ready?(result.remaining>=0?`${calcMoney(result.remaining)} left in your budget`:`${calcMoney(-result.remaining)} above your budget`):`Budget available: ${P.money(a.preferences.budget)}`;
  const breakdown=$('#calc-breakdown');breakdown.hidden=!ready;
  breakdown.innerHTML=ready?[['Flights',result.flights],[a.expedition?'Expedition / stay':'Accommodation',result.stay],['Food',result.food],['Transport & activities',result.transport],['Other costs',result.extras],['Extra allowance',result.buffer]].map(([label,value])=>`<div><dt>${label}</dt><dd>${calcMoney(value)}</dd></div>`).join(''):'';
  const notice=$('#results-content > .match-notice');
  if(notice){notice.classList.toggle('warning',ready&&!result.withinBudget);notice.textContent=ready?`${a.d.city}: ${result.withinBudget?'within':'above'} your budget based on ${draft.edited?'your entered costs':'the amounts in the calculator'}. Edit any amount below to compare your own estimate.`:'Build your own estimate with the calculator. Check current flight and hotel prices with the booking providers.';}
  return result;
}
function currencyBudgetResult(result,currency){return Object.fromEntries(Object.entries(result).map(([k,v])=>[k,typeof v==='number'?Math.round(v*TripCurrency.rate(currency)*100)/100:v]));}
function budgetSnapshot(){
  if(!activeCalculator||$('#results').hidden||!$('#budget-calculator-form'))return null;
  const a=activeCalculator,draft=calculatorDrafts.get(a.key);
  return {destinationId:a.d.id,currency:a.preferences.currency||'EUR',pricesAreLive:false,source:draft.edited?'user-entered':a.hasEstimate?'illustrative-defaults':'empty',inputs:Object.fromEntries(Object.entries(draft.values).map(([k,v])=>[k,calcDisplay(k,v)])),result:currencyBudgetResult(calculateCurrencyDraft(draft.values,a.preferences,a.expedition),a.preferences.currency||'EUR')};
}
if(document.modelContext?.registerTool){
  const life=new AbortController(),register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:life.signal})).catch(()=>{});}catch{}};
  register({name:'calculate_trip_budget',title:'Calculate a personal trip budget',description:'Set costs in the selected country or trip calculator. Amounts use the selected trip currency. Flights, transport, extras, and expedition packages are whole-group totals; nightly is per room; foodDaily is per person per day. Does not book or fetch live prices.',inputSchema:{type:'object',properties:Object.fromEntries(['flights','nightly','rooms','packageTotal','foodDaily','transport','extras','buffer'].map(name=>[name,{type:'number',minimum:name==='rooms'?1:0,maximum:name==='rooms'?8:name==='buffer'?100:1000000000000000}])),additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
    if(!budgetSnapshot())throw Error('Choose a trip or country before using its calculator.');
    const draft=calculatorDrafts.get(activeCalculator.key),values={...draft.values,...Object.fromEntries(Object.entries(input).map(([k,v])=>[k,calcBase(k,v)]))};
    const result=calculateCurrencyDraft(values,activeCalculator.preferences,activeCalculator.expedition);
    if(result.status!=='ready')throw Error(result.status==='invalid'?Object.values(result.errors).join(' '):'Enter all costs. Use 0 for anything not needed.');
    draft.values=values;draft.edited=true;
    for(const node of $('#budget-calculator-form').querySelectorAll('input'))node.value=calcDisplay(node.name,values[node.name]);
    refreshBudgetCalculator();return budgetSnapshot();
  }});
  register({name:'read_trip_budget',title:'Read the personal trip budget',description:'Read the current calculator inputs, totals, and budget comparison. These are estimates, not live prices.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>budgetSnapshot()});
  window.addEventListener('pagehide',()=>life.abort(),{once:true});
}
