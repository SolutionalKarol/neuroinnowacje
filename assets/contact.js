'use strict';
const contactForm=document.querySelector('#contact-form');
if(contactForm && location.hostname.endsWith('.vercel.app')){
 const title=document.createElement('h3');title.textContent='Napisz do nas';
 const text=document.createElement('p');text.textContent='Skontaktujemy się z Tobą mailowo i pomożemy ustalić termin.';
 const link=document.createElement('a');link.className='button';link.href='mailto:kontakt@ncni.pl';link.textContent='Napisz e-mail';
 const note=document.createElement('p');note.className='fine';note.textContent='Otworzymy Twój program pocztowy. Możesz też napisać na kontakt@ncni.pl.';
 contactForm.replaceChildren(title,text,link,note);
}
if(contactForm && !location.hostname.endsWith('.vercel.app'))contactForm.addEventListener('submit',async event=>{
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
