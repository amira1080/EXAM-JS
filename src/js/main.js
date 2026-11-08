const loadingOverlay = document.getElementById('app-loading-overlay');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const headerMenuBtn = document.getElementById('header-menu-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const searchInput = document.getElementById('search-input');
const searchFiltersSection = document.getElementById('search-filters-section');
const categoriesGrid = document.getElementById('categories-grid');
const mealCategoriesSection = document.getElementById('meal-categories-section');
const allRecipesSection = document.getElementById('all-recipes-section');
const recipesGrid = document.getElementById('recipes-grid');
const recipesCount = document.getElementById('recipes-count');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const cuisinesContainer = document.getElementById('cuisinesContainer');
const mealDetailsSection = document.getElementById('meal-details');
const productsSection = document.getElementById('products-section');
const foodLogSection = document.getElementById('foodlog-section');
const sideBar = document.getElementById('sidebar');
const logMealBtn = document.getElementById('log-meal-btn');
const nutritionFactsContainer = document.getElementById('nutrition-facts-container');
const filterButtons = document.querySelectorAll('.nutri-score-filter');
const productCards = document.querySelectorAll('.product-card');
const productSearchInput = document.getElementById('product-search-input');
const searchProductBtn = document.getElementById('search-product-btn');
const barcodeInput = document.getElementById('barcode-input');
const lookupBarcodeBtn = document.getElementById('lookup-barcode-btn');
const productCategories = document.getElementById('product-categories');
const gridContainer = document.getElementById('products-grid');
const productsCount = document.getElementById('products-count');
const productName = document.getElementById('Product Name');
const heroImg = mealDetailsSection.querySelector('img');
const clearFoodLogBtn = document.getElementById('clear-foodlog');
const loggedItemsList = document.getElementById('logged-items-list');
const weeklyChart = document.getElementById('weekly-chart');
const baseURL = "https://nutriplan-api.vercel.app/api";

let allMealsData = [];
let mealsList =  [];
let productsList = [];
let products = [];

window.toggleLoader = function(isOpen) {
    if (loadingOverlay) {
        if (isOpen) {
            loadingOverlay.style.display = "flex";
            loadingOverlay.classList.replace("d-none", "d-flex");
        } else {
            loadingOverlay.style.display = "none";
            loadingOverlay.classList.replace("d-flex", "d-none");
        }
    } else {
        console.log("unavailable");
    }
};

function hideLoadingOverlay() {
    if (window.toggleLoader) {
        window.toggleLoader(false);
    }
}

async function getMeals(searchQuery = '') {
    try {
        window.toggleLoader(true);
        const response = await fetch(`${baseURL}/meals/search?q=${searchQuery}&page=1&limit=25`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.results) {
            allMealsData = data.results; 
            displayMeals(allMealsData);  
        }
    } catch (error) {
        console.error('error', error);
    } finally {
        window.toggleLoader(false);
    }
}

async function getCategories() {
    try {
        const response = await fetch(`${baseURL}/meals/categories`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const categoriesList = data.categories || data.results || data;
        if (Array.isArray(categoriesList)) {
            displayCategoriesUI(categoriesList);
        }
    } catch (error) {
        console.error('error', error);
    }
}

function displayCategoriesUI(categories) {
    if (!categoriesGrid) return;
    categoriesGrid.innerHTML = ''; 

    categories.forEach(category => {
        const categoryName = category.strCategory || category.name || category;

        const card = document.createElement('div');
        card.className = "category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group";
        card.setAttribute('data-category', categoryName);

        card.innerHTML = `
            <div class="flex items-center gap-2.5">
                <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <i class="fa-solid fa-utensils"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-gray-900">${categoryName}</h3>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('border-emerald-500', 'ring-2'));
            card.classList.add('border-emerald-500', 'ring-2');
            getMealsByCategory(categoryName);
        });

        categoriesGrid.appendChild(card);
    });
}

async function getMealsByCategory(categoryName) {
    try {
        window.toggleLoader(true);
        const response = await fetch(`${baseURL}/meals/filter?category=${categoryName}&page=1&limit=25`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const mealsList = data.results || data.meals || data;

        if (Array.isArray(mealsList)) {
            displayMeals(mealsList);  
        }
    } catch (error) {
        console.error('error', error);
    } finally {
        window.toggleLoader(false);
    }
}

async function getCuisines() {
    try {
        const response = await fetch(`${baseURL}/meals/areas`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const cuisinesList = data.meals || data.results || (Array.isArray(data) ? data : []);
        if (Array.isArray(cuisinesList)) {
            displayCuisinesUI(cuisinesList);
        }
    } catch (error) {
        console.error('error', error);
    }
}

function displayCuisinesUI(cuisines) {
    if (!cuisinesContainer) return;
    cuisinesContainer.innerHTML = ''; 

    const allBtn = document.createElement('button');
    allBtn.className = "cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-sm transition-all";
    allBtn.textContent = "All Cuisines";
    allBtn.addEventListener('click', () => {
        highlightActiveCuisine(allBtn);
        getMeals(''); 
    });
    cuisinesContainer.appendChild(allBtn);

    cuisines.forEach(cuisine => {
        const cuisineName = cuisine.strArea || cuisine.name || cuisine;

        const btn = document.createElement('button');
        btn.className = "cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all";
        btn.textContent = cuisineName;

        btn.addEventListener('click', () => {
            highlightActiveCuisine(btn);
            getMealsByCuisine(cuisineName);
        });

        cuisinesContainer.appendChild(btn);
    });
}

function highlightActiveCuisine(selectedBtn) {
    document.querySelectorAll('.cuisine-btn').forEach(b => {
        b.className = "cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-all";
    });
    selectedBtn.className = "cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold shadow-sm transition-all";
}

async function getMealsByCuisine(cuisineName, page = 1, limit = 25) {
    try {
        window.toggleLoader(true);
        
        const url = `${baseURL}/meals/filter?area=${encodeURIComponent(cuisineName)}&page=${page}&limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const mealsList = data.meals || data.results || data.data || (Array.isArray(data) ? data : Object.values(data).find(Array.isArray)) || [];

        if (Array.isArray(mealsList) && mealsList.length > 0) {
            displayMeals(mealsList);  
        } else {
            if (recipesCount) {
                recipesCount.textContent = `Showing 0 recipes`;
            }
            if (recipesGrid) {
                recipesGrid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="text-gray-400 text-4xl mb-3">
                            <i class="fa-solid fa-search"></i>
                        </div>
                        <p class="text-gray-600 font-semibold text-base">No recipes found. Try a different search term.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('error', error);
    } finally {
        window.toggleLoader(false);
    }
}

function displayMeals(mealsArray) {
    if (!recipesGrid) return;
    
    recipesGrid.innerHTML = '';
    
    if (recipesCount) {
        recipesCount.textContent = `Showing ${mealsArray.length} recipes`;
    }

    mealsArray.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = "recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
        const mealId = meal.id || meal.idMeal;
        mealCard.setAttribute('data-meal-id', mealId);

        mealCard.innerHTML = `
            <div class="relative h-48 overflow-hidden bg-gray-100">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="${meal.image || meal.thumbnail || meal.strMealThumb || ''}" 
                alt="${meal.name || 'Meal'}" 
                loading="lazy" />
                <div class="absolute bottom-3 left-3 flex gap-2">
                    <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
                        ${meal.category || 'General'}
                    </span>
                    <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                        ${meal.area || 'International'}
                    </span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    ${meal.name || 'Unnamed Meal'}
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                    ${meal.instructions && typeof meal.instructions === 'string' ? meal.instructions.substring(0, 80) + '...' : 'Delicious recipe to try!'}
                </p>
                <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-gray-900">
                        <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                        ${meal.category || 'Meal'}
                    </span>
                    <span class="font-semibold text-gray-500">
                        <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                        ${meal.area || 'Global'}
                    </span>
                </div>
            </div>
        `;
        mealCard.addEventListener('click', () => {
            getMealDetails(mealId);
        });

        recipesGrid.appendChild(mealCard);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('#recipes-grid .recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const mealId = card.getAttribute('data-meal-id');
            if (mealId) {
                getMealDetails(mealId);
            }
        });
    });
});

const allSections = [
    mealCategoriesSection, 
    allRecipesSection, 
    mealDetailsSection, 
    productsSection, 
    foodLogSection
];

function showSection(targetSection, urlPath) {
    allSections.forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.classList.add('hidden'); 
        }
    });

    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.remove('hidden');
    }

    if (urlPath) {
        history.pushState({ path: urlPath }, '', `#${urlPath}`);
    }
}

