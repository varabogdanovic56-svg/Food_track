using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    private static readonly Dictionary<ActivityType, int> CaloriesPerMinute = new()
    {
        { ActivityType.Walking, 4 },
        { ActivityType.Running, 10 },
        { ActivityType.Cycling, 8 },
        { ActivityType.Swimming, 9 },
        { ActivityType.Strength, 6 },
        { ActivityType.Yoga, 3 }
    };

    public ActivityController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetActivities([FromQuery] int userId = 1, [FromQuery] string? date = null)
    {
        var targetDate = date != null ? DateTime.Parse(date) : DateTime.Today;
        
        var activities = _context.Activities
            .Where(a => a.UserId == userId && a.Date.Date == targetDate.Date)
            .ToList();

        return Ok(activities);
    }

    [HttpPost]
    public IActionResult AddActivity([FromBody] Activity activity)
    {
        var caloriesPerMin = CaloriesPerMinute.GetValueOrDefault(activity.Type, 5);
        activity.CaloriesBurned = activity.DurationMinutes * caloriesPerMin;
        
        activity.Id = _context.Activities.Count + 1;
        _context.Activities.Add(activity);

        return Ok(activity);
    }

    [HttpGet("summary")]
    public IActionResult GetActivitySummary([FromQuery] int userId = 1, [FromQuery] int days = 7)
    {
        var startDate = DateTime.Today.AddDays(-days);
        
        var activities = _context.Activities
            .Where(a => a.UserId == userId && a.Date >= startDate)
            .GroupBy(a => a.Date.Date)
            .Select(g => new
            {
                Date = g.Key,
                TotalCalories = g.Sum(a => a.CaloriesBurned),
                TotalMinutes = g.Sum(a => a.DurationMinutes)
            })
            .OrderByDescending(x => x.Date)
            .ToList();

        return Ok(activities);
    }
}
