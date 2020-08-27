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
new Glide("#glide_1", {
  type: "carousel",
  startAt: 0,
  autoplay: 3000,
  hoverpause: true,
  perView: 1,
  animationDuration: 800,
  animationTimingFunc: "ease-in-out",
}).mount();
