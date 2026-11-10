import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import './dist/countries.js';
import './dist/featured.js';
import './dist/canada.js';
import './dist/world-photos.js';
import './dist/country-photos.js';
import './dist/airports.js';
import './dist/currency-data.js';
import './dist/currency.js';
import './dist/planner.js';
import './dist/journey-engine.js';

const J=globalThis.ByeByeJourney;
const p={...J.defaults(),budget:2000,departure:'2090-04-12'};
const family={...p,groupType:'family',children:[{age:8,seat:'lap'}]};
assert.deepEqual(J.validate(family),family);
assert.match(J.validateStep({...family,children:[{age:null}]},4),/age/);
assert.match(J.validateStep({...family,adults:1,children:[{age:0,seat:'lap'},{age:1,seat:'lap'}]},4),/adult/);
assert.match(J.validateStep({...p,rooms:3},4),/room/);
assert.match(J.validateStep({...p,interests:['any','beach']},5),/Surprise/);
assert.match(J.validateStep({...p,departure:'2090-02-30'},3),/valid/);
assert.equal(J.returnDate({...p,departure:'2092-02-28',nights:2}),'2092-03-01');
assert.throws(()=>J.validate({...p,region:'Europe',country:'JP'}));

const values={flights:500,nightly:100,rooms:1,foodDaily:20,transport:90,activities:120,extras:50,buffer:10};
const total=J.calculate(values,family);
assert.equal(total.parts.accommodation,500);
assert.equal(total.parts.food,360);
assert.equal(total.subtotal,1620);
assert.equal(total.buffer,162);
assert.equal(total.total,1782);
assert.equal(total.perPerson,594);
assert.equal(total.remaining,218);
assert.equal(total.withinBudget,true);
assert.equal(J.calculate(values,{...family,budget:1781}).withinBudget,false);
assert.equal(J.calculate(values,{...family,currency:'JPY'}).total,1782,'Currency changes do not change the underlying EUR amount');
for(const field of ['flights','nightly','foodDaily','transport','activities','extras']){
  const incomplete=J.calculate({...values,[field]:''},family);
  assert.equal(incomplete.total,null);
  assert.equal(incomplete.withinBudget,null);
}
for(const patch of [{flights:-1},{foodDaily:NaN},{nightly:Infinity},{rooms:3},{rooms:1.5},{buffer:101}]){
  const invalid=J.calculate({...values,...patch},family);
  assert.equal(invalid.status,'invalid');assert.equal(invalid.total,null);
}
assert.equal(J.calculate({flights:0,nightly:0,rooms:1,foodDaily:0,transport:0,activities:0,extras:0,buffer:0},p).total,0);
const banff=J.destination('banff');
assert.equal(J.initialCosts(banff,family).flights,'','Family fares must not extrapolate adult route prices');
const unknown={...p,originCountry:'AE',origin:'DXB'};
assert.equal(J.calculate(J.initialCosts(banff,unknown),unknown).total,null);
assert.equal(J.initialCosts(banff,{...p,arrivalAirports:{banff:'YVR'}}).flights,'');
assert.equal(J.calculate(J.initialCosts(J.destination('dubai'),p),p).total,null);
assert.equal(J.destination('country-XX'),null);

const northAmerica=J.recommend({...unknown,region:'North America',interests:['nature','adventure'],pace:'relaxed'});
assert.equal(northAmerica[0].destination.id,'banff');
assert.ok(northAmerica.every(m=>m.destination.region==='North America'));
assert.ok(J.recommend({...p,region:'Middle East'}).some(m=>m.destination.id==='muscat'));
assert.ok(J.recommend({...p,region:'Middle East'}).every(m=>J.P.middleEast.includes(m.destination.countryCode)));
const japan={...p,country:'JP',region:'Asia'};
const japanese=J.recommend(japan);
assert.ok(japanese.every(m=>m.destination.countryCode==='JP'));
const alternatives=J.alternatives(japan,japanese[0].destination.id);
assert.equal(alternatives.length,3);
assert.equal(new Set(alternatives.map(m=>m.destination.id)).size,3);
assert.ok(alternatives.every(m=>m.broader));
const broaderPreferences=J.preferencesForDestination(japan,J.destination('bangkok'));
assert.equal(broaderPreferences.country,'any');
assert.equal(broaderPreferences.region,'Asia');
assert.equal(japan.country,'JP','Saving an alternative must not change the current selection');
assert.equal(J.preferencesForDestination(japan,banff).region,'any');
for(const c of J.P.countries){
  const match=J.recommend({...p,country:c.code,region:'any'})[0];
  assert.equal(match.destination.countryCode,c.code);
  const photo=J.photo(match.destination);
  assert.ok(photo?.image&&photo.credit&&photo.source,`Missing credited photo for ${c.name}`);
  await fs.access(new URL('./dist/'+photo.image,import.meta.url));
}
assert.equal(J.P.countries.length,250);

