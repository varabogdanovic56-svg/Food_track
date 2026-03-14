using Microsoft.AspNetCore.Mvc;
using FoodTracker.Data;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly FoodTrackerDbContext _context;

    public ProductsController(FoodTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetProducts([FromQuery] string? category = null, [FromQuery] string? search = null)
    {
        var products = _context.Products.AsEnumerable();

        if (!string.IsNullOrEmpty(category) && category != "all")
        {
            products = products.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrEmpty(search))
        {
            products = products.Where(p => p.Name.ToLower().Contains(search.ToLower()));
        }

        return Ok(products.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetProduct(int id)
    {
        var product = _context.Products.FirstOrDefault(p => p.Id == id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = _context.Products.Select(p => p.Category).Distinct().OrderBy(c => c).ToList();
        return Ok(categories);
    }
}
