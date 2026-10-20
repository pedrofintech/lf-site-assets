/* =====================================================================
   BrokerMatch - "Gold rate today in the UAE" tool (external bundle)
   Injects CSS + HTML into #bmc-gold and fetches gold-data.json.
   Same mechanism as the EIBOR rate today page (pedrofintech/eibor-rate-today):
   the tool (code + data) lives on GitHub and is served by jsDelivr.
   Data: gold-uae/gold-data.json, refreshed by .github/workflows/gold-uae.yml
   Page: https://www.brokermatch.ae/gold-rate-today-uae
   ===================================================================== */
(function(){
  "use strict";
  if (window.__bmcGoldLoaded) { return; }
  window.__bmcGoldLoaded = 1;

  var DATA_URL = "https://raw.githubusercontent.com/pedrofintech/lf-site-assets/main/gold-uae/gold-data.json";
  var SPOT_URL = "https://api.gold-api.com/price/XAU";
  var PEG = 3.6725, OZ = 31.1034768, TOLA = 11.6638;
  var KARATS = ["24","22","21","18","14"];
  var PURITY = { "24":0.999, "22":0.916, "21":0.875, "18":0.750, "14":0.585 };
  var KLABEL = { "24":"24K", "22":"22K", "21":"21K", "18":"18K", "14":"14K" };
  var KNOTE  = { "24":"999 fine gold", "22":"916 gold", "21":"875 gold", "18":"750 gold", "14":"585 gold" };

  var CSS = `/* ===================== BMC-GOLD - styles ===================== */
#bmc-gold{ font-family:inherit; color:#202432; -webkit-font-smoothing:antialiased; }
#bmc-gold *{ box-sizing:border-box; }
#bmc-gold a{ text-decoration:none; }

.bmc-gold-cardtitle{ font-size:18px; font-weight:500; letter-spacing:-0.2px; line-height:28px; color:#202432; }
.bmc-gold-topdivider{ width:100%; height:1px; background:#E9ECF1; margin:14px 0 24px; }

.bmc-gold-hero-label{ font-weight:700; font-size:13px; letter-spacing:0.05em; text-transform:uppercase; color:#4F5969; }
.bmc-gold-hero-row{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:10px; }
.bmc-gold-hero-val{ font-weight:700; font-size:56px; line-height:1; letter-spacing:-0.02em; color:#202432; font-variant-numeric:tabular-nums; }
.bmc-gold-hero-usd{ margin-top:8px; font-weight:600; font-size:24px; line-height:1.2; color:#4F5969; font-variant-numeric:tabular-nums; }
.bmc-gold-hero-usd strong{ color:#202432; font-weight:700; }
.bmc-gold-refline{ margin:14px 0 0; font-size:14px; line-height:1.55; color:#4F5969; font-weight:500; max-width:820px; }
.bmc-gold-refline strong{ color:#202432; }
.bmc-gold-chip{ display:inline-flex; align-items:center; gap:4px; font-size:13px; font-weight:600; padding:5px 11px; border-radius:999px; font-variant-numeric:tabular-nums; white-space:nowrap; }
.bmc-gold-chip.is-up{ color:#067647; background:#ECFDF3; }
.bmc-gold-chip.is-down{ color:#B42318; background:#FEF3F2; }
.bmc-gold-chip.is-flat{ color:#4F5969; background:#F2F4F7; }

.bmc-gold-note{ font-size:13px; line-height:1.55; color:#98A2B3; margin:16px 0 0; max-width:820px; }
.bmc-gold-note a, .bmc-gold-link{ color:var(--colors--accent-blue,#2E90FA); text-decoration:underline !important; }

.bmc-gold-block{ margin-top:48px; }
.bmc-gold-block-head{ display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:18px; }
.bmc-gold-eyebrow{ font-weight:700; font-size:13px; letter-spacing:0.06em; text-transform:uppercase; color:#0E7A46; }
.bmc-gold-h2{ font-family:inherit; font-weight:700; font-size:30px; line-height:1.15; letter-spacing:-0.02em; color:#202432; margin:6px 0 0; }
.bmc-gold-sub{ font-size:15px; line-height:1.6; color:#4F5969; margin:8px 0 0; max-width:620px; }

.bmc-gold-switches{ display:flex; gap:8px; flex-wrap:wrap; }
.bmc-gold-ranges{ display:flex; gap:4px; background:#F2F4F7; border:1px solid #EAECF0; border-radius:12px; padding:4px; }
.bmc-gold-ranges button{ border:0; background:transparent; font-family:inherit; font-size:13px; font-weight:600; color:#4F5969; padding:7px 14px; border-radius:9px; cursor:pointer; letter-spacing:-0.1px; }
.bmc-gold-ranges button.is-active{ background:#fff; color:#202432; box-shadow:0 1px 2px rgba(18,23,33,0.10); }

.bmc-gold-table-wrap{ border:1px solid #E9ECF1; border-radius:12px; overflow:hidden; overflow-x:auto; }
.bmc-gold-table{ width:100%; border-collapse:collapse; font-size:14px; }
.bmc-gold-table thead tr{ background:#FCFCFD; border-bottom:1px solid #EAECF0; }
.bmc-gold-table th{ text-align:right; padding:13px 16px; font-weight:600; font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#4F5969; white-space:nowrap; }
.bmc-gold-table th.is-left{ text-align:left; padding-left:24px; }
.bmc-gold-table th.is-last{ padding-right:24px; }
.bmc-gold-table td{ padding:12px 16px; text-align:right; font-variant-numeric:tabular-nums; color:#394455; border-bottom:1px solid #F2F4F7; white-space:nowrap; }
.bmc-gold-table td.is-left{ text-align:left; padding-left:24px; }
.bmc-gold-table td.is-last{ padding-right:24px; }
.bmc-gold-table th small{ display:block; font-size:11px; letter-spacing:0; text-transform:none; color:#98A2B3; font-weight:500; margin-top:2px; }
.bmc-gold-short{ display:none; }
.bmc-gold-table td small{ display:block; font-size:12px; color:#98A2B3; font-weight:500; }
.bmc-gold-table tr.is-hl td{ background:#F2FBF6; font-weight:700; color:#202432; }
.bmc-gold-table tr:last-child td{ border-bottom:0; }
.bmc-gold-up{ color:#067647; } .bmc-gold-down{ color:#B42318; }

.bmc-gold-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.bmc-gold-stat{ background:#fff; border:1px solid #E9ECF1; border-radius:12px; padding:16px; box-shadow:0 1px 3px rgba(18,23,33,0.06); }
.bmc-gold-stat-l{ display:block; font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:#4F5969; }
.bmc-gold-stat-v{ display:block; margin-top:8px; font-size:22px; font-weight:700; letter-spacing:-0.02em; color:#202432; font-variant-numeric:tabular-nums; }

.bmc-gold-chartcard{ background:#fff; border:1px solid #E9ECF1; border-radius:12px; padding:22px 22px 14px; box-shadow:0 1px 3px rgba(18,23,33,0.06); }
.bmc-gold-chart-top{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-bottom:10px; font-size:13px; font-weight:600; color:#4F5969; }
.bmc-gold-canvas-wrap{ position:relative; height:320px; }

.bmc-gold-sim-grid{ display:grid; grid-template-columns:1.1fr 0.9fr; gap:20px; align-items:stretch; }
.bmc-gold-sim-inputs{ background:#fff; border:1px solid #E9ECF1; border-radius:16px; padding:26px 24px; box-shadow:0 1px 3px rgba(18,23,33,0.06); display:flex; flex-direction:column; gap:18px; }
.bmc-gold-sim-field > label, .bmc-gold-sim-field > span{ display:block; font-size:13px; font-weight:600; color:#4F5969; margin-bottom:8px; }
.bmc-gold-sim-field input{ width:100%; background:#fff; border:1px solid #D0D5DD; border-radius:12px; padding:13px 15px; color:#202432; font-size:16px; font-weight:600; outline:none; font-variant-numeric:tabular-nums; font-family:inherit; }
.bmc-gold-sim-field input:focus{ border-color:var(--colors--accent-blue,#2E90FA); }
.bmc-gold-pills{ display:flex; gap:8px; flex-wrap:wrap; }
.bmc-gold-pills button{ flex:1; min-width:56px; background:#F2F4F7; border:1px solid #EAECF0; color:#4F5969; font-family:inherit; font-size:14px; font-weight:600; padding:12px 8px; border-radius:12px; cursor:pointer; }
.bmc-gold-pills button.is-active{ background:rgba(14,122,70,.06); border-color:#0E7A46; color:#0E7A46; }
.bmc-gold-sim-result{ background:#121721; border-radius:16px; padding:26px 24px; display:flex; flex-direction:column; gap:16px; color:#fff; }
.bmc-gold-sim-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:14px; }
.bmc-gold-sim-row span:first-child{ color:rgba(255,255,255,0.6); }
.bmc-gold-sim-row span:last-child{ font-weight:600; color:#fff; font-variant-numeric:tabular-nums; text-align:right; }
.bmc-gold-sim-main{ border-top:1px solid #2B3140; padding-top:16px; }
.bmc-gold-sim-main-label{ display:block; font-size:13px; color:rgba(255,255,255,0.6); margin-bottom:4px; }
.bmc-gold-sim-main-val{ font-family:inherit; font-weight:700; font-size:40px; line-height:1; color:#fff; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; }
.bmc-gold-sim-tip{ background:rgba(247,144,9,0.14); border:1px solid rgba(254,200,75,0.25); border-radius:12px; padding:12px 14px; font-size:13px; line-height:1.45; color:#FEC84B; }
.bmc-gold-sim-tip strong{ color:#fff; }
.bmc-gold-foot{ font-size:12px; line-height:1.55; color:#98A2B3; margin:22px 0 0; }
.bmc-gold-morebtn{ display:inline-flex; align-items:center; gap:8px; margin-top:14px; font-size:14px; font-weight:600; color:#4F5969; border:1px solid #D0D5DD; border-radius:10px; padding:9px 16px; cursor:pointer; background:#fff; font-family:inherit; }
.bmc-gold-table tr[data-extra]{ display:none; }
.bmc-gold-table tr[data-extra].is-shown{ display:table-row; }

/* FAQ under the tool (native Webflow elements, styled here like the EIBOR page) */
#bm-gold-faq > div{ margin-bottom:2.25rem; }
#bm-gold-faq > div:last-child{ margin-bottom:0; }
#bm-gold-faq h3{ font-size:1.25rem; font-weight:400; line-height:1.4; margin:0 0 .6rem; color:inherit; }
#bm-gold-faq p{ margin:0; color:#6b7280; line-height:1.65; font-size:1rem; }

@media (max-width:991px){
  .bmc-gold-stats{ grid-template-columns:repeat(2,1fr); }
}
@media (max-width:767px){
  .bmc-gold-hero-val{ font-size:44px; }
  .bmc-gold-hero-usd{ font-size:20px; }
  .bmc-gold-h2{ font-size:25px; }
  .bmc-gold-sim-grid{ grid-template-columns:1fr; gap:22px; }
  .bmc-gold-sim-main-val{ font-size:34px; }
  .bmc-gold-canvas-wrap{ height:260px; }
  .bmc-gold-table th, .bmc-gold-table td{ padding:11px 10px; }
  .bmc-gold-table th.is-left, .bmc-gold-table td.is-left{ padding-left:14px; }
  .bmc-gold-table th.is-last, .bmc-gold-table td.is-last{ padding-right:14px; }
  .bmc-gold-stat-v{ font-size:17px; }
  .bmc-gold-stat-l{ font-size:11px; }
}
@media (max-width:479px){
  .bmc-gold-hero-val{ font-size:38px; }
  .bmc-gold-hero-usd{ font-size:18px; }
  .bmc-gold-long{ display:none; } .bmc-gold-short{ display:inline; }
  .bmc-gold-table{ font-size:13px; }
  .bmc-gold-table th, .bmc-gold-table td{ padding:10px 7px; }
  .bmc-gold-table th.is-left, .bmc-gold-table td.is-left{ padding-left:12px; }
  .bmc-gold-table th.is-last, .bmc-gold-table td.is-last{ padding-right:12px; }
  .bmc-gold-table td small{ font-size:11px; }
  .bmc-gold-table td.is-left{ white-space:normal; min-width:64px; }
  .bmc-gold-stat{ padding:13px; }
}`;

  var HTML = `<div class="bmc-gold-cardtitle">Gold rate today in the UAE (updated several times a day)</div>
  <div class="bmc-gold-topdivider"></div>

  <span class="bmc-gold-hero-label">24K gold rate in Dubai today, per gram</span>
  <div class="bmc-gold-hero-row">
    <span class="bmc-gold-hero-val" id="bmc-gold-hero-val">-</span>
    <span id="bmc-gold-hero-chip"></span>
  </div>
  <div class="bmc-gold-hero-usd" id="bmc-gold-hero-usd"></div>
  <p class="bmc-gold-refline" id="bmc-gold-refline">Suggested retail rate of the Dubai Jewellery Group.</p>

  <div class="bmc-gold-block">
    <div class="bmc-gold-block-head">
      <div>
        <span class="bmc-gold-eyebrow">By karat</span>
        <h2 class="bmc-gold-h2">Gold rate in Dubai today: 24K, 22K, 21K, 18K and 14K</h2>
      </div>
      <div class="bmc-gold-switches">
        <div class="bmc-gold-ranges" id="bmc-gold-cur"><button data-v="AED" class="is-active">AED</button><button data-v="USD">USD</button></div>
        <div class="bmc-gold-ranges" id="bmc-gold-unit"><button data-v="g" class="is-active">Gram</button><button data-v="tola">Tola</button><button data-v="10g">10 g</button></div>
      </div>
    </div>
    <div class="bmc-gold-table-wrap">
      <table class="bmc-gold-table">
        <thead><tr><th class="is-left">Karat</th><th id="bmc-gold-th-today">Today</th><th id="bmc-gold-th-prev">Previous day</th><th class="is-last">Change</th></tr></thead>
        <tbody id="bmc-gold-karat-tbody"></tbody>
      </table>
    </div>
    <p class="bmc-gold-note" id="bmc-gold-karat-note">Suggested retail prices per gram set by the Dubai Jewellery Group for gold jewellery in Dubai. Shops add making charges and 5% VAT on top. One tola is 11.66 grams. US dollar values use the official peg of AED 3.6725.</p>
  </div>

  <div class="bmc-gold-block">
    <div class="bmc-gold-block-head">
      <div>
        <span class="bmc-gold-eyebrow">International market</span>
        <h2 class="bmc-gold-h2">Spot gold price in AED and USD</h2>
      </div>
    </div>
    <div class="bmc-gold-stats">
      <div class="bmc-gold-stat"><span class="bmc-gold-stat-l">Per ounce (USD)</span><span class="bmc-gold-stat-v" id="bmc-gold-s-oz">-</span></div>
      <div class="bmc-gold-stat"><span class="bmc-gold-stat-l">Per gram (AED)</span><span class="bmc-gold-stat-v" id="bmc-gold-s-gaed">-</span></div>
      <div class="bmc-gold-stat"><span class="bmc-gold-stat-l">Per gram (USD)</span><span class="bmc-gold-stat-v" id="bmc-gold-s-gusd">-</span></div>
      <div class="bmc-gold-stat"><span class="bmc-gold-stat-l">Per tola (AED)</span><span class="bmc-gold-stat-v" id="bmc-gold-s-tola">-</span></div>
    </div>
    <p class="bmc-gold-note" id="bmc-gold-spot-note">Spot price of fine gold on the international market, converted at the AED peg.</p>
  </div>

  <div class="bmc-gold-block">
    <div class="bmc-gold-block-head">
      <div>
        <span class="bmc-gold-eyebrow">Chart</span>
        <h2 class="bmc-gold-h2">24K gold price per gram in AED</h2>
      </div>
      <div class="bmc-gold-ranges" id="bmc-gold-ranges">
        <button data-range="21">1M</button>
        <button data-range="63">3M</button>
        <button data-range="365" class="is-active">1Y</button>
      </div>
    </div>
    <div class="bmc-gold-chartcard">
      <div class="bmc-gold-chart-top" id="bmc-gold-chart-top"></div>
      <div class="bmc-gold-canvas-wrap"><canvas id="bmc-gold-canvas"></canvas></div>
    </div>
    <p class="bmc-gold-note">Daily international fixing price of fine gold per gram, converted to dirhams at the peg. It can differ slightly from the live spot price above and is lower than Dubai retail rates, which include the trade's premium.</p>
  </div>

  <div class="bmc-gold-block">
    <span class="bmc-gold-eyebrow">Calculator</span>
    <h2 class="bmc-gold-h2">How much is your gold worth?</h2>
    <p class="bmc-gold-sub">Pick the karat, enter the weight and see the value at today's Dubai retail rate and at the spot price of the gold it contains.</p>
    <div class="bmc-gold-sim-grid" style="margin-top:24px">
      <div class="bmc-gold-sim-inputs">
        <div class="bmc-gold-sim-field">
          <span>Karat</span>
          <div class="bmc-gold-pills" id="bmc-gold-k"><button data-k="24">24K</button><button data-k="22" class="is-active">22K</button><button data-k="21">21K</button><button data-k="18">18K</button><button data-k="14">14K</button></div>
        </div>
        <div class="bmc-gold-sim-field">
          <label for="bmc-gold-w">Weight</label>
          <input id="bmc-gold-w" type="text" inputmode="decimal" value="10">
        </div>
        <div class="bmc-gold-sim-field">
          <span>Unit</span>
          <div class="bmc-gold-pills" id="bmc-gold-u"><button data-u="g" class="is-active">Grams</button><button data-u="tola">Tola</button><button data-u="oz">Ounces</button></div>
        </div>
      </div>
      <div class="bmc-gold-sim-result">
        <div class="bmc-gold-sim-row"><span>Weight in grams</span><span id="bmc-gold-r-grams">-</span></div>
        <div class="bmc-gold-sim-row"><span>Dubai retail rate</span><span id="bmc-gold-r-rate">-</span></div>
        <div class="bmc-gold-sim-main">
          <span class="bmc-gold-sim-main-label">Value at today's retail rate</span>
          <span class="bmc-gold-sim-main-val" id="bmc-gold-r-retail">-</span>
        </div>
        <div class="bmc-gold-sim-row"><span>In US dollars</span><span id="bmc-gold-r-usd">-</span></div>
        <div class="bmc-gold-sim-row"><span>Gold content at spot</span><span id="bmc-gold-r-spot">-</span></div>
        <div class="bmc-gold-sim-tip">Selling used jewellery? Shops usually pay <strong>below the retail rate</strong>, closer to the value of the gold content. Get two or three quotes.</div>
      </div>
    </div>
    <p class="bmc-gold-foot">Indicative values before making charges and VAT. The final price of a piece depends on the shop's weighing and purity test. This tool is for information only and is not financial advice.</p>
  </div>

  <div class="bmc-gold-block" id="bmc-gold-hist-block">
    <div class="bmc-gold-block-head">
      <div>
        <span class="bmc-gold-eyebrow">History</span>
        <h2 class="bmc-gold-h2">Dubai gold rates in the last days</h2>
      </div>
    </div>
    <div class="bmc-gold-table-wrap">
      <table class="bmc-gold-table">
        <thead><tr><th class="is-left">Date</th><th>24K</th><th>22K</th><th>21K</th><th class="is-last">18K</th></tr></thead>
        <tbody id="bmc-gold-hist-tbody"></tbody>
      </table>
    </div>
    <button type="button" id="bmc-gold-more" class="bmc-gold-morebtn">Show more days</button>
    <p class="bmc-gold-note">Last rate of each day, in AED per gram, as published by the Dubai Jewellery Group.</p>
  </div>`;

  /* ---------------- Helpers (English, dot decimals) ---------------- */
  function isNum(v){ return typeof v==='number' && isFinite(v); }
  function group(n){ return n.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmt(v, dec){
    if(!isNum(v)) return '-';
    dec = dec==null ? 2 : dec;
    var s = Math.abs(v).toFixed(dec).split('.');
    return (v<0?'-':'') + group(s[0]) + (s[1] ? '.'+s[1] : '');
  }
  function money(v, cur, dec){ return isNum(v) ? cur+' '+fmt(v, dec) : '-'; }
  function parseNum(str){ return parseFloat(String(str==null?'':str).replace(/[,\s]/g,'')) || 0; }
  function dmy(iso){ var p=String(iso||'').split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : iso; }
  function weekday(iso){
    var p=String(iso||'').split('-'); if(p.length!==3) return '';
    var d=new Date(+p[0], +p[1]-1, +p[2]);
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  }

  function run(DATA){
    var djg = DATA.djg || {};
    var R = djg.rates || {};
    var P = (DATA.djgPrev && DATA.djgPrev.rates) || null;
    var spotUsdOz = DATA.spot && DATA.spot.usdOz;
    var spotAt = DATA.spot && DATA.spot.at;
    var cur = 'AED', unit = 'g';

    function unitMult(u){ return u==='tola' ? TOLA : u==='10g' ? 10 : 1; }
    function conv(aed){ return cur==='USD' ? aed/PEG : aed; }

    /* ---------- Hero ---------- */
    function renderHero(){
      var el=document.getElementById('bmc-gold-hero-val');
      if(el) el.textContent = money(R['24'], 'AED');
      var usdEl=document.getElementById('bmc-gold-hero-usd');
      if(usdEl) usdEl.innerHTML = isNum(R['24']) ? '<strong>'+money(R['24']/PEG,'USD')+'</strong> per gram' : '';
      var chipEl=document.getElementById('bmc-gold-hero-chip');
      if(chipEl){
        if(P && isNum(R['24']) && isNum(P['24'])){
          var d=R['24']-P['24'], pct=d/P['24']*100;
          var cls=d>0.001?'is-up':d<-0.001?'is-down':'is-flat';
          var arrow=d>0.001?'&#9650;':d<-0.001?'&#9660;':'&#8226;';
          chipEl.innerHTML='<span class="bmc-gold-chip '+cls+'">'+arrow+' '+(d>0?'+':d<0?'-':'')+'AED '+fmt(Math.abs(d))+' ('+(pct>0?'+':pct<0?'-':'')+fmt(Math.abs(pct))+'%) vs '+dmy(DATA.djgPrev.date)+'</span>';
        } else { chipEl.innerHTML=''; }
      }
      var ref=document.getElementById('bmc-gold-refline');
      if(ref){
        var when = djg.date ? weekday(djg.date)+', '+dmy(djg.date) : '-';
        ref.innerHTML = 'Suggested retail rate of the <strong>Dubai Jewellery Group</strong>, the industry body of Dubai\'s gold trade. '
          + 'Rates for <strong>'+when+'</strong>, last checked at '+(djg.checked||'-')+' UAE time. '
          + 'Dollar values use the fixed peg of AED 3.6725 per USD.'
          + (djg.stale ? ' <span class="bmc-gold-down">The latest update could not be confirmed, so these may be the previous rates.</span>' : '');
      }
    }

    /* ---------- Karat table ---------- */
    function renderKarats(){
      var tb=document.getElementById('bmc-gold-karat-tbody'); if(!tb) return;
      var m=unitMult(unit), c=cur, html='';
      var tag=c+(unit==='tola'?'/tola':unit==='10g'?'/10 g':'/g');
      var th1=document.getElementById('bmc-gold-th-today'), th2=document.getElementById('bmc-gold-th-prev');
      if(th1) th1.innerHTML='Today<small>'+tag+'</small>';
      if(th2) th2.innerHTML='<span class="bmc-gold-long">Previous day</span><span class="bmc-gold-short">Prev. day</span><small>'+tag+'</small>';
      KARATS.forEach(function(k){
        var t=isNum(R[k])?conv(R[k])*m:null;
        var p=(P&&isNum(P[k]))?conv(P[k])*m:null;
        var d=(t!=null&&p!=null)?t-p:null;
        var dTxt=d==null?'-':'<span class="'+(d>0.0001?'bmc-gold-up':d<-0.0001?'bmc-gold-down':'')+'">'+(d>0?'+':d<0?'-':'')+fmt(Math.abs(d))+'</span>';
        html+='<tr'+(k==='24'?' class="is-hl"':'')+'>'
          +'<td class="is-left">'+KLABEL[k]+'<small>'+KNOTE[k]+'</small></td>'
          +'<td>'+fmt(t)+'</td>'
          +'<td>'+fmt(p)+'</td>'
          +'<td class="is-last">'+dTxt+'</td></tr>';
      });
      tb.innerHTML=html;
    }

    /* ---------- Spot ---------- */
    function renderSpot(){
      var oz=spotUsdOz, gUsd=isNum(oz)?oz/OZ:null, gAed=isNum(gUsd)?gUsd*PEG:null;
      var set=function(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; };
      set('bmc-gold-s-oz', money(oz,'USD'));
      set('bmc-gold-s-gaed', money(gAed,'AED'));
      set('bmc-gold-s-gusd', money(gUsd,'USD'));
      set('bmc-gold-s-tola', money(isNum(gAed)?gAed*TOLA:null,'AED', 0));
      var n=document.getElementById('bmc-gold-spot-note');
      if(n){
        var t='';
        if(spotAt){ var d=new Date(spotAt); if(!isNaN(d)){ var u=new Date(d.getTime()+4*3600e3); t=' Updated at '+('0'+u.getUTCHours()).slice(-2)+':'+('0'+u.getUTCMinutes()).slice(-2)+' UAE time on '+dmy(u.toISOString().slice(0,10))+'.'; } }
        var prem = (isNum(R['24'])&&isNum(gAed)) ? ' Today the Dubai 24K retail rate is <strong>'+fmt((R['24']/gAed-1)*100,1)+'%</strong> above spot.' : '';
        n.innerHTML='Spot price of fine gold (999.9) on the international market, converted to dirhams at the official peg of AED 3.6725 per US dollar.'+t+prem+' Retail rates are higher because they include the refining and trading premium.';
      }
      renderSim();
    }

    /* ---------- Chart ---------- */
    var HIST = (DATA.history||[]).filter(function(r){ return isNum(r.g); });
    var chart=null, range=365;
    function loadChartJS(cb){
      if(window.Chart){ cb(); return; }
      var s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js'; s.onload=cb; document.head.appendChild(s);
    }
    function sliceRange(){
      if(!HIST.length) return [];
      var last=new Date(HIST[HIST.length-1].d), from=new Date(last.getTime()-(range===21?31:range===63?92:366)*864e5);
      return HIST.filter(function(r){ return new Date(r.d)>=from; });
    }
    function drawChart(){
      var rows=sliceRange(); if(!rows.length) return;
      var first=rows[0].g, lastv=rows[rows.length-1].g, ch=(lastv/first-1)*100;
      var top=document.getElementById('bmc-gold-chart-top');
      if(top) top.innerHTML='<span>AED '+fmt(lastv)+' per gram on '+dmy(rows[rows.length-1].d)+'</span><span class="'+(ch>=0?'bmc-gold-up':'bmc-gold-down')+'">'+(ch>=0?'+':'-')+fmt(Math.abs(ch),1)+'% in this period</span>';
      var accent=(getComputedStyle(document.documentElement).getPropertyValue('--colors--accent-blue')||'').trim()||'#2E90FA';
      var cfg={ type:'line',
        data:{ labels:rows.map(function(r){ var p=r.d.split('-'); return p[2]+'/'+p[1]+'/'+p[0].slice(2); }),
          datasets:[{ label:'24K per gram (AED)', data:rows.map(function(r){return r.g;}), borderColor:accent, backgroundColor:accent, borderWidth:2, pointRadius:0, pointHoverRadius:4, tension:0.2, fill:false }] },
        options:{ responsive:true, maintainAspectRatio:false, animation:false, interaction:{ mode:'index', intersect:false },
          plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#121721', borderRadius:8, padding:10, titleColor:'#fff', bodyColor:'#E9ECF1', displayColors:false,
            callbacks:{ label:function(c){ return 'AED '+fmt(c.parsed.y)+' per gram'; } } } },
          scales:{ x:{ grid:{display:false}, ticks:{ color:'#4F5969', font:{family:'Inter',size:11}, maxRotation:0, autoSkip:true, maxTicksLimit:7 } },
                   y:{ grid:{color:'#E9ECF1'}, ticks:{ color:'#4F5969', font:{family:'Inter',size:11}, callback:function(v){ return fmt(v,0); } } } } } };
      if(chart){ chart.data=cfg.data; chart.options=cfg.options; chart.update(); }
      else { chart=new Chart(document.getElementById('bmc-gold-canvas').getContext('2d'), cfg); }
    }

    /* ---------- Calculator ---------- */
    var simK='22', simU='g';
    function renderSim(){
      var w=parseNum(document.getElementById('bmc-gold-w').value);
      var grams=w*(simU==='tola'?TOLA:simU==='oz'?OZ:1);
      var rate=R[simK];
      var retail=isNum(rate)?grams*rate:null;
      var spotG=isNum(spotUsdOz)?spotUsdOz/OZ*PEG:null;
      var content=isNum(spotG)?grams*PURITY[simK]*spotG:null;
      var set=function(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; };
      set('bmc-gold-r-grams', fmt(grams, grams%1?2:0)+' g');
      set('bmc-gold-r-rate', money(rate,'AED')+' per gram ('+KLABEL[simK]+')');
      set('bmc-gold-r-retail', money(retail,'AED'));
      set('bmc-gold-r-usd', money(isNum(retail)?retail/PEG:null,'USD'));
      set('bmc-gold-r-spot', money(content,'AED'));
    }

    /* ---------- Daily DJG history ---------- */
    function renderHist(){
      var rows=(DATA.djgDays||[]).slice().reverse();
      var block=document.getElementById('bmc-gold-hist-block');
      if(rows.length<2){ if(block) block.style.display='none'; return; }
      var tb=document.getElementById('bmc-gold-hist-tbody'), html='';
      rows.forEach(function(r,i){
        html+='<tr'+(i===0?' class="is-hl"':'')+(i>=10?' data-extra="1"':'')+'>'
          +'<td class="is-left">'+dmy(r.d).replace(/\/(\d{2})(\d{2})$/,'/$2')+'</td><td>'+fmt(r.r24)+'</td><td>'+fmt(r.r22)+'</td><td>'+fmt(r.r21)+'</td><td class="is-last">'+fmt(r.r18)+'</td></tr>';
      });
      tb.innerHTML=html;
      var more=document.getElementById('bmc-gold-more');
      var extras=tb.querySelectorAll('tr[data-extra]');
      if(!extras.length){ more.style.display='none'; return; }
      more.addEventListener('click',function(){
        var open=!!tb.querySelector('tr[data-extra].is-shown');
        extras.forEach(function(t){ t.classList.toggle('is-shown', !open); });
        more.textContent=open?'Show more days':'Show fewer days';
      });
    }

    /* ---------- Wiring ---------- */
    function pills(id, attr, cb){
      var box=document.getElementById(id); if(!box) return;
      box.addEventListener('click',function(e){
        var b=e.target.closest('button'); if(!b) return;
        box.querySelectorAll('button').forEach(function(x){ x.classList.remove('is-active'); });
        b.classList.add('is-active'); cb(b.getAttribute(attr));
      });
    }
    pills('bmc-gold-cur','data-v',function(v){ cur=v; renderKarats(); });
    pills('bmc-gold-unit','data-v',function(v){ unit=v; renderKarats(); });
    pills('bmc-gold-ranges','data-range',function(v){ range=+v; if(window.Chart) drawChart(); });
    pills('bmc-gold-k','data-k',function(v){ simK=v; renderSim(); });
    pills('bmc-gold-u','data-u',function(v){ simU=v; renderSim(); });
    var wEl=document.getElementById('bmc-gold-w'); if(wEl) wEl.addEventListener('input', renderSim);

    renderHero(); renderKarats(); renderSpot(); renderHist();
    loadChartJS(drawChart);

    /* Live spot on top of the stored value (falls back silently) */
    fetch(SPOT_URL,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){
      var p=parseFloat(j && j.price);
      if(isFinite(p) && p>500 && p<50000){ spotUsdOz=p; spotAt=j.updatedAt||new Date().toISOString(); renderSpot(); }
    }).catch(function(){});
  }

  function injectCSS(){
    if(!document.getElementById('bmc-gold-style')){
      var st=document.createElement('style'); st.id='bmc-gold-style'; st.textContent=CSS;
      (document.head||document.documentElement).appendChild(st);
    }
  }

  function boot(DATA){
    injectCSS();
    var root=document.getElementById('bmc-gold'); if(!root) return;
    root.innerHTML=HTML;
    run(DATA);
  }

  function start(){
    injectCSS();
    var u=DATA_URL+'?d='+new Date().toISOString().slice(0,13);
    fetch(u,{cache:'no-store'})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(boot)
      .catch(function(err){
        console.error('[gold] failed to load data', err);
        var root=document.getElementById('bmc-gold');
        if(root){ root.innerHTML='<p style="font:inherit;color:#98A2B3;margin:0;">Could not load the gold rates. Please try again in a moment.</p>'; }
      });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', start); } else { start(); }
})();
