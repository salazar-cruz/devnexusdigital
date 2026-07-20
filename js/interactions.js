(() => {
  const cursor = document.getElementById("cursor");

  if (cursor && !matchMedia("(pointer: coarse)").matches) {
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;

    addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
  }

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  makeDraggable(document.querySelectorAll(".word"));

  function makeDraggable(items) {
    items.forEach((el) => {
      let active = false;
      let ox = 0, oy = 0;
      let lastX = 0, lastY = 0;
      let vx = 0, vy = 0;
      let raf = null;

      const inertia = () => {
        if (active) return;
        const parent = el.parentElement.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        let left = rect.left - parent.left + vx;
        let top = rect.top - parent.top + vy;

        if (left < 0 || left > parent.width - rect.width) vx *= -0.55;
        if (top < 0 || top > parent.height - rect.height) vy *= -0.55;

        left = Math.max(0, Math.min(parent.width - rect.width, left));
        top = Math.max(0, Math.min(parent.height - rect.height, top));

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.right = "auto";
        el.style.bottom = "auto";

        vx *= .88;
        vy *= .88;

        if (Math.abs(vx) > .3 || Math.abs(vy) > .3) raf = requestAnimationFrame(inertia);
      };

      el.addEventListener("pointerdown", (e) => {
        active = true;
        if (raf) cancelAnimationFrame(raf);

        const rect = el.getBoundingClientRect();
        const parent = el.parentElement.getBoundingClientRect();

        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        lastX = e.clientX;
        lastY = e.clientY;

        el.style.left = `${rect.left - parent.left}px`;
        el.style.top = `${rect.top - parent.top}px`;
        el.style.right = "auto";
        el.style.bottom = "auto";

        el.setPointerCapture(e.pointerId);
      });

      el.addEventListener("pointermove", (e) => {
        if (!active) return;
        const parent = el.parentElement.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        vx = e.clientX - lastX;
        vy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        const left = Math.max(0, Math.min(parent.width - rect.width, e.clientX - parent.left - ox));
        const top = Math.max(0, Math.min(parent.height - rect.height, e.clientY - parent.top - oy));

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
      });

      el.addEventListener("pointerup", (e) => {
        active = false;
        try { el.releasePointerCapture(e.pointerId); } catch {}
        inertia();
      });

      el.addEventListener("pointercancel", () => active = false);
    });
  }
})();
