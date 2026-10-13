'use strict';
globalThis.TripFavourites = (() => {
  const storageKey='byebye.favourite-trips.v1';
  const fields=['budget','origin','departure','nights','travellers','vibe','region','country','food','stay'];
  const preferences=p=>({...(p.currency?{currency:p.currency}:{}),...Object.fromEntries(fields.map(k=>[k,k==='country'?(p[k]||'any'):p[k]])),...(p.arrivalAirports?{arrivalAirports:{...p.arrivalAirports}}:{})});
  const key=(id,p)=>JSON.stringify([id,...fields.map(k=>preferences(p)[k]),...(p.arrivalAirports?.[id]?['arrivalAirport',p.arrivalAirports[id]]:[]),...(p.currency&&p.currency!=='EUR'?['currency',p.currency]:[])]);
  const validEntry=e=>{
    if(!e||typeof e.destinationId!=='string'||!e.preferences)return false;
    const d=TripPlanner.destinations.find(d=>d.id===e.destinationId);
    if(!d&&!TripPlanner.countries.some(c=>'country-'+c.code===e.destinationId))return false;
    try{
      const p=e.preferences,date=new Date(p.departure+'T12:00:00Z');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(p.departure)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==p.departure)return false;
      TripPlanner.validate({...p,departure:'9999-01-01'});
      const country=d?TripPlanner.countries.find(c=>c.code===d.countryCode):TripPlanner.countries.find(c=>'country-'+c.code===e.destinationId);
      return TripPlanner.inRegion(country,p.region)&&(p.country==='any'||!p.country||country.code===p.country);
    }catch{return false;}
  };
  function create(storage){
    let entries=[],readError='';
    function load(){
      try{
        const raw=storage.getItem(storageKey);const parsed=raw?JSON.parse(raw):[];
        if(!Array.isArray(parsed))throw Error('Invalid saved data');
        const unique=new Map();
        for(const item of parsed.slice(0,100))if(validEntry(item)){
          const e={destinationId:item.destinationId,preferences:preferences(item.preferences)};
          unique.set(key(e.destinationId,e.preferences),e);
        }
        entries=[...unique.values()];readError='';
      }catch{entries=[];readError='Your saved trips could not be read. Check that this browser allows site storage.';}
    }
    function change(id,p){
      const entry={destinationId:id,preferences:preferences(p)};
      if(!validEntry(entry))throw Error('This trip cannot be saved. Please check your preferences.');
      const k=key(id,p),exists=entries.some(e=>key(e.destinationId,e.preferences)===k);
      if(!exists&&entries.length>=100)throw Error('You have 100 saved trips. Remove one to save another.');
      const next=exists?entries.filter(e=>key(e.destinationId,e.preferences)!==k):[entry,...entries];
      try{storage.setItem(storageKey,JSON.stringify(next));}catch{throw Error('This browser could not save your favourites. Allow site storage and try again.');}
      entries=next;readError='';return !exists;
    }
    load();
    return {list:()=>entries.map(e=>({destinationId:e.destinationId,preferences:preferences(e.preferences)})),has:(id,p)=>entries.some(e=>key(e.destinationId,e.preferences)===key(id,p)),toggle:change,reload:load,error:()=>readError};
  }
  return {create,key,storageKey};
})();
