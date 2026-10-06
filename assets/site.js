'use strict';
const menuLinks = Array.from(document.querySelectorAll('.mobile-nav a'));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!visible) return;
    menuLinks.forEach(link => {
      if (link.hash === '#' + visible.target.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }, {rootMargin: '-15% 0px -45% 0px', threshold: 0});
  menuLinks.forEach(link => {if (!link.hash || (link.pathname !== location.pathname && !(location.pathname === '/' && link.pathname === '/index.html'))) return; const section = document.getElementById(link.hash.slice(1)); if(section) observer.observe(section);});
}

// Videos load only when the visitor chooses to watch.
document.querySelectorAll('.video-stage[data-video]').forEach(stage => {
 const button=stage.querySelector('.video-play');
 button.addEventListener('click',()=>{
  const video=document.createElement('video');
  video.controls=true;video.playsInline=true;video.preload='none';
  video.src=stage.dataset.video;
  video.setAttribute('aria-label',button.getAttribute('aria-label').replace('Odtwórz film: ',''));
  video.tabIndex=0;
  video.addEventListener('error',()=>{stage.closest('.video-card').querySelector('.video-error').hidden=false;});
  document.querySelectorAll('.video-stage video').forEach(other=>other.pause());
  button.replaceWith(video);video.focus({preventScroll:true});
  video.play().catch(()=>{ /* Native controls permit another play attempt. */ });
 });
});
document.addEventListener('visibilitychange',()=>{if(document.hidden) document.querySelectorAll('video').forEach(v=>v.pause());});
