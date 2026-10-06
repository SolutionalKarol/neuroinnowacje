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
  menuLinks.forEach(link => {const section = document.querySelector(link.hash); if(section) observer.observe(section);});
}
