'use strict';
const C=TripCurrency;
const popularCurrencies=['EUR','USD','GBP','CAD','AUD','JPY','CNY','KRW','THB','PHP','AED','SAR','QAR','JOD','INR'];
const currencySelect=$('#currency');
currencySelect.innerHTML=[...popularCurrencies,...C.codes.filter(c=>!popularCurrencies.includes(c)).sort((a,b)=>C.name(a).localeCompare(C.name(b)))].map(c=>`<option value="${c}">${c} · ${escapeHtml(C.name(c))}</option>`).join('');
function currencyAmount(eur,currency=C.current){return String(Math.round(eur*C.rate(currency)*100)/100);}
const exactFormAmounts=new Map();
function readMoneyInput(selector){const input=$(selector),saved=exactFormAmounts.get(selector);return saved&&saved.value===input.value&&saved.currency===C.current?saved.eur:Number(input.value)/C.rate();}
function setMoneyInput(selector,eur){const input=$(selector);input.value=eur===null?'':currencyAmount(eur);exactFormAmounts.set(selector,{value:input.value,currency:C.current,eur});}
function refreshCurrencyLabels(){
  const code=C.current,r=C.rate();
  currencySelect.value=code;
  $('.field-header span').textContent=`For everyone, in ${code}`;
  $('.budget-input > span').textContent=C.symbol();
  $('#budget').min=currencyAmount(200);$('#budget').max=currencyAmount(30000);$('#budget').step='any';
  $('#budget-range').min=currencyAmount(200);$('#budget-range').max=currencyAmount(10000);$('#budget-range').step=String(Math.max(1,Math.round(50*r)));
  $('.range-labels').innerHTML=`<span>${C.money(200)}</span><span>${C.money(10000)}+</span>`;
  const stale=(Date.now()-new Date(C.date+'T00:00:00Z').getTime())>3*86400000;
  $('#currency-rate-note').textContent=`${C.codes.length} currencies · exchange rates dated ${C.date}${stale?' (older saved rates)':''}. Estimates may differ from provider or bank rates.`;
  $('#currency-footer-date').textContent=`Exchange rates: ${C.date}.`;
}
currencySelect.onchange=()=>{
  const budget=readMoneyInput('#budget');
  C.current=currencySelect.value;refreshCurrencyLabels();
  setMoneyInput('#budget',budget);$('#budget-range').value=currencyAmount(Math.min(10000,budget));
  $('#announcements').textContent=`Amounts converted to ${C.name(C.current)}.`;
};
refreshCurrencyLabels();
currencySelect.disabled=true;
C.refresh().then(fresh=>{if(!trip&&C.current==='EUR'&&$('#favourites-panel').hidden){C.install(fresh);refreshCurrencyLabels();}}).finally(()=>{currencySelect.disabled=false;});
