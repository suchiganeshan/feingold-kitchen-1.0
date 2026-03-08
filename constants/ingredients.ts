export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  stage: 1 | 2; // Stage 1 = allowed from start, Stage 2 = introduced later
}

export interface IngredientCategory {
  id: string;
  label: string;
  icon: string;
  emoji: string;
  ingredients: Ingredient[];
}

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  {
    id: "fruits",
    label: "Fruits",
    icon: "nutrition",
    emoji: "🍓",
    ingredients: [
      { id: "banana", name: "Banana", emoji: "🍌", stage: 2 },
      { id: "mango", name: "Mango", emoji: "🥭", stage: 2 },
      { id: "papaya", name: "Papaya", emoji: "🍈", stage: 2 },
      { id: "watermelon", name: "Watermelon", emoji: "🍉", stage: 2 },
      { id: "cantaloupe", name: "Cantaloupe", emoji: "🍈", stage: 2 },
      { id: "kiwi", name: "Kiwi", emoji: "🥝", stage: 2 },
      { id: "pear", name: "Pear", emoji: "🍐", stage: 2 },
      { id: "lemon", name: "Lemon", emoji: "🍋", stage: 2 },
      { id: "lime", name: "Lime", emoji: "🍋", stage: 2 },
      { id: "coconut", name: "Coconut", emoji: "🥥", stage: 2 },
      { id: "fig", name: "Fig", emoji: "🍈", stage: 2 },
      { id: "date", name: "Date", emoji: "🟤", stage: 2 },
      { id: "guava", name: "Guava", emoji: "🍏", stage: 2 },
    ],
  },
  {
    id: "vegetables",
    label: "Vegetables",
    icon: "leaf",
    emoji: "🥦",
    ingredients: [
      { id: "carrot", name: "Carrot", emoji: "🥕", stage: 1 },
      { id: "broccoli", name: "Broccoli", emoji: "🥦", stage: 1 },
      { id: "cabbage", name: "Cabbage", emoji: "🥬", stage: 1 },
      { id: "cauliflower", name: "Cauliflower", emoji: "🥦", stage: 1 },
      { id: "lettuce", name: "Lettuce", emoji: "🥬", stage: 1 },
      { id: "spinach", name: "Spinach", emoji: "🥬", stage: 1 },
      { id: "kale", name: "Kale", emoji: "🥬", stage: 1 },
      { id: "sweet_potato", name: "Sweet Potato", emoji: "🍠", stage: 1 },
      { id: "potato", name: "Potato", emoji: "🥔", stage: 1 },
      { id: "onion", name: "Onion", emoji: "🧅", stage: 1 },
      { id: "garlic", name: "Garlic", emoji: "🧄", stage: 1 },
      { id: "celery", name: "Celery", emoji: "🌿", stage: 1 },
      { id: "beet", name: "Beet", emoji: "🍠", stage: 1 },
      { id: "pea", name: "Peas", emoji: "🟢", stage: 1 },
      { id: "corn", name: "Corn", emoji: "🌽", stage: 1 },
      { id: "asparagus", name: "Asparagus", emoji: "🌿", stage: 1 },
      { id: "zucchini", name: "Zucchini", emoji: "🥒", stage: 1 },
      { id: "squash", name: "Squash", emoji: "🟡", stage: 1 },
      { id: "leek", name: "Leek", emoji: "🧅", stage: 1 },
      { id: "mushroom", name: "Mushroom", emoji: "🍄", stage: 1 },
    ],
  },
  {
    id: "proteins",
    label: "Proteins",
    icon: "fish",
    emoji: "🥩",
    ingredients: [
      { id: "chicken", name: "Chicken", emoji: "🍗", stage: 1 },
      { id: "turkey", name: "Turkey", emoji: "🦃", stage: 1 },
      { id: "beef", name: "Beef", emoji: "🥩", stage: 1 },
      { id: "pork", name: "Pork", emoji: "🥩", stage: 1 },
      { id: "lamb", name: "Lamb", emoji: "🥩", stage: 1 },
      { id: "salmon", name: "Salmon", emoji: "🐟", stage: 1 },
      { id: "tuna", name: "Tuna", emoji: "🐟", stage: 1 },
      { id: "shrimp", name: "Shrimp", emoji: "🦐", stage: 1 },
      { id: "cod", name: "Cod", emoji: "🐟", stage: 1 },
      { id: "egg", name: "Eggs", emoji: "🥚", stage: 1 },
      { id: "tofu", name: "Tofu", emoji: "⬜", stage: 1 },
      { id: "lentil", name: "Lentils", emoji: "🟤", stage: 1 },
      { id: "chickpea", name: "Chickpeas", emoji: "🟡", stage: 1 },
      { id: "black_bean", name: "Black Beans", emoji: "⚫", stage: 1 },
    ],
  },
  {
    id: "grains",
    label: "Grains",
    icon: "layers",
    emoji: "🌾",
    ingredients: [
      { id: "white_rice", name: "White Rice", emoji: "🍚", stage: 1 },
      { id: "brown_rice", name: "Brown Rice", emoji: "🍚", stage: 1 },
      { id: "quinoa", name: "Quinoa", emoji: "🌾", stage: 1 },
      { id: "oat", name: "Oats", emoji: "🌾", stage: 1 },
      { id: "pasta", name: "Pasta", emoji: "🍝", stage: 1 },
      { id: "bread", name: "Bread", emoji: "🍞", stage: 1 },
      { id: "barley", name: "Barley", emoji: "🌾", stage: 1 },
      { id: "millet", name: "Millet", emoji: "🌾", stage: 1 },
      { id: "buckwheat", name: "Buckwheat", emoji: "🌾", stage: 1 },
    ],
  },
  {
    id: "dairy",
    label: "Dairy",
    icon: "water",
    emoji: "🧀",
    ingredients: [
      { id: "milk", name: "Milk", emoji: "🥛", stage: 1 },
      { id: "butter", name: "Butter", emoji: "🧈", stage: 1 },
      { id: "cheddar", name: "Cheddar", emoji: "🧀", stage: 1 },
      { id: "mozzarella", name: "Mozzarella", emoji: "🧀", stage: 1 },
      { id: "parmesan", name: "Parmesan", emoji: "🧀", stage: 1 },
      { id: "cream_cheese", name: "Cream Cheese", emoji: "🧀", stage: 1 },
      { id: "yogurt", name: "Yogurt", emoji: "🥛", stage: 1 },
      { id: "heavy_cream", name: "Heavy Cream", emoji: "🥛", stage: 1 },
      { id: "sour_cream", name: "Sour Cream", emoji: "🥛", stage: 1 },
    ],
  },
  {
    id: "herbs",
    label: "Herbs & Spices",
    icon: "flower",
    emoji: "🌿",
    ingredients: [
      { id: "parsley", name: "Parsley", emoji: "🌿", stage: 1 },
      { id: "basil", name: "Basil", emoji: "🌿", stage: 1 },
      { id: "thyme", name: "Thyme", emoji: "🌿", stage: 1 },
      { id: "rosemary", name: "Rosemary", emoji: "🌿", stage: 1 },
      { id: "oregano", name: "Oregano", emoji: "🌿", stage: 1 },
      { id: "dill", name: "Dill", emoji: "🌿", stage: 1 },
      { id: "chive", name: "Chives", emoji: "🌿", stage: 1 },
      { id: "turmeric", name: "Turmeric", emoji: "🟡", stage: 1 },
      { id: "cumin", name: "Cumin", emoji: "🟤", stage: 1 },
      { id: "coriander", name: "Coriander", emoji: "🟤", stage: 1 },
      { id: "ginger", name: "Ginger", emoji: "🫚", stage: 1 },
      { id: "vanilla", name: "Vanilla", emoji: "🟤", stage: 2 },
      { id: "cinnamon", name: "Cinnamon", emoji: "🟤", stage: 2 },
    ],
  },
];
