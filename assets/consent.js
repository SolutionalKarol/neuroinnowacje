'use strict';
// Google Analytics loads only after the visitor accepts statistics cookies.
(() => {
 const GA_ID = 'G-QB3LXQ044V';
 const KEY = 'nn-consent';
 const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
 const save = value => { try { localStorage.setItem(KEY, value); } catch (e) { /* Choice applies to this visit only. */ } };
 let loaded = false;
 const loadAnalytics = () => {
  if (loaded) return; loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
 };
 const showBanner = () => {
  if (document.querySelector('.consent')) return;
  const box = document.createElement('div');
  box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Zgoda na pliki cookies');
  box.innerHTML = '<p>Używamy plików cookies Google Analytics, żeby sprawdzać, jak korzystasz ze strony. Uruchomimy je tylko za Twoją zgodą. <a href="https://ncni.pl/regulamin.html">Regulamin i prywatność</a></p><div><button type="button" class="button small" data-choice="granted">Akceptuję</button><button type="button" class="consent-deny" data-choice="denied">Odrzucam</button></div>';
  box.addEventListener('click', e => {
   const choice = e.target.dataset && e.target.dataset.choice;
   if (!choice) return;
   save(choice); box.remove();
   if (choice === 'granted') loadAnalytics();
  });
  document.body.appendChild(box);
 };
 const start = () => {
  const choice = read();
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') showBanner();
  document.querySelectorAll('[data-consent-settings]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); showBanner(); }));
 };
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
