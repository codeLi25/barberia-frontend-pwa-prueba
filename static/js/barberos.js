document.addEventListener("DOMContentLoaded", async () => {
  const barberosLista = document.getElementById("barberos-lista");
  const inputBarbero = document.getElementById("barbero");

  barberosLista.innerHTML = "";

  try {
    // Cambié la URL al endpoint correcto
    const response = await fetch("/api/barberos");
    if (!response.ok) throw new Error("Error al cargar barberos");
    const barberos = await response.json();

    barberos.forEach(b => {
      const div = document.createElement("div");
      div.className = "barbero-card";
      div.dataset.id = b.idBarbero; // ojo, en tu BarberoDTO tienes idBarbero
    div.dataset.nombre = b.nombreCompleto;

    div.innerHTML = `
    <img src="${b.foto || 'img/barberos/default.png'}" alt="${b.nombreCompleto}">
    <p>${b.nombreCompleto}</p>
    `;

      div.addEventListener("click", () => {
        barberosLista.querySelectorAll(".barbero-card").forEach(card => card.classList.remove("active"));
        div.classList.add("active");
        inputBarbero.value = div.dataset.id;
      });

      barberosLista.appendChild(div);
    });

  } catch (err) {
    console.error("Error cargando barberos:", err);
    barberosLista.innerHTML = "<p>No se pudieron cargar los barberos.</p>";
  }
});
