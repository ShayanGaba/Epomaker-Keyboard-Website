import "./style.css";

// --- CONFIGURATION ---
const TOTAL_FRAMES = 219;
const FRAME_DIRECTORY = "/frames";
const FRAME_PREFIX = "ezgif-frame-";
const LERP_FACTOR = 0.08; // Buttery smooth scroll inertia factor (lower is smoother)

// --- DOM ELEMENTS ---
const canvas = document.getElementById("animation-canvas");
const ctx = canvas.getContext("2d");
const loader = document.getElementById("loader");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const progressSpeed = document.getElementById("progress-speed");
const sections = document.querySelectorAll(".narrative-section");

// Set canvas dimensions to 4K resolution
canvas.width = 2560;
canvas.height = 1440;

// Enable high-quality image smoothing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

// --- STATE VARIABLES ---
const images = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;
let lastRenderedFrame = -1;
let isFirstDraw = true;

// Helper to pad numbers (e.g. 1 -> 001)
const padZero = (num, size = 3) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

// --- PRELOAD ASSETS ---
function preloadImages() {
  const startTime = Date.now();

  return new Promise((resolve) => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const filename = `${FRAME_PREFIX}${padZero(i)}.jpg`;
      img.src = `${FRAME_DIRECTORY}/${filename}`;

      img.onload = () => {
        loadedCount++;

        // Calculate progress
        const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `Preloading 4K Frames: ${percent}%`;

        // Calculate dynamic preloading messages
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = loadedCount / elapsed;
        const remaining = TOTAL_FRAMES - loadedCount;
        const estTime = Math.ceil(remaining / rate);

        if (loadedCount < TOTAL_FRAMES) {
          progressSpeed.textContent = `Loading at ${rate.toFixed(1)} fps... ${estTime}s remaining`;
        } else {
          progressSpeed.textContent = "Optimizing rendering buffer...";
        }

        if (loadedCount === TOTAL_FRAMES) {
          resolve();
        }
      };

      img.onerror = () => {
        console.error(`Failed to load frame: ${filename}`);
        // Increment anyway to prevent load lock
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          resolve();
        }
      };

      images.push(img);
    }
  });
}

// --- DYNAMIC SCROLL STATES FOR GOATED NAVIGATION DOCK ---
function handleNavbarScroll() {
  const header = document.getElementById("main-header");
  const scrollWrapper = document.getElementById("scroll-animation-wrapper");

  if (!header || !scrollWrapper) return;

  window.addEventListener(
    "scroll",
    () => {
      // Add "header-scrolled" class when user scrolls past 50px
      if (window.scrollY > 50) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    },
    { passive: true },
  );
}

// Ensure this runs when your page initializes!
document.addEventListener("DOMContentLoaded", handleNavbarScroll);

