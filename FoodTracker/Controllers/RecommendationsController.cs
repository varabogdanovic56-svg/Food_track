using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public RecommendationsController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetRecommendations([FromQuery] int userId = 1)
    {
        var recommendations = _context.Recommendations
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Priority)
            .ToList();

        return Ok(recommendations);
    }

    [HttpPost]
    public IActionResult AddRecommendation([FromBody] Recommendation recommendation)
    {
        recommendation.Id = _context.Recommendations.Count + 1;
        recommendation.CreatedAt = DateTime.Now;
        _context.Recommendations.Add(recommendation);

        return Ok(recommendation);
    }

    [HttpGet("generate")]
    public IActionResult GenerateRecommendations([FromQuery] int userId = 1)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null) return NotFound();

        var recommendations = new List<Recommendation>();
        var random = new Random();

        var meals = _context.Meals
            .Where(m => m.UserId == userId && m.Date.Date == DateTime.Today)
            .SelectMany(m => m.Entries)
            .ToList();

        var totalCalories = meals.Sum(e => e.Calories);
        var totalProtein = meals.Sum(e => e.Protein);
        var totalWater = _context.WaterIntakes
            .Where(w => w.UserId == userId && w.Date.Date == DateTime.Today)
            .Sum(w => w.Amount);

        if (totalCalories < user.Goals.Calories * 0.8)
        {
            recommendations.Add(new Recommendation
            {
                UserId = userId,
                Title = "Увеличьте калорийность",
                Description = $"Вы съели только {Math.Round(totalCalories * 100.0 / user.Goals.Calories)}% от дневной нормы. Добавьте питательный перекус.",
                Category = RecommendationCategory.Nutrition,
                Priority = RecommendationPriority.High
            });
        }

        if (totalProtein < user.Goals.Protein * 0.7)
        {
            recommendations.Add(new Recommendation
            {
                UserId = userId,
                Title = "Недостаток белка",
                Description = "Белок важен для мышц. Добавьте курицу, рыбу или творог.",
                Category = RecommendationCategory.Nutrition,
                Priority = RecommendationPriority.Medium
            });
        }

        if (totalWater < user.Goals.Water * 0.5)
        {
            recommendations.Add(new Recommendation
            {
                UserId = userId,
                Title = "Пейте больше воды",
                Description = $"Вы выпили только {Math.Round(totalWater * 100.0 / user.Goals.Water)}% от нормы. Вода важна для метаболизма.",
                Category = RecommendationCategory.Water,
                Priority = RecommendationPriority.High
            });
        }

        return Ok(recommendations);
    }
}
