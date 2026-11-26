/**
 * market-data.js — Market snapshot shown in the "Fund types" section.
 *
 * These are SAMPLE figures. Either update them by hand (and set `asOf`),
 * or call window.updateMarketSnapshot(newData) from a script that fetches
 * a real, licensed data feed. Never present sample figures as live prices.
 */
const MARKET_DATA = {
  asOf: null, // e.g. "26 Nov 2026, 3:30 PM IST" — leave null to show "Sample figures"
  indices: [
    { name: 'SENSEX',     value: 79842.50, change: 312.45 },
    { name: 'NIFTY 50',   value: 24178.30, change: 98.60 },
    { name: 'NIFTY BANK', value: 52345.80, change: -124.30 }
  ]
};
