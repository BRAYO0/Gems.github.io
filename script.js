document.addEventListener("DOMContentLoaded", () => {

  // TAB SWITCHING
  const buttons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-content");

  function switchTab(tab) {
    buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    sections.forEach(sec => sec.classList.toggle("active", sec.id === tab));
    localStorage.setItem("activeTab", tab);
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Restore last tab
  const last = localStorage.getItem("activeTab") || "football";
  switchTab(last);

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();
});
