namespace FoodTracker.Models;

public class Recipe
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int Servings { get; set; } = 1;
    public int PrepTimeMinutes { get; set; }
    public int CookTimeMinutes { get; set; }
    public DietType DietTypes { get; set; }
    public string Cuisine { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? YoutubeUrl { get; set; }
    public string? Area { get; set; }
    public string? IngredientNames { get; set; }
    public string? IngredientMeasures { get; set; }
    public NutritionalInfo TotalNutrition { get; set; } = new();
    public List<RecipeIngredient> Ingredients { get; set; } = new();
    public bool IsCached { get; set; }
    public DateTime? CachedAt { get; set; }
}

[Flags]
public enum DietType
{
    None = 0,
    Keto = 1,
    Vegan = 2,
    Vegetarian = 4,
    GlutenFree = 8,
    LowCarb = 16,
    DairyFree = 32,
    Paleo = 64,
    Balanced = 128
}

public class NutritionalInfo
{
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
    public double Fiber { get; set; }
}

public class RecipeIngredient
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public double Grams { get; set; }
}

public class TheMealDbResponse
{
    public List<TheMealDbMeal>? Meals { get; set; }
}

public class TheMealDbMeal
{
    public string? IdMeal { get; set; }
    public string? StrMeal { get; set; }
    public string? StrCategory { get; set; }
    public string? StrArea { get; set; }
    public string? StrInstructions { get; set; }
    public string? StrMealThumb { get; set; }
    public string? StrYoutube { get; set; }
    public string? StrIngredient1 { get; set; }
    public string? StrIngredient2 { get; set; }
    public string? StrIngredient3 { get; set; }
    public string? StrIngredient4 { get; set; }
    public string? StrIngredient5 { get; set; }
    public string? StrIngredient6 { get; set; }
    public string? StrIngredient7 { get; set; }
    public string? StrIngredient8 { get; set; }
    public string? StrIngredient9 { get; set; }
    public string? StrIngredient10 { get; set; }
    public string? StrIngredient11 { get; set; }
    public string? StrIngredient12 { get; set; }
    public string? StrIngredient13 { get; set; }
    public string? StrIngredient14 { get; set; }
    public string? StrIngredient15 { get; set; }
    public string? StrIngredient16 { get; set; }
    public string? StrIngredient17 { get; set; }
    public string? StrIngredient18 { get; set; }
    public string? StrIngredient19 { get; set; }
    public string? StrIngredient20 { get; set; }
    public string? StrMeasure1 { get; set; }
    public string? StrMeasure2 { get; set; }
    public string? StrMeasure3 { get; set; }
    public string? StrMeasure4 { get; set; }
    public string? StrMeasure5 { get; set; }
    public string? StrMeasure6 { get; set; }
    public string? StrMeasure7 { get; set; }
    public string? StrMeasure8 { get; set; }
    public string? StrMeasure9 { get; set; }
    public string? StrMeasure10 { get; set; }
    public string? StrMeasure11 { get; set; }
    public string? StrMeasure12 { get; set; }
    public string? StrMeasure13 { get; set; }
    public string? StrMeasure14 { get; set; }
    public string? StrMeasure15 { get; set; }
    public string? StrMeasure16 { get; set; }
    public string? StrMeasure17 { get; set; }
    public string? StrMeasure18 { get; set; }
    public string? StrMeasure19 { get; set; }
    public string? StrMeasure20 { get; set; }
}
