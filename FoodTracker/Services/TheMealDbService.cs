using System.Net.Http.Json;
using System.Text.Json;
using FoodTracker.Models;
using FoodTracker.Data;

namespace FoodTracker.Services;

public class TheMealDbService
{
    private readonly HttpClient _httpClient;
    private readonly FoodTrackerDbContext _context;
    private const string BaseUrl = "https://www.themealdb.com/api/json/v1/1";

    public TheMealDbService(HttpClient httpClient, FoodTrackerDbContext context)
    {
        _httpClient = httpClient;
        _context = context;
    }

    public async Task<List<Recipe>> GetAllRecipesAsync()
    {
        var cachedRecipes = _context.Recipes.Where(r => r.IsCached).ToList();
        if (cachedRecipes.Any())
        {
            return cachedRecipes;
        }

        var recipes = new List<Recipe>();
        
        var categories = new[] { "Chicken", "Beef", "Pork", "Fish", "Vegetarian", "Pasta", "Salad", "Soup" };
        
        foreach (var category in categories)
        {
            try
            {
                var response = await _httpClient.GetFromJsonAsync<TheMealDbResponse>($"{BaseUrl}/filter.php?c={category}");
                if (response?.Meals != null)
                {
                    foreach (var meal in response.Meals.Take(10))
                    {
                        var fullRecipe = await GetRecipeByIdAsync(meal.IdMeal ?? "");
                        if (fullRecipe != null)
                        {
                            recipes.Add(fullRecipe);
                        }
                    }
                }
            }
            catch
            {
                // Ignore errors, continue with next category
            }
        }

        foreach (var recipe in recipes)
        {
            recipe.IsCached = true;
            recipe.CachedAt = DateTime.Now;
            CalculateNutrition(recipe);
        }

        _context.Recipes.AddRange(recipes);
        
        return recipes;
    }

    public async Task<Recipe?> GetRecipeByIdAsync(string id)
    {
        try
        {
            var existingRecipe = _context.Recipes.FirstOrDefault(r => r.Id.ToString() == id && r.IsCached);
            if (existingRecipe != null)
                return existingRecipe;

            var response = await _httpClient.GetFromJsonAsync<TheMealDbResponse>($"{BaseUrl}/lookup.php?i={id}");
            var meal = response?.Meals?.FirstOrDefault();

            if (meal == null)
                return null;

            var recipe = MapToRecipe(meal);
            CalculateNutrition(recipe);
            
            return recipe;
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<Recipe>> SearchRecipesAsync(string query)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<TheMealDbResponse>($"{BaseUrl}/search.php?s={query}");
            var meals = response?.Meals ?? new List<TheMealDbMeal>();
            
            return meals.Select(MapToRecipe).ToList();
        }
        catch
        {
            return new List<Recipe>();
        }
    }

    private Recipe MapToRecipe(TheMealDbMeal meal)
    {
        var ingredients = new List<string>();
        var measures = new List<string>();

        var ingredientProps = typeof(TheMealDbMeal).GetProperties()
            .Where(p => p.Name.StartsWith("StrIngredient") && p.GetValue(meal) != null)
            .ToList();

        var measureProps = typeof(TheMealDbMeal).GetProperties()
            .Where(p => p.Name.StartsWith("StrMeasure") && p.GetValue(meal) != null)
            .ToList();

        for (int i = 0; i < ingredientProps.Count; i++)
        {
            var ingredient = ingredientProps[i].GetValue(meal)?.ToString()?.Trim();
            if (!string.IsNullOrEmpty(ingredient))
            {
                ingredients.Add(ingredient);
                var measure = i < measureProps.Count ? measureProps[i].GetValue(meal)?.ToString()?.Trim() : "";
                measures.Add(measure ?? "");
            }
        }

        return new Recipe
        {
            Id = int.TryParse(meal.IdMeal, out var id) ? id : 0,
            Name = meal.StrMeal ?? "",
            Description = meal.StrCategory ?? "",
            Instructions = meal.StrInstructions ?? "",
            ImageUrl = meal.StrMealThumb ?? "",
            YoutubeUrl = meal.StrYoutube,
            Area = meal.StrArea,
            Servings = 4,
            PrepTimeMinutes = 15,
            CookTimeMinutes = 30,
            IngredientNames = string.Join(",", ingredients),
            IngredientMeasures = string.Join(",", measures),
            DietTypes = DetermineDietTypes(ingredients)
        };
    }

