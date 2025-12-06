/* ---------- UI: tabs, mobile menu, login modal ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Tabs (desktop)
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  function setActiveTab(name){
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    tabContents.forEach(c => {
      const active = c.id === name;
      c.classList.toggle("active", active);
      c.setAttribute("aria-hidden", String(!active));
    });
    localStorage.setItem("stream11.activeTab", name);
  }
  tabButtons.forEach(b => b.addEventListener("click", ()=> setActiveTab(b.dataset.tab)));
  setActiveTab(localStorage.getItem("stream11.activeTab") || "football");

  // Mobile menu toggle
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  hamburger.addEventListener("click", ()=>{
    const open = mobileNav.getAttribute("aria-hidden") === "false";
    mobileNav.setAttribute("aria-hidden", String(open));
    mobileNav.style.display = open ? "none" : "flex";
  });
  // Mobile nav links
  document.querySelectorAll(".mobile-link").forEach(btn=>{
    btn.addEventListener("click", ()=> {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
      mobileNav.style.display = "none";
    });
  });

  // LOGIN modal (client-side demo ONLY)
  const loginBtn = document.getElementById("login-btn");
  const loginBtnMobile = document.getElementById("login-btn-mobile");
  const loginModal = document.getElementById("login-modal");
  const closeLogin = document.getElementById("close-login");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout");
  const usernameInput = document.getElementById("login-username");

  function openLogin(){ loginModal.setAttribute("aria-hidden", "false"); }
  function closeLoginModal(){ loginModal.setAttribute("aria-hidden", "true"); }

  loginBtn?.addEventListener("click", openLogin);
  loginBtnMobile?.addEventListener("click", openLogin);
  closeLogin?.addEventListener("click", closeLoginModal);
  loginForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const user = usernameInput.value.trim();
    if(!user) return alert("Enter a username");
    localStorage.setItem("stream11.user", user);
    alert("Signed in as " + user + " (demo)");
    closeLoginModal();
  });
  logoutBtn?.addEventListener("click", ()=>{
    localStorage.removeItem("stream11.user");
    alert("Signed out (demo)");
  });

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Club icons injection (demo) ---------- */
  const clubs = [
    {name:"Barcelona", img:"assets/teams/barcelona.png"},
    {name:"Real Madrid", img:"assets/teams/real-madrid.png"},
    {name:"Man City", img:"assets/teams/man-city.png"},
    {name:"Liverpool", img:"assets/teams/liverpool.png"}
  ];
  const clubList = document.getElementById("club-list");
  if(clubList){
    clubs.forEach(c=>{
      const el = document.createElement("div");
      el.className = "club-item";
      el.innerHTML = `<img src="${c.img}" alt="${c.name} logo"/><div>${c.name}</div>`;
      clubList.appendChild(el);
    });
  }

  /* ---------- Carousel: auto-play highlights ---------- */
  const carouselTrack = document.getElementById("carousel-track");
  const highlights = [
    {title:"Goal 34'", file:"highlights/h1.mp4"},
    {title:"Amazing Save", file:"highlights/h2.mp4"},
    {title:"Top Moment", file:"highlights/h3.mp4"}
  ];
  let currentSlide = 0;
  let autoplay = true;
  let autoplayInterval = null;

  // build slides
  highlights.forEach((h, i)=>{
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.dataset.index = i;
    slide.innerHTML = `<video preload="metadata" controls playsinline muted>
                         <source src="${h.file}" type="video/mp4">
                       </video>`;
    carouselTrack.appendChild(slide);
  });

  const slides = Array.from(document.querySelectorAll(".slide"));
  function goToSlide(idx){
    if(!slides.length) return;
    currentSlide = (idx + slides.length) % slides.length;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    // pause others, play current muted (optional)
    slides.forEach((s, i)=>{
      const v = s.querySelector("video");
      if(!v) return;
      if(i === currentSlide){ v.currentTime = 0; /*v.play();*/ } else { v.pause(); }
    });
  }

  document.getElementById("prev").addEventListener("click", ()=> { goToSlide(currentSlide-1); });
  document.getElementById("next").addEventListener("click", ()=> { goToSlide(currentSlide+1); });
  const playpauseBtn = document.getElementById("playpause");
  playpauseBtn.addEventListener("click", ()=> {
    autoplay = !autoplay;
    playpauseBtn.textContent = autoplay ? "⏯" : "▶";
    if(autoplay) startAutoplay(); else stopAutoplay();
  });

  function startAutoplay(){
    stopAutoplay();
    autoplayInterval = setInterval(()=> goToSlide(currentSlide+1), 6000);
  }
  function stopAutoplay(){ if(autoplayInterval){ clearInterval(autoplayInterval); autoplayInterval = null; } }
  if(autoplay) startAutoplay();
  goToSlide(0);

  /* ---------- Live scores: demo population using TheSportsDB test key (client example) ----------
     NOTE: TheSportsDB offers a free test key "3" for development (see their docs). Production: sign up and use your key.
     Alternative: ScoreBat free livescore widget (already embedded). For robust live data use a server-side proxy to hide API keys.
     Docs: TheSportsDB, Football-Data.org, ScoreBat. */
  const liveCards = document.getElementById("live-cards");
  async function loadDemoLives(){
    // DEMO: TheSportsDB test endpoint for events: (this is a development/test usage)
    // Example: https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2025-12-07&s=Soccer
    // Replace '3' with your API key for production.
    try {
      const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
      const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`;
      const res = await fetch(url);
      if(!res.ok) throw new Error("Failed to fetch demo events");
      const data = await res.json();
      // data.event is an array (or events)
      const events = data?.events || [];
      if(!events.length){
        liveCards.innerHTML = `<div class="score-card">No events found for today (demo).</div>`;
        return;
      }
      liveCards.innerHTML = '';
      events.slice(0,6).forEach(ev=>{
        const card = document.createElement('div');
        card.className = 'score-card';
        const home = ev.strHomeTeam || 'Home';
        const away = ev.strAwayTeam || 'Away';
        const time = ev.strTime || ev.strTimestamp || 'TBD';
        const score = ev.intHomeScore != null ? `${ev.intHomeScore} - ${ev.intAwayScore}` : 'vs';
        card.innerHTML = `<div class="teams"><div class="team"><img src="assets/teams/${(home||'').toLowerCase().replace(/\s+/g,'-')}.png" onerror="this.style.display='none'"> ${home}</div>
                          <div class="score">${score}</div>
                          <div class="team"><img src="assets/teams/${(away||'').toLowerCase().replace(/\s+/g,'-')}.png" onerror="this.style.display='none'"> ${away}</div></div>
                          <div class="status">${time}</div>`;
        liveCards.appendChild(card);
      });
    } catch (err){
      liveCards.innerHTML = `<div class="score-card">Live scores unavailable (demo). Error: ${err.message}</div>`;
      console.warn(err);
    }
  }
  loadDemoLives();
});
