const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
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

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const canvas = document.getElementById("network-bg");
const ctx = canvas?.getContext("2d");
let points = [];
let rafId;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  const count = Math.min(72, Math.max(32, Math.floor(window.innerWidth / 22)));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22
  }));
}

function drawNetwork() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const p of points) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        ctx.strokeStyle = `rgba(0, 143, 227, ${0.11 * (1 - dist / 150)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const p of points) {
    ctx.fillStyle = "rgba(0, 189, 214, .22)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  rafId = requestAnimationFrame(drawNetwork);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(rafId);
    resizeCanvas();
    drawNetwork();
  });
}

const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

if (form && statusEl) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const endpoint = form.getAttribute("action") || "";
    if (endpoint.includes("COLOCAR_ID")) {
      statusEl.textContent = "Formulário ainda sem endpoint. Configure o Formspree no ficheiro index.html.";
      statusEl.style.color = "#8a4b00";
      return;
    }

    statusEl.textContent = "A enviar...";
    statusEl.style.color = "#5e6f84";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        form.reset();
        statusEl.textContent = "Mensagem enviada. Obrigado.";
        statusEl.style.color = "#0c7a43";
      } else {
        statusEl.textContent = "Não foi possível enviar. Verifique a configuração do formulário.";
        statusEl.style.color = "#a12a2a";
      }
    } catch (error) {
      statusEl.textContent = "Falha de rede. Tente novamente dentro de instantes.";
      statusEl.style.color = "#a12a2a";
    }
  });
}
