/* script.js - Stream11 combined frontend logic */

const defaultConfig = {
  site_title: "Stream11",
  tagline: "Live Football Streaming & Scores",
  banner_title: "Watch Live Football",
  banner_subtitle: "Stream every match in HD quality",
  cta_button_text: "Start Watching"
};

/* ========================================
   UI Helpers (from Set 2 - Refined)
   ======================================== */

// UI Helpers
function showToast(msg) {
  const t = document.getElementById('success-toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3000);
}

// Carousel (functions for control buttons/external API)
let currentCarousel = 0,
  carouselInterval;

function setCarouselSlide(i) {
  const slides = document.querySelectorAll('.slide'); // Used '.slide' from Set 1's HTML assumption
  const carouselTrack = document.getElementById("carousel-track");
  const dots = document.querySelectorAll('.carousel-dot'); // Assumes existence of dots

  if (!slides.length || !carouselTrack) return;

  currentCarousel = (i + slides.length) % slides.length;
  carouselTrack.style.transform = `translateX(-${currentCarousel * 100}%)`;

  // Pause/play video (from Set 1 logic)
  slides.forEach((s, idx) => {
    const v = s.querySelector("video");
    if (!v) return;
    if (idx === currentCarousel) {
      v.currentTime = 0;
      /*v.play();*/
    } else {
      v.pause();
    }
  });

  // Assumes dot control
  dots.forEach((d, idx) => d.classList.toggle('active', idx === currentCarousel));
}

function startCarousel() {
  stopCarousel();
  carouselInterval = setInterval(() => setCarouselSlide(currentCarousel + 1), 6000); // Using 6000ms from Set 1
}

function stopCarousel() {
  if (carouselInterval) clearInterval(carouselInterval);
}

// Tabs (NOTE: The logic inside DOMContentLoaded handles setting state using Set 1's classes/data structure)
function switchTab(name) {
  document.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `${name}-tab`));
}

// Mobile menu (Using Set 1's original function/IDs)
function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  m.classList.toggle('open');
}

// Modals (Using Set 1's original function/IDs)
function openLoginModal() {
  document.getElementById('login-modal').setAttribute('aria-hidden', 'false');
}

function openSignupModal() {
  document.getElementById('signup-modal').setAttribute('aria-hidden', 'false');
}

function closeModal(id) {
  document.getElementById(id).setAttribute('aria-hidden', 'true');
}

/* ========================================
   Login/Signup Handlers (using Set 1 functions for consistency)
   ======================================== */

function handleLogin(e) {
  e.preventDefault();
  closeModal('login-modal');
  showToast('Login successful (demo)');
}

function handleSignup(e) {
  e.preventDefault();
  closeModal('signup-modal');
  showToast('Account created (demo)');
}


/* ========================================
   Scores Logic (from Set 2 - detailed HTML generation)
   ======================================== */

// Demo scores fallback (from Set 2)
function loadDemoScores() {
  const demoMatches = [
    {
      homeTeam: {
        name: 'Man Utd',
        crest: '🔴'
      },
      awayTeam: {
        name: 'Liverpool',
        crest: '🔵'
      },
      score: {
        fullTime: {
          home: 2,
          away: 2
        }
      },
      competition: {
        name: 'Premier League',
        emblem: '🏴'
      },
      status: 'LIVE',
      minute: 67
    },
    {
      homeTeam: {
        name: 'Real Madrid',
        crest: '⚪'
      },
      awayTeam: {
        name: 'Barcelona',
        crest: '🔵'
      },
      score: {
        fullTime: {
          home: 1,
          away: 3
        }
      },
      competition: {
        name: 'La Liga',
        emblem: '🇪🇸'
      },
      status: 'LIVE',
      minute: 78
    }
  ];
  displayScores(demoMatches);
}

function displayScores(matches) {
  const container = document.getElementById('live-scores'); // Targeting 'live-scores' from Set 2's structure
  if (!container) return;

  if (!matches || !matches.length) {
    container.innerHTML = '<div class="placeholder-text">No live matches</div>';
    return;
  }

  container.innerHTML = '';
  matches.forEach(match => {
    const homeScore = match.score?.fullTime?.home ?? 0;
    const awayScore = match.score?.fullTime?.away ?? 0;
    const minute = match.minute || '';
    const league = match.competition?.name || 'Football';
    const leagueIcon = match.competition?.emblem || '⚽';
    const card = document.createElement('div');
    card.className = 'score-card';

    // Using the detailed HTML structure from Set 2
    card.innerHTML = `
      <div class="flex-row" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="left" style="display:flex; align-items:center;"><span class="league-icon">${leagueIcon}</span><span class="muted">${league}</span></div>
        <div class="right"><span class="live-indicator" style="background:#ff3c3c;width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:8px"></span><span class="muted">LIVE ${minute}'</span></div>
      </div>
      <div style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:18px">${match.homeTeam.crest||'⚽'}</span><span style="margin-left:8px">${match.homeTeam.name}</span></div><div style="font-size:26px;font-weight:700;color:var(--accent)">${homeScore}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><div><span style="font-size:18px">${match.awayTeam.crest||'⚽'}</span><span style="margin-left:8px">${match.awayTeam.name}</span></div><div style="font-size:26px;font-weight:700;color:var(--accent)">${awayScore}</div></div>
      </div>
      <button class="cta" style="width:100%;margin-top:12px">Watch Live</button>
    `;
    container.appendChild(card);
  });
}

