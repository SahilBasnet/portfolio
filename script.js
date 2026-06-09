/* ============================================
   PARTICLE SYSTEM
   ============================================ */
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  const COLORS = [
    'rgba(59, 130, 246, ALPHA)',  // neon blue
    'rgba(255, 153,   0, ALPHA)', // amber gold
    'rgba(255, 200,  80, ALPHA)', // warm gold
  ];

  const PARTICLE_COUNT = 35;
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const colorTemplate = COLORS[Math.floor(Math.random() * COLORS.length)];
    const alpha = randomBetween(0.18, 0.55);
    const color = colorTemplate.replace('ALPHA', alpha.toFixed(2));

    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      size: randomBetween(1.5, 3.5),
      color,
      baseAlpha: alpha,
      alpha,
      vx: randomBetween(-0.08, 0.08),
      vy: randomBetween(-0.09, -0.03),
      twinkleSpeed: randomBetween(0.004, 0.012),
      twinkleOffset: Math.random() * Math.PI * 2,
      glowing: Math.random() > 0.65,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p, t) {
    const twinkle = Math.sin(t * p.twinkleSpeed * 60 + p.twinkleOffset);
    const displayAlpha = Math.max(0.05, p.baseAlpha * (0.55 + 0.45 * twinkle));

    ctx.save();
    ctx.globalAlpha = displayAlpha;

    if (p.glowing) {
      const glowColor = p.color.replace('ALPHA', '0.12');
      ctx.shadowColor = glowColor.replace('rgba', 'rgb').replace(/,\s*[\d.]+\)/, ')');
      ctx.shadowBlur = 8;
    }

    // Draw a crisp pixel square
    ctx.fillStyle = p.color.replace(/,\s*[\d.]+\)/, ', ' + displayAlpha.toFixed(2) + ')');
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    ctx.restore();
  }

  let lastTime = 0;

  function animate(timestamp) {
    const t = timestamp / 1000;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) {
        p.y = H + 10;
        p.x = randomBetween(0, W);
      }
      if (p.y > H + 10) p.y = -10;

      drawParticle(p, t);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  requestAnimationFrame(animate);
})();


/* ============================================
   SMOOTH SCROLLING + ACTIVE NAV
   ============================================ */
(function () {
  const navLinks = document.querySelectorAll('.nav-icon[href^="#"]');
  const sections = document.querySelectorAll('.section');

  // Smooth scroll on click
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Active link on scroll (IntersectionObserver)
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ============================================
   SKILL BAR ANIMATION (Intersection Observer)
   ============================================ */
(function () {
  const bars = document.querySelectorAll('.skill-bar-fill');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.getAttribute('data-width');
          bar.style.width = targetWidth + '%';
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
})();


/* ============================================
   PROJECT CARD GLOW ON HOVER
   ============================================ */
(function () {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });

    card.addEventListener('mouseleave', function () {
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
})();


/* ============================================
   CONTACT FORM HANDLER
   ============================================ */
function handleContactSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  const original = btn.innerHTML;
  btn.innerHTML = '✓ SENT!';
  btn.style.color = '#22d3a4';
  btn.style.borderColor = 'rgba(34, 211, 164, 0.4)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.color = '';
    btn.style.borderColor = '';
    btn.disabled = false;
    e.target.reset();
  }, 2800);
}

/* ============================================
   TYPING CURSOR — already handled via CSS
   Nav tooltip enhancement: close on outside click
   ============================================ */
(function () {
  // Stagger-in page entrance on load
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    heroContent.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    window.addEventListener('load', () => {
      setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
      }, 120);
    });
  }

  // Animate section headers when they enter viewport
  const headers = document.querySelectorAll('.section-header, .about-left, .skill-board, .video-container, .contact-grid');
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  headers.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
    el.classList.add('fade-in-target');
    fadeObserver.observe(el);
  });

  // When IntersectionObserver fires, we add .visible
  // We need to handle the class toggle via style (not CSS class because CSS isn't loaded yet when JS runs)
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .fade-in-target.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(styleEl);

  // Add delay to skill board child elements
  const skillItems = document.querySelectorAll('.skill-item');
  skillItems.forEach((item, i) => {
    item.style.transitionDelay = (i * 0.07) + 's';
  });
})();
