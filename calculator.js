/**
 * calculator.js — SIP / Step-up SIP / Lumpsum calculator + hero illustration
 *
 * SIP: contributions at the start of each month, compounded monthly
 *      (same convention as most AMC calculators):
 *      FV = P × [((1 + r)^n − 1) / r] × (1 + r),  r = annual% / 12 / 100
 * Step-up SIP: monthly amount rises by s% every 12 months.
 * Lumpsum: FV = P × (1 + R)^years, compounded annually.
 */
(function () {
  'use strict';

  const INFLATION = 0.06;

  /* ── Formatting ───────────────────────────── */
  function inr(n) {
    n = Math.round(n);
    if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }
  function inrShort(n) {
    if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(1) + 'Cr';
    if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(0) + 'L';
    if (n >= 1e3) return '₹' + +(n / 1e3).toFixed(0) + 'k';
    return '₹' + Math.round(n);
  }

  /* ── Maths: returns year-by-year [{year, invested, value}] ── */
  function project(mode, amount, ratePct, years, stepPct) {
    const rows = [];
    if (mode === 'lumpsum') {
      for (let y = 1; y <= years; y++) {
        rows.push({ year: y, invested: amount, value: amount * Math.pow(1 + ratePct / 100, y) });
      }
      return rows;
    }
    const r = ratePct / 12 / 100;
    let value = 0, invested = 0, monthly = amount;
    for (let m = 1; m <= years * 12; m++) {
      value = (value + monthly) * (1 + r);
      invested += monthly;
      if (m % 12 === 0) {
        rows.push({ year: m / 12, invested, value });
        if (mode === 'stepup') monthly = monthly * (1 + stepPct / 100);
      }
    }
    return rows;
  }

  /* ── Niceties for chart axes ── */
  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return step * p;
  }

  /* ── Stacked bar chart (calculator) ── */
  function drawBars(el, rows) {
    if (!el) return;
    const W = 480, H = 190, padL = 46, padB = 22, padT = 8, padR = 4;
    const max = niceMax(rows[rows.length - 1].value);
    const iw = W - padL - padR, ih = H - padT - padB;
    const n = rows.length;
    const slot = iw / n;
    const bw = Math.max(2, Math.min(22, slot * 0.68));
    const y = v => padT + ih - (v / max) * ih;

    let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, yy = y(v);
      svg += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,0.08)" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
      svg += `<text x="${padL - 8}" y="${yy + 3.5}" text-anchor="end" font-size="10" fill="#8C9AAE" font-family="IBM Plex Mono, monospace">${inrShort(v)}</text>`;
    }
    const labelEvery = n <= 10 ? 1 : n <= 20 ? 5 : 10;
    rows.forEach((row, i) => {
      const x = padL + i * slot + (slot - bw) / 2;
      const yi = y(Math.min(row.invested, row.value));
      const yv = y(row.value);
      svg += `<rect x="${x}" y="${yv}" width="${bw}" height="${Math.max(0, yi - yv)}" fill="#D8B866"/>`;
      svg += `<rect x="${x}" y="${yi}" width="${bw}" height="${padT + ih - yi}" fill="#5D7392"/>`;
      if (row.year % labelEvery === 0 || (n <= 10)) {
        svg += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#8C9AAE" font-family="IBM Plex Mono, monospace">${row.year}y</text>`;
      }
    });
    svg += '</svg>';
    el.innerHTML = svg;
  }

  /* ── Area chart (hero illustration) ── */
  function drawHero(el, rows) {
    if (!el) return;
    const W = 420, H = 200, padL = 40, padB = 22, padT = 10, padR = 8;
    const max = niceMax(rows[rows.length - 1].value);
    const iw = W - padL - padR, ih = H - padT - padB;
    const x = i => padL + (i / rows.length) * iw;
    const y = v => padT + ih - (v / max) * ih;
    const pts = [{ year: 0, invested: 0, value: 0 }, ...rows];
    const line = key => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
    const base = `L${x(pts.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

    let svg = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs><linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D8B866" stop-opacity="0.35"/><stop offset="1" stop-color="#D8B866" stop-opacity="0"/>
      </linearGradient></defs>`;
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, yy = y(v);
      svg += `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,0.07)"/>`;
      svg += `<text x="${padL - 8}" y="${yy + 3.5}" text-anchor="end" font-size="10" fill="#8C9AAE" font-family="IBM Plex Mono, monospace">${inrShort(v)}</text>`;
    }
    [0, 5, 10, 15].forEach(yr => {
      if (yr > rows.length) return;
      svg += `<text x="${x(yr)}" y="${H - 5}" text-anchor="middle" font-size="10" fill="#8C9AAE" font-family="IBM Plex Mono, monospace">${yr === 0 ? 'Start' : 'Yr ' + yr}</text>`;
    });
    svg += `<path d="${line('value')} ${base}" fill="url(#heroFill)"/>`;
    svg += `<path d="${line('invested')}" fill="none" stroke="#8C9AAE" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    svg += `<path class="hero-line" d="${line('value')}" fill="none" stroke="#D8B866" stroke-width="2.25" stroke-linejoin="round"/>`;
    const last = pts[pts.length - 1];
    svg += `<circle cx="${x(pts.length - 1)}" cy="${y(last.value)}" r="4" fill="#D8B866" stroke="#0E1B2C" stroke-width="2"/>`;
    svg += `<text x="${x(pts.length - 1) - 8}" y="${y(last.invested) - 8}" text-anchor="end" font-size="10" fill="#C9D2DE" font-family="Manrope, sans-serif">Invested</text>`;
    svg += '</svg>';
    el.innerHTML = svg;

    // Gentle draw-in for the growth line
    const path = el.querySelector('.hero-line');
    if (path && path.getTotalLength && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.3,.7,.2,1)';
      requestAnimationFrame(() => { path.style.strokeDashoffset = 0; });
    }
  }

  // Hero: fixed illustration of ₹10,000/month, 15 years, 12%
  const heroRows = project('sip', 10000, 12, 15, 0);
  drawHero(document.getElementById('hero-chart'), heroRows);
  const heroLast = heroRows[heroRows.length - 1];
  const hi = document.getElementById('hero-invested');
  const ht = document.getElementById('hero-total');
  if (hi) hi.textContent = inr(heroLast.invested);
  if (ht) ht.textContent = inr(heroLast.value);

  /* ── Calculator wiring ───────────────────── */
  const calcEl = document.querySelector('.calc');
  if (!calcEl) return;

  const pairs = {
    amount: [document.getElementById('sl-amount'), document.getElementById('in-amount')],
    stepup: [document.getElementById('sl-stepup'), document.getElementById('in-stepup')],
    rate:   [document.getElementById('sl-rate'),   document.getElementById('in-rate')],
    years:  [document.getElementById('sl-years'),  document.getElementById('in-years')],
  };
  const out = {
    invested: document.getElementById('out-invested'),
    gains: document.getElementById('out-gains'),
    total: document.getElementById('out-total'),
    real: document.getElementById('out-real'),
  };
  const tabs = calcEl.querySelectorAll('.calc__tab');
  const stepField = document.getElementById('field-stepup');
  const amountLabel = document.getElementById('lbl-amount');
  const amountMin = document.getElementById('amount-min');
  const amountMax = document.getElementById('amount-max');

  const modeConfig = {
    sip:     { label: 'Monthly investment', min: 500,  max: 200000,   step: 500,  def: 10000 },
    stepup:  { label: 'Starting monthly investment', min: 500, max: 200000, step: 500, def: 10000 },
    lumpsum: { label: 'One-time investment', min: 5000, max: 10000000, step: 5000, def: 500000 },
  };
  let mode = 'sip';

  function fill(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--fill', pct + '%');
  }

  // The number box is the source of truth (it can go beyond the slider's range,
  // e.g. a ₹5 lakh SIP); the slider mirrors it, pinned at its ends.
  function val(key) {
    const [slider, input] = pairs[key];
    const v = parseFloat(input.value);
    if (isNaN(v)) return parseFloat(slider.value);
    return Math.min(parseFloat(input.max), Math.max(parseFloat(input.min), v));
  }

  function update() {
    const rows = project(mode, val('amount'), val('rate'), Math.round(val('years')), val('stepup'));
    const last = rows[rows.length - 1];
    out.invested.textContent = inr(last.invested);
    out.gains.textContent = inr(Math.max(0, last.value - last.invested));
    out.total.textContent = inr(last.value);
    out.real.textContent = inr(last.value / Math.pow(1 + INFLATION, last.year));
    drawBars(document.getElementById('calc-chart'), rows);
    Object.values(pairs).forEach(([s]) => fill(s));
  }

  Object.values(pairs).forEach(([slider, input]) => {
    slider.addEventListener('input', () => { input.value = slider.value; update(); });
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      slider.value = Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), v));
      update();
    });
    input.addEventListener('blur', () => {
      input.value = val(Object.keys(pairs).find(k => pairs[k][1] === input));
      update();
    });
  });

  tabs.forEach(tab => tab.addEventListener('click', () => {
    mode = tab.dataset.mode;
    tabs.forEach(t => { const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    stepField.hidden = mode !== 'stepup';
    const cfg = modeConfig[mode];
    const [slider, input] = pairs.amount;
    amountLabel.textContent = cfg.label;
    slider.min = cfg.min; slider.max = cfg.max; slider.step = cfg.step;
    input.min = cfg.min; input.step = cfg.step; input.max = mode === 'lumpsum' ? 100000000 : 10000000;
    // keep the amount if it still makes sense, otherwise reset to a sensible default
    const cur = parseFloat(input.value);
    if ((mode === 'lumpsum' && cur < 50000) || (mode !== 'lumpsum' && cur > 200000)) {
      input.value = slider.value = cfg.def;
    }
    slider.value = Math.min(cfg.max, Math.max(cfg.min, parseFloat(input.value)));
    amountMin.textContent = inr(cfg.min).replace(' L', 'L');
    amountMax.textContent = mode === 'lumpsum' ? '₹1 Cr' : '₹2,00,000';
    update();
  }));

  update();
})();
