'use strict';
const contactForm = document.querySelector('#contact-form');
if (contactForm) contactForm.addEventListener('submit', async event => {
 event.preventDefault();
 const status = contactForm.querySelector('[role=status]');
 const button = contactForm.querySelector('button[type=submit]');
 if (button.disabled) return;
 button.disabled = true;
 status.textContent = 'Wysyłanie wiadomości…';
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 20000);
 try {
  const fields = new FormData(contactForm);
  // Keep the endpoint fixed while the older HTML may still be cached.
  fields.delete('website');
  const response = await fetch('https://formspree.io/f/moeepgpy', {
   method: 'POST', body: fields, headers: {Accept: 'application/json'},
   signal: controller.signal
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true) {
   status.textContent = response.status === 429
    ? 'Za dużo prób wysłania. Spróbuj później lub napisz na kontakt@ncni.pl.'
    : 'Nie udało się wysłać wiadomości. Sprawdź wpisane dane lub napisz na kontakt@ncni.pl.';
   return;
  }
  status.textContent = 'Dziękujemy za wiadomość. Skontaktujemy się z Tobą mailowo, żeby ustalić szczegóły.';
  contactForm.reset();
 } catch (error) {
  status.textContent = 'Nie udało się potwierdzić wysłania. Nie wysyłaj ponownie od razu. Możesz skontaktować się z nami pod adresem kontakt@ncni.pl lub numerem 600 608 333.';
 } finally {
  clearTimeout(timeout);
  button.disabled = false;
 }
});