    private DietType DetermineDietTypes(List<string> ingredients)
    {
        var dietTypes = DietType.Balanced;
        
        var veganIngredients = new[] { "tofu", "tempeh", "seitan", "beans", "lentils", "chickpeas", "quinoa", "rice", "pasta", "bread", "potato", "tomato", "onion", "garlic", "carrot", "spinach", "broccoli", "pepper", "cucumber", "lettuce", "apple", "banana", "orange" };
        var vegetarianIngredients = new[] { "egg", "cheese", "milk", "butter", "cream", "yogurt", "cottage cheese" };
        
        var lowerIngredients = ingredients.Select(i => i.ToLower()).ToList();
        
        bool isVegan = lowerIngredients.All(i => !veganIngredients.Any(v => i.Contains(v) && !vegetarianIngredients.Any(veg => i.Contains(veg))));
        bool isVegetarian = lowerIngredients.Any(i => vegetarianIngredients.Any(v => i.Contains(v))) && !lowerIngredients.Any(i => i.Contains("chicken") || i.Contains("beef") || i.Contains("pork") || i.Contains("fish") || i.Contains("salmon") || i.Contains("shrimp"));
        
        if (isVegan)
            dietTypes |= DietType.Vegan | DietType.Vegetarian;
        else if (isVegetarian)
            dietTypes |= DietType.Vegetarian;
        
        bool hasGluten = lowerIngredients.Any(i => i.Contains("wheat") || i.Contains("flour") || i.Contains("pasta") || i.Contains("bread") || i.Contains("noodle"));
        if (!hasGluten)
            dietTypes |= DietType.GlutenFree;
        
        return dietTypes;
    }

    private void CalculateNutrition(Recipe recipe)
    {
        if (string.IsNullOrEmpty(recipe.IngredientNames))
        {
            recipe.TotalNutrition = new NutritionalInfo { Calories = 0, Protein = 0, Carbs = 0, Fat = 0 };
            return;
        }

        var ingredientNames = recipe.IngredientNames.Split(',').Select(s => s.Trim().ToLower()).ToArray();
        var measures = recipe.IngredientMeasures?.Split(',').Select(s => ParseGrams(s.Trim())).ToArray() ?? new double[ingredientNames.Length];

        double totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

        for (int i = 0; i < ingredientNames.Length; i++)
        {
            var grams = i < measures.Length ? measures[i] : 100;
            var nutrition = GetNutritionForIngredient(ingredientNames[i], grams);
            
            totalCalories += nutrition.Calories;
            totalProtein += nutrition.Protein;
            totalCarbs += nutrition.Carbs;
            totalFat += nutrition.Fat;
        }

        recipe.TotalNutrition = new NutritionalInfo
        {
            Calories = Math.Round(totalCalories, 1),
            Protein = Math.Round(totalProtein, 1),
            Carbs = Math.Round(totalCarbs, 1),
            Fat = Math.Round(totalFat, 1)
        };
    }

    private double ParseGrams(string measure)
    {
        if (string.IsNullOrEmpty(measure))
            return 100;

        var numbers = new string(measure.Where(c => char.IsDigit(c) || c == '.' || c == ',').ToArray());
        if (double.TryParse(numbers.Replace(',', '.'), out var result))
        {
            if (measure.ToLower().Contains("kg"))
                return result * 1000;
            if (measure.ToLower().Contains("oz"))
                return result * 28.35;
            if (measure.ToLower().Contains("lb"))
                return result * 453.6;
            return result;
        }
        return 100;
    }

