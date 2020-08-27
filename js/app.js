/* 
Navigation
*/
const navOpen = document.querySelector(".nav__hamburger");
const navClose = document.querySelector(".close__toggle");
const menu = document.querySelector(".nav__menu");

navOpen.addEventListener("click", () => {
  menu.classList.add("open");
});

navClose.addEventListener("click", () => {
  menu.classList.remove("open");
});

/* 
Glidejs Carousel
*/

// Hero
new Glide("#glide_1", {
  type: "carousel",
  startAt: 0,
  autoplay: 3000,
  hoverpause: true,
  perView: 1,
  animationDuration: 800,
  animationTimingFunc: "linear",
}).mount();

// Latest Products
new Glide("#glide_2", {
  type: "carousel",
  startAt: 0,
  perView: 4,
  rewin: false,
  animationDuration: 800,
  animationTimingFunc: "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
  breakpoints: {
    1200: {
      perView: 3,
    },
    768: {
      perView: 2,
    },
    568: {
      perView: 1,
    },
  },
}).mount();
