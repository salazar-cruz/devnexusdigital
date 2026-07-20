(() => {
  const boot = document.getElementById("boot");
  const bootPercent = document.getElementById("bootPercent");
  let n = 0;

  const timer = setInterval(() => {
    n += Math.ceil(Math.random() * 16);
    if (n >= 100) n = 100;
    if (bootPercent) bootPercent.textContent = String(n).padStart(2, "0");

    if (n === 100) {
      clearInterval(timer);
      setTimeout(() => {
        document.body.classList.add("is-ready");
        boot?.classList.add("is-hidden");
      }, 220);
    }
  }, 42);

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.14 });

  document.querySelectorAll("[data-enter]").forEach((el) => observer.observe(el));

  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form?.addEventListener("submit", () => {
    if (status) status.textContent = "A enviar mensagem...";
  });
})();
