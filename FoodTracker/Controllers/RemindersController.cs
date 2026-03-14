using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public RemindersController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetReminders([FromQuery] int userId = 1)
    {
        var reminders = _context.Reminders
            .Where(r => r.UserId == userId)
            .ToList();

        return Ok(reminders);
    }

    [HttpPost]
    public IActionResult AddReminder([FromBody] Reminder reminder)
    {
        reminder.Id = _context.Reminders.Count + 1;
        _context.Reminders.Add(reminder);

        return Ok(reminder);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateReminder(int id, [FromBody] Reminder reminder)
    {
        var existing = _context.Reminders.FirstOrDefault(r => r.Id == id);
        if (existing == null) return NotFound();

        existing.Time = reminder.Time;
        existing.Label = reminder.Label;
        existing.IsEnabled = reminder.IsEnabled;
        existing.Type = reminder.Type;
        existing.Repeat = reminder.Repeat;

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteReminder(int id)
    {
        var reminder = _context.Reminders.FirstOrDefault(r => r.Id == id);
        if (reminder == null) return NotFound();

        _context.Reminders.Remove(reminder);
        return Ok();
    }
}
