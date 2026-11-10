'use strict';
globalThis.ByeByeJourney=(()=>{
  const P=TripPlanner,C=TripCurrency,round=n=>Math.round((n+Number.EPSILON)*100)/100;
  const interests={beach:'Beaches',city:'City breaks',nature:'Nature',culture:'Culture & history',adventure:'Adventure',relaxation:'Relaxation',food:'Food',nightlife:'Nightlife',any:'Surprise me'};
  const foods={local:'Local food',vegetarian:'Vegetarian',vegan:'Vegan',halal:'Halal',seafood:'Seafood',any:'No preference'};
  const stays={budget:'Budget stay',comfortable:'Comfortable hotel',boutique:'Boutique stay',luxury:'Luxury'};
  const paces={relaxed:'Relaxed',balanced:'Balanced',packed:'Packed with activities'};
  const regions=['any','Asia','Europe','Africa','North America','South America','Oceania','Middle East'];
  const extraTags={lisbon:['city','food','relaxation','nightlife'],barcelona:['city','food','nightlife'],marrakech:['city','food'],budapest:['city','relaxation','nightlife'],split:['adventure','relaxation'],ljubljana:['city','relaxation'],bangkok:['city','food','nightlife'],palawan:['adventure','relaxation'],seoul:['city','food','nightlife'],beijing:['city','food'],kyoto:['food','relaxation'],newyork:['city','food','nightlife'],rio:['adventure','nightlife'],capetown:['adventure','food'],sydney:['city','food'],toronto:['city','food','nightlife'],vancouver:['adventure','city','food'],banff:['adventure','relaxation']};
  const destinations=P.destinations.map(d=>({...d,tags:[...new Set([...d.vibes,...(extraTags[d.id]||[])])],suggestedNights:['palawan','banff','sydney'].includes(d.id)?7:5}));
  for(const item of [
    {id:'dubai',city:'Dubai',countryCode:'AE',airport:'DXB',tags:['city','beach','food','relaxation'],description:'Pair the lanes and creek crossings of old Dubai with beach time and the modern skyline. Choose a few neighbourhoods to explore at your own pace.',highlights:['Dubai Creek & old neighbourhoods','Beach time','Skyline views'],guide:'https://www.visitdubai.com/',suggestedNights:5},
    {id:'muscat',city:'Muscat',countryCode:'OM',airport:'MCT',tags:['culture','beach','nature','relaxation'],description:'Walk the Mutrah waterfront, browse the souq, and leave space for Oman’s coast and mountain scenery. Muscat makes a base for slower days and carefully planned excursions.',highlights:['Mutrah Corniche','Souq browsing','Coastal scenery'],guide:'https://experienceoman.om/',suggestedNights:5}
  ]){const c=P.countries.find(c=>c.code===item.countryCode);destinations.push({...item,country:c.name,region:'Middle East',popular:c.popular,...CountryPhotos[c.code],foods:[]});}
  const dateKey=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  function defaults(){const d=new Date();d.setDate(d.getDate()+30);return {version:2,currency:'EUR',budget:2000,originCountry:'NL',origin:'AMS',departure:dateKey(d),nights:5,groupType:'couple',adults:2,children:[],rooms:1,interests:['any'],region:'any',country:'any',pace:'balanced',food:'any',stay:'comfortable',arrivalAirports:{}};}
  function normalise(raw={}){
    const base=defaults(),legacy=raw.version!==2;
    return {...base,...raw,version:2,currency:raw.currency||'EUR',children:structuredClone(raw.children||[]),interests:[...(raw.interests||(raw.vibe?[raw.vibe]:['any']))],arrivalAirports:{...raw.arrivalAirports},adults:raw.adults??raw.travellers??2,groupType:raw.groupType||(raw.travellers===1?'solo':'couple'),rooms:raw.rooms??Math.ceil((raw.adults??raw.travellers??2)/2),stay:legacy?({simple:'budget',comfort:'luxury',boutique:'boutique'}[raw.stay]||raw.stay||'comfortable'):raw.stay,originCountry:raw.originCountry||P.airports.find(a=>a.code===raw.origin)?.country||P.legacyOriginAirports.find(a=>a.code===raw.origin)?.country||base.originCountry};
  }
  const count=p=>p.adults+p.children.length;
  const returnDate=p=>{const d=new Date(p.departure+'T12:00:00');d.setDate(d.getDate()+Number(p.nights));return dateKey(d);};
  function validateStep(p,step,{allowPast=false}={}){
    if(step===1){if(!C.codes.includes(p.currency))return 'Choose a currency from the list.';if(!Number.isFinite(p.budget)||p.budget<=0||p.budget>1000000)return 'Enter a budget greater than zero, up to the equivalent of €1,000,000.';}
    if(step===2){if(!P.countries.some(c=>c.code===p.originCountry))return 'Choose a departure country or territory.';if(!P.airports.some(a=>a.code===p.origin&&a.country===p.originCountry)&&!P.legacyOriginAirports.some(a=>a.code===p.origin&&a.country===p.originCountry))return 'Choose an airport in your departure country, or a nearby country with an airport you can reach.';}
    if(step===3){const d=new Date(p.departure+'T12:00:00');if(!/^\d{4}-\d{2}-\d{2}$/.test(p.departure)||!Number.isFinite(d.getTime())||dateKey(d)!==p.departure||(!allowPast&&p.departure<dateKey(new Date())))return 'Choose a valid departure date today or later.';if(!Number.isInteger(p.nights)||p.nights<1||p.nights>30)return 'Choose a stay from 1 to 30 nights.';}
    if(step===4){if(!['solo','couple','friends','family'].includes(p.groupType))return 'Choose your travel group.';if(!Number.isInteger(p.adults)||p.adults<1||p.adults>9||count(p)>9)return 'Choose at least 1 adult and no more than 9 travellers in total.';if(!Number.isInteger(p.rooms)||p.rooms<1||p.rooms>p.adults)return 'Choose between 1 room and one room per adult.';if(p.children.some(c=>!Number.isInteger(c.age)||c.age<0||c.age>17))return 'Choose every child’s age on the return date.';if(p.children.some(c=>c.age<2&&!['lap','seat'].includes(c.seat)))return 'Choose a lap or separate seat for each infant.';if(p.children.filter(c=>c.age<2&&c.seat==='lap').length>p.adults)return 'Each infant travelling on a lap needs an adult.';}
    if(step===5&&(!Array.isArray(p.interests)||!p.interests.length||p.interests.some(x=>!Object.hasOwn(interests,x))||(p.interests.includes('any')&&p.interests.length>1)))return 'Choose at least one escape style, or Surprise me.';
    if(step===6){if(![...regions,'Antarctica'].includes(p.region))return 'Choose a region.';const c=P.countries.find(c=>c.code===p.country);if(p.country!=='any'&&(!c||!P.inRegion(c,p.region)))return 'Choose a country in your selected region, or Anywhere.';}
    if(step===7&&!Object.hasOwn(paces,p.pace))return 'Choose your travel pace.';
    if(step===8&&!Object.hasOwn(foods,p.food))return 'Choose a food preference.';
    if(step===9&&!Object.hasOwn(stays,p.stay))return 'Choose an accommodation style.';
    return '';
  }
  function validate(input,options){const p=normalise(input);for(let step=1;step<=9;step++){const message=validateStep(p,step,options);if(message)throw Object.assign(Error(message),{step});}return p;}
  function countryDestination(c){const photo=CountryPhotos[c.code];return {id:'country-'+c.code,city:c.name,country:c.name,countryCode:c.code,region:c.continent,countryRecord:c,popular:c.popular,tags:[],foods:[],description:`Explore ${c.name} and build a trip around your own plans. Choose an arrival airport and enter provider prices to see how your budget adds up.`,highlights:[],...photo,guide:photo?.sourceArticle,suggestedNights:null};}
  function destination(id){const featured=destinations.find(d=>d.id===id);if(featured)return featured;const c=id?.startsWith('country-')?P.countries.find(c=>c.code===id.slice(8)):null;return c?countryDestination(c):null;}
  function photo(d){return d.image?d:CountryPhotos[d.countryCode];}
  function arrival(d,p){const selected=p.arrivalAirports?.[d.id];return selected&&P.airports.some(a=>a.code===selected&&a.country===d.countryCode&&a.code!==p.origin)?selected:d.airport&&d.airport!==p.origin?d.airport:P.airportsFor(d).find(a=>a.code!==p.origin)?.code;}
  function initialCosts(d,p){
    const base={flights:'',nightly:'',rooms:p.rooms,foodDaily:'',transport:'',activities:'',extras:0,buffer:12};
    if(!d.hotel)return base;
    const oldStay={budget:'simple',comfortable:'boutique',boutique:'boutique',luxury:'comfort'}[p.stay];
    const estimate=P.estimate(d,{...p,travellers:count(p),stay:oldStay});
    // Family fares and changed arrival airports cannot be extrapolated from adult route assumptions.
    const changed=arrival(d,p)!==d.airport;
    base.flights=!p.children.length&&!changed&&estimate.flights!=null?estimate.flights:'';
    base.nightly=estimate.nightly;base.foodDaily=round(estimate.food/((p.nights+1)*count(p)));
    const activityFactor={relaxed:.75,balanced:1,packed:1.4}[p.pace];
    base.transport=round(estimate.activities*.4);base.activities=round(estimate.activities*.6*activityFactor);
    return base;
  }
  function calculate(values,p){
    const fields=['flights','nightly','rooms','foodDaily','transport','activities','extras','buffer'],numbers={},missing=[],errors={};
    for(const key of fields){const raw=values[key];if(raw==null||String(raw).trim()===''){missing.push(key);continue;}const n=Number(raw),max=key==='rooms'?p.adults:key==='buffer'?100:1000000;if(!Number.isFinite(n)||n<(key==='rooms'?1:0)||n>max||(key==='rooms'&&!Number.isInteger(n)))errors[key]=key==='rooms'?`Use 1–${p.adults} whole rooms, with at least one adult per room.`:key==='buffer'?'Use 0–100%.':'Enter an amount from 0 to 1,000,000 euros equivalent.';else numbers[key]=n;}
    const n=numbers,parts={flights:n.flights??null,accommodation:n.nightly!=null&&n.rooms!=null?round(n.nightly*n.rooms*p.nights):null,food:n.foodDaily!=null?round(n.foodDaily*(p.nights+1)*count(p)):null,transport:n.transport??null,activities:n.activities??null,extras:n.extras??null};
    const subtotal=round(Object.values(parts).reduce((sum,n)=>sum+(n??0),0)),ready=!missing.length&&!Object.keys(errors).length,buffer=ready?round(subtotal*n.buffer/100):null,total=ready?round(subtotal+buffer):null;
    return {status:Object.keys(errors).length?'invalid':ready?'ready':'incomplete',missing,errors,parts,subtotal,buffer,total,perPerson:ready?round(total/count(p)):null,remaining:ready?round(p.budget-total):null,withinBudget:ready?total<=p.budget:null};
  }
  function reasons(d,p,costs){
    const result=[],shared=p.interests.filter(i=>i!=='any'&&d.tags.includes(i));
    if(shared.length)result.push(`${shared.map(i=>interests[i].toLowerCase()).join(' + ')} match your escape style.`);
    if(p.country!=='any')result.push(`${d.country} is the country you chose.`);else if(p.region!=='any')result.push(`A place to explore in your chosen ${p.region} region.`);
    if(p.pace==='relaxed')result.push(`Keep your ${p.nights} nights flexible, with one main outing a day.`);
    if(p.pace==='packed')result.push(`Build ${p.nights} nights around ${d.highlights?.slice(0,2).join(' and ')||'your favourite experiences'}.`);
    if(p.pace==='balanced')result.push(`Balance ${p.nights} nights of exploring with time to wander.`);
    if(costs.withinBudget===true)result.push(`The illustrative planning total leaves ${C.money(costs.remaining,p.currency)} within your budget.`);
    if(!shared.length&&p.interests[0]!=='any')result.push('A broader match: this destination does not cover every selected interest.');
    return result.slice(0,4);
  }
  function recommend(input){
    const p=validate(input),eligible=destinations.filter(d=>(p.region==='any'||(p.region==='Middle East'?P.middleEast.includes(d.countryCode):d.region===p.region))&&(p.country==='any'||d.countryCode===p.country)&&d.airport!==p.origin);
    if(p.country!=='any'&&!eligible.length)eligible.push(countryDestination(P.countries.find(c=>c.code===p.country)));
    if(!eligible.length)eligible.push(...P.countries.filter(c=>P.inRegion(c,p.region)).sort((a,b)=>a.popular-b.popular).slice(0,12).map(countryDestination));
    return eligible.map(d=>{const inputs=initialCosts(d,p),costs=calculate(inputs,p),shared=p.interests.filter(i=>d.tags.includes(i)),foodMatch=p.food!=='any'&&d.foods?.includes(p.food),paceMatch=p.pace==='relaxed'&&d.tags.includes('relaxation')||p.pace==='packed'&&(d.tags.includes('adventure')||d.tags.includes('city'));
      return {destination:d,inputs,costs,score:shared.length*25+(foodMatch?6:0)+(paceMatch?8:0),reasons:reasons(d,p,costs)};
    }).sort((a,b)=>{
      const fit=m=>m.costs.withinBudget===true?2:m.costs.withinBudget===null?1:0;
      return fit(b)-fit(a)||b.score-a.score||(a.costs.withinBudget===false&&b.costs.withinBudget===false?a.costs.total-b.costs.total:0)||(a.destination.popular??999)-(b.destination.popular??999);
    });
  }
  function passengers(p){return [...Array(p.adults).fill(1),...p.children.map(c=>c.age>=12?1:c.age>=2?2:c.seat==='seat'?3:4)];}
  function preferencesForDestination(p,d){
    const next={...p},c=P.countries.find(c=>c.code===d.countryCode);
    if(next.country!=='any'&&next.country!==d.countryCode)next.country='any';
    if(!P.inRegion(c,next.region))next.region='any';
    return next;
  }
  function alternatives(p,id){
    const list=recommend(p).filter(m=>m.destination.id!==id);
    for(const preferences of [{...p,country:'any'},{...p,country:'any',region:'any'}]){
      if(list.length>=3)break;
      for(const m of recommend(preferences))if(m.destination.id!==id&&!list.some(x=>x.destination.id===m.destination.id)){list.push({...m,broader:true});if(list.length>=3)break;}
    }
    return list.slice(0,3);
  }
  function flightData(d,p){
    const num=n=>{const bytes=[];do{let b=n&127;n=Math.floor(n/128);bytes.push(b|(n?128:0));}while(n);return bytes;},int=(f,v)=>[...num(f*8),...num(v)],msg=(f,b)=>[...num(f*8+2),...num(b.length),...b],str=(f,s)=>msg(f,[...new TextEncoder().encode(s)]),cities={LON:'/m/04jpl',PAR:'/m/05qtj',ROM:'/m/06c62',NYC:'/m/02_286'},place=code=>[...int(1,cities[code]?3:1),...str(2,cities[code]||code)],to=arrival(d,p),leg=(date,a,b)=>[...str(2,date),...(a?msg(13,place(a)):[]),...(b?msg(14,place(b)):[])];
    const bytes=[...int(1,28),...int(2,2),...msg(3,leg(p.departure,p.origin,to)),...msg(3,leg(returnDate(p),to,p.origin)),...passengers(p).flatMap(n=>int(8,n)),...int(9,1),...int(19,1)];return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function links(d,p,rooms=p.rooms){
    const hotels=new URL('https://www.booking.com/searchresults.html');hotels.search=new URLSearchParams({ss:d.hotelSearch||(d.city===d.country?d.country:d.city+', '+d.country),checkin:p.departure,checkout:returnDate(p),group_adults:String(p.adults),group_children:String(p.children.length),no_rooms:String(rooms),selected_currency:p.currency}).toString();p.children.forEach(c=>hotels.searchParams.append('age',String(c.age)));
    const flights=new URL('https://www.google.com/travel/flights'+(arrival(d,p)?'/search':''));flights.search=new URLSearchParams({tfs:flightData(d,p),curr:C.flightCurrency(p.currency),hl:'en'}).toString();return {hotels:hotels.href,flights:flights.href};
  }
  const storageKey='byebye.favourite-trips.v1';
  const identity=(id,p)=>JSON.stringify([id,p.budget,p.currency,p.origin,p.departure,p.nights,p.adults,p.children,p.rooms,[...p.interests].sort(),p.region,p.country,p.pace,p.food,p.stay,p.arrivalAirports?.[id]||'']);
  function createStore(storage){
    let entries=[],error='';
    const clean=e=>{if(!e||!destination(e.destinationId)||!e.preferences)return null;try{const p=validate(e.preferences,{allowPast:true});if(p.country!=='any'&&destination(e.destinationId).countryCode!==p.country)return null;return {destinationId:e.destinationId,preferences:p,...(e.calculator&&typeof e.calculator==='object'?{calculator:{...e.calculator}}:{})};}catch{return null;}};
    function load(){try{const raw=storage.getItem(storageKey),data=raw?JSON.parse(raw):[];if(!Array.isArray(data))throw Error();entries=[...new Map(data.slice(0,100).map(clean).filter(Boolean).map(e=>[identity(e.destinationId,e.preferences),e])).values()];error='';}catch{entries=[];error='Saved trips could not be read. Check that this browser allows site storage.';}}
    function has(id,p){return entries.some(e=>identity(e.destinationId,e.preferences)===identity(id,p));}
    function save(id,p,calculator){if(error)throw Error(error);const item=clean({destinationId:id,preferences:p,calculator});if(!item)throw Error('Check your trip details before saving.');const found=has(id,p),next=found?entries.filter(e=>identity(e.destinationId,e.preferences)!==identity(id,p)):[item,...entries];if(next.length>100)throw Error('Remove a saved trip before adding another. The limit is 100.');try{storage.setItem(storageKey,JSON.stringify(next));}catch{throw Error('Your browser could not save this trip. Allow site storage and try again.');}entries=next;return !found;}
    load();return {list:()=>structuredClone(entries),has,toggle:save,reload:load,error:()=>error};
  }
  return {P,C,interests,foods,stays,paces,regions,destinations,defaults,normalise,count,returnDate,dateKey,validateStep,validate,destination,countryDestination,photo,arrival,initialCosts,calculate,reasons,recommend,alternatives,preferencesForDestination,passengers,links,createStore,storageKey,identity,round};
})();
