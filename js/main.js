(() => {
  document.body.classList.add("ready");

  const cursor = document.getElementById("cursor");
  if (cursor && !window.matchMedia("(pointer: coarse)").matches) {
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;

    addEventListener("pointermove", (event) => {
      tx = event.clientX;
      ty = event.clientY;
    });

    const move = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(move);
    };
    move();

    document.querySelectorAll("a, button, .drag-card, [data-tilt], #wordMesh").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
    });
  }

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.14 });

  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${py * -6}deg) rotateY(${px * 7}deg) translateY(-3px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  const portal = document.getElementById("portalWindow");
  if (portal && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addEventListener("scroll", () => {
      const y = Math.min(scrollY, innerHeight);
      portal.style.transform = `translateY(${y * 0.03}px) scale(${1 - y * 0.000045})`;
    }, { passive: true });
  }

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form && status) {
    form.addEventListener("submit", () => {
      status.textContent = "A enviar mensagem...";
    });
  }

  setupDragCards();
  setupWordMesh();
})();

function setupDragCards() {
  document.querySelectorAll(".drag-card").forEach((card) => {
    let active = false;
    let ox = 0;
    let oy = 0;
    let lastX = 0;
    let lastY = 0;
    let vx = 0;
    let vy = 0;
    let raf = null;

    const inertia = () => {
      if (active) return;

      const parent = card.parentElement.getBoundingClientRect();
      const rect = card.getBoundingClientRect();

      let left = rect.left - parent.left + vx;
      let top = rect.top - parent.top + vy;

      if (left < 0 || left > parent.width - rect.width) vx *= -0.55;
      if (top < 0 || top > parent.height - rect.height) vy *= -0.55;

      left = Math.max(0, Math.min(parent.width - rect.width, left));
      top = Math.max(0, Math.min(parent.height - rect.height, top));

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      card.style.right = "auto";

      vx *= 0.88;
      vy *= 0.88;

      if (Math.abs(vx) > 0.3 || Math.abs(vy) > 0.3) raf = requestAnimationFrame(inertia);
    };

    card.addEventListener("pointerdown", (event) => {
      active = true;
      if (raf) cancelAnimationFrame(raf);

      const rect = card.getBoundingClientRect();
      const parent = card.parentElement.getBoundingClientRect();
      ox = event.clientX - rect.left;
      oy = event.clientY - rect.top;
      lastX = event.clientX;
      lastY = event.clientY;

      card.style.left = `${rect.left - parent.left}px`;
      card.style.top = `${rect.top - parent.top}px`;
      card.style.right = "auto";
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", (event) => {
      if (!active) return;

      const parent = card.parentElement.getBoundingClientRect();
      const rect = card.getBoundingClientRect();

      vx = event.clientX - lastX;
      vy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;

      let left = event.clientX - parent.left - ox;
      let top = event.clientY - parent.top - oy;

      left = Math.max(0, Math.min(parent.width - rect.width, left));
      top = Math.max(0, Math.min(parent.height - rect.height, top));

      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
    });

    card.addEventListener("pointerup", (event) => {
      active = false;
      try { card.releasePointerCapture(event.pointerId); } catch (err) {}
      inertia();
    });

    card.addEventListener("pointercancel", () => { active = false; });
  });
}

