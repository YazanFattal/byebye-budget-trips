'use strict';
const favourites=TripFavourites.create({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
let choiceLimit=6,choiceBudgetOnly=false,favouriteReturnToResults=false;
const heartIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
function destinationPhoto(d){return d.image?d:globalThis.CountryPhotos?.[d.countryCode];}
function favouriteButton(d,p,index,detail=false){const saved=favourites.has(d.id,p);return `<button class="favourite-button ${detail?'favourite-detail':''}" data-save-result="${index}" aria-pressed="${saved}" aria-label="${saved?'Remove':'Save'} ${escapeHtml(d.city)} ${saved?'from':'to'} favourites">${heartIcon}${detail?`<span>${saved?'Saved to favourites':'Save trip'}</span>`:''}</button>`;}
function flightPriceLink(d,p){
  if(d.countryCode==='AQ')return '';
  if(p.departure<dateString(new Date()))return '<p class="booking-caption">Update your saved trip dates to check flight prices.</p>';
  const arrival=P.arrivalAirport(d,p);
  const label=`Check flights${arrival?' to '+arrival:''} ↗`;
  const accessible=`Check current Google Flights prices for ${d.city}${arrival?' via '+arrival:''}`;
  return `<a class="outline-button flight-price-link" href="${escapeHtml(P.links(d,p).flights)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(accessible)}">${label}</a>`;
}
function tripCard(m,p,index,{saved=false}={}){
  m=calculatorMatch(m,p);
  const d=m.destination,photo=destinationPhoto(d),c=m.costs?.total!=null?m.costs:null;
  const tags=d.highlights?.slice(0,2)||[d.countryRecord?.subregion||d.region,'Country guide'];
  return `<article class="trip-choice"><div class="trip-choice-image">${photo?`<img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.caption||d.city+', '+d.country)}" loading="lazy">`:''}<span class="trip-label">${saved?'Saved trip':c?(m.withinBudget?'Within budget':'Above budget'):'Explore this country'}</span>${favouriteButton(d,p,index)}</div><div class="trip-choice-body"><p class="trip-country">${escapeHtml(d.country===d.city?d.region:d.country)}</p><h3>${escapeHtml(d.city)}</h3><p class="trip-tagline">${escapeHtml(d.tagline||'Discover the places, culture, and possibilities.')}</p><div class="detail-tags">${tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>${saved?`<p class="saved-trip-dates">${formatDate(p.departure)} · ${p.nights} nights · ${p.travellers} adult${p.travellers===1?'':'s'}<br>From ${P.origins[p.origin]} · ${P.money(p.budget,p.currency||'EUR')} budget${P.arrivalAirport(d,p)?`<br>Arrival: ${escapeHtml(P.arrivalAirport(d,p))}`:""}</p>`:''}<div class="trip-card-price">${c?`<strong>${P.money(c.total,p.currency||'EUR')}</strong><span>${m.personal?'your estimate':'estimated total'} · ${p.travellers} adult${p.travellers===1?'':'s'}</span>`:'<strong class="unpriced-label">Calculate your trip</strong><span>Enter your own costs in the calculator</span>'}</div><p class="trip-budget-fit ${c&&!m.withinBudget?'over':''}">${c?(m.withinBudget?P.money(c.remaining,p.currency||'EUR')+' left in your budget':P.money(-c.remaining,p.currency||'EUR')+' above your budget'):'Budget fit has not been assessed'}</p><button class="primary-button choose-trip" data-trip-index="${index}">${saved?'Open saved trip':'Choose this trip'} <span aria-hidden="true">↗</span></button>${flightPriceLink(d,p)}${photo?`<p class="trip-photo-credit">${photoCredit(photo)}</p>`:''}</div></article>`;
}
function updateFavouriteButtons(){
  $('#favourites-count').textContent=favourites.list().length;
  $$('[data-save-result]').forEach(button=>{
    if(!button._tripContext)return;
    const {d,p}=button._tripContext,saved=favourites.has(d.id,p);
    button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Remove':'Save'} ${d.city} ${saved?'from':'to'} favourites`);
    if(button.classList.contains('favourite-detail'))button.querySelector('span').textContent=saved?'Saved to favourites':'Save trip';
  });
}
function saveError(error){$('#announcements').textContent=error.message;showDialog(`<p class="eyebrow">FAVOURITES</p><h2 id="dialog-title">We couldn’t save that change.</h2><p>${escapeHtml(error.message)}</p>`);}
function bindTripCards(container,list,settings,open){
  $$('[data-trip-index]',container).forEach(b=>b.onclick=()=>open(Number(b.dataset.tripIndex)));
  $$('[data-save-result]',container).forEach(b=>{
    const i=Number(b.dataset.saveResult),m=list[i],p=Array.isArray(settings)?settings[i]:settings;
    if(!m||!p)return;b._tripContext={d:m.destination,p};
    b.onclick=()=>{try{const saved=favourites.toggle(m.destination.id,b._tripContext.p);updateFavouriteButtons();$('#announcements').textContent=`${m.destination.city} ${saved?'saved to':'removed from'} favourites.`;if(!$('#favourites-panel').hidden)renderFavourites();}catch(e){saveError(e);}};
  });
}
function focusResults(){ $('#results-title').focus({preventScroll:true});$('#results').scrollIntoView({behavior:'instant',block:'start'}); }
function renderTripChoices(){
  const displayed=matches.map(m=>calculatorMatch(m,trip));
  const estimated=displayed.filter(m=>m.costs?.total!=null),affordable=estimated.filter(m=>m.withinBudget);
  const filtered=choiceBudgetOnly?displayed.filter(m=>m.withinBudget):displayed,visible=filtered.slice(0,choiceLimit);
  $('#results-title').textContent='A few ways to get away.';
  $('#results-content').innerHTML=`<div class="choice-intro"><p>Compare your options, save your favourites, then choose the trip that feels like you.</p><span>${matches.length} option${matches.length===1?'':'s'}</span></div>${estimated.length&&!affordable.length?'<div class="match-notice warning"><strong>No estimated trips fit this budget yet.</strong> Try fewer nights, a simpler stay, or a larger budget. You can still compare the options below.</div>':''}${matches.length===1?'<div class="match-notice">One option is available for this country or region. Edit your preferences and leave the country open to compare more destinations.</div>':''}<div class="trip-filterbar"><span>${estimated.length?'Whole-group estimates · check current fares on Google Flights':'Country inspiration · check prices with booking providers'}</span>${estimated.length?`<label><input type="checkbox" id="within-budget-only" ${choiceBudgetOnly?'checked':''}> Within my budget only</label>`:''}</div><div class="trip-choice-grid">${visible.map(m=>tripCard(m,trip,matches.findIndex(item=>item.destination.id===m.destination.id))).join('')||'<div class="empty-favourites"><h3>No trips in this view.</h3><p>Switch off the budget filter or edit your preferences to see more options.</p></div>'}</div>${filtered.length>visible.length?'<div class="load-countries"><button class="outline-button" id="more-trip-options">Show more trip options ↓</button></div>':''}`;
  bindTripCards($('#results-content'),matches,trip,i=>selectDestination(matches[i].destination.id));
  if($('#within-budget-only'))$('#within-budget-only').onchange=e=>{choiceBudgetOnly=e.target.checked;choiceLimit=6;renderTripChoices();$('#within-budget-only')?.focus({preventScroll:true});};
  if($('#more-trip-options'))$('#more-trip-options').onclick=()=>{choiceLimit+=6;renderTripChoices();};
  $('#announcements').textContent=`${filtered.length} trip options. Choose one to see the details.`;
}
function detailToolbar(){return `<div class="detail-toolbar"><button class="text-button" id="back-to-options">← Back to ${matches.length} trip option${matches.length===1?'':'s'}</button>${favouriteButton(matches.find(m=>m.destination.id===selectedId).destination,trip,matches.findIndex(m=>m.destination.id===selectedId),true)}</div>`;}
function bindDetailActions(){
  bindBudgetCalculator();
  bindArrivalAirport();
  $('#back-to-options').onclick=()=>{selectedId=null;renderResults();};
  bindTripCards($('#results-content'),matches,trip,i=>selectDestination(matches[i].destination.id));
}
function savedMatch(entry){
  const d=P.destinations.find(d=>d.id===entry.destinationId);
  if(d){const costs=P.estimate(d,entry.preferences);return {destination:d,costs,withinBudget:costs.total===null?null:costs.total<=entry.preferences.budget};}
  return P.countryMatch(P.countries.find(c=>'country-'+c.code===entry.destinationId));
}
function openSavedTrip(index){
  const entry=favourites.list()[index];if(!entry)return;
  applyForm(entry.preferences);
  try{P.validate(entry.preferences);}catch(error){closeFavourites();$('#results').hidden=true;$('.workspace').hidden=false;$('.intro').hidden=false;showStep(0);showError('This saved trip needs a new departure date. Choose today or a future date to explore it again.');$('#planner').scrollIntoView({behavior:'instant',block:'start'});return;}
  findTrips(entry.preferences);
  // Country guides saved before featured trips were added reopen as the new choices.
  if(matches.some(m=>m.destination.id===entry.destinationId))selectDestination(entry.destinationId);
}
function renderFavourites(){
  const entries=favourites.list(),list=entries.map(savedMatch);
  $('#favourites-error').hidden=!favourites.error();$('#favourites-error').textContent=favourites.error();
  $('#favourites-grid').innerHTML=entries.length?list.map((m,i)=>tripCard(m,entries[i].preferences,i,{saved:true})).join(''):'<div class="empty-favourites"><span aria-hidden="true">♡</span><h3>A little wish list for your next escape.</h3><p>Tap the heart on any trip option to keep it here.</p><button class="primary-button" id="start-finding-trips">Find a trip ↗</button></div>';
  bindTripCards($('#favourites-grid'),list,entries.map(e=>e.preferences),openSavedTrip);
  if($('#start-finding-trips'))$('#start-finding-trips').onclick=closeFavourites;
}
function showFavourites(){
  if($('#favourites-panel').hidden)favouriteReturnToResults=!$('#results').hidden;
  $('.workspace').hidden=true;$('.intro').hidden=true;$('#results').hidden=true;$('#country-explorer').hidden=true;$('#favourites-panel').hidden=false;
  renderFavourites();$('#favourites-title').focus({preventScroll:true});$('#favourites-panel').scrollIntoView({behavior:'instant',block:'start'});
}
function closeFavourites(){
  $('#favourites-panel').hidden=true;$('#country-explorer').hidden=false;
  if(favouriteReturnToResults&&trip){renderResults();}else{$('.workspace').hidden=false;$('.intro').hidden=false;$('#results').hidden=true;$('#form-title').focus({preventScroll:true});$('#planner').scrollIntoView({behavior:'instant',block:'start'});}
}
$('#favourites-button').onclick=showFavourites;$('#close-favourites').onclick=closeFavourites;
window.addEventListener('storage',event=>{if(event.key===TripFavourites.storageKey||event.key===null){favourites.reload();updateFavouriteButtons();if(!$('#favourites-panel').hidden)renderFavourites();}});
updateFavouriteButtons();
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'save_trip_favourite',title:'Save or remove a favourite trip',description:'Save or remove a current trip option in this browser on this device. Keeps its current dates and preferences. Does not book or pay.',inputSchema:{type:'object',properties:{destinationId:{type:'string'},saved:{type:'boolean'}},required:['destinationId','saved'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{const match=matches.find(m=>m.destination.id===input.destinationId);if(!trip||!match||typeof input.saved!=='boolean')throw Error('Choose a destination from the current trip options and a saved state.');if(favourites.has(input.destinationId,trip)!==input.saved)favourites.toggle(input.destinationId,trip);updateFavouriteButtons();return {destinationId:input.destinationId,saved:input.saved,favouriteCount:favourites.list().length};}});
  register({name:'show_trip_favourites',title:'Show saved trips',description:'Open favourites saved in this browser on this device.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{showFavourites();return {count:favourites.list().length};}});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
