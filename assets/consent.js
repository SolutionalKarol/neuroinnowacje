'use strict';
// Basic consent mode: no Google script is requested before statistics consent.
(() => {
 const GA_ID = 'G-QB3LXQ044V';
 const KEY = 'nn-consent';
 const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
 const read = () => {
  try {
   const value = JSON.parse(localStorage.getItem(KEY));
   return value && ['granted', 'denied'].includes(value.choice) &&
    Date.now() >= value.at && Date.now() - value.at < MAX_AGE ? value.choice : null;
  } catch (e) { return null; }
 };
 let choice = read();
 let loaded = false;
 window['ga-disable-' + GA_ID] = choice !== 'granted';
 window.dataLayer = window.dataLayer || [];
 window.gtag = function(){ window.dataLayer.push(arguments); };
 const consent = value => ({analytics_storage:value, ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
 window.gtag('consent', 'default', consent('denied'));
 const loadAnalytics = () => {
  if (!['neuroinnowacje.pl', 'www.neuroinnowacje.pl'].includes(location.hostname)) return;
  window['ga-disable-' + GA_ID] = false;
  window.gtag('consent', 'update', consent('granted'));
  if (loaded) return;
  loaded = true;
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
   allow_google_signals: false,
   allow_ad_personalization_signals: false,
   page_location: location.origin + location.pathname,
   page_referrer: document.referrer.split(/[?#]/)[0]
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);
 };
 const clearAnalyticsCookies = () => {
  document.cookie.split(';').forEach(item => {
   const name = item.split('=')[0].trim();
   if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) return;
   const domains = ['', location.hostname, '.' + location.hostname, '.neuroinnowacje.pl'];
   const parts = location.pathname.split('/');
   const paths = new Set(['/']);
   while (parts.length > 1) { parts.pop(); paths.add(parts.join('/') || '/'); }
   domains.forEach(domain => paths.forEach(path => {
    document.cookie = name + '=; Max-Age=0; path=' + path + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
   }));
  });
 };
 const apply = value => {
  choice = value;
  if (value === 'granted') loadAnalytics();
  else {
   window['ga-disable-' + GA_ID] = true;
   window.gtag('consent', 'update', consent('denied'));
   clearAnalyticsCookies();
   // Remove the already-running library and its automatic measurement listeners.
   if (loaded) location.reload();
  }
 };
 const showBanner = () => {
  if (document.querySelector('.consent')) return;
  const box = document.createElement('div');
  box.className = 'consent';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Ustawienia plików cookies');
  box.innerHTML = '<p>Za Twoją zgodą użyjemy Google Analytics do statystyk odwiedzin. Możesz odmówić lub później zmienić wybór w ustawieniach cookies w stopce. <a href="https://ncni.pl/regulamin.html">Regulamin i prywatność</a></p><div><button type="button" class="button small" data-choice="granted">Akceptuję statystyki</button><button type="button" class="button small" data-choice="denied">Odrzucam statystyki</button></div>';
  box.addEventListener('click', event => {
   const value = event.target.dataset && event.target.dataset.choice;
   if (!['granted', 'denied'].includes(value)) return;
   try { localStorage.setItem(KEY, JSON.stringify({choice:value, at:Date.now()})); } catch (e) { /* Applies to this page only. */ }
   box.remove();
   apply(value);
   const settings = document.querySelector('[data-consent-settings]');
   if (settings) settings.focus({preventScroll:true});
  });
  document.body.appendChild(box);
  box.querySelector('button').focus({preventScroll:true});
 };
 const start = () => {
  if (choice === 'granted') loadAnalytics();
  else { clearAnalyticsCookies(); if (choice !== 'denied') showBanner(); }
  document.querySelectorAll('[data-consent-settings]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); showBanner(); }));
  // Count contact intent only, never a completed appointment or sent message.
  document.addEventListener('click', event => {
   const link = event.target.closest && event.target.closest('a[href]');
   if (!link || choice !== 'granted' || window['ga-disable-' + GA_ID]) return;
   const href = link.getAttribute('href');
   const name = /^tel:/i.test(href) ? 'contact_phone_click' : /^mailto:/i.test(href) ? 'contact_email_click' : null;
   if (name) window.gtag('event', name, {send_to:GA_ID});
  });
 };
 window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) apply(read() || 'denied');
 });
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
