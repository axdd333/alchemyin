document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  yearSpan.textContent = new Date().getFullYear();

  const links = document.querySelectorAll("[data-scroll], .nav-link");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("data-scroll") || link.getAttribute("href");

      if (!target.startsWith("#")) return;

      e.preventDefault();
      const el = document.querySelector(target);
      const top = el.offsetTop - 60;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
});

