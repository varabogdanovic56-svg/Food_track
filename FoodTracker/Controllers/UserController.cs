using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public UserController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateUser(int id, [FromBody] User user)
    {
        var existing = _context.Users.FirstOrDefault(u => u.Id == id);
        if (existing == null) return NotFound();

        existing.Name = user.Name;
        existing.Email = user.Email;
        existing.Height = user.Height;
        existing.Weight = user.Weight;
        existing.Age = user.Age;
        existing.Gender = user.Gender;
        existing.ActivityLevel = user.ActivityLevel;
        existing.Goals = user.Goals;

        return Ok(existing);
    }

    [HttpPut("{id}/goals")]
    public IActionResult UpdateGoals(int id, [FromBody] DailyGoals goals)
    {
        var user = _context.Users.FirstOrDefault(u => u.Id == id);
        if (user == null) return NotFound();

        user.Goals = goals;
        return Ok(user);
    }

    [HttpPost("calculate-goals")]
    public IActionResult CalculateGoals([FromBody] User user)
    {
        var bmr = user.Gender.ToLower() == "male"
            ? 88.36 + (13.4 * user.Weight) + (4.8 * user.Height) - (5.7 * user.Age)
            : 447.6 + (9.2 * user.Weight) + (3.1 * user.Height) - (4.3 * user.Age);

        var activityMultipliers = new double[] { 1.2, 1.375, 1.55, 1.725, 1.9 };
        var tdee = bmr * activityMultipliers[Math.Min(user.ActivityLevel, 4)];

        var goals = new DailyGoals
        {
            Calories = (int)(tdee - 500),
            Protein = Math.Round(user.Weight * 1.6, 1),
            Carbs = Math.Round((tdee - 500) * 0.3 / 4, 1),
            Fat = Math.Round((tdee - 500) * 0.25 / 9, 1),
            Water = (int)(user.Weight * 35)
        };

        return Ok(goals);
    }
}
