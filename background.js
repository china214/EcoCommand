
/*
  EcoCommand
  Animated Environmental Monitoring Background

  Visual inspiration:
  - Temperature and humidity monitoring
  - IoT sensor networks
  - Sustainable food storage
  - Environmental data visualization
*/

(() => {
  const canvas = document.getElementById("cv-bg");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* ---------- EcoCommand Color Palette ---------- */

  const COLORS = {
    primary: "#70b982",
    secondary: "#a8e6b5",
    accent: "#39875b",
    line: "rgba(112, 185, 130, 0.16)",
    grid: "rgba(168, 230, 181, 0.045)",
    text: "rgba(168, 230, 181, 0.65)",
  };

  /* ---------- Configuration ---------- */

  const GRID_SIZE = 40;
  const CONNECTION_DISTANCE = 150;

  const LABELS = [
    "TEMP  04.2°C",
    "HUMIDITY  62%",
    "SHT31 SENSOR",
    "I²C DATA",
    "COOLING ACTIVE",
    "SYSTEM ONLINE",
    "RASPBERRY PI",
    "THERMOELECTRIC",
  ];

  let width = 0;
  let height = 0;

  let particles = [];

  let animationId = null;
  let lastFrame = 0;

  const random = (min, max) =>
    min + Math.random() * (max - min);

  const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

  /* ---------- Create Particles ---------- */

  function createParticle() {
    return {
      x: random(0, width),
      y: random(0, height),

      radius: random(1.2, 2.8),

      vx: random(-0.18, 0.18),
      vy: random(-0.18, 0.18),

      alpha: random(0.25, 0.75),

      phase: random(0, Math.PI * 2),

      label:
        Math.random() > 0.86
          ? LABELS[
              Math.floor(Math.random() * LABELS.length)
            ]
          : null,

      labelOffset: random(12, 24),
    };
  }

  /* ---------- Resize Canvas ---------- */

  function resize() {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particleCount = clamp(
      Math.round((width * height) / 18000),
      25,
      90
    );

    particles = Array.from(
      { length: particleCount },
      createParticle
    );

    if (reduceMotion.matches) {
      draw(0);
    }
  }

  /* ---------- Draw Background Grid ---------- */

  function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += GRID_SIZE
    ) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (
      let y = 0;
      y <= height;
      y += GRID_SIZE
    ) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }

  /* ---------- Update Particle Positions ---------- */

  function updateParticles(deltaTime, time) {
    const speed = deltaTime / 16.67;

    for (const particle of particles) {
      particle.x += particle.vx * speed;
      particle.y += particle.vy * speed;

      // Wrap particles around the screen.

      if (particle.x < -10) {
        particle.x = width + 10;
      }

      if (particle.x > width + 10) {
        particle.x = -10;
      }

      if (particle.y < -10) {
        particle.y = height + 10;
      }

      if (particle.y > height + 10) {
        particle.y = -10;
      }

      // Gentle movement inspired by sensor activity.

      particle.alpha =
        0.35 +
        Math.sin(
          time * 0.001 +
          particle.phase
        ) * 0.2;
    }
  }

  /* ---------- Draw Particle Connections ---------- */

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      const particleA = particles[i];

      for (
        let j = i + 1;
        j < particles.length;
        j++
      ) {
        const particleB = particles[j];

        const dx = particleA.x - particleB.x;
        const dy = particleA.y - particleB.y;

        const distance = Math.sqrt(
          dx * dx + dy * dy
        );

        if (distance < CONNECTION_DISTANCE) {
          const opacity =
            (1 - distance / CONNECTION_DISTANCE) *
            0.18;

          ctx.strokeStyle =
            `rgba(112, 185, 130, ${opacity})`;

          ctx.lineWidth = 0.8;

          ctx.beginPath();

          ctx.moveTo(
            particleA.x,
            particleA.y
          );

          ctx.lineTo(
            particleB.x,
            particleB.y
          );

          ctx.stroke();
        }
      }
    }
  }

  /* ---------- Draw Particles ---------- */

  function drawParticles(time) {
    for (const particle of particles) {
      const pulse =
        1 +
        Math.sin(
          time * 0.0015 +
          particle.phase
        ) * 0.25;

      const radius =
        particle.radius * pulse;

      // Soft glow around each sensor point.

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        radius * 3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(112, 185, 130, ${particle.alpha * 0.08})`;

      ctx.fill();

      // Main particle.

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = COLORS.primary;
      ctx.globalAlpha = particle.alpha;

      ctx.fill();

      ctx.globalAlpha = 1;

      // Occasional environmental data labels.

      if (particle.label) {
        drawLabel(particle, time);
      }
    }
  }

  /* ---------- Draw Sensor Data Labels ---------- */

  function drawLabel(particle, time) {
    const float =
      Math.sin(
        time * 0.0008 +
        particle.phase
      ) * 4;

    const x = particle.x + particle.labelOffset;
    const y = particle.y + float;

    ctx.font =
      '10px "SFMono-Regular", Consolas, monospace';

    ctx.fillStyle = COLORS.text;

    ctx.fillText(
      particle.label,
      x,
      y
    );

    // Small indicator beside the label.

    ctx.beginPath();

    ctx.arc(
      x - 6,
      y - 3,
      1.5,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = COLORS.secondary;

    ctx.fill();
  }

  /* ---------- Draw Everything ---------- */

  function draw(time) {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawGrid();

    drawConnections();

    drawParticles(time);
  }

  /* ---------- Animation Loop ---------- */

  function animate(time) {
    const deltaTime = Math.min(
      50,
      time - lastFrame || 16
    );

    lastFrame = time;

    updateParticles(
      deltaTime,
      time
    );

    draw(time);

    animationId =
      requestAnimationFrame(animate);
  }

  /* ---------- Start Animation ---------- */

  function start() {
    cancelAnimationFrame(animationId);

    if (reduceMotion.matches) {
      draw(0);
      return;
    }

    lastFrame = 0;

    animationId =
      requestAnimationFrame(animate);
  }

  /* ---------- Event Listeners ---------- */

  window.addEventListener(
    "resize",
    resize
  );

  reduceMotion.addEventListener(
    "change",
    start
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        start();
      }
    }
  );

  /* ---------- Initialize ---------- */

  resize();

  start();
})();
