/* script.js - Stream11 combined frontend logic */

const defaultConfig = {
  site_title: "Stream11",
  tagline: "Live Football Streaming & Scores"
};

/* ========================================
   UI Helpers
   ======================================== */

function showToast(msg) {
  const t = document.getElementById('success-toast');
  if (!t) return;
  const msgEl = document.getElementById('success-message') || t.querySelector('p');
  if (msgEl) msgEl.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3000);
}

function switchTab(name) {
  currentFilter = name;
  document.querySelectorAll('.tab-button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  filterAndDisplayMatches();
}

function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  if (m) m.classList.toggle('hidden');
}

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
   Login/Signup Handlers
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
   Scores Logic
   ======================================== */

async function fetchMatches(isUpdate = false) {
  window.isUpdating = isUpdate;
  const container = document.getElementById('live-scores');
  if (container && !isUpdate) {
    container.innerHTML = '<div class="placeholder-text"><div class="loader"></div> Loading matches...</div>';
  }

  try {
    const [matchesData, scoresData] = await Promise.all([
      fetch('https://match-fetch.netlify.app/matches').then(r => r.ok ? r.json() : []),
      fetch('https://match-fetch.netlify.app/scores').then(r => r.ok ? r.json() : [])
    ]).catch(e => {
      console.error("Fetch error:", e);
      return [[], []];
    });

    if (matchesData.length === 0) {
      throw new Error('No match data available');
    }

    const scoresMap = new Map();
    scoresData.forEach(s => {
      const sid = String(s.id || s.match_id);
      if (sid) scoresMap.set(sid, s);
    });

    const mergedMatches = matchesData.map(match => {
      const stableId = String(match.id || match.match_id || ((match.home_team?.name || 'h') + (match.away_team?.name || 'a')).replace(/[^a-zA-Z0-9]/g, ''));
      const liveUpdate = scoresMap.get(stableId);

      let statusRaw = liveUpdate?.status || match.status || match.time_period || match.time;
      if (statusRaw && ['not started', 'ns', 'scheduled'].includes(statusRaw.toLowerCase())) {
        statusRaw = 'Upcoming';
      }

      let internalStatus = statusRaw || 'Upcoming';
      if (internalStatus.toLowerCase() === 'not started') internalStatus = 'Upcoming';

      const isStarted = internalStatus !== 'Upcoming' &&
        !internalStatus.match(/^\d{1,2}:\d{2}$/) &&
        !internalStatus.toLowerCase().includes('postp');

      const homeScore = liveUpdate?.home?.score ?? match.home_score ?? '-';
      const awayScore = liveUpdate?.away?.score ?? match.away_score ?? '-';

      let kickoffDate = null;
      if (match.date && match.time) {
        const cleanTime = match.time.replace(/[^0-9:]/g, '');
        kickoffDate = new Date(`${match.date}T${cleanTime}:00Z`);
      } else if (match.kickoff) {
        let k = match.kickoff;
        if (!k.endsWith('Z') && !k.includes('+') && !k.includes('-')) k += 'Z';
        kickoffDate = new Date(k);
      }

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

    window.allMatches = mergedMatches;
    filterAndDisplayMatches();

  } catch (error) {
    console.error('Error fetching matches:', error);
    if (container) {
      container.innerHTML = '<div class="placeholder-text">Unable to load matches at this time.</div>';
    }
  }
}

let currentFilter = 'all';

function filterAndDisplayMatches() {
  const now = new Date();
  const DURATION_MS = 2.5 * 60 * 60 * 1000;

  const getMatchCategory = (m) => {
    const status = m.time_period || '';
    if (status === 'FT' || status === 'Full time' || status === 'Finished') return 'finished';
    if (status.includes("'") || status.includes("Live") || status.includes("Half") || status.includes("HT")) return 'live';
    if (!m.kickoffDate) return 'upcoming';
    const diff = now - m.kickoffDate;
    if (diff > DURATION_MS) return 'finished';
    if (diff >= 0) return 'live';
    return 'upcoming';
  };

  let filtered = [];
  if (currentFilter === 'all') {
    filtered = window.allMatches || [];
  } else {
    filtered = (window.allMatches || []).filter(m => getMatchCategory(m) === currentFilter);
  }

  if (window.isUpdating && filtered.length > 0) {
    updateVisibleMatches(filtered);
  } else {
    displayMatches(filtered);
  }
}

function updateVisibleMatches(matches) {
  const container = document.getElementById('live-scores');
  if (!container) return;

  if (container.children.length === 0 || container.querySelector('.placeholder-text')) {
    displayMatches(matches);
    return;
  }

  matches.forEach(match => {
    const matchId = match.id || match.match_id;
    if (!matchId) return;

    const card = document.getElementById(`match-${matchId}`);
    if (card) {
      const statusEl = card.querySelector('.match-status');
      const scoreHomeEl = card.querySelector('.score-home');
      const scoreAwayEl = card.querySelector('.score-away');
      const liveDot = card.querySelector('.live-indicator');

      let statusText = match.time_period || 'Upcoming';
      let isLive = false;
      const liveKeywords = ["'", "Live", "Half"];
      if (liveKeywords.some(k => statusText.includes(k))) isLive = true;
      if (statusText === "Full time") { statusText = "FT"; isLive = false; }

      if (!statusText || statusText === 'Upcoming' || statusText.includes(':')) {
        let kickoffTime = match.kickoffDate;
        if (kickoffTime && !isNaN(kickoffTime.getTime())) {
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          statusText = kickoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: userTimezone });
        }
      }

      if (statusEl && statusEl.textContent !== statusText) statusEl.textContent = statusText;
      if (scoreHomeEl) {
        scoreHomeEl.textContent = match.home_score ?? '-';
        if (isLive || statusText === 'FT') {
          scoreHomeEl.classList.remove('hidden');
          if (scoreAwayEl) {
            scoreAwayEl.textContent = match.away_score ?? '-';
            scoreAwayEl.classList.remove('hidden');
          }
          const vsText = card.querySelector('.vs-text');
          if (vsText) vsText.textContent = '-';
        }
      }
      if (liveDot) liveDot.style.display = isLive ? 'inline-block' : 'none';
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
    const homeScore = match.home_score ?? '-';
    const awayScore = match.away_score ?? '-';
    let statusText = match.time_period || 'Upcoming';
    let isLive = false;
    const liveKeywords = ["'", "Live", "Half"];
    if (liveKeywords.some(k => statusText.includes(k))) isLive = true;
    if (statusText === "Full time") { statusText = "FT"; isLive = false; }

    if (!statusText || statusText === 'Upcoming' || statusText.includes(':')) {
      let kickoffTime = match.kickoffDate;
      if (kickoffTime && !isNaN(kickoffTime.getTime())) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        statusText = kickoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: userTimezone });
      }
    }

    const homeName = match.home_team?.name || match.home_team || 'Home Team';
    const awayName = match.away_team?.name || match.away_team || 'Away Team';
    const homeLogo = match.home_team?.logo || match.home_logo || 'assets/teams/default.png';
    const awayLogo = match.away_team?.logo || match.away_logo || 'assets/teams/default.png';
    const compLogo = match.competition_logo || '';
    const matchId = match.id || match.match_id || Math.random().toString(36).substr(2, 9);

    const card = document.createElement('div');
    card.className = 'glow-card rounded-lg overflow-hidden flex flex-col h-full';
    card.id = `match-${matchId}`;

    card.innerHTML = `
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            ${compLogo ? `<img src="${compLogo}" class="w-6 h-6 rounded-full bg-white p-0.5 object-contain">` : '<span class="league-icon text-xs">⚽</span>'}
            <span class="text-xs font-semibold text-green-400 uppercase tracking-wider">${match.competition || 'Football'}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="live-indicator w-2 h-2 bg-red-500 rounded-full" style="display:${isLive ? 'inline-block' : 'none'}"></span>
            <span class="match-status text-xs ${isLive ? 'text-red-400' : 'text-gray-400'} font-medium">${statusText}</span>
          </div>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <div class="flex flex-col items-center w-5/12 text-center">
            <img src="${homeLogo}" alt="${homeName}" class="w-14 h-14 object-contain mb-2 rounded-full bg-gray-700/50 p-1"
                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(homeName)}&background=random&color=fff&size=128'">
            <span class="font-bold text-sm leading-tight">${homeName}</span>
          </div>
          <div class="flex flex-col items-center justify-center w-2/12">
            <div class="text-xl font-bold text-white whitespace-nowrap bg-gray-800 px-2 py-1 rounded-lg">
              ${isLive || statusText === 'FT' ?
        `<span class="score-home">${homeScore}</span> - <span class="score-away">${awayScore}</span>` :
        `<span class="score-home hidden">${homeScore}</span><span class="vs-text">VS</span><span class="score-away hidden">${awayScore}</span>`}
            </div>
          </div>
          <div class="flex flex-col items-center w-5/12 text-center">
            <img src="${awayLogo}" alt="${awayName}" class="w-14 h-14 object-contain mb-2 rounded-full bg-gray-700/50 p-1"
                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(awayName)}&background=random&color=fff&size=128'">
            <span class="font-bold text-sm leading-tight">${awayName}</span>
          </div>
        </div>
      </div>
      <div class="p-4 bg-gray-800/50 border-t border-gray-700">
        <button class="btn-primary w-full text-sm py-2 shadow-lg shadow-green-500/10 hover:shadow-green-500/30" onclick="handleWatchClick('${matchId}')">
          Watch Stream
        </button>
      </div>
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
    window.allHighlights = highlights;

    if (highlights.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No highlights available at the moment.</div>';
      return;
    }

    container.innerHTML = '';
    highlights.forEach((match, index) => {
      match.id = match.id || match.match_id || `hl_${index}`;
      const card = document.createElement('div');
      card.className = 'glow-card rounded-lg overflow-hidden flex flex-col h-full';

      const homeName = match.home.name;
      const awayName = match.away.name;
      const homeLogo = match.home.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(homeName)}&background=random&color=fff&size=128`;
      const awayLogo = match.away.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(awayName)}&background=random&color=fff&size=128`;

      card.innerHTML = `
        <div class="p-6 flex-grow flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-green-400 uppercase tracking-wider">${match.league || 'Football'}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="match-status text-xs text-gray-400 font-medium">${match.date}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between mb-2">
            <div class="flex flex-col items-center w-5/12 text-center">
              <img src="${homeLogo}" alt="${homeName}" class="w-14 h-14 object-contain mb-2 rounded-full bg-gray-700/50 p-1" 
                   onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(homeName)}&background=random&color=fff&size=128'">
              <span class="font-bold text-sm leading-tight">${homeName}</span>
            </div>
            
            <div class="flex flex-col items-center justify-center w-2/12">
              <div class="text-xl font-bold text-white whitespace-nowrap bg-gray-800 px-2 py-1 rounded-lg">
                ${match.home.score} - ${match.away.score}
              </div>
            </div>

            <div class="flex flex-col items-center w-5/12 text-center">
              <img src="${awayLogo}" alt="${awayName}" class="w-14 h-14 object-contain mb-2 rounded-full bg-gray-700/50 p-1" 
                   onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(awayName)}&background=random&color=fff&size=128'">
              <span class="font-bold text-sm leading-tight">${awayName}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-gray-800/50 border-t border-gray-700">
          <button class="w-full btn-secondary text-sm py-2 cursor-pointer hover:bg-green-500/20 hover:text-green-400 transition-colors" onclick="handleWatchClick('${match.id}')">
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

