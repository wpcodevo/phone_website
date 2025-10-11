const getProducts = async () => {
  try {
    const res = await fetch('/api/products', { credentials: 'same-origin' });
    // API returns an array of product docs
    const products = await res.json();
    return Array.isArray(products) ? products : [];
  } catch (err) {
    console.log('Failed to load products', err);
    return [];
  }
};

/*
=============
Load Category Products
=============
 */
const categoryCenter = document.querySelector(".category__center");

// Convert relative image paths from JSON into paths served by Flask static
function normalizeImage(path) {
  if (!path) return '';
  // JSON uses ./images/...; our Flask static is /static/images/...
  if (path.startsWith('./images/')) {
    return '/static' + path.slice(1);
  }
  if (path.startsWith('/static/')) return path;
  return path;
}

window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  displayProductItems(products);
});

// Ensure any statically-rendered product cards in templates that have a
// "data-product-id" attribute become clickable links to the product page.
// This fixes the homepage "Latest Products" carousel which is written in
// HTML and not rendered by the API.
function wireStaticProductLinks() {
  document.querySelectorAll('.product[data-product-id]').forEach(prod => {
    const id = prod.dataset.productId;
    if (!id) return;

    // Wrap the header image with an anchor if it's not already wrapped
    const header = prod.querySelector('.product__header');
    if (header) {
      const img = header.querySelector('img');
      if (img && !img.closest('a')) {
        const a = document.createElement('a');
        a.href = `/product/${id}`;
        // preserve alt/title if present
        img.parentNode.replaceChild(a, img);
        a.appendChild(img);
      }
    }

    // Wrap the title text inside h3 with an anchor if missing
    const h3 = prod.querySelector('.product__footer h3');
    if (h3) {
      const existing = h3.querySelector('a');
      if (!existing) {
        const a2 = document.createElement('a');
        a2.href = `/product/${id}`;
        // move inner HTML (keeps any child nodes)
        a2.innerHTML = h3.innerHTML;
        h3.innerHTML = '';
        h3.appendChild(a2);
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', wireStaticProductLinks);

const displayProductItems = items => {
  let displayProduct = items.map(
    product => ` 
                  <div class="product category__products" data-product-id="${product.id}">
                    <div class="product__header">
                      <a href="/product/${product.id}">
                        <img src="${normalizeImage(product.image_url || product.image)}" alt="${product.title}">
                      </a>
                    </div>
                    <div class="product__footer">
                      <h3><a href="/product/${product.id}">${product.title}</a></h3>
                      <div class="rating">
                        <svg>
                          <use xlink:href="./static/images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./static/images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./static/images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./static/images/sprite.svg#icon-star-full"></use>
                        </svg>
                        <svg>
                          <use xlink:href="./static/images/sprite.svg#icon-star-empty"></use>
                        </svg>
                      </div>
                      <div class="product__price">
                        <h4>$${product.price}</h4>
                      </div>
                      <button type="button" class="product__btn" data-product-id="${product.id}">Add To Cart</button>
                    </div>
                  <ul>
                      <li>
                        <a data-tip="Quick View" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./static/images/sprite.svg#icon-eye"></use>
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a data-tip="Add To Wishlist" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./static/images/sprite.svg#icon-heart-o"></use>
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a data-tip="Add To Compare" data-place="left" href="#">
                          <svg>
                            <use xlink:href="./static/images/sprite.svg#icon-loop2"></use>
                          </svg>
                        </a>
                      </li>
                  </ul>
                  </div>
                  `
  );

  displayProduct = displayProduct.join("");
  if (categoryCenter) {
    categoryCenter.innerHTML = displayProduct;
  }
};

/*
=============
Filtering
=============
 */

const filterBtn = document.querySelectorAll(".filter-btn");
const categoryContainer = document.getElementById("category");

if (categoryContainer) {
  categoryContainer.addEventListener("click", async e => {
    const target = e.target.closest(".section__title");
    if (!target) return;

    const id = target.dataset.id;
    const products = await getProducts();

    if (id) {
      // remove active from buttons
      Array.from(filterBtn).forEach(btn => {
        btn.classList.remove("active");
      });
      target.classList.add("active");

      // Load Products
      let menuCategory = products.filter(product => {
        if (product.category === id) {
          return product;
        }
      });

      if (id === "All Products") {
        displayProductItems(products);
      } else {
        displayProductItems(menuCategory);
      }
    }
  });
}

/*
=============
Product Details Left
=============
 */
const pic1 = document.getElementById("pic1");
const pic2 = document.getElementById("pic2");
const pic3 = document.getElementById("pic3");
const pic4 = document.getElementById("pic4");
const pic5 = document.getElementById("pic5");
const picContainer = document.querySelector(".product__pictures");
const zoom = document.getElementById("zoom");
const pic = document.getElementById("pic");

// Picture List
const picList = [pic1, pic2, pic3, pic4, pic5];

// Active Picture
let picActive = 1;

["mouseover", "touchstart"].forEach(event => {
  if (picContainer) {
    picContainer.addEventListener(event, e => {
      const target = e.target.closest("img");
      if (!target) return;
      const id = target.id.slice(3);
      changeImage(`./images/products/iPhone/iphone${id}.jpeg`, id);
    });
  }
});

// change active image
const changeImage = (imgSrc, n) => {
  // change the main image
  pic.src = imgSrc;
  // change the background-image
  zoom.style.backgroundImage = `url(${imgSrc})`;
  //   remove the border from the previous active side image
  picList[picActive - 1].classList.remove("img-active");
  // add to the active image
  picList[n - 1].classList.add("img-active");
  //   update the active side picture
  picActive = n;
};

/*
=============
Product Details Bottom
=============
 */

const btns = document.querySelectorAll(".detail-btn");
const detail = document.querySelector(".product-detail__bottom");
const contents = document.querySelectorAll(".content");

if (detail) {
  detail.addEventListener("click", e => {
    const target = e.target.closest(".detail-btn");
    if (!target) return;

    const id = target.dataset.id;
    if (id) {
      Array.from(btns).forEach(btn => {
        // remove active from all btn
        btn.classList.remove("active");
        e.target.closest(".detail-btn").classList.add("active");
      });
      // hide other active
      Array.from(contents).forEach(content => {
        content.classList.remove("active");
      });
      const element = document.getElementById(id);
      element.classList.add("active");
    }
  });
}


//asfaak dev


document.addEventListener("DOMContentLoaded", function () {

    function updateCart(productId, quantity) {
        fetch(`/update-cart/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: quantity })
        }).then(res => res.json())
          .then(data => {
              if (data.status !== "success") console.error("Cart update failed");
          });
    }

    document.querySelectorAll(".minus-btn").forEach(minus => {
        minus.addEventListener("click", function () {
            const container = this.parentElement;
            const input = container.querySelector(".counter-btn");
            let value = parseInt(input.value);
            const min = parseInt(input.getAttribute("min")) || 1;
            if (value > min) {
                value -= 1;
                input.value = value;
                updateCart(input.dataset.productId, value-1);
            }
        });
    });

    document.querySelectorAll(".plus-btn").forEach(plus => {
        plus.addEventListener("click", function () {
            const container = this.parentElement;
            const input = container.querySelector(".counter-btn");
            let value = parseInt(input.value);
            const max = parseInt(input.getAttribute("max")) || 99;
            if (value < max) {
                value += 1;
                input.value = value;
                updateCart(input.dataset.productId, value-1);
            }
        });
    });

    // Handle manual typing
    document.querySelectorAll(".counter-btn").forEach(input => {
        input.addEventListener("change", function () {
            let value = parseInt(this.value);
            const min = parseInt(this.getAttribute("min")) || 1;
            const max = parseInt(this.getAttribute("max")) || 99;
            if (value < min) value = min;
            if (value > max) value = max;
            this.value = value;
            updateCart(this.dataset.productId, value-1);
        });
    });
});
