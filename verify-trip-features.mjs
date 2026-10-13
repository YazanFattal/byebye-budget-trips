import assert from 'node:assert/strict';
import './dist/countries.js';
import './dist/featured.js';
import './dist/canada.js';
import './dist/world-photos.js';
import './dist/airports.js';
import './dist/currency-data.js';
import './dist/currency.js';
import './dist/planner.js';
import './dist/favourites.js';
import './dist/budget-calculator.js';
const P=globalThis.TripPlanner,F=globalThis.TripFavourites;
const date=new Date();date.setDate(date.getDate()+45);
const p={budget:4000,origin:'AMS',departure:date.toISOString().slice(0,10),nights:5,travellers:2,vibe:'culture',region:'Asia',country:'any',food:'local',stay:'boutique'};
const matches=P.recommend(p);
assert.equal(matches.length,5);
assert.ok(matches.every(m=>m.destination.region==='Asia'));
for(const m of matches){const c=m.costs;assert.equal(c.total,c.flights+c.hotel+c.food+c.activities+c.buffer);assert.equal(m.withinBudget,c.total<=p.budget);}
assert.equal(P.recommend({...p,budget:200}).filter(m=>m.withinBudget).length,0);
assert.equal(P.recommend({...p,region:'Middle East'}).length,17);
assert.ok(P.middleEast.includes('PS')&&P.middleEast.includes('LB')&&P.middleEast.includes('AE')&&P.middleEast.includes('EG'));
for(const code of P.middleEast){const items=P.recommend({...p,region:'Middle East',country:code});assert.equal(items.length,1);assert.equal(items[0].destination.countryCode,code);assert.equal(items[0].withinBudget,null);}
assert.throws(()=>P.recommend({...p,region:'Middle East',country:'JP'}));
assert.equal(P.countries.length,250);
assert.equal(Object.keys(P.origins).length,P.airports.length+3);
for(const code of ['JFK','DXB','MNL','YYZ','ICN','PEK','HND','SYD','JNB','GRU']){
  const settings={...p,origin:code};
  P.validate(settings);
  const options=P.recommend(settings);
  assert.ok(options.length);
  for(const match of options){
    assert.equal(match.costs.flights,null);
    assert.equal(match.costs.total,null);
    assert.equal(match.withinBudget,null);
    const defaults=TripBudget.defaults(match.costs,settings);
    assert.equal(defaults.flights,'');
    assert.equal(TripBudget.calculate(defaults,settings).status,'incomplete');
    assert.equal(TripBudget.calculate({...defaults,flights:1200},settings).status,'ready');
  }
}
assert.throws(()=>P.validate({...p,origin:'ZZZ'}));
assert.throws(()=>P.validate({...p,origin:''}));
for(const airport of P.airports){assert.ok(P.countries.some(c=>c.code===airport.country));P.validate({...p,origin:airport.code});}
const canadian=P.recommend({...p,region:'North America',country:'CA'});
function decodeFields(bytes){
  let offset=0;const fields=[];
  const readInt=()=>{let value=0,shift=0,byte;do{byte=bytes[offset++];value+=(byte&127)*2**shift;shift+=7;}while(byte&128);return value;};
  while(offset<bytes.length){const tag=readInt(),wire=tag%8,field=Math.floor(tag/8);let value;
    if(wire===0)value=readInt();else if(wire===2){const size=readInt();value=bytes.subarray(offset,offset+size);offset+=size;}else throw Error('Unexpected flight-link encoding');
    fields.push({field,value});
  }return fields;
}
const values=(fields,field)=>fields.filter(v=>v.field===field).map(v=>v.value);
assert.deepEqual(new Set(canadian.map(m=>m.destination.id)),new Set(['toronto','vancouver','banff']));
assert.ok(P.recommend({...p,region:'North America',country:'any'}).some(m=>m.destination.countryCode==='CA'));
assert.ok(P.countries.find(c=>c.code==='CA').popular<=9);
for(const m of canadian){
  const c=m.costs;
  assert.equal(c.total,c.flights+c.hotel+c.food+c.activities+c.buffer);
  const url=new URL(P.links(m.destination,p).flights),fields=decodeFields(Buffer.from(url.searchParams.get('tfs'),'base64url'));
  assert.equal(url.origin,'https://www.google.com');
  assert.equal(url.pathname,'/travel/flights/search');
  assert.equal(url.searchParams.get('curr'),'EUR');
  assert.deepEqual(values(fields,8),[1,1]);
  assert.deepEqual(values(fields,9),[1]);
  assert.deepEqual(values(fields,19),[1]);
  const legs=values(fields,3).map(decodeFields),place=(leg,key)=>values(decodeFields(values(leg,key)[0]),2)[0].toString();
  assert.deepEqual(legs.map(leg=>values(leg,2)[0].toString()),[p.departure,P.checkout(p)]);
  assert.deepEqual(legs.map(leg=>[place(leg,13),place(leg,14)]),[['AMS',m.destination.airport],[m.destination.airport,'AMS']]);
}
const londonFields=decodeFields(Buffer.from(new URL(P.links(canadian[0].destination,{...p,origin:'LON',travellers:8}).flights).searchParams.get('tfs'),'base64url'));
assert.equal(values(londonFields,8).length,8);
assert.equal(values(decodeFields(values(decodeFields(values(londonFields,3)[0]),13)[0]),2)[0].toString(),'/m/04jpl');
for(const travellers of [1,2,8]){
  const capped={...p,travellers,flightMaxEUR:500},urls=P.links(canadian[0].destination,capped),url=new URL(urls.flights);
  const fields=decodeFields(Buffer.from(url.searchParams.get('tfs'),'base64url'));
  assert.deepEqual(values(fields,12),[]);
  assert.equal(values(fields,8).length,travellers);
  assert.equal(url.searchParams.get('curr'),'EUR');
  assert.equal(new URL(urls.hotels).searchParams.get('selected_currency'),'EUR');
}
assert.deepEqual(values(londonFields,12),[]);
assert.equal(P.validate({...p,flightMaxEUR:750}).flightMaxEUR,undefined);
assert.equal(P.airports.length,new Set(P.airports.map(a=>a.code)).size);
for(const code of ['BKK','HKT','MNL','CEB','ICN','PEK','PVG','HND','NRT','JFK','LAX','YYZ','YVR','DXB','DOH','AMM'])assert.ok(P.airports.some(a=>a.code===code),code);
const japan=P.destinations.find(d=>d.countryCode==='JP'),chosen={...p,arrivalAirports:{[japan.id]:'HND'},flightMaxEUR:500};
P.validate(chosen);
const chosenUrl=new URL(P.links(japan,chosen).flights),chosenFields=decodeFields(Buffer.from(chosenUrl.searchParams.get('tfs'),'base64url'));
assert.equal(chosenUrl.searchParams.get('curr'),'EUR');
for(const currency of TripCurrency.codes){
  const pref={...chosen,currency,flightMaxEUR:500/TripCurrency.rate(currency)};
  P.validate(pref);
  assert.ok(Number.isFinite(TripCurrency.rate(currency))&&TripCurrency.rate(currency)>0);
  assert.ok(!TripCurrency.money(500,currency).includes('NaN'));
  const url=new URL(P.links(japan,pref).flights),fields=decodeFields(Buffer.from(url.searchParams.get('tfs'),'base64url'));
  assert.equal(url.searchParams.get('curr'),TripCurrency.flightCurrency(currency));
  assert.deepEqual(values(fields,12),[]);
  assert.equal(new URL(P.links(japan,pref).hotels).searchParams.get('selected_currency'),currency);
}
assert.throws(()=>P.validate({...p,currency:'FAKE'}));
assert.equal(TripCurrency.flightCurrency('AFN'),'EUR');
assert.equal(TripCurrency.flightCurrency('JPY'),'JPY');
const chosenLegs=values(chosenFields,3).map(decodeFields),airport=(leg,key)=>values(decodeFields(values(leg,key)[0]),2)[0].toString();
for(const origin of ['JFK','DXB','MNL','YYZ','ICN','PEK','SYD','JNB','GRU']){
  const fields=decodeFields(Buffer.from(new URL(P.links(japan,{...chosen,origin,flightMaxEUR:500}).flights).searchParams.get('tfs'),'base64url'));
  const legs=values(fields,3).map(decodeFields);
  assert.deepEqual(legs.map(leg=>[airport(leg,13),airport(leg,14)]),[[origin,'HND'],['HND',origin]]);
  assert.deepEqual(values(fields,12),[]);
}
assert.deepEqual(chosenLegs.map(leg=>[airport(leg,13),airport(leg,14)]),[['AMS','HND'],['HND','AMS']]);
assert.deepEqual(values(chosenFields,12),[]);
assert.throws(()=>P.validate({...p,arrivalAirports:{[japan.id]:'DXB'}}));
assert.throws(()=>P.validate({...p,arrivalAirports:{'country-NL':'AMS'}}));
const dubai=P.countryMatch(P.countries.find(c=>c.code==='AE')).destination;
assert.equal(P.arrivalAirport(dubai,p),'DXB');
const noAirport=P.countryMatch(P.countries.find(c=>c.code==='VA')).destination;
assert.equal(P.arrivalAirport(noAirport,p),undefined);
for(const country of P.countries){const items=P.recommend({...p,region:'any',country:country.code});assert.ok(items.length);assert.ok(items.every(m=>m.destination.countryCode===country.code));}
const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
let store=F.create(storage);
store.toggle(japan.id,{...p,origin:'DXB'});store=F.create(storage);
assert.equal(store.list()[0].preferences.origin,'DXB');
store.toggle(japan.id,{...p,origin:'DXB'});
store.toggle(japan.id,chosen);store=F.create(storage);
assert.equal(store.list()[0].preferences.arrivalAirports[japan.id],'HND');
const airportCopy=store.list();airportCopy[0].preferences.arrivalAirports[japan.id]='NRT';
assert.equal(store.list()[0].preferences.arrivalAirports[japan.id],'HND');
assert.ok(!store.has(japan.id,{...chosen,arrivalAirports:{[japan.id]:'NRT'}}));
store.toggle(japan.id,chosen);
store.toggle(japan.id,{...chosen,currency:'AED'});store=F.create(storage);
assert.equal(store.list()[0].preferences.currency,'AED');
assert.ok(!store.has(japan.id,chosen));
store.toggle(japan.id,{...chosen,currency:'AED'});
store.toggle('seoul',{...p,flightMaxEUR:500});
store=F.create(storage);
assert.equal(store.list()[0].preferences.flightMaxEUR,undefined);
assert.ok(store.has('seoul',{...p,flightMaxEUR:500}));
assert.ok(store.has('seoul',p));
store.toggle('seoul',{...p,flightMaxEUR:500});
assert.equal(store.toggle('bangkok',p),true);
assert.equal(store.list().length,1);
assert.equal(store.has('bangkok',p),true);
store=F.create(storage);
assert.deepEqual(store.list()[0].preferences,p);
assert.equal(store.toggle('seoul',p),true);
assert.equal(store.list().length,2);
assert.equal(store.toggle('bangkok',p),false);
assert.equal(store.list().length,1);
assert.equal(store.has('bangkok',p),false);
assert.equal(store.toggle('seoul',{...p,budget:3000}),true);
assert.equal(store.list().length,2);
const copy=store.list();copy[0].preferences.budget=99999;
assert.notEqual(store.list()[0].preferences.budget,99999);
assert.throws(()=>store.toggle('made-up-trip',p));
assert.throws(()=>store.toggle('seoul',{...p,region:'Middle East'}));
const old={destinationId:'seoul',preferences:{...p,departure:'2020-01-02'}};
storage.setItem(F.storageKey,JSON.stringify([{destinationId:'seoul',preferences:{...p,flightMaxUSD:500}}]));
store=F.create(storage);
assert.equal(store.list().length,1);assert.equal(store.list()[0].preferences.flightMaxEUR,undefined);assert.equal(store.list()[0].preferences.flightMaxUSD,undefined);
storage.setItem(F.storageKey,JSON.stringify([old,old,{destinationId:'unknown',preferences:p}]));
store=F.create(storage);assert.equal(store.list().length,1);assert.equal(store.list()[0].preferences.departure,'2020-01-02');
assert.throws(()=>P.validate(store.list()[0].preferences));
storage.setItem(F.storageKey,'not valid JSON');store=F.create(storage);assert.equal(store.list().length,0);assert.ok(store.error());
const blocked=F.create({getItem:()=>null,setItem:()=>{throw Error('Blocked');}});
assert.throws(()=>blocked.toggle('bangkok',p),/could not save/);assert.equal(blocked.list().length,0);
const denied=F.create({getItem:()=>{throw Error('Denied');},setItem:()=>{throw Error('Denied');}});assert.ok(denied.error());
console.log('PASS: regional filtering, all 250 countries, price totals, favourites persistence, removal, preference identity, expired dates, invalid data, blocked storage.');
