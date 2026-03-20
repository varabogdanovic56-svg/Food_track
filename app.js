// Global state
let currentDate = new Date();
let currentMealType = 0;
let currentMealId = null;
let selectedProduct = null;
let selectedRecipeDetail = null;
let userGoals = { calories: 2000, protein: 100, carbs: 250, fat: 65, water: 2000 };
let dailyData = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
let meals = { 0: [], 1: [], 2: [], 3: [] };
let recipes = [];
let selectedActivityType = null;
let selectedDietitianId = 1;
let waterIntake = 0;
let weightChart = null;
let caloriesChart = null;

const API_BASE = 'http://localhost:5001/api';

// Toast notification function
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Recipe Detail Modal
function openRecipeDetailModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    selectedRecipeDetail = recipe;
    const nutrition = recipe.totalNutrition || {};
    
    document.getElementById('recipeDetailName').textContent = recipe.name;
    document.getElementById('recipeDetailTime').textContent = (recipe.prepTimeMinutes + recipe.cookTimeMinutes) + ' мин';
    document.getElementById('recipeDetailServings').textContent = recipe.servings + ' порц.';
    document.getElementById('recipeDetailCuisine').textContent = recipe.cuisine || '-';
    document.getElementById('recipeDetailCalories').textContent = Math.round(nutrition.calories || 0);
    document.getElementById('recipeDetailProtein').textContent = Math.round(nutrition.protein || 0);
    document.getElementById('recipeDetailCarbs').textContent = Math.round(nutrition.carbs || 0);
    document.getElementById('recipeDetailFat').textContent = Math.round(nutrition.fat || 0);
    document.getElementById('recipeDetailInstructions').textContent = recipe.instructions || 'Нет инструкции';
    
    // Tags
    const dietLabels = { 1: 'Кето', 2: 'Веган', 4: 'Вегетарианское', 8: 'Безглютен', 32: 'Низкоуглеводное' };
    const tags = Object.entries(dietLabels)
        .filter(([k, v]) => (recipe.dietTypes & parseInt(k)) === parseInt(k))
        .map(([k, v]) => `<span class="recipe-detail-tag">${v}</span>`)
        .join('');
    document.getElementById('recipeDetailTags').innerHTML = tags;
    
    // Ingredients
    if (recipe.ingredients) {
        const ingredientList = recipe.ingredients.split(',').map(i => i.trim());
        document.getElementById('recipeDetailIngredients').innerHTML = ingredientList.map(i => 
            `<div class="recipe-detail-ingredient">• ${i}</div>`
        ).join('');
    } else {
        document.getElementById('recipeDetailIngredients').innerHTML = '<div>Нет данных об ингредиентах</div>';
    }
    
    // Image
    const header = document.getElementById('recipeDetailHeader');
    const recipeImage = getRecipeImage(recipe.name) || recipe.imageUrl || '';
    if (recipeImage) {
        header.style.backgroundImage = `url('${recipeImage}')`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
    } else {
        header.style.background = 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)';
        header.style.backgroundImage = 'none';
    }
    
    document.getElementById('recipeDetailModal').classList.add('active');
}

function closeRecipeDetailModal() {
    document.getElementById('recipeDetailModal').classList.remove('active');
    selectedRecipeDetail = null;
}

function addRecipeDetailToMeal() {
    if (!selectedRecipeDetail) return;
    
    const nutrition = selectedRecipeDetail.totalNutrition || {};
    const servings = selectedRecipeDetail.servings || 1;
    
    const entry = {
        productId: selectedRecipeDetail.id,
        productName: selectedRecipeDetail.name,
        grams: 100 * servings,
        calories: (nutrition.calories || 0) * servings,
        protein: (nutrition.protein || 0) * servings,
        carbs: (nutrition.carbs || 0) * servings,
        fat: (nutrition.fat || 0) * servings
    };
    
    const mealType = currentMealType || 0;
    if (!meals[mealType]) meals[mealType] = [];
    meals[mealType].push(entry);
    
    dailyData.calories += entry.calories;
    dailyData.protein += entry.protein;
    dailyData.carbs += entry.carbs;
    dailyData.fat += entry.fat;
    
    updateStats();
    renderMeals();
    closeRecipeDetailModal();
    showToast(`"${selectedRecipeDetail.name}" добавлен в дневник`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader and show app
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('appContainer').classList.add('visible');
    }, 800);
    
    updateDateDisplay();
    loadDailyData();
    loadRecipes();
    loadRecommendations();
    loadDietitians();
    loadChatMessages();
    initCharts();
    document.getElementById('activityDate').valueAsDate = new Date();
    
    // Event Listeners
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleSidebar);
    document.getElementById('prevDateBtn').addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDateBtn').addEventListener('click', () => changeDate(1));
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) showPage(page);
        });
    });
    
    // Logo - refresh current page data
    document.querySelector('.logo').addEventListener('click', (e) => {
        e.preventDefault();
        loadDailyData();
        loadRecipes();
        loadRecommendations();
        loadDietitians();
        loadChatMessages();
        updateStats();
        renderMeals();
    });
    
    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => filterRecipes(e.target.dataset.filter, e.target));
    });
    
    // Recipe search
    document.getElementById('recipeSearch').addEventListener('input', searchRecipes);
    
    // Chart tabs
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', (e) => changeChartPeriod(e.target.dataset.period, e.target));
    });
    
    // Weight button
    document.getElementById('addWeightBtn').addEventListener('click', addWeightRecord);
    
    // Water buttons
    document.querySelectorAll('.water-btn').forEach(btn => {
        btn.addEventListener('click', (e) => addWater(parseInt(e.target.dataset.water)));
    });
    
    // Activity cards
    document.querySelectorAll('.activity-type-card').forEach(card => {
        card.addEventListener('click', () => selectActivityType(parseInt(card.dataset.type)));
    });
    
    // Add activity button
    document.getElementById('addActivityBtn').addEventListener('click', addActivity);
    
    // Add reminder button
    document.getElementById('addReminderBtn').addEventListener('click', openReminderModal);
    
    // Product page filters
    document.querySelectorAll('.products-grid + .filter-section .filter-pill, .filter-section .filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => filterProducts(e.target.dataset.category, e.target));
    });
    
    // Product page search
    const productSearchPage = document.getElementById('productSearchPage');
    if (productSearchPage) {
        productSearchPage.addEventListener('input', searchProductsPage);
    }
    
    // Chat
    document.getElementById('chatInput').addEventListener('keypress', handleChatKeyPress);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('productSearch').addEventListener('input', searchProducts);
    document.getElementById('addFoodBtn').addEventListener('click', addFoodToMeal);
    
    // Product Detail Modal
    document.getElementById('closeProductDetailBtn').addEventListener('click', closeProductDetailModal);
    document.getElementById('addProductDetailBtn').addEventListener('click', addProductDetailToMeal);
    
    // Recipe Detail Modal
    document.getElementById('closeRecipeDetailBtn').addEventListener('click', closeRecipeDetailModal);
    document.getElementById('addRecipeDetailBtn').addEventListener('click', addRecipeDetailToMeal);
});

// Global event delegation for dynamic elements
document.addEventListener('input', function(e) {
    if (e.target.id === 'productDetailGrams') {
        updateProductDetailNutrition();
    }
});

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const page = document.getElementById('page-' + pageId);
    page.classList.add('active');
    
    // Re-trigger animations
    page.style.animation = 'none';
    page.offsetHeight; // Trigger reflow
    page.style.animation = null;
    
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    if (pageId === 'chat') {
        loadChatMessages();
    }
    
    if (pageId === 'products') {
        renderProductsPage(allFoods);
    }
    
    if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Date handling
function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('ru-RU', options);
}

function changeDate(delta) {
    currentDate.setDate(currentDate.getDate() + delta);
    updateDateDisplay();
    loadDailyData();
}

// API Functions
function loadDailyData() {
    // Use local data - meals are stored in memory
    updateStats();
    renderMeals();
}

function updateStats() {
    document.getElementById('totalCalories').textContent = Math.round(dailyData.calories);
    document.getElementById('totalProtein').textContent = Math.round(dailyData.protein);
    document.getElementById('totalCarbs').textContent = Math.round(dailyData.carbs);
    document.getElementById('totalFat').textContent = Math.round(dailyData.fat);
    
    // Animate progress bars
    setTimeout(() => {
        document.getElementById('caloriesProgress').style.width = Math.min((dailyData.calories / userGoals.calories) * 100, 100) + '%';
        document.getElementById('proteinProgress').style.width = Math.min((dailyData.protein / userGoals.protein) * 100, 100) + '%';
        document.getElementById('carbsProgress').style.width = Math.min((dailyData.carbs / userGoals.carbs) * 100, 100) + '%';
        document.getElementById('fatProgress').style.width = Math.min((dailyData.fat / userGoals.fat) * 100, 100) + '%';
    }, 100);
}

function renderMeals() {
    const mealNames = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
    const mealTimes = ['07:00 - 10:00', '12:00 - 14:00', '18:00 - 20:00', 'В любое время'];
    
    let html = '';
    for (let i = 0; i < 4; i++) {
        const mealEntries = meals[i] || [];
        const totalCal = mealEntries.reduce((sum, e) => sum + e.calories, 0);
        
        html += `
            <div class="meal-card" onclick="openMealModal(${i})">
                <div class="meal-header">
                    <div class="meal-title">${mealNames[i]}</div>
                    <div class="meal-time">${mealTimes[i]}</div>
                </div>
                <div class="meal-calories">${Math.round(totalCal)} ккал</div>
                <div class="meal-items">
                    ${mealEntries.slice(0, 3).map(e => `
                        <div class="meal-item">
                            <span>${e.productName}</span>
                            <span>${Math.round(e.grams)}г</span>
                        </div>
                    `).join('')}
                    ${mealEntries.length > 3 ? `<div class="meal-item">+${mealEntries.length - 3} ещё...</div>` : ''}
                </div>
            </div>
        `;
    }
    document.getElementById('mealsGrid').innerHTML = html;
}

// Modal Functions
function openMealModal(mealType) {
    currentMealType = mealType;
    const mealNames = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
    document.getElementById('modalMealTitle').textContent = 'Добавить в ' + mealNames[mealType];
    document.getElementById('foodModal').classList.add('active');
    document.getElementById('productSearch').value = '';
    document.getElementById('selectedProduct').style.display = 'none';
    loadProducts('');
}

function closeModal() {
    document.getElementById('foodModal').classList.remove('active');
}

const productsDatabase = [
    // МЯСО (10)
    { id: 1, name: 'Куриная грудка', category: 'Мясо', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, defaultGrams: 100 },
    { id: 2, name: 'Говядина', category: 'Мясо', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, defaultGrams: 100 },
    { id: 3, name: 'Свинина', category: 'Мясо', caloriesPer100g: 242, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14, defaultGrams: 100 },
    { id: 4, name: 'Индейка', category: 'Мясо', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, defaultGrams: 100 },
    { id: 5, name: 'Баранина', category: 'Мясо', caloriesPer100g: 294, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 21, defaultGrams: 100 },
    { id: 6, name: 'Кролик', category: 'Мясо', caloriesPer100g: 173, proteinPer100g: 33, carbsPer100g: 0, fatPer100g: 3.5, defaultGrams: 100 },
    { id: 7, name: 'Ветчина', category: 'Мясо', caloriesPer100g: 145, proteinPer100g: 22, carbsPer100g: 1, fatPer100g: 5, defaultGrams: 50 },
    { id: 8, name: 'Бекон', category: 'Мясо', caloriesPer100g: 541, proteinPer100g: 37, carbsPer100g: 1.4, fatPer100g: 42, defaultGrams: 30 },
    { id: 9, name: 'Колбаса вареная', category: 'Мясо', caloriesPer100g: 301, proteinPer100g: 12, carbsPer100g: 2, fatPer100g: 27, defaultGrams: 50 },
    { id: 10, name: 'Печень куриная', category: 'Мясо', caloriesPer100g: 167, proteinPer100g: 24, carbsPer100g: 1, fatPer100g: 6, defaultGrams: 100 },
    
    // РЫБА (10)
    { id: 11, name: 'Лосось', category: 'Рыба', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultGrams: 150 },
    { id: 12, name: 'Тунец', category: 'Рыба', caloriesPer100g: 130, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 1, defaultGrams: 100 },
    { id: 13, name: 'Минтай', category: 'Рыба', caloriesPer100g: 72, proteinPer100g: 16, carbsPer100g: 0, fatPer100g: 0.5, defaultGrams: 150 },
    { id: 14, name: 'Сельдь', category: 'Рыба', caloriesPer100g: 158, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 9, defaultGrams: 100 },
    { id: 15, name: 'Скумбрия', category: 'Рыба', caloriesPer100g: 205, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 14, defaultGrams: 100 },
    { id: 16, name: 'Треска', category: 'Рыба', caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7, defaultGrams: 150 },
    { id: 17, name: 'Горбуша', category: 'Рыба', caloriesPer100g: 147, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 6, defaultGrams: 150 },
    { id: 18, name: 'Креветки', category: 'Рыба', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, defaultGrams: 100 },
    { id: 19, name: 'Мидии', category: 'Рыба', caloriesPer100g: 86, proteinPer100g: 12, carbsPer100g: 3, fatPer100g: 2, defaultGrams: 100 },
    { id: 20, name: 'Кальмар', category: 'Рыба', caloriesPer100g: 92, proteinPer100g: 18, carbsPer100g: 2, fatPer100g: 1, defaultGrams: 100 },
    
    // МОЛОЧНОЕ (10)
    { id: 21, name: 'Молоко 3.2%', category: 'Молочное', caloriesPer100g: 59, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.2, defaultGrams: 250 },
    { id: 22, name: 'Творог 5%', category: 'Молочное', caloriesPer100g: 121, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 5, defaultGrams: 100 },
    { id: 23, name: 'Творог обезжиренный', category: 'Молочное', caloriesPer100g: 76, proteinPer100g: 16, carbsPer100g: 2, fatPer100g: 0.5, defaultGrams: 150 },
    { id: 24, name: 'Кефир 1%', category: 'Молочное', caloriesPer100g: 40, proteinPer100g: 3.3, carbsPer100g: 4.7, fatPer100g: 1, defaultGrams: 200 },
    { id: 25, name: 'Сыр твердый (Чеддер)', category: 'Молочное', caloriesPer100g: 402, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, defaultGrams: 30 },
    { id: 26, name: 'Моцарелла', category: 'Молочное', caloriesPer100g: 280, proteinPer100g: 28, carbsPer100g: 3.1, fatPer100g: 17, defaultGrams: 50 },
    { id: 27, name: 'Пармезан', category: 'Молочное', caloriesPer100g: 431, proteinPer100g: 38, carbsPer100g: 4.1, fatPer100g: 29, defaultGrams: 20 },
    { id: 28, name: 'Йогурт натуральный', category: 'Молочное', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.7, defaultGrams: 150 },
    { id: 29, name: 'Сметана 15%', category: 'Молочное', caloriesPer100g: 158, proteinPer100g: 3, carbsPer100g: 3, fatPer100g: 15, defaultGrams: 30 },
    { id: 30, name: 'Сливки 10%', category: 'Молочное', caloriesPer100g: 118, proteinPer100g: 2, carbsPer100g: 3, fatPer100g: 10, defaultGrams: 50 },
    
    // ЯЙЦА (3)
    { id: 31, name: 'Яйцо куриное', category: 'Яйца', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, defaultGrams: 50 },
    { id: 32, name: 'Яйцо перепелиное', category: 'Яйца', caloriesPer100g: 158, proteinPer100g: 13, carbsPer100g: 0.6, fatPer100g: 11, defaultGrams: 30 },
    { id: 33, name: 'Белок яичный', category: 'Яйца', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, defaultGrams: 100 },
    
    // КРУПЫ (10)
    { id: 34, name: 'Рис белый', category: 'Крупы', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, defaultGrams: 150 },
    { id: 35, name: 'Гречка', category: 'Крупы', caloriesPer100g: 343, proteinPer100g: 12.6, carbsPer100g: 70, fatPer100g: 3.3, defaultGrams: 100 },
    { id: 36, name: 'Овсянка', category: 'Крупы', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, defaultGrams: 80 },
    { id: 37, name: 'Киноа', category: 'Крупы', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, defaultGrams: 100 },
    { id: 38, name: 'Булгур', category: 'Крупы', caloriesPer100g: 83, proteinPer100g: 3.1, carbsPer100g: 19, fatPer100g: 0.2, defaultGrams: 100 },
    { id: 39, name: 'Перловка', category: 'Крупы', caloriesPer100g: 123, proteinPer100g: 3, carbsPer100g: 28, fatPer100g: 0.4, defaultGrams: 100 },
    { id: 40, name: 'Рис бурый', category: 'Крупы', caloriesPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, defaultGrams: 150 },
    { id: 41, name: 'Макароны', category: 'Крупы', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, defaultGrams: 100 },
    { id: 42, name: 'Пшено', category: 'Крупы', caloriesPer100g: 343, proteinPer100g: 11, carbsPer100g: 70, fatPer100g: 3.5, defaultGrams: 100 },
    { id: 43, name: 'Кус-кус', category: 'Крупы', caloriesPer100g: 112, proteinPer100g: 3.8, carbsPer100g: 23, fatPer100g: 0.2, defaultGrams: 100 },
    
    // ОВОЩИ (10)
    { id: 44, name: 'Брокколи', category: 'Овощи', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, defaultGrams: 150 },
    { id: 45, name: 'Морковь', category: 'Овощи', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, defaultGrams: 100 },
    { id: 46, name: 'Помидор', category: 'Овощи', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, defaultGrams: 150 },
    { id: 47, name: 'Огурец', category: 'Овощи', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, defaultGrams: 150 },
    { id: 48, name: 'Перец болгарский', category: 'Овощи', caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, defaultGrams: 100 },
    { id: 49, name: 'Лук репчатый', category: 'Овощи', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1, defaultGrams: 80 },
    { id: 50, name: 'Капуста белокочанная', category: 'Овощи', caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 6, fatPer100g: 0.1, defaultGrams: 150 },
    { id: 51, name: 'Шпинат', category: 'Овощи', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, defaultGrams: 50 },
    { id: 52, name: 'Салат', category: 'Овощи', caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, defaultGrams: 50 },
    { id: 53, name: 'Кабачок', category: 'Овощи', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, defaultGrams: 150 },
];

