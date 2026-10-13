'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const dateString = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,10);
const today = new Date();
$('#departure').min = dateString(today);
const defaultDate = new Date(today); defaultDate.setDate(today.getDate() + 30);
$('#departure').value = dateString(defaultDate);
$('#budget-range').addEventListener('input', e => { $('#budget').value = e.target.value; });
$('#budget').addEventListener('input', e => { $('#budget-range').value = Math.min(Number($('#budget-range').max), Number(e.target.value)); });
function updateTravellers(delta) { $('#travellers').value = Math.max(1,Math.min(8,Number($('#travellers').value || 2) + delta)); $('#fewer').disabled = Number($('#travellers').value) <= 1; $('#more').disabled = Number($('#travellers').value) >= 8; }
$('#fewer').onclick = () => updateTravellers(-1); $('#more').onclick = () => updateTravellers(1);
$('#travellers').addEventListener('change', () => updateTravellers(0));
$('#hero-image').style.backgroundImage = 'url("images/lisbon.jpg")';
const P=TripPlanner;
let currentStep=0,trip=null,matches=[],selectedId=null;
const headings=[['Let’s start with the essentials.','Big adventure or little escape? It’s up to you.'],['What’s your kind of getaway?','Follow your mood. We’ll find the place.'],['Make it feel like your trip.','Good food. A good stay. Your kind of days.']];
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate=d=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(d+'T12:00:00'));
function readForm(){const f=new FormData($('#trip-form'));return {currency:TripCurrency.current,budget:readMoneyInput('#budget'),origin:f.get('origin'),departure:f.get('departure'),nights:Number(f.get('nights')),travellers:Number(f.get('travellers')),vibe:f.get('vibe'),region:f.get('region'),country:countryValue(),food:f.get('food'),stay:f.get('stay'),...(trip?.arrivalAirports?{arrivalAirports:Object.fromEntries(Object.entries(trip.arrivalAirports).filter(([,code])=>code!==f.get('origin')))}:{})};}
function showError(message){$('#form-error').textContent=message;$('#form-error').hidden=false;}
function validateForm(){try{P.validate(readForm());$('#form-error').hidden=true;return true;}catch(e){showError(e.message);if(currentStep!==0)showStep(0,false);return false;}}
function showStep(step,focus=true){
  currentStep=step;
  $$('.form-step').forEach((el,i)=>el.hidden=i!==step);
  $$('.step').forEach((el,i)=>{el.classList.toggle('active',i===step);el.classList.toggle('done',i<step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('#step-count').textContent=`STEP 0${step+1} / 03`;
  $('#form-title').textContent=headings[step][0];$('#step-description').textContent=headings[step][1];
  $('#back-button').hidden=step===0;
  $('#next-button').innerHTML=["Next: your vibe <span aria-hidden='true'>→</span>","Next: the details <span aria-hidden='true'>→</span>","Find my trip <span aria-hidden='true'>↗</span>"][step];
  if(focus)$('#form-title').focus({preventScroll:true});
}
$('#trip-form').noValidate=true;
$('#trip-form').addEventListener('submit',e=>{e.preventDefault();if(!validateForm())return;if(currentStep<2)showStep(currentStep+1);else findTrips(readForm());});
$('#back-button').onclick=()=>showStep(Math.max(0,currentStep-1));
$$('.step').forEach(button=>button.onclick=()=>{const n=Number(button.dataset.step);if(n<=currentStep||validateForm())showStep(n);});
function photoCredit(d){return `Photo: <a href="${escapeHtml(d.source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(d.credit)}</a> · ${d.licenseUrl?`<a href="${escapeHtml(d.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(d.license)}</a>`:escapeHtml(d.license)} · Resized and cropped to fit`;}
function hero(d){return `<div class="destination-hero"><div class="hero-image" role="img" aria-label="${escapeHtml(d.caption||d.city+', '+d.country)}" style="background-image:url('${d.image}')"></div><div class="hero-shade"></div><div class="hero-top"><span class="white-pill">${escapeHtml(d.badge)}</span><span class="hero-coordinate">${d.coordinates}</span></div><div class="hero-bottom"><p>${escapeHtml(d.country.toUpperCase())}</p><h2>${d.city}<span aria-hidden="true">↗</span></h2><p>${escapeHtml(d.tagline)}</p></div></div>`;}
function foodAdvice(d){
  if(trip.food==='halal')return d.id==='marrakech'?'Moroccan food is a strong match for your halal preference. Confirm meat sourcing and preparation with each restaurant.':'For halal meals, research suitable restaurants before choosing your stay and confirm sourcing and preparation directly.';
  if(trip.food==='vegetarian')return 'Look for vegetarian menus near your stay; ask about stocks, sauces, and preparation when ordering.';
  if(trip.food==='seafood')return d.foods.includes('seafood')?'Seafood is part of the local food scene; the estimate allows a little extra for meals.':'Seafood may need more planning here; the estimate allows a little extra for meals.';
  return 'Leave room for local cafés, markets, and a few unplanned food stops.';
}
function findTrips(input){trip=P.validate(input);TripCurrency.current=trip.currency||'EUR';matches=P.recommend(trip);selectedId=null;choiceLimit=6;choiceBudgetOnly=false;renderResults();return snapshot();}
function selectDestination(id){if(!trip)throw Error('Create a trip first.');if(!matches.some(m=>m.destination.id===id))throw Error('This destination is not available for the current departure city and region.');selectedId=id;renderResults();return snapshot();}
function renderResults(){
  TripCurrency.current=trip.currency||'EUR';
  $('#favourites-panel').hidden=true;$('#country-explorer').hidden=false;$('.workspace').hidden=true;$('.intro').hidden=true;$('#results').hidden=false;
  $('#results-summary').textContent=`${P.origins[trip.origin]} · ${formatDate(trip.departure)} – ${formatDate(P.checkout(trip))} · ${trip.nights} nights · ${trip.travellers} adult${trip.travellers===1?'':'s'} · ${P.money(trip.budget)} total budget`;
  const selected=matches.find(m=>m.destination.id===selectedId);
  if(!selected){renderTripChoices();focusResults();return;}
  if(selected.costs===null){renderUnpricedCountry(selected.destination);return;}
  const d=selected.destination,c=selected.costs,links=P.links(d,trip),affordable=matches.filter(m=>m.withinBudget).length;
  $('#results-title').textContent='Make this trip your own.';
  const warning=c.total===null?'<div class="match-notice">Check the flight price from your departure airport and enter it in the calculator. Budget fit will be calculated once all costs are filled in.</div>':affordable===0?`<div class="match-notice warning"><strong>No featured trips fit this budget yet.</strong> The lowest estimate for your selected ${trip.country==='any'?'region':'country'} is ${P.money(matches[0].costs.total)}. Try fewer nights, a simpler stay, a different region, or a larger budget. You can still explore the options below.</div>`:!selected.withinBudget?`<div class="match-notice warning">${d.city} is ${P.money(-c.remaining)} above your budget. ${affordable} other destination${affordable===1?' fits':'s fit'} the estimate; compare below or edit your preferences.</div>`:`<div class="match-notice"><strong>${selectedId===matches[0].destination.id?'Your best fit in this collection.':'Your destination, your choice.'}</strong> ${P.money(c.remaining)} left within your budget, based on our planning estimate. ${trip.vibe!=='any'&&!d.vibes.includes(trip.vibe)?'This option is a compromise on your preferred trip style.':''}</div>`;
  const alternatives=matches.filter(m=>m.destination.id!==selectedId).slice(0,3);
  $('#results-content').innerHTML=`${detailToolbar()}${warning}<div class="recommendation-grid"><div>${hero(d)}<p class="destination-description">${escapeHtml(d.description)}</p><div class="detail-tags">${d.highlights.map(h=>`<span>${escapeHtml(h)}</span>`).join('')}</div><a class="guide-link" target="_blank" rel="noopener noreferrer" href="${d.guide}">Explore the official destination guide ↗</a><div class="hotel-suggestion"><p class="eyebrow">YOUR STAY & YOUR TABLE</p><h3>${P.stays[trip.stay].label} in ${escapeHtml(d.area)}</h3><p>${escapeHtml(d.stayNote)} ${escapeHtml(foodAdvice(d))}</p></div><p class="photo-credit">${photoCredit(d)}</p></div><div><div class="budget-card">${renderBudgetCalculator(d,c)}${renderArrivalAirport(d)}<div class="booking-buttons"><a class="primary-button" href="${escapeHtml(links.hotels)}" target="_blank" rel="noopener noreferrer">Find hotels <span aria-hidden="true">↗</span></a>${flightPriceLink(d,trip)}</div><p class="booking-caption">Opens Booking.com and Google Flights. Google Flights shows current fares; ByeBye estimates do not update automatically. Confirm your route, dates, travellers, and final total there. ${['Asia','Oceania'].includes(d.region)?'Long-haul arrival dates may differ; adjust hotel check-in accordingly.':''}</p></div></div></div><div class="alternatives-top"><h3>Keep your options open.</h3><span>Choose another trip or save it for later</span></div><div class="trip-choice-grid">${alternatives.map(m=>tripCard(m,trip,matches.indexOf(m))).join('')||'<p class="no-alternatives">Edit your country or region to compare more destinations.</p>'}</div>`;
  bindDetailActions();
  $('#announcements').textContent=c.total===null?`${d.city} selected. Add your flight cost to complete the estimate.`:`${d.city} selected. Estimated total ${P.money(c.total)}. ${c.remaining>=0?'Within':'Above'} your budget.`;
  $('#results-title').focus({preventScroll:true});$('#results').scrollIntoView({behavior:'instant',block:'start'});
}
function costLine(title,detail,amount){return `<div class="cost-line"><span>${escapeHtml(title)}<span class="cost-detail">${escapeHtml(detail)}</span></span><strong>${P.money(amount)}</strong></div>`;}
$('#edit-trip').onclick=()=>{$('#results').hidden=true;$('.workspace').hidden=false;$('.intro').hidden=false;showStep(0);$('#planner').scrollIntoView({behavior:'instant',block:'start'});};
const dialog=$('#info-dialog');
function showDialog(content){$('#dialog-body').innerHTML=content;dialog.showModal();}
$('.dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#how-button').onclick=()=>showDialog('<p class="eyebrow">LESS PLANNING, MORE GOING</p><h2 id="dialog-title">A trip that starts with you.</h2><ol><li>Set a total budget, departure country and airport, dates, and number of adult travellers.</li><li>Choose your travel style, food preferences, and the kind of stay you enjoy.</li><li>Compare several trip options, save your favourites, then choose one to see its details. Check live hotel and flight options with the providers.</li></ol><p>Search 250 countries and territories across all seven continents. The featured collection includes '+P.destinations.length+' destinations, with Asia, the USA, and Canada near the top of the directory. Browse the Middle East directly, too. Every country has photography, travel facts, a calculator for your own costs, and provider searches; Antarctica links to specialist expedition information.</p>');
$('#estimates-button').onclick=()=>showDialog('<p class="eyebrow">A STARTING POINT FOR PLANNING</p><h2 id="dialog-title">Estimates, with some breathing room.</h2><p>ByeBye converts illustrative planning amounts into your chosen currency for return flights, rooms, food, local travel, and activities. These are planning assumptions, not current market quotes. Every country and featured trip also has an editable calculator for your own costs. Month of travel, last-minute departures, group size, trip length, and hotel style adjust the estimate.</p><p>We allow one room for every two adults, count food and activities for nights plus one day, and start with a 12% extra allowance that you can change in the calculator. Actual taxes, baggage, transfers, accessibility needs, and room arrangements may cost more.</p><p>Booking.com and Google Flights provide live options. Check the dates, number of guests, cancellation terms, and final total before booking. ByeBye does not take payments or make reservations.</p>');
function snapshot(){return {preferences:trip,stage:selectedId?'details':'choose-trip',selectedDestination:selectedId,recommendations:matches.map(m=>({id:m.destination.id,city:m.destination.city,totalEUR:m.costs?.total??null,withinBudget:m.withinBudget})),pricesAreLive:false};}
function applyForm(p){TripCurrency.current=p.currency||'EUR';refreshCurrencyLabels();setMoneyInput('#budget',p.budget);applyDeparture(p.origin);$('#country-input').value=p.country&&p.country!=='any'?P.countries.find(c=>c.code===p.country)?.name??'':'';for(const key of ['departure','nights','travellers','region'])document.getElementById(key).value=p[key];for(const key of ['vibe','food','stay'])$(`input[name="${key}"][value="${p[key]}"]`).checked=true;$('#budget-range').value=currencyAmount(Math.min(10000,p.budget));updateTravellers(0);updateCountrySuggestions();}
if(document.modelContext?.registerTool){
  const controller=new AbortController();
  const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}};
  register({name:'find_trip_destinations',title:'Find destinations for a trip',description:'Set travel preferences and display ranked destination recommendations using illustrative cost estimates. Does not book or pay.',inputSchema:{type:'object',additionalProperties:false,properties:{currency:{type:'string',enum:TripCurrency.codes,description:'Display currency; the budget tool input remains in EUR.'},budget:{type:'number',minimum:200,maximum:30000},origin:{type:'string',pattern:'^[A-Z]{3}$',description:'Worldwide departure airport IATA code, such as JFK, DXB, or MNL. Legacy city codes LON, PAR, ROM also work.'},departure:{type:'string',description:'Future or current date in YYYY-MM-DD'},nights:{type:'integer',enum:[3,5,7,10,14]},travellers:{type:'integer',minimum:1,maximum:8},vibe:{type:'string',enum:['any','beach','culture','nature']},region:{type:'string',enum:P.regions},country:{type:'string',enum:['any',...P.countries.map(c=>c.code)],description:'Optional country code. Omit or use any to compare featured destinations.'},food:{type:'string',enum:['any','local','seafood','vegetarian','halal']},stay:{type:'string',enum:['simple','boutique','comfort']}},required:['budget','origin','departure','nights','travellers','vibe','region','food','stay']},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const p=P.validate(input);applyForm(p);return findTrips(p);}});
  register({name:'select_trip_destination',title:'Choose another destination',description:'Change the displayed destination within the current recommendations. Does not book or pay.',inputSchema:{type:'object',properties:{destinationId:{type:'string'}},required:['destinationId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>selectDestination(input.destinationId)});
  register({name:'read_trip_recommendations',title:'Read the trip recommendations',description:'Read the current trip preferences, selected destination, and illustrative budget estimates.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>snapshot()});
  window.addEventListener('pagehide',()=>controller.abort(),{once:true});
}
