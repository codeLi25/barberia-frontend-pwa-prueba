const track = document.querySelector(".carousel-track");
const items = document.querySelectorAll(".carousel-item");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");
const dots = document.querySelectorAll(".carousel-indicators .dot");

let index = 0;
let autoPlay;

function updateCarousel() {
  const itemWidth = items[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${index * itemWidth}px)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  index = (index + 1) % items.length;
  updateCarousel();
}

function prevSlide() {
  index = (index - 1 + items.length) % items.length;
  updateCarousel();
}

function startAutoPlay() {
  autoPlay = setInterval(nextSlide, 4000);
}
function stopAutoPlay() {
  clearInterval(autoPlay);
}

nextBtn.addEventListener("click", () => {
  nextSlide();
  stopAutoPlay();
  startAutoPlay();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  stopAutoPlay();
  startAutoPlay();
});

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    index = i;
    updateCarousel();
    stopAutoPlay();
    startAutoPlay();
  });
});

track.addEventListener("mouseover", stopAutoPlay);
track.addEventListener("mouseleave", startAutoPlay);

updateCarousel();
startAutoPlay();