if (mealDetailsSection) {
    const backBtn = document.getElementById('back-to-meals-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(mealCategoriesSection, 'meals');
            if (allRecipesSection) allRecipesSection.style.display = 'block';
            if (searchFiltersSection) searchFiltersSection.style.display = 'block';
        });
    }
}

if (productsSection) {
    productsSection.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(productsSection, 'products');
    });
}
if (foodLogSection) {
    foodLogSection.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(foodLogSection, 'foodlog');
    });
}





async function getMealDetails(mealId) {
    try {
        window.toggleLoader(true);
        const response = await fetch(`${baseURL}/meals/${mealId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        const meal = data.result || data.meal || data.results || data;
        const mealName = meal.name || meal.strMeal || meal.title || 'Unnamed Meal';
        const mealImage = meal.image || meal.thumbnail || meal.strMealThumb || meal.img || '';


        if (mealCategoriesSection) mealCategoriesSection.style.display = 'none';
        if (allRecipesSection) allRecipesSection.style.display = 'none';
        if (searchFiltersSection) searchFiltersSection.style.display = 'none';
        
        if (mealDetailsSection) {
            mealDetailsSection.style.display = 'block';
            mealDetailsSection.classList.remove('hidden');

            if (heroImg) {
                heroImg.src = meal.image || meal.thumbnail || meal.strMealThumb || meal.img || '';
                heroImg.alt = mealName;
            }

            if (heroTitle) {
                heroTitle.textContent = mealName;
            }
            if (logMealBtn) {
                logMealBtn.setAttribute('data-meal-id', mealId);
            }
        }



    } catch (error) {
        console.error('error', error);
    } finally {
        window.toggleLoader(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    function updateActiveSidebarLink(sectionName) {
        if (!sidebar) return;

        sidebar.querySelectorAll('a').forEach(link => {
            const linkSection = link.getAttribute('data-section');
            if (linkSection === sectionName) {
                link.classList.add('active', 'bg-emerald-100', 'text-emerald-700');
                link.style.backgroundColor = '#d1fae5'; 
                link.style.color = '#047857';
            } else {
                link.classList.remove('active', 'bg-emerald-100', 'text-emerald-700');
                link.style.backgroundColor = '';
                link.style.color = '';
            }
        });
        
    }

    showSection(mealCategoriesSection, 'meals');
    if (allRecipesSection) allRecipesSection.style.display = 'block';
    if (searchFiltersSection) searchFiltersSection.style.display = 'block';
    
    updateActiveSidebarLink('meals');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const clickedLink = e.target.closest('[data-section]'); 
            if (!clickedLink) return;
            
            const sectionName = clickedLink.getAttribute('data-section');
            e.preventDefault();

            updateActiveSidebarLink(sectionName);

            if (sectionName === 'meals') {
                showSection(mealCategoriesSection, 'meals');
                if (allRecipesSection) allRecipesSection.style.display = 'block';
                if (searchFiltersSection) searchFiltersSection.style.display = 'block';
            } 
            else if (sectionName === 'products-scanner') {
                showSection(productsSection, 'products-scanner');
                if (searchFiltersSection) searchFiltersSection.style.display = 'none';
            } 
            else if (sectionName === 'foodlog') {
                showSection(foodLogSection, 'foodlog');
                if (searchFiltersSection) searchFiltersSection.style.display = 'none';
            }
        });
    }
});


async function searchProducts(query, page = 1, limit = 24) {
    if (!query || !query.trim()) return;

    try {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(true);

        const url = `${baseURL}/products/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        let products = [];
        if (data.results && Array.isArray(data.results)) {
            products = data.results;
        } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
        } else if (data.result && Array.isArray(data.result)) {
            products = data.result;
        } else if (Array.isArray(data)) {
            products = data;
        } else {
            products = [data];
        }
        
        ProductsGrid(products);
    } catch (error) {
        console.error('error', error);
    } finally {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(false);
    }
}

