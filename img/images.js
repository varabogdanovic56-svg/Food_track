// Product images - real photos from unsplash
const productImages = {
    // Мясо
    'Куриная грудка': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
    'Говядина': 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400',
    'Свинина': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
    'Индейка': 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400',
    'Утка': 'https://images.unsplash.com/photo-1619209421614-91c3428c72ca?w=400',
    'Баранина': 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400',
    'Кролик': 'https://images.unsplash.com/photo-1580554728847-634f2e5d5a96?w=400',
    'Ветчина': 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=400',
    'Бекон': 'https://images.unsplash.com/photo-1606851181064-d6a567a5d3b7?w=400',
    'Колбаса вареная': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    
    // Рыба и морепродукты
    'Лосось': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    'Тунец': 'https://images.unsplash.com/photo-1544510802-2f6d23c4085f?w=400',
    'Минтай': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Сельдь': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Скумбрия': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Треска': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Камбала': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Креветки': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    'Мидии': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400',
    'Кальмар': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
    
    // Молочное
    'Молоко 3.2%': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    'Творог 5%': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    'Творог обезжиренный': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    'Кефир 1%': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    'Сыр твердый (Чеддер)': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400',
    'Моцарелла': 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=400',
    'Пармезан': 'https://images.unsplash.com/photo-1571089055178-8c7c8c254632?w=400',
    'Йогурт натуральный': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    'Сметана 15%': 'https://images.unsplash.com/photo-1628087862856-6d2d4cdb8c97?w=400',
    'Сливки 10%': 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=400',
    
    // Яйца
    'Яйцо куриное': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    'Яйцо перепелиное': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    'Белок яичный': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    
    // Крупы
    'Рис белый': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Гречка': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Овсянка': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
    'Киноа': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Булгур': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Перловка': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Пшено': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Рис бурый': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Кус-кус': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    'Макароны': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    
    // Овощи
    'Брокколи': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
    'Морковь': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    'Помидор': 'https://images.unsplash.com/photo-1546470427-227c7369a9b5?w=400',
    'Огурец': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400',
    'Перец болгарский': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
    'Лук репчатый': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    'Чеснок': 'https://images.unsplash.com/photo-1615477221869-d608f6e5b2e7?w=400',
    'Капуста белокочанная': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400',
    'Шпинат': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
    'Салат': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    'Кабачок': 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=400',
    'Баклажан': 'https://images.unsplash.com/photo-1528826007177-f38517ce9a8b?w=400',
    'Свекла': 'https://images.unsplash.com/photo-1596362601603-1b8a8d9a299c?w=400',
    'Картофель': 'https://images.unsplash.com/photo-1518977676601-b53f82ber51a?w=400',
    'Кукуруза': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
    
    // Фрукты
    'Банан': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    'Яблоко': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    'Апельсин': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400',
    'Авокадо': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
    'Киви': 'https://images.unsplash.com/photo-1585917088467-45d7abd453b8?w=400',
    'Виноград': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400',
    'Клубника': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    'Малина': 'https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=400',
    'Груша': 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=400',
    'Персик': 'https://images.unsplash.com/photo-1595124240639-6ac31c977f3e?w=400',
    'Арбуз': 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400',
    'Дыня': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    
    // Орехи
    'Миндаль': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400',
    'Грецкие орехи': 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400',
    'Кешью': 'https://images.unsplash.com/photo-1599598425947-dd8170de4a81?w=400',
    'Фундук': 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400',
    'Арахис': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400',
    'Кедровые орехи': 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400',
    'Семена подсолнуха': 'https://images.unsplash.com/photo-1598631324487-22041fb76f5c?w=400',
    'Семена льна': 'https://images.unsplash.com/photo-1598631324487-22041fb76f5c?w=400',
    
    // Готовые блюда
    'Салат Цезарь': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    'Греческий салат': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    'Оливье': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    'Борщ': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Щи': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Суп куриный': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Уха': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    'Пельмени': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
    'Блины': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    'Омлет': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Яичница': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Вареники с картошкой': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400',
    'Голубцы': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Котлета куриная': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
    'Котлета говяжья': 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=400',
    'Шашлык свиной': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    'Стейк лосося': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    'Курица гриль': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    'Плов': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    'Макароны по-флотски': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    'Картофельное пюре': 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=400',
    'Рис отварной': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
};

// Recipe images - real photos
const recipeImages = {
    // Кето
    'Кето-омлет с авокадо и сыром': 'https://www.pinterest.com/pin/477874210481917717/',
    'Стейк лосося с маслом': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    'Куриные крылышки в духовке': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
    'Творожная запеканка кето': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    'Салат с тунцом и яйцом': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'Фаршированные шампиньоны': 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400',
    'Кето-стейк из говядины': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
    'Яичница с беконом': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Суп-пюре из цветной капусты': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Лосось в кокосовом молоке': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    
    // Веган
    'Веганский бургер': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    'Салат с киноа и авокадо': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    'Веганский карри': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    'Тофу с овощами на сковороде': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'Веганский суп с чечевицей': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Овсянка с ягодами и орехами': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
    'Веганские роллы с овощами': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    'Банановий смузи с арахисовой пастой': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
    'Запеченный батат с фасолью': 'https://images.unsplash.com/photo-1596097635121-14b63a7a6d23?w=400',
    'Веганский рагу': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    
    // Вегетарианское
    'Творожная запеканка с изюмом': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    'Омлет с грибами и сыром': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Сырники классические': 'https://images.unsplash.com/photo-1598214886806-c871d0b2e882?w=400',
    'Лазанья с овощами': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',
    'Греческий салат': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    'Рататуй': 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=400',
    'Вегетарианская пицца': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Яичница с шпинатом': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Фаршированные перцы': 'https://images.unsplash.com/photo-1601000938365-f182c5ec44e7?w=400',
    'Картофельная запеканка': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    
    // Безглютен
    'Куриная грудка с овощами': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
    'Лосось с спаржей': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    'Гречка с курицей': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    'Салат с тунцом без глютена': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'Рис с овощами и яйцом': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    'Куриные котлеты без муки': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
    'Овощной суп без глютена': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    'Тефтели из индейки': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
    'Салат Цезарь без глютена': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
    'Запеченная рыба с лимоном': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    
    // Низкоуглеводное
    'Курица с брокколи на сковороде': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
    'Свинина с овощами': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400',
    'Яичный низкоуглеводный хлеб': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    'Рыба с зеленой фасолью': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    'Творог с зеленью и огурцом': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    'Куриные бедра в духовке': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    'Салат с говядиной': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    'Омлет с лососем': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    'Фаршированные кабачки': 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=400',
    'Креветки с чесночным маслом': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400'
};

// Get product image
function getProductImage(productName) {
    return productImages[productName] || null;
}

// Get recipe image
function getRecipeImage(recipeName) {
    return recipeImages[recipeName] || null;
}
