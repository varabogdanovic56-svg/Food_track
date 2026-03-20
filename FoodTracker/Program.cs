using FoodTracker.Data;
using FoodTracker.Services;

var builder = WebApplication.CreateBuilder(args);

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

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run("http://localhost:5001");
