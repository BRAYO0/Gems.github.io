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
  if (m) m.classList.toggle('hidden');
}

// Modals (Using Set 1's original function/IDs)
function openLoginModal() {
  document.getElementById('login-modal').classList.add('active');
}

function openSignupModal() {
  document.getElementById('signup-modal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
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
    // Fetch matches from external API
    // API 1: Fixtures
    const scheduleData = await fetch('https://match-fetch.netlify.app/matches').then(r => r.ok ? r.json() : []).catch(e => {
      console.error("Fetch error:", e);
      return [];
    });

    console.log("Schedule Data:", scheduleData);

    if (!scheduleData || scheduleData.length === 0) {
      throw new Error('No schedule data available');
    }

    // Merge & Store Data
    const matches = scheduleData.map(match => {
      // Ensure robust ID
      const stableId = String(match.id || match.match_id || ((match.home_team?.name || 'h') + (match.away_team?.name || 'a')).replace(/[^a-zA-Z0-9]/g, ''));

      // Use scores from the match object directly
      const homeScore = match.home_score ?? '-';
      const awayScore = match.away_score ?? '-';

      // Normalize status
      let statusRaw = match.status || match.time_period || match.time;
      if (statusRaw && ['not started', 'ns', 'scheduled'].includes(statusRaw.toLowerCase())) {
        statusRaw = 'Upcoming';
      }

      let internalStatus = statusRaw || 'Upcoming';
      if (internalStatus.toLowerCase() === 'not started') internalStatus = 'Upcoming';

      // Determine if match has started
      const isStarted = internalStatus !== 'Upcoming' &&
        !internalStatus.match(/^\d{1,2}:\d{2}$/) &&
        !internalStatus.toLowerCase().includes('postp');

      // Calculate Kickoff Date
      let kickoffDate = null;
      if (match.date && match.time) {
        // Format: YYYY-MM-DD and HH:MM
        // Create ISO string for parsing: YYYY-MM-DDTHH:MM:00
        // Note: This assumes the API time is local to the user or UTC. 
        // Given no timezone info, we'll try to treat it as local string or append Z if needed.
        // Usually these APIs are UTC. Let's assume UTC for consistency with 'Z'.
        const cleanTime = match.time.replace(/[^0-9:]/g, '');
        // Trying explicit UTC
        kickoffDate = new Date(`${match.date}T${cleanTime}:00Z`); // Added Z to force UTC interpretation
      } else if (match.kickoff) {
        let k = match.kickoff;
        if (!k.endsWith('Z') && !k.includes('+') && !k.includes('-')) {
          k += 'Z';
        }
        kickoffDate = new Date(k);
      }

      // Fallback if Date is invalid
      if (kickoffDate && isNaN(kickoffDate.getTime())) {
        console.warn("Invalid date for match:", match.id, match.date, match.time);
        kickoffDate = new Date(); // Fallback to now so it shows? Or null.
      }

      // Check nested objects usage
      const homeTeamName = match.home_team?.name || match.home_team || 'Home Team';
      const awayTeamName = match.away_team?.name || match.away_team || 'Away Team';
      const homeTeamLogo = match.home_team?.logo || match.home_logo || 'assets/teams/default.png';
      const awayTeamLogo = match.away_team?.logo || match.away_logo || 'assets/teams/default.png';

      return {
        ...match,
        id: stableId,
        home_score: isStarted ? homeScore : '-',
        away_score: isStarted ? awayScore : '-',
        time_period: internalStatus,
        home_team: { name: homeTeamName, logo: homeTeamLogo },
        away_team: { name: awayTeamName, logo: awayTeamLogo },
        competition_logo: match.competition_logo,
        competition: match.competition,
        kickoffDate: kickoffDate
      };
    });

    console.log("Processed Matches:", matches);

    // Assign to global variable for filtering/display
    allMatches = matches;

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
    card.className = 'score-card glow-card rounded-lg p-6 cursor-pointer hover:border-green-500/50 transition-colors';
    card.id = `match-${matchId}`;

    const league = match.competition || 'Football';

    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          ${compLogo ? `<img src="${compLogo}" class="w-6 h-6 rounded-full bg-white p-0.5 object-contain">` : '<span class="league-icon">⚽</span>'}
          <span class="text-xs text-gray-400">${league}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="live-indicator w-2 h-2 bg-red-500 rounded-full" style="display:${isLive ? 'inline-block' : 'none'}"></span>
          <span class="match-status text-xs ${isLive ? 'text-red-400' : 'text-gray-400'} font-medium">${statusText}</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <img src="${homeLogo}" class="w-8 h-8 object-contain" alt="${homeName}">
            <span class="font-medium">${homeName}</span>
          </div>
          <span class="score-home text-2xl font-bold neon-text w-8 text-center">${homeScore}</span>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 flex-1">
           <img src="${awayLogo}" class="w-8 h-8 object-contain" alt="${awayName}">
            <span class="font-medium">${awayName}</span>
          </div>
          <span class="score-away text-2xl font-bold neon-text w-8 text-center">${awayScore}</span>
        </div>
      </div>
      
      <button class="btn-primary w-full mt-4 text-sm opacity-80 hover:opacity-100" onclick="handleWatchClick('${matchId}')">Watch Stream</button>
    `;
    container.appendChild(card);
  });
}


/* ========================================
   Highlights Logic
   ======================================== */

async function fetchHighlights() {
  const container = document.getElementById('highlights-grid');
  if (!container) return;

  try {
    const response = await fetch('https://lyfe05.github.io/highlight-api/matches.json');
    if (!response.ok) throw new Error('Failed to fetch highlights');

    const data = await response.json();
    const highlights = data.data || [];
    window.allHighlights = highlights; // Store globally handling streams

    if (highlights.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No highlights available at the moment.</div>';
      return;
    }

    container.innerHTML = '';

    highlights.forEach((match, index) => {
      // Ensure we have an ID for lookup
      match.id = match.id || match.match_id || `hl_${index}`;

      const card = document.createElement('div');
      card.className = 'glow-card rounded-lg overflow-hidden flex flex-col h-full';

      // Use team logos for visual if no thumbnail
      const getLogo = (url, name) => {
        if (url && url.length > 5) return url;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
      }

      const homeName = match.home.name;
      const awayName = match.away.name;
      const homeLogo = getLogo(match.home.logo_url, homeName);
      const awayLogo = getLogo(match.away.logo_url, awayName);

      const score = `${match.home.score} - ${match.away.score}`;

      card.innerHTML = `
        <div class="p-6 flex-grow flex flex-col justify-between">
          <div class="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wider">${match.league || 'Football'}</div>
          
          <div class="flex items-center justify-between mb-6">
            <div class="flex flex-col items-center w-5/12 text-center">
              <img src="${homeLogo}" alt="${homeName}" class="w-16 h-16 object-contain mb-2 rounded-full bg-gray-700/50 p-1" 
                   onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(homeName)}&background=random&color=fff&size=128'">
              <span class="font-bold text-sm sm:text-base leading-tight">${homeName}</span>
            </div>
            
            <div class="flex flex-col items-center justify-center w-2/12">
              <div class="text-2xl font-bold text-white whitespace-nowrap bg-gray-800 px-3 py-1 rounded-lg">${score}</div>
              <span class="text-xs text-gray-500 mt-1">${match.date}</span>
            </div>

            <div class="flex flex-col items-center w-5/12 text-center">
              <img src="${awayLogo}" alt="${awayName}" class="w-16 h-16 object-contain mb-2 rounded-full bg-gray-700/50 p-1" 
                   onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(awayName)}&background=random&color=fff&size=128'">
              <span class="font-bold text-sm sm:text-base leading-tight">${awayName}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-800/50 border-t border-gray-700">
          <button class="w-full btn-secondary text-sm py-2 disabled:opacity-50 cursor-pointer hover:bg-green-500/20 hover:text-green-400 transition-colors" onclick="handleWatchClick('${match.id}')">
            Watch Highlights
          </button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading highlights:', error);
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Failed to load highlights.</div>';
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
    el.innerHTML = `< img src = "${c.img}" alt = "${c.name} logo" /> <div>${c.name}</div>`;
    list.appendChild(el);
  });
}