// --- RENDER FUNCTION ---
function renderFrame(frameIndex) {
  const img = images[frameIndex];
  if (!img) return;

  // High quality canvas drawing
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// --- NARRATIVE CARD SYNC ---
function updateNarrativeSections(frameIndex) {
  // Map frames to active section cards
  // Total 219 frames, 5 sections
  let activeIndex = 0;

  if (frameIndex <= 35) {
    activeIndex = 0; // Section 1 (Intro)
  } else if (frameIndex > 35 && frameIndex <= 85) {
    activeIndex = 1; // Section 2 (Keycaps)
  } else if (frameIndex > 85 && frameIndex <= 135) {
    activeIndex = 2; // Section 3 (Switches)
  } else if (frameIndex > 135 && frameIndex <= 185) {
    activeIndex = 3; // Section 4 (Architecture)
  } else {
    activeIndex = 4; // Section 5 (Replay/End)
  }

  sections.forEach((sec, idx) => {
    if (idx === activeIndex) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });
}

// --- ANIMATION/GAME LOOP ---
function updateAnimation() {
  // Linear Interpolation (lerp) for smooth scrolling inertia
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

  // Render and update HTML sections only if the frame changes (optimization)
  if (frameToRender !== lastRenderedFrame || isFirstDraw) {
    renderFrame(frameToRender);
    updateNarrativeSections(frameToRender);
    lastRenderedFrame = frameToRender;
    isFirstDraw = false;
  }

  // --- Title Fading Logic (Based on smooth lerped animation progress) ---
  const titleContainer = document.getElementById("animation-title-container");
  if (titleContainer) {
    const progress = currentFrame / (TOTAL_FRAMES - 1);
    // Linear fade-out to 0 by 30% progress (progress = 0.3)
    const titleOpacity = Math.max(0, 1 - progress / 0.3);
    titleContainer.style.opacity = titleOpacity;

    // Hide overlay completely when invisible to allow interaction with narrative cards underneath
    if (titleOpacity <= 0.001) {
      titleContainer.style.visibility = "hidden";
    } else {
      titleContainer.style.visibility = "visible";
    }
  }

  requestAnimationFrame(updateAnimation);
}

// --- SCROLL EVENT HANDLER (Targeted to the Scroll Wrapper) ---
function onScroll() {
  const scrollWrapper = document.getElementById("scroll-animation-wrapper");
  if (!scrollWrapper) return;

  const rect = scrollWrapper.getBoundingClientRect();
  const scrollOffset = -rect.top; // Scrolled pixels of this container
  const maxScroll = scrollWrapper.offsetHeight - window.innerHeight;

  // Calculate scroll fraction clamped between 0 and 1
  const scrollFraction =
    maxScroll > 0 ? Math.min(Math.max(scrollOffset / maxScroll, 0), 1) : 0;

  // Set the target frame based on scroll fraction
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
}

// --- CURSOR AND INTERACTIVITY PLUGINS ---

// --- PREMIUM CURSOR WITH SMOOTH TRAILING PHYSICS ---
function initCustomCursor() {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-outline");

  if (cursorDot) cursorDot.style.pointerEvents = "none";
  if (cursorOutline) cursorOutline.style.pointerEvents = "none";

  // Tracking variables for smooth physics (Lerp)
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  // Track raw mouse position
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot snaps instantly for precision
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  // Render loop for the trailing outline
  const renderCursor = () => {
    // 0.15 is the smoothness factor. Lower = more delay/trailing.
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    if (cursorOutline) {
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
    }
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);

  // Magnetic Hover Detection (triggers the CSS expansion)
  document.addEventListener("mouseover", (e) => {
    // Triggers on anything with .cursor-hover-target, buttons, or links
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

      const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10 degrees
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

function initAcousticsAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playSynthesizedSound(type) {
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
      case "thock": // Deep, resonant, muted
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case "clack": // Higher pitch, sharp
        osc.type = "square";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2000, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case "pop": // Very short, quiet, muted
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case "click": // Sharp transient, noisy
        const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
        const buffer = audioCtx.createBuffer(
          1,
          bufferSize,
          audioCtx.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.value = 3000;

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        noise.start(now);

        // Sawtooth core
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  }

  document.querySelectorAll(".switch-audio-btn").forEach((btn) => {
    btn.addEventListener("mousedown", () => {
      const sound = btn.getAttribute("data-sound");
      playSynthesizedSound(sound);

      // Visual feedback click squeeze
      btn.style.transform = "scale(0.98)";
    });
    btn.addEventListener("mouseup", () => {
      btn.style.transform = "scale(1)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
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
      // Clean previous active indicators from the DOM cluster
      configBtns.forEach((b) => b.classList.remove("active"));

      // Inject active styling context to target selector instance
      btn.classList.add("active");

      const color = btn.getAttribute("data-color");
      if (configImg && colorwayImages[color]) {
        // Smoothly fade out, swap source, fade back in
        configImg.style.opacity = "0";

        setTimeout(() => {
          configImg.src = colorwayImages[color];
          configImg.style.opacity = "1";
        }, 200); // Matches your CSS transition duration
      }
    });
  });
}

// --- MOBILE SIDE ACCESS TERMINAL CONTROLLER ---


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


// --- INIT APP ---
// --- INIT APP ---
// --- INIT APP ---
async function init() {
  // Start preloading images
  await preloadImages();

  // Initial frame drawing and section activation
  onScroll();
  currentFrame = targetFrame;
  renderFrame(Math.round(currentFrame));
  updateNarrativeSections(Math.round(currentFrame));

  // Hide loading screen with a fade-out effect
  loader.classList.add("fade-out");

  // Listen to scroll events
  window.addEventListener("scroll", onScroll, { passive: true });

  // Initialize interactive components
  initCustomCursor();
  initTiltEffect();
  initAcousticsAudio();
  initConfigurator();
  
  // ⚡ MOUNT MOBILE DRAWER ENGINE ⚡
  initMobileNavigation();

  // Start rendering loop
  requestAnimationFrame(updateAnimation);
}



// Run init on DOM Content Loaded
document.addEventListener("DOMContentLoaded", init);

document.addEventListener("DOMContentLoaded", () => {
  initCinematicScrollAndSpy();
});

function initCinematicScrollAndSpy() {
  const navLinks = document.querySelectorAll(".nav-link, .drawer-link");

  // FIXED: Explicitly target the scroll-wrapper container along with the other interactive section IDs
  const sections = document.querySelectorAll(
    "#scroll-animation-wrapper, #architecture, #acoustics, #configurator, #specifications",
  );
  let isProgrammaticScrolling = false;

  // ==========================================
  // 1. CUSTOM CINEMATIC SMOOTH SCROLL ENGINE
  // ==========================================
  function smoothScrollTo(targetSelector, duration = 1600) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    isProgrammaticScrolling = true;
    const targetPosition =
      target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    // Trigger the cinematic warp fade on the body
    document.body.classList.add("is-scrolling");

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;

      // Calculate cubic-bezier equivalent position (easeInOutCubic)
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
        // Enforce exact terminal snap coordinate
        window.scrollTo(0, targetPosition);

        // Clean snap back to focus
        setTimeout(() => {
          document.body.classList.remove("is-scrolling");
          isProgrammaticScrolling = false;

          // Sync state directly after manual transition completes
          const targetId = targetSelector.substring(1);
          updateActiveStates(targetId);
        }, 100);
      }
    }

    // High-end easing math: cubic-bezier(0.645, 0.045, 0.355, 1)
    function easeInOutCubic(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
  }

  // ==========================================
  // 2. INTERSECTION OBSERVER (SCROLLSPY)
  // ==========================================
  const observerOptions = {
    root: null,
    rootMargin: "-40% 0px -40% 0px", // Evaluates intersection inside the viewport sweet spot
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    // Prevent ScrollSpy updating classes rapidly during programmatic warp scrolls
    if (isProgrammaticScrolling) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        updateActiveStates(id);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Helper to toggle active classes across all viewport targets
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

  // ==========================================
  // 3. ATTACH CLICK LISTENERS
  // ==========================================
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Ensure the link is an in-page anchor
      if (href && href.startsWith("#")) {
        e.preventDefault();

        const targetId = href.substring(1);

        // Instantly switch active state on click so UI feels incredibly responsive
        updateActiveStates(targetId);

        // Run custom warp scroll to target
        smoothScrollTo(href, 1800); // 1.8 seconds duration
      }
    });
  });

  // ==========================================
  // 4. EDGE CASE: FORCED TOP-OF-PAGE FALLBACK
  // ==========================================
  // Because the scroll-animation-wrapper is extremely tall (500vh), scrolling quickly
  // can sometimes bypass the observer threshold. This guarantees "Sequence" remains active at the top.
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

