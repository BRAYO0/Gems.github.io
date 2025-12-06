/* GENERAL */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: "Poppins", sans-serif;
  background: #071316;
  color: #e9e9e9;
  overflow-x: hidden;
}

h1, h2, h3 { font-weight: 600; }

/* HEADER */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 30px;
  background: #0b2025;
  border-bottom: 2px solid #00ff85;
  box-shadow: 0 2px 10px #0007;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
}

.logo h1 {
  font-size: 1.8rem;
}
.logo span { color: #00ff85; }

.menu button {
  padding: 10px 18px;
  border-radius: 8px;
  background: #092427;
  color: #00ffb0;
  border: 1px solid #00ffb0;
  cursor: pointer;
  font-size: 0.95rem;
  transition: 0.25s ease;
}

.menu button:hover,
.menu button.active {
  background: #00ff85;
  color: #022220;
  box-shadow: 0 0 10px #00ff85;
  font-weight: 600;
}

/* BANNER */
.hero-banner {
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("assets/pitch.jpg") center/cover no-repeat,
              linear-gradient(#021010, #021010);
  background-blend-mode: overlay;
  text-align: center;
}

.hero-content h2 {
  font-size: 2.6rem;
  color: #00ff85;
  text-shadow: 0 0 18px #00ff85;
}

.hero-content p {
  margin-top: 10px;
  opacity: 0.9;
}

.hero-btn {
  display: inline-block;
  margin-top: 18px;
  padding: 12px 20px;
  border-radius: 8px;
  background: #00ff85;
  color: #022220;
  font-weight: 700;
  text-decoration: none;
  transition: 0.25s;
}

.hero-btn:hover {
  background: #18ff9c;
  box-shadow: 0 0 14px #00ff85;
}

/* LIVE SCORES */
.scores-section { padding: 40px 30px; text-align: center; }
.scores-section h2 { margin-bottom: 20px; color: #00ff85; }

.score-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
}

.score-card {
  background: #10282d;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #00ff85;
  transition: 0.3s ease;
}

.score-card.glow:hover {
  box-shadow: 0 0 20px #00ff85;
  transform: translateY(-4px);
}

.teams { display: flex; justify-content: space-between; font-size: 1.1rem; }
.score { color: #00ff85; font-weight: 700; }

.status.live { color: #ff3c3c; font-weight: bold; }

/* TABS */
.tab-content { display: none; padding: 30px; }
.tab-content.active { display: block; }

/* STREAM CARDS */
.stream-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.stream-card {
  background: #10282d;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #00ff8533;
}

.smooth { transition: 0.25s ease; }
.smooth:hover {
  box-shadow: 0 0 14px #00ff85;
  transform: translateY(-4px);
}

.video-wrap {
  position: relative;
  padding-top: 56%;
  border-radius: 10px;
  overflow: hidden;
}
.video-wrap iframe { position: absolute; width: 100%; height: 100%; }

/* STATS */
.stats-card {
  background: #10282d;
  padding: 20px;
  border-radius: 10px;
  border-left: 3px solid #00ff85;
}

.stats-table {
  width: 100%;
  margin-top: 12px;
  border-collapse: collapse;
}
.stats-table td, th {
  padding: 12px;
  border-bottom: 1px solid #1c4045;
}

/* HIGHLIGHTS */
.highlights-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
.highlight-card {
  background: #10282d;
  padding: 16px;
  border-radius: 12px;
}

/* FOOTER */
.footer {
  text-align: center;
  padding: 18px;
  background: #0c1d1f;
  border-top: 2px solid #00ff85;
  margin-top: 40px;
}
