document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        event.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Carousel logic
  const track = document.getElementById("carousel-track");
  const slides = track ? Array.from(track.children) : [];
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");
  const indexLabel = document.getElementById("carousel-index");
  const progressBar = document.getElementById("carousel-progress");
  const dotsContainer = document.getElementById("carousel-dots");
  const dots = [];

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoTimer = null;
  const autoDelay = 9000;

  const updateCarousel = () => {
    if (!track) return;

    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, idx) => {
      slide.classList.toggle("is-active", idx === currentIndex);
    });

    if (indexLabel) {
      const humanIndex = String(currentIndex + 1).padStart(2, "0");
      const humanTotal = String(totalSlides).padStart(2, "0");
      indexLabel.textContent = `${humanIndex} / ${humanTotal}`;
    }

    if (progressBar) {
      const fraction = totalSlides > 0 ? (currentIndex + 1) / totalSlides : 0;
      progressBar.style.transform = `scaleX(${fraction})`;
    }

    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === currentIndex);
      dot.setAttribute("aria-current", idx === currentIndex ? "true" : "false");
    });
  };

  const goToSlide = (index) => {
    if (!track) return;
    currentIndex = (index + totalSlides) % totalSlides;
    updateCarousel();
  };

  const goToNext = () => goToSlide(currentIndex + 1);
  const goToPrev = () => goToSlide(currentIndex - 1);

  // Build dots
  if (dotsContainer && totalSlides > 0) {
    slides.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(idx);
        startAuto();
      });
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });
  }

  // Auto play
  const startAuto = () => {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = window.setInterval(goToNext, autoDelay);
  };

  const stopAuto = () => {
    if (autoTimer) window.clearInterval(autoTimer);
  };

  if (totalSlides > 0) {
    updateCarousel();
    startAuto();

    prevBtn?.addEventListener("click", () => {
      goToPrev();
      startAuto();
    });

    nextBtn?.addEventListener("click", () => {
      goToNext();
      startAuto();
    });

    const carouselShell = document.querySelector(".carousel-shell");
    if (carouselShell) {
      ["mouseenter", "focusin"].forEach((evt) =>
        carouselShell.addEventListener(evt, stopAuto)
      );
      ["mouseleave", "focusout"].forEach((evt) =>
        carouselShell.addEventListener(evt, startAuto)
      );
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        goToNext();
        startAuto();
      }
      if (event.key === "ArrowLeft") {
        goToPrev();
        startAuto();
      }
    });
  }
});
