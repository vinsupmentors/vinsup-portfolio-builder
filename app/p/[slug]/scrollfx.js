'use client';
import { useEffect } from 'react';

export default function ScrollFX() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(document.querySelectorAll('.reveal'));
    // mark already-visible elements first so nothing flickers
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.9) el.classList.add('in');
    });
    document.documentElement.classList.add('fx');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => {
      if (!el.classList.contains('in')) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
