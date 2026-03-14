using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodDiaryController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public FoodDiaryController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet("date/{date}")]
    public IActionResult GetMealsByDate(string date, [FromQuery] int userId = 1)
    {
        if (!DateTime.TryParse(date, out var parsedDate))
            return BadRequest("Invalid date format");

        var meals = _context.Meals
            .Where(m => m.UserId == userId && m.Date.Date == parsedDate.Date)
            .ToList();

        var mealTypes = new[] { 0, 1, 2, 3 };
        var result = new List<Meal>();

        foreach (var mealType in mealTypes)
        {
            var meal = meals.FirstOrDefault(m => m.MealType == mealType);
            if (meal == null)
            {
                meal = new Meal
                {
                    Id = mealType,
                    UserId = userId,
                    Date = parsedDate,
                    MealType = mealType,
                    Entries = new List<MealEntry>()
                };
            }
            result.Add(meal);
        }

        return Ok(result);
    }

    [HttpPost("entry")]
    public IActionResult AddMealEntry([FromBody] MealEntry entry)
    {
        var meal = _context.Meals
            .FirstOrDefault(m => m.UserId == entry.MealType && m.Date.Date == DateTime.Today);

        if (meal == null)
        {
            meal = new Meal
            {
                UserId = 1,
                Date = DateTime.Today,
                MealType = entry.MealType,
                Entries = new List<MealEntry>()
            };
            _context.Meals.Add(meal);
        }

        entry.Id = meal.Entries.Count + 1;
        meal.Entries.Add(entry);

        return Ok(entry);
    }

    [HttpGet("products/search")]
    public IActionResult SearchProducts([FromQuery] string query)
    {
        var products = _context.Products
            .Where(p => p.Name.ToLower().Contains(query.ToLower()))
            .Take(20)
            .ToList();

        return Ok(products);
    }

    [HttpGet("products")]
    public IActionResult GetAllProducts()
    {
        return Ok(_context.Products);
    }

    [HttpGet("stats")]
    public IActionResult GetDailyStats([FromQuery] int userId = 1, [FromQuery] string? date = null)
    {
        var targetDate = date != null ? DateTime.Parse(date) : DateTime.Today;
        
        var meals = _context.Meals
            .Where(m => m.UserId == userId && m.Date.Date == targetDate.Date)
            .SelectMany(m => m.Entries)
            .ToList();

        var stats = new
        {
            Calories = meals.Sum(e => e.Calories),
            Protein = meals.Sum(e => e.Protein),
            Carbs = meals.Sum(e => e.Carbs),
            Fat = meals.Sum(e => e.Fat)
        };

        return Ok(stats);
    }
}