// Independently decode the URL payload to verify provider passenger categories and route details.
function fields(bytes){
  let pos=0;const out=[];
  const integer=()=>{let n=0,shift=0,b;do{b=bytes[pos++];n+=(b&127)*2**shift;shift+=7;}while(b&128);return n;};
  while(pos<bytes.length){const tag=integer(),field=tag>>3,wire=tag&7;
    if(wire===0)out.push({field,value:integer()});
    else if(wire===2){const size=integer();out.push({field,value:bytes.subarray(pos,pos+size)});pos+=size;}
    else throw Error('Unexpected wire type');
  }return out;
}
const mixed={...p,adults:2,rooms:2,groupType:'family',children:[{age:13,seat:'lap'},{age:8,seat:'lap'},{age:1,seat:'seat'},{age:0,seat:'lap'}]};
const urls=J.links(banff,mixed),google=new URL(urls.flights),booking=new URL(urls.hotels);
const payload=fields(Buffer.from(google.searchParams.get('tfs'),'base64url'));
assert.deepEqual(payload.filter(f=>f.field===8).map(f=>f.value),[1,1,1,2,3,4]);
assert.ok(!payload.some(f=>f.field===12),'No maximum flight price filter');
const legs=payload.filter(f=>f.field===3).map(f=>fields(f.value));
assert.equal(legs.length,2);
const text=f=>Buffer.from(f.value).toString();
assert.equal(text(legs[0].find(f=>f.field===2)),'2090-04-12');
assert.equal(text(legs[1].find(f=>f.field===2)),'2090-04-17');
const place=(leg,field)=>text(fields(leg.find(f=>f.field===field).value).find(f=>f.field===2));
assert.equal(place(legs[0],13),'AMS');assert.equal(place(legs[0],14),'YYC');
assert.equal(place(legs[1],13),'YYC');assert.equal(place(legs[1],14),'AMS');
assert.equal(booking.searchParams.get('group_adults'),'2');
assert.equal(booking.searchParams.get('group_children'),'4');
assert.deepEqual(booking.searchParams.getAll('age'),['13','8','1','0']);
assert.equal(booking.searchParams.get('no_rooms'),'2');
assert.equal(booking.searchParams.get('checkout'),'2090-04-17');
assert.equal(booking.searchParams.get('selected_currency'),'EUR');
assert.equal(new URL(J.links(banff,{...p,currency:'AFN'}).flights).searchParams.get('curr'),J.C.flightCurrency('AFN'));

const legacy={budget:2000,currency:'EUR',origin:'AMS',departure:p.departure,nights:5,travellers:2,vibe:'culture',region:'any',country:'any',food:'local',stay:'boutique'};
const backing=new Map([[J.storageKey,JSON.stringify([{destinationId:'kyoto',preferences:legacy}])]]);
const memory={getItem:key=>backing.get(key)||null,setItem:(key,value)=>backing.set(key,value)};
const store=J.createStore(memory);
assert.equal(store.list().length,1);
assert.equal(store.list()[0].preferences.adults,2);
assert.equal(store.list()[0].preferences.originCountry,'NL');
assert.deepEqual(store.list()[0].preferences.interests,['culture']);
assert.equal(store.toggle('banff',family,values),true);
const broadStore=J.createStore({getItem:()=>null,setItem:()=>{}});
assert.equal(broadStore.toggle('bangkok',broaderPreferences),true);
assert.equal(broadStore.list()[0].destinationId,'bangkok');
const reloaded=J.createStore(memory);
assert.equal(reloaded.list().length,2);
assert.equal(reloaded.list()[0].calculator.flights,500);
const copied=reloaded.list();copied[0].calculator.flights=10000;
assert.equal(reloaded.list()[0].calculator.flights,500);
assert.equal(reloaded.toggle('banff',family),false);
assert.equal(reloaded.list().length,1);
let attemptedWrite=false;
const damaged=J.createStore({getItem:()=>'{broken',setItem:()=>{attemptedWrite=true;}});
assert.throws(()=>damaged.toggle('banff',p));assert.equal(attemptedWrite,false);
const blocked=J.createStore({getItem:()=>null,setItem:()=>{throw Error('Blocked');}});
assert.throws(()=>blocked.toggle('banff',p),/could not save/);assert.equal(blocked.list().length,0);

const html=await fs.readFile(new URL('./dist/index.html',import.meta.url),'utf8');
for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)){
  assert.ok(!asset.startsWith('/'),'Published assets must work under a GitHub Pages subpath');
  await fs.access(new URL('./dist/'+asset,import.meta.url));
}
console.log('PASS: guided preferences, 250 country photos, recommendation matching, three alternatives, incomplete budgets, family passenger encoding, booking details, and saved-trip compatibility.');
