/* ============================================
   PARTICLE SYSTEM (Ultra-Smooth Rotating Atmospheric Variant)
   ============================================ */
(function () {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // Muted, low-intensity RGBA configurations to prevent distracting the user
  const COLORS = [
    { rgb: '59, 130, 246', fillAlpha: 0.04, borderAlphaMax: 0.18 },  // Muted Neon Blue
    { rgb: '255, 153, 0',  fillAlpha: 0.04, borderAlphaMax: 0.18 },  // Muted Amber Gold
    { rgb: '255, 200, 80',  fillAlpha: 0.04, borderAlphaMax: 0.18 },  // Muted Warm Gold
  ];

  const PARTICLE_COUNT = 40;
  let particles = [];
  let W, H;

  const mouse = {
    x: null,
    y: null,
    radius: 140 
  };

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const config = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      size: randomBetween(4, 10),
      rgbStr: config.rgb,
      fillAlphaSetting: config.fillAlpha,
      borderAlphaMax: config.borderAlphaMax,
      vx: randomBetween(-3.5, 3.5),
      vy: randomBetween(-4.5, -1.5),
      twinkleSpeed: randomBetween(0.003, 0.009),
      twinkleOffset: Math.random() * Math.PI * 2,
      
      // ROTATION SETTINGS: Starting angle and an incredibly slow rotation speed factor
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: randomBetween(-0.15, 0.15) // Radians per second (negative spins left, positive right)
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
    const dynamicAlphaModifier = (0.6 + 0.4 * twinkle);
    
    const borderAlpha = Math.max(0.04, p.borderAlphaMax * dynamicAlphaModifier);
    const fillAlpha = Math.max(0.01, p.fillAlphaSetting * dynamicAlphaModifier);

    ctx.save();

    // Move the canvas origin point directly to the center of the particle
    ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
    // Rotate the canvas context around that center point smoothly
    ctx.rotate(p.angle);

    // Draw the square aligned perfectly at the new rotated origin point
    const renderOffset = -p.size / 2;

    // 1. Faint Semi-Transparent Fill Area
    ctx.fillStyle = `rgba(${p.rgbStr}, ${fillAlpha})`;
    ctx.fillRect(renderOffset, renderOffset, p.size, p.size);

    // 2. Faint Outline Border
    ctx.strokeStyle = `rgba(${p.rgbStr}, ${borderAlpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(renderOffset, renderOffset, p.size, p.size);

    ctx.restore();
  }

  let lastTime = 0;

  function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    const t = timestamp / 1000;
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update position coordinates
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Update rotation angle cleanly scaled by delta time
      p.angle += p.rotationSpeed * dt;

      // Smooth, slow cursor avoidance
      if (mouse.x !== null && mouse.y !== null) {
        let dx = p.x - mouse.x;
        let dy = p.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;

          p.x += forceDirectionX * force * 55 * dt;
          p.y += forceDirectionY * force * 55 * dt;
        }
      }

      // Wrap around screen edges seamlessly (extended boundary padding slightly to hide rotating edges)
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) {
        p.y = H + 20;
        p.x = randomBetween(0, W);
      }
      if (p.y > H + 20) p.y = -20;

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

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

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
   SKILL BAR ANIMATION (Intersection Observer Fixed)
   ============================================ */
(function () {
  const bars = document.querySelectorAll('.skill-bar-fill');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.getAttribute('data-width');
          
          // Force execution on the next rendering frame to ensure the browser processes the change
          requestAnimationFrame(() => {
            bar.style.width = targetWidth + '%';
          });
          
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.15 } // Lowered threshold slightly so it triggers reliably on all screen heights
  );

  bars.forEach(bar => {
    // If the bar hasn't intersected yet, we safely keep it at 0
    if (!bar.style.width) {
      bar.style.width = '0%';
    }
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
