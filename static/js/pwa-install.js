let deferredPrompt;

const banner = document.getElementById("pwa-install-banner");
const installBtn = document.getElementById("btn-install");
const closeBtn = document.getElementById("btn-close-banner");

/* =====================================================
   1️⃣ Detectar si YA está instalada (Android/iOS/PC)
===================================================== */
function estaInstalada() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    localStorage.getItem("pwa_instalada") === "si"
  );
}

/* =====================================================
   2️⃣ Capturar el EVENTO beforeinstallprompt
===================================================== */
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("🔥 Evento beforeinstallprompt detectado");

  e.preventDefault();
  deferredPrompt = e;

  // Mostrar el banner inmediatamente si NO está instalada
  if (!estaInstalada()) {
    mostrarBanner();
  }
});

/* =====================================================
   3️⃣ Mostrar el banner cuando cargue la página
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Si NO está instalada y YA tenemos el evento → mostrar
  if (!estaInstalada() && deferredPrompt) {
    mostrarBanner();
  }
});

/* =====================================================
   4️⃣ BOTÓN INSTALAR
===================================================== */
installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("✔️ PWA instalada");
    localStorage.setItem("pwa_instalada", "si");
  }

  ocultarBanner();
  deferredPrompt = null;
});

/* =====================================================
   5️⃣ BOTÓN CERRAR (NO guarda nada)
===================================================== */
closeBtn?.addEventListener("click", () => {
  ocultarBanner();
});

/* =====================================================
   FUNCIONES DE BANNER
===================================================== */
function mostrarBanner() {
  if (estaInstalada()) return;

  banner.classList.remove("hidden");
  banner.classList.add("visible");
  document.body.classList.add("banner-visible");
}

function ocultarBanner() {
  banner.classList.remove("visible");
  banner.classList.add("hidden");
  document.body.classList.remove("banner-visible");
}