    private NutritionalInfo GetNutritionForIngredient(string ingredient, double grams)
    {
        var ratio = grams / 100.0;
        var normalized = ingredient.ToLower();

        var nutritionDatabase = new Dictionary<string, (double cal, double prot, double carbs, double fat)>
        {
            { "chicken", (165, 31, 0, 3.6) },
            { "chicken breast", (165, 31, 0, 3.6) },
            { "beef", (250, 26, 0, 15) },
            { "steak", (271, 25, 0, 19) },
            { "pork", (242, 27, 0, 14) },
            { "bacon", (541, 37, 1.4, 42) },
            { "sausage", (301, 12, 2, 27) },
            { "turkey", (135, 30, 0, 1) },
            { "duck", (337, 19, 0, 28) },
            { "lamb", (294, 25, 0, 21) },
            { "salmon", (208, 20, 0, 13) },
            { "tuna", (130, 29, 0, 1) },
            { "cod", (82, 18, 0, 0.7) },
            { "shrimp", (99, 24, 0.2, 0.3) },
            { "fish", (100, 20, 0, 2) },
            { "mackerel", (205, 19, 0, 14) },
            { "sardines", (208, 25, 0, 11) },
            { "anchovies", (131, 20, 0, 5) },
            { "prawns", (99, 24, 0.2, 0.3) },
            { "crab", (97, 19, 0, 1.5) },
            { "rice", (130, 2.7, 28, 0.3) },
            { "pasta", (131, 5, 25, 1.1) },
            { "spaghetti", (131, 5, 25, 1.1) },
            { "bread", (265, 9, 49, 3.2) },
            { "flour", (364, 10, 76, 1) },
            { "potato", (77, 2, 17, 0.1) },
            { "sweet potato", (86, 1.6, 20, 0.1) },
            { "onion", (40, 1.1, 9, 0.1) },
            { "garlic", (149, 6.4, 33, 0.5) },
            { "tomato", (18, 0.9, 3.9, 0.2) },
            { "carrot", (41, 0.9, 10, 0.2) },
            { "broccoli", (34, 2.8, 7, 0.4) },
            { "spinach", (23, 2.9, 3.6, 0.4) },
            { "lettuce", (15, 1.4, 2.9, 0.2) },
            { "cucumber", (16, 0.7, 3.6, 0.1) },
            { "pepper", (31, 1, 6, 0.3) },
            { "bell pepper", (31, 1, 6, 0.3) },
            { "mushroom", (22, 3.1, 3.3, 0.3) },
            { "celery", (16, 0.7, 3, 0.2) },
            { "cabbage", (25, 1.3, 6, 0.1) },
            { "zucchini", (17, 1.2, 3.1, 0.3) },
            { "eggplant", (25, 1, 6, 0.2) },
            { "corn", (86, 3.3, 19, 1.4) },
            { "peas", (81, 5.4, 14, 0.4) },
            { "beans", (127, 8.7, 23, 0.5) },
            { "kidney beans", (127, 8.7, 23, 0.5) },
            { "chickpeas", (164, 8.9, 27, 2.6) },
            { "lentils", (116, 9, 20, 0.4) },
            { "cheese", (402, 25, 1.3, 33) },
            { "cheddar", (402, 25, 1.3, 33) },
            { "mozzarella", (280, 28, 3.1, 17) },
            { "parmesan", (431, 38, 4.1, 29) },
            { "milk", (42, 3.4, 5, 1) },
            { "butter", (717, 0.9, 0.1, 81) },
            { "cream", (340, 2.8, 2.8, 36) },
            { "yogurt", (59, 10, 3.6, 0.7) },
            { "egg", (155, 13, 1.1, 11) },
            { "eggs", (155, 13, 1.1, 11) },
            { "olive oil", (884, 0, 0, 100) },
            { "oil", (884, 0, 0, 100) },
            { "vegetable oil", (884, 0, 0, 100) },
            { "sugar", (387, 0, 100, 0) },
            { "honey", (304, 0.3, 82, 0) },
            { "salt", (0, 0, 0, 0) },
            { "pepper", (251, 10, 64, 3.3) },
            { "lemon", (29, 1.1, 9, 0.3) },
            { "lime", (30, 0.7, 11, 0.2) },
            { "orange", (47, 0.9, 12, 0.1) },
            { "apple", (52, 0.3, 14, 0.2) },
            { "banana", (89, 1.1, 23, 0.3) },
            { "avocado", (160, 2, 9, 15) },
            { "garlic sauce", (150, 2, 10, 12) },
            { "soy sauce", (53, 8, 5, 0) },
            { "ginger", (80, 1.8, 18, 0.8) },
            { "basil", (23, 3.2, 2.7, 0.6) },
            { "oregano", (265, 9, 69, 4.3) },
            { "thyme", (101, 6, 24, 1.7) },
            { "rosemary", (131, 3.3, 21, 5.9) },
            { "cumin", (375, 18, 44, 22) },
            { "paprika", (282, 14, 54, 13) },
            { "curry", (325, 14, 56, 14) },
            { "coconut milk", (230, 2.3, 6, 24) },
            { "coconut", (354, 3.3, 15, 33) },
            { "quinoa", (120, 4.4, 21, 1.9) },
            { "oats", (389, 16.9, 66, 6.9) },
            { "oatmeal", (389, 16.9, 66, 6.9) },
            { "bulgur", (83, 3.1, 19, 0.2) },
            { "couscous", (112, 3.8, 23, 0.2) },
            { "mayonnaise", (680, 1, 0.6, 75) },
            { "ketchup", (112, 1.7, 26, 0.1) },
            { "mustard", (66, 4.4, 5.3, 4) },
            { "worcestershire", (78, 0, 19, 0) }
        };

        foreach (var item in nutritionDatabase)
        {
            if (normalized.Contains(item.Key))
            {
                return new NutritionalInfo
                {
                    Calories = item.Value.cal * ratio,
                    Protein = item.Value.prot * ratio,
                    Carbs = item.Value.carbs * ratio,
                    Fat = item.Value.fat * ratio
                };
            }
        }

        return new NutritionalInfo { Calories = 100 * ratio, Protein = 3 * ratio, Carbs = 15 * ratio, Fat = 2 * ratio };
    }
}
