/* =========================
   CONFIG: Background & Assets
   ========================= */
const CONFIG = {
  background: "gradient", // "gradient" | "image" | "video"
  imageUrl: "https://images.unsplash.com/photo-1501117716987-c8e6934136c1?q=80&w=1920&auto=format&fit=crop",
  videoUrl: "", // z.B. "assets/beach.mp4" (leer lassen, wenn keins)
};

/* =========================
   STATUS MODEL
   states: "online" | "warning" | "maintenance" | "offline" | "open" | "closed"
   ========================= */
const STATUS = {
  resort:  { state: "warning", label: "Error" },
  checkin: { state: "online", label: "Online" },
  stage:   { state: "closed",   label: "Closed"   },
};

// === Quick helpers for scripted changes ===
function setStatus(key, state, customLabel){
  if(!STATUS[key]) return;
  STATUS[key].state = state.toLowerCase();
  if(customLabel) STATUS[key].label = customLabel;
  applyStatusToDOM(key);
  touchLastUpdated();
}
function bulkSetStatus(map){ Object.entries(map).forEach(([k,v])=> setStatus(k,v)); }

/* =========================
   Loader, Tabs, Reveals
   ========================= */
window.addEventListener("load", () => {
  initBackground();
  const loader = document.getElementById("loader");
  setTimeout(() => loader.style.display = "none", 5600);

  Object.keys(STATUS).forEach(applyStatusToDOM);
  touchLastUpdated();

  const yr = document.getElementById("yr");
  if(yr) yr.textContent = new Date().getFullYear();
});

// Tabs mit sanftem Fade
const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");
function showSection(id){
  sections.forEach(s=>{
    if(s.id===id){
      s.classList.add("active");
      s.style.opacity = 0;
      requestAnimationFrame(()=>{
        s.style.transition = "opacity .35s ease";
        s.style.opacity = 1;
      });
    } else {
      s.style.opacity = 0;
      s.classList.remove("active");
    }
  });
  tabs.forEach(t=>t.classList.toggle("active", t.dataset.target===id));
  window.scrollTo({top:0, behavior:"smooth"});
}
tabs.forEach(t=> t.addEventListener("click", ()=> showSection(t.dataset.target)));

// "Check Status" CTA
const cta = document.getElementById("ctaStatus");
if(cta){
  cta.addEventListener("click", e=>{
    e.preventDefault();
    showSection("status");
  });
}

// Scroll-Reveal
const revealEls = document.querySelectorAll(".reveal-up, .reveal-right");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
},{threshold:.25});
revealEls.forEach(el=> io.observe(el));

/* =========================
   Mouse Parallax (Hero)
   ========================= */
(function parallax(){
  const oval = document.querySelector(".hero-oval");
  const copy = document.querySelector(".hero-copy");
  if(!oval || !copy) return;
  const maxShift = 10;
  const onMove = (e)=>{
    const {innerWidth:w, innerHeight:h} = window;
    const x = (e.clientX / w - 0.5) * 2;
    const y = (e.clientY / h - 0.5) * 2;
    oval.style.transform = `translate(calc(-50% + ${-x*maxShift}px), calc(-50% + ${-y*maxShift}px))`;
    copy.style.transform = `translate(${x*4}px, ${y*3}px)`;
  };
  window.addEventListener("pointermove", onMove);
})();

/* =========================
   Background switching
   ========================= */
function initBackground(){
  const body = document.body;
  body.classList.remove("bg-gradient","bg-image","bg-video");

  if(CONFIG.background === "image"){
    body.classList.add("bg-image");
    if(CONFIG.imageUrl){
      body.style.backgroundImage =
        `linear-gradient(0deg, rgba(0,0,0,.15), rgba(0,0,0,.15)), url("${CONFIG.imageUrl}")`;
    }
  } else if(CONFIG.background === "video"){
    body.classList.add("bg-video");
    const vid = document.getElementById("bgVideo");
    if(CONFIG.videoUrl){
      vid.src = CONFIG.videoUrl;
      vid.style.display = "block";
      vid.play().catch(()=>{/* ignore autoplay blocking */});
    }
  } else {
    body.classList.add("bg-gradient");
  }
}

/* =========================
   STATUS → DOM
   ========================= */
function applyStatusToDOM(key){
  const state = STATUS[key].state;
  const label =
    (key === "stage")
      ? (state === "open" ? "Open"
        : state === "closed" ? "Closed"
        : state === "maintenance" ? "Maintenance"
        : STATUS[key].label || "Status")
      : (STATUS[key].label || state[0].toUpperCase() + state.slice(1));

  // Finde passende Badges
  let targets = document.querySelectorAll(`[data-status-key="${key}"] .badge`);
  if (!targets.length)
    targets = document.querySelectorAll(`.badge[data-status-key="${key}"]`);

  if (!targets.length) return;

  targets.forEach(badge=>{
    badge.classList.remove("online","warning","maintenance","offline","open","closed");
    badge.classList.add(state);
    badge.textContent = label;
  });
}

function touchLastUpdated(){
  const el = document.getElementById("lastUpdated");
  if(!el) return;
  el.textContent = `Last updated: ${new Date().toLocaleString(undefined,{
    year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"
  })}`;
}

/* =========================
   EXAMPLES (zum Testen)
   =========================
   setTimeout(()=> setStatus("checkin","warning","Incident"), 4000);
   setTimeout(()=> setStatus("resort","maintenance"), 8000);
   setTimeout(()=> bulkSetStatus({resort:"online", checkin:"online", stage:"closed"}), 12000);
*/







