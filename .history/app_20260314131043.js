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
    
    // Chat
    document.getElementById('chatInput').addEventListener('keypress', handleChatKeyPress);
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('productSearch').addEventListener('input', searchProducts);
    document.getElementById('addFoodBtn').addEventListener('click', addFoodToMeal);
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
async function loadDailyData() {
    try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const response = await fetch(`${API_BASE}/FoodDiary/date/${dateStr}?userId=1`);
        const mealsData = await response.json();
        
        meals = { 0: [], 1: [], 2: [], 3: [] };
        let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
        
        mealsData.forEach(meal => {
            meals[meal.mealType] = meal.entries || [];
            meal.entries?.forEach(entry => {
                totalCal += entry.calories;
                totalProt += entry.protein;
                totalCarbs += entry.carbs;
                totalFat += entry.fat;
            });
        });
        
        dailyData = { calories: totalCal, protein: totalProt, carbs: totalCarbs, fat: totalFat, water: 0 };
        
        updateStats();
        renderMeals();
    } catch (e) {
        renderMeals();
    }
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

async function loadProducts(query) {
    try {
        const url = query ? `${API_BASE}/Products?search=${encodeURIComponent(query)}` : `${API_BASE}/Products`;
        const response = await fetch(url);
        const products = await response.json();
        renderProducts(products);
    } catch (e) {
        console.error('Failed to load products:', e);
        const demoProducts = [
            { id: 1, name: 'Куриная грудка', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, defaultGrams: 100 },
            { id: 2, name: 'Рис белый', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, defaultGrams: 150 },
            { id: 3, name: 'Брокколи', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, defaultGrams: 150 },
            { id: 4, name: 'Яйцо куриное', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, defaultGrams: 50 },
            { id: 5, name: 'Овсянка', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, defaultGrams: 80 },
            { id: 6, name: 'Молоко 3.2%', caloriesPer100g: 59, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.2, defaultGrams: 250 },
            { id: 7, name: 'Банан', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, defaultGrams: 120 },
            { id: 8, name: 'Лосось', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultGrams: 150 },
            { id: 9, name: 'Гречка', caloriesPer100g: 343, proteinPer100g: 12.6, carbsPer100g: 70, fatPer100g: 3.3, defaultGrams: 100 },
            { id: 10, name: 'Творог 5%', caloriesPer100g: 121, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 5, defaultGrams: 100 },
        ];
        renderProducts(demoProducts);
    }
}

function renderProducts(products) {
    document.getElementById('productList').innerHTML = products.map(p => `
        <div class="product-item" onclick="selectProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})">
            <div class="product-name">${p.name}</div>
            <div class="product-nutrition">
                <span>${Math.round(p.caloriesPer100g)} ккал</span>
                <span>Б: ${Math.round(p.proteinPer100g)}</span>
                <span>У: ${Math.round(p.carbsPer100g)}</span>
                <span>Ж: ${Math.round(p.fatPer100g)}</span>
            </div>
        </div>
    `).join('');
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
    
    document.getElementById('productCalories').textContent = Math.round(selectedProduct.caloriesPer100g * ratio);
    document.getElementById('productProtein').textContent = Math.round(selectedProduct.proteinPer100g * ratio);
    document.getElementById('productCarbs').textContent = Math.round(selectedProduct.carbsPer100g * ratio);
    document.getElementById('productFat').textContent = Math.round(selectedProduct.fatPer100g * ratio);
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

// Recipes
async function loadRecipes() {
    try {
        const response = await fetch(`${API_BASE}/Recipes`);
        recipes = await response.json();
        renderRecipes(recipes);
    } catch (e) {
        console.error('Failed to load recipes:', e);
        recipes = [
            { id: 1, name: 'Куриная грудка с овощами', description: 'Здоровое и питательное блюдо', servings: 2, prepTimeMinutes: 15, cookTimeMinutes: 25, dietTypes: 8, cuisine: 'Европейская', totalNutrition: { calories: 520, protein: 52, carbs: 18, fat: 22 } },
            { id: 2, name: 'Веганский салат с киноа', description: 'Полезный веганский салат', servings: 2, prepTimeMinutes: 20, cookTimeMinutes: 15, dietTypes: 6, cuisine: 'Средиземноморская', totalNutrition: { calories: 380, protein: 14, carbs: 52, fat: 14 } },
            { id: 3, name: 'Кето-омлет с авокадо', description: 'Идеальный завтрак для кето-диеты', servings: 1, prepTimeMinutes: 10, cookTimeMinutes: 10, dietTypes: 1, cuisine: 'Американская', totalNutrition: { calories: 450, protein: 24, carbs: 6, fat: 36 } },
            { id: 4, name: 'Лосось на пару с брокколи', description: 'Диетическое блюдо с омега-3', servings: 2, prepTimeMinutes: 10, cookTimeMinutes: 20, dietTypes: 8, cuisine: 'Азиатская', totalNutrition: { calories: 380, protein: 38, carbs: 12, fat: 18 } },
            { id: 5, name: 'Овсянка с бананом и орехами', description: 'Энергетический завтрак', servings: 1, prepTimeMinutes: 5, cookTimeMinutes: 10, dietTypes: 4, cuisine: 'Европейская', totalNutrition: { calories: 420, protein: 12, carbs: 65, fat: 14 } },
        ];
        renderRecipes(recipes);
    }
}
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
async function loadRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/Recommendations?userId=1`);
        const recs = await response.json();
        renderRecommendations(recs);
    } catch (e) {
        const demoRecs = [
            { title: 'Увеличьте калорийность', description: 'Вы съели только 70% от дневной нормы. Добавьте питательный перекус.', type: 'nutrition', priority: 'high' },
            { title: 'Недостаток белка', description: 'Белок важен для мышц. Добавьте курицу, рыбу или творог.', type: 'nutrition', priority: 'medium' },
            { title: 'Пейте больше воды', description: 'Вы выпили только 40% от нормы. Вода важна для метаболизма.', type: 'water', priority: 'high' },
            { title: 'Добавьте активность', description: 'Регулярные тренировки ускоряют результат.', type: 'activity', priority: 'low' }
        ];
        renderRecommendations(demoRecs);
    }
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
    document.querySelectorAll('.dietitian-item').forEach(i => i.classList.remove('active'));
    event.target.closest('.dietitian-item').classList.add('active');
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
                dietitianId: 1,
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
