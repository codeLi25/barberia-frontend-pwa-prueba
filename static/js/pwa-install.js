let deferredPrompt;

const banner = document.getElementById("pwa-install-banner");
const installBtn = document.getElementById("btn-install");
const closeBtn = document.getElementById("btn-close-banner");

/* ==================================================
   1️⃣ Detectar si ya está instalada
   ================================================== */
function estaInstalada() {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return localStorage.getItem("pwa_instalada") === "si";
}

/* ==================================================
   2️⃣ Mostrar banner si ya sabemos que puede instalar
   ================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const puedeInstalar = localStorage.getItem("pwa_puede_instalar");

  // Si ya tenemos permiso y NO está instalada → mostrar banner SIEMPRE
  if (puedeInstalar === "si" && !estaInstalada()) {
    mostrarBanner();
  }
});

/* ==================================================
   3️⃣ Evento principal: beforeinstallprompt
   ================================================== */
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("🔥 EVENTO beforeinstallprompt DETECTADO");
  e.preventDefault();
  deferredPrompt = e;

  // Guardamos en localStorage que la app se puede instalar
  localStorage.setItem("pwa_puede_instalar", "si");

  // Mostrar inmediatamente
  if (!estaInstalada()) {
    mostrarBanner();
  }
});

/* ==================================================
   BOTÓN "Instalar"
   ================================================== */
installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("💈 App instalada");
    localStorage.setItem("pwa_instalada", "si");
  }

  ocultarBanner();
  deferredPrompt = null;
});

/* ==================================================
   BOTÓN "Cerrar"
   ================================================== */
closeBtn?.addEventListener("click", () => {
  ocultarBanner();
});

/* ==================================================
   FUNCIONES
   ================================================== */
function mostrarBanner() {
  banner?.classList.remove("hidden");
  banner?.classList.add("visible");
  document.body.classList.add("banner-visible");
}

function ocultarBanner() {
  banner?.classList.remove("visible");
  banner?.classList.add("hidden");
  document.body.classList.remove("banner-visible");
}
