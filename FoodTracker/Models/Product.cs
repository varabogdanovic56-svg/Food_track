namespace FoodTracker.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double CaloriesPer100g { get; set; }
    public double ProteinPer100g { get; set; }
    public double CarbsPer100g { get; set; }
    public double FatPer100g { get; set; }
    public double DefaultGrams { get; set; } = 100;
}

public class MealEntry
{
    public int Id { get; set; }
    public int MealType { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public double Grams { get; set; }
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
}

public class Meal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public int MealType { get; set; }
    public List<MealEntry> Entries { get; set; } = new();
}
