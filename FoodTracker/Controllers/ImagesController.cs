using Microsoft.AspNetCore.Mvc;

namespace FoodTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly string _recipeImagesPath;
    private readonly string _productImagesPath;

    public ImagesController(IWebHostEnvironment env)
    {
        var basePath = Path.GetFullPath(Path.Combine(env.ContentRootPath, ".."));
        _recipeImagesPath = Path.Combine(basePath, "img", "recipe");
        _productImagesPath = Path.Combine(basePath, "img", "product");
    }

    [HttpGet("recipe/{imageName}")]
    public IActionResult GetRecipeImage(string imageName)
    {
        var imagePath = Path.Combine(_recipeImagesPath, imageName);
        
        if (!System.IO.File.Exists(imagePath))
        {
            return NotFound($"Image not found: {imagePath}");
        }

        var imageBytes = System.IO.File.ReadAllBytes(imagePath);
        var contentType = GetContentType(imageName);

        return File(imageBytes, contentType);
    }

    [HttpGet("product/{imageName}")]
    public IActionResult GetProductImage(string imageName)
    {
        var imagePath = Path.Combine(_productImagesPath, imageName);
        
        if (!System.IO.File.Exists(imagePath))
        {
            return NotFound();
        }

        var imageBytes = System.IO.File.ReadAllBytes(imagePath);
        var contentType = GetContentType(imageName);

        return File(imageBytes, contentType);
    }

    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}
