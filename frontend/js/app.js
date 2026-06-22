document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 0. Animated Tech Background
  // ==========================================
  const techCanvas =
    document.getElementById('tech-background');

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)');

  if (techCanvas && !prefersReducedMotion.matches) {
    const ctx = techCanvas.getContext('2d');
    const signals = [];
    const binaryDrops = [];
    let nodes = [];
    let width = 0;
    let height = 0;
    let animationFrame;
    let frame = 0;

    function resizeTechCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      techCanvas.width = Math.floor(width * dpr);
      techCanvas.height = Math.floor(height * dpr);
      techCanvas.style.width = `${width}px`;
      techCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const spacing = width < 700 ? 110 : 150;
      nodes = [];

      for (let y = spacing * 0.8; y < height; y += spacing) {
        for (let x = spacing * 0.5; x < width; x += spacing) {
          const jitterX = Math.sin((x + y) * 0.013) * 22;
          const jitterY = Math.cos((x - y) * 0.011) * 18;
          nodes.push({
            x: x + jitterX,
            y: y + jitterY,
            pulse: Math.random() * Math.PI * 2
          });
        }
      }

      signals.length = 0;
      for (let i = 0; i < Math.min(18, nodes.length); i++) {
        signals.push({
          from: Math.floor(Math.random() * nodes.length),
          to: Math.floor(Math.random() * nodes.length),
          progress: Math.random(),
          speed: 0.0025 + Math.random() * 0.004
        });
      }

      binaryDrops.length = 0;
      const dropCount = width < 700 ? 18 : 34;
      for (let i = 0; i < dropCount; i++) {
        binaryDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.25 + Math.random() * 0.45,
          value: Math.random() > 0.5 ? '1' : '0'
        });
      }
    }

    function nearestRightNode(node) {
      let candidate = null;
      let bestDistance = Infinity;

      for (const other of nodes) {
        const dx = other.x - node.x;
        const dy = Math.abs(other.y - node.y);
        if (dx > 35 && dx < 190 && dy < 80) {
          const distance = dx + dy;
          if (distance < bestDistance) {
            bestDistance = distance;
            candidate = other;
          }
        }
      }

      return candidate;
    }

    function drawTechBackground() {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1;
      nodes.forEach((node, index) => {
        const target = nearestRightNode(node);
        if (!target) return;

        const alpha = 0.11 + Math.sin(frame * 0.012 + index) * 0.035;
        ctx.strokeStyle = `rgba(255, 191, 0, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo((node.x + target.x) / 2, node.y);
        ctx.lineTo((node.x + target.x) / 2, target.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      for (const signal of signals) {
        const from = nodes[signal.from];
        const to = nodes[signal.to];
        if (!from || !to || from === to) continue;

        signal.progress += signal.speed;
        if (signal.progress > 1) {
          signal.from = Math.floor(Math.random() * nodes.length);
          signal.to = Math.floor(Math.random() * nodes.length);
          signal.progress = 0;
        }

        const x = from.x + (to.x - from.x) * signal.progress;
        const y = from.y + (to.y - from.y) * signal.progress;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
        glow.addColorStop(0, 'rgba(255, 191, 0, 0.58)');
        glow.addColorStop(1, 'rgba(255, 191, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      nodes.forEach((node, index) => {
        const radius = 2.2 + Math.sin(frame * 0.03 + node.pulse) * 0.8;
        ctx.fillStyle = index % 4 === 0
          ? 'rgba(255, 179, 0, 0.42)'
          : 'rgba(255, 191, 0, 0.34)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.font = '12px "Fira Code", monospace';
      for (const drop of binaryDrops) {
        drop.y += drop.speed;
        if (drop.y > height + 30) {
          drop.y = -30;
          drop.x = Math.random() * width;
        }
        if (frame % 40 === 0) {
          drop.value = Math.random() > 0.5 ? '1' : '0';
        }
        ctx.fillStyle = 'rgba(255, 191, 0, 0.16)';
        ctx.fillText(drop.value, drop.x, drop.y);
      }

      animationFrame = requestAnimationFrame(drawTechBackground);
    }

    resizeTechCanvas();
    drawTechBackground();

    window.addEventListener('resize', resizeTechCanvas);

    prefersReducedMotion.addEventListener('change', event => {
      if (event.matches) {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, width, height);
      } else {
        resizeTechCanvas();
        drawTechBackground();
      }
    });
  }

  // ==========================================
  // 1. Navigation Scrolled State & Scroll Indicator Fade
  // ==========================================
  const header = document.querySelector('header');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (scrollIndicator) {
    scrollIndicator.style.transition = 'opacity var(--transition-normal)';
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
      if (scrollIndicator) scrollIndicator.style.opacity = '0';
    } else {
      header?.classList.remove('scrolled');
      if (scrollIndicator) scrollIndicator.style.opacity = '0.6';
    }
  });

  // ==========================================
  // 2. Mobile Menu Toggle
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('active');
    });
  });

  // ==========================================
  // 3. Dynamic Typing Effect
  // ==========================================
  const typingText = document.getElementById('typing-text');

  const roles = [
    'Python Programmer.',
    'Full-Stack Developer.',
    'Software Developer.',
    'AI Support Specialist.',
    'Salesforce Trainee.',
    'MCA Graduate.'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {

    if (!typingText) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingText.textContent =
        currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingText.textContent =
        currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120;
    }

    if (!isDeleting &&
        charIndex === currentRole.length) {

      typingSpeed = 2000;
      isDeleting = true;

    } else if (
      isDeleting &&
      charIndex === 0
    ) {

      isDeleting = false;
      roleIndex =
        (roleIndex + 1) % roles.length;

      typingSpeed = 500;
    }

    setTimeout(typeEffect, typingSpeed);
  }

  if (typingText) {
    typeEffect();
  }

  // ==========================================
  // 4. Skills Hub Filter
  // ==========================================
  const tabButtons =
    document.querySelectorAll('.tab-btn');

  const skillCards =
    document.querySelectorAll('.skill-card');

  tabButtons.forEach(button => {

    button.addEventListener('click', () => {

      tabButtons.forEach(btn =>
        btn.classList.remove('active')
      );

      button.classList.add('active');

      const filterCategory =
        button.getAttribute('data-category');

      skillCards.forEach(card => {

        const cardCategory =
          card.getAttribute('data-category');

        if (
          filterCategory === 'all' ||
          cardCategory === filterCategory
        ) {

          card.style.display = 'flex';

          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);

        } else {

          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';

          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ==========================================
  // 5. Scroll Reveal Animation
  // ==========================================
  const revealElements =
    document.querySelectorAll('.reveal');

  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add('active');

            observer.unobserve(entry.target);
          }
        });

      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

  revealElements.forEach(el =>
    revealObserver.observe(el)
  );

  // ==========================================
  // 6. Navigation Active Links Tracking
  // ==========================================
  const sections =
    document.querySelectorAll('section');

  const scrollSpyObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            const id =
              entry.target.getAttribute('id');

            navLinks.forEach(link => {

              if (
                link.getAttribute('href') ===
                `#${id}`
              ) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });

      },
      {
        threshold: 0.4,
        rootMargin:
          '-20% 0px -40% 0px'
      }
    );

  sections.forEach(sec =>
    scrollSpyObserver.observe(sec)
  );

  // ==========================================
  // 7. Contact Form API Integration
  // ==========================================
  const contactForm =
    document.getElementById(
      'portfolio-contact-form'
    );

  const formFeedback =
    document.getElementById(
      'form-feedback'
    );

  if (contactForm) {

    contactForm.addEventListener(
      'submit',
      async (e) => {

        e.preventDefault();

        const name =
          document
            .getElementById('name')
            ?.value.trim();

        const email =
          document
            .getElementById('email')
            ?.value.trim();

        const message =
          document
            .getElementById('message')
            ?.value.trim();

        if (!name || !email || !message) {

          showFeedback(
            'Please fill out all fields.',
            'error'
          );

          return;
        }

        const submitBtn =
          contactForm.querySelector(
            'button[type="submit"]'
          );

        const originalText =
          submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent =
          'Sending Message...';

        try {

          const response =
            await fetch(
              'https://formsubmit.co/ajax/soumyajitnag2021@gmail.com',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                  'Accept':
                    'application/json'
                },

                body: JSON.stringify({
                  name,
                  email,
                  message
                })
              }
            );

          const data =
            await response.json();

          if (
            response.ok &&
            data.success
          ) {

            showFeedback(
              `Thank you, ${name}! Your message has been sent successfully.`,
              'success'
            );

            contactForm.reset();

          } else {

            showFeedback(
              data.message ||
              'Failed to send message.',
              'error'
            );
          }

        } catch (error) {

          console.error(error);

          showFeedback(
            'Server error. Please try again later.',
            'error'
          );

        } finally {

          submitBtn.disabled = false;
          submitBtn.textContent =
            originalText;
        }
      }
    );
  }

  // ==========================================
  // Form Feedback Function
  // ==========================================
  function showFeedback(text, type) {

    if (!formFeedback) return;

    formFeedback.textContent = text;
    formFeedback.style.display = 'block';

    if (type === 'success') {

      formFeedback.className =
        'form-notification success';

      formFeedback.style.background =
        'rgba(16,185,129,0.1)';

      formFeedback.style.border =
        '1px solid rgba(16,185,129,0.2)';

      formFeedback.style.color =
        '#10b981';

    } else {

      formFeedback.className =
        'form-notification error';

      formFeedback.style.background =
        'rgba(239,68,68,0.1)';

      formFeedback.style.border =
        '1px solid rgba(239,68,68,0.2)';

      formFeedback.style.color =
        '#ef4444';
    }

    setTimeout(() => {
      formFeedback.style.display =
        'none';
    }, 6000);
  }
});
