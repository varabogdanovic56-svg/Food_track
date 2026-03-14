namespace FoodTracker.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double Height { get; set; }
    public double Weight { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = "male";
    public int ActivityLevel { get; set; } = 1;
    public DailyGoals Goals { get; set; } = new();
    public List<WeightRecord> WeightHistory { get; set; } = new();
    public List<Reminder> Reminders { get; set; } = new();
}

public class DailyGoals
{
    public int Calories { get; set; } = 2000;
    public double Protein { get; set; } = 100;
    public double Carbs { get; set; } = 250;
    public double Fat { get; set; } = 65;
    public int Water { get; set; } = 2000;
}

public class WeightRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public double Weight { get; set; }
    public double? MuscleMass { get; set; }
}
