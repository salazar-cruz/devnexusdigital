(() => {
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");

  let dpr = 1;
  let w = 0;
  let h = 0;
  let particles = [];
  const mouse = { x: 0, y: 0, active: false };

  function resize() {
    dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(42, Math.min(92, Math.floor((w * h) / 19000)));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      r: 1 + Math.random() * 1.8,
      a: .18 + Math.random() * .42
    }));
  }

  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  addEventListener("pointerleave", () => mouse.active = false);

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.vx += (dx / dist) * force * .012;
          p.vy += (dy / dist) * force * .012;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= .995;
      p.vy *= .995;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * .18;
          ctx.strokeStyle = `rgba(145,244,235,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.fillStyle = `rgba(246,240,228,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  resize();
  tick();
})();
