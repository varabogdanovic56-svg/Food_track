// Global state
let currentDate = new Date();
let currentMealType = 0;
let currentMealId = null;
let selectedProduct = null;
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
    document.querySelectorAll('.nav-link, .logo').forEach(el => {
        el.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            if (page) showPage(page);
        });
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
    document.getElementById('productDetailGrams').addEventListener('input', updateProductDetailNutrition);
    document.getElementById('addProductDetailBtn').addEventListener('click', addProductDetailToMeal);
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
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: 'Яйца 3 шт, Авокадо 1/2, Пармезан 30г, Сливочное масло 15г, Соль, перец',
        instructions: 'Взбейте яйца с солью и перцем. Авокадо нарежьте ломтиками. На сковороде растопите масло, вылейте яйца, добавьте авокадо и посыпьте тертым сыром. Жарьте на среднем огне до готовности.',
        totalNutrition: { calories: 420, protein: 24, carbs: 4, fat: 35 }
    },
    {
        id: 2, name: 'Стейк лосося с маслом', description: 'Сочный лосось с зеленым маслом',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 15, dietTypes: 1, cuisine: 'Скандинавская',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        ingredients: 'Лосось 400г, Сливочное масло 50г, Петрушка 20г, Чеснок 2 зубчика, Лимон 1/2, Соль, перец',
        instructions: 'Лосось посолите, поперчите. Обжарьте на сковороде по 4 минуты с каждой стороны. Масло смешайте с измельченным чесноком и петрушкой. Подавайте рыбу с зеленым маслом и долькой лимона.',
        totalNutrition: { calories: 480, protein: 42, carbs: 1, fat: 34 }
    },
    {
        id: 3, name: 'Куриные крылышки в духовке', description: 'Хрустящие крылышки без углеводов',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 45, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
        ingredients: 'Куриные крылышки 1кг, Оливковое масло 30мл, Паприка 1 ч.л., Чеснок 3 зубчика, Соль, перец, Розмарин',
        instructions: 'Крылышки обсушите, смешайте с маслом и специями. Выложите на противень с бумагой для выпечки. Запекайте при 200°C 45 минут, перевернув в середине приготовления.',
        totalNutrition: { calories: 350, protein: 38, carbs: 2, fat: 20 }
    },
    {
        id: 4, name: 'Творожная запеканка кето', description: 'Нежная запеканка без муки',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 35, dietTypes: 1, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        ingredients: 'Творог 500г, Яйца 4 шт, Сливочное масло 50г, Разрыхлитель 1 ч.л., Ванилин, Соль',
        instructions: 'Творог протрите через сито. Яйца взбейте с солью, добавьте творог, разрыхлитель и ванилин. Вылейте в форму, смазанную маслом. Запекайте при 180°C 35 минут.',
        totalNutrition: { calories: 280, protein: 28, carbs: 3, fat: 18 }
    },
    {
        id: 5, name: 'Салат с тунцом и яйцом', description: 'Белковый салат для кето-диеты',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: 'Тунец консервированный 200г, Яйца 2 шт, Салат 100г, Оливковое масло 30мл, Лимон 1/2, Оливки 50г',
        instructions: 'Яйца сварите вкрутую, нарежьте. Салат порвите руками. Смешайте тунец, яйца, салат, оливки. Заправьте маслом с лимонным соком.',
        totalNutrition: { calories: 320, protein: 36, carbs: 4, fat: 18 }
    },
    {
        id: 6, name: 'Фаршированные шампиньоны', description: 'Зкусная закуска на кето',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400',
        ingredients: 'Шампиньоны 400г, Фарш индейки 200г, Лук 1/2, Чеснок 2 зубчика, Сыр 100г, Оливковое масло',
        instructions: 'Шампиньоны очистите, удалите ножки. Фарш обжарьте с луком и чесноком. Начините шампиньоны фаршем, посыпьте тертым сыром. Запекайте при 190°C 20 минут.',
        totalNutrition: { calories: 220, protein: 24, carbs: 4, fat: 12 }
    },
    {
        id: 7, name: 'Кето-стейк из говядины', description: 'Сочный стейк с овощами',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
        ingredients: 'Говядина 400г, Сливочное масло 40г, Розмарин, Чеснок, Соль, перец, Брокколи 200г',
        instructions: 'Стейк посолите, поперчите за 30 минут до готовки. Обжарьте на сильном огне по 3 минуты с каждой стороны. Добавьте масло, розмарин, чеснок и поливайте стейк. Брокколи отварите на пару.',
        totalNutrition: { calories: 520, protein: 48, carbs: 6, fat: 34 }
    },
    {
        id: 8, name: 'Яичница с беконом', description: 'Классический американский завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: 'Яйца 3 шт, Бекон 80г, Сливочное масло 15г, Зеленый лук, Соль, перец',
        instructions: 'Бекон обжарьте до хрустящей корочки. На том же жире пожарьте яйца. Посыпьте нарезанным луком.',
        totalNutrition: { calories: 450, protein: 28, carbs: 2, fat: 36 }
    },
    {
        id: 9, name: 'Суп-пюре из цветной капусты', description: 'Нежный крем-суп без углеводов',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 1, cuisine: 'Французская',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        ingredients: 'Цветная капуста 1 кг, Сливочное масло 50г, Сливки 200мл, Куриный бульон 500мл, Чеснок 3 зубчика, Соль, мускатный орех',
        instructions: 'Капусту разберите на соцветия, варите в бульоне 20 минут. Добавьте чеснок, измельчите блендером. Добавьте масло, сливки, приправьте мускатным орехом.',
        totalNutrition: { calories: 180, protein: 8, carbs: 8, fat: 14 }
    },
    {
        id: 10, name: 'Лосось в кокосовом молоке', description: 'Азиатский кето-рецепт',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 1, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
        ingredients: 'Лосось 400г, Кокосовое молоко 200мл, Имбирь 30г, Чеснок 2 зубчика, Кинза, Кокосовое масло 30мл, Соль, перец',
        instructions: 'Лосось нарежьте кусочками. Обжарьте имбирь и чеснок на кокосовом масле. Добавьте рыбу, влейте кокосовое молоко, тушите 15 минут. Подавайте с кинзой.',
        totalNutrition: { calories: 440, protein: 38, carbs: 4, fat: 30 }
    },

    // VEGAN - 10 recipes (dietTypes: 2)
    {
        id: 11, name: 'Веганский бургер', description: 'Растительный бургер с нута',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 20, dietTypes: 2, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        ingredients: 'Нут 400г, Овсяные хлопья 50г, Лук 1, Чеснок 3 зубчика, Паприка 1 ч.л., Кумкум 1/2 ч.л., Мука 50г, Растительное масло',
        instructions: 'Нут измельчите в блендере с луком и чеснокем. Добавьте овсянку, специи. Сформируйте котлеты, обваляйте в муке. Жарьте на среднем огне по 5 минут с каждой стороны.',
        totalNutrition: { calories: 280, protein: 12, carbs: 42, fat: 8 }
    },
    {
        id: 12, name: 'Салат с киноа и авокадо', description: 'Полезный салат с овощами',
        servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 2, cuisine: 'Средиземноморская',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        ingredients: 'Киноа 150г, Авокадо 1, Помидоры черри 150г, Огурец 1, Лимон 1/2, Оливковое масло 30мл, Кинза, Соль',
        instructions: 'Киноа отварите по инструкции, остудите. Нарежьте овощи, смешайте с киноа. Заправьте маслом с лимонным соком и кинзой.',
        totalNutrition: { calories: 380, protein: 10, carbs: 45, fat: 18 }
    },
    {
        id: 13, name: 'Веганский карри', description: 'Ароматное индийское блюдо',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 30, dietTypes: 2, cuisine: 'Индийская',
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
        ingredients: 'Нут 400г, Кокосовое молоко 400мл, Карри порошок 2 ст.л., Помидоры 300г, Лук 1, Чеснок 4 зубчика, Имбирь 30г, Шпинат 200г',
        instructions: 'Обжарьте лук, чеснок, имбирь. Добавьте карри, помидоры, нут. Влейте кокосовое молоко, варите 20 минут. Добавьте шпинат, готовьте ещё 5 минут.',
        totalNutrition: { calories: 340, protein: 14, carbs: 42, fat: 14 }
    },
    {
        id: 14, name: 'Тофу с овощами на сковороде', description: 'Быстрое и сытное блюдо',
        servings: 3, prepTimeMinutes: 15, cookTimeMinutes: 20, dietTypes: 2, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ingredients: 'Тофу 400г, Брокколи 200г, Морковь 1, Болгарский перец 1, Соевый соус 30мл, Кунжутное масло 20мл, Чеснок 3 зубчика',
        instructions: 'Тофу нарежьте кубиками, обжарьте до золотистой корочки. Добавьте овощи, жарьте 10 минут. Заправьте соевым соусом, маслом с чесноком.',
        totalNutrition: { calories: 280, protein: 18, carbs: 16, fat: 16 }
    },
    {
        id: 15, name: 'Веганский суп с чечевицей', description: 'Сытный и полезный суп',
        servings: 6, prepTimeMinutes: 15, cookTimeMinutes: 35, dietTypes: 2, cuisine: 'Индийская',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        ingredients: 'Чечевица красная 300г, Морковь 2, Лук 1, Сельдерей 2 стебля, Чеснок 4 зубчика, Овощной бульон 1.5л, Куркума 1 ч.л., Зелень',
        instructions: 'Обжарьте лук, морковь, сельдерей. Добавьте чечевицу, бульон, куркуму. Варите 30 минут до готовности чечевицы. Посыпьте зеленью.',
        totalNutrition: { calories: 180, protein: 12, carbs: 30, fat: 2 }
    },
    {
        id: 16, name: 'Овсянка с ягодами и орехами', description: 'Энергетический завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 2, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
        ingredients: 'Овсяные хлопья 80г, Миндальное молоко 250мл, Черника 80г, Грецкие орехи 30г, Кленовый сироп 1 ст.л., Корица',
        instructions: 'Овсянку варите на молоке 5-7 минут. Добавьте корицу. Выложите в тарелку, украсьте ягодами и орехами, полейте сиропом.',
        totalNutrition: { calories: 380, protein: 10, carbs: 52, fat: 14 }
    },
    {
        id: 17, name: 'Веганские роллы с овощами', description: 'Свежие и легкие роллы',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 0, dietTypes: 2, cuisine: 'Азиатская',
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        ingredients: 'Рисовая бумага 8 листов, Тофу 200г, Огурец 1, Морковь 1, Авокадо 1, Рис 150г, Соевый соус',
        instructions: 'Рис отварите, остудите. Рисовую бумагу замочите на 10 секунд. Выложите рис, тофу, овощи. Сверните роллы. Подавайте с соевым соусом.',
        totalNutrition: { calories: 260, protein: 10, carbs: 44, fat: 6 }
    },
    {
        id: 18, name: 'Банановий смузи с арахисовой пастой', description: 'Протеиновый коктейль',
        servings: 2, prepTimeMinutes: 5, cookTimeMinutes: 0, dietTypes: 2, cuisine: 'Американская',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
        ingredients: 'Банан 2, Миндальное молоко 400мл, Арахисовая паста 2 ст.л., Шпинат 50г, Семена чиа 1 ст.л., Лед',
        instructions: 'Все ингредиенты взбейте в блендере до однородности. Добавьте лед по желанию.',
        totalNutrition: { calories: 320, protein: 10, carbs: 42, fat: 14 }
    },
    {
        id: 19, name: 'Запеченный батат с фасолью', description: 'Полезный обед',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 35, dietTypes: 2, cuisine: 'Мексиканская',
        imageUrl: 'https://images.unsplash.com/photo-1596097635121-14b63a7a6d23?w=400',
        ingredients: 'Батат 2 крупных, Черная фасоль 300г, Помидоры 2, Лук 1, Чеснок 3 зубчика, Кинза, Лайм 1, Перец чили',
        instructions: 'Батат запекайте в духовке при 200°C 30 минут. Фасоль обжарьте с овощами и специями. Разрежьте батат, наполните фасолью, украсьте кинзой и лаймом.',
        totalNutrition: { calories: 380, protein: 14, carbs: 68, fat: 4 }
    },
    {
        id: 20, name: 'Веганский рагу', description: 'Овощное рагу с горошком',
        servings: 4, prepTimeMinutes: 20, cookTimeMinutes: 30, dietTypes: 2, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        ingredients: 'Картофель 3, Морковь 2, Горошек 200г, Лук 1, Чеснок 4 зубчика, Помидоры 3, Овощной бульон 300мл, Тимьян',
        instructions: 'Обжарьте лук и чеснок. Добавьте нарезанные овощи, жарьте 5 минут. Влейте бульон, добавьте помидоры и тимьян. Тушите 25 минут, добавьте горошек.',
        totalNutrition: { calories: 220, protein: 8, carbs: 42, fat: 2 }
    },

    // VEGETARIAN - 10 recipes (dietTypes: 4)
    {
        id: 21, name: 'Творожная запеканка с изюмом', description: 'Классический рецепт',
        servings: 6, prepTimeMinutes: 20, cookTimeMinutes: 45, dietTypes: 4, cuisine: 'Русская',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        ingredients: 'Творог 600г, Яйца 3 шт, Сахар 100г, Манка 80г, Изюм 80г, Ванилин, Сметана 100г',
        instructions: 'Творог протрите, добавьте яйца, сахар, манку, изюм. Выложите в форму, смазанную маслом. Сверху смажьте сметаной. Запекайте при 180°C 45 минут.',
        totalNutrition: { calories: 280, protein: 18, carbs: 36, fat: 8 }
    },
    {
        id: 22, name: 'Омлет с грибами и сыром', description: 'Завтрак для вегетарианцев',
        servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 12, dietTypes: 4, cuisine: 'Французская',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: 'Яйца 4 шт, Шампиньоны 150г, Сыр 80г, Молоко 50мл, Сливочное масло 20г, Зелень, Соль, перец',
        instructions: 'Грибы обжарьте на масле. Яйца взбейте с молоком, посолите. Вылейте на сковороду с грибами, посыпьте тертым сыром. Накройте крышкой, готовьте до готовности.',
        totalNutrition: { calories: 340, protein: 22, carbs: 4, fat: 26 }
    },
    {
        id: 23, name: 'Сырники классические', description: 'Пышные сырники с сметаной',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 15, dietTypes: 4, cuisine: 'Русская',
        imageUrl: 'https://images.unsplash.com/photo-1598214886806-c871d0b2e882?w=400',
        ingredients: 'Творог 400г, Яйцо 1, Мука 100г, Сахар 30г, Ванилин, Растительное масло, Сметана для подачи',
        instructions: 'Творог разомните, добавьте яйцо, муку, сахар, ванилин. Сформируйте сырники. Обжарьте на растительном масле до золотистой корочки. Подавайте со сметаной.',
        totalNutrition: { calories: 290, protein: 18, carbs: 32, fat: 10 }
    },
    {
        id: 24, name: 'Лазанья с овощами', description: 'Итальянская классика',
        servings: 6, prepTimeMinutes: 30, cookTimeMinutes: 40, dietTypes: 4, cuisine: 'Итальянская',
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
        ingredients: 'Листы лазаньи 250г, Помидоры 400г, Кабачки 2, Баклажан 1, Рикотта 300г, Моцарелла 200г, Базилик, Оливковое масло',
        instructions: 'Овощи нарежьте, обжарьте. Рикотту смешайте с базиликом. В форму выкладывайте слоями: овощи, лазанья, рикотта, соус из помидоров, сыр. Запекайте при 190°C 40 минут.',
        totalNutrition: { calories: 380, protein: 18, carbs: 42, fat: 14 }
    },
    {
        id: 25, name: 'Греческий салат', description: 'Освежающий средиземноморский салат',
        servings: 4, prepTimeMinutes: 15, cookTimeMinutes: 0, dietTypes: 4, cuisine: 'Греческая',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        ingredients: 'Огурец 2, Помидоры 3, Перец болгарский 1, Красный лук 1/2, Фета 200г, Оливки 100г, Оливковое масло 50мл, Орегано',
        instructions: 'Нарежьте овощи крупными кусками. Добавьте оливки и нарезанную фету. Полейте маслом, посыпьте орегано.',
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
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        ingredients: 'Мука 250г, Дрожжи 7г, Помидоры 200г, Моцарелла 200г, Болгарский перец 1, Грибы 150г, Оливки 50г, Базилик',
        instructions: 'Замесите тесто, дайте подойти 1 час. Растяните, смажьте томатным соусом. Выложите овощи и сыр. Выпекайте при 220°C 15-20 минут.',
        totalNutrition: { calories: 380, protein: 16, carbs: 48, fat: 12 }
    },
    {
        id: 28, name: 'Яичница с шпинатом', description: 'Полезный завтрак',
        servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 8, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
        ingredients: 'Яйца 3 шт, Шпинат 100г, Помидор черри 5 шт, Сливочное масло 15г, Соль, перец',
        instructions: 'Шпинат обжарьте на масле. Добавьте разрезанные пополам помидоры. Вбейте яйца, посолите, поперчите. Готовьте под крышкой до желаемой готовности.',
        totalNutrition: { calories: 290, protein: 18, carbs: 6, fat: 22 }
    },
    {
        id: 29, name: 'Фаршированные перцы', description: 'Рис с овощами в перцах',
        servings: 4, prepTimeMinutes: 25, cookTimeMinutes: 40, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1601000938365-f182c5ec44e7?w=400',
        ingredients: 'Болгарские перцы 4, Рис 150г, Морковь 1, Лук 1, Помидоры 2, Чеснок 2 зубчика, Сметана 150г, Зелень',
        instructions: 'Перцы очистите от семян. Рис отварите, смешайте с обжаренными овощами. Нафаршируйте перцы. Запекайте в духовке при 190°C 40 минут, поливая сметаной.',
        totalNutrition: { calories: 240, protein: 8, carbs: 38, fat: 6 }
    },
    {
        id: 30, name: 'Картофельная запеканка', description: 'Сытное блюдо с сыром',
        servings: 6, prepTimeMinutes: 25, cookTimeMinutes: 45, dietTypes: 4, cuisine: 'Европейская',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
        ingredients: 'Картофель 1кг, Яйца 3 шт, Сметана 200г, Сыр 200г, Лук 1, Чеснок 2 зубчика, Сливочное масло 50г',
        instructions: 'Картофель нарежьте кружочками, отварите до полуготовности. Яйца взбейте со сметаной. Выкладывайте слоями картофайл, лук, сыр, заливая яичной смесью. Запекайте при 180°C 35 минут.',
        totalNutrition: { calories: 320, protein: 14, carbs: 32, fat: 16 }
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
        const imageUrl = r.imageUrl || '';
        
        return `
        <div class="recipe-card" onclick="addRecipeToMeal(${r.id})">
            <div class="recipe-image" style="${imageUrl ? `background-image: url(${imageUrl}); background-size: cover; background-position: center;` : ''}">
                ${!imageUrl ? `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
                </svg>
                ` : ''}
                <div class="recipe-tags">
                    ${Object.entries(dietLabels).filter(([k, v]) => (r.dietTypes & parseInt(k)) === parseInt(k)).map(([k, v]) => `<span class="recipe-tag">${v}</span>`).join('')}
                </div>
            </div>
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
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    const mealType = currentMealType || 0;
    if (!meals[mealType]) meals[mealType] = [];
    
    const entry = {
        productId: recipe.id,
        productName: recipe.name,
        grams: recipe.servings * 100,
        calories: recipe.totalCalories,
        protein: recipe.totalProtein,
        carbs: recipe.totalCarbs,
        fat: recipe.totalFat
    };
    
    meals[mealType].push(entry);
    dailyData.calories += entry.calories;
    dailyData.protein += entry.protein;
    dailyData.carbs += entry.carbs;
    dailyData.fat += entry.fat;
    
    updateStats();
    renderMeals();
    alert('Рецепт добавлен в ' + ['завтрак', 'обед', 'ужин', 'перекус'][mealType]);
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
    
    document.getElementById('productDetailModal').classList.add('active');
}

function closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.remove('active');
}

function updateProductDetailNutrition() {
    if (!selectedProductDetail) return;
    const grams = parseFloat(document.getElementById('productDetailGrams').value) || 100;
    const ratio = grams / 100;
    
    document.getElementById('totalGrams').textContent = grams;
    document.getElementById('totalCalories').textContent = Math.round(selectedProductDetail.calories * ratio);
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
    alert('"' + selectedProductDetail.name + '" добавлен в дневник');
}
    const mealType = 0;
    if (!meals[mealType]) meals[mealType] = [];
    
    const entry = {
        productId: Date.now(),
        productName: name,
        grams: grams,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat
    };
    
    meals[mealType].push(entry);
    dailyData.calories += calories;
    dailyData.protein += protein;
    dailyData.carbs += carbs;
    dailyData.fat += fat;
    
    updateStats();
    renderMeals();
    alert('"' + name + '" добавлен в завтрак');
}

// Initialize products page on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderProductsPage(allFoods);
    }, 100);
});

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
    
    alert(`Добавлена активность: ${duration} минут, сожжено ~${burned} ккал`);
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
async function loadDietitians() {
    try {
        const response = await fetch(`${API_BASE}/Chat/dietitians`);
        const dietitians = await response.json();
        renderDietitians(dietitians);
    } catch (e) {
        const demoDietitians = [
            { id: 1, name: 'Доктор Анна Смирнова', specialization: 'Диетология, нутрициология', rating: 4.9, consultationPrice: 1500 },
            { id: 2, name: 'Михаил Петров', specialization: 'Спортивное питание', rating: 4.8, consultationPrice: 2000 }
        ];
        renderDietitians(demoDietitians);
    }
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

async function loadChatMessages() {
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = `
        <div class="message dietitian">
            Здравствуйте! Я рада видеть вас в чате. Чем могу помочь?
            <div class="message-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/Chat/messages?userId=1&dietitianId=${selectedDietitianId}`);
        const messagesData = await response.json();
        
        if (messagesData && messagesData.length > 0) {
            messages.innerHTML = '';
            messagesData.forEach(m => {
                const time = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                messages.innerHTML += `
                    <div class="message ${m.isFromUser ? 'user' : 'dietitian'}">
                        ${m.content}
                        <div class="message-time">${time}</div>
                    </div>
                `;
            });
        }
    } catch (e) {
        console.log('No previous messages');
    }
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
    
    try {
        const response = await fetch(`${API_BASE}/Chat/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                dietitianId: selectedDietitianId,
                message: message
            })
        });
        
        const result = await response.json();
        
        if (result.assistantMessage) {
            messages.innerHTML += `
                <div class="message dietitian">
                    ${result.assistantMessage.content}
                    <div class="message-time">${time}</div>
                </div>
            `;
        }
    } catch (e) {
        console.error('Chat error:', e);
        messages.innerHTML += `
            <div class="message dietitian">
                Извините, произошла ошибка. Попробуйте ещё раз.
                <div class="message-time">${time}</div>
            </div>
        `;
    }
    
    sendBtn.disabled = false;
    sendBtn.textContent = 'Отправить';
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

// Weight
async function addWeightRecord() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (!weight) return;
    
    document.getElementById('currentWeight').textContent = weight;
    alert('Вес записан: ' + weight + ' кг');
}

// Reminder modal
function openReminderModal() {
    alert('Функция добавления напоминаний скоро будет доступна!');
}
