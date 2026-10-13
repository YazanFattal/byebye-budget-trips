'use strict';
globalThis.TripPlanner = (() => {
  const destinations = [
    {id:'lisbon',city:'Lisbon',country:'Portugal',region:'Europe',airport:'LIS',vibes:['culture','beach'],foods:['local','seafood'],tagline:'Get a little lost. Find a lot to love.',badge:'City days. Coastal soul.',coordinates:'38.7223° N · 9.1393° W',description:'Follow the tiled streets of Alfama, stop for a pastel de nata, and take in the views over the Tagus. Lisbon pairs city wandering with easy coastal day trips.',highlights:['Alfama wanderings','Portuguese flavours','Tagus river views'],area:'Baixa or Chiado',stayNote:'A central base for exploring on foot and by public transport. Hills and cobbled streets are part of the city.',hotel:[65,105,155],food:32,activities:15,flights:{AMS:180,LON:150,PAR:150,BER:200,ROM:180,BCN:130},image:'https://upload.wikimedia.org/wikipedia/commons/9/92/Lisbon_panorama_from_the_Bairro_Alto.jpg',credit:'Dudva',source:'https://commons.wikimedia.org/wiki/File:Lisbon_panorama_from_the_Bairro_Alto.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',guide:'https://www.visitlisboa.com/'},
    {id:'barcelona',city:'Barcelona',country:'Spain',region:'Europe',airport:'BCN',vibes:['culture','beach'],foods:['local','seafood','vegetarian'],tagline:'Mornings in the city. Evenings by the sea.',badge:'Architecture meets the Mediterranean.',coordinates:'41.3874° N · 2.1686° E',description:'Explore Gaudí’s playful architecture, wander the Gothic Quarter, and pause for tapas. The Mediterranean waterfront brings a little beach time to your city break.',highlights:['Gaudí architecture','Tapas stops','Mediterranean waterfront'],area:'Eixample',stayNote:'Look for a stay near a metro stop. Check local city taxes and whether breakfast is included.',hotel:[85,130,185],food:38,activities:20,flights:{AMS:170,LON:140,PAR:130,BER:160,ROM:140,BCN:0},image:'https://upload.wikimedia.org/wikipedia/commons/d/dd/Barcelona_skyline.jpg',credit:'frank müller',source:'https://commons.wikimedia.org/wiki/File:Barcelona_skyline.jpg',license:'CC BY-SA 2.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/',guide:'https://www.spain.info/en/destination/barcelona/'},
    {id:'marrakech',city:'Marrakech',country:'Morocco',region:'North Africa',airport:'RAK',vibes:['culture'],foods:['local','halal'],tagline:'A different rhythm. A thousand colours.',badge:'Courtyards, souks & mint tea.',coordinates:'31.6295° N · 7.9811° W',description:'Step into the medina’s winding lanes, explore the souks, and retreat to a quiet riad courtyard. Gardens, Moroccan flavours, and centuries of craft set the pace.',highlights:['Medina & souks','Riad courtyards','Moroccan cooking'],area:'the Medina or Gueliz',stayNote:'Choose a riad for courtyard character, or a hotel in Gueliz for easier road access. Check arrival and transfer arrangements.',hotel:[45,80,135],food:22,activities:13,flights:{AMS:240,LON:190,PAR:180,BER:260,ROM:220,BCN:170},image:'https://upload.wikimedia.org/wikipedia/commons/5/55/Marrakech_Koutoubia.jpg',credit:'Philippe Salgarolo',source:'https://commons.wikimedia.org/wiki/File:Marrakech_Koutoubia.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',guide:'https://www.visitmorocco.com/en/destinations/marrakech'},
    {id:'budapest',city:'Budapest',country:'Hungary',region:'Europe',airport:'BUD',vibes:['culture'],foods:['local'],tagline:'Grand views. Slow afternoons.',badge:'Riverside walks & thermal baths.',coordinates:'47.4979° N · 19.0402° E',description:'Cross the Danube between Buda and Pest, explore the Castle District, and make time for a thermal bath. Historic cafés and riverside views round out a relaxed city escape.',highlights:['Danube views','Thermal baths','Historic cafés'],area:'Belváros',stayNote:'A central location puts riverside walks and public transport within reach. Check bath admission separately.',hotel:[50,85,140],food:28,activities:15,flights:{AMS:180,LON:130,PAR:170,BER:120,ROM:120,BCN:170},image:'https://upload.wikimedia.org/wikipedia/commons/6/6e/Budapest_Panorama_1.jpg',credit:'Karelj',source:'https://commons.wikimedia.org/wiki/File:Budapest_Panorama_1.jpg',license:'Public domain',licenseUrl:null,guide:'https://www.budapestinfo.hu/'},
    {id:'split',city:'Split',country:'Croatia',region:'Europe',airport:'SPU',vibes:['beach','nature','culture'],foods:['local','seafood'],tagline:'Old-town mornings. Adriatic afternoons.',badge:'Stone streets & sea breezes.',coordinates:'43.5081° N · 16.4402° E',description:'Wander the lanes around Diocletian’s Palace, stroll the Riva, and find a patch of coast to slow down. Marjan offers green trails and views back over the city.',highlights:['Diocletian’s Palace','Adriatic coast','Marjan trails'],area:'the Old Town or Varoš',stayNote:'Old Town stays put you near the waterfront; Varoš offers access toward Marjan. Summer prices can rise sharply.',hotel:[70,115,175],food:34,activities:17,flights:{AMS:220,LON:190,PAR:220,BER:190,ROM:150,BCN:240},image:'https://upload.wikimedia.org/wikipedia/commons/d/dc/SplitM1.jpg',credit:'DIREKTOR',source:'https://commons.wikimedia.org/wiki/File:SplitM1.jpg',license:'Public domain',licenseUrl:null,guide:'https://visitsplit.com/en/'},
    {id:'ljubljana',city:'Ljubljana',country:'Slovenia',region:'Europe',airport:'LJU',vibes:['nature','culture'],foods:['local','vegetarian'],tagline:'A greener kind of city break.',badge:'River cafés & room to breathe.',coordinates:'46.0569° N · 14.5058° E',description:'Follow the Ljubljanica past riverside cafés and bridges, visit the castle, and stretch your legs in Tivoli Park. This compact capital makes room for an unhurried escape.',highlights:['Riverside cafés','Castle views','Tivoli Park'],area:'the city centre',stayNote:'Look near the pedestrian centre for easy wandering. Confirm parking or taxi access if your hotel is in a car-free area.',hotel:[65,105,160],food:32,activities:14,flights:{AMS:230,LON:180,PAR:230,BER:230,ROM:240,BCN:250},image:'https://upload.wikimedia.org/wikipedia/commons/4/4f/Ljublanica_River_in_Ljubljana_%2848173521972%29.jpg',credit:'Radek Kucharski',source:'https://commons.wikimedia.org/wiki/File:Ljubljanica_River_in_Ljubljana_(48173521972).jpg',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',guide:'https://www.visitljubljana.com/en/visitors/'}
  ];
  Object.assign(destinations.find(d=>d.id==='split'),{image:'https://images.unsplash.com/photo-1628699278633-b3ea53323b07?auto=format&fit=crop&w=1600&q=85',credit:'mana5280',source:'https://unsplash.com/photos/aerial-view-of-city-near-body-of-water-during-daytime-0y7lM7fg0Zo',license:'Unsplash License',licenseUrl:'https://unsplash.com/license'});
  Object.assign(destinations.find(d=>d.id==='ljubljana'),{image:'https://images.unsplash.com/photo-1664193315381-e614a644e5f8?auto=format&fit=crop&w=1600&q=85',credit:'Robert Katzki',source:'https://unsplash.com/photos/a-river-running-through-a-city-NvNY-q_G7JA',license:'Unsplash License',licenseUrl:'https://unsplash.com/license'});
  const countries=globalThis.CountryCatalog??[];
  const middleEast=['AE','SA','QA','OM','JO','BH','TR','EG','CY','KW','LB','IQ','IR','IL','PS','SY','YE'];
  const regions=['any','Asia','Middle East','Europe','Africa','North America','South America','Oceania','Antarctica'];
  const inRegion=(c,region)=>region==='any'||(region==='Middle East'?middleEast.includes(c.code):c.continent===region);
  const existingCodes={lisbon:'PT',barcelona:'ES',marrakech:'MA',budapest:'HU',split:'HR',ljubljana:'SI'};
  destinations.forEach(d=>{d.countryCode=existingCodes[d.id];if(d.region==='North Africa')d.region='Africa';});
  destinations.push(...(globalThis.WorldDestinations??[]));
  destinations.forEach(d=>{Object.assign(d,globalThis.WorldPhotos?.[d.id]??{});d.originalImage=d.image;if(!d.image?.startsWith('images/'))d.image=`images/${d.id}.jpg`;d.popular=countries.find(c=>c.code===d.countryCode)?.popular??999;});
  const legacyOriginAirports=[{code:'LON',country:'GB',city:'London',name:'All London airports'},{code:'PAR',country:'FR',city:'Paris',name:'All Paris airports'},{code:'ROM',country:'IT',city:'Rome',name:'All Rome airports'}];
  const origins=Object.fromEntries([...(globalThis.ArrivalAirports??[]),...legacyOriginAirports].map(a=>[a.code,`${a.city||a.name} (${a.code})`]));
  const stays={simple:{index:0,label:'Simple, good-value stay'},boutique:{index:1,label:'A stay with local character'},comfort:{index:2,label:'A hotel with extra comfort'}};
  const money=(n,currency=TripCurrency.current)=>TripCurrency.money(n,currency);
  const airports=globalThis.ArrivalAirports??[];
  const airportsFor=d=>airports.filter(a=>a.country===d.countryCode);
  function arrivalAirport(d,p){return p.arrivalAirports?.[d.id]||d.airport||airportsFor(d).find(a=>a.code!==p.origin)?.code;}
  function dateKey(date){return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);}
  function validate(p){
    if(p.arrivalAirports!=null){
      if(typeof p.arrivalAirports!=='object'||Array.isArray(p.arrivalAirports)||Object.keys(p.arrivalAirports).length>300)throw Error('Choose an arrival airport from the list.');
      for(const [id,code] of Object.entries(p.arrivalAirports)){
        const destination=destinations.find(d=>d.id===id),country=destination?.countryCode||(id.startsWith('country-')?id.slice(8):null);
        if(!airports.some(a=>a.code===code&&a.country===country)&&!(destination?.airport===code&&code==='NYC'))throw Error('Choose an arrival airport in your destination country.');
        if(code===p.origin)throw Error('Choose an arrival airport different from your departure airport.');
      }
    }
    if(p.currency&&!TripCurrency.codes.includes(p.currency))throw Error('Choose a currency from the list.');
    if(!Number.isFinite(p.budget)||p.budget<199.99||p.budget>30000.01) throw Error('Enter a total budget between '+money(200,p.currency||'EUR')+' and '+money(30000,p.currency||'EUR')+'.');
    if(!Number.isInteger(p.travellers)||p.travellers<1||p.travellers>8)throw Error('Choose between 1 and 8 adult travellers.');
    if(![3,5,7,10,14].includes(p.nights))throw Error('Choose 3, 5, 7, 10, or 14 nights.');
    if(!Object.hasOwn(origins,p.origin))throw Error('Choose a departure airport. If your country has no listed airports, choose a nearby country.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(p.departure||'')||!Number.isFinite(new Date(p.departure+'T12:00:00').getTime())||dateKey(new Date(p.departure+'T12:00:00'))!==p.departure||p.departure<dateKey(new Date()))throw Error('Choose a valid departure date today or later.');
    if(!regions.includes(p.region)||!['any','beach','culture','nature'].includes(p.vibe)||!['any','local','seafood','vegetarian','halal'].includes(p.food)||!Object.hasOwn(stays,p.stay))throw Error('Choose one of the available preferences.');
    const country=p.country||'any';
    if(country!=='any'&&!countries.some(c=>c.code===country))throw Error('Choose a country from the suggestions, or leave it blank for anywhere.');
    if(country!=='any'&&!inRegion(countries.find(c=>c.code===country),p.region))throw Error('Choose a country in your selected region, or select all continents.');
    const {flightMaxEUR,flightMaxUSD,...preferences}=p;
    return {...preferences,country};
  }
  function checkout(p){const d=new Date(p.departure+'T12:00:00');d.setDate(d.getDate()+p.nights);return dateKey(d);}
  function estimate(d,p){
    const month=Number(p.departure.slice(5,7));
    const season=d.peakMonths?(d.peakMonths.includes(month)?1.2:1):[6,7,8].includes(month)?(d.id==='split'?1.4:1.2):month===12?1.15:[4,5,9,10].includes(month)?1.05:1;
    const near=(new Date(p.departure+'T12:00:00')-new Date())/86400000<21?1.25:1;
    const rooms=Math.ceil(p.travellers/2);
    const nightly=Math.round(d.hotel[stays[p.stay].index]*season);
    const flights=Number.isFinite(d.flights[p.origin])?Math.round(d.flights[p.origin]*season*near*p.travellers):null;
    const hotel=nightly*p.nights*rooms;
    const food=Math.round(d.food*(p.food==='seafood'?1.15:1)*(p.nights+1)*p.travellers);
    const activities=d.activities*(p.nights+1)*p.travellers;
    const buffer=flights===null?null:Math.ceil((flights+hotel+food+activities)*.12);
    const total=flights===null?null:flights+hotel+food+activities+buffer;
    return {flights,hotel,food,activities,buffer,total,rooms,nightly,remaining:total===null?null:p.budget-total};
  }
  function recommend(input){
    const p=validate(input);
    if(p.country!=='any'&&!destinations.some(d=>d.countryCode===p.country&&d.airport!==p.origin))return [countryMatch(countries.find(c=>c.code===p.country))];
    if(p.region==='Antarctica')return [countryMatch(countries.find(c=>c.code==='AQ'))];
    if(p.region==='Middle East')return countries.filter(c=>inRegion(c,p.region)&&(p.country==='any'||c.code===p.country)).sort((a,b)=>middleEast.indexOf(a.code)-middleEast.indexOf(b.code)).map(countryMatch);
    return destinations.filter(d=>(p.region==='any'||d.region===p.region)&&(p.country==='any'||d.countryCode===p.country)&&p.origin!==d.airport).map(d=>{
      const costs=estimate(d,p);
      const score=(p.vibe==='any'?10:d.vibes.includes(p.vibe)?40:0)+(p.food==='any'?5:d.foods.includes(p.food)?20:0);
      return {destination:d,costs,score,withinBudget:costs.total===null?null:costs.total<=p.budget};
    }).sort((a,b)=>Number(b.withinBudget===true)-Number(a.withinBudget===true)||(a.costs.total===null||b.costs.total===null?b.score-a.score||a.destination.popular-b.destination.popular:a.withinBudget?b.score-a.score||a.destination.popular-b.destination.popular||a.costs.total-b.costs.total:a.costs.total-b.costs.total||b.score-a.score));
  }
  function countryMatch(c){return {destination:{id:'country-'+c.code,city:c.name,country:c.name,countryCode:c.code,region:c.continent,countryRecord:c},costs:null,score:0,withinBudget:null};}
  // Google Flights' shared-search format. This encodes a link; it never fetches fares.
  // Field reference: https://github.com/AWeirdDev/flights/blob/dev/fast_flights/pb/flights.proto
  function flightSearchData(d,p){
    const arrival=arrivalAirport(d,p);
    const number=n=>{const bytes=[];do{let byte=n&127;n=Math.floor(n/128);bytes.push(byte|(n?128:0));}while(n);return bytes;};
    const integer=(field,value)=>[...number(field*8),...number(value)];
    const message=(field,bytes)=>[...number(field*8+2),...number(bytes.length),...bytes];
    const string=(field,value)=>message(field,[...new TextEncoder().encode(value)]);
    const cities={LON:'/m/04jpl',PAR:'/m/05qtj',ROM:'/m/06c62',NYC:'/m/02_286'};
    const place=code=>[...integer(1,cities[code]?3:1),...string(2,cities[code]||code)];
    const leg=(date,from,to)=>[...string(2,date),...(from?message(13,place(from)):[]),...(to?message(14,place(to)):[])];
    const bytes=[...integer(1,28),...integer(2,2),...message(3,leg(p.departure,p.origin,arrival)),...message(3,leg(checkout(p),arrival,p.origin)),...Array.from({length:p.travellers},()=>integer(8,1)).flat(),...integer(9,1),...integer(19,1)];
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function links(d,p){
    const hotels=new URL('https://www.booking.com/searchresults.html');
    hotels.search=new URLSearchParams({ss:d.hotelSearch||(d.city===d.country?d.country:d.city+', '+d.country),checkin:p.departure,checkout:checkout(p),group_adults:String(p.travellers),group_children:'0',no_rooms:String(Math.ceil(p.travellers/2)),selected_currency:p.currency||'EUR'}).toString();
    const flights=new URL('https://www.google.com/travel/flights'+(arrivalAirport(d,p)?'/search':''));
    flights.searchParams.set('tfs',flightSearchData(d,p));
    flights.searchParams.set('curr',TripCurrency.flightCurrency(p.currency||'EUR'));
    flights.searchParams.set('hl','en');
    return {hotels:hotels.href,flights:flights.href};
  }
  return {destinations,countries,regions,middleEast,inRegion,countryMatch,origins,stays,money,validate,checkout,estimate,recommend,links,airports,airportsFor,arrivalAirport,legacyOriginAirports};
})();
