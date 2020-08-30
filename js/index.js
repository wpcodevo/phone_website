/*
=============
Navigation
=============
 */
const navOpen = document.querySelector(".nav__hamburger");
const navClose = document.querySelector(".close__toggle");
const menu = document.querySelector(".nav__menu");

/*
=============
PopUp
=============
 */

const popup = document.querySelector(".popup");
const closePopup = document.querySelector(".popup__close");

/*
=============
Navigation
=============
 */

navOpen.addEventListener("click", () => {
  menu.classList.add("open");
  document.body.classList.add("active");
});

navClose.addEventListener("click", () => {
  menu.classList.remove("open");
  document.body.classList.remove("active");
});

/*
=============
PopUp
=============
 */

if (popup) {
  closePopup.addEventListener("click", () => {
    popup.classList.add("hide__popup");
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      popup.classList.remove("hide__popup");
    }, 500);
  });
}
