/* =====================================================================
   NOVA EDUCATION FOUNDATION - RESULT FINDER
   ---------------------------------------------------------------------
   TO UPDATE LATER, EDIT ONLY THIS TOP SECTION:
   1. CONFIG      -> page title, WhatsApp number
   2. PROGRAMMES  -> list of programmes; set published:true when ready
   3. RESULTS     -> one row per student (from your PDF)
   Roll numbers are matched as text, so "00123" stays "00123".
   ===================================================================== */

const CONFIG = {
  title: "Find your result",
  lead: "Enter your roll number to see your score and rank, and what your rank means for the next step.",
  whatsapp: "9779816931206",
  scoreLabel: "Score",
  scoreOutOf: ""            // e.g. "/ 200" - leave "" to hide
};

const PROGRAMMES = [
  { id: "CMAT",    name: "CMAT",    published: true  },
  { id: "CEE",     name: "CEE",     published: true  },
  { id: "LOKSEWA", name: "Loksewa", published: false }
];

/* SAMPLE DATA - replace with your real rows */
const RESULTS = [
  { programme: "CMAT",    roll: "1001", name: "Sample Student A", score: 82.5, rank: 1 },
  { programme: "CMAT",    roll: "1002", name: "Sample Student B", score: 79,   rank: 2 },
  { programme: "CEE",     roll: "24703", name: "Sample Student C", score: 151.25, rank: 14 }
];

/* ======================= APP CODE (no need to edit) ================== */

const $ = id => document.getElementById(id);
const form = $("resultForm"), selProg = $("programme"), inRoll = $("roll"),
      inPhone = $("phone"), errBox = $("formError"), box = $("resultBox");

function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
const norm = s => String(s).trim().replace(/\s+/g, "").toUpperCase();

function init(){
  $("pageTitle").textContent = CONFIG.title;
  $("pageLead").textContent = CONFIG.lead;
  $("year").textContent = new Date().getFullYear();

  const pub = PROGRAMMES.filter(p => p.published);
  $("publishedBadge").textContent = pub.length + " of " + PROGRAMMES.length + " published";
  $("publishedList").textContent = pub.length
    ? "Search results for: " + pub.map(p => p.name).join(", ") + ". We add each remaining programme on the day it is published."
    : "No results published yet. Please check back soon.";

  PROGRAMMES.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name + (p.published ? "" : " (coming soon)");
    o.disabled = !p.published;
    selProg.appendChild(o);
  });
}

function showError(msg){ errBox.textContent = msg; errBox.hidden = false; }
function clearError(){ errBox.hidden = true; }

function saveLead(lead){
  /* Saved in this browser only. To collect leads centrally, send `lead`
     to a Google Form / Sheet / backend here. */
  try{
    const list = JSON.parse(localStorage.getItem("nova_leads") || "[]");
    list.push(lead);
    localStorage.setItem("nova_leads", JSON.stringify(list));
  }catch(e){}
}

function render(html, cls){
  box.className = "result " + (cls || "");
  box.innerHTML = '<div class="card">' + html + "</div>";
  box.hidden = false;
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  clearError();

  const prog = selProg.value, roll = norm(inRoll.value), phone = inPhone.value.trim();

  if (!prog)  return showError("Choose your programme.");
  if (!roll)  return showError("Enter your roll number.");
  if (!/^9[78]\d{8}$/.test(phone)) return showError("Enter a valid 10-digit mobile number starting with 98 or 97.");

  const row = RESULTS.find(r => r.programme === prog && norm(r.roll) === roll);
  const pname = (PROGRAMMES.find(p => p.id === prog) || {}).name || prog;

  saveLead({ programme: prog, roll, phone: "+977" + phone, found: !!row, at: new Date().toISOString() });

  if (!row){
    render('<h2>No result found</h2><p>We could not find roll number <strong>' + esc(roll) +
      '</strong> in ' + esc(pname) + '. Check the number on your admit card and the programme, then try again.</p>' +
      '<p class="next"><a href="https://wa.me/' + CONFIG.whatsapp + '" target="_blank" rel="noopener">Ask us on WhatsApp</a></p>', "notfound");
    return;
  }

  const msg = encodeURIComponent("Hello Nova Education, my roll number is " + row.roll + " (" + pname + "). My rank is " + row.rank + ". Please guide me on the next steps.");
  render(
    '<h2>' + esc(row.name || "Your result") + '</h2>' +
    '<p class="meta">' + esc(pname) + ' &middot; Roll no. ' + esc(row.roll) + '</p>' +
    '<div class="stats">' +
      '<div class="stat"><b>' + esc(row.score) + '</b><span>' + esc(CONFIG.scoreLabel) + ' ' + esc(CONFIG.scoreOutOf) + '</span></div>' +
      '<div class="stat"><b>#' + esc(row.rank) + '</b><span>Rank</span></div>' +
    '</div>' +
    '<p class="next">Want to know what this rank means for you? <a href="https://wa.me/' + CONFIG.whatsapp + '?text=' + msg + '" target="_blank" rel="noopener">Talk to a Nova counsellor</a></p>'
  );
});

inRoll.addEventListener("input", clearError);
inPhone.addEventListener("input", () => { inPhone.value = inPhone.value.replace(/\D/g, ""); clearError(); });

init();
