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
// Fetch matches from external API
// Fetch matches from external API
async function fetchMatches(isUpdate = false) {
  window.isUpdating = isUpdate; // Store state for filter function
  const container = document.getElementById('live-scores');
  if (container && !isUpdate) { // Only show loader on initial load
    container.innerHTML = '<div class="placeholder-text"><div class="loader"></div> Loading matches...</div>';
  }

  try {
    // Fetch both APIs in parallel
    // API 1: Fixtures
    const p1 = fetch('https://match-fetch.netlify.app/matches').then(r => r.ok ? r.json() : []).catch(() => []);

    // API 2: Live Scores
    const p2 = fetch('https://match-fetch.netlify.app/scores').then(r => r.ok ? r.json() : null).catch(() => null);

    const [scheduleData, scoreDataResponse] = await Promise.all([p1, p2]);

    if (!scheduleData || scheduleData.length === 0) {
      throw new Error('No schedule data available');
    }

    // Prepare lookup for live scores (ID and Name based)
    const scoreLookup = {};
    const scoreLookupByName = {}; // Fallback

    if (scoreDataResponse) {
      const matchesList = Array.isArray(scoreDataResponse) ? scoreDataResponse : (scoreDataResponse.matches || []);
      matchesList.forEach(m => {
        // ID Map
        const mid = String(m.match_id || m.id || '');
        if (mid) scoreLookup[mid] = m;

        // Name Map (Normalization: lowercase, remove special chars)
        const homeName = m.home?.name || m.home_team || '';
        if (homeName) {
          const simpleName = homeName.toLowerCase().replace(/[^a-z0-9]/g, '');
          scoreLookupByName[simpleName] = m;
        }
      });
    }

    // Merge & Store Data
    const matches = scheduleData.map(match => {
      // 1. Try ID Match
      const stableId = String(match.id || match.match_id || ((match.home_team?.name || 'h') + (match.away_team?.name || 'a')).replace(/[^a-zA-Z0-9]/g, ''));
      let liveMatch = scoreLookup[stableId] || scoreLookup[String(match.id || '')];

      // 2. Fallback to Name Match if ID match failed
      if (!liveMatch) {
        const hName = match.home_team?.name || match.home_team || '';
        if (hName) {
          const simpleHName = hName.toLowerCase().replace(/[^a-z0-9]/g, '');
          liveMatch = scoreLookupByName[simpleHName];
        }
      }

      // Default to empty if still not found
      liveMatch = liveMatch || {};

      // Adapt new structure to internal format
      // New: liveMatch.home.score, liveMatch.status
      // Fallback: Use existing match data or defaults
      const homeScore = liveMatch.home?.score ?? match.home_score ?? '-';
      const awayScore = liveMatch.away?.score ?? match.away_score ?? '-';
      // Normalize 'Not started' to null so it falls back to time/upcoming logic
      let statusRaw = liveMatch.status || liveMatch.time_period;
      if (statusRaw === 'Not started') statusRaw = null;

      const internalStatus = statusRaw || match.time || 'Upcoming';

      return {
        ...match,
        id: stableId,
        home_score: homeScore,
        away_score: awayScore,
        time_period: internalStatus,
        // Keep original metadata
        home_team: match.home_team,
        away_team: match.away_team,
        competition_logo: match.competition_logo,
        competition: match.competition,
        kickoffDate: (() => {
          // Strictly use Date and Time from API 1 (match-fetch) as requested
          let k = null;
          if (match.date && match.time) {
            const cleanTime = match.time.replace(/[^0-9:]/g, '');
            k = `${match.date}T${cleanTime}:00Z`;
          } else if (match.kickoff) {
            k = match.kickoff;
            if (!k.endsWith('Z') && !k.includes('+') && !k.includes('-')) {
              k += 'Z';
            }
          }
          return k ? new Date(k) : null;
        })()
      };
    });

    // Initial filter call
    filterAndDisplayMatches();
  } catch (error) {
    console.error('Error fetching matches:', error);
    if (container) {
      container.innerHTML = '<div class="placeholder-text">Unable to load matches at this time.</div>';
    }
  }
}

let currentFilter = 'all';

function switchTab(name) {
  currentFilter = name;
  document.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  filterAndDisplayMatches();
}

function filterAndDisplayMatches() {
  const now = new Date();
  // 2.5 hours in milliseconds
  const DURATION_MS = 2.5 * 60 * 60 * 1000;

  const getMatchCategory = (m) => {
    const status = m.time_period || '';

    // 1. Explicit API Status Overrides
    if (status === 'FT' || status === 'Full time' || status === 'Finished') {
      return 'finished';
    }
    if (status.includes("'") || status.includes("Live") || status.includes("Half") || status.includes("HT")) {
      return 'live';
    }

    // 2. Fallback Time Logic (if status is just time/upcoming/empty)
    if (!m.kickoffDate) return 'upcoming';
    const diff = now - m.kickoffDate;

    if (diff > DURATION_MS) return 'finished';
    if (diff >= 0) return 'live';
    return 'upcoming';
  };

  let filtered = [];

  if (currentFilter === 'all') {
    filtered = allMatches;
  } else {
    filtered = allMatches.filter(m => getMatchCategory(m) === currentFilter);
  }

  // If this is an update and we found matches, try silent update
  if (window.isUpdating && filtered.length > 0) {
    updateVisibleMatches(filtered);
  } else {
    displayMatches(filtered);
  }
}

