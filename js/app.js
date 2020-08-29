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
Filte
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

// Array.from(filterBtn).map(async btn => {
//   const products = await getProducts();

//   btn.addEventListener("click", e => {
//     const category = e.currentTarget.closest(".section__title").dataset.id;
//     let menuCategory = products.filter(product => {
//       if (product.category === category) {
//         return product;
//       }
//     });

//     if (category === "all") {
//       displayProductItems(products);
//     } else {
//       displayProductItems(menuCategory);
//     }
//   });
// });

// Isotope Filtering

const iso = new Isotope(categoryCenter, {
  itemSelector: ".category__products",
  layoutMode: "fitRows",
});

// console.log(iso);

Array.from(filterBtn).map(btn => {
  btn.addEventListener("click", e => {
    const category = e.currentTarget.closest(".section__title").dataset.id;
    console.log(category);
  });
});
