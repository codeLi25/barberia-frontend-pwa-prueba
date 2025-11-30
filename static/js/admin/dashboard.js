const navItems = document.querySelectorAll(".sidebar-nav li");
const secciones = document.querySelectorAll(".seccion");
const logoutBtn = document.querySelector(".logout-btn");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(li => li.classList.remove("active"));
    item.classList.add("active");

    const target = item.getAttribute("data-seccion");

    secciones.forEach(sec => {
      sec.classList.remove("active");
      if (sec.id === target) sec.classList.add("active");
    });
  });
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    showToast("Sesión cerrada correctamente", "success");

    setTimeout(() => {
      localStorage.removeItem("usuario");

      window.location.href = "login.html";
    }, 1000);
  });
}
