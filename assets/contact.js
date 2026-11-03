'use strict';
const contactMessages = {"pl": {"sending": "Wysyłanie wiadomości…", "success": "Dziękujemy za wiadomość. Skontaktujemy się z Tobą, żeby ustalić szczegóły.", "limit": "Za dużo prób wysłania. Spróbuj później lub napisz na kontakt@ncni.pl.", "error": "Nie udało się wysłać wiadomości. Sprawdź wpisane dane lub napisz na kontakt@ncni.pl.", "network": "Nie udało się potwierdzić wysłania. Nie wysyłaj ponownie od razu. Możesz napisać na kontakt@ncni.pl lub zadzwonić: +48 600 608 333."}, "en": {"sending": "Sending your message…", "success": "Thank you for your message. We’ll contact you to arrange the details.", "limit": "Too many submission attempts. Please try again later or email kontakt@ncni.pl.", "error": "Your message could not be sent. Please check your details or email kontakt@ncni.pl.", "network": "We couldn’t confirm whether your message was sent. Please don’t submit it again immediately. You can email kontakt@ncni.pl or call +48 600 608 333."}, "fr": {"sending": "Envoi du message…", "success": "Merci pour votre message. Nous vous contacterons pour convenir des détails.", "limit": "Trop de tentatives d’envoi. Réessayez plus tard ou écrivez à kontakt@ncni.pl.", "error": "Le message n’a pas pu être envoyé. Vérifiez les informations saisies ou écrivez à kontakt@ncni.pl.", "network": "Nous n’avons pas pu confirmer l’envoi. Ne renvoyez pas immédiatement le message. Vous pouvez écrire à kontakt@ncni.pl ou appeler le +48 600 608 333."}};
const contactForm = document.querySelector('#contact-form');
if (contactForm) contactForm.addEventListener('submit', async event => {
 event.preventDefault();
 const messages = contactMessages[contactForm.dataset.language] || contactMessages.pl;
 const status = contactForm.querySelector('[role=status]');
 const button = contactForm.querySelector('button[type=submit]');
 if (button.disabled) return;
 button.disabled = true;
 status.textContent = messages.sending;
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
    ? messages.limit
    : messages.error;
   return;
  }
  status.textContent = messages.success;
  contactForm.reset();
 } catch (error) {
  status.textContent = messages.network;
 } finally {
  clearTimeout(timeout);
  button.disabled = false;
 }
});