function loadComponents() {
  const components = document.querySelectorAll('[data-component]');
  components.forEach((el) => {
    const name = el.getAttribute('data-component');
    if (window.COMPONENTS && window.COMPONENTS[name]) {
      el.innerHTML = window.COMPONENTS[name];
    }
  });
}

function initApp() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  fetchHighlights();

  const matchesContainer = document.getElementById('live-scores');
  if (matchesContainer) {
    fetchMatches();
    setInterval(() => fetchMatches(true), 10000);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponents();
  initApp();
});

/* ========================================
   Player Logic
   ======================================== */

window.handleWatchClick = async function (id) {
  let match = typeof allMatches !== 'undefined' ? allMatches.find(m => m.id === id) : null;
  let isHighlight = false;

  if (!match && typeof allHighlights !== 'undefined') {
    match = allHighlights.find(m => m.id === id);
    isHighlight = true;
  }

  if (!match) return;

  const returnUrl = window.location.href;
  const homeName = (match.home_team?.name || match.home?.name || 'Home').trim();
  const awayName = (match.away_team?.name || match.away?.name || 'Away').trim();
  const matchTitle = `${homeName} vs ${awayName}`;
  const slug = matchTitle.replace(/\s+/g, '-');
  const urlType = isHighlight ? 'highlight' : 'match';

  const goToPlayer = (streams) => {
    sessionStorage.setItem('active_match', JSON.stringify({
      title: matchTitle,
      streams: streams,
      returnTo: returnUrl,
      type: urlType
    }));
    window.location.href = `player.html?watch=${encodeURIComponent(slug)}`;
  };

  // 1. Check for existing streams (Highlights)
  if (match.stream_urls && match.stream_urls.length > 0) {
    goToPlayer(match.stream_urls);
    return;
  }

  // 2. Check for legacy URL
  if (match.url) {
    goToPlayer([match.url]);
    return;
  }

  // 3. Try fetching live streams (Fixtures)
  try {
    document.body.style.cursor = 'wait';
    const response = await fetch(`https://match-fetch.netlify.app/match/${id}`);
    if (!response.ok) throw new Error('Fetch failed');
    const data = await response.json();
    if (data.streams && data.streams.length > 0) {
      goToPlayer(data.streams);
    } else {
      throw new Error('No streams');
    }
  } catch (error) {
    console.warn("Stream fetch error:", error);
    alert("No streams available for this match yet.");
  } finally {
    document.body.style.cursor = 'default';
  }
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
}

function mapToEditPanelValues(config) {
  return new Map([
    ['site_title', config.site_title || defaultConfig.site_title],
    ['tagline', config.tagline || defaultConfig.tagline]
  ]);
}

function mapToCapabilities(config) {
  return { recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined };
}

if (window.elementSdk) {
  window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
}