async function lookupProductByBarcode(barcode) {
    if (!barcode || !barcode.trim()) return;

    try {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(true);

        const url = `${baseURL}/products/barcode/${barcode.trim()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        const product = data.result || data.product || data;
        
        ProductsGrid([product]);

    } catch (error) {
        alert("No products to display");
    } finally {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(false);
    }
}

async function ProductCategories() {
    try {
        const response = await fetch(`${baseURL}/products/categories`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        const categories = data.result || data.categories || data;
        const categoriesContainer = document.getElementById('product-categories');

        if (categoriesContainer && Array.isArray(categories)) {
            categoriesContainer.innerHTML = '';
            categories.forEach(cat => {
                const catName = cat.name || cat;
                const btn = document.createElement('button');
                btn.className = "product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all";
                btn.innerHTML = `<i class="fa-solid fa-tag mr-1.5"></i>${catName}`;
                
                btn.addEventListener('click', () => fetchProductsByCategory(catName));
                categoriesContainer.appendChild(btn);
            });
        }
    } catch (error) {
        console.error('error', error);
    }
}

async function fetchProductsByCategory(categoryName) {
    try {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(true);

        const url = `${baseURL}/products/category/${encodeURIComponent(categoryName)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        if (data.results && Array.isArray(data.results)) {
            products = data.results;
        } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
        } else if (data.result && Array.isArray(data.result)) {
            products = data.result;
        } else if (Array.isArray(data)) {
            products = data;
        } else {
            products = [data];
        }
        
        ProductsGrid(products);

    } catch (error) {
        console.error('error', error);
    } finally {
        if (typeof window.toggleLoader === 'function') window.toggleLoader(false);
    }
}

