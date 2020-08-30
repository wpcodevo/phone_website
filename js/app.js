/* 
Navigation
*/
const navOpen = document.querySelector(".nav__hamburger");
const navClose = document.querySelector(".close__toggle");
const menu = document.querySelector(".nav__menu");

/*
Sliders
*/
const slider1 = document.getElementById("glide_1");
const slider2 = document.getElementById("glide_2");
const slider3 = document.getElementById("glide_3");
const slider4 = document.getElementById("glide_4");
const slider5 = document.getElementById("glide_5");

/*
Filter
*/
const filterBtn = document.querySelectorAll(".filter-btn");

const productCenter = document.querySelector(".products-center");
const categoryCenter = document.querySelector(".category__center");

/*
PopUp
*/

const popup = document.querySelector(".popup");
const closePopup = document.querySelector(".popup__close");

navOpen.addEventListener("click", () => {
  menu.classList.add("open");
  document.body.classList.add("active");
});

navClose.addEventListener("click", () => {
  menu.classList.remove("open");
  document.body.classList.remove("active");
});

/* 
Glidejs Carousel
*/

// Hero
if (slider1) {
  new Glide(slider1, {
    type: "carousel",
    startAt: 0,
    autoplay: 3000,
    hoverpause: true,
    perView: 1,
    animationDuration: 800,
    animationTimingFunc: "linear",
  }).mount();
}

// Latest Products
if (slider2) {
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
}
// Latest Products
if (slider3) {
  new Glide("#glide_3", {
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
}

// Testimonial

if (slider4) {
  new Glide("#glide_4", {
    type: "carousel",
    startAt: 0,
    perView: 1,
    rewin: false,
    animationDuration: 800,
    animationTimingFunc: "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
  }).mount();
}

// News
if (slider5) {
  new Glide("#glide_5", {
    type: "carousel",
    startAt: 0,
    perView: 3,
    rewin: false,
    autoplay: 3000,
    animationDuration: 800,
    animationTimingFunc: "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    breakpoints: {
      998: {
        perView: 2,
      },
      768: {
        perView: 1,
      },
    },
  }).mount();
}

// Get the Products
const getProducts = async () => {
  try {
    const results = await fetch("/data/products.json");
    const data = await results.json();
    const products = data.products;
    return products;
  } catch (err) {
    console.log(err);
  }
};

// Load Products
window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  displayProductItems(products);
});

const displayProductItems = items => {
  let displayProduct = items.map(
    product => ` 
                  <div class="product category__products">
                    <div class="product__header">
                      <a href="#"><img src=${product.image} alt="product"></a>
                    </div>
                    <div class="product__footer">
                      <h3>${product.title}</h3>
                      <div class="rating">
                        <svg>
                          <use xlink:href="./images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./images/sprite.svg#icon-star-empty"></use>
                        </svg>
                      </div>
                      <div class="product__price">
                        <h4>$${product.price}</h4>
                      </div>
                      <a href="#"><button type="submit" class="product__btn">Add To Cart</button></a>
                    </div>
                  </div>
                  `
  );

  displayProduct = displayProduct.join("");
  categoryCenter.innerHTML = displayProduct;
};

// Custom Filtering

Array.from(filterBtn).map(async btn => {
  const products = await getProducts();

  btn.addEventListener("click", e => {
    const category = e.currentTarget.closest(".section__title").dataset.id;

    if (e.currentTarget.closest(".section__title").className === "active") {
      e.currentTarget.closest(".section__title").classList.remove("active");
    }
    let menuCategory = products.filter(product => {
      if (product.category === category) {
        return product;
      }
    });

    if (category === "All Products") {
      displayProductItems(products);
    } else {
      displayProductItems(menuCategory);
    }
  });
});

// PopUp

closePopup.addEventListener("click", () => {
  popup.classList.add("hide__popup");
});

window.addEventListener("load", () => {
  setTimeout(() => {
    popup.classList.remove("hide__popup");
  }, 500);
});
