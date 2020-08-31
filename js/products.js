/*
=============
Filter
=============
 */
const filterBtn = document.querySelectorAll(".filter-btn");
const categoryCenter = document.querySelector(".category__center");

/*
=============
Get Products
=============
 */

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

// const latestProduct = async () => {
//   const products = await getProducts();
//   const latestProducts = products.filter(
//     product => product.category === "Latest Products"
//   );
//   return latestProducts;
// };

// const relatedProduct = async () => {
//   const products = await getProducts();
//   const relatedProducts = products.filter(
//     product => product.category === "Related Products"
//   );
//   return relatedProducts;
// };

/*
=============
Load Category Products
=============
 */
window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  displayProductItems(products);
  // const relatedProducts = await relatedProduct();
  // const latestProducts = await latestProduct();
  // displayProducts(latestProducts, latestCenter);
  // displayProducts(relatedProducts, relatedCenter);
});

// const displayProducts = (items, productCenter) => {
//   let displayProduct = items.map(
//     product => `
//                   <li class="glide__slide">
//                   <div class="product">
//                     <div class="product__header">
//                       <a href="#"><img src=${product.image} alt="product"></a>
//                     </div>
//                     <div class="product__footer">
//                       <h3>${product.name}</h3>
//                       <div class="rating">
//                         <svg>
//                           <use xlink:href="./images/sprite.svg#icon-star-full"></use>
//                         </svg>
//                         <svg>
//                           <use xlink:href="./images/sprite.svg#icon-star-full"></use>
//                         </svg>
//                         <svg>
//                           <use xlink:href="./images/sprite.svg#icon-star-full"></use>
//                         </svg>
//                         <svg>
//                           <use xlink:href="./images/sprite.svg#icon-star-full"></use>
//                         </svg>
//                         <svg>
//                           <use xlink:href="./images/sprite.svg#icon-star-empty"></use>
//                         </svg>
//                       </div>
//                       <div class="product__price">
//                         <span>$${product.price}</span>
//                       </div>
//                       <a href="#"><button type="submit" class="product__btn">Add To Cart</button></a>
//                     </div>
//                   </div>
//                 </li>
//                   `
//   );
//   displayProduct = displayProduct.join("");
//   console.log(displayProduct);
//   productCenter.innerHTML = displayProduct;
// };

const displayProductItems = items => {
  let displayProduct = items.map(
    product => ` 
                  <div class="product category__products">
                    <div class="product__header">
                      <img src=${product.image} alt="product">
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
                  <ul>
                      <li>
                        <a data-tip="Quick View" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./images/sprite.svg#icon-eye"></use>
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a data-tip="Add To Wishlist" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./images/sprite.svg#icon-heart-o"></use>
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a data-tip="Add To Compare" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./images/sprite.svg#icon-loop2"></use>
                          </svg>
                        </a>
                      </li>
                  </ul>
                  </div>
                  `
  );

  displayProduct = displayProduct.join("");
  categoryCenter.innerHTML = displayProduct;
};

/*
=============
Filtering
=============
 */

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
