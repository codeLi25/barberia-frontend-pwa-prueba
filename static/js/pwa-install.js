let deferredPrompt;

// Elementos del banner
const banner = document.getElementById("pwa-install-banner");
const installBtn = document.getElementById("btn-install");
const closeBtn = document.getElementById("btn-close-banner");

/* ==========================================
   EVENTO PRINCIPAL: CAPTURA PARA INSTALAR
   ========================================== */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Mostrar banner personalizado
  mostrarBanner();
});

/* ===============================
   BOTÓN PARA INSTALAR LA PWA
   =============================== */
installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  // Mostrar popup nativo de instalación
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  console.log(outcome === "accepted"
    ? "💈 App instalada correctamente"
    : "❌ Instalación cancelada");

  deferredPrompt = null;
  ocultarBanner();
});

/* ===============================
   CERRAR EL BANNER
   =============================== */
closeBtn?.addEventListener("click", () => {
  ocultarBanner();
});

/* =====================================
   SI REGRESA INTERNET Y NO SE INSTALÓ
   ===================================== */
window.addEventListener("online", () => {
  if (deferredPrompt) mostrarBanner();
});

/* ===============================
   FUNCIONES DEL BANNER
   =============================== */
function mostrarBanner() {
  if (!banner) return;
  banner.classList.remove("hidden");
  banner.classList.add("visible");
}

function ocultarBanner() {
  if (!banner) return;
  banner.classList.remove("visible");
  banner.classList.add("hidden");
}
