import "./style.css";

const TOTAL_FRAMES = 219;
const FRAME_DIRECTORY = "/frames";
const FRAME_PREFIX = "ezgif-frame-";
const LERP_FACTOR = 0.08;

const CRITICAL_STRIDE = 7;
const MIN_LOADER_TIME = 1200;
const MAX_LOADER_TIME = 3000;

const canvas = document.getElementById("animation-canvas");
const ctx = canvas.getContext("2d");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderCounter = document.getElementById("loader-counter");
const loaderGhostCounter = document.getElementById("loader-ghost-counter");
const loaderStatus = document.getElementById("loader-status");
const sections = document.querySelectorAll(".narrative-section");

canvas.width = 2560;
canvas.height = 1440;

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

const images = new Array(TOTAL_FRAMES).fill(null);
const frameLoaded = new Array(TOTAL_FRAMES).fill(false);
let criticalTotal = 0;
let criticalLoadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;
let lastRenderedFrame = -1;
let isFirstDraw = true;

let titleContainer = null;
let scrollWrapper = null;

const padZero = (num, size = 3) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

const frameSrc = (index) =>
  `${FRAME_DIRECTORY}/${FRAME_PREFIX}${padZero(index + 1)}.jpg`;

function loadFrame(index) {
  return new Promise((resolve) => {
    if (images[index]) {
      resolve();
      return;
    }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      frameLoaded[index] = true;
      resolve();
    };
    img.onerror = () => {
      console.error(`Failed to load frame: ${frameSrc(index)}`);
      resolve();
    };
    img.src = frameSrc(index);
    images[index] = img;
  });
}

function startCriticalPreload() {
  const criticalIndexes = [];
  for (let i = 0; i < TOTAL_FRAMES; i += CRITICAL_STRIDE) {
    criticalIndexes.push(i);
  }
  if (criticalIndexes[criticalIndexes.length - 1] !== TOTAL_FRAMES - 1) {
    criticalIndexes.push(TOTAL_FRAMES - 1);
  }
  criticalTotal = criticalIndexes.length;

  return Promise.all(
    criticalIndexes.map((i) =>
      loadFrame(i).then(() => {
        criticalLoadedCount++;
      }),
    ),
  );
}

function startBackgroundPreload() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    if (!images[i]) loadFrame(i);
  }
}

function nearestLoadedFrame(index) {
  if (frameLoaded[index]) return index;
  for (let d = 1; d < TOTAL_FRAMES; d++) {
    if (index - d >= 0 && frameLoaded[index - d]) return index - d;
    if (index + d < TOTAL_FRAMES && frameLoaded[index + d]) return index + d;
  }
  return -1;
}

function runLoader() {
  const statusMessages = [
    [0, "INITIALIZING RENDER ENGINE"],
    [30, "DECODING FRAME SEQUENCE"],
    [60, "CALIBRATING ACOUSTICS"],
    [85, "COMPOSITING LAYERS"],
    [100, "SYSTEM READY"],
  ];

  return new Promise((resolve) => {
    const startTime = performance.now();
    let shown = 0;
    let lastStatus = "";

    function tick(now) {
      const elapsed = now - startTime;
      const real = criticalTotal > 0 ? criticalLoadedCount / criticalTotal : 0;

      const timeFloor = Math.min(elapsed / MIN_LOADER_TIME, 1) * 0.35;
      const forced = elapsed >= MAX_LOADER_TIME ? 1 : 0;
      const target = Math.max(real, timeFloor, forced) * 100;

      shown += (target - shown) * 0.12;
      if (target >= 100 && shown > 99.2) shown = 100;

      const rounded = Math.round(shown);
      loaderCounter.textContent = rounded;
      loaderGhostCounter.textContent = padZero(rounded, 3);
      loaderBar.style.transform = `scaleX(${shown / 100})`;

      let status = statusMessages[0][1];
      for (const [threshold, message] of statusMessages) {
        if (rounded >= threshold) status = message;
      }
      if (status !== lastStatus) {
        loaderStatus.textContent = status;
        lastStatus = status;
      }

      const assetsReady = real >= 1 || elapsed >= MAX_LOADER_TIME;
      if (assetsReady && elapsed >= MIN_LOADER_TIME && shown === 100) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function handleNavbarScroll() {
  const header = document.getElementById("main-header");
  if (!header) return;

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 50) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    },
    { passive: true },
  );
}

document.addEventListener("DOMContentLoaded", handleNavbarScroll);

function renderFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img || !frameLoaded[frameIndex]) return;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function updateNarrativeSections(frameIndex) {
  if (!sections.length) return;

  let activeIndex = 0;

  if (frameIndex <= 35) {
    activeIndex = 0;
  } else if (frameIndex > 35 && frameIndex <= 85) {
    activeIndex = 1;
  } else if (frameIndex > 85 && frameIndex <= 135) {
    activeIndex = 2;
  } else if (frameIndex > 135 && frameIndex <= 185) {
    activeIndex = 3;
  } else {
    activeIndex = 4;
  }

  sections.forEach((sec, idx) => {
    if (idx === activeIndex) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });
}