// Main DOM Content Loaded Listener (Combining Set 1 & Set 2's event handlers)
document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile menu links ---
  document.querySelectorAll(".mobile-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      // Check if global switchTab exists
      if (typeof switchTab === 'function' && tab) {
        switchTab(tab);
      }
      toggleMobileMenu();
    });
  });

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
  // --- Highlights: initial load ---
  fetchHighlights();

  // --- Live scores: initial load ---
  fetchMatches();
  // Auto-refresh every 10 seconds
  setInterval(() => fetchMatches(true), 10000);
});

// --- Player Logic ---
window.handleWatchClick = async function (id) {
  let match = typeof allMatches !== 'undefined' ? allMatches.find(m => m.id === id) : null;

  if (!match && typeof allHighlights !== 'undefined') {
    match = allHighlights.find(m => m.id === id);
  }

  if (!match) return;

  // 1. Check for existing streams (Highlights)
  if (match.stream_urls && match.stream_urls.length > 0) {
    // Pass all streams to player page for switching
    const streamsPayload = encodeURIComponent(JSON.stringify(match.stream_urls));
    window.location.href = `player.html?streams=${streamsPayload}`;
    return;
  }

  // 2. Check for legacy URL
  if (match.url) {
    // Fallback for single legacy URL
    window.location.href = `player.html?url=${encodeURIComponent(match.url)}`;
    return;
  }

  // 3. Try fetching live streams (Fixtures)
  try {
    document.body.style.cursor = 'wait';
    // Fetch details from new API
    const response = await fetch(`https://match-fetch.netlify.app/match/${id}`);
    if (!response.ok) {
      // Silent fail or just throw to catch block
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    if (data.streams && data.streams.length > 0) {
      // Pass the full streams objects (url + headers) to player
      const streamsPayload = encodeURIComponent(JSON.stringify(data.streams));
      window.location.href = `player.html?streams=${streamsPayload}`;
    } else {
      throw new Error('No streams in response');
    }

  } catch (error) {
    console.warn("Stream fetch error:", error);
    alert("No streams available for this match yet.");
  } finally {
    document.body.style.cursor = 'default';
  }
}

window.openPlayer = function (url) {
  if (!url) {
    alert("Stream URL not available yet.");
    return;
  }
  // Redirect to player page (url might contain | headers, player.html handles it)
  window.location.href = `player.html?url=${encodeURIComponent(url)}`;
}

/* ========================================
   Element SDK Integration
   ======================================== */

function onConfigChange(config) {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('site-title', config.site_title || defaultConfig.site_title);
  setText('tagline', config.tagline || defaultConfig.tagline);
  setText('banner-title', config.banner_title || defaultConfig.banner_title);
  setText('banner-subtitle', config.banner_subtitle || defaultConfig.banner_subtitle);
  setText('cta-button', config.cta_button_text || defaultConfig.cta_button_text);
}

function mapToEditPanelValues(config) {
  return new Map([
    ['site_title', config.site_title || defaultConfig.site_title],
    ['tagline', config.tagline || defaultConfig.tagline],
    ['banner_title', config.banner_title || defaultConfig.banner_title],
    ['banner_subtitle', config.banner_subtitle || defaultConfig.banner_subtitle],
    ['cta_button_text', config.cta_button_text || defaultConfig.cta_button_text]
  ]);
}

function mapToCapabilities(config) {
  return {
    recolorables: [],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

// Initialize SDK
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}
