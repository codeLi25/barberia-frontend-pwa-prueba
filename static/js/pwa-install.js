let deferredPrompt;

const banner = document.getElementById("pwa-install-banner");
const installBtn = document.getElementById("btn-install");
const closeBtn = document.getElementById("btn-close-banner");

/* ==========================================
   EVENTO PRINCIPAL PARA MOSTRAR EL BANNER
   ========================================== */
window.addEventListener("beforeinstallprompt", (e) => {
 console.log("🔥 EVENTO beforeinstallprompt DETECTADO");
  e.preventDefault();
  deferredPrompt = e;

  if (navigator.onLine) {
    mostrarBanner();
  }
});

/* ===============================
   BOTÓN PARA INSTALAR LA PWA
   =============================== */
installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  console.log(outcome === "accepted"
    ? "💈 App instalada"
    : "Instalación cancelada");

  ocultarBanner();
  deferredPrompt = null;
});

/* ===============================
   CERRAR EL BANNER
   =============================== */
closeBtn?.addEventListener("click", () => {
  ocultarBanner();
});

/* ===============================================
   SI EL USUARIO RECUPERA INTERNET Y NO INSTALÓ
   =============================================== */
window.addEventListener("online", () => {
  if (deferredPrompt) {
    mostrarBanner();
  }
});

/* ===============================
   FUNCIONES GLOBALES
   =============================== */
function mostrarBanner() {
  if (!banner) return;

  banner.classList.remove("hidden");
  banner.classList.add("visible");

  // Empujar navbar + hero
  document.body.classList.add("banner-visible");
}

function ocultarBanner() {
  if (!banner) return;

  banner.classList.remove("visible");
  banner.classList.add("hidden");

  // Restaurar layout
  document.body.classList.remove("banner-visible");
}