function updateAnimation() {
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * LERP_FACTOR;
  } else {
    currentFrame = targetFrame;
  }

  const frameToRender = Math.min(
    Math.max(Math.round(currentFrame), 0),
    TOTAL_FRAMES - 1,
  );

  const drawableFrame = nearestLoadedFrame(frameToRender);

  if (
    drawableFrame !== -1 &&
    (drawableFrame !== lastRenderedFrame || isFirstDraw)
  ) {
    renderFrame(drawableFrame);
    updateNarrativeSections(frameToRender);
    lastRenderedFrame = drawableFrame;
    isFirstDraw = false;
  }

  if (titleContainer) {
    const progress = currentFrame / (TOTAL_FRAMES - 1);
    const titleOpacity = Math.max(0, 1 - progress / 0.3);
    titleContainer.style.opacity = titleOpacity;

    if (titleOpacity <= 0.001) {
      titleContainer.style.visibility = "hidden";
    } else {
      titleContainer.style.visibility = "visible";
    }
  }

  requestAnimationFrame(updateAnimation);
}

function onScroll() {
  if (!scrollWrapper) return;

  const rect = scrollWrapper.getBoundingClientRect();
  const scrollOffset = -rect.top;
  const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;

  const scrollFraction =
    maxScroll > 0 ? Math.min(Math.max(scrollOffset / maxScroll, 0), 1) : 0;

  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
}

function initCustomCursor() {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-outline");

  if (cursorDot) cursorDot.style.pointerEvents = "none";
  if (cursorOutline) cursorOutline.style.pointerEvents = "none";

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  const renderCursor = () => {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    if (cursorOutline) {
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
    }
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(".cursor-hover-target, .nav-link, button, a")) {
      document.body.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".cursor-hover-target, .nav-link, button, a")) {
      document.body.classList.remove("cursor-hover");
    }
  });
}

function initTiltEffect() {
  const tiltCards = document.querySelectorAll(".tilt-card");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
      card.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        card.style.transition = "";
      }, 500);
    });
  });
}

const colorwayImages = {
  dark: "/frames/ezgif-frame-219.jpg",
  frost: "/images/glacier-frost.jpg",
  slate: "/images/nordic-slate.jpg",
  white: "/images/chalk-white.jpg",
  blue: "/images/cyber-blue.jpg",
};

function initConfigurator() {
  const configBtns = document.querySelectorAll(".config-btn");
  const configImg = document.getElementById("configurator-img");

  configBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      configBtns.forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");

      const color = btn.getAttribute("data-color");
      if (configImg && colorwayImages[color]) {
        configImg.style.opacity = "0";

        setTimeout(() => {
          configImg.src = colorwayImages[color];
          configImg.style.opacity = "1";
        }, 200);
      }
    });
  });
}

function initMobileNavigation() {
  const openBtn = document.getElementById("mobile-menu-open");
  const closeBtn = document.getElementById("mobile-menu-close");
  const drawer = document.getElementById("terminal-drawer");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  if (!openBtn || !closeBtn || !drawer) return;

  const openMenu = () => {
    drawer.classList.remove("translate-x-full");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    drawer.classList.add("translate-x-full");
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

async function init() {
  titleContainer = document.getElementById("animation-title-container");
  scrollWrapper = document.getElementById("scroll-animation-wrapper");

  document.documentElement.style.overflow = "hidden";

  startCriticalPreload();
  await runLoader();

  onScroll();
  currentFrame = targetFrame;
  const startFrame = nearestLoadedFrame(Math.round(currentFrame));
  if (startFrame !== -1) renderFrame(startFrame);
  updateNarrativeSections(Math.round(currentFrame));

  loader.classList.add("loader-exit");
  document.documentElement.style.overflow = "";
  setTimeout(() => {
    loader.classList.add("loader-hidden");
  }, 1300);

  startBackgroundPreload();

  window.addEventListener("scroll", onScroll, { passive: true });

  initCustomCursor();
  initTiltEffect();
  initConfigurator();
  initMobileNavigation();

  requestAnimationFrame(updateAnimation);
}

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("DOMContentLoaded", () => {
  initCinematicScrollAndSpy();
});

function initCinematicScrollAndSpy() {
  const navLinks = document.querySelectorAll(".nav-link, .drawer-link");

  const spySections = document.querySelectorAll(
    "#scroll-animation-wrapper, #architecture, #acoustics, #configurator, #specifications",
  );
  let isProgrammaticScrolling = false;

  function smoothScrollTo(targetSelector, duration = 1600) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    isProgrammaticScrolling = true;
    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    document.body.classList.add("is-scrolling");

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;

      const run = easeInOutCubic(
        timeElapsed,
        startPosition,
        distance,
        duration,
      );
      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);

        setTimeout(() => {
          document.body.classList.remove("is-scrolling");
          isProgrammaticScrolling = false;

          const targetId = targetSelector.substring(1);
          updateActiveStates(targetId);
        }, 100);
      }
    }

    function easeInOutCubic(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
  }

  const observerOptions = {
    root: null,
    rootMargin: "-40% 0px -40% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    if (isProgrammaticScrolling) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        updateActiveStates(id);
      }
    });
  }, observerOptions);

  spySections.forEach((section) => observer.observe(section));

  function updateActiveStates(activeId) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${activeId}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (href && href.startsWith("#")) {
        e.preventDefault();

        const targetId = href.substring(1);

        updateActiveStates(targetId);

        smoothScrollTo(href, 1800);
      }
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      if (isProgrammaticScrolling) return;
      if (window.scrollY < window.innerHeight / 2) {
        updateActiveStates("scroll-animation-wrapper");
      }
    },
    { passive: true },
  );
}