// --- MOBILE ACCESS TERMINAL INTERACTION ENGINE ---



// ==========================================
// UNIFIED ZERO-LATENCY, CLIP-FREE AUDIO ENGINE
// ==========================================

// =======================================================
// DYNAMIC TACTILE STYLES INJECTION (Snappy Switch Physics)
// =======================================================
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

// =======================================================
// UNIFIED ZERO-LATENCY, CLIP-FREE AUDIO ENGINE
// =======================================================
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

    // Compressor acts as a limiter to keep rapid spamming clean and distortion-free
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

    // Organic Pitch Bend (makes each rapid stroke sound slightly distinct)
    const pitchVariance = 0.96 + Math.random() * 0.08;
    source.playbackRate.setValueAtTime(pitchVariance, this.ctx.currentTime);

    source.connect(this.compressor);
    source.start(0);
  }
}

const keyboardAudio = new KeyboardAudioEngine();

// =======================================================
// INTERACTION & ANIMATION INITIALIZER
// =======================================================
function initSwitchAudioAndAnimations() {
  const switchCards = document.querySelectorAll(".switch-card");

  switchCards.forEach((card) => {
    // 1. Dynamically find the image parent and tag it for transitions
    const img = card.querySelector("img");
    if (img && img.parentElement) {
      img.parentElement.classList.add("switch-img-wrapper");
    }

    // 2. Event Handlers
    const pressDown = (e) => {
      e.preventDefault();
      card.classList.add("active-press");

      const soundType = card.getAttribute("data-sound");
      keyboardAudio.play(soundType);
    };

    const releaseUp = () => {
      card.classList.remove("active-press");
    };

    // Trigger on down
    card.addEventListener("mousedown", pressDown);
    card.addEventListener("touchstart", pressDown, { passive: false });

    // Release on up/leave
    card.addEventListener("mouseup", releaseUp);
    card.addEventListener("mouseleave", releaseUp);
    card.addEventListener("touchend", releaseUp);
  });
}

// Global unlocked events for Web Audio policies
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
