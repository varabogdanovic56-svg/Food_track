namespace FoodTracker.Models;

public class Activity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public ActivityType Type { get; set; }
    public int DurationMinutes { get; set; }
    public double CaloriesBurned { get; set; }
    public DateTime Date { get; set; }
}

public enum ActivityType
{
    Walking = 0,
    Running = 1,
    Cycling = 2,
    Swimming = 3,
    Strength = 4,
    Yoga = 5
}

public class WaterIntake
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; }
    public int Amount { get; set; }
    public DateTime Time { get; set; }
}

public class Reminder
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public ReminderType Type { get; set; }
    public string Time { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public RepeatType Repeat { get; set; } = RepeatType.Daily;
}

public enum ReminderType
{
    Meal = 0,
    Water = 1,
    Activity = 2
}

public enum RepeatType
{
    Daily = 0,
    Weekly = 1,
    Custom = 2
}
