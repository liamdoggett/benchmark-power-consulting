(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  const navLinks = document.querySelectorAll('[data-nav]');
  const contactForm = document.getElementById('contact-form');
  const formSubmit = document.getElementById('form-submit');
  const formSubmitText = document.getElementById('form-submit-text');
  const formSubmitSpinner = document.getElementById('form-submit-spinner');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function updateNavbar() {
    if (window.scrollY > 20) {
      navbar.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-soft', 'border-b', 'border-slate-100');
    } else {
      navbar.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-soft', 'border-b', 'border-slate-100');
    }
  }

  function toggleMobileMenu() {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuIconOpen.classList.toggle('hidden', !isOpen);
    menuIconClose.classList.toggle('hidden', isOpen);
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
  }

  function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    menuIconOpen.classList.remove('hidden');
    menuIconClose.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              link.classList.toggle('nav-link-active', href === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function setFormLoading(loading) {
    formSubmit.disabled = loading;
    formSubmitText.classList.toggle('hidden', loading);
    formSubmitSpinner.classList.toggle('hidden', !loading);
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const message = formData.get('message')?.toString().trim();
    const honeypot = formData.get('mail')?.toString().trim();

    if (honeypot) return;

    if (!name || !email || !message) {
      alert('Missing or invalid fields. Please try again.');
      return;
    }

    const emailPattern = /^([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9\-\.]+)\.([a-zA-Z]+)$/;
    if (!emailPattern.test(email)) {
      alert('Missing or invalid fields. Please try again.');
      return;
    }

    setFormLoading(true);

    fetch('/post/contact', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed server response');
        return response.json();
      })
      .then((data) => {
        if (!data.result) throw new Error(data.message || 'Submission failed');
        alert("Thank you! We'll be in touch shortly!");
        contactForm.reset();
      })
      .catch(() => {
        alert('Unable to send message at this time. Please try again later.');
      })
      .finally(() => {
        setFormLoading(false);
      });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  initScrollReveal();
  initActiveNav();
})();
