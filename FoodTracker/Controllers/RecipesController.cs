using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;
using FoodTracker.Models;
using FoodTracker.Services;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;
    private readonly TheMealDbService _theMealDbService;

    public RecipesController(FoodTrackerDbContext context, TheMealDbService theMealDbService)
    {
        _context = context;
        _theMealDbService = theMealDbService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecipes([FromQuery] string? dietType = null)
    {
        List<Recipe> recipes;
        
        try
        {
            recipes = await _theMealDbService.GetAllRecipesAsync();
            if (recipes == null || recipes.Count == 0)
            {
                recipes = _context.Recipes.ToList();
            }
        }
        catch
        {
            recipes = _context.Recipes.ToList();
        }

        if (!string.IsNullOrEmpty(dietType) && dietType != "all")
        {
            var dietTypes = new Dictionary<string, DietType>
            {
                { "keto", DietType.Keto },
                { "vegan", DietType.Vegan },
                { "vegetarian", DietType.Vegetarian },
                { "glutenfree", DietType.GlutenFree },
                { "lowcarb", DietType.LowCarb }
            };

            if (dietTypes.TryGetValue(dietType, out var filterType))
            {
                recipes = recipes.Where(r => r.DietTypes.HasFlag(filterType)).ToList();
            }
        }

        return Ok(recipes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRecipe(string id)
    {
        var recipe = await _theMealDbService.GetRecipeByIdAsync(id);
        if (recipe == null)
        {
            if (int.TryParse(id, out var intId))
            {
                recipe = _context.Recipes.FirstOrDefault(r => r.Id == intId);
            }
        }
        if (recipe == null) return NotFound();
        return Ok(recipe);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchRecipes([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query))
        {
            return Ok(new List<Recipe>());
        }
        
        try
        {
            var recipes = await _theMealDbService.SearchRecipesAsync(query);
            if (recipes == null || recipes.Count == 0)
            {
                recipes = _context.Recipes
                    .Where(r => r.Name.ToLower().Contains(query.ToLower()))
                    .ToList();
            }
            return Ok(recipes);
        }
        catch
        {
            var localRecipes = _context.Recipes
                .Where(r => r.Name.ToLower().Contains(query.ToLower()))
                .ToList();
            return Ok(localRecipes);
        }
    }

    [HttpGet("filter")]
    public async Task<IActionResult> FilterRecipes([FromQuery] string? category = null, [FromQuery] string? area = null)
    {
        List<Recipe> recipes;
        
        try
        {
            recipes = await _theMealDbService.GetAllRecipesAsync();
            if (recipes == null || recipes.Count == 0)
            {
                recipes = _context.Recipes.ToList();
            }
        }
        catch
        {
            recipes = _context.Recipes.ToList();
        }

        if (!string.IsNullOrEmpty(category))
        {
            recipes = recipes.Where(r => r.Description.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrEmpty(area))
        {
            recipes = recipes.Where(r => r.Area?.Equals(area, StringComparison.OrdinalIgnoreCase) == true).ToList();
        }

        return Ok(recipes);
    }
}
