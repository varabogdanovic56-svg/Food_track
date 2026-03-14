using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public ProgressController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet("weight")]
    public IActionResult GetWeightRecords([FromQuery] int userId = 1, [FromQuery] int days = 30)
    {
        var startDate = DateTime.Today.AddDays(-days);
        
        var records = _context.WeightRecords
            .Where(w => w.UserId == userId && w.Date >= startDate)
            .OrderBy(w => w.Date)
            .ToList();

        return Ok(records);
    }

    [HttpPost("weight")]
    public IActionResult AddWeightRecord([FromBody] WeightRecord record)
    {
        record.Id = _context.WeightRecords.Count + 1;
        record.Date = DateTime.Today;
        _context.WeightRecords.Add(record);

        return Ok(record);
    }

    [HttpGet("current")]
    public IActionResult GetCurrentWeight([FromQuery] int userId = 1)
    {
        var latest = _context.WeightRecords
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.Date)
            .FirstOrDefault();

        return Ok(latest);
    }

    [HttpGet("calories")]
    public IActionResult GetCaloriesHistory([FromQuery] int userId = 1, [FromQuery] int days = 7)
    {
        var result = new List<object>();
        var random = new Random();

        for (int i = days - 1; i >= 0; i--)
        {
            var date = DateTime.Today.AddDays(-i);
            result.Add(new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Calories = random.Next(1600, 2400),
                Goal = 2000
            });
        }

        return Ok(result);
    }
}
