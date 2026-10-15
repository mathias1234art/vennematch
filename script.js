const INTERESTS = ["Musikk","Gaming","Kreativ","Friluft","Sport","Film og serier","Bøker","Dyr"];
const starterProfiles = [
  {id:"p1",name:"Maja",emoji:"🎨",vibe:"Kreativ",bio:"Jeg liker å tegne, lage spillelister og se film med folk. Alltid klar for å lære noe nytt!",interests:["Kreativ","Musikk","Film og serier"]},
  {id:"p2",name:"Noah",emoji:"🎮",vibe:"Rolig",bio:"Litt introvert i starten, men elsker gaming, memes og lange samtaler om rare ting.",interests:["Gaming","Film og serier","Musikk"]},
  {id:"p3",name:"Leah",emoji:"🌿",vibe:"Eventyrlysten",bio:"Glad i turer, dyr og å oppdage nye steder. Vil gjerne ha noen å gå tur eller ta bilder med.",interests:["Friluft","Dyr","Kreativ"]},
  {id:"p4",name:"Elias",emoji:"🎧",vibe:"Sosial",bio:"Musikk på øret nesten hele tiden. Liker konserter, sport og å bli kjent med nye folk.",interests:["Musikk","Sport","Gaming"]},
  {id:"p5",name:"Amira",emoji:"📚",vibe:"Rolig",bio:"Bøker, te og kreative prosjekter er min greie. Setter pris på folk man kan være seg selv med.",interests:["Bøker","Kreativ","Film og serier"]},
  {id:"p6",name:"Theo",emoji:"🛹",vibe:"Sosial",bio:"Liker skating, sport og å finne på ting ute. Blir gjerne med på noe nytt!",interests:["Sport","Friluft","Musikk"]}
];
let profiles = [...starterProfiles];
let likedIds = new Set();
let selectedInterests = new Set();
const $ = id => document.getElementById(id);
const grid = $("profileGrid");
const dialog = $("profileDialog");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function getMatchScore(profile) {
  const own = profiles.find(p => p.isMine);
  if (!own) return null;
  const common = profile.interests.filter(item => own.interests.includes(item)).length;
  return Math.round((common / Math.max(own.interests.length, profile.interests.length, 1)) * 100);
}
function renderProfiles() {
  const query = $("searchInput").value.trim().toLowerCase();
  const interest = $("interestFilter").value;
  const vibe = $("vibeFilter").value;
  const filtered = profiles.filter(p => {
    const searchable = `${p.name} ${p.bio} ${p.interests.join(" ")} ${p.vibe}`.toLowerCase();
    return searchable.includes(query) && (!interest || p.interests.includes(interest)) && (!vibe || p.vibe === vibe);
  });
  grid.innerHTML = filtered.map(p => {
    const score = getMatchScore(p);
    const liked = likedIds.has(p.id);
    return `<article class="profile-card">
      <div class="card-top"><div class="profile-avatar">${escapeHTML(p.emoji)}</div><div><h3 class="profile-name">${escapeHTML(p.name)}${p.isMine ? " (deg)" : ""}</h3><div class="profile-vibe">${escapeHTML(p.vibe)} type</div></div>
      ${score !== null && !p.isMine ? `<span class="match-score">${score}% match</span>` : ""}
      </div>
      <p class="profile-bio">${escapeHTML(p.bio)}</p>
      <div class="tags">${p.interests.map(i => `<span class="tag">${escapeHTML(i)}</span>`).join("")}</div>
      ${p.isMine ? `<div class="card-actions"><button class="skip-button" data-edit="${p.id}">Rediger profil</button><button class="skip-button" data-delete="${p.id}">Slett</button></div>` :
      `<div class="card-actions"><button class="skip-button" data-skip="${p.id}">Kanskje senere</button><button class="like-button ${liked ? "liked" : ""}" data-like="${p.id}">${liked ? "✓ Liker profilen" : "♡ Vis interesse"}</button></div>`}
    </article>`;
  }).join("");
  $("emptyState").classList.toggle("hidden", filtered.length !== 0);
  grid.classList.toggle("hidden", filtered.length === 0);
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openDialog(edit = false) {
  $("formError").textContent = "";
  const mine = profiles.find(p => p.isMine);
  selectedInterests = new Set(edit && mine ? mine.interests : []);
  $("profileName").value = edit && mine ? mine.name : "";
  $("profileBio").value = edit && mine ? mine.bio : "";
  $("profileVibe").value = edit && mine ? mine.vibe : "Rolig";
  $("profileEmoji").value = edit && mine ? mine.emoji : "🌻";
  $("bioCount").textContent = $("profileBio").value.length;
  $("interestChoices").innerHTML = INTERESTS.map(item => `<button type="button" class="interest-choice ${selectedInterests.has(item) ? "selected" : ""}" data-interest="${item}" aria-pressed="${selectedInterests.has(item)}">${item}</button>`).join("");
  dialog.dataset.editing = edit ? "true" : "false";
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { if (dialog.open) dialog.close(); }

["openProfileTop","openProfileHero","openProfileDiscover","openProfileBottom"].forEach(id => $(id).addEventListener("click", () => openDialog()));
$("closeDialog").addEventListener("click", closeDialog);
$("cancelDialog").addEventListener("click", closeDialog);
$("profileBio").addEventListener("input", () => $("bioCount").textContent = $("profileBio").value.length);
$("interestChoices").addEventListener("click", event => {
  const button = event.target.closest("[data-interest]");
  if (!button) return;
  const interest = button.dataset.interest;
  selectedInterests.has(interest) ? selectedInterests.delete(interest) : selectedInterests.add(interest);
  button.classList.toggle("selected", selectedInterests.has(interest));
  button.setAttribute("aria-pressed", selectedInterests.has(interest));
});
$("profileForm").addEventListener("submit", event => {
  event.preventDefault();
  if (selectedInterests.size === 0) { $("formError").textContent = "Velg minst én interesse for å lage profilen."; return; }
  const old = profiles.find(p => p.isMine);
  const mine = {
    id: old ? old.id : "mine",
    name: $("profileName").value.trim(),
    bio: $("profileBio").value.trim(),
    vibe: $("profileVibe").value,
    emoji: $("profileEmoji").value,
    interests: [...selectedInterests],
    isMine: true
  };
  if (!mine.name || !mine.bio) { $("formError").textContent = "Fyll inn navn og en kort beskrivelse."; return; }
  profiles = profiles.filter(p => !p.isMine);
  profiles.unshift(mine);
  try { localStorage.setItem("vennematch-profile", JSON.stringify(mine)); } catch (_) {}
  closeDialog();
  renderProfiles();
  $("oppdag").scrollIntoView({behavior:"smooth"});
  showToast(old ? "Profilen din er oppdatert ✨" : "Profilen din er laget ✨");
});
grid.addEventListener("click", event => {
  const like = event.target.closest("[data-like]");
  const skip = event.target.closest("[data-skip]");
  const edit = event.target.closest("[data-edit]");
  const del = event.target.closest("[data-delete]");
  if (like) {
    const id = like.dataset.like;
    if (likedIds.has(id)) { likedIds.delete(id); showToast("Du fjernet interessen din."); }
    else { likedIds.add(id); showToast("Interesse lagret! I en ekte tjeneste måtte den andre også vise interesse for en match."); }
    renderProfiles();
  }
  if (skip) { const card = skip.closest(".profile-card"); card.style.opacity = ".45"; showToast("Profilen er satt til side for nå."); }
  if (edit) openDialog(true);
  if (del) {
    profiles = profiles.filter(p => p.id !== del.dataset.delete);
    try { localStorage.removeItem("vennematch-profile"); } catch (_) {}
    renderProfiles(); showToast("Profilen din er slettet fra denne nettleseren.");
  }
});
["searchInput","interestFilter","vibeFilter"].forEach(id => $(id).addEventListener(id === "searchInput" ? "input" : "change", renderProfiles));
$("clearFilters").addEventListener("click", () => { $("searchInput").value = ""; $("interestFilter").value = ""; $("vibeFilter").value = ""; renderProfiles(); });
try {
  const saved = JSON.parse(localStorage.getItem("vennematch-profile") || "null");
  if (saved && saved.name && saved.bio) profiles.unshift(saved);
} catch (_) {}
renderProfiles();
