import type { Core } from '@strapi/strapi';

export async function runSeed(strapi: Core.Strapi) {
  strapi.log.info('Running idempotent CMS seed...');

  // 1. Seed Categories
  const categoriesData = [
    { name: 'Breakfast', slug: 'breakfast', description: 'Start your day with wholesome morning dishes.' },
    { name: 'Lunch', slug: 'lunch', description: 'Quick and satisfying midday meals.' },
    { name: 'Dinner', slug: 'dinner', description: 'Hearty dinners for family and entertaining.' },
    { name: 'Dessert', slug: 'dessert', description: 'Sweet treats, baked goods, and delightful sweets.' },
    { name: 'Snacks', slug: 'snacks', description: 'Bite-sized treats and afternoon pick-me-ups.' },
    { name: 'Drinks', slug: 'drinks', description: 'Refreshing smoothies, mocktails, and warm beverages.' },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoriesData) {
    let existing = await strapi.documents('api::category.category').findFirst({
      filters: { slug: { $eq: cat.slug } },
    });
    if (!existing) {
      existing = await strapi.documents('api::category.category').create({
        data: cat,
      });
    }
    categoryMap.set(cat.slug, existing);
  }

  // 2. Seed Tags
  const tagsData = [
    { name: 'vegan', slug: 'vegan' },
    { name: 'vegetarian', slug: 'vegetarian' },
    { name: 'gluten-free', slug: 'gluten-free' },
    { name: 'quick', slug: 'quick' },
    { name: 'spicy', slug: 'spicy' },
    { name: 'one-pot', slug: 'one-pot' },
    { name: 'healthy', slug: 'healthy' },
  ];

  const tagMap = new Map<string, any>();
  for (const tag of tagsData) {
    let existing = await strapi.documents('api::tag.tag').findFirst({
      filters: { slug: { $eq: tag.slug } },
    });
    if (!existing) {
      existing = await strapi.documents('api::tag.tag').create({
        data: tag,
      });
    }
    tagMap.set(tag.slug, existing);
  }

  // 3. Seed Ingredients
  const ingredientsData = [
    { name: 'All-purpose flour', slug: 'all-purpose-flour' },
    { name: 'Baking powder', slug: 'baking-powder' },
    { name: 'Sugar', slug: 'sugar' },
    { name: 'Salt', slug: 'salt' },
    { name: 'Milk', slug: 'milk' },
    { name: 'Egg', slug: 'egg' },
    { name: 'Butter', slug: 'butter' },
    { name: 'Blueberries', slug: 'blueberries' },
    { name: 'Maple syrup', slug: 'maple-syrup' },
    { name: 'Spaghetti', slug: 'spaghetti' },
    { name: 'Pancetta or Guanciale', slug: 'pancetta' },
    { name: 'Pecorino Romano cheese', slug: 'pecorino-romano' },
    { name: 'Black pepper', slug: 'black-pepper' },
    { name: 'Pizza dough', slug: 'pizza-dough' },
    { name: 'Tomato sauce', slug: 'tomato-sauce' },
    { name: 'Fresh mozzarella', slug: 'fresh-mozzarella' },
    { name: 'Fresh basil', slug: 'fresh-basil' },
    { name: 'Extra virgin olive oil', slug: 'olive-oil' },
    { name: 'Quinoa', slug: 'quinoa' },
    { name: 'Cucumber', slug: 'cucumber' },
    { name: 'Cherry tomatoes', slug: 'cherry-tomatoes' },
    { name: 'Kalamata olives', slug: 'kalamata-olives' },
    { name: 'Feta cheese', slug: 'feta-cheese' },
    { name: 'Lemon juice', slug: 'lemon-juice' },
    { name: 'Chicken breast', slug: 'chicken-breast' },
    { name: 'Yogurt', slug: 'yogurt' },
    { name: 'Garam masala', slug: 'garam-masala' },
    { name: 'Garlic', slug: 'garlic' },
    { name: 'Ginger', slug: 'ginger' },
    { name: 'Heavy cream', slug: 'heavy-cream' },
    { name: 'Brown lentils', slug: 'brown-lentils' },
    { name: 'Carrots', slug: 'carrots' },
    { name: 'Celery', slug: 'celery' },
    { name: 'Onion', slug: 'onion' },
    { name: 'Vegetable broth', slug: 'vegetable-broth' },
    { name: 'Cumin', slug: 'cumin' },
    { name: 'White fish fillets', slug: 'white-fish-fillets' },
    { name: 'Corn tortillas', slug: 'corn-tortillas' },
    { name: 'Shredded cabbage', slug: 'shredded-cabbage' },
    { name: 'Lime', slug: 'lime' },
    { name: 'Spinach', slug: 'spinach' },
    { name: 'Green apple', slug: 'green-apple' },
    { name: 'Banana', slug: 'banana' },
    { name: 'Chia seeds', slug: 'chia-seeds' },
    { name: 'Chocolate chips', slug: 'chocolate-chips' },
    { name: 'Vanilla extract', slug: 'vanilla-extract' },
    { name: 'Broccoli florets', slug: 'broccoli-florets' },
    { name: 'Bell peppers', slug: 'bell-peppers' },
    { name: 'Soy sauce', slug: 'soy-sauce' },
    { name: 'Sesame oil', slug: 'sesame-oil' },
  ];

  const ingredientMap = new Map<string, any>();
  for (const ing of ingredientsData) {
    let existing = await strapi.documents('api::ingredient.ingredient').findFirst({
      filters: { slug: { $eq: ing.slug } },
    });
    if (!existing) {
      existing = await strapi.documents('api::ingredient.ingredient').create({
        data: ing,
      });
    }
    ingredientMap.set(ing.slug, existing);
  }

  // 4. Seed Recipes (10 recipes)
  const recipesData = [
    {
      title: 'Fluffy Blueberry Pancakes',
      slug: 'fluffy-blueberry-pancakes',
      description: 'Golden, cloud-soft buttermilk pancakes packed with juicy bursting blueberries.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 4,
      difficulty: 'easy',
      featured: true,
      categorySlugs: ['breakfast'],
      tagSlugs: ['vegetarian', 'quick'],
      ingredients: [
        { quantity: 2, unit: 'cup', ingredient: 'all-purpose-flour', note: 'sifted', group: 'Dry' },
        { quantity: 2, unit: 'tbsp', ingredient: 'sugar', note: null, group: 'Dry' },
        { quantity: 2, unit: 'tsp', ingredient: 'baking-powder', note: null, group: 'Dry' },
        { quantity: 0.5, unit: 'tsp', ingredient: 'salt', note: null, group: 'Dry' },
        { quantity: 1.5, unit: 'cup', ingredient: 'milk', note: 'room temperature', group: 'Wet' },
        { quantity: 2, unit: 'piece', ingredient: 'egg', note: 'large', group: 'Wet' },
        { quantity: 3, unit: 'tbsp', ingredient: 'butter', note: 'melted', group: 'Wet' },
        { quantity: 1, unit: 'cup', ingredient: 'blueberries', note: 'fresh or frozen', group: null },
      ],
      steps: [
        { instruction: 'Whisk flour, sugar, baking powder, and salt together in a large mixing bowl.', timerMinutes: 2 },
        { instruction: 'In another bowl, whisk together milk, eggs, and melted butter.', timerMinutes: 2 },
        { instruction: 'Pour the wet ingredients into the dry ingredients and stir gently until just combined. Fold in blueberries gently.', timerMinutes: 2 },
        { instruction: 'Heat a nonstick skillet over medium heat. Pour 1/4 cup batter per pancake and cook until bubbles form on top, about 2-3 minutes. Flip and cook for another 1-2 minutes.', timerMinutes: 4 },
        { instruction: 'Serve warm with pure maple syrup and extra butter.', timerMinutes: null },
      ],
      nutrition: { calories: 310, proteinGrams: 8, carbsGrams: 48, fatGrams: 10, fiberGrams: 3 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'For fluffier pancakes, let the batter rest for 10 minutes before cooking.' }] }],
    },
    {
      title: 'Classic Creamy Spaghetti Carbonara',
      slug: 'classic-spaghetti-carbonara',
      description: 'Authentic Roman pasta prepared with crispy guanciale, velvety egg yolks, and sharp Pecorino Romano.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 4,
      difficulty: 'medium',
      featured: true,
      categorySlugs: ['dinner'],
      tagSlugs: ['quick'],
      ingredients: [
        { quantity: 400, unit: 'g', ingredient: 'spaghetti', note: null, group: null },
        { quantity: 150, unit: 'g', ingredient: 'pancetta', note: 'diced into cubes', group: null },
        { quantity: 4, unit: 'piece', ingredient: 'egg', note: '3 yolks plus 1 whole egg', group: null },
        { quantity: 80, unit: 'g', ingredient: 'pecorino-romano', note: 'freshly grated', group: null },
        { quantity: 1, unit: 'tsp', ingredient: 'black-pepper', note: 'coarsely ground', group: null },
      ],
      steps: [
        { instruction: 'Bring a large pot of salted water to a rolling boil and cook spaghetti until al dente.', timerMinutes: 9 },
        { instruction: 'While pasta cooks, crisp the pancetta in a large skillet over medium heat until golden brown, then remove from heat.', timerMinutes: 6 },
        { instruction: 'Whisk the whole egg, egg yolks, grated Pecorino Romano, and cracked black pepper together in a bowl.', timerMinutes: 2 },
        { instruction: 'Transfer hot pasta directly to the skillet with pancetta. Stir in a ladle of reserved pasta water.', timerMinutes: 1 },
        { instruction: 'Remove skillet from heat completely and vigorously stir in the egg mixture to create a glossy, creamy emulsion without curdling.', timerMinutes: 2 },
      ],
      nutrition: { calories: 580, proteinGrams: 24, carbsGrams: 62, fatGrams: 26, fiberGrams: 3 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Never use cream in authentic carbonara. The silkiness comes strictly from the emulsion of eggs, cheese, and starchy pasta cooking water.' }] }],
    },
    {
      title: 'Fresh Margherita Pizza',
      slug: 'fresh-margherita-pizza',
      description: 'Crisp Neapolitan crust topped with rich tomato sauce, melted fresh mozzarella, and sweet fresh basil.',
      prepTimeMinutes: 20,
      cookTimeMinutes: 12,
      servings: 3,
      difficulty: 'medium',
      featured: true,
      categorySlugs: ['dinner', 'lunch'],
      tagSlugs: ['vegetarian'],
      ingredients: [
        { quantity: 1, unit: 'piece', ingredient: 'pizza-dough', note: 'room temperature', group: null },
        { quantity: 0.5, unit: 'cup', ingredient: 'tomato-sauce', note: 'San Marzano style', group: null },
        { quantity: 200, unit: 'g', ingredient: 'fresh-mozzarella', note: 'torn into chunks', group: null },
        { quantity: 10, unit: 'piece', ingredient: 'fresh-basil', note: 'fresh leaves', group: null },
        { quantity: 1, unit: 'tbsp', ingredient: 'olive-oil', note: 'extra virgin', group: null },
      ],
      steps: [
        { instruction: 'Preheat oven to highest setting (at least 250°C / 480°F) with a pizza stone inside.', timerMinutes: 20 },
        { instruction: 'Stretch pizza dough gently on a floured surface into a 12-inch circle with raised edges.', timerMinutes: 5 },
        { instruction: 'Spread tomato sauce evenly, leaving a 1-inch crust border.', timerMinutes: 2 },
        { instruction: 'Distribute mozzarella evenly and drizzle lightly with extra virgin olive oil.', timerMinutes: 2 },
        { instruction: 'Bake for 10-12 minutes until crust is browned and cheese is bubbling. Garnish with fresh basil before slicing.', timerMinutes: 11 },
      ],
      nutrition: { calories: 450, proteinGrams: 18, carbsGrams: 55, fatGrams: 16, fiberGrams: 4 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Add fresh basil right after taking the pizza out of the oven to keep it bright green and fragrant.' }] }],
    },
    {
      title: 'Vibrant Mediterranean Quinoa Salad',
      slug: 'vibrant-mediterranean-quinoa-salad',
      description: 'Zesty lemon vinaigrette tossed with fluffy quinoa, crisp cucumbers, tomatoes, and tangy kalamata olives.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 4,
      difficulty: 'easy',
      featured: false,
      categorySlugs: ['lunch'],
      tagSlugs: ['vegetarian', 'gluten-free', 'healthy'],
      ingredients: [
        { quantity: 1, unit: 'cup', ingredient: 'quinoa', note: 'rinsed', group: 'Base' },
        { quantity: 2, unit: 'cup', ingredient: 'vegetable-broth', note: null, group: 'Base' },
        { quantity: 1, unit: 'piece', ingredient: 'cucumber', note: 'diced', group: 'Veggies' },
        { quantity: 1, unit: 'cup', ingredient: 'cherry-tomatoes', note: 'halved', group: 'Veggies' },
        { quantity: 0.5, unit: 'cup', ingredient: 'kalamata-olives', note: 'pitted & sliced', group: 'Veggies' },
        { quantity: 100, unit: 'g', ingredient: 'feta-cheese', note: 'crumbled', group: 'Veggies' },
        { quantity: 3, unit: 'tbsp', ingredient: 'olive-oil', note: null, group: 'Dressing' },
        { quantity: 2, unit: 'tbsp', ingredient: 'lemon-juice', note: 'freshly squeezed', group: 'Dressing' },
      ],
      steps: [
        { instruction: 'Simmer rinsed quinoa in vegetable broth for 15 minutes until liquid is absorbed. Fluff with a fork and cool.', timerMinutes: 15 },
        { instruction: 'In a small bowl, whisk extra virgin olive oil, lemon juice, salt, and pepper.', timerMinutes: 3 },
        { instruction: 'In a large salad bowl, combine cooled quinoa, diced cucumber, tomatoes, olives, and feta cheese.', timerMinutes: 5 },
        { instruction: 'Drizzle dressing over the salad and toss gently to coat.', timerMinutes: 2 },
      ],
      nutrition: { calories: 290, proteinGrams: 9, carbsGrams: 32, fatGrams: 14, fiberGrams: 5 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'This salad keeps exceptionally well in the fridge for up to 4 days, making it ideal for weekday meal prep.' }] }],
    },
    {
      title: 'Aromatic Chicken Tikka Masala',
      slug: 'aromatic-chicken-tikka-masala',
      description: 'Tender marinated chicken pieces simmered in a spiced, velvety tomato-cream sauce with fragrant basmati aroma.',
      prepTimeMinutes: 25,
      cookTimeMinutes: 30,
      servings: 4,
      difficulty: 'medium',
      featured: true,
      categorySlugs: ['dinner'],
      tagSlugs: ['spicy', 'gluten-free'],
      ingredients: [
        { quantity: 600, unit: 'g', ingredient: 'chicken-breast', note: 'cut into bite-sized pieces', group: 'Marinade' },
        { quantity: 0.5, unit: 'cup', ingredient: 'yogurt', note: 'plain whole milk', group: 'Marinade' },
        { quantity: 2, unit: 'tsp', ingredient: 'garam-masala', note: null, group: 'Marinade' },
        { quantity: 3, unit: 'clove', ingredient: 'garlic', note: 'minced', group: 'Sauce' },
        { quantity: 1, unit: 'tbsp', ingredient: 'ginger', note: 'grated', group: 'Sauce' },
        { quantity: 1, unit: 'cup', ingredient: 'tomato-sauce', note: 'crushed tomato puree', group: 'Sauce' },
        { quantity: 0.5, unit: 'cup', ingredient: 'heavy-cream', note: null, group: 'Sauce' },
      ],
      steps: [
        { instruction: 'Combine yogurt, garam masala, garlic, and chicken pieces in a bowl. Marinate for at least 20 minutes.', timerMinutes: 20 },
        { instruction: 'Broil chicken pieces on high heat for 8-10 minutes until edges are lightly charred.', timerMinutes: 10 },
        { instruction: 'In a deep pan, saute garlic and ginger in olive oil until aromatic, then stir in tomato sauce and simmer.', timerMinutes: 10 },
        { instruction: 'Stir in heavy cream and chicken pieces. Simmer gently on low heat for 10 minutes until sauce thickens.', timerMinutes: 10 },
      ],
      nutrition: { calories: 420, proteinGrams: 38, carbsGrams: 14, fatGrams: 22, fiberGrams: 2 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Serve with warm garlic naan or steamed basmati rice.' }] }],
    },
    {
      title: 'Hearty Golden Lentil Soup',
      slug: 'hearty-golden-lentil-soup',
      description: 'Warming, nourishing one-pot soup packed with protein-rich lentils, diced root vegetables, and fragrant cumin.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 30,
      servings: 6,
      difficulty: 'easy',
      featured: false,
      categorySlugs: ['dinner', 'lunch'],
      tagSlugs: ['vegan', 'vegetarian', 'one-pot', 'healthy', 'gluten-free'],
      ingredients: [
        { quantity: 1.5, unit: 'cup', ingredient: 'brown-lentils', note: 'rinsed', group: null },
        { quantity: 1, unit: 'piece', ingredient: 'onion', note: 'chopped', group: null },
        { quantity: 2, unit: 'piece', ingredient: 'carrots', note: 'diced', group: null },
        { quantity: 2, unit: 'piece', ingredient: 'celery', note: 'sliced', group: null },
        { quantity: 3, unit: 'clove', ingredient: 'garlic', note: 'minced', group: null },
        { quantity: 1, unit: 'tsp', ingredient: 'cumin', note: 'ground', group: null },
        { quantity: 6, unit: 'cup', ingredient: 'vegetable-broth', note: null, group: null },
        { quantity: 1, unit: 'piece', ingredient: 'lemon-juice', note: 'squeeze at the end', group: null },
      ],
      steps: [
        { instruction: 'Heat olive oil in a large stockpot over medium heat. Saute onion, carrots, and celery until softened.', timerMinutes: 7 },
        { instruction: 'Add garlic and ground cumin; cook for 1 minute until fragrant.', timerMinutes: 1 },
        { instruction: 'Pour in rinsed lentils and vegetable broth. Bring to a rolling boil, then lower heat and simmer covered.', timerMinutes: 25 },
        { instruction: 'Season with salt and pepper, stir in fresh lemon juice, and serve piping hot.', timerMinutes: 2 },
      ],
      nutrition: { calories: 230, proteinGrams: 13, carbsGrams: 38, fatGrams: 4, fiberGrams: 11 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'You can blend two cups of the soup with an immersion blender for a richer, creamier consistency.' }] }],
    },
    {
      title: 'Crispy Baja Fish Tacos',
      slug: 'crispy-baja-fish-tacos',
      description: 'Flaky white fish seasoned to perfection, served on warm corn tortillas with crunchy lime slaw and crema.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      servings: 4,
      difficulty: 'easy',
      featured: false,
      categorySlugs: ['dinner', 'lunch'],
      tagSlugs: ['quick'],
      ingredients: [
        { quantity: 450, unit: 'g', ingredient: 'white-fish-fillets', note: 'cod or tilapia', group: null },
        { quantity: 8, unit: 'piece', ingredient: 'corn-tortillas', note: null, group: null },
        { quantity: 2, unit: 'cup', ingredient: 'shredded-cabbage', note: null, group: 'Slaw' },
        { quantity: 2, unit: 'piece', ingredient: 'lime', note: 'juiced', group: 'Slaw' },
        { quantity: 2, unit: 'tbsp', ingredient: 'olive-oil', note: null, group: null },
      ],
      steps: [
        { instruction: 'Toss shredded cabbage with fresh lime juice, salt, and olive oil in a bowl. Let sit to soften.', timerMinutes: 5 },
        { instruction: 'Season fish fillets with cumin, paprika, salt, and pepper.', timerMinutes: 3 },
        { instruction: 'Pan-sear fish in hot olive oil for 3-4 minutes per side until flaky and cooked through.', timerMinutes: 8 },
        { instruction: 'Warm tortillas in a dry skillet for 30 seconds each.', timerMinutes: 4 },
        { instruction: 'Assemble tacos by flaking fish into warm tortillas and topping generously with crunchy lime slaw.', timerMinutes: 3 },
      ],
      nutrition: { calories: 340, proteinGrams: 28, carbsGrams: 32, fatGrams: 10, fiberGrams: 4 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Top with sliced avocado or chipotle crema for added creaminess.' }] }],
    },
    {
      title: 'Green Glow Detox Smoothie',
      slug: 'green-glow-detox-smoothie',
      description: 'Nutrient-packed morning smoothie with leafy baby spinach, crisp green apples, bananas, and chia seeds.',
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 2,
      difficulty: 'easy',
      featured: false,
      categorySlugs: ['breakfast', 'drinks'],
      tagSlugs: ['vegan', 'vegetarian', 'quick', 'healthy', 'gluten-free'],
      ingredients: [
        { quantity: 2, unit: 'cup', ingredient: 'spinach', note: 'fresh baby leaves', group: null },
        { quantity: 1, unit: 'piece', ingredient: 'green-apple', note: 'cored and chopped', group: null },
        { quantity: 1, unit: 'piece', ingredient: 'banana', note: 'frozen', group: null },
        { quantity: 1, unit: 'tbsp', ingredient: 'chia-seeds', note: null, group: null },
        { quantity: 1.5, unit: 'cup', ingredient: 'milk', note: 'almond or oat milk', group: null },
      ],
      steps: [
        { instruction: 'Add milk and baby spinach to a high-speed blender first.', timerMinutes: 1 },
        { instruction: 'Add green apple chunks, frozen banana, and chia seeds.', timerMinutes: 1 },
        { instruction: 'Blend on high for 60 to 90 seconds until completely smooth and creamy.', timerMinutes: 2 },
        { instruction: 'Pour into glasses and enjoy immediately.', timerMinutes: 1 },
      ],
      nutrition: { calories: 180, proteinGrams: 4, carbsGrams: 36, fatGrams: 3, fiberGrams: 7 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Using a frozen banana gives the smoothie an ultra-thick milkshake texture without needing ice cubes.' }] }],
    },
    {
      title: 'Chewy Golden Chocolate Chip Cookies',
      slug: 'chewy-chocolate-chip-cookies',
      description: 'Bakery-style soft and chewy cookies studded with melting pools of semi-sweet dark chocolate chips.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 12,
      servings: 12,
      difficulty: 'easy',
      featured: true,
      categorySlugs: ['dessert', 'snacks'],
      tagSlugs: ['vegetarian'],
      ingredients: [
        { quantity: 2.25, unit: 'cup', ingredient: 'all-purpose-flour', note: null, group: 'Dry' },
        { quantity: 1, unit: 'tsp', ingredient: 'baking-powder', note: null, group: 'Dry' },
        { quantity: 1, unit: 'cup', ingredient: 'butter', note: 'softened', group: 'Wet' },
        { quantity: 0.75, unit: 'cup', ingredient: 'sugar', note: 'granulated white', group: 'Wet' },
        { quantity: 2, unit: 'piece', ingredient: 'egg', note: 'room temperature', group: 'Wet' },
        { quantity: 2, unit: 'tsp', ingredient: 'vanilla-extract', note: null, group: 'Wet' },
        { quantity: 1.5, unit: 'cup', ingredient: 'chocolate-chips', note: 'semi-sweet', group: null },
      ],
      steps: [
        { instruction: 'Preheat oven to 190°C (375°F) and line baking sheets with parchment paper.', timerMinutes: 5 },
        { instruction: 'Cream softened butter and sugars together until smooth and pale.', timerMinutes: 4 },
        { instruction: 'Beat in eggs one at a time, followed by vanilla extract.', timerMinutes: 2 },
        { instruction: 'Gradually mix in dry ingredients until just combined, then fold in chocolate chips.', timerMinutes: 2 },
        { instruction: 'Drop rounded tablespoons onto baking sheets and bake for 9-11 minutes until edges are golden.', timerMinutes: 10 },
      ],
      nutrition: { calories: 210, proteinGrams: 3, carbsGrams: 28, fatGrams: 11, fiberGrams: 1 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'Sprinkle with flaky sea salt immediately as they come out of the oven for a bakery finish.' }] }],
    },
    {
      title: 'Sizzling Garlic Sesame Vegetable Stir-Fry',
      slug: 'sizzling-vegetable-stir-fry',
      description: 'Vibrant, crunchy seasonal vegetables flash-seared in a savory garlic-soy sauce with nutty toasted sesame oil.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      servings: 4,
      difficulty: 'easy',
      featured: false,
      categorySlugs: ['dinner', 'lunch'],
      tagSlugs: ['vegan', 'vegetarian', 'quick', 'one-pot', 'healthy'],
      ingredients: [
        { quantity: 2, unit: 'cup', ingredient: 'broccoli-florets', note: 'cut small', group: 'Veggies' },
        { quantity: 1, unit: 'piece', ingredient: 'bell-peppers', note: 'sliced into strips', group: 'Veggies' },
        { quantity: 1, unit: 'piece', ingredient: 'carrots', note: 'thinly julienned', group: 'Veggies' },
        { quantity: 3, unit: 'clove', ingredient: 'garlic', note: 'sliced thin', group: 'Sauce' },
        { quantity: 3, unit: 'tbsp', ingredient: 'soy-sauce', note: null, group: 'Sauce' },
        { quantity: 1, unit: 'tbsp', ingredient: 'sesame-oil', note: 'toasted', group: 'Sauce' },
      ],
      steps: [
        { instruction: 'Whisk soy sauce, sesame oil, and minced garlic together in a bowl.', timerMinutes: 2 },
        { instruction: 'Heat a wok or large heavy skillet over high heat with 1 tablespoon oil.', timerMinutes: 2 },
        { instruction: 'Add broccoli florets and carrots; stir-fry vigorously for 3-4 minutes until tender-crisp.', timerMinutes: 4 },
        { instruction: 'Add bell peppers and pour in the sauce. Toss continuously for 2 minutes until glossy.', timerMinutes: 2 },
        { instruction: 'Garnish with toasted sesame seeds and serve immediately over steamed rice.', timerMinutes: 1 },
      ],
      nutrition: { calories: 120, proteinGrams: 4, carbsGrams: 14, fatGrams: 6, fiberGrams: 4 },
      notes: [{ type: 'paragraph', children: [{ type: 'text', text: 'High heat is the secret to keeping the vegetables crisp and vibrant without getting soggy.' }] }],
    },
  ];

  for (const recipe of recipesData) {
    const existing = await strapi.documents('api::recipe.recipe').findFirst({
      filters: { slug: { $eq: recipe.slug } },
    });
    if (existing) {
      continue;
    }

    const categoryIds = recipe.categorySlugs
      .map((slug) => categoryMap.get(slug)?.documentId)
      .filter(Boolean);

    const tagIds = recipe.tagSlugs
      .map((slug) => tagMap.get(slug)?.documentId)
      .filter(Boolean);

    const mappedIngredients = recipe.ingredients.map((item) => ({
      quantity: item.quantity,
      unit: item.unit,
      note: item.note,
      group: item.group,
      ingredient: ingredientMap.get(item.ingredient)?.documentId,
    }));

    await strapi.documents('api::recipe.recipe').create({
      data: {
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        totalTimeMinutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty as any,
        featured: recipe.featured,
        categories: categoryIds,
        tags: tagIds,
        ingredients: mappedIngredients,
        steps: recipe.steps,
        nutrition: recipe.nutrition,
        notes: recipe.notes,
      },
      status: 'published', // publish directly
    });
  }

  strapi.log.info('CMS seed complete! Set SEED_ON_BOOT=false in cms/.env to prevent re-checking.');
}