// Proxy fetch to Netlify function (from Set 2)
async function loadLivesFromProxy() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const url = '/.netlify/functions/live-scores?type=eventsday&date=' + today;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Proxy fetch failed');
    const data = await res.json();
    const events = data?.events || [];
    if (!events.length) return loadDemoScores();
    // Map TheSportsDB events shape to our display
    const mapped = events.map(ev => ({
      homeTeam: {
        name: ev.strHomeTeam,
        crest: ''
      },
      awayTeam: {
        name: ev.strAwayTeam,
        crest: ''
      },
      score: {
        fullTime: {
          home: ev.intHomeScore,
          away: ev.intAwayScore
        }
      },
      competition: {
        name: ev.strLeague,
        emblem: ''
      },
      status: ev.strStatus,
      minute: ev.intTime
    }));
    displayScores(mapped);
  } catch (err) {
    console.warn(err);
    loadDemoScores();
  }
}

/* ========================================
   Initializers
   ======================================== */

// Club icons injection (from Set 2)
const clubs = [
  {
    name: "Barcelona",
    img: "assets/teams/barcelona.png"
  },
  {
    name: "Real Madrid",
    img: "assets/teams/real-madrid.png"
  },
  {
    name: "Man City",
    img: "assets/teams/man-city.png"
  },
  {
    name: "Liverpool",
    img: "assets/teams/liverpool.png"
  }
];

function injectClubs() {
  const list = document.getElementById('club-list');
  if (!list) return;
  clubs.forEach(c => {
    const el = document.createElement('div');
    el.className = 'club-item';
    el.innerHTML = `<img src="${c.img}" alt="${c.name} logo"/><div>${c.name}</div>`;
    list.appendChild(el);
  });
}

// Main DOM Content Loaded Listener (Combining Set 1 & Set 2's event handlers)
document.addEventListener("DOMContentLoaded", () => {
  // --- Tabs (From Set 1) ---
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  function setActiveTab(name) {
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    tabContents.forEach(c => {
      const active = c.id === name;
      c.classList.toggle("active", active);
      c.setAttribute("aria-hidden", String(!active));
    });
    localStorage.setItem("stream11.activeTab", name);
    // When a tab is set, attempt to load scores if it's the live/score tab
    // (Note: Assumes 'football' or a primary score tab is used)
    if (name === 'football' || name === 'live') {
      loadLivesFromProxy();
    }
  }

  tabButtons.forEach(b => b.addEventListener("click", () => setActiveTab(b.dataset.tab)));
  setActiveTab(localStorage.getItem("stream11.activeTab") || "football");

  // --- Mobile menu (From Set 1) ---
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const open = mobileNav.getAttribute("aria-hidden") === "false";
      mobileNav.setAttribute("aria-hidden", String(!open));
      mobileNav.style.display = open ? "none" : "flex";
    });
    // Mobile nav links
    document.querySelectorAll(".mobile-link").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        setActiveTab(tab);
        mobileNav.style.display = "none";
      });
    });
  }

  // --- LOGIN modal (From Set 1 - Detailed) ---
  const loginBtn = document.getElementById("login-btn");
  const loginBtnMobile = document.getElementById("login-btn-mobile");
  const loginModal = document.getElementById("login-modal");
  const closeLogin = document.getElementById("close-login");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout");
  const usernameInput = document.getElementById("login-username");

  function openLogin() {
    loginModal?.setAttribute("aria-hidden", "false");
  }
  function closeLoginModal() {
    loginModal?.setAttribute("aria-hidden", "true");
  }

  loginBtn?.addEventListener("click", openLogin);
  loginBtnMobile?.addEventListener("click", openLogin);
  closeLogin?.addEventListener("click", closeLoginModal);
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = usernameInput.value.trim();
    if (!user) return alert("Enter a username");
    localStorage.setItem("stream11.user", user);
    alert("Signed in as " + user + " (demo)");
    closeLoginModal();
  });
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("stream11.user");
    alert("Signed out (demo)");
  });

  // --- Year (From Set 1) ---
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Club icons injection ---
  injectClubs();

  // --- Carousel: setup (From Set 1) ---
  const carouselTrack = document.getElementById("carousel-track");
  const highlights = [
    {
      title: "Goal 34'",
      file: "highlights/h1.mp4"
    },
    {
      title: "Amazing Save",
      file: "highlights/h2.mp4"
    },
    {
      title: "Top Moment",
      file: "highlights/h3.mp4"
    }
  ];
  let currentSlide = 0;
  let autoplay = true;
  
  // Rebuild slides if carouselTrack exists
  if (carouselTrack) {
    highlights.forEach((h, i) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.dataset.index = i;
      slide.innerHTML = `<video preload="metadata" controls playsinline muted>
                           <source src="${h.file}" type="video/mp4">
                         </video>`;
      carouselTrack.appendChild(slide);
    });

    const slides = Array.from(document.querySelectorAll(".slide"));
    // Re-implemented goToSlide logic locally for controls
    function goToSlideLocal(idx) {
      if (!slides.length) return;
      currentSlide = (idx + slides.length) % slides.length;
      carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      slides.forEach((s, i) => {
        const v = s.querySelector("video");
        if (!v) return;
        if (i === currentSlide) {
          v.currentTime = 0;
          /*v.play();*/
        } else {
          v.pause();
        }
      });
    }

    document.getElementById("prev")?.addEventListener("click", () => {
      goToSlideLocal(currentSlide - 1);
    });
    document.getElementById("next")?.addEventListener("click", () => {
      goToSlideLocal(currentSlide + 1);
    });
    const playpauseBtn = document.getElementById("playpause");
    playpauseBtn?.addEventListener("click", () => {
      autoplay = !autoplay;
      playpauseBtn.textContent = autoplay ? "⏯" : "▶";
      if (autoplay) startCarousel();
      else stopCarousel();
    });

    if (autoplay) startCarousel();
    goToSlideLocal(0);
  }

  // --- Live scores: initial load ---
  loadLivesFromProxy();
});