function setupWordMesh() {
  const canvas = document.getElementById("wordMesh");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const palette = ["#8ef4ec", "#9bbcff", "#f3d39d", "#bff5d8", "#eeb2ca", "#cdbbff", "#f5f1e8"];

  const words = [
    { text: "DPI", size: 35, group: 0 },
    { text: "Dados", size: 31, group: 1 },
    { text: "Interop", size: 30, group: 0 },
    { text: "GovCloud", size: 27, group: 2 },
    { text: "SIGE", size: 27, group: 1 },
    { text: "Ciber", size: 25, group: 3 },
    { text: "APD", size: 24, group: 4 },
    { text: "eGIF", size: 24, group: 0 },
    { text: "Identidade", size: 22, group: 0 },
    { text: "Registos", size: 21, group: 2 },
    { text: "Pagamentos", size: 21, group: 5 },
    { text: "Serviços", size: 20, group: 1 },
    { text: "Procurement", size: 20, group: 2 },
    { text: "TDR", size: 19, group: 4 },
    { text: "BOQ", size: 18, group: 5 },
    { text: "Saúde", size: 19, group: 3 },
    { text: "Educação", size: 19, group: 1 },
    { text: "Eleições", size: 19, group: 2 },
    { text: "BI", size: 18, group: 1 },
    { text: "APIs", size: 18, group: 0 },
    { text: "SOC", size: 17, group: 3 },
    { text: "CERT", size: 17, group: 3 },
    { text: "PMO", size: 17, group: 5 },
    { text: "Roadmap", size: 18, group: 4 }
  ];

  let nodes = [];
  let dragging = null;
  let pointer = { x: 0, y: 0, active: false };
  let dpr = 1;

  function resetNodes() {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.31;

    nodes = words.map((w, i) => {
      const angle = (Math.PI * 2 * i) / words.length - Math.PI / 2;
      const rr = radius * (0.50 + (i % 5) * 0.11);
      return {
        ...w,
        x: cx + Math.cos(angle) * rr + (Math.random() - 0.5) * 30,
        y: cy + Math.sin(angle) * rr + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        tx: cx + Math.cos(angle) * rr,
        ty: cy + Math.sin(angle) * rr,
        r: Math.max(36, w.size * 1.9)
      };
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resetNodes();
  }

  function getPointer(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function findNode(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (Math.hypot(n.x - x, n.y - y) < n.r) return n;
    }
    return null;
  }

  canvas.addEventListener("pointerdown", (event) => {
    const p = getPointer(event);
    pointer = { ...p, active: true };
    dragging = findNode(p.x, p.y);
    if (dragging) {
      dragging.vx = 0;
      dragging.vy = 0;
      canvas.setPointerCapture(event.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    const p = getPointer(event);
    pointer = { ...p, active: true };
    if (dragging) {
      dragging.x += (p.x - dragging.x) * 0.34;
      dragging.y += (p.y - dragging.y) * 0.34;
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    dragging = null;
    pointer.active = false;
    try { canvas.releasePointerCapture(event.pointerId); } catch (err) {}
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = false;
    dragging = null;
  });

  function rounded(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawLabel(n, alpha) {
    ctx.save();
    ctx.font = `900 ${n.size}px Inter, Arial, sans-serif`;
    const textW = ctx.measureText(n.text).width;
    const padX = 16;
    const padY = 10;
    const w = textW + padX * 2;
    const h = n.size + padY * 2;
    const x = n.x - w / 2;
    const y = n.y - h / 2;

    ctx.globalAlpha = alpha;
    rounded(x, y, w, h, Math.min(18, h / 2));
    ctx.fillStyle = "rgba(5,5,5,.54)";
    ctx.fill();
    ctx.strokeStyle = "rgba(245,241,232,.14)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, palette[n.group % palette.length]);
    grad.addColorStop(1, "#f5f1e8");

    ctx.fillStyle = grad;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.text, n.x, n.y + 1);
    ctx.restore();
  }

  function tick() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createRadialGradient(w * 0.50, h * 0.44, 20, w * 0.50, h * 0.44, Math.max(w, h) * 0.62);
    bg.addColorStop(0, "rgba(142,244,236,.11)");
    bg.addColorStop(0.52, "rgba(155,188,255,.055)");
    bg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    for (const n of nodes) {
      if (n !== dragging) {
        n.vx += (n.tx - n.x) * 0.0009;
        n.vy += (n.ty - n.y) * 0.0009;

        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          if (dist < 130) {
            const force = (130 - dist) / 130;
            n.vx += (dx / dist) * force * 0.16;
            n.vy += (dy / dist) * force * 0.16;
          }
        }

        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.935;
        n.vy *= 0.935;

        if (n.x < 40 || n.x > w - 40) n.vx *= -0.72;
        if (n.y < 40 || n.y > h - 40) n.vy *= -0.72;

        n.x = Math.max(36, Math.min(w - 36, n.x));
        n.y = Math.max(54, Math.min(h - 76, n.y));
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const limit = a.group === b.group ? 230 : 150;
        if (dist < limit) {
          const alpha = (1 - dist / limit) * (a.group === b.group ? 0.23 : 0.10);
          ctx.strokeStyle = `rgba(142,244,236,${alpha})`;
          ctx.lineWidth = a.group === b.group ? 1.2 : 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          ctx.quadraticCurveTo(mx, my - 18, b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const near = pointer.active && Math.hypot(n.x - pointer.x, n.y - pointer.y) < 150;
      const alpha = n === dragging ? 1 : near ? 0.96 : 0.84;
      drawLabel(n, alpha);
    }

    requestAnimationFrame(tick);
  }

  resize();
  addEventListener("resize", resize);
  requestAnimationFrame(tick);
}
