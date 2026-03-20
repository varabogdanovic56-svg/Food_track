using FoodTracker.Models;

namespace FoodTracker.Data;

public class FoodTrackerDbContext
{
    public List<User> Users { get; set; } = new();
    public List<Product> Products { get; set; } = new();
    public List<Recipe> Recipes { get; set; } = new();
    public List<Meal> Meals { get; set; } = new();
    public List<Activity> Activities { get; set; } = new();
    public List<WaterIntake> WaterIntakes { get; set; } = new();
    public List<Reminder> Reminders { get; set; } = new();
    public List<Recommendation> Recommendations { get; set; } = new();
    public List<Dietitian> Dietitians { get; set; } = new();
    public List<ChatMessage> ChatMessages { get; set; } = new();
    public List<WeightRecord> WeightRecords { get; set; } = new();

    public FoodTrackerDbContext()
    {
        InitializeData();
    }

    private void InitializeData()
    {
        Users = new List<User>
        {
            new User
            {
                Id = 1,
                Name = "User",
                Email = "user@example.com",
                Weight = 75,
                Height = 175,
                Age = 30,
                ActivityLevel = 2,
                Goals = new DailyGoals { Calories = 2000, Protein = 100, Carbs = 250, Fat = 65, Water = 2000 }
            }
        };

        // 100+ продуктов и блюд (на 100г)
        Products = new List<Product>
        {
            // МЯСО (10)
            new Product { Id = 1, Name = "Куриная грудка", Category = "Мясо", CaloriesPer100g = 165, ProteinPer100g = 31, CarbsPer100g = 0, FatPer100g = 3.6, DefaultGrams = 100 },
            new Product { Id = 2, Name = "Говядина", Category = "Мясо", CaloriesPer100g = 250, ProteinPer100g = 26, CarbsPer100g = 0, FatPer100g = 15, DefaultGrams = 100 },
            new Product { Id = 3, Name = "Свинина", Category = "Мясо", CaloriesPer100g = 242, ProteinPer100g = 27, CarbsPer100g = 0, FatPer100g = 14, DefaultGrams = 100 },
            new Product { Id = 4, Name = "Индейка", Category = "Мясо", CaloriesPer100g = 135, ProteinPer100g = 30, CarbsPer100g = 0, FatPer100g = 1, DefaultGrams = 100 },
            new Product { Id = 5, Name = "Утка", Category = "Мясо", CaloriesPer100g = 337, ProteinPer100g = 19, CarbsPer100g = 0, FatPer100g = 28, DefaultGrams = 100 },
            new Product { Id = 6, Name = "Баранина", Category = "Мясо", CaloriesPer100g = 294, ProteinPer100g = 25, CarbsPer100g = 0, FatPer100g = 21, DefaultGrams = 100 },
            new Product { Id = 7, Name = "Кролик", Category = "Мясо", CaloriesPer100g = 173, ProteinPer100g = 33, CarbsPer100g = 0, FatPer100g = 3.5, DefaultGrams = 100 },
            new Product { Id = 8, Name = "Ветчина", Category = "Мясо", CaloriesPer100g = 145, ProteinPer100g = 22, CarbsPer100g = 1, FatPer100g = 5, DefaultGrams = 50 },
            new Product { Id = 9, Name = "Бекон", Category = "Мясо", CaloriesPer100g = 541, ProteinPer100g = 37, CarbsPer100g = 1.4, FatPer100g = 42, DefaultGrams = 30 },
            new Product { Id = 10, Name = "Колбаса вареная", Category = "Мясо", CaloriesPer100g = 301, ProteinPer100g = 12, CarbsPer100g = 2, FatPer100g = 27, DefaultGrams = 50 },

            // РЫБА И МОРЕПРОДУКТЫ (10)
            new Product { Id = 11, Name = "Лосось", Category = "Рыба", CaloriesPer100g = 208, ProteinPer100g = 20, CarbsPer100g = 0, FatPer100g = 13, DefaultGrams = 150 },
            new Product { Id = 12, Name = "Тунец", Category = "Рыба", CaloriesPer100g = 130, ProteinPer100g = 29, CarbsPer100g = 0, FatPer100g = 1, DefaultGrams = 100 },
            new Product { Id = 13, Name = "Минтай", Category = "Рыба", CaloriesPer100g = 72, ProteinPer100g = 16, CarbsPer100g = 0, FatPer100g = 0.5, DefaultGrams = 150 },
            new Product { Id = 14, Name = "Сельдь", Category = "Рыба", CaloriesPer100g = 158, ProteinPer100g = 18, CarbsPer100g = 0, FatPer100g = 9, DefaultGrams = 100 },
            new Product { Id = 15, Name = "Скумбрия", Category = "Рыба", CaloriesPer100g = 205, ProteinPer100g = 19, CarbsPer100g = 0, FatPer100g = 14, DefaultGrams = 100 },
            new Product { Id = 16, Name = "Треска", Category = "Рыба", CaloriesPer100g = 82, ProteinPer100g = 18, CarbsPer100g = 0, FatPer100g = 0.7, DefaultGrams = 150 },
            new Product { Id = 17, Name = "Камбала", Category = "Рыба", CaloriesPer100g = 91, ProteinPer100g = 19, CarbsPer100g = 0, FatPer100g = 1, DefaultGrams = 150 },
            new Product { Id = 18, Name = "Креветки", Category = "Морепродукты", CaloriesPer100g = 99, ProteinPer100g = 24, CarbsPer100g = 0.2, FatPer100g = 0.3, DefaultGrams = 100 },
            new Product { Id = 19, Name = "Мидии", Category = "Морепродукты", CaloriesPer100g = 86, ProteinPer100g = 12, CarbsPer100g = 3, FatPer100g = 2, DefaultGrams = 100 },
            new Product { Id = 20, Name = "Кальмар", Category = "Морепродукты", CaloriesPer100g = 92, ProteinPer100g = 18, CarbsPer100g = 2, FatPer100g = 1, DefaultGrams = 100 },

            // МОЛОЧНОЕ (10)
            new Product { Id = 21, Name = "Молоко 3.2%", Category = "Молочное", CaloriesPer100g = 59, ProteinPer100g = 3.2, CarbsPer100g = 4.8, FatPer100g = 3.2, DefaultGrams = 250 },
            new Product { Id = 22, Name = "Творог 5%", Category = "Молочное", CaloriesPer100g = 121, ProteinPer100g = 17, CarbsPer100g = 3, FatPer100g = 5, DefaultGrams = 100 },
            new Product { Id = 23, Name = "Творог обезжиренный", Category = "Молочное", CaloriesPer100g = 76, ProteinPer100g = 16, CarbsPer100g = 2, FatPer100g = 0.5, DefaultGrams = 150 },
            new Product { Id = 24, Name = "Кефир 1%", Category = "Молочное", CaloriesPer100g = 40, ProteinPer100g = 3.3, CarbsPer100g = 4.7, FatPer100g = 1, DefaultGrams = 200 },
            new Product { Id = 25, Name = "Сыр твердый (Чеддер)", Category = "Молочное", CaloriesPer100g = 402, ProteinPer100g = 25, CarbsPer100g = 1.3, FatPer100g = 33, DefaultGrams = 30 },
            new Product { Id = 26, Name = "Моцарелла", Category = "Молочное", CaloriesPer100g = 280, ProteinPer100g = 28, CarbsPer100g = 3.1, FatPer100g = 17, DefaultGrams = 50 },
            new Product { Id = 27, Name = "Пармезан", Category = "Молочное", CaloriesPer100g = 431, ProteinPer100g = 38, CarbsPer100g = 4.1, FatPer100g = 29, DefaultGrams = 20 },
            new Product { Id = 28, Name = "Йогурт натуральный", Category = "Молочное", CaloriesPer100g = 59, ProteinPer100g = 10, CarbsPer100g = 3.6, FatPer100g = 0.7, DefaultGrams = 150 },
            new Product { Id = 29, Name = "Сметана 15%", Category = "Молочное", CaloriesPer100g = 158, ProteinPer100g = 3, CarbsPer100g = 3, FatPer100g = 15, DefaultGrams = 30 },
            new Product { Id = 30, Name = "Сливки 10%", Category = "Молочное", CaloriesPer100g = 118, ProteinPer100g = 2, CarbsPer100g = 3, FatPer100g = 10, DefaultGrams = 50 },

            // ЯЙЦА (3)
            new Product { Id = 31, Name = "Яйцо куриное", Category = "Яйца", CaloriesPer100g = 155, ProteinPer100g = 13, CarbsPer100g = 1.1, FatPer100g = 11, DefaultGrams = 50 },
            new Product { Id = 32, Name = "Яйцо перепелиное", Category = "Яйца", CaloriesPer100g = 158, ProteinPer100g = 13, CarbsPer100g = 0.6, FatPer100g = 11, DefaultGrams = 30 },
            new Product { Id = 33, Name = "Белок яичный", Category = "Яйца", CaloriesPer100g = 52, ProteinPer100g = 11, CarbsPer100g = 0.7, FatPer100g = 0.2, DefaultGrams = 100 },

            // КРУПЫ (10)
            new Product { Id = 34, Name = "Рис белый", Category = "Крупы", CaloriesPer100g = 130, ProteinPer100g = 2.7, CarbsPer100g = 28, FatPer100g = 0.3, DefaultGrams = 150 },
            new Product { Id = 35, Name = "Гречка", Category = "Крупы", CaloriesPer100g = 343, ProteinPer100g = 12.6, CarbsPer100g = 70, FatPer100g = 3.3, DefaultGrams = 100 },
            new Product { Id = 36, Name = "Овсянка", Category = "Крупы", CaloriesPer100g = 389, ProteinPer100g = 16.9, CarbsPer100g = 66, FatPer100g = 6.9, DefaultGrams = 80 },
            new Product { Id = 37, Name = "Киноа", Category = "Крупы", CaloriesPer100g = 120, ProteinPer100g = 4.4, CarbsPer100g = 21, FatPer100g = 1.9, DefaultGrams = 100 },
            new Product { Id = 38, Name = "Булгур", Category = "Крупы", CaloriesPer100g = 83, ProteinPer100g = 3.1, CarbsPer100g = 19, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 39, Name = "Перловка", Category = "Крупы", CaloriesPer100g = 123, ProteinPer100g = 3, CarbsPer100g = 28, FatPer100g = 0.4, DefaultGrams = 100 },
            new Product { Id = 40, Name = "Пшено", Category = "Крупы", CaloriesPer100g = 343, ProteinPer100g = 11, CarbsPer100g = 70, FatPer100g = 3.5, DefaultGrams = 100 },
            new Product { Id = 41, Name = "Рис бурый", Category = "Крупы", CaloriesPer100g = 111, ProteinPer100g = 2.6, CarbsPer100g = 23, FatPer100g = 0.9, DefaultGrams = 150 },
            new Product { Id = 42, Name = "Кус-кус", Category = "Крупы", CaloriesPer100g = 112, ProteinPer100g = 3.8, CarbsPer100g = 23, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 43, Name = "Макароны", Category = "Крупы", CaloriesPer100g = 131, ProteinPer100g = 5, CarbsPer100g = 25, FatPer100g = 1.1, DefaultGrams = 100 },

            // ОВОЩИ (15)
            new Product { Id = 44, Name = "Брокколи", Category = "Овощи", CaloriesPer100g = 34, ProteinPer100g = 2.8, CarbsPer100g = 7, FatPer100g = 0.4, DefaultGrams = 150 },
            new Product { Id = 45, Name = "Морковь", Category = "Овощи", CaloriesPer100g = 41, ProteinPer100g = 0.9, CarbsPer100g = 10, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 46, Name = "Помидор", Category = "Овощи", CaloriesPer100g = 18, ProteinPer100g = 0.9, CarbsPer100g = 3.9, FatPer100g = 0.2, DefaultGrams = 150 },
            new Product { Id = 47, Name = "Огурец", Category = "Овощи", CaloriesPer100g = 16, ProteinPer100g = 0.7, CarbsPer100g = 3.6, FatPer100g = 0.1, DefaultGrams = 150 },
            new Product { Id = 48, Name = "Перец болгарский", Category = "Овощи", CaloriesPer100g = 31, ProteinPer100g = 1, CarbsPer100g = 6, FatPer100g = 0.3, DefaultGrams = 100 },
            new Product { Id = 49, Name = "Лук репчатый", Category = "Овощи", CaloriesPer100g = 40, ProteinPer100g = 1.1, CarbsPer100g = 9, FatPer100g = 0.1, DefaultGrams = 80 },
            new Product { Id = 50, Name = "Чеснок", Category = "Овощи", CaloriesPer100g = 149, ProteinPer100g = 6.4, CarbsPer100g = 33, FatPer100g = 0.5, DefaultGrams = 10 },
            new Product { Id = 51, Name = "Капуста белокочанная", Category = "Овощи", CaloriesPer100g = 25, ProteinPer100g = 1.3, CarbsPer100g = 6, FatPer100g = 0.1, DefaultGrams = 150 },
            new Product { Id = 52, Name = "Шпинат", Category = "Овощи", CaloriesPer100g = 23, ProteinPer100g = 2.9, CarbsPer100g = 3.6, FatPer100g = 0.4, DefaultGrams = 50 },
            new Product { Id = 53, Name = "Салат", Category = "Овощи", CaloriesPer100g = 15, ProteinPer100g = 1.4, CarbsPer100g = 2.9, FatPer100g = 0.2, DefaultGrams = 50 },
            new Product { Id = 54, Name = "Кабачок", Category = "Овощи", CaloriesPer100g = 17, ProteinPer100g = 1.2, CarbsPer100g = 3.1, FatPer100g = 0.3, DefaultGrams = 150 },
            new Product { Id = 55, Name = "Баклажан", Category = "Овощи", CaloriesPer100g = 25, ProteinPer100g = 1, CarbsPer100g = 6, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 56, Name = "Свекла", Category = "Овощи", CaloriesPer100g = 43, ProteinPer100g = 1.6, CarbsPer100g = 10, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 57, Name = "Картофель", Category = "Овощи", CaloriesPer100g = 77, ProteinPer100g = 2, CarbsPer100g = 17, FatPer100g = 0.1, DefaultGrams = 150 },
            new Product { Id = 58, Name = "Кукуруза", Category = "Овощи", CaloriesPer100g = 86, ProteinPer100g = 3.3, CarbsPer100g = 19, FatPer100g = 1.4, DefaultGrams = 80 },

            // ФРУКТЫ (12)
            new Product { Id = 59, Name = "Банан", Category = "Фрукты", CaloriesPer100g = 89, ProteinPer100g = 1.1, CarbsPer100g = 23, FatPer100g = 0.3, DefaultGrams = 120 },
            new Product { Id = 60, Name = "Яблоко", Category = "Фрукты", CaloriesPer100g = 52, ProteinPer100g = 0.3, CarbsPer100g = 14, FatPer100g = 0.2, DefaultGrams = 150 },
            new Product { Id = 61, Name = "Апельсин", Category = "Фрукты", CaloriesPer100g = 47, ProteinPer100g = 0.9, CarbsPer100g = 12, FatPer100g = 0.1, DefaultGrams = 150 },
            new Product { Id = 62, Name = "Авокадо", Category = "Фрукты", CaloriesPer100g = 160, ProteinPer100g = 2, CarbsPer100g = 9, FatPer100g = 15, DefaultGrams = 100 },
            new Product { Id = 63, Name = "Киви", Category = "Фрукты", CaloriesPer100g = 61, ProteinPer100g = 1.1, CarbsPer100g = 15, FatPer100g = 0.5, DefaultGrams = 80 },
            new Product { Id = 64, Name = "Виноград", Category = "Фрукты", CaloriesPer100g = 69, ProteinPer100g = 0.7, CarbsPer100g = 18, FatPer100g = 0.2, DefaultGrams = 100 },
            new Product { Id = 65, Name = "Клубника", Category = "Фрукты", CaloriesPer100g = 32, ProteinPer100g = 0.7, CarbsPer100g = 8, FatPer100g = 0.3, DefaultGrams = 100 },
            new Product { Id = 66, Name = "Малина", Category = "Фрукты", CaloriesPer100g = 52, ProteinPer100g = 1.2, CarbsPer100g = 12, FatPer100g = 0.7, DefaultGrams = 100 },
            new Product { Id = 67, Name = "Груша", Category = "Фрукты", CaloriesPer100g = 57, ProteinPer100g = 0.4, CarbsPer100g = 15, FatPer100g = 0.1, DefaultGrams = 150 },
            new Product { Id = 68, Name = "Персик", Category = "Фрукты", CaloriesPer100g = 39, ProteinPer100g = 0.9, CarbsPer100g = 10, FatPer100g = 0.3, DefaultGrams = 150 },
            new Product { Id = 69, Name = "Арбуз", Category = "Фрукты", CaloriesPer100g = 30, ProteinPer100g = 0.6, CarbsPer100g = 8, FatPer100g = 0.1, DefaultGrams = 200 },
            new Product { Id = 70, Name = "Дыня", Category = "Фрукты", CaloriesPer100g = 33, ProteinPer100g = 0.8, CarbsPer100g = 8, FatPer100g = 0.2, DefaultGrams = 150 },

            // ОРЕХИ И СЕМЕНА (8)
            new Product { Id = 71, Name = "Миндаль", Category = "Орехи", CaloriesPer100g = 579, ProteinPer100g = 21, CarbsPer100g = 22, FatPer100g = 50, DefaultGrams = 30 },
            new Product { Id = 72, Name = "Грецкие орехи", Category = "Орехи", CaloriesPer100g = 654, ProteinPer100g = 15, CarbsPer100g = 14, FatPer100g = 65, DefaultGrams = 30 },
            new Product { Id = 73, Name = "Кешью", Category = "Орехи", CaloriesPer100g = 553, ProteinPer100g = 18, CarbsPer100g = 30, FatPer100g = 44, DefaultGrams = 30 },
            new Product { Id = 74, Name = "Фундук", Category = "Орехи", CaloriesPer100g = 628, ProteinPer100g = 15, CarbsPer100g = 17, FatPer100g = 61, DefaultGrams = 30 },
            new Product { Id = 75, Name = "Арахис", Category = "Орехи", CaloriesPer100g = 567, ProteinPer100g = 26, CarbsPer100g = 16, FatPer100g = 49, DefaultGrams = 30 },
            new Product { Id = 76, Name = "Кедровые орехи", Category = "Орехи", CaloriesPer100g = 673, ProteinPer100g = 14, CarbsPer100g = 13, FatPer100g = 68, DefaultGrams = 20 },
            new Product { Id = 77, Name = "Семена подсолнуха", Category = "Орехи", CaloriesPer100g = 584, ProteinPer100g = 21, CarbsPer100g = 20, FatPer100g = 51, DefaultGrams = 30 },
            new Product { Id = 78, Name = "Семена льна", Category = "Орехи", CaloriesPer100g = 534, ProteinPer100g = 18, CarbsPer100g = 29, FatPer100g = 42, DefaultGrams = 20 },

            // ГОТОВЫЕ БЛЮДА (22)
            new Product { Id = 79, Name = "Салат Цезарь", Category = "Блюда", CaloriesPer100g = 190, ProteinPer100g = 8, CarbsPer100g = 8, FatPer100g = 14, DefaultGrams = 200 },
            new Product { Id = 80, Name = "Греческий салат", Category = "Блюда", CaloriesPer100g = 120, ProteinPer100g = 4, CarbsPer100g = 6, FatPer100g = 9, DefaultGrams = 200 },
            new Product { Id = 81, Name = "Оливье", Category = "Блюда", CaloriesPer100g = 160, ProteinPer100g = 5, CarbsPer100g = 12, FatPer100g = 10, DefaultGrams = 200 },
            new Product { Id = 82, Name = "Борщ", Category = "Блюда", CaloriesPer100g = 45, ProteinPer100g = 2, CarbsPer100g = 6, FatPer100g = 1.5, DefaultGrams = 300 },
            new Product { Id = 83, Name = "Щи", Category = "Блюда", CaloriesPer100g = 32, ProteinPer100g = 1.5, CarbsPer100g = 4, FatPer100g = 1, DefaultGrams = 300 },
            new Product { Id = 84, Name = "Суп куриный", Category = "Блюда", CaloriesPer100g = 35, ProteinPer100g = 3, CarbsPer100g = 3, FatPer100g = 1.5, DefaultGrams = 300 },
            new Product { Id = 85, Name = "Уха", Category = "Блюда", CaloriesPer100g = 45, ProteinPer100g = 6, CarbsPer100g = 2, FatPer100g = 1.5, DefaultGrams = 300 },
            new Product { Id = 86, Name = "Пельмени", Category = "Блюда", CaloriesPer100g = 250, ProteinPer100g = 12, CarbsPer100g = 25, FatPer100g = 12, DefaultGrams = 250 },
            new Product { Id = 87, Name = "Блины", Category = "Блюда", CaloriesPer100g = 230, ProteinPer100g = 6, CarbsPer100g = 30, FatPer100g = 9, DefaultGrams = 150 },
            new Product { Id = 88, Name = "Омлет", Category = "Блюда", CaloriesPer100g = 215, ProteinPer100g = 14, CarbsPer100g = 2, FatPer100g = 17, DefaultGrams = 150 },
            new Product { Id = 89, Name = "Яичница", Category = "Блюда", CaloriesPer100g = 240, ProteinPer100g = 14, CarbsPer100g = 1, FatPer100g = 20, DefaultGrams = 120 },
            new Product { Id = 90, Name = "Вареники с картошкой", Category = "Блюда", CaloriesPer100g = 220, ProteinPer100g = 5, CarbsPer100g = 35, FatPer100g = 7, DefaultGrams = 200 },
            new Product { Id = 91, Name = "Голубцы", Category = "Блюда", CaloriesPer100g = 145, ProteinPer100g = 9, CarbsPer100g = 10, FatPer100g = 8, DefaultGrams = 250 },
            new Product { Id = 92, Name = "Котлета куриная", Category = "Блюда", CaloriesPer100g = 220, ProteinPer100g = 18, CarbsPer100g = 10, FatPer100g = 12, DefaultGrams = 100 },
            new Product { Id = 93, Name = "Котлета говяжья", Category = "Блюда", CaloriesPer100g = 260, ProteinPer100g = 17, CarbsPer100g = 8, FatPer100g = 18, DefaultGrams = 100 },
            new Product { Id = 94, Name = "Шашлык свиной", Category = "Блюда", CaloriesPer100g = 260, ProteinPer100g = 24, CarbsPer100g = 2, FatPer100g = 17, DefaultGrams = 150 },
            new Product { Id = 95, Name = "Стейк лосося", Category = "Блюда", CaloriesPer100g = 208, ProteinPer100g = 20, CarbsPer100g = 0, FatPer100g = 13, DefaultGrams = 150 },
            new Product { Id = 96, Name = "Курица гриль", Category = "Блюда", CaloriesPer100g = 190, ProteinPer100g = 25, CarbsPer100g = 0, FatPer100g = 10, DefaultGrams = 200 },
            new Product { Id = 97, Name = "Плов", Category = "Блюда", CaloriesPer100g = 160, ProteinPer100g = 7, CarbsPer100g = 20, FatPer100g = 6, DefaultGrams = 250 },
            new Product { Id = 98, Name = "Макароны по-флотски", Category = "Блюда", CaloriesPer100g = 220, ProteinPer100g = 9, CarbsPer100g = 25, FatPer100g = 10, DefaultGrams = 250 },
            new Product { Id = 99, Name = "Картофельное пюре", Category = "Блюда", CaloriesPer100g = 80, ProteinPer100g = 2, CarbsPer100g = 15, FatPer100g = 1.5, DefaultGrams = 200 },
            new Product { Id = 100, Name = "Рис отварной", Category = "Блюда", CaloriesPer100g = 113, ProteinPer100g = 2.4, CarbsPer100g = 25, FatPer100g = 0.2, DefaultGrams = 150 }
        };

        // Рецепты (будут загружены через API, но есть fallback)
        Recipes = new List<Recipe>
        {
            new Recipe { Id = 1, Name = "Куриная грудка с овощами", Description = "Запеченная курица с брокколи и болгарским перцем", Servings = 2, PrepTimeMinutes = 15, CookTimeMinutes = 35, DietTypes = DietType.Keto | DietType.GlutenFree | DietType.LowCarb, Cuisine = "Европейская", TotalNutrition = new NutritionalInfo { Calories = 380, Protein = 42, Carbs = 8, Fat = 18 }, IsCached = true },
            new Recipe { Id = 2, Name = "Стейк лосося", Description = "Лосось на сковороде с лимоном и зеленью", Servings = 2, PrepTimeMinutes = 10, CookTimeMinutes = 15, DietTypes = DietType.Keto | DietType.GlutenFree | DietType.LowCarb, Cuisine = "Скандинавская", TotalNutrition = new NutritionalInfo { Calories = 420, Protein = 38, Carbs = 2, Fat = 28 }, IsCached = true },
            new Recipe { Id = 3, Name = "Омлет с авокадо", Description = "Пышный омлет с авокадо и сыром", Servings = 1, PrepTimeMinutes = 5, CookTimeMinutes = 10, DietTypes = DietType.Keto | DietType.Vegetarian | DietType.GlutenFree, Cuisine = "Американская", TotalNutrition = new NutritionalInfo { Calories = 450, Protein = 24, Carbs = 6, Fat = 36 }, IsCached = true },
            new Recipe { Id = 4, Name = "Салат с тунцом", Description = "Салат из тунца с зеленью и оливковым маслом", Servings = 2, PrepTimeMinutes = 10, CookTimeMinutes = 0, DietTypes = DietType.Keto | DietType.GlutenFree | DietType.LowCarb, Cuisine = "Средиземноморская", TotalNutrition = new NutritionalInfo { Calories = 280, Protein = 32, Carbs = 4, Fat = 16 }, IsCached = true },
            new Recipe { Id = 5, Name = "Творожная запеканка", Description = "Запеканка из творога с ягодами", Servings = 4, PrepTimeMinutes = 15, CookTimeMinutes = 40, DietTypes = DietType.Vegetarian | DietType.GlutenFree, Cuisine = "Русская", TotalNutrition = new NutritionalInfo { Calories = 220, Protein = 18, Carbs = 12, Fat = 10 }, IsCached = true },
            new Recipe { Id = 6, Name = "Веганский салат с киноа", Description = "Салат с киноа, овощами и нутом", Servings = 2, PrepTimeMinutes = 15, CookTimeMinutes = 20, DietTypes = DietType.Vegan | DietType.Vegetarian | DietType.GlutenFree, Cuisine = "Средиземноморская", TotalNutrition = new NutritionalInfo { Calories = 380, Protein = 14, Carbs = 52, Fat = 14 }, IsCached = true },
            new Recipe { Id = 7, Name = "Котлета куриная", Description = "Домашние куриные котлеты", Servings = 4, PrepTimeMinutes = 20, CookTimeMinutes = 25, DietTypes = DietType.Balanced | DietType.GlutenFree, Cuisine = "Русская", TotalNutrition = new NutritionalInfo { Calories = 260, Protein = 28, Carbs = 8, Fat = 12 }, IsCached = true },
            new Recipe { Id = 8, Name = "Гречка с курицей", Description = "Гречка отварная с куриной грудкой", Servings = 2, PrepTimeMinutes = 10, CookTimeMinutes = 25, DietTypes = DietType.Balanced, Cuisine = "Русская", TotalNutrition = new NutritionalInfo { Calories = 380, Protein = 35, Carbs = 35, Fat = 8 }, IsCached = true },
            new Recipe { Id = 9, Name = "Овсянка с ягодами", Description = "Овсяная каша с черникой и орехами", Servings = 1, PrepTimeMinutes = 5, CookTimeMinutes = 10, DietTypes = DietType.Vegetarian | DietType.Balanced, Cuisine = "Европейская", TotalNutrition = new NutritionalInfo { Calories = 350, Protein = 12, Carbs = 55, Fat = 10 }, IsCached = true },
            new Recipe { Id = 10, Name = "Смузи протеиновый", Description = "Смузи с бананом, творогом и арахисовой пастой", Servings = 1, PrepTimeMinutes = 5, CookTimeMinutes = 0, DietTypes = DietType.Vegetarian | DietType.Balanced, Cuisine = "Американская", TotalNutrition = new NutritionalInfo { Calories = 320, Protein = 22, Carbs = 35, Fat = 10 }, IsCached = true }
        };

        Reminders = new List<Reminder>
        {
            new Reminder { Id = 1, UserId = 1, Type = ReminderType.Meal, Time = "08:00", Label = "Завтрак", IsEnabled = true },
            new Reminder { Id = 2, UserId = 1, Type = ReminderType.Meal, Time = "13:00", Label = "Обед", IsEnabled = true },
            new Reminder { Id = 3, UserId = 1, Type = ReminderType.Meal, Time = "19:00", Label = "Ужин", IsEnabled = true },
            new Reminder { Id = 4, UserId = 1, Type = ReminderType.Water, Time = "Каждые 2ч", Label = "Вода", IsEnabled = true }
        };

        Recommendations = new List<Recommendation>
        {
            new Recommendation { Id = 1, UserId = 1, Title = "Увеличьте калорийность", Description = "Вы съели только 70% от дневной нормы. Добавьте питательный перекус.", Category = RecommendationCategory.Nutrition, Priority = RecommendationPriority.High },
            new Recommendation { Id = 2, UserId = 1, Title = "Недостаток белка", Description = "Белок важен для мышц. Добавьте курицу, рыбу или творог.", Category = RecommendationCategory.Nutrition, Priority = RecommendationPriority.Medium },
            new Recommendation { Id = 3, UserId = 1, Title = "Пейте больше воды", Description = "Вы выпили только 40% от нормы. Вода важна для метаболизма.", Category = RecommendationCategory.Water, Priority = RecommendationPriority.High },
            new Recommendation { Id = 4, UserId = 1, Title = "Добавьте активность", Description = "Регулярные тренировки ускоряют результат.", Category = RecommendationCategory.Activity, Priority = RecommendationPriority.Low }
        };

        Dietitians = new List<Dietitian>
        {
            new Dietitian { Id = 1, Name = "Доктор Анна Дипсиковна", Specialization = "Диетология, нутрициология", Rating = 4.9, ConsultationPrice = 1500, IsOnline = true },
            new Dietitian { Id = 2, Name = "Михаил Петров", Specialization = "Спортивное питание", Rating = 4.8, ConsultationPrice = 2000, IsOnline = false },
            new Dietitian { Id = 3, Name = "Елена Козлова", Specialization = "Веганское питание", Rating = 4.7, ConsultationPrice = 1800, IsOnline = true }
        };

        WeightRecords = new List<WeightRecord>
        {
            new WeightRecord { Id = 1, UserId = 1, Date = DateTime.Now.AddDays(-30), Weight = 77, MuscleMass = 32 },
            new WeightRecord { Id = 2, UserId = 1, Date = DateTime.Now.AddDays(-25), Weight = 76.5, MuscleMass = 32.1 },
            new WeightRecord { Id = 3, UserId = 1, Date = DateTime.Now.AddDays(-20), Weight = 76, MuscleMass = 32.2 },
            new WeightRecord { Id = 4, UserId = 1, Date = DateTime.Now.AddDays(-15), Weight = 75.5, MuscleMass = 32.3 },
            new WeightRecord { Id = 5, UserId = 1, Date = DateTime.Now.AddDays(-10), Weight = 75.2, MuscleMass = 32.4 },
            new WeightRecord { Id = 6, UserId = 1, Date = DateTime.Now.AddDays(-5), Weight = 75, MuscleMass = 32.5 }
        };
    }
}
