namespace FoodTracker.Models;

public class Recommendation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RecommendationCategory Category { get; set; }
    public RecommendationPriority Priority { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum RecommendationCategory
{
    Nutrition = 0,
    Water = 1,
    Activity = 2,
    Progress = 3
}

public enum RecommendationPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

public class Dietitian
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int ConsultationPrice { get; set; }
    public string AvatarUrl { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
}

public class ChatMessage
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int DietitianId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsFromUser { get; set; }
    public string Role { get; set; } = "user";
    public DateTime Timestamp { get; set; }
}