const style = document.createElement("style");
style.textContent = `
  /* Overwrite the default slow transitions on cards and images */
  .switch-card {
    transition: transform 0.16s cubic-bezier(0.175, 0.885, 0.32, 1.25), border-color 0.15s ease, box-shadow 0.15s ease !important;
    will-change: transform;
  }

  .switch-img-wrapper {
    transition: transform 0.16s cubic-bezier(0.175, 0.885, 0.32, 1.25) !important;
    will-change: transform;
  }

  /* --- PHYSICAL BOTTOM-OUT STATE (Fast transition down) --- */
  .switch-card.active-press {
    transform: scale(0.96) translateY(5px) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.8) !important;
    transition: transform 0.03s cubic-bezier(0.075, 0.82, 0.165, 1) !important; /* Fast collapse */
  }

  /* The 3D Switch image plunges deep into the socket container */
  .switch-card.active-press .switch-img-wrapper {
    transform: translateY(20px) scale(0.91) !important;
    transition: transform 0.03s cubic-bezier(0.075, 0.82, 0.165, 1) !important; /* Fast collapse */
  }

  /* Force background text to highlight on active-press */
  .switch-card[data-sound="blue"].active-press .switch-bg-text {
    color: #0070f3 !important;
    transform: scale(1.1) !important;
  }
  .switch-card[data-sound="red"].active-press .switch-bg-text {
    color: #ff0000 !important;
    transform: scale(1.1) !important;
  }
  .switch-card[data-sound="brown"].active-press .switch-bg-text {
    color: #8b4513 !important;
    transform: scale(1.1) !important;
  }
  .switch-card[data-sound="black"].active-press .switch-bg-text {
    color: #555555 !important;
    transform: scale(1.1) !important;
  }
`;
document.head.appendChild(style);

class KeyboardAudioEngine {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.compressor = null;
    this.masterGain = null;
    this.sounds = {
      blue: "/audio/blue.mp3",
      red: "/audio/red.mp3",
      brown: "/audio/brown.mp3",
      black: "/audio/black.mp3",
    };
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.001, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.1, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.preloadSounds();
    this.isInitialized = true;
  }

  async preloadSounds() {
    for (const [key, url] of Object.entries(this.sounds)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
      } catch (err) {
        console.warn(`Could not preload audio: ${url}`, err);
      }
    }
  }

  play(type) {
    this.init();

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const buffer = this.buffers[type];
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const pitchVariance = 0.96 + Math.random() * 0.08;
    source.playbackRate.setValueAtTime(pitchVariance, this.ctx.currentTime);

    source.connect(this.compressor);
    source.start(0);
  }
}

const keyboardAudio = new KeyboardAudioEngine();

function initSwitchAudioAndAnimations() {
  const switchCards = document.querySelectorAll(".switch-card");

  switchCards.forEach((card) => {
    const img = card.querySelector("img");
    if (img && img.parentElement) {
      img.parentElement.classList.add("switch-img-wrapper");
    }

    const pressDown = (e) => {
      e.preventDefault();
      card.classList.add("active-press");

      const soundType = card.getAttribute("data-sound");
      keyboardAudio.play(soundType);
    };

    const releaseUp = () => {
      card.classList.remove("active-press");
    };

    card.addEventListener("mousedown", pressDown);
    card.addEventListener("touchstart", pressDown, { passive: false });

    card.addEventListener("mouseup", releaseUp);
    card.addEventListener("mouseleave", releaseUp);
    card.addEventListener("touchend", releaseUp);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const unlockAudio = () => {
    keyboardAudio.init();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
  };
  window.addEventListener("click", unlockAudio);
  window.addEventListener("touchstart", unlockAudio);

  initSwitchAudioAndAnimations();
});
