/**
 * market.js — Renders the market snapshot from MARKET_DATA.
 * No simulated price movement: figures are shown exactly as supplied.
 */
(function () {
  'use strict';

  const row = document.getElementById('market-row');
  const stamp = document.getElementById('market-stamp');
  if (!row) return;

  const fmt = n => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function render(data) {
    if (!data || !Array.isArray(data.indices)) return;
    stamp.textContent = data.asOf ? 'As of ' + data.asOf : 'Sample figures · not live';
    row.innerHTML = data.indices.map(i => {
      const prev = i.value - i.change;
      const pct = prev ? (i.change / prev) * 100 : 0;
      const up = i.change >= 0;
      const sign = up ? '+' : '−';
      return `
        <div class="idx">
          <div class="idx__name">${i.name}</div>
          <div class="idx__value">${fmt(i.value)}</div>
          <div class="idx__chg ${up ? 'is-up' : 'is-down'}">${sign}${fmt(Math.abs(i.change))} (${sign}${Math.abs(pct).toFixed(2)}%)</div>
        </div>`;
    }).join('');
  }

  // Hook for a real data feed
  window.updateMarketSnapshot = render;

  if (typeof MARKET_DATA !== 'undefined') render(MARKET_DATA);
  else row.closest('.market')?.setAttribute('hidden', '');
})();
