document.addEventListener("DOMContentLoaded", () => {
  // Year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Smooth scroll for nav + CTA
  const scrollTriggers = document.querySelectorAll(".nav-link, [data-scroll]");
  scrollTriggers.forEach((el) => {
    el.addEventListener("click", (e) => {
      const target =
        el.getAttribute("data-scroll") || el.getAttribute("href") || "";
      if (!target.startsWith("#")) return;

      const node = document.querySelector(target);
      if (!node) return;

      e.preventDefault();
      const offset = 80;
      const top =
        node.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
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
      if (idx === currentIndex) {
        slide.classList.add("is-active");
      } else {
        slide.classList.remove("is-active");
      }
    });

    if (indexLabel) {
      indexLabel.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
        totalSlides
      ).padStart(2, "0")}`;
    }

    if (progressBar) {
      const fraction = totalSlides ? (currentIndex + 1) / totalSlides : 0;
      progressBar.style.transform = `scaleX(${fraction})`;
    }

    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  };

  const goToNext = () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  };

  const goToPrev = () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  };

  const startAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(goToNext, autoDelay);
  };

  const stopAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  };

  if (slides.length > 0) {
    if (dotsContainer) {
      slides.forEach((slide, idx) => {
        const dotBtn = document.createElement("button");
        const titleNode = slide.querySelector(".carousel-title");
        dotBtn.type = "button";
        dotBtn.className = "dot-btn";
        dotBtn.setAttribute("aria-label", `Go to ${titleNode?.textContent || `slide ${idx + 1}`}`);
        dotBtn.addEventListener("click", () => {
          currentIndex = idx;
          updateCarousel();
          startAuto();
        });
        dotsContainer.appendChild(dotBtn);
        dots.push(dotBtn);
      });
    }

    updateCarousel();
    startAuto();

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToNext();
        startAuto();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToPrev();
        startAuto();
      });
    }

    // Pause autoplay on hover / focus
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
