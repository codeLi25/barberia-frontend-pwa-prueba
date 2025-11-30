const filtroBtns = document.querySelectorAll(".filtro-btn");
const servicioCards = document.querySelectorAll(".servicio-card");

filtroBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    filtroBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const categoria = btn.getAttribute("data-filter");

    servicioCards.forEach(card => {
      if (categoria === "all" || card.classList.contains(categoria)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});
