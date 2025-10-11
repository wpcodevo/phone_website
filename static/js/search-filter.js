const searchBox = document.getElementById("searchBox");
const searchTrigger = document.getElementById("searchTrigger");
const filterDropdown = document.getElementById("filterDropdown");
const iphoneVersion = document.getElementById("iphoneVersion");
const brandFilters = document.querySelectorAll(".filter-dropdown-custom input[type='checkbox']");
const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");
const clearFiltersBtn = document.getElementById("clearFilters");
const dropdownProducts = document.getElementById("dropdownProducts");
const sortPrice = document.getElementById("sortPrice");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const products = [
  {name: "📱 Apple iPhone 17 Pro", brand: "Apple iPhone 17 Pro", price: 2700},
  {name: "📱 Apple iPhone 11", brand: "Apple iPhone 11", price: 760},
  {name: "📱 Apple iPhone 11", brand: "Apple iPhone 11", price: 850},
  {name: "📱 Apple iPhone 11", brand: "Apple iPhone 11", price: 290},
  {name: "📱 Apple iPhone 11", brand: "Apple iPhone 11", price: 800},
  {name: "📱 Apple iPhone 11", brand: "Apple iPhone 11", price: 300},
  {name: "📱 Apple iPhone 11 Pro", brand: "Apple iPhone 11 Pro", price: 385},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 400},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 550},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 270},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 500},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 450},
  {name: "📱 Samsung Galaxy", brand: "Samsung Galaxy", price: 460},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 265},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 250},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 365},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 475},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 850},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 360},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 320},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 305},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 630},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 250},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 700},
  {name: "🎧 Sony WH-CH510", brand: "Sony WH-CH510", price: 600}
];

let productsPerBatch = 6;
let currentIndex = 0;
let filteredProducts = [];

searchBox.addEventListener("focus", () => filterDropdown.classList.add("show"));
searchTrigger.addEventListener("click", () => filterDropdown.classList.toggle("show"));
document.addEventListener("click", e => {
  if(!e.target.closest(".search-wrapper-custom")) filterDropdown.classList.remove("show");
});

function displayProducts(reset = false){
  if(reset){
    currentIndex = 0;
    dropdownProducts.innerHTML = "";
  }

  const batch = filteredProducts.slice(currentIndex, currentIndex + productsPerBatch);
  batch.forEach((p, i)=>{
    const div = document.createElement("div");
    div.className = "product";
    div.style.animationDelay = `${i*0.05}s`;
    div.innerHTML = `<span>${p.name.replace(new RegExp(searchBox.value,"gi"), match=>`<mark>${match}</mark>`)}</span><span>$${p.price}</span>`;
    dropdownProducts.appendChild(div);
  });

  currentIndex += batch.length;
  loadMoreBtn.style.display = (currentIndex < filteredProducts.length) ? "block" : "none";

  if(filteredProducts.length===0 && reset){
    dropdownProducts.innerHTML = "<div class='no-results'>😞 No products found</div>";
    loadMoreBtn.style.display = "none";
  }
}

function updateFilters(){
  let searchText = searchBox.value.toLowerCase();
  let selectedVersion = iphoneVersion.value.toLowerCase();
  let selectedBrands = Array.from(brandFilters).filter(cb=>cb.checked).map(cb=>cb.value.toLowerCase());
  let maxPrice = parseInt(priceRange.value);

  priceValue.textContent = "$"+maxPrice;

  filteredProducts = products.filter(p=>{
    let matchSearch = p.name.toLowerCase().includes(searchText);
    let matchVersion = selectedVersion ? p.brand.toLowerCase().includes(selectedVersion) : true;
    let matchBrand = selectedBrands.length ? selectedBrands.includes(p.brand.toLowerCase()) : true;
    let matchPrice = p.price <= maxPrice;
    return matchSearch && matchVersion && matchBrand && matchPrice;
  });

  if(sortPrice.value==="asc") filteredProducts.sort((a,b)=>a.price-b.price);
  if(sortPrice.value==="desc") filteredProducts.sort((a,b)=>b.price-a.price);

  displayProducts(true);
}

loadMoreBtn.addEventListener("click", ()=>displayProducts());

searchBox.addEventListener("input", updateFilters);
iphoneVersion.addEventListener("change", updateFilters);
brandFilters.forEach(cb=>cb.addEventListener("change", updateFilters));
priceRange.addEventListener("input", updateFilters);
sortPrice.addEventListener("change", updateFilters);
clearFiltersBtn.addEventListener("click", ()=>{
  searchBox.value="";
  iphoneVersion.value="";
  brandFilters.forEach(cb=>cb.checked=false);
  priceRange.value=3000;
  sortPrice.value="none";
  updateFilters();
});

updateFilters();