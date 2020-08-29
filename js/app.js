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

/*
Filter Buttons
*/
const filterBtn = document.querySelectorAll(".filter-btn");

const productCenter = document.querySelector(".products-center");
const categoryCenter = document.querySelector(".category__center");

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
  // displayProducts(products);
  let displayProduct = products.map(
    product => ` <li class="glide__slide">
                  <div class="product">
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
                        <span>$${product.price}</span>
                      </div>
                      <a href="#"><button type="submit" class="product__btn">Add To Cart</button></a>
                    </div>
                  </div>
                </li>`
  );

  displayProduct = displayProduct.join("");
  console.log(displayProduct);
});

// Products
// const products = async () => {
//   const products = await getProducts();
//   const filteredProducts = products.filter(product => )
// };

// const displayProducts = props => {};

// displayProduct = displayProduct.join("");
// console.log(displayProduct);

Array.from(filterBtn).map(btn => {
  btn.addEventListener("click", e => {
    const category = e.currentTarget.closest(".section__title").dataset.id;
  });
});
