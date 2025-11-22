document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  yearSpan.textContent = new Date().getFullYear();

  const links = document.querySelectorAll("[data-scroll], .nav-link");
  links.forEach(link => {
    link.addEventListener("click", e => {
      const target = link.getAttribute("data-scroll") || link.getAttribute("href");
      if (!target.startsWith("#")) return;
      e.preventDefault();
      const el = document.querySelector(target);
      const top = el.offsetTop - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // Initialize Vanta background
  VANTA.CLOUDS({
    el: "#vanta-bg",
    skyColor: 0xffffff,
    cloudColor: 0xf5f5f5,
    cloudShadowColor: 0xcccccc,
    sunColor: 0xeeeeee,
    speed: 1.0,
    zoom: 0.9
  });

  // Initialize Swiper
  const swiper = new Swiper('.swiper-container', {
    loop: true,
    autoplay: { delay: 5000 },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    slidesPerView: 1,
    spaceBetween: 40,
  });
});
