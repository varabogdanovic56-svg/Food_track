using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WaterController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public WaterController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetWaterIntake([FromQuery] int userId = 1, [FromQuery] string? date = null)
    {
        var targetDate = date != null ? DateTime.Parse(date) : DateTime.Today;
        
        var intakes = _context.WaterIntakes
            .Where(w => w.UserId == userId && w.Date.Date == targetDate.Date)
            .ToList();

        var total = intakes.Sum(w => w.Amount);

        return Ok(new { total, intakes });
    }

    [HttpPost]
    public IActionResult AddWater([FromBody] WaterIntake intake)
    {
        intake.Id = _context.WaterIntakes.Count + 1;
        intake.Time = DateTime.Now;
        _context.WaterIntakes.Add(intake);

        return Ok(intake);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteWater(int id)
    {
        var intake = _context.WaterIntakes.FirstOrDefault(w => w.Id == id);
        if (intake == null) return NotFound();

        _context.WaterIntakes.Remove(intake);
        return Ok();
    }
}
