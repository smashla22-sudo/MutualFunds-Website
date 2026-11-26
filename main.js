/**
 * main.js — Navigation, scroll effects, counters and the inquiry form.
 */
(function () {
  'use strict';

  /* ── Site settings: change these in one place ───────────── */
  const SITE = {
    whatsapp: '919876543210',   // country code + number, no "+" or spaces
    email: 'invest@jeet.com',
    // Optional: a form service URL (e.g. Formspree "https://formspree.io/f/xxxx").
    // When set, inquiries are also posted there automatically.
    formEndpoint: ''
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile navigation ─────────────────────────────────── */
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const scrim = document.getElementById('nav-scrim');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    scrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  scrim?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width: 1021px)').addEventListener?.('change', e => { if (e.matches) setMenu(false); });

  /* ── Header shadow on scroll ───────────────────────────── */
  const header = document.getElementById('header');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Active nav link ───────────────────────────────────── */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(s => navObs.observe(s));
  }

  /* ── Reveal on scroll (only below-the-fold content) ───── */
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-reveal');
    const vh = window.innerHeight;
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el, i) => {
      if (el.getBoundingClientRect().top < vh) return; // already on screen: leave visible
      el.classList.add('is-pending');
      // small stagger for siblings in grids
      const idx = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = Math.min(idx, 5) * 60 + 'ms';
      revealObs.observe(el);
    });
  }

  /* ── Count-up for hero stats (numbers are already in the HTML) ── */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const start = performance.now(), dur = 1400;
        const step = t => {
          const p = Math.min((t - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));
  }

  /* ── Calculator CTA carries the plan into the form ─────── */
  document.getElementById('calc-cta')?.addEventListener('click', () => {
    const msg = document.getElementById('c-message');
    const tab = document.querySelector('.calc__tab.is-active')?.textContent || 'SIP';
    const amt = document.getElementById('in-amount')?.value;
    const yrs = document.getElementById('in-years')?.value;
    const total = document.getElementById('out-total')?.textContent;
    if (msg && !msg.value) {
      msg.value = `I used the calculator: ${tab} of ₹${Number(amt).toLocaleString('en-IN')} for ${yrs} years (estimated ${total}). I'd like to discuss a plan.`;
    }
  });

  /* ── Inquiry form ──────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (!form) return;

  const $ = id => document.getElementById(id);
  const done = $('form-done');
  const submitBtn = $('c-submit');

  // No past dates for appointments
  const date = $('c-date');
  if (date) {
    const d = new Date();
    date.min = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function setError(id, msg) {
    const input = $(id), err = $(id + '-error');
    input?.classList.toggle('is-invalid', !!msg);
    input?.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }

  ['c-name', 'c-phone', 'c-email', 'c-inquiry', 'c-consent'].forEach(id => {
    $(id)?.addEventListener('input', () => setError(id, ''));
    $(id)?.addEventListener('change', () => setError(id, ''));
  });

  function validate() {
    let firstBad = null;
    const fail = (id, msg) => { setError(id, msg); firstBad = firstBad || id; };

    const name = $('c-name').value.trim();
    const phone = $('c-phone').value.replace(/[\s\-()]/g, '');
    const email = $('c-email').value.trim();

    if (name.length < 2) fail('c-name', 'Please enter your name.');
    if (!phone) fail('c-phone', 'Please enter a phone number so Jeet can reach you.');
    else if (!/^(\+?91|0)?[6-9]\d{9}$/.test(phone) && !/^\+\d{8,15}$/.test(phone)) fail('c-phone', 'Enter a 10-digit mobile number, e.g. 98765 43210.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('c-email', 'This email address looks incomplete. Check it or leave it blank.');
    if (!$('c-inquiry').value) fail('c-inquiry', 'Choose what you would like to discuss.');
    if (!$('c-consent').checked) fail('c-consent', 'Please tick the box so Jeet can contact you.');

    if (firstBad) $(firstBad).focus();
    return !firstBad;
  }

  function buildMessage() {
    const v = id => $(id)?.value.trim();
    const method = form.querySelector('input[name="contact-method"]:checked')?.value;
    const lines = [
      'New inquiry from Jeet.com',
      `Name: ${v('c-name')}`,
      `Phone: ${v('c-phone')}`,
      v('c-email') && `Email: ${v('c-email')}`,
      v('c-city') && `City: ${v('c-city')}`,
      `Topic: ${v('c-inquiry')}`,
      v('c-budget') && `Monthly amount: ${v('c-budget')}`,
      (v('c-date') || v('c-time') || v('c-mode')) && `Preferred meeting: ${[v('c-date'), v('c-time'), v('c-mode')].filter(Boolean).join(', ')}`,
      v('c-message') && `Message: ${v('c-message')}`,
      method && `Contact by: ${method}`
    ];
    return lines.filter(Boolean).join('\n');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const text = buildMessage();
    $('done-wa').href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
    $('done-mail').href = `mailto:${SITE.email}?subject=${encodeURIComponent('Consultation request – ' + $('c-name').value.trim())}&body=${encodeURIComponent(text)}`;

    if (SITE.formEndpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch(SITE.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ message: text, email: $('c-email').value.trim() })
        });
        if (res.ok) {
          done.querySelector('h3').textContent = 'Thank you. Your inquiry has been sent.';
          done.querySelector('p').textContent = 'Jeet will get back to you within one working day. For a faster reply, you can also send it on WhatsApp.';
        }
      } catch (_) { /* fall back to WhatsApp / email buttons */ }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send inquiry';
    }

    submitBtn.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  // Editing the form again shows the submit button
  form.addEventListener('input', () => { if (!done.hidden) { done.hidden = true; submitBtn.hidden = false; } });

  /* ── Footer year ───────────────────────────────────────── */
  const year = $('year');
  if (year) year.textContent = new Date().getFullYear();
})();
