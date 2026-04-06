using FoodTracker.Data;
using FoodTracker.Services;
using dotenv.net;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);

var apiKey = Environment.GetEnvironmentVariable("OPENROUTER_API_KEY") ?? throw new Exception("API key not found");
Console.WriteLine($"Loaded API key: {apiKey.Substring(0, 20)}...");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddSingleton<FoodTrackerDbContext>();
builder.Services.AddHttpClient<TheMealDbService>();
builder.Services.AddHttpClient<DeepSeekService>();
builder.Services.AddControllers();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run("http://localhost:5001");
