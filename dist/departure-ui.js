'use strict';
const departureCountries=[...P.countries].sort((a,b)=>a.popular-b.popular||a.name.localeCompare(b.name));
$('#origin-country').innerHTML='<option value="any">All countries & territories</option>'+departureCountries.map(c=>`<option value="${c.code}">${escapeHtml(c.name)}</option>`).join('');
const departureLabel=a=>`${a.code} · ${a.city||a.name} — ${a.name}${$('#origin-country').value==='any'?' · '+(P.countries.find(c=>c.code===a.country)?.name||a.country):''}`;
const departureEntries=[...P.airports,...P.legacyOriginAirports];
function populateDepartureAirports({keep=true}={}){
  const country=$('#origin-country').value,query=$('#origin-search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const list=departureEntries.filter(a=>country==='any'||a.country===country),previous=keep?$('#origin').value:null;
  const selected=list.some(a=>a.code===previous)?previous:list[0]?.code||'';
  const filtered=list.filter(a=>`${a.code} ${a.city} ${a.name} ${P.countries.find(c=>c.code===a.country)?.name||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
  const retained=list.find(a=>a.code===selected);
  $('#origin').innerHTML=(retained&&!filtered.some(a=>a.code===selected)?`<option value="${selected}" selected>Selected: ${escapeHtml(departureLabel(retained))}</option>`:'')+filtered.map(a=>`<option value="${a.code}" ${a.code===selected?'selected':''}>${escapeHtml(departureLabel(a))}</option>`).join('');
  $('#origin').disabled=!list.length;
  if(!list.length){$('#origin').innerHTML='<option value="">No passenger airports listed</option>';$('#origin-help').textContent='No scheduled passenger airport is listed here. Choose a nearby country and an airport you can reach.';}
  else $('#origin-help').textContent=query?`${filtered.length} matching departure airport${filtered.length===1?'':'s'}.${filtered.length?' Choose your departure airport.':' Try another search; your selected airport is kept.'}`:`${list.length} departure choices · popular airports first. Search by city, airport name, or code.`;
}
function applyDeparture(origin){
  const airport=departureEntries.find(a=>a.code===origin);
  $('#origin-country').value=airport?.country||'any';$('#origin-search').value='';
  populateDepartureAirports({keep:false});$('#origin').value=origin;
}
$('#origin-country').onchange=()=>{$('#origin-search').value='';populateDepartureAirports({keep:false});};
$('#origin-search').addEventListener('input',()=>populateDepartureAirports());
applyDeparture('AMS');