const dishesDatabase = [
    // БЛЮДА (50)
    { id: 54, name: 'Салат Цезарь', category: 'Блюда', caloriesPer100g: 190, proteinPer100g: 8, carbsPer100g: 8, fatPer100g: 14, defaultGrams: 200 },
    { id: 55, name: 'Греческий салат', category: 'Блюда', caloriesPer100g: 120, proteinPer100g: 4, carbsPer100g: 6, fatPer100g: 9, defaultGrams: 200 },
    { id: 56, name: 'Оливье', category: 'Блюда', caloriesPer100g: 160, proteinPer100g: 5, carbsPer100g: 12, fatPer100g: 10, defaultGrams: 200 },
    { id: 57, name: 'Борщ', category: 'Блюда', caloriesPer100g: 45, proteinPer100g: 2, carbsPer100g: 6, fatPer100g: 1.5, defaultGrams: 300 },
    { id: 58, name: 'Щи', category: 'Блюда', caloriesPer100g: 32, proteinPer100g: 1.5, carbsPer100g: 4, fatPer100g: 1, defaultGrams: 300 },
    { id: 59, name: 'Суп куриный', category: 'Блюда', caloriesPer100g: 35, proteinPer100g: 3, carbsPer100g: 3, fatPer100g: 1.5, defaultGrams: 300 },
    { id: 60, name: 'Уха', category: 'Блюда', caloriesPer100g: 45, proteinPer100g: 6, carbsPer100g: 2, fatPer100g: 1.5, defaultGrams: 300 },
    { id: 61, name: 'Пельмени', category: 'Блюда', caloriesPer100g: 250, proteinPer100g: 12, carbsPer100g: 25, fatPer100g: 12, defaultGrams: 250 },
    { id: 62, name: 'Блины', category: 'Блюда', caloriesPer100g: 230, proteinPer100g: 6, carbsPer100g: 30, fatPer100g: 9, defaultGrams: 150 },
    { id: 63, name: 'Омлет', category: 'Блюда', caloriesPer100g: 215, proteinPer100g: 14, carbsPer100g: 2, fatPer100g: 17, defaultGrams: 150 },
    { id: 64, name: 'Яичница', category: 'Блюда', caloriesPer100g: 240, proteinPer100g: 14, carbsPer100g: 1, fatPer100g: 20, defaultGrams: 120 },
    { id: 65, name: 'Вареники с картошкой', category: 'Блюда', caloriesPer100g: 220, proteinPer100g: 5, carbsPer100g: 35, fatPer100g: 7, defaultGrams: 200 },
    { id: 66, name: 'Голубцы', category: 'Блюда', caloriesPer100g: 145, proteinPer100g: 9, carbsPer100g: 10, fatPer100g: 8, defaultGrams: 250 },
    { id: 67, name: 'Котлета куриная', category: 'Блюда', caloriesPer100g: 220, proteinPer100g: 18, carbsPer100g: 10, fatPer100g: 12, defaultGrams: 100 },
    { id: 68, name: 'Котлета говяжья', category: 'Блюда', caloriesPer100g: 260, proteinPer100g: 17, carbsPer100g: 8, fatPer100g: 18, defaultGrams: 100 },
    { id: 69, name: 'Шашлык свиной', category: 'Блюда', caloriesPer100g: 260, proteinPer100g: 24, carbsPer100g: 2, fatPer100g: 17, defaultGrams: 150 },
    { id: 70, name: 'Стейк лосося', category: 'Блюда', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultGrams: 150 },
    { id: 71, name: 'Курица гриль', category: 'Блюда', caloriesPer100g: 190, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 10, defaultGrams: 200 },
    { id: 72, name: 'Плов', category: 'Блюда', caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 20, fatPer100g: 6, defaultGrams: 250 },
    { id: 73, name: 'Макароны по-флотски', category: 'Блюда', caloriesPer100g: 220, proteinPer100g: 9, carbsPer100g: 25, fatPer100g: 10, defaultGrams: 250 },
    { id: 74, name: 'Картофельное пюре', category: 'Блюда', caloriesPer100g: 80, proteinPer100g: 2, carbsPer100g: 15, fatPer100g: 1.5, defaultGrams: 200 },
    { id: 75, name: 'Рис отварной', category: 'Блюда', caloriesPer100g: 113, proteinPer100g: 2.4, carbsPer100g: 25, fatPer100g: 0.2, defaultGrams: 150 },
    { id: 76, name: 'Гречка отварная', category: 'Блюда', caloriesPer100g: 110, proteinPer100g: 3.8, carbsPer100g: 21, fatPer100g: 0.6, defaultGrams: 150 },
    { id: 77, name: 'Тефтели', category: 'Блюда', caloriesPer100g: 220, proteinPer100g: 14, carbsPer100g: 10, fatPer100g: 14, defaultGrams: 200 },
    { id: 78, name: 'Подлива', category: 'Блюда', caloriesPer100g: 85, proteinPer100g: 5, carbsPer100g: 6, fatPer100g: 4, defaultGrams: 100 },
    { id: 79, name: 'Рагу овощное', category: 'Блюда', caloriesPer100g: 65, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 2, defaultGrams: 250 },
    { id: 80, name: 'Запеканка творожная', category: 'Блюда', caloriesPer100g: 180, proteinPer100g: 14, carbsPer100g: 18, fatPer100g: 6, defaultGrams: 200 },
    { id: 81, name: 'Сырники', category: 'Блюда', caloriesPer100g: 240, proteinPer100g: 12, carbsPer100g: 25, fatPer100g: 12, defaultGrams: 150 },
    { id: 82, name: 'Драники', category: 'Блюда', caloriesPer100g: 220, proteinPer100g: 4, carbsPer100g: 30, fatPer100g: 10, defaultGrams: 150 },
    { id: 83, name: 'Жареная картошка', category: 'Блюда', caloriesPer100g: 320, proteinPer100g: 4, carbsPer100g: 35, fatPer100g: 18, defaultGrams: 200 },
    { id: 84, name: 'Овощи на гриле', category: 'Блюда', caloriesPer100g: 55, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 1.5, defaultGrams: 200 },
    { id: 85, name: 'Фаршированный перец', category: 'Блюда', caloriesPer100g: 160, proteinPer100g: 10, carbsPer100g: 15, fatPer100g: 7, defaultGrams: 250 },
    { id: 86, name: 'Ленивые голубцы', category: 'Блюда', caloriesPer100g: 150, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 7, defaultGrams: 250 },
    { id: 87, name: 'Солянка', category: 'Блюда', caloriesPer100g: 100, proteinPer100g: 8, carbsPer100g: 6, fatPer100g: 5, defaultGrams: 300 },
    { id: 88, name: 'Рассольник', category: 'Блюда', caloriesPer100g: 50, proteinPer100g: 2.5, carbsPer100g: 7, fatPer100g: 1.5, defaultGrams: 300 },
    { id: 89, name: 'Грибной суп', category: 'Блюда', caloriesPer100g: 40, proteinPer100g: 2, carbsPer100g: 5, fatPer100g: 2, defaultGrams: 300 },
    { id: 90, name: 'Суп-пюре овощной', category: 'Блюда', caloriesPer100g: 45, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 1, defaultGrams: 250 },
    { id: 91, name: 'Рубленые котлеты', category: 'Блюда', caloriesPer100g: 250, proteinPer100g: 16, carbsPer100g: 8, fatPer100g: 18, defaultGrams: 150 },
    { id: 92, name: 'Куриные наггетсы', category: 'Блюда', caloriesPer100g: 290, proteinPer100g: 17, carbsPer100g: 18, fatPer100g: 18, defaultGrams: 150 },
    { id: 93, name: 'Картошка по-деревенски', category: 'Блюда', caloriesPer100g: 280, proteinPer100g: 4, carbsPer100g: 35, fatPer100g: 14, defaultGrams: 200 },
    { id: 94, name: 'Овощной салат', category: 'Блюда', caloriesPer100g: 45, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 0.5, defaultGrams: 200 },
    { id: 95, name: 'Салат с тунцом', category: 'Блюда', caloriesPer100g: 180, proteinPer100g: 20, carbsPer100g: 5, fatPer100g: 9, defaultGrams: 200 },
    { id: 96, name: 'Винегрет', category: 'Блюда', caloriesPer100g: 70, proteinPer100g: 2, carbsPer100g: 12, fatPer100g: 1.5, defaultGrams: 200 },
    { id: 97, name: 'Мимоза', category: 'Блюда', caloriesPer100g: 200, proteinPer100g: 9, carbsPer100g: 12, fatPer100g: 14, defaultGrams: 150 },
    { id: 98, name: 'Селедка под шубой', category: 'Блюда', caloriesPer100g: 210, proteinPer100g: 7, carbsPer100g: 15, fatPer100g: 14, defaultGrams: 150 },
    { id: 99, name: 'Каша манная', category: 'Блюда', caloriesPer100g: 100, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 1.5, defaultGrams: 200 },
    { id: 100, name: 'Каша рисовая', category: 'Блюда', caloriesPer100g: 95, proteinPer100g: 2, carbsPer100g: 20, fatPer100g: 0.5, defaultGrams: 200 },
    { id: 101, name: 'Каша пшённая', category: 'Блюда', caloriesPer100g: 90, proteinPer100g: 3, carbsPer100g: 18, fatPer100g: 1, defaultGrams: 200 },
    { id: 102, name: 'Каша кукурузная', category: 'Блюда', caloriesPer100g: 85, proteinPer100g: 2.5, carbsPer100g: 17, fatPer100g: 1, defaultGrams: 200 },
    { id: 103, name: 'Овсяная каша', category: 'Блюда', caloriesPer100g: 88, proteinPer100g: 3, carbsPer100g: 15, fatPer100g: 2, defaultGrams: 200 },
];

const allFoods = [...productsDatabase, ...dishesDatabase];

function loadProducts(query) {
    let filtered = allFoods;
    
    if (query && query.trim() !== '') {
        const searchTerm = query.toLowerCase();
        filtered = allFoods.filter(f => f.name.toLowerCase().includes(searchTerm));
    }
    
    renderProducts(filtered);
}

function renderProducts(products) {
    document.getElementById('productList').innerHTML = products.map(p => {
        const name = p.name || p.Name || 'Без названия';
        const calories = p.caloriesPer100g || p.CaloriesPer100g || 0;
        const protein = p.proteinPer100g || p.ProteinPer100g || 0;
        const carbs = p.carbsPer100g || p.CarbsPer100g || 0;
        const fat = p.fatPer100g || p.FatPer100g || 0;
        const grams = p.defaultGrams || p.DefaultGrams || 100;
        
        return `
        <div class="product-item" onclick="selectProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <div class="product-name">${name}</div>
            <div class="product-nutrition">
                <span>${Math.round(calories)} ккал</span>
                <span>Б: ${Math.round(protein)}</span>
                <span>У: ${Math.round(carbs)}</span>
                <span>Ж: ${Math.round(fat)}</span>
            </div>
        </div>
        `;
    }).join('');
}

function selectProduct(product) {
    selectedProduct = product;
    document.getElementById('selectedProduct').style.display = 'block';
    document.getElementById('selectedProductName').textContent = product.name;
    document.getElementById('productGrams').value = product.defaultGrams || 100;
    updateProductNutrition();
}

function updateProductNutrition() {
    if (!selectedProduct) return;
    const grams = parseFloat(document.getElementById('productGrams').value) || 100;
    const ratio = grams / 100;
    
    const calories = selectedProduct.caloriesPer100g || 0;
    const protein = selectedProduct.proteinPer100g || 0;
    const carbs = selectedProduct.carbsPer100g || 0;
    const fat = selectedProduct.fatPer100g || 0;
    
    document.getElementById('productCalories').textContent = Math.round(calories * ratio);
    document.getElementById('productProtein').textContent = Math.round(protein * ratio);
    document.getElementById('productCarbs').textContent = Math.round(carbs * ratio);
    document.getElementById('productFat').textContent = Math.round(fat * ratio);
}

document.getElementById('productGrams').addEventListener('input', updateProductNutrition);

function searchProducts() {
    const query = document.getElementById('productSearch').value;
    loadProducts(query);
}

function addFoodToMeal() {
    if (!selectedProduct) return;
    
    const grams = parseFloat(document.getElementById('productGrams').value) || 100;
    const ratio = grams / 100;
    
    const entry = {
        productId: selectedProduct.id,
        grams: grams,
        calories: selectedProduct.caloriesPer100g * ratio,
        protein: selectedProduct.proteinPer100g * ratio,
        carbs: selectedProduct.carbsPer100g * ratio,
        fat: selectedProduct.fatPer100g * ratio,
        productName: selectedProduct.name
    };
    
    if (!meals[currentMealType]) meals[currentMealType] = [];
    meals[currentMealType].push(entry);
    
    dailyData.calories += entry.calories;
    dailyData.protein += entry.protein;
    dailyData.carbs += entry.carbs;
    dailyData.fat += entry.fat;
    
    updateStats();
    renderMeals();
    closeModal();
}

