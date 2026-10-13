'use strict';
function airportLabel(airport){return `${airport.code} · ${airport.city||airport.name} — ${airport.name}`;}
function renderArrivalAirport(d){
  if(d.countryCode==='AQ')return '';
  const list=P.airportsFor(d).filter(a=>a.code!==trip.origin),selected=P.arrivalAirport(d,trip);
  if(!list.length)return '<p class="airport-help">No scheduled passenger airports are listed for this destination. Choose a suitable gateway on Google Flights and check onward transport.</p>';
  const option=a=>`<option value="${a.code}" ${a.code===selected?'selected':''}>${escapeHtml(airportLabel(a))}</option>`;
  return `<section class="arrival-airport" aria-labelledby="arrival-airport-heading"><h3 id="arrival-airport-heading">Where would you like to land?</h3><label for="airport-search">Search airports in ${escapeHtml(d.country)}</label><input id="airport-search" type="search" placeholder="City, airport name, or code" autocomplete="off" aria-controls="arrival-airport"><label for="arrival-airport">Arrival airport</label><select id="arrival-airport" aria-describedby="airport-help">${d.airport==='NYC'?`<option value="NYC" ${selected==='NYC'?'selected':''}>NYC · New York — All airports</option>`:''}${list.map(option).join('')}</select><p class="airport-count" id="airport-count" role="status">${list.length} airports · popular choices and major airports first</p><p class="airport-help" id="airport-help">${d.airport?`Your stay and planning amounts are based on ${escapeHtml(d.city)}. Allow for transfers if you choose another city. `:''}The selected airport is used for your Google Flights search. Routes and availability are confirmed there.</p><p class="airport-source">Airport data: <a href="https://ourairports.com/data/" target="_blank" rel="noopener noreferrer">OurAirports</a>.</p></section>`;
}
function bindArrivalAirport(){
  const select=$('#arrival-airport');if(!select)return;
  const d=matches.find(m=>m.destination.id===selectedId).destination;
  const options=[...select.options].map(o=>({value:o.value,label:o.textContent}));
  $('#airport-search').addEventListener('input',event=>{
    const query=event.target.value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),selected=P.arrivalAirport(d,trip);
    const filtered=options.filter(o=>o.label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
    const retained=options.find(o=>o.value===selected);
    select.innerHTML=`${retained&&!filtered.some(o=>o.value===selected)?`<option value="${retained.value}" selected>Selected: ${escapeHtml(retained.label)}</option>`:''}${filtered.map(o=>`<option value="${o.value}" ${o.value===selected?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}`;
    $('#airport-count').textContent=query?`${filtered.length} matching airport${filtered.length===1?'':'s'}${!filtered.length?' · try another city or code; your selection is kept':''}`:`${options.length} airports · popular choices and major airports first`;
  });
  select.addEventListener('change',()=>{
    trip=P.validate({...trip,arrivalAirports:{...trip.arrivalAirports,[d.id]:select.value}});
    const link=$('.budget-card .flight-price-link');
    if(link)link.outerHTML=flightPriceLink(d,trip);
    $$('[data-save-result]').forEach(button=>{if(button._tripContext)button._tripContext.p=trip;});
    updateFavouriteButtons();
    $('#announcements').textContent=`Arrival airport changed to ${select.value}. Google Flights search updated.`;
  });
}
