# Jeet.com website

A static website: plain HTML, CSS and JavaScript. It has no build step, so you can open `index.html` in a browser or upload the folder to any web host (Netlify, Vercel, GitHub Pages, Hostinger, cPanel and so on).

```
index.html            Home page (all sections)
legal.html            Disclosures, privacy policy, terms, grievance redressal
css/style.css         All styles
js/main.js            Menu, scroll effects, inquiry form  ← SITE settings at the top
js/calculator.js      SIP / Step-up / Lumpsum calculator and hero chart
js/market.js          Market snapshot renderer
data/market-data.js   Market snapshot figures (sample)
```

## Before you go live: replace these placeholders

| What | Where |
|---|---|
| ARN number `ARN-XXXXXX` | index.html (utility bar, about, footer), legal.html |
| EUIN `EXXXXXX`, registration dates | index.html footer |
| Your full legal name | legal.html → Disclosures |
| Phone `+91 98765 43210`, `+91 22 4567 8901` | index.html, legal.html, `SITE.whatsapp` in js/main.js |
| Emails `invest@jeet.com`, `support@jeet.com` | index.html, legal.html, `SITE.email` in js/main.js |
| Office address | index.html (contact + JSON-LD at the top) |
| Your photo | index.html → About section (instructions are in a comment there) |
| Figures: 1,500 families, ₹50 Cr, 2,000 SIPs, 2018 | index.html → hero stats and about. They must be true. |
| Domain `www.jeet.com` | `og:url` and the JSON-LD block in index.html |

Tip: use your editor's "Find in all files" for `XXXX` and `98765`.

## Inquiry form
The site has no server, so the form does not email you on its own. When a visitor submits it, they see **Send on WhatsApp** and **Send by email** buttons with all their details filled in.

To also receive submissions automatically, create a free form on Formspree (or a similar service) and paste its URL into `formEndpoint` in `js/main.js`.

## Market snapshot
`data/market-data.js` holds **sample** index values and the site labels them as "Sample figures · not live". To show real values, update them by hand and set `asOf`, or call `window.updateMarketSnapshot(data)` from a licensed data feed. Never show simulated prices as live.

## Compliance notes (please review with NJ Wealth / AMFI guidelines)
- The site describes you as a **Mutual Fund Distributor**, not an "adviser". Only SEBI-registered Investment Advisers may use that title.
- Performance claims (for example "+18.4% CAGR") and client testimonials were removed. Calculator results are labelled as illustrations.
- The standard risk statement, ARN/EUIN, and commission disclosure are shown in the footer and on legal.html.
- The ELSS / Section 80C wording notes that the deduction applies only under the old tax regime.
