'use strict';
const contactForm=document.querySelector('#contact-form');
if(contactForm)contactForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const status=contactForm.querySelector('[role=status]');
 const button=contactForm.querySelector('button[type=submit]');
 button.disabled=true;status.textContent='Wysyłanie wiadomości…';
 try{
  const session=await fetch('api/contact.php',{credentials:'same-origin',cache:'no-store'});
  if(!session.ok)throw new Error('connection');
  const {token}=await session.json();
  const fields=Object.fromEntries(new FormData(contactForm));
  const response=await fetch('api/contact.php',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,token})});
  const result=await response.json();
  if(!response.ok||!result.ok)throw new Error(result.message||'connection');
  status.textContent='Dziękujemy za wiadomość. Skontaktujemy się z Tobą mailowo, żeby ustalić szczegóły.';
  contactForm.reset();
 }catch(error){
  status.textContent=error.message==='connection'||error instanceof SyntaxError?'Nie udało się wysłać wiadomości. Napisz na kontakt@ncni.pl lub zadzwoń: 600 608 333.':error.message;
 }finally{button.disabled=false;}
});
