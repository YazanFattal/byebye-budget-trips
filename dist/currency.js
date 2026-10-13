'use strict';
globalThis.TripCurrency=(()=>{
  let data=globalThis.CurrencyData,current='EUR';
  const codes=Object.keys(data.rates),names=new Intl.DisplayNames(['en'],{type:'currency'});
  const googleCurrencies=new Set('ALL DZD ARS AMD AWG AUD AZN BSD BHD BYN BMD BAM BRL GBP CAD XPF CLP CNY COP CRC CUP CZK DKK DOP EGP EUR GEL HKD HUF ISK INR IDR IRR ILS JMD JPY JOD KZT KWD LBP MKD MYR MXN MDL MAD TWD NZD NGN NOK OMR PKR PAB PEN PHP PLN QAR RON RUB SAR RSD SGD ZAR KRW SEK CHF THB TRY UAH AED USD VND'.split(' '));
  const rate=(currency=current)=>data.rates[currency]||1;
  const format=(value,currency=current,precise=false)=>new Intl.NumberFormat('en-IE',{style:'currency',currency,currencyDisplay:'symbol',...(precise?{}:{maximumFractionDigits:0})}).format(value);
  const money=(eur,currency=current,precise=false)=>format(eur*rate(currency),currency,precise);
  const symbol=(currency=current)=>new Intl.NumberFormat('en-IE',{style:'currency',currency}).formatToParts(0).find(p=>p.type==='currency').value;
  const valid=d=>d&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&d.date<=new Date(Date.now()+86400000).toISOString().slice(0,10)&&d.rates?.EUR===1&&codes.every(c=>Number.isFinite(d.rates[c])&&d.rates[c]>0);
  try{const cached=JSON.parse(localStorage.getItem('byebye.currency-rates.v1'));if(valid(cached)&&cached.date>=data.date)data=cached;}catch{}
  async function refresh(){
    // Freeze rates during an active trip. The next visit can use refreshed cached rates.
    if(data.date===new Date().toISOString().slice(0,10))return data;
    for(const url of ['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json','https://latest.currency-api.pages.dev/v1/currencies/eur.json']){
      try{
        const response=await fetch(url,{signal:AbortSignal.timeout(4500)});if(!response.ok)continue;
        const raw=await response.json(),fresh={date:raw.date,rates:Object.fromEntries(codes.map(c=>[c,raw.eur?.[c.toLowerCase()]]))};
        if(!valid(fresh)||fresh.date<data.date)continue;
        try{localStorage.setItem('byebye.currency-rates.v1',JSON.stringify(fresh));}catch{}
        return fresh;
      }catch{}
    }
    return data;
  }
  return {codes,rate,format,money,symbol,name:c=>names.of(c),get current(){return current;},set current(c){if(!codes.includes(c))throw Error('Choose a supported currency.');current=c;},get date(){return data.date;},install:fresh=>{if(valid(fresh))data=fresh;},refresh,flightCurrency:c=>googleCurrencies.has(c)?c:'EUR'};
})();