function ProductsGrid(products) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    if (!products || products.length === 0) {
        gridContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">لا توجد منتجات مطابقة.</p>';
        if (productsCount) productsCount.textContent = '0 results found';
        return;
    }

    if (productsCount) {
        productsCount.textContent = `Showing ${products.length} products`;
    }

    products.forEach(product => {
        const name = product.name || product.productName || product.product_name || 'Unnamed Product';
        const brand = product.brand || product.brands || 'Brand Name';
        const image = product.image || product.image_url || 'https://images.openfoodfacts.org/images/products/316/893/015/9742/front_fr.54.400.jpg';
        const calories = product.calories || product.nutriments?.['energy-kcal_100g'] || 0;
        const protein = product.protein || product.nutriments?.proteins_100g || 0;
        const carbs = product.carbs || product.nutriments?.carbohydrates_100g || 0;
        const fat = product.fat || product.nutriments?.fat_100g || 0;
        const sugar = product.sugar || product.nutriments?.sugars_100g || 0;
        const barcodeVal = product.barcode || product.code || '';
        const nutriScore = (product.nutriScore || product.nutriscore_grade || 'a').toUpperCase();

        const card = document.createElement('div');
        card.className = "product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
        card.setAttribute('data-barcode', barcodeVal);
        card.setAttribute('data-grade', nutriScore.toLowerCase());

        card.innerHTML = `
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${image}" alt="${name}" loading="lazy" />
                <div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                    Nutri-Score ${nutriScore}
                </div>
            </div>
            <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${name}</h3>
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(calories)} kcal/100g</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                        <p class="text-xs font-bold text-emerald-700">${Math.round(protein)}g</p>
                        <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                        <p class="text-xs font-bold text-blue-700">${Math.round(carbs)}g</p>
                        <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                        <p class="text-xs font-bold text-purple-700">${Math.round(fat)}g</p>
                        <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                        <p class="text-xs font-bold text-orange-700">${Math.round(sugar)}g</p>
                        <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchProductBtn = document.getElementById('search-product-btn');
    const productSearchInput = document.getElementById('product-search-input');
    
    if (searchProductBtn && productSearchInput) {
        searchProductBtn.addEventListener('click', () => searchProducts(productSearchInput.value));
        productSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchProducts(productSearchInput.value);
        });
    }

    const lookupBarcodeBtn = document.getElementById('lookup-barcode-btn');
    const barcodeInput = document.getElementById('barcode-input');

    if (lookupBarcodeBtn && barcodeInput) {
        lookupBarcodeBtn.addEventListener('click', () => lookupProductByBarcode(barcodeInput.value));
        barcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') lookupProductByBarcode(barcodeInput.value);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => {
                btn.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200";
            });
            e.target.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white";

            const selectedGrade = e.target.getAttribute('data-grade').toLowerCase();
            productCards.forEach(card => {
                const cardGrade = card.getAttribute('data-grade');
                if (!selectedGrade || cardGrade === selectedGrade) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    ProductCategories();
});

function initEventListeners() {
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                getMeals(query);
            }, 400);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    getMeals('');
    getCategories();
    getCuisines();
    initEventListeners();
    hideLoadingOverlay();
});