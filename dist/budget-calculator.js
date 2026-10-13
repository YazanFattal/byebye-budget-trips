'use strict';
globalThis.TripBudget = (() => {
  const round=value=>Math.round((value+Number.EPSILON)*100)/100;
  function defaults(costs,p,expedition=false){
    return {flights:costs?.flights!=null?String(costs.flights):'',nightly:costs?String(costs.nightly):'',rooms:String(costs?.rooms??Math.ceil(p.travellers/2)),packageTotal:'',foodDaily:costs?String(round(costs.food/((p.nights+1)*p.travellers))):'',transport:costs?String(costs.activities):'',extras:'0',buffer:'12'};
  }
  function calculate(input,p,expedition=false){
    const labels={flights:'Return flights',nightly:'Room price per night',rooms:'Number of rooms',packageTotal:'Expedition or accommodation total',foodDaily:'Food per person per day',transport:'Transport and activities',extras:'Other costs',buffer:'Extra allowance'};
    const fields=['flights',...(expedition?['packageTotal']:['nightly','rooms']),'foodDaily','transport','extras','buffer'];
    const amounts={},errors={},missing=[];
    for(const name of fields){
      const raw=input[name];
      if(raw===undefined||raw===null||String(raw).trim()===''){missing.push(name);continue;}
      const value=Number(raw),min=name==='rooms'?1:0,max=name==='rooms'?8:name==='buffer'?100:1000000*(p.inputRate||1);
      if(!Number.isFinite(value)||value<min||value>max||(name==='rooms'&&!Number.isInteger(value)))errors[name]=`${labels[name]} must be ${name==='rooms'?'a whole number from 1 to 8':`between ${min} and ${max.toLocaleString('en-GB')}`}.`;
      else amounts[name]=value;
    }
    if(Object.keys(errors).length)return {status:'invalid',errors,missing};
    if(missing.length)return {status:'incomplete',errors,missing};
    const flights=round(amounts.flights),stay=round(expedition?amounts.packageTotal:amounts.nightly*p.nights*amounts.rooms),food=round(amounts.foodDaily*(p.nights+1)*p.travellers),transport=round(amounts.transport),extras=round(amounts.extras);
    const subtotal=round(flights+stay+food+transport+extras),buffer=round(subtotal*amounts.buffer/100),total=round(subtotal+buffer);
    return {status:'ready',flights,stay,food,transport,extras,subtotal,buffer,total,remaining:round(p.budget-total),perPerson:round(total/p.travellers),withinBudget:total<=p.budget};
  }
  return {defaults,calculate};
})();