// Recipes Database - 50 real recipes
const recipesDatabase = [
    // КETO - 10 recipes (dietTypes: 1)
    {
        id: 1, name: 'Кето-омлет с авокадо и сыром', description: 'Пышный омлет с авокадо и пармезаном - идеальный завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'img/recipe/keto-omlet.jpg',
        ingredients: 'Яйца 3 шт, Авокадо 1/2, Пармезан 30г, Сливочное масло 15г, Соль, перец',
        instructions: `Подготовьте авокадо правильно. Выберите спелый авокадо — он должен быть мягким при нажатии. Разрежьте его пополам, удалите косточку и нарежьте тонкими ломтиками. Сбрызните лимонным соком, чтобы сохранить яркий зеленый цвет и предотвратить потемнение!

Взбейте яйца до воздушности. В глубокой миске тщательно взбейте яйца со щепоткой соли и перцем до однородной массы. Чем дольше взбиваете — тем пышнее получится омлет! Добавьте тертый пармезан и перемешайте.

Разогрейте сковороду правильно. На среднем огне разогрейте сливочное масло до легкого шипения. Масло должно полностью растопиться и слегка пениться — это идеальная температура для омлета!

Вылейте яйца в сковороду. Аккуратно влейте взбитую яичную массу и оставьте на 1 минуту, пока края не начнут схватываться. Затем лопаткой мягко подтяните края к центру, позволяя жидкой массе стечь на сковороду.

Добавьте авокадо. Выложите ломтики авокадо на одну половину омлета. Посыпьте сверху тертым пармезаном. Накройте крышкой на 1-2 минуты, пока сыр слегка расплавится.

Сложите и подавайте. Аккуратно сложите омлет пополам лопаткой и переложите на тарелку. Подавайте немедленно, пока горячий и воздушный!`,
        totalNutrition: { calories: 420, protein: 24, carbs: 4, fat: 35 }
    },
    {
        id: 2, name: 'Стейк лосося с маслом', description: 'Сочный лосось с зеленым маслом',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 15, dietTypes: 1, cuisine: 'Скандинавская',
        imageUrl: 'img/recipe/losos_s_maslom.jpg',
        ingredients: 'Лосось 400г, Сливочное масло 50г, Петрушка 20г, Чеснок 2 зубчика, Лимон 1/2, Соль, перец',
        instructions: `Подготовьте лосось правильно. Филе лосося промойте и обсушите бумажными полотенцами — это关键 для хрустящей корочки! Посолите и поперчите с обеих сторон. Оставьте при комнатной температуре на 15-20 минут, чтобы рыба прогрелась.

Приготовьте зеленое масло. Пока лосось маринуется, сделайте ароматное масло: размягченное сливочное масло смешайте с мелко нарезанной петрушкой, измельченным чесноком, щепоткой соли и перцем. Хорошо перемешайте до однородности.

Разогрейте сковороду для рыбы. Сильно нагрейте сковороду с оливковым маслом до появления легкого дымка. Выложите лосось кожей вниз — это обеспечит идеальную хрустящую корочку!

Обжарьте первую сторону. Жарьте 3-4 минуты, не трогая рыбу, пока кожа не станет золотистой и хрустящей. Аккуратно переверните лосось.

Доведите до готовности. Обжарьте вторую сторону 2-3 минуты до desired степени прожарки. Внутренняя температура должна быть 52-55°C для medium-rare.

Подавайте с зеленым маслом. Выложите готового лосося на тарелку. Сверху положите щедрую порцию зеленого масла — оно начнет таять от горячей рыбы! Добавьте дольку лимона для свежести.`,
        totalNutrition: { calories: 480, protein: 42, carbs: 1, fat: 34 }
    },
    {
        id: 3, name: 'Куриные крылышки в духовке', description: 'Хрустящие крылышки без углеводов',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 45, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'img/recipe/krilishki.jpg',
        ingredients: 'Куриные крылышки 1кг, Оливковое масло 30мл, Паприка 1 ч.л., Чеснок 3 зубчика, Соль, перец, Розмарин',
        instructions: `Подготовьте крылышки правильно. Куриные крылышки тщательно промойте и обсушите бумажными полотенцами — это很重要 для хрустящей корочки! Если крылышки влажные, кожица будет мягкой, а не хрустящей. Разделите на две части по суставу, если целые.

Приготовьте маринад. В глубокой миске смешайте оливковое масло, измельченный чеснок, паприку, соль, перец и розмарин. Паприка даст красивый золотистый цвет и приятный аромат!

Замаринуйте крылышки. Выложите крылышки в миску с маринадом и тщательно перемешайте руками, чтобы каждое крылышко было покрыто специями. Оставьте при комнатной температуре на 15-20 минут или в холодильнике на несколько часов для более насыщенного вкуса.

Разогрейте духовку. Разогрейте духовку до 200°C (400°F). Застелите противень пергаментной бумагой или фольгой для удобства очистки.

Выложите крылышки. Распределите крылышки на противне в один слой, не плотно — между ними должно быть пространство для циркуляции воздуха. Это обеспечит равномерное запекание и хрустящую корочку!

Запекайте до золотистой хрустящей корочки. Выпекайте 40-45 минут, перевернув крылышки в середине приготовления. Готовые крылышки должны быть золотисто-коричневого цвета с хрустящей кожицей.

Подавайте горячими. Выложите на тарелку и подавайте сразу же — горячие крылышки самые вкусные! Можно добавить дольки лимона и свежую зелень.`,
        totalNutrition: { calories: 350, protein: 38, carbs: 2, fat: 20 }
    },
    {
        id: 4, name: 'Творожная запеканка кето', description: 'Нежная запеканка без муки',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 35, dietTypes: 1, cuisine: 'Европейская',
        imageUrl: 'img/recipe/zapekanka.jpg',
        ingredients: 'Творог 500г, Яйца 4 шт, Сливочное масло 50г, Разрыхлитель 1 ч.л., Ванилин, Соль',
        instructions: `Подготовьте творог правильно. Выложите творог в миску и протрите через сито или измельчите блендером до однородной кремовой консистенции. Это уберет комочки и сделает запеканку нежной и воздушной! Комковатый творог даст плотную текстуру.

Отделите белки от желтков. Аккуратно разделите 4 яйца на белки и желтки. Белки взбейте в пышную пену до устойчивых пиков — они должны держать форму и не вытекать из миски при переворачивании!

Смешайте желтки с творогом. Желтки взбейте с щепоткой соли до побеления, затем добавьте к творогу. Влейте растопленное сливочное масло, добавьте ванилин и разрыхлитель. Тщательно перемешайте до однородности.

Добавьте белки. Аккуратно введите взбитые белки в творожную массу движениями снизу вверх, как при приготовлении бисквита. Не переусердствуйте — сохраните воздушность!

Выложите в форму. Смажьте форму для выпекания сливочным маслом и присыпьте кокосовой мукой или миндальной. Аккуратно вылейте тесто и разровняйте поверхность.

Выпекайте до золотистого цвета. Разогрейте духовку до 180°C и выпекайте 30-35 минут. Запеканка должна подняться и зарумяниться сверху, но оставаться слегка влажной внутри.

Остудите перед подачей. Достаньте из духовки и дайте остыть 10-15 минут в форме — тогда ее легче нарезать! Подавайте со сметаной или ягодами.`,
        totalNutrition: { calories: 280, protein: 28, carbs: 3, fat: 18 }
    },
    {
        id: 5, name: 'Салат с тунцом и яйцом', description: 'Белковый салат для кето-диеты',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Средиземноморская',
        imageUrl: 'img/recipe/salat_s_tuncom.jpg',
        ingredients: 'Тунец консервированный 200г, Яйца 2 шт, Салат 100г, Оливковое масло 30мл, Лимон 1/2, Оливки 50г',
        instructions: `Сварите яйца правильно. Положите яйца в холодную воду и доведите до кипения. Варите 8-10 минут для варки вкрутую, затем сразу переложите в ледяную воду — это остановит приготовление и предотвратит появление серо-зеленого кольца вокруг желтка!

Подготовьте тунец. Слейте жидкость из консервы с тунцом. Разберите рыбу на крупные кусочки вилкой, удалив крупные косточки, если есть. Тунец должен быть мягким и влажным, но не водянистым.

Вымойте и подготовьте салат. Листья салата тщательно промойте в холодной воде и обсушите — влажные листья сделают заправку водянистой! Порвите листья руками на крупные кусочки, не нарезайте ножом — рваные края выглядят аппетитнее.

Приготовьте заправку. В небольшой пиале смешайте оливковое масло со свежевыжатым лимонным соком, добавьте соль и перец по вкусу. Взбейте вилкой до легкого загустения.

Соберите салат. В глубокой миске выложите листья салата. Сверху разложите кусочки тунца, нарезанные дольки вареных яйц и оливки. Аккуратно полейте заправкой перед подачей!

Подавайте немедленно. Перемешайте салат непосредственно перед едой, чтобы листья оставались хрустящими. Этот салат — отличный вариант для плотного обеда или ужина!`,
        totalNutrition: { calories: 320, protein: 36, carbs: 4, fat: 18 }
    },
    {
        id: 6, name: 'Фаршированные шампиньоны', description: 'Вкусная закуска на кето',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Европейская',
        imageUrl: 'img/recipe/farshirovanni_shampinioni.jpg',
        ingredients: 'Шампиньоны 400г, Фарш индейки 200г, Лук 1/2, Чеснок 2 зубчика, Сыр 100г, Оливковое масло',
        instructions: `Выберите правильные шампиньоны. Для фаршировки выбирайте крупные грибы с целой, гладкой шляпкой — маленькие сложно наполнить! Грибы должны быть свежими, без темных пятен и неприятного запаха.

Подготовьте шампиньоны. Аккуратно очистите грибы влажной тканью — не мойте их! Отделите ножки от шляпок, осторожно вращая ножку. Удалите ножки и мелко нарежьте — они добавят вкуса начинке!

Приготовьте начинку. На сковороде разогрейте оливковое масло, обжарьте мелко нарезанный лук до прозрачности. Добавьте фарш индейки и жарьте, разминая комочки, до готовности. Добавьте измельченные ножки грибов и чеснок, посолите и поперчите. Снимите с огня и дайте остыть.

Наполните шампиньоны. Разложите шляпки грибов на застеленный пергаментом противень. Ложкой или кондитерским мешком равномерно распределите начинку в каждую шляпку — начинка должна возвышаться горкой!

Посыпьте сыром. Натрите сыр на крупной терке и обильно посыпьте каждый фаршированный гриб. Сыр при запекании расплавится и создаст аппетитную золотистую корочку!

Запекайте до готовности. Разогрейте духовку до 190°C. Выпекайте 15-20 минут, пока сыр не расплавится и не зарумянится, а начинка не прогреется полностью.

Подавайте горячими или теплыми. Выложите на тарелку и украсьте свежей зеленью. Подавайте сразу — остывшие грибы теряют часть вкуса!`,
        totalNutrition: { calories: 220, protein: 24, carbs: 4, fat: 12 }
    },
    {
        id: 7, name: 'Кето-стейк из говядины', description: 'Сочный стейк с овощами',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'img/recipe/steik_iz_goviadini.jpg',
        ingredients: 'Говядина 400г, Сливочное масло 40г, Розмарин, Чеснок, Соль, перец, Брокколи 200г',
        instructions: `Выберите правильный стейк. Для кето-диеты идеален стейк с мраморностью — прожилки жира делают мясо сочным и невероятно вкусным! Подойдет рибай или стриплой. Достаньте мясо из холодильника за 30 минут до приготовления — оно должно быть комнатной температуры!

Подготовьте стейк. Обсушите мясо бумажными полотенцами — это критически важно для образования хрустящей корочки! Посолите и поперчите с обеих сторон, втирая специи руками. Оставьте на 15-20 минут при комнатной температуре.

Приправьте розмарином и чесноком. Свежий розмарин и зубчики чеснока закладываются в сковороду для аромата. Если используете сухой розмарин — просто посыпьте мясо.

Разогрейте сковороду. Сильно нагрейте сковороду (лучше всего чугунную) с оливковым маслом до появления легкого дымка. Масло должно сильно шипеть, когда вы капнете воды!

Обжарьте первую сторону. Выложите стейк и НЕ ТРОГАЙТЕ его 3-4 минуты — это даст идеальную корочку. Переверните только тогда, когда низ свободно отходит от сковороды.

Переверните и добавьте масло. Переверните стейк, уменьшите огонь до среднего. Добавьте сливочное масло, розмарин и чеснок. Поливайте стейк растопленным маслом ложкой — это называется бастирование и делает мясо невероятно сочным!

Доведите до нужной прожарки. Обжарьте вторую сторону 3-4 минуты для medium-rare. Выньте мясо, накройте фольгой и дайте отдохнуть 5 минут — это важно для redistribution соков!

Приготовьте брокколи на пару. Пока стейк отдыхает, приготовьте брокколи на пару или обжарьте на сковороде с чесноком и маслом. Подавайте стейк, нарезанный поперек волокон, с гарниром из брокколи.`,
        totalNutrition: { calories: 520, protein: 48, carbs: 6, fat: 34 }
    },
    {
        id: 8, name: 'Яичница с беконом', description: 'Классический американский завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'img/recipe/bacon_i_egg.jpg',
        ingredients: 'Яйца 3 шт, Бекон 80г, Сливочное масло 15г, Зеленый лук, Соль, перец',
        instructions: `Выберите правильный бекон. Для идеальной яичницы выберите бекон с хорошей мраморностью — чередующиеся полоски мяса и жира дадут насыщенный вкус и хрустящую текстуру! Нарежьте бекон на удобные кусочки или оставьте ломтиками.

Обжарьте бекон до хруста. Выложите бекон на холодную сковороду — это важно! Постепенно нагреваясь, бекон равномерно обжарится и отдаст жир. Готовьте на среднем огне, переворачияя, until золотистый и хрустящий. Выложите на бумажные полотенца, чтобы стек лишний жир.

Используйте жир от бекона. На этой же сковороде, в оставшемся жиру, жарьте яйца — это придаст им невероятный копченый вкус! Если жира мало, добавьте немного сливочного масла.

Разбейте яйца в сковороду. Аккуратно разбейте каждое яйцо в отдельную мисочку, затем вылейте в сковороду. Посолите и поперчите по вкусу. Готовьте на среднем огне.

Выберите степень готовности. Для глазуньи с жидким желтком готовьте 2-3 минуты, накрыв крышкой. Для полностью прожаренной — переверните лопаткой и готовьте еще 1 минуту.

Соберите блюдо. Выложите хрустящий бекон на тарелку. Сверху или рядом разместите яичницу. Посыпьте мелко нарезанным зеленым луком для свежести и яркого цвета.

Подавайте немедленно. Яичница с беконом лучше всего в горячем виде, пока яйца еще слегка жидкие, а бекон хрустящий! Добавьте тосты из низкоуглеводного хлеба, если хотите.`,
        totalNutrition: { calories: 450, protein: 28, carbs: 2, fat: 36 }
    },
    {
        id: 9, name: 'Суп-пюре из цветной капусты', description: 'Нежный крем-суп без углеводов',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 1, cuisine: 'Французская',
        imageUrl: 'img/recipe/sup_pure_iz_cvetnoi_kapusti.jpg',
        ingredients: 'Цветная капуста 1 кг, Сливочное масло 50г, Сливки 200мл, Куриный бульон 500мл, Чеснок 3 зубчика, Соль, мускатный орех',
        instructions: `Подготовьте цветную капусту. Разберите капусту на соцветия — они должны быть примерно одинакового размера для равномерного приготовления! Тщательно промойте в холодной воде, удалив все загрязнения. Обсушите — лишняя вода разбавит суп!

Отварите капусту до мягкости. В большой кастрюле доведите куриный бульон до кипения. Добавьте соцветия цветной капусты и варите 15-20 минут, until они полностью мягкие и легко прокалываются вилкой.

Обжарьте чеснок для аромата. Пока капуста варится, растопите сливочное масло в отдельной сковороде. Добавьте измельченный чеснок и обжаривайте 1-2 минуты, until ароматный, но не подгоревший! Чеснок добавит глубину вкуса.

Измельчите суп блендером. Слейте часть бульона в отдельную миску — он может понадобиться для регулирования консистенции! Добавьте обжаренный чеснок с маслом. Погружным блендером измельтите до однородного пюре. Для шелковистой текстуры протрите через сито!

Добавьте сливки и приправы. Верните кастрюлю на огонь, влейте сливки и перемешайте. Добавьте щепотку мускатного ореха — это классическое сочетание с цветной капустой! Посолите по вкусу.

Доведите до готовности. Нагрейте суп на среднем огне, не доводя до кипения — сливки могут свернуться! Суп должен быть горячим, но не кипящим.

Подавайте с гарнирами. Разлейте по тарелкам. Добавьте хрустящие тыквенные семечки или тертый пармезан сверху. Можно добавить веточку свежей зелени для красоты! Подавайте с низкоуглеводным хлебом или отдельно.`,
        totalNutrition: { calories: 180, protein: 8, carbs: 8, fat: 14 }
    },
    {
        id: 10, name: 'Лосось в кокосовом молоке', description: 'Азиатский кето-рецепт',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Азиатская',
        imageUrl: 'img/recipe/losos_v_moloke.jpg',
        ingredients: 'Лосось 400г, Кокосовое молоко 200мл, Имбирь 30г, Чеснок 2 зубчика, Кинза, Кокосовое масло 30мл, Соль, перец',
        instructions: `Подготовьте лосось правильно. Нарежьте филе лосося на порционные кусочки размером около 3-4 см. Промойте и обсушите бумажными полотенцами — это важно для хорошей обжарки! Посолите и поперчите с обеих сторон. Оставьте при комнатной температуре на 10-15 минут.

Подготовьте ароматные ингредиенты. Очистите и мелко нарежьте имбирь — для этого рецепта нужен свежий имбирь, не молотый! Чеснок нарежьте тонкими пластинками. Свежую кинзу промойте и обсушите — она понадобится для украшения.

Разогрейте сковороду для рыбы. На среднем огне разогрейте кокосовое масло until оно полностью растопится и станет ароматным. Кокосовое масло идеально подходит для азиатской кухни!

Обжарьте имбирь и чеснок. Выложите имбирь и чеснок в горячее масло. Обжаривайте 30-60 секунд, until ароматный — не дайте им подгореть! Аромат должен быть ярким и пряным.

Добавьте лосося. Выложите кусочки лосося в сковороду. Обжарьте 2-3 минуты до золотистой корочки с одной стороны — не переворачивайте раньше времени! Затем аккуратно переверните.

Влейте кокосовое молоко. Влейте кокосовое молоко в сковороду — оно должно покрыть рыбу примерно наполовину. Уменьшите огонь до минимума. Добавьте щепотку соли и перца по вкусу.

Тушите до готовности. Накройте сковороду крышкой и тушите 10-15 минут, пока лосось полностью не приготовится. Кокосовое молоко станет более густым и ароматным. Рыба должна быть нежной и легко разделяться на хлопья.

Подавайте с кинзой. Выложите лосося на тарелку, полейте соусом из сковороды. Украсьте свежей кинзой и долькой лайма. Это блюдо отлично сочетается с рисом или овощами на пару!`,
        totalNutrition: { calories: 440, protein: 38, carbs: 4, fat: 30 }
    },

    // VEGAN - 10 recipes (dietTypes: 2)
    {
        id: 11, name: 'Веганский бургер', description: 'Растительный бургер с нута',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 20, dietTypes: 2, cuisine: 'Американская',
        imageUrl: 'img/recipe/vaegan_burger.jpg',
        ingredients: 'Нут 400г, Овсяные хлопья 50г, Лук 1, Чеснок 3 зубчика, Паприка 1 ч.л., Кумкум 1/2 ч.л., Мука 50г, Растительное масло',
        instructions: `Подготовьте нут правильно. Если используете сырой нут — замочите его на ночь, затем отварите до мягкости. Консервированный нут просто слейте и промойте. Вареный нут должен быть мягким, но не разваливаться!

Обжарьте лук и чеснок. На сковороде разогрейте растительное масло, добавьте мелко нарезанный лук. Обжаривайте до золотистого цвета — это займет 5-7 минут. Добавьте измельченный чеснок и готовьте еще 1 минуту, until ароматный!

Измельчите основу бургера. Выложите нут в чашу блендера или кухонный комбайн. Добавьте обжаренный лук с чесноком, овсяные хлопья, паприку и кумкум. Измельчите до однородной массы — должны получиться небольшие кусочки, не пюре!

Приправьте и сформируйте котлеты. Посолите и поперчите по вкусу. Переложите массу в миску, добавьте муку для связывания. Сформируйте 4 котлеты одинакового размера — около 1 см толщиной. Слегка приплюсните — так они равномерно прожарятся!

Обжарьте до золотистой корочки. Разогрейте сковороду с растительным маслом. Выложите котлеты и готовьте 4-5 минут до золотистой корочки. Переверните и обжарьте с другой стороны еще 4-5 минут. Внутри должны прогреться!

Подготовьте булочки и начинки. Разрежьте булочки для бургеров пополам. Подогрейте, if desired. Подготовьте начинки: салатные листья, помидоры, лук, веганский майонез, горчицу.

Соберите бургер. На нижнюю половину булочки выложите зелень, котлету, овощи и соусы. Накройте верхней половиной. Подавайте с картофелем фри или овощным салатом!`,
        totalNutrition: { calories: 280, protein: 12, carbs: 42, fat: 8 }
    },
    {
        id: 12, name: 'Салат с киноа и авокадо', description: 'Полезный салат с овощами',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 2, cuisine: 'Средиземноморская',
        imageUrl: 'img/recipe/salat_s_kinoa_i_avokado.jpg',
        ingredients: 'Киноа 150г, Авокадо 1, Помидоры черри 150г, Огурец 1, Лимон 1/2, Оливковое масло 30мл, Кинза, Соль',
        instructions: `Подготовьте киноа правильно. Промойте киноа в холодной воде — это удалит горечь! Затем залейте свежей водой в пропорции 1:2 и варите на среднем огне 15 минут until вода полностью впитается. Снимите с огня, накройте крышкой и оставьте на 5 минут.

Остудите киноа. Готовую киноа выложите в миску и дайте полностью остыть — теплая киноа сделает салат мягким! Можно ускорить процесс, выложив на тарелку тонким слоем.

Подготовьте авокадо. Выберите спелый авокадо — мягкий при легком нажатии. Разрежьте пополам, удалите косточку. Нарежьте мякоть кубиками или ломтиками. Сбрызните лимонным соком — это предотвратит потемнение!

Нарежьте овощи. Помидоры черри разрежьте пополам — так они выглядят аппетитнее! Огурец нарежьте полукружьями или кубиками. Если используете обычный огурец — можно не чистить.

Приготовьте заправку. В небольшой пиале смешайте оливковое масло, свежевыжатый лимонный сок, мелко нарезанную кинзу, соль и перец. Взбейте вилкой до однородности.

Соберите салат. В большой миске аккуратно перемешайте остывшую киноа с нарезанными овощами. Добавьте авокадо — добавляйте в последнюю очередь, чтобы не помять!

Полейте заправкой и подавайте. Непосредственно перед подачей полейте салат заправкой и аккуратно перемешайте. Разложите по тарелкам и украсьте веточкой кинзы. Этот салат — идеальный легкий обед или ужин!`,
        totalNutrition: { calories: 380, protein: 10, carbs: 45, fat: 18 }
    },
    {
        id: 13, name: 'Веганский карри', description: 'Ароматное индийское блюдо',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 30, dietTypes: 2, cuisine: 'Индийская',
        imageUrl: 'img/recipe/vegan_karri.jpg',
        ingredients: 'Нут 400г, Кокосовое молоко 400мл, Карри порошок 2 ст.л., Помидоры 300г, Лук 1, Чеснок 4 зубчика, Имбирь 30г, Шпинат 200г',
        instructions: `Подготовьте нут правильно. Если используете консервированный нут — слейте жидкость и промойте. Если сухой — замочите на ночь и отварите до мягкости. Готовый нут должен легко раздавливаться между пальцами!

Подготовьте овощи. Лук нарежьте мелкими кубиками — так он равномерно обжарится. Чеснок измельчите или нарежьте тонкими пластинками. Имбирь очистите и натрите на мелкой терке — свежий имбирь дает яркий аромат!

Обжарьте лук до карамелизации. На среднем огне разогрейте растительное масло в глубокой сковороде или кастрюле. Добавьте лук и обжаривайте 5-7 минут до золотистого цвета — это основа вкуса!

Добавьте чеснок и имбирь. Выложите чеснок и имбирь к луку. Обжаривайте 1-2 минуты, until ароматный, постоянно помешивая — не дайте им подгореть! Аромат должен быть пряным и ярким.

Добавьте специи и нут. Всыпьте порошок карри и хорошо перемешайте — специи должны равномерно покрыть лук. Добавьте нут и перемешайте, чтобы он покрылся ароматной смесью.

Влейте кокосовое молоко и добавьте помидоры. Нарежьте помидоры кубиками или используйте консервированные в собственном соку. Влейте кокосовое молоко, перемешайте. Доведите до кипения.

Тушите до готовности. Уменьшите огонь и тушите 15-20 минут, пока соус загустеет, а нут полностью пропитается ароматами. Периодически помешивайте, чтобы не пригорело!

Добавьте шпинат. Вымойте шпинат и добавьте в кастрюлю в последние 5 минут. Перемешайте — шпинат уменьшится в объеме. Посолите по вкусу, добавьте щепотку куркумы для цвета.

Подавайте с рисом или нааном. Разложите карри по тарелкам. Подавайте горячим с отварным рисом басмати или свежим хлебом наан. Это сытное и согревающее блюдо!`,
        totalNutrition: { calories: 340, protein: 14, carbs: 42, fat: 14 }
    },
    {
        id: 14, name: 'Тофу с овощами на сковороде', description: 'Быстрое и сытное блюдо',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 20, dietTypes: 2, cuisine: 'Азиатская',
        imageUrl: 'img/recipe/tofu_i_vegetables.jpg',
        ingredients: 'Тофу 400г, Брокколи 200г, Морковь 1, Болгарский перец 1, Соевый соус 30мл, Кунжутное масло 20мл, Чеснок 3 зубчика',
        instructions: `Подготовьте тофу правильно. Для этого блюда выберите твердый тофу — он лучше держит форму при жарке! Нарежьте тофу кубиками размером около 2 см. Аккуратно промокните бумажными полотенцами — сухой тофу получит более хрустящую корочку!

Обжарьте тофу до золотистой корочки. Разогрейте кунжутное масло в сковороде вок или большой сковороде. Выложите тофу в один слой — не перегружайте сковороду! Обжарьте 3-4 минуты до золотистой корочки, then переверните и обжарьте с другой стороны. Выложите на тарелку.

Подготовьте овощи. Брокколи разберите на небольшие соцветия — так они приготовятся равномерно! Морковь нарежьте тонкими полукружьями or julienne. Болгарский перец очистите от семян и нарежьте полосками.

Обжарьте овощи. В сковороде, где жарился тофу, добавьте немного кунжутного масла. Выложите морковь и брокколи — готовьте на сильном огне 3-4 минуты, постоянно помешивая, чтобы овощи оставались хрустящими!

Добавьте чеснок и перец. Добавьте измельченный чеснок и болгарский перец. Обжаривайте еще 1-2 минуты, пока чеснок не станет ароматным, but not коричневый!

Соедините тофу и овощи. Верните обжаренный тофу в сковороду к овощам. Влейте соевый соус и хорошо перемешайте — соус должен равномерно покрыть все ингредиенты!

Подавайте горячим. Разложите блюдо по тарелкам. По желанию посыпьте кунжутом и нарезанным зеленым луком. Это отличный ужин или обед! Подавайте с рисом или лапшой.`,
        totalNutrition: { calories: 280, protein: 18, carbs: 16, fat: 16 }
    },
    {
        id: 15, name: 'Веганский суп с чечевицей', description: 'Сытный и полезный суп',
        servings: 6, prepTimeMinutes: 15, cookTimeMinutes: 35, dietTypes: 2, cuisine: 'Индийская',
        imageUrl: 'img/recipe/sup_iz_chechevici.jpg',
        ingredients: 'Чечевица красная 300г, Морковь 2, Лук 1, Сельдерей 2 стебля, Чеснок 4 зубчика, Овощной бульон 1.5л, Куркума 1 ч.л., Зелень',
        instructions: `Подготовьте чечевицу. Красная чечевица не требует замачивания — просто промойте её в холодной воде до прозрачной воды. Это займет всего пару минут! Убедитесь, что нет камней or мусора.

Подготовьте овощи. Морковь нарежьте кубиками or полукружьями — так она красивее смотрится в супе! Лук мелко нарежьте. Сельдерей нарежьте небольшими кусочками. Чеснок измельчите or нарежьте пластинками.

Обжарьте лук и морковь. В большой кастрюле разогрейте оливковое масло на среднем огне. Добавьте лук и обжаривайте 3-4 минуты до прозрачности. Добавьте морковь и сельдерей, готовьте еще 3 минуты.

Добавьте чеснок и специи. Выложите чеснок к овощам, обжаривайте 30 секунд until ароматный. Всыпьте куркуму и перемешайте — она даст красивый золотистый цвет и теплый аромат!

Добавьте чечевицу и бульон. Всыпьте промытую чечевицу в кастрюлю. Залейте овощным бульоном — он должен покрыть ингредиенты! Перемешайте.

Варите до готовности. Доведите до кипения, затем уменьшите огонь и варите 25-30 минут, пока чечевица полностью не разварится. Периодически помешивайте и снимайте пену.

Приправьте и подавайте. Посолите по вкусу в конце варки. Разлейте по тарелкам и украсьте свежей зеленью — кинзой, петрушкой or укропом. Этот суп сытный и согревающий!`,
        totalNutrition: { calories: 180, protein: 12, carbs: 30, fat: 2 }
    },
    {
        id: 16, name: 'Овсянка с ягодами и орехами', description: 'Энергетический завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 2, cuisine: 'Европейская',
        imageUrl: 'img/recipe/ovsianka_s_yagodami_i_orexami.jpg',
        ingredients: 'Овсяные хлопья 80г, Миндальное молоко 250мл, Черника 80г, Грецкие орехи 30г, Кленовый сироп 1 ст.л., Корица',
        instructions: `Подготовьте ингредиенты. Начните сразу — этот завтрак готовится быстро! Овсяные хлопья высыпьте в кастрюлю. Если используете овсянку быстрого приготовления — время варки будет меньше.

Влейте молоко. Добавьте миндальное молоко в кастрюлю с овсянкой — можно использовать и обычное молоко or воду. Перемешайте, чтобы хлопья равномерно распределились.

Варите овсянку. Поставьте на средний огонь и доведите до кипения, постоянно помешивая. Затем уменьшите огонь до минимума и варите 5-7 минут, пока овсянка не станет густой и кремовой. Если используете овсянку быстрого приготовления — достаточно 2-3 минут!

Добавьте корицу. За минуту до готовности добавьте щепотку корицы — она придаст теплый аромат и сделает вкус более насыщенным. Перемешайте.

Подготовьте топпинги. Пока варится овсянка, подготовьте начинки: грецкие орехи порубите крупными кусочками. Ягоды промойте и обсушите — if using frozen, заранее разморозьте.

Соберите блюдо. Готовую овсянку выложите в глубокую тарелку. Сверху выложите чернику и грецкие орехи. Полейте кленовым сиропом — он идеально подходит к овсянке!

Подавайте немедленно. Овсянка лучше всего в теплом виде, пока орехи ещё хрустящие! Этот завтрак зарядит энергией на весь день. Приятного аппетита!`,
        totalNutrition: { calories: 380, protein: 10, carbs: 52, fat: 14 }
    },
    {
        id: 17, name: 'Веганские роллы с овощами', description: 'Свежие и легкие роллы',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 0, dietTypes: 2, cuisine: 'Азиатская',
        imageUrl: 'img/recipe/vegan_roll.jpg',
        ingredients: 'Рисовая бумага 8 листов, Тофу 200г, Огурец 1, Морковь 1, Авокадо 1, Рис 150г, Соевый соус',
        instructions: `Приготовьте рис для роллов. Промойте рис в холодной воде до прозрачной воды. Залейте свежей водой в пропорции 1:1.5 и варите 15-20 минут until мягкий. Готовый рис должен быть слегка липким. Остудите до комнатной температуры.

Подготовьте начинки. Тофу нарежьте тонкими полосками — около 5 мм шириной. Огурец нарежьте тонкими длинными полосками. Морковь натрите на терке for julienne or нарежьте тонкими полосками. Авокадо нарежьте тонкими ломтиками.

Подготовьте рабочую станцию. Наполните миску or большую тарелку теплой водой — она должна быть чуть теплой, not горячей! Положите рядом чистую разделочную доску и подготовленные ингредиенты.

Замочите рисовую бумагу. Опустите один лист рисовой бумаги в теплую воду на 10-15 секунд — она должна стать мягкой and pliable, but not слишком мягкой! Выложите на влажное полотенце.

Сверните ролл. На нижнюю треть листа выложите небольшое количество риса — примерно 2 столовые ложки. Сверху положите полоски тофу, огурца, моркови и авокадо. Не переусердствуйте с начинкой!

Заверните ролл. Поднимите нижний край рисовой бумаги over начинку. Затем загните боковые края внутрь и continue rolling until полностью свернутый. Сильно не затягивайте — рисовая бумага может порваться!

Повторите для остальных роллов. Таким же образом сверните remaining 7 роллов. Если рисовая бумага высыхает — сбрызгивайте водой.

Подавайте с соусом. Разложите роллы на тарелке. Подавайте с соевым соусом, Optionally с васаби and маринованным имбирем. Роллы лучше есть сразу!`,
        totalNutrition: { calories: 260, protein: 10, carbs: 44, fat: 6 }
    },
    {
        id: 18, name: 'Банановий смузи с арахисовой пастой', description: 'Протеиновый коктейль',
        servings: 2, prepTimeMinutes: 5, cookTimeMinutes: 0, dietTypes: 2, cuisine: 'Американская',
        imageUrl: 'img/recipe/banana_smuzi.jpg',
        ingredients: 'Банан 2, Миндальное молоко 400мл, Арахисовая паста 2 ст.л., Шпинат 50г, Семена чиа 1 ст.л., Лед',
        instructions: `Подготовьте бананы. Используйте спелые бананы с коричневыми пятнышками — они самые сладкие! Очистите бананы и нарежьте кружочками — так они лучше смешаются в блендере. Если бананы замороженные — используйте их directly!

Подготовьте остальные ингредиенты. Налейте миндальное молоко в блендер — оно делает смузи шелковистым! Добавьте арахисовую пасту — выбирайте натуральную, без добавленного сахара. Если она слишком густая — немного подогрейте.

Добавьте зелень и семена. Положите шпинат — он добавит питательные вещества, но не изменит вкус! Добавьте семена чиа — они богаты омега-3 и сделают смузи более сытным. Семена чиа предварительно замочите в воде на 10 минут!

Взбейте все ингредиенты. Закройте крышку блендера и взбивайте на высокой скорости 1-2 минуты, until гладкий и однородный. Если смузи слишком густой — добавьте еще молока. If слишком жидкий — добавьте льда!

Добавьте лед по желанию. Если любите освежающий смузи — добавьте несколько кубиков льда и взбейте еще раз. Лед сделает текстуру более легкой и воздушной!

Перелейте и подавайте. Разлейте смузи по стаканам. По желанию украсьте дольками банана, посыпьте кокосовой стружкой or добавить сверху еще немного арахисовой пасты для красоты!

Пейте сразу. Смузи лучше всего свежим — через 30 минут он начнет темнеть. Это идеальный завтрак or перекус после тренировки!`,
        totalNutrition: { calories: 320, protein: 10, carbs: 42, fat: 14 }
    },
    {
        id: 19, name: 'Запеченный батат с фасолью', description: 'Полезный обед',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 35, dietTypes: 2, cuisine: 'Мексиканская',
        imageUrl: 'img/recipe/batat_s_fasoli.jpg',
        ingredients: 'Батат 2 крупных, Черная фасоль 300г, Помидоры 2, Лук 1, Чеснок 3 зубчика, Кинза, Лайм 1, Перец чили',
        instructions: `Подготовьте батат. Вымойте батат щеткой — кожуру можно не очищать! Нарежьте батат вдоль пополам or на четвертинки. Сбрызните оливковым маслом, посолите и поперчите. Разложите на противне кожурой вниз.

Запекайте батат. Разогрейте духовку до 200°C. Запекайте 25-35 минут until мягкий — проверьте вилкой, он должен легко прокалываться! Кожура должна стать слегка хрустящей and подрумяниться.

Пока батат запекается, приготовьте фасоль. Если используете сухую фасоль — предварительно отварите до мягкости. Консервированную фасоль просто слейте и промойте. Фасоль должна быть мягкой but не разваливаться!

Приготовьте овощную смесь. Лук нарежьте полукольцами. Помидоры нарежьте кубиками. Чеснок измельчите. Перец чили мелко нарежьте — добавьте по вкусу, сколько любите!

Обжарьте фасоль с овощами. На сковороде разогрейте масло. Обжарьте лук до мягкости — 3-4 минуты. Добавьте чеснок и перец чили, готовьте 1 минуту. Добавьте фасоль и помидоры, перемешайте. Готовьте 5-7 минут, пока помидоры не станут мягкими.

Соберите блюдо. Достаньте батат из духовки. Аккуратно разрежьте, if целый. Выложите на каждую половину щедрую порцию фасоли. Сверху посыпьте свежей кинзой!

Подавайте с лаймом. Выжмите сок лайма сверху перед подачей — он добавит свежести! По желанию добавьте сметану or гуакамоле. Это сытное и полезное блюдо!`,
        totalNutrition: { calories: 380, protein: 14, carbs: 68, fat: 4 }
    },
    {
        id: 20, name: 'Веганский рагу', description: 'Овощное рагу с горошком',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 30, dietTypes: 2, cuisine: 'Европейская',
        imageUrl: 'img/recipe/vegan_ragu.jpg',
        ingredients: 'Картофель 3, Морковь 2, Горошек 200г, Лук 1, Чеснок 4 зубчика, Помидоры 3, Овощной бульон 300мл, Тимьян',
        instructions: `Подготовьте овощи. Картофель очистите и нарежьте кубиками — примерно 2 см. Морковь также нарежьте кубиками or полукружьями. Лук мелко нарежьте. Чеснок измельчите. Помидоры нарежьте кубиками — if используете консервированные, просто слейте жидкость.

Обжарьте лук и чеснок. В большой кастрюле разогрейте оливковое масло на среднем огне. Добавьте лук и обжаривайте 4-5 минут до мягкости и прозрачности. Добавьте чеснок, готовьте 1 минуту, until ароматный!

Добавьте морковь и картофель. Выложите морковь и картофель в кастрюлю. Перемешайте, чтобы овощи покрылись маслом с луком. Обжаривайте 5 минут, периодически помешивая.

Добавьте помидоры и бульон. Выложите нарезанные помидоры в кастрюлю. Влейте овощной бульон — он должен почти покрыть овощи! Добавьте тимьян, соль и перец по вкусу.

Тушите до готовности. Уменьшите огонь до минимума, накройте крышкой и тушите 20-25 минут, пока картофель и морковь не станут мягкими. Периодически помешивайте, чтобы не пригорело!

Добавьте горошек. За 5 минут до готовности добавьте зеленый горошек — он должен остаться ярким и слегка хрустящим! Если используете замороженный — добавляйте не размораживая.

Подавайте горячим. Разложите рагу по тарелкам. По желанию украсьте свежей зеленью — петрушкой or укропом. Это сытное и согревающее блюдо! Подавайте с хлебом or как самостоятельное блюдо.`,
        totalNutrition: { calories: 220, protein: 8, carbs: 42, fat: 2 }
    },

    // VEGETARIAN - 10 recipes (dietTypes: 4)
    {
        id: 21, name: 'Творожная запеканка с изюмом', description: 'Классический рецепт',
        servings: 6, prepTimeMinutes: 20, cookTimeMinutes: 45, dietTypes: 4, cuisine: 'Русская',
        imageUrl: 'img/recipe/zapekanka_s_izumom.jpg',
        ingredients: 'Творог 600г, Яйца 3 шт, Сахар 100г, Манка 80г, Изюм 80г, Ванилин, Сметана 100г',
        instructions: `Подготовьте творог правильно. Выложите творог в глубокую миску — лучше использовать творог средней жирности, около 5-9%! Он должен быть однородным, без крупных комков. Если творог слишком влажный — откиньте на дуршлаг на 15-20 минут.

Протрите творог через сито. Это важный шаг для нежной текстуры! Протрите творог через мелкое сито — так уйдут комочки и запеканка будет воздушной. Можно также использовать блендер для однородности.

Добавьте яйца и сахар. Разбейте яйца в творог, добавьте сахар и ванилин. Тщательно перемешайте вилкой or миксером до однородной массы. Сахар должен полностью раствориться!

Добавьте манку. Всыпьте манку и перемешайте — она впитает лишнюю влагу и свяжет тесто. Оставьте тесто на 10-15 минут, чтобы манка набухла!

Подготовьте изюм. Промойте изюм в теплой воде, затем замочите на 10 минут until он станет мягким. Обсушите на бумажном полотенце. Добавьте изюм в тесто и перемешайте.

Подготовьте форму. Смажьте форму для выпекания сливочным маслом и присыпьте манкой or панировочными сухарями — so запеканка не прилипнет! Выложите тесто в форму и разровняйте поверхность.

Смажьте сметаной. Равномерно нанесите сметану на поверхность запеканки — это создаст аппетитную румяную корочку! По желанию посыпьте сахаром.

Запекайте до золотистого цвета. Разогрейте духовку до 180°C. Выпекайте 40-45 минут until верх станет золотистым и запеканка будет держать форму. Внутри должна остаться слегка влажной!

Остудите перед подачей. Достаньте из духовки и дайте остыть 10-15 минут в форме — так её легче нарезать! Нарежьте на порционные кусочки. Подавайте со сметаной, вареньем or ягодами!`,
        totalNutrition: { calories: 280, protein: 18, carbs: 36, fat: 8 }
    },
    {
        id: 22, name: 'Омлет с грибами и сыром', description: 'Завтрак для вегетарианцев',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 12, dietTypes: 4, cuisine: 'Французская',
        imageUrl: 'img/recipe/omlet_s_gribami.jpg',
        ingredients: 'Яйца 4 шт, Шампиньоны 150г, Сыр 80г, Молоко 50мл, Сливочное масло 20г, Зелень, Соль, перец',
        instructions: `Подготовьте грибы правильно. Шампиньоны промойте в холодной воде и обсушите — лишняя влага сделает омлет водянистым! Нарежьте грибы тонкими ломтиками — так они быстрее приготовятся и равномерно распределятся.

Обжарьте грибы до золотистости. На сковороде разогрейте сливочное масло until оно начнет пениться. Выложите грибы в один слой — не перегружайте сковороду! Обжаривайте 3-4 минуты до золотистого цвета, затем переверните. Готовые грибы выложите на тарелку.

Взбейте яйца для омлета. В глубокой миске взбейте яйца с молоком, солью и перцем. Молоко делает омлет нежным и воздушным! Взбивайте вилкой or венчиком until масса станет однородной, около 1 минуты.

Разогрейте сковороду для омлета. На чистой сковороде растопите немного сливочного масла. Масло должно полностью покрыть дно тонким слоем!

Вылейте яйца в сковороду. Аккуратно влейте взбитую яичную массу. Готовьте на среднем огне 1-2 минуты, пока края не начнут схватываться. Не перемешивайте — пусть омлет формируется!

Добавьте грибы и сыр. Выложите обжаренные грибы на одну половину омлета. Посыпьте тертым сыром — он должен равномерно распределиться. Накройте крышкой на 1-2 минуты, пока сыр расплавится.

Сложите и подавайте. Аккуратно сложите омлет пополам лопаткой, закрывая начинку. Переложите на тарелку. Украсьте свежей зеленью — укропом, петрушкой or зеленым луком. Подавайте немедленно, пока горячий!`,
        totalNutrition: { calories: 340, protein: 22, carbs: 4, fat: 26 }
    },
    {
        id: 23, name: 'Сырники классические', description: 'Пышные сырники с сметаной',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 4, cuisine: 'Русская',
        imageUrl: 'img/recipe/sirniki.jpg',
        ingredients: 'Творог 400г, Яйцо 1, Мука 100г, Сахар 30г, Ванилин, Растительное масло, Сметана для подачи',
        instructions: `Выберите правильный творог. Для пышных сырников нужен не слишком влажный и не слишком сухой творог! 5-9% жирности — идеально. Если творог очень влажный, оставьте его в дуршлаге на 30 минут, чтобы стекла лишняя сыворотка.

Протрите творог через сито. Это ключевой шаг для нежной текстуры! Протрите творог через мелкое сито или измельчите блендером — так уйдут комочки и сырники будут однородными и воздушными!

Добавьте яйцо и сахар. Разбейте яйцо в творог, добавьте сахар и ванилин. Тщательно перемешайте до однородности. Попробуйте на сладость — тесто должно быть слегка сладковатым!

Добавьте муку. Всыпьте муку и замесите мягкое, слегка липкое тесто. Муки нужно ровно столько, чтобы тесто держало форму, but not too much — иначе сырники будут плотными! Если тесто жидкое, добавьте еще муки.

Сформируйте сырники. Смочите руки водой, чтобы тесто не прилипало. Возьмите немного теста и скатайте шарик размером с грецкий орех. Затем слегка приплюсните, формируя оваллую котлетку. Выложите на доску, присыпанную мукой.

Разогрейте сковороду правильно. Налейте растительное масло слоем около 5 мм. Разогрейте на среднем огне — масло должно слегка шипеть, but not smoking! Слишком горячее масло сожжет сырники снаружи, while inside останется сырым.

Обжарьте до золотистой корочки. Выложите сырники в масло. Готовьте 2-3 минуты до золотистой корочки снизу — сырники должны легко отделяться от сковороды! Аккуратно переверните и обжарьте с другой стороны еще 2-3 минуты.

Подавайте со сметаной. Готовые сырники выложите на бумажные полотенца, чтобы впитать лишнее масло. Подавайте горячими со сметаной, вареньем или медом. Это идеальный завтрак!`,
        totalNutrition: { calories: 290, protein: 18, carbs: 32, fat: 10 }
    },
    {
        id: 24, name: 'Лазанья с овощами', description: 'Итальянская классика',
        servings: 6, prepTimeMinutes: 30, cookTimeMinutes: 40, dietTypes: 4, cuisine: 'Итальянская',
        imageUrl: 'img/recipe/lasaniaga.jpg',
        ingredients: 'Листы лазаньи 250г, Помидоры 400г, Кабачки 2, Баклажан 1, Рикотта 300г, Моцарелла 200г, Базилик, Оливковое масло',
        instructions: `Подготовьте овощи для лазаньи. Кабачки и баклажан нарежьте тонкими кружочками — около 5 мм толщиной! Посолите овощи и оставьте на 15 минут, чтобы вышла горечь. Затем обсушите бумажными полотенцами.

Приготовьте томатный соус. На сковороде обжарьте измельченный чеснок на оливковом масле до аромата. Добавьте нарезанные помидоры, соль, перец и базилик. Тушите 15-20 минут until соус загустеет. Отставьте в сторону.

Приготовьте начинку с рикоттой. В миске смешайте рикотту с нарезанным свежим базиликом, солью и перцем. Рикотта должна быть комнатной температуры — так она лучше смешивается!

Подготовьте форму для запекания. Смажьте форму оливковым маслом. На дно налейте немного томатного соуса — это предотвратит прилипание лазаньи!

Соберите лазанью слоями. Начните с листов лазаньи (если используете не готовые — отварите по инструкции). Затем выложите слой овощей — кабачки и баклажаны чередуйте. Далее — слой рикотты с базиликом. Полейте томатным соусом и посыпьте тертой моцареллой!

Повторите слои. Таким же образом соберите еще 1-2 слоя, depending on размера формы. Закончите слоем томатного соуса и обильно посыпьте моцареллой сверху!

Запекайте до золотистой корочки. Разогрейте духовку до 190°C. Запекайте 35-40 минут, пока сыр не расплавится и не станет золотистым, а края лазаньи не станут хрустящими!

Дайте отдохнуть перед подачей. Достаньте из духовки и оставьте на 10 минут — это важно, чтобы слои держались при нарезании! Нарежьте на порционные кусочки и подавайте с листьями базилика.`,
        totalNutrition: { calories: 380, protein: 18, carbs: 42, fat: 14 }
    },
    {
        id: 25, name: 'Греческий салат', description: 'Освежающий средиземноморский салат',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 0, dietTypes: 4, cuisine: 'Греческая',
        imageUrl: 'img/recipe/grecheskii_salat.jpg',
        ingredients: 'Огурец 2, Помидоры 3, Перец болгарский 1, Красный лук 1/2, Фета 200г, Оливки 100г, Оливковое масло 50мл, Орегано',
        instructions: `Подготовьте овощи правильно. Вымойте все овощи в холодной воде. Огурец нарежьте полукружьями — не слишком тонко, чтобы сохранился хруст! Помидоры нарежьте крупными дольками или кусочками произвольной формы — так салат выглядит аппетитнее!

Нарежьте перец и лук. Болгарский перец очистите от семян и нарежьте крупными полосками — они должны быть заметны в салате! Красный лук нарежьте тонкими полукольцами — он добавит пикантности и яркий цвет. If desired, замочите лук в ледяной воде на 10 минут, чтобы смягчить остроту.

Подготовьте фету. Нарежьте фету крупными кубиками — около 2 см. Не измельчайте слишком мелко! Фета должна быть комнатной temperature — холодный сыр менее ароматный. Если фета слишком соленая, замочите ее в воде на 15 минут.

Соберите салат. В большой миске аккуратно перемешайте огурцы, помидоры, перец и лук. Добавьте оливки — используйте целые или разрезанные пополам. Выложите кубики феты сверху — не перемешивайте, чтобы сыр не раскрошился!

Приготовьте заправку. В отдельной пиале смешайте оливковое масло первого отжима с щепоткой орегано, солью и перцем. Можно добавить немного лимонного сока для свежести! Взбейте вилкой до легкого загустения.

Полейте салат заправкой. Непосредственно перед подачей полейте салат заправкой. Аккуратно перемешайте, стараясь не раздавить помидоры и не раскрошить фету слишком сильно!

Подавайте сразу. Греческий салат лучше всего в свежем виде, пока овощи хрустящие! Подавайте как самостоятельное блюдо или с подсушенным хлебом. Это идеальный летний салат для легкого обеда!`,
        totalNutrition: { calories: 280, protein: 10, carbs: 12, fat: 22 }
    },
    {
        id: 26, name: 'Рататуй', description: 'Прованское овощное рагу',
        servings: 4, prepTimeMinutes: 25, cookTimeMinutes: 45, dietTypes: 4, cuisine: 'Французская',
        imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=400',
        ingredients: 'Баклажан 1, Кабачок 1, Помидоры 4, Перец болгарский 2, Лук 1, Чеснок 4 зубчика, Тимьян, Оливковое масло',
        instructions: 'Нарежьте овощи тонкими кружочками. Выложите в форму слоями: помидоры, кабачок, баклажан, перец. Посыпьте чесноком и тимьяном, полейте маслом. Запекайте при 190°C 45 минут.',
        totalNutrition: { calories: 180, protein: 4, carbs: 20, fat: 10 }
    },
    {
        id: 27, name: 'Вегетарианская пицца', description: 'Домашняя пицца с овощами',
        servings: 4, prepTimeMinutes: 30, cookTimeMinutes: 20, dietTypes: 4, cuisine: 'Итальянская',
        imageUrl: 'img/recipe/vefeterian_pizza.jpg',
        ingredients: 'Мука 250г, Дрожжи 7г, Помидоры 200г, Моцарелла 200г, Болгарский перец 1, Грибы 150г, Оливки 50г, Базилик',
        instructions: `Приготовьте тесто для пиццы. В глубокой миске смешайте муку с дрожжами и щепоткой соли. Влейте теплую воду и замесите эластичное тесто. Месите 5-7 минут until гладкое and не липнет к рукам!

Дайте тесту подойти. Сформируйте из теста шар, накройте полотенцем и оставьте в теплом месте на 1 час. Тесто должно увеличиться в twice volume!

Подготовьте овощи для начинки. Помидоры нарежьте тонкими кружочками. Болгарский перец очистите от семян и нарежьте полосками. Грибы нарежьте пластинками. Оливки разрежьте пополам.

Приготовьте томатный соус. Протрите помидоры через сило or измельчите в блендере. Добавьте соль, перец, орегано и базилик. Соус должен быть густым!

Растяните тесто. Подошедшее тесто растяните руками на присыпанной мукой поверхности. Формируйте круглую основу толщиной около 5 мм. Переложите на противень с пергаментом!

Соберите пиццу. Смажьте тесто томатным соусом, оставляя небольшие бортики. Выложите помидоры, затем грибы, перец и оливки. Посыпьте щедро тертой моцареллой — она должна покрыть всю поверхность!

Выпекайте до готовности. Разогрейте духовку до 220°C. Выпекайте 15-20 минут until края станут золотистыми, а сыр полностью расплавится и слегка подрумянится!

Дайте отдохнуть и подавайте. Достаньте пиццу из духовки и оставьте на 2-3 минуты — так её легче нарезать! украсьте свежими листьями базилика. Нарежьте на порционные кусочки и подавайте горячей!`,
        totalNutrition: { calories: 380, protein: 16, carbs: 48, fat: 12 }
    },
    {
        id: 28, name: 'Яичница с шпинатом', description: 'Полезный завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 8, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'img/recipe/egg_with_shpinat.jpg',
        ingredients: 'Яйца 3 шт, Шпинат 100г, Помидор черри 5 шт, Сливочное масло 15г, Соль, перец',
        instructions: `Подготовьте шпинат правильно. Вымойте шпинат в холодной воде — особенно тщательно, если используете свежий! Обсушите на бумажных полотенцах — лишняя влага сделает яичницу водянистой. Крупные листья можно порвать руками.

Подготовьте помидоры. Помидоры черри разрежьте пополам — так они быстрее приготовятся и будут красиво смотреться в блюде! Если используете обычные помидоры — нарежьте дольками.

Разогрейте сковороду. На среднем огне разогрейте сливочное масло until оно полностью растает и начнет пениться. Масло должно покрыть все дно тонким слоем!

Обжарьте шпинат. Выложите шпинат в горячее масло. Готовьте 1-2 минуты, постоянно помешивая, until шпинат уменьшится в объеме и станет мягким. Посолите слегка!

Добавьте помидоры. Выложите половинки помидоров черри к шпинату. Готовьте 1 минуту, пока они слегка размягчатся, but не разваливаются!

Вбейте яйца. Аккуратно сделайте углубления в овощах и разбейте яйца в них — так они будут красиво выглядеть! Посолите и поперчите по вкусу. Если любите — можно предварительно взбить яйца и вылить на сковороду.

Готовьте до желаемой готовности. Накройте сковороду крышкой и готовьте 3-5 минут, until белки полностью схватятся, а желтки останутся слегка жидкими для runny yolk! Или перемешайте для полностью прожаренной яичницы.

Подавайте немедленно. Снимите сковороду с огня и сразу подавайте — яичница лучше всего горячей! украсьте свежей зеленью по желанию. Это полезный и сытный завтрак!`,
        totalNutrition: { calories: 290, protein: 18, carbs: 6, fat: 22 }
    },
    {
        id: 29, name: 'Фаршированные перцы', description: 'Рис с овощами в перцах',
        servings: 4, prepTimeMinutes: 25, cookTimeMinutes: 40, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'img/recipe/farshirovanni_perci.jpg',
        ingredients: 'Болгарские перцы 4, Рис 150г, Морковь 1, Лук 1, Помидоры 2, Чеснок 2 зубчика, Сметана 150г, Зелень',
        instructions: `Подготовьте перцы. Выберите крупные, мясистые перцы — они лучше фаршируются! Разрежьте каждый перец пополам or удалите верхушку like "шапочка". Аккуратно удалите семена и перегородки inside — используйте нож or ложку.

Приготовьте рис. Промойте рис в холодной воде до прозрачной воды. Отварите в подсоленной воде until мягкий, but не разваривайте! Готовый рис должен быть слегка al dente. Остудите.

Подготовьте овощную начинку. Лук нарежьте мелкими кубиками. Морковь натрите на терке. Обжарьте лук и морковь на растительном масле until мягкие — около 5 минут. Добавьте измельченный чеснок, готовьте 1 минуту.

Смешайте рис и овощи. В миске соедините остывший рис с обжаренными овощами. Добавьте мелко нарезанные помидоры or томатную пасту. Посолите, поперчите, добавьте специи по вкусу. Хорошо перемешайте!

Нафаршируйте перцы. Начините каждый перец рисовой начинкой — утрамбуйте плотно, but не до верха, since рис расширится при готовке! Если отрезали "шапочки" — используйте их как крышечки.

Выложите в форму. Смажьте форму для запекания растительным маслом. Выложите перцы вертикально, плотно друг к другу. Сверху полейте сметаной — она создаст вкусный соус!

Запекайте до мягкости. Разогрейте духовку до 190°C. Запекайте 35-40 минут, until перцы станут мягкими и слегка подрумянятся, а начинка прогреется. Поливайте перцы соусом из формы during запекания!

Подавайте горячими. Достаньте из духовки, дайте немного остыть. украсьте свежей зеленью. Подавайте как самостоятельное блюдо or с сметаной. Это сытное и красивое блюдо!`,
        totalNutrition: { calories: 240, protein: 8, carbs: 38, fat: 6 }
    },
    {
        id: 30, name: 'Картофельная запеканка', description: 'Сытное блюдо с сыром',
        servings: 6, prepTimeMinutes: 25, cookTimeMinutes: 45, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'img/recipe/patato_zapekenka.jpg',
        ingredients: 'Картофель 1кг, Яйца 3 шт, Сметана 200г, Сыр 200г, Лук 1, Чеснок 2 зубчика, Сливочное масло 50г',
        instructions: `Подготовьте картофель правильно. Очистите картофель и нарежьте тонкими кружочками — около 5 мм толщиной! Чем тоньше нарежете, тем быстрее приготовится запеканка. Залейте холодной водой на 10 минут, чтобы убрать лишний крахмал.

Отварите картофель до полуготовности. В кипящей подсоленной воде варите нарезанный картофель 5-7 минут — он должен быть почти готовым, but still slightly firm! Слейте воду и дайте остыть.

Приготовьте заливку. В глубокой миске взбейте яйца со сметаной until однородной массы. Добавьте щепотку соли и перца. Сметана делает запеканку невероятно сочной and кремовой!

Подготовьте форму и слои. Смажьте форму для запекания сливочным маслом. Выложите слой картофеля — кружочки должны немного перекрывать друг друга. Посыпьте нарезанным луком!

Добавьте сыр и повторите слои. Посыпьте слой картофеля тертым сыром — используйте любой твердый сыр, какой любите! Повторяйте слои, пока не закончится картофель. Последний слой должен быть сырным!

Залейте яичной смесью. Равномерно полейте запеканку яично-сметанной смесью — она должна просочиться through все слои! По желанию посыпьте сверху еще сыром.

Запекайте до золотистой корочки. Разогрейте духовку до 180°C. Выпекайте 30-35 минут, until верх станет золотистым and bubbly, а картофель полностью приготовится!

Дайте отдохнуть перед подачей. Достаньте из духовки и оставьте на 10 минут — это важно, чтобы запеканка держала форму при нарезании! Нарежьте на порционные кусочки и подавайте горячей!`,
        totalNutrition: { calories: 320, protein: 14, carbs: 32, fat: 16 }
    },

    // GLUTEN FREE - 10 recipes (dietTypes: 8)
    {
        id: 31, name: 'Куриная грудка с овощами', description: 'Диетическое блюдо без глютена',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 8, cuisine: 'Азиатская',
        imageUrl: 'img/recipe/chick_with_broccoli.jpg',
        ingredients: 'Куриная грудка 400г, Брокколи 200г, Морковь 1, Болгарский перец 1, Соевый соус (без глютена) 30мл, Чеснок 3 зубчика, Оливковое масло',
        instructions: `Подготовьте куриную грудку. Нарежьте куриную грудку небольшими кусочками — примерно 2-3 см. Промойте и обсушите бумажными полотенцами — сухая курица лучше обжаривается! Посолите и поперчите.

Приправьте курицу. По желанию добавьте специи — паприку, имбирь or куркуму. Перемешайте, чтобы специи равномерно покрыли каждый кусочек. Оставьте мариноваться на 10-15 минут.

Обжарьте курицу до золотистости. Разогрейте оливковое масло в сковороде вок or большой сковороде на сильном огне. Выложите курицу в один слой — не перегружайте! Обжарьте 3-4 минуты до золотистой корочки, then переверните. Готовую курицу выложите на тарелку.

Подготовьте овощи. Брокколи разберите на небольшие соцветия. Морковь нарежьте тонкими полосками or кружочками. Болгарский перец очистите от семян и нарежьте полосками.

Обжарьте овощи. В сковороде, где жарилась курица, добавьте немного масла. Выложите морковь и брокколи — готовьте на сильном огне 3-4 минуты, постоянно помешивая! Овощи должны remain хрустящими!

Добавьте чеснок и курицу. К овощам добавьте измельченный чеснок, готовьте 30 секунд. Верните обжаренную курицу в сковороду. Перемешайте!

Заправьте соевым соусом. Влейте соевый соус without глютена — убедитесь, что на этикетке нет пшеницы! Перемешайте, чтобы соус равномерно покрыл все ингредиенты. Готовьте еще 1-2 минуты.

Подавайте горячей. Разложите по тарелкам. По желанию украсьте кунжутом и зеленым луком. Это полезное and сытное блюдо — отлично подходит для обеда or ужина!`,
        totalNutrition: { calories: 320, protein: 42, carbs: 14, fat: 12 }
    },
    {
        id: 32, name: 'Лосось с спаржей', description: 'Рыба с овощами на пару',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 8, cuisine: 'Скандинавская',
        imageUrl: 'img/recipe/losos_so_spargei.jpg',
        ingredients: 'Лосось 400г, Спаржа 300г, Лимон 1, Чеснок 2 зубчика, Оливковое масло 30мл, Укроп, Соль, перец',
        instructions: `Подготовьте лосось правильно. Филе лосося промойте и обсушите бумажными полотенцами. Если есть кости — удалите их пинцетом! Нарежьте на порционные стейки or оставьте целым филе. Посолите и поперчите с обеих сторон.

Подготовьте спаржу. Срежьте woody концы спаржи — около 2-3 см от низа. Если спаржа толстая — можно слегка очистить кожицу. Промойте и обсушите. Сбрызните оливковым маслом и перемешайте.

Выложите на противень. Застелите противень пергаментной бумагой. Разложите спаржу в один слой — она должна лежать ровно, not друг на друге! Сверху or рядом выложите лосось.

Приготовьте ароматное масло. В пиале смешайте оливковое масло с измельченным чесноком, нарезанным укропом, солью и перцем. Хорошо перемешайте — это будет вкусная заправка!

Полейте рыбу и спаржу. Аккуратно полейте лосось и спаржу приготовленным маслом. Если хотите — выложите дольки лимона рядом для свежести and аромата!

Запекайте до готовности. Разогрейте духовку до 200°C. Запекайте 15-18 минут, until лосось станет непрозрачным and легко разделяется на хлопья, а спаржа станет мягкой but still хрустящей!

Добавьте лимон при подаче. Выньте противень из духовки. Выжмите свежий лимонный сок сверху на лосось — это добавит свежести! украсьте веточкой свежего укропа. Подавайте немедленно, пока горячее!`,
        totalNutrition: { calories: 380, protein: 40, carbs: 8, fat: 22 }
    },
    {
        id: 33, name: 'Гречка с курицей', description: 'Классический безглютеновый рецепт',
        servings: 3, prepTimeMinutes: 10, cookTimeMinutes: 30, dietTypes: 8, cuisine: 'Русская',
        imageUrl: 'img/recipe/grechka_s_kuriceq.jpg',
        ingredients: 'Гречка 200г, Куриная грудка 400г, Лук 1, Морковь 1, Чеснок 2 зубчика, Растительное масло, Зелень',
        instructions: `Подготовьте гречку правильно. Промойте гречку в холодной воде — это уберет лишний крахмал и горечь! В кастрюле вскипятите подсоленную воду (1:2). Всыпьте гречку, перемешайте.

Сварите гречку до готовности. Доведите до кипения, затем уменьшите огонь до минимума. Варите 15-20 минут until вода полностью впитается, а гречка станет мягкой but still рассыпчатой! Снимите с огня, накройте крышкой и оставьте на 5 минут.

Пока гречка варится, подготовьте курицу. Нарежьте куриную грудку небольшими кусочками — примерно 2-3 см. Промойте и обсушите. Посолите и поперчите по вкусу.

Обжарьте курицу. На сковороде разогрейте растительное масло. Выложите курицу и обжаривайте на среднем огне 5-7 минут до золотистой корочки со всех сторон. Кусочки должны be fully готовы inside! Выложите курицу на тарелку.

Обжарьте овощи. На той же сковороде, в оставшемся масле, обжарьте нарезанный лук до золотистого цвета — 3-4 минуты. Добавьте натертую на терке морковь, готовьте еще 3 минуты until мягкая.

Добавьте чеснок и курицу. К овощам добавьте измельченный чеснок, готовьте 30 секунд. Верните курицу в сковороду. Перемешайте!

Соедините с гречкой. Готовую курицу с овощами выложите в кастрюлю с гречкой. Добавьте мелко нарезанную свежую зелень — укроп, петрушку or зеленый лук. Аккуратно перемешайте!

Подавайте горячей. Разложите по тарелкам. По желанию добавьте еще зелени сверху. Это сытное and полезное блюдо — идеально для обеда!`,
        totalNutrition: { calories: 420, protein: 35, carbs: 45, fat: 10 }
    },

    // GLUTEN FREE - 10 recipes (dietTypes: 8)
    {
        id: 31, name: 'Куриная грудка с овощами', description: 'Диетическое блюдо без глютена',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 8, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
        ingredients: 'Куриная грудка 400г, Брокколи 200г, Морковь 1, Болгарский перец 1, Соевый соус (без глютена) 30мл, Чеснок 3 зубчика, Оливковое масло',
        instructions: 'Курицу нарежьте, обжарьте до готовности. Добавьте овощи, жарьте 8 минут. Заправьте соевым соусом с чесноком.',
        totalNutrition: { calories: 320, protein: 42, carbs: 14, fat: 12 }
    },
    {
        id: 32, name: 'Лосось с спаржей', description: 'Рыба с овощами на пару',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 8, cuisine: 'Скандинавская',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        ingredients: 'Лосось 400г, Спаржа 300г, Лимон 1, Чеснок 2 зубчика, Оливковое масло 30мл, Укроп, Соль, перец',
        instructions: 'Лосось посолите, поперчите. Выложите на противень со спаржей. Полейте маслом с чесноком, украсите лимоном и укропом. Запекайте при 200°C 18 минут.',
        totalNutrition: { calories: 380, protein: 40, carbs: 8, fat: 22 }
    },
    {
        id: 33, name: 'Гречка с курицей', description: 'Классический безглютеновый рецепт',
        servings: 3, prepTimeMinutes: 10, cookTimeMinutes: 30, dietTypes: 8, cuisine: 'Русская',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
        ingredients: 'Гречка 200г, Куриная грудка 400г, Лук 1, Морковь 1, Чеснок 2 зубчика, Растительное масло, Зелень',
        instructions: 'Гречку отварите. Курицу нарежьте, обжарьте с луком и морковью. Смешайте с гречкой, добавьте чеснок и зелень.',
        totalNutrition: { calories: 380, protein: 38, carbs: 36, fat: 8 }
    },
    {
        id: 34, name: 'Салат с тунцом без глютена', description: 'Легкий и сытный салат',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 0, dietTypes: 8, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: 'Тунец консервированный 250г, Салат 150г, Помидоры 2, Огурец 1, Оливковое масло 40мл, Лимон 1/2',
        instructions: 'Салат порвите руками. Нарежьте овощи. Смешайте с тунцом. Заправьте маслом с лимонным соком.',
        totalNutrition: { calories: 280, protein: 32, carbs: 10, fat: 14 }
    },
    {
        id: 35, name: 'Рис с овощами и яйцом', description: 'Азиатское блюдо без глютена',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 20, dietTypes: 8, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        ingredients: 'Рис 200г, Яйца 3 шт, Горошек 100г, Морковь 1, Лук 1, Чеснок 3 зубчика, Соевый соус (GF) 30мл, Кунжутное масло',
        instructions: 'Рис отварите. Яйца пожарьте, нарежьте. Обжарьте овощи, добавьте рис и яйца. Заправьте соусом и маслом.',
        totalNutrition: { calories: 360, protein: 14, carbs: 52, fat: 10 }
    },
    {
        id: 36, name: 'Куриные котлеты без муки', description: 'Домашние котлеты',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 25, dietTypes: 8, cuisine: 'Русская',
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        ingredients: 'Куриный фарш 600г, Лук 1, Чеснок 3 зубчика, Яйцо 1, Соль, перец, Панировка (кукурузная мука)',
        instructions: 'Фарш смешайте с луком, чесноком, яйцом, специями. Сформируйте котлеты, обваляйте в кукурузной муке. Обжарьте на среднем огне до готовности.',
        totalNutrition: { calories: 280, protein: 32, carbs: 8, fat: 14 }
    },
    {
        id: 37, name: 'Овощной суп без глютена', description: 'Легкий и полезный суп',
        servings: 6, prepTimeMinutes: 15, cookTimeMinutes: 30, dietTypes: 8, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        ingredients: 'Картофель 3, Морковь 2, Кабачок 1, Лук 1, Сельдерей 2 стебля, Чеснок 3 зубчика, Зелень, Растительное масло',
        instructions: 'Нарежьте все овощи. В кастрюле обжарьте лук и чеснок. Добавьте овощи, залейте водой. Варите 25 минут до готовности.',
        totalNutrition: { calories: 120, protein: 3, carbs: 22, fat: 2 }
    },
    {
        id: 38, name: 'Тефтели из индейки', description: 'Сочные тефтели в томатном соусе',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 30, dietTypes: 8, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
        ingredients: 'Фарш индейки 600г, Лук 1, Чеснок 2 зубчика, Рис 100г, Яйцо 1, Помидоры 300г, Соль, перец',
        instructions: 'Смешайте фарш с рисом, луком, чесноком, яйцом. Сформируйте тефтели. Обжарьте, добавьте помидоры, тушите 25 минут.',
        totalNutrition: { calories: 300, protein: 28, carbs: 22, fat: 12 }
    },
    {
        id: 39, name: 'Салат Цезарь без глютена', description: 'Классический салат с курицей',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 8, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
        ingredients: 'Куриная грудка 250г, Салат романо 200г, Пармезан 50г, Помидоры черри 100г, Оливковое масло 40мл, Лимон 1/2, Чеснок',
        instructions: 'Курицу обжарьте, нарежьте. Салат порвите, добавьте нарезанную курицу, помидоры, тертый пармезан. Заправьте маслом с лимоном и чесноком.',
        totalNutrition: { calories: 340, protein: 36, carbs: 8, fat: 20 }
    },
    {
        id: 40, name: 'Запеченная рыба с лимоном', description: 'Диетическая рыба',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 25, dietTypes: 8, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
        ingredients: 'Филе рыбы (дорадо) 400г, Лимон 1, Чеснок 3 зубчика, Оливковое масло 40мл, Розмарин, Соль, перец',
        instructions: 'Рыбу посолите, поперчите. Выложите на противень с дольками лимона и чесноком. Полейте маслом, посыпьте розмарином. Запекайте при 200°C 25 минут.',
        totalNutrition: { calories: 280, protein: 38, carbs: 4, fat: 14 }
    },

    // LOW CARB - 10 recipes (dietTypes: 32)
    {
        id: 41, name: 'Курица с брокколи на сковороде', description: 'Быстрое низкоуглеводное блюдо',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 32, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
        ingredients: 'Куриная грудка 400г, Брокколи 300г, Чеснок 4 зубчика, Соевый соус 30мл, Кунжутное масло 20мл, Имбирь 20г',
        instructions: 'Курицу нарежьте, обжарьте до готовности. Отдельно обжарьте брокколи с чесноком и имбирем. Смешайте, заправьте соусом.',
        totalNutrition: { calories: 320, protein: 44, carbs: 10, fat: 14 }
    },
    {
        id: 42, name: 'Свинина с овощами', description: 'Мясо с цветной капустой',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 32, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
        ingredients: 'Свинина 500г, Цветная капуста 400г, Лук 1, Чеснок 3 зубчика, Оливковое масло 40мл, Розмарин, Соль, перец',
        instructions: 'Свинину нарежьте, обжарьте. Добавьте лук и цветную капусту (можно пюре). Готовьте 20 минут, приправьте розмарином.',
        totalNutrition: { calories: 380, protein: 38, carbs: 12, fat: 22 }
    },
    {
        id: 43, name: 'Яичный низкоуглеводный хлеб', description: 'Замена хлебу на диете',
        servings: 6, prepTimeMinutes: 10, cookTimeMinutes: 30, dietTypes: 32, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        ingredients: 'Яйца 6 шт, Сыр 150г, Миндальная мука 50г, Разрыхлитель 1 ч.л., Соль, перец, Зелень',
        instructions: 'Яйца взбейте, добавьте тертый сыр, муку, разрыхлитель, зелень. Вылейте в форму. Выпекайте при 180°C 30 минут.',
        totalNutrition: { calories: 180, protein: 14, carbs: 3, fat: 13 }
    },
    {
        id: 44, name: 'Рыба с зеленой фасолью', description: 'Белковый обед',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 32, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        ingredients: 'Филе белой рыбы 400г, Стручковая фасоль 300г, Помидоры черри 150г, Чеснок 3 зубчика, Оливковое масло 40мл, Лимон',
        instructions: 'Фасоль отварите 5 минут. Рыбу обжарьте, добавьте фасоль, помидоры, чеснок. Готовьте 10 минут, выжмите лимон.',
        totalNutrition: { calories: 300, protein: 38, carbs: 10, fat: 14 }
    },
    {
        id: 45, name: 'Творог с зеленью и огурцом', description: 'Низкоуглеводный перекус',
        servings: 2, prepTimeMinutes: 5, cookTimeMinutes: 0, dietTypes: 32, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        ingredients: 'Творог 300г, Огурец 1, Укроп 30г, Зеленый лук 20г, Чеснок 1 зубчик, Соль, перец',
        instructions: 'Творог разомните. Огурец нарежьте кубиками. Смешайте творог с зеленью, чесноком, огурцом. Посолите, поперчите.',
        totalNutrition: { calories: 180, protein: 22, carbs: 6, fat: 8 }
    },
    {
        id: 46, name: 'Куриные бедра в духовке', description: 'Хрустящая курица без углеводов',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 40, dietTypes: 32, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
        ingredients: 'Куриные бедра 800г, Паприка 1 ст.л., Чеснок 4 зубчика, Оливковое масло 30мл, Розмарин, Тимьян, Соль',
        instructions: 'Бедра натрите специями и маслом. Выложите на противень. Запекайте при 200°C 40 минут до золотистой корочки.',
        totalNutrition: { calories: 340, protein: 36, carbs: 4, fat: 20 }
    },
    {
        id: 47, name: 'Салат с говядиной', description: 'Мясной салат',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 32, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: 'Говядина 300г, Салат 150г, Помидоры 2, Огурец 1, Красный лук 1/2, Соевый соус 30мл, Кунжутное масло 20мл',
        instructions: 'Говядину обжарьте, нарежьте тонко. Овощи нарежьте. Смешайте все, заправьте соусом и маслом.',
        totalNutrition: { calories: 340, protein: 36, carbs: 10, fat: 18 }
    },
    {
        id: 48, name: 'Омлет с лососем', description: 'Завтрак с рыбой',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 12, dietTypes: 32, cuisine: 'Скандинавская',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: 'Яйца 4 шт, Лосось копченый 150г, Сливочное масло 20г, Укроп, Соль, перец',
        instructions: 'Яйца взбейте. На сковороде растопите масло, вылейте яйца. Выложите нарезанный лосось, посыпьте укропом. Готовьте под крышкой.',
        totalNutrition: { calories: 380, protein: 30, carbs: 2, fat: 28 }
    },
    {
        id: 49, name: 'Фаршированные кабачки', description: 'Лодочки с фаршем',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 35, dietTypes: 32, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=400',
        ingredients: 'Кабачки 4, Фарш куриный 400г, Лук 1, Помидоры 2, Чеснок 3 зубчика, Сыр 100г, Зелень',
        instructions: 'Кабачки разрежьте пополам, удалите мякоть. Фарш обжарьте с луком, добавьте помидоры. Начините кабачки, посыпьте сыром. Запекайте при 190°C 35 минут.',
        totalNutrition: { calories: 260, protein: 28, carbs: 10, fat: 12 }
    },
    {
        id: 50, name: 'Креветки с чесночным маслом', description: 'Изысканное низкоуглеводное блюдо',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 10, dietTypes: 32, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
        ingredients: 'Креветки 400г, Сливочное масло 60г, Чеснок 6 зубчиков, Петрушка 30г, Лимон 1/2, Перец чили',
        instructions: 'Креветки очистите. На сковороде растопите масло, обжарьте чеснок и чили. Добавьте креветки, жарьте 3 минуты. Выжмите лимон, посыпьте петрушкой.',
        totalNutrition: { calories: 340, protein: 32, carbs: 4, fat: 24 }
    }
];