function updateVisibleMatches(matches) {
  const container = document.getElementById('live-scores');
  if (!container) return;

  // If the number of matches changed significantly (e.g. filter change or new day), 
  // or if the container is empty/error, force full redraw
  if (container.children.length === 0 || container.querySelector('.placeholder-text')) {
    displayMatches(matches);
    return;
  }

  matches.forEach(match => {
    const matchId = match.id || match.match_id;
    if (!matchId) return;

    const card = document.getElementById(`match-${matchId}`);
    if (card) {
      // Update Status
      const statusEl = card.querySelector('.match-status');
      const scoreHomeEl = card.querySelector('.score-home');
      const scoreAwayEl = card.querySelector('.score-away');
      const liveDot = card.querySelector('.live-indicator');

      // Calculate current status text & live state
      let statusText = match.time_period || 'Upcoming';
      let isLive = false;
      const liveKeywords = ["'", "Live", "Half"];
      if (liveKeywords.some(k => statusText.includes(k))) isLive = true;
      if (statusText === "Full time") { statusText = "FT"; isLive = false; }

      // Time logic fallback if needed
      if (!statusText || statusText === 'Upcoming' || statusText.includes(':')) {
        // Re-run time logic if simple time update needed (no API override)
        let kickoffTime = match.kickoffDate; // Already calculated object
        if (kickoffTime && !isNaN(kickoffTime.getTime())) {
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          statusText = kickoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: userTimezone });
        }
      }

      // Apply updates
      if (statusEl && statusEl.textContent !== statusText) statusEl.textContent = statusText;
      if (scoreHomeEl) scoreHomeEl.textContent = match.home_score || '-';
      if (scoreAwayEl) scoreAwayEl.textContent = match.away_score || '-';

      if (liveDot) {
        liveDot.style.display = isLive ? 'inline-block' : 'none';
      }
    }
  });
}

function displayMatches(matches) {
  const container = document.getElementById('live-scores');
  if (!container) return;

  if (!matches || matches.length === 0) {
    container.innerHTML = '<div class="placeholder-text">No matches scheduled for today</div>';
    return;
  }

  container.innerHTML = '';

  matches.forEach(match => {
    // Parse data from StreamXI API
    const homeScore = match.home_score ?? '-';
    const awayScore = match.away_score ?? '-';

    // Status logic
    let statusText = match.time_period || 'Upcoming';
    let isLive = false;

    // Check for live keywords in time_period
    const liveKeywords = ["'", "Live", "Half"];
    if (liveKeywords.some(k => statusText.includes(k))) {
      isLive = true;
    }

    if (statusText === "Full time") {
      statusText = "FT";
      isLive = false;
    }

    // Fallback for empty status or if it's just a time string (implying upcoming)
    // We prioritize the local formatted time.
    if (!statusText || statusText === 'Upcoming' || statusText.includes(':')) {
      let kickoffTime = match.kickoff;

      // If no kickoff but we have date and time from API 1
      if (!kickoffTime && match.date && match.time) {
        // Assume API time is UTC. Format: YYYY-MM-DDTHH:MM:00Z
        const cleanTime = match.time.replace(/[^0-9:]/g, '');
        kickoffTime = `${match.date}T${cleanTime}:00Z`;
      } else if (kickoffTime) {
        // Force UTC on existing kickoff if needed
        if (!kickoffTime.endsWith('Z') && !kickoffTime.includes('+') && !kickoffTime.includes('-')) {
          kickoffTime += 'Z';
        }
      }

      if (kickoffTime) {
        const date = new Date(kickoffTime);
        if (!isNaN(date.getTime())) {
          // Get user's timezone exactly as requested
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          statusText = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: userTimezone
          });
        }
      }
    }

    // Fix for API 1 structure (nested objects)
    const homeName = match.home_team?.name || match.home_team || 'Home Team';
    const awayName = match.away_team?.name || match.away_team || 'Away Team';

    const homeLogo = match.home_team?.logo || match.home_logo || 'assets/teams/default.png';
    const awayLogo = match.away_team?.logo || match.away_logo || 'assets/teams/default.png';
    const compLogo = match.competition_logo || '';
    const matchId = match.id || match.match_id || Math.random().toString(36).substr(2, 9);

    const card = document.createElement('div');
    card.className = 'score-card';
    card.id = `match-${matchId}`;

    card.innerHTML = `
      <div class="flex-row" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="left" style="display:flex; align-items:center;">
            ${compLogo ? `<img src="${compLogo}" class="league-icon" style="background:white;border-radius:50%;padding:2px;" alt="">` : '<span class="league-icon">⚽</span>'}
            <span class="muted">${match.competition}</span>
        </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center">
          <img src="${awayLogo}" style="width:24px;height:24px;object-fit:contain;margin-right:8px;" alt="">
            <span>${awayName}</span>
        </div>
        <div style="font-size:18px;font-weight:700;color:var(--accent)">${awayScore}</div>
      </div>
      </div >
      <button class="cta" style="width:100%;margin-top:12px">Watch Stream</button>
    `;
    container.appendChild(card);
  });
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
    el.innerHTML = `< img src = "${c.img}" alt = "${c.name} logo" /> <div>${c.name}</div>`;
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
      fetchMatches();
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
      slide.innerHTML = `< video preload = "metadata" controls playsinline muted >
      <source src="${h.file}" type="video/mp4">
      </video>`;
      carouselTrack.appendChild(slide);
    });

    const slides = Array.from(document.querySelectorAll(".slide"));
    // Re-implemented goToSlide logic locally for controls
    function goToSlideLocal(idx) {
      if (!slides.length) return;
      currentSlide = (idx + slides.length) % slides.length;
      carouselTrack.style.transform = `translateX(-${currentSlide * 100} %)`;
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
  fetchMatches();
});