// Use local recipes database
function loadRecipes() {
    recipes = recipesDatabase;
    renderRecipes(recipes);
}


function renderRecipes(recipesToRender) {
    const dietLabels = { 1: 'Кето', 2: 'Веган', 4: 'Вегетарианское', 8: 'Безглютен', 32: 'Низкоуглеводное' };
    
    document.getElementById('recipesGrid').innerHTML = recipesToRender.map(r => {
        const nutrition = r.totalNutrition || {};
        const calories = nutrition.calories || r.totalCalories || 0;
        const protein = nutrition.protein || r.totalProtein || 0;
        const carbs = nutrition.carbs || r.totalCarbs || 0;
        const fat = nutrition.fat || r.totalFat || 0;
        
        const recipeImage = getRecipeImage(r.name) || r.imageUrl || '';
        
        return `
        <div class="recipe-card" onclick="addRecipeToMeal(${r.id})">
            ${recipeImage ? `<div class="recipe-image" style="background-image: url('${recipeImage}')"></div>` : '<div class="recipe-image-placeholder"></div>'}
            <div class="recipe-content">
                <h3 class="recipe-name">${r.name}</h3>
                <div class="recipe-info">
                    <span>⏱️ ${(r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0)} мин</span>
                    <span>🍽️ ${r.servings || 1} порц.</span>
                </div>
                <div class="recipe-nutrition">
                    <div class="nutrition-item">
                        <div class="nutrition-value">${Math.round(calories)}</div>
                        <div class="nutrition-label">ккал</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${Math.round(protein)}</div>
                        <div class="nutrition-label">белок</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${Math.round(carbs)}</div>
                        <div class="nutrition-label">угл</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${Math.round(fat)}</div>
                        <div class="nutrition-label">жир</div>
                    </div>
                </div>
                <div class="recipe-tags">
                    ${Object.entries(dietLabels).filter(([k, v]) => (r.dietTypes & parseInt(k)) === parseInt(k)).map(([k, v]) => `<span class="recipe-tag">${v}</span>`).join('')}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function filterRecipes(type, btn) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    
    const dietTypes = { 'keto': 1, 'vegan': 2, 'vegetarian': 4, 'glutenfree': 8, 'lowcarb': 32 };
    
    if (type === 'all') {
        renderRecipes(recipes);
    } else {
        const filtered = recipes.filter(r => (r.dietTypes & dietTypes[type]) === dietTypes[type]);
        renderRecipes(filtered);
    }
}

function searchRecipes() {
    const query = document.getElementById('recipeSearch').value.toLowerCase();
    const filtered = recipes.filter(r => r.name.toLowerCase().includes(query) || r.description?.toLowerCase().includes(query));
    renderRecipes(filtered);
}

function addRecipeToMeal(recipeId) {
    openRecipeDetailModal(recipeId);
}

// Products Page
function renderProductsPage(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = productsToRender.map(p => {
        const name = p.name || p.Name || 'Без названия';
        const calories = p.caloriesPer100g || p.CaloriesPer100g || 0;
        const protein = p.proteinPer100g || p.ProteinPer100g || 0;
        const carbs = p.carbsPer100g || p.CarbsPer100g || 0;
        const fat = p.fatPer100g || p.FatPer100g || 0;
        const category = p.category || p.Category || '';
        
        return `
        <div class="product-card" onclick="addProductToMeal('${name}', ${calories}, ${protein}, ${carbs}, ${fat}, 100)">
            <div class="product-image-placeholder"></div>
            <div class="product-card-header">
                <span class="product-category">${category}</span>
            </div>
            <div class="product-card-name">${name}</div>
            <div class="product-card-nutrition">
                <div class="nutrition-mini">
                    <span class="nutrition-cal">${Math.round(calories)}</span>
                    <span class="nutrition-label">ккал</span>
                </div>
                <div class="nutrition-mini">
                    <span>Б: ${Math.round(protein)}</span>
                </div>
                <div class="nutrition-mini">
                    <span>У: ${Math.round(carbs)}</span>
                </div>
                <div class="nutrition-mini">
                    <span>Ж: ${Math.round(fat)}</span>
                </div>
            </div>
                <button class="btn-add-product" onclick="event.stopPropagation(); openProductDetailModal('${name.replace(/'/g, "\\'")}', ${calories}, ${protein}, ${carbs}, ${fat}, '${category.replace(/'/g, "\\'")}')">+ Добавить</button>
        </div>
        `;
    }).join('');
}

function filterProducts(category, btn) {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    
    if (!btn.closest('#page-products')) return;
    
    if (category === 'all' || !category) {
        renderProductsPage(allFoods);
    } else {
        const filtered = allFoods.filter(f => (f.category || f.Category) === category);
        renderProductsPage(filtered);
    }
}

function searchProductsPage() {
    const query = document.getElementById('productSearchPage').value.toLowerCase();
    const filtered = allFoods.filter(f => (f.name || f.Name).toLowerCase().includes(query));
    renderProductsPage(filtered);
}

let selectedProductDetail = null;

function openProductDetailModal(name, calories, protein, carbs, fat, category) {
    selectedProductDetail = { name, calories, protein, carbs, fat, category };
    
    document.getElementById('productDetailName').textContent = name;
    document.getElementById('productDetailCategory').textContent = category;
    document.getElementById('productDetailCalories').textContent = calories;
    document.getElementById('productDetailProtein').textContent = protein;
    document.getElementById('productDetailCarbs').textContent = carbs;
    document.getElementById('productDetailFat').textContent = fat;
    document.getElementById('productDetailGrams').value = 100;
    document.getElementById('totalGrams').textContent = 100;
    document.getElementById('totalCalories').textContent = calories;
    document.getElementById('totalProtein').textContent = protein;
    document.getElementById('totalCarbs').textContent = carbs;
    document.getElementById('totalFat').textContent = fat;
    
    const detailImg = document.getElementById('productDetailImage');
    detailImg.style.display = 'none';
    
    document.getElementById('productDetailModal').classList.add('active');
}

function closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.remove('active');
}

function updateProductDetailNutrition() {
    if (!selectedProductDetail) return;
    
    const gramsInput = document.getElementById('productDetailGrams');
    if (!gramsInput) return;
    
    const grams = parseFloat(gramsInput.value) || 100;
    const ratio = grams / 100;
    
    document.getElementById('totalGrams').textContent = grams;
    document.getElementById('totalCalories').textContent = Math.round(selectedProductDetail.calories * ratio);
    document.getElementById('totalProtein').textContent = Math.round(selectedProductDetail.protein * ratio);
    document.getElementById('totalCarbs').textContent = Math.round(selectedProductDetail.carbs * ratio);
    document.getElementById('totalFat').textContent = Math.round(selectedProductDetail.fat * ratio);
}

function addProductDetailToMeal() {
    if (!selectedProductDetail) return;
    
    const grams = parseFloat(document.getElementById('productDetailGrams').value) || 100;
    const ratio = grams / 100;
    
    const entry = {
        productId: Date.now(),
        productName: selectedProductDetail.name,
        grams: grams,
        calories: selectedProductDetail.calories * ratio,
        protein: selectedProductDetail.protein * ratio,
        carbs: selectedProductDetail.carbs * ratio,
        fat: selectedProductDetail.fat * ratio
    };
    
    const mealType = currentMealType || 0;
    if (!meals[mealType]) meals[mealType] = [];
    meals[mealType].push(entry);
    
    dailyData.calories += entry.calories;
    dailyData.protein += entry.protein;
    dailyData.carbs += entry.carbs;
    dailyData.fat += entry.fat;
    
    updateStats();
    renderMeals();
    closeProductDetailModal();
    showToast('"' + selectedProductDetail.name + '" добавлен в дневник');
}

// Charts
function initCharts() {
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `${i + 1}`),
            datasets: [{
                label: 'Вес (кг)',
                data: Array.from({length: 30}, () => 75 + Math.random() * 2 - 1),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }, {
                label: 'Мышечная масса (кг)',
                data: Array.from({length: 30}, () => 32 + Math.random() * 1 - 0.5),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { position: 'top' } 
            },
            scales: { 
                y: { beginAtZero: false } 
            }
        }
    });

    const caloriesCtx = document.getElementById('caloriesChart').getContext('2d');
    caloriesChart = new Chart(caloriesCtx, {
        type: 'bar',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Калории',
                data: [1800, 2100, 1950, 2200, 1850, 2300, 2000],
                backgroundColor: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: 8
            }, {
                label: 'Норма',
                data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
                type: 'line',
                borderColor: '#ef4444',
                borderDash: [5, 5],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { position: 'top' } 
            }
        }
    });
}

function changeChartPeriod(days, btn) {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

// Water
function addWater(amount) {
    waterIntake += amount;
    document.getElementById('waterAmount').textContent = waterIntake;
    
    const percentage = Math.min((waterIntake / userGoals.water) * 100, 100);
    const degrees = (percentage / 100) * 360;
    document.getElementById('waterCircle').style.setProperty('--water-deg', degrees + 'deg');
}

// Activity
function selectActivityType(type) {
    selectedActivityType = type;
    document.querySelectorAll('.activity-type-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    document.getElementById('activityForm').style.display = 'block';
}

function addActivity() {
    const duration = parseFloat(document.getElementById('activityDuration').value);
    if (!duration || selectedActivityType === null) return;
    
    const caloriesPerMin = [4, 10, 8, 9, 6, 3][selectedActivityType];
    const burned = Math.round(duration * caloriesPerMin);
    
    showToast(`Добавлена активность: ${duration} минут, сожжено ~${burned} ккал`);
    document.getElementById('activityDuration').value = '';
}

// Recommendations
function loadRecommendations() {
    const demoRecs = [
        { title: 'Увеличьте калорийность', description: 'Вы съели только 70% от дневной нормы. Добавьте питательный перекус.', type: 'nutrition', priority: 'high' },
        { title: 'Недостаток белка', description: 'Белок важен для мышц. Добавьте курицу, рыбу или творог.', type: 'nutrition', priority: 'medium' },
        { title: 'Пейте больше воды', description: 'Вы выпили только 40% от нормы. Вода важна для метаболизма.', type: 'water', priority: 'high' },
        { title: 'Добавьте активность', description: 'Регулярные тренировки ускоряют результат.', type: 'activity', priority: 'low' }
    ];
    renderRecommendations(demoRecs);
}

function renderRecommendations(recs) {
    const icons = { nutrition: '🍎', water: '💧', activity: '🏃', progress: '📊' };
    
    document.getElementById('recommendationsList').innerHTML = recs.map(r => `
        <div class="recommendation-card ${r.priority}">
            <div class="recommendation-icon">
                ${icons[r.type] || '💡'}
            </div>
            <div class="recommendation-content">
                <h4>${r.title}</h4>
                <p>${r.description}</p>
            </div>
        </div>
    `).join('');
}

// Chat
function loadDietitians() {
    const demoDietitians = [
        { id: 1, name: 'Доктор Анна Дипсиковна', specialization: 'Диетология, нутрициология', rating: 4.9, consultationPrice: 1500 },
        { id: 2, name: 'Михаил Петров', specialization: 'Спортивное питание', rating: 4.8, consultationPrice: 2000 }
    ];
    renderDietitians(demoDietitians);
}

function renderDietitians(dietitians) {
    document.getElementById('dietitiansList').innerHTML = dietitians.map(d => `
        <div class="dietitian-item" onclick="selectDietitian(${d.id})">
            <div class="dietitian-avatar">${d.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="dietitian-info">
                <h4>${d.name}</h4>
                <p>${d.specialization}</p>
            </div>
        </div>
    `).join('');
}

function selectDietitian(id) {
    selectedDietitianId = id;
    document.querySelectorAll('.dietitian-item').forEach(i => i.classList.remove('active'));
    event.target.closest('.dietitian-item').classList.add('active');
    loadChatMessages();
}

function loadChatMessages() {
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = `
        <div class="message dietitian">
            Здравствуйте! Я рада видеть вас в чате. Чем могу помочь?
            <div class="message-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const messages = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    messages.innerHTML += `
        <div class="message user">
            ${message}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    const sendBtn = document.getElementById('sendMessageBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    
    // Индикатор "печатает"
    messages.innerHTML += `
        <div class="message dietitian" id="typingIndicator">
            <span class="typing-dots">Печатает<span>.</span><span>.</span><span>.</span></span>
            <div class="message-time">${time}</div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;
    
    // Контекст пользователя
    const userContext = getUserContextForAI();
    
    try {
        const response = await sendToOpenRouter(message, userContext);
        
        // Удаляем индикатор печати
        document.getElementById('typingIndicator')?.remove();
        
        messages.innerHTML += `
            <div class="message dietitian">
                ${response}
                <div class="message-time">${time}</div>
            </div>
        `;
    } catch (error) {
        console.error('Chat error:', error);
        document.getElementById('typingIndicator')?.remove();
        messages.innerHTML += `
            <div class="message dietitian">
                Извините, произошла ошибка: ${error.message}. Попробуйте ещё раз.
                <div class="message-time">${time}</div>
            </div>
        `;
    }
    
    sendBtn.disabled = false;
    sendBtn.textContent = 'Отправить';
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

function getUserContextForAI() {
    let context = {};
    
    // Получаем данные за сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayData = JSON.parse(localStorage.getItem('foodTracker_' + today)) || {};
    
    const totalCalories = todayData.calories || 0;
    const totalProtein = todayData.protein || 0;
    const totalCarbs = todayData.carbs || 0;
    const totalFat = todayData.fat || 0;
    
    context.todayCalories = Math.round(totalCalories);
    context.todayProtein = Math.round(totalProtein);
    context.todayCarbs = Math.round(totalCarbs);
    context.todayFat = Math.round(totalFat);
    
    // Цель калорий (по умолчанию)
    const settings = JSON.parse(localStorage.getItem('foodTracker_settings')) || {};
    context.goalCalories = settings.dailyCalories || 1800;
    
    return context;
}

async function sendToOpenRouter(message, context) {
    const url = `${API_BASE}/chat/ai`;
    console.log('Calling:', url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                userId: 1,
                dietitianId: selectedDietitianId || 1
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(errorText || 'Ошибка сервера: ' + response.status);
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data.response;
    } catch (err) {
        console.error('Chat API error:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            throw new Error('Не удалось连接到 серверу. Проверь что бэкенд запущен на ' + API_BASE);
        }
        throw err;
    }
}

// Weight
async function addWeightRecord() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (!weight) return;
    
    document.getElementById('currentWeight').textContent = weight;
    showToast('Вес записан: ' + weight + ' кг');
}

// Reminder modal
function openReminderModal() {
    showToast('Функция добавления напоминаний скоро будет доступна!');
}
