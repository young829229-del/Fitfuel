import { Product } from '../types/product';

export const initialProducts: Product[] = [
  { 
    id: '1', 
    slug: 'pintola-high-protein-oats', 
    name: 'Pintola High Protein Oats', 
    category: 'Sports Nutrition',
    price: 24.99,
    originalPrice: 29.99,
    description: 'Delicious and nutritious rolled oats fortified with ultra-pure whey protein isolate to fuel morning vitality and long-lasting muscle stamina.',
    keyBenefits: ['26g Protein per 100g', 'No added sugar & zero preservatives', 'High soluble dietary fiber', 'Rich dark cocoa flavor'],
    nutritionalInfo: 'Per 100g: 380 kcal | 26g Protein | 54g Carbohydrates | 5g Fiber | 6g Healthy Fats',
    ingredients: '100% Whole Grain Rolled Oats, Whey Protein Isolate, Alkalized Cocoa Powder, Natural Monk Fruit Extract',
    usage: 'Add 50g (approx 1 scoop) to 200ml hot water or warm low-fat milk. Cook gently for 3-5 minutes, stir well and serve warm.',
    stockStatus: 'In Stock',
    stockQuantity: 45,
    image: '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
    images: [
      '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg',
      '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'
    ],
    rating: 4.8,
    reviewsCount: 42
  },
  { 
    id: '2', 
    slug: 'wellcore-creatine-monohydrate', 
    name: 'Wellcore Creatine Monohydrate', 
    category: 'Performance',
    price: 19.99,
    originalPrice: 24.99,
    description: '100% ultra-pure micronized creatine monohydrate engineered for rapid intracellular ATP regeneration, explosive power, and lean muscle mass acceleration.',
    keyBenefits: ['Micronized 200 Mesh for effortless solubility', 'Clinically proven cellular ATP replenishment', 'Zero fillers, zero artificial sweeteners', 'Supports cognitive clarity and physical endurance'],
    nutritionalInfo: 'Per Serving (3g): Creatine Monohydrate 3000mg | Zero Calories | Zero Sugars',
    ingredients: '100% Ultra-Micronized Pharmaceutical Grade Creatine Monohydrate',
    usage: 'Mix 1 scoop (3g) with 250ml cold water, electrolyte drink, or protein shake. Consume daily post-workout or at consistent morning timing.',
    stockStatus: 'In Stock',
    stockQuantity: 60,
    image: '/assets/aistudio/images__2__3076b8c4.jpeg',
    images: [
      '/assets/aistudio/images__2__3076b8c4.jpeg',
      '/assets/aistudio/images__2__3076b8c4.jpeg'
    ],
    rating: 4.9,
    reviewsCount: 88
  },
  { 
    id: '3', 
    slug: 'kulfi-blast-peanut-butter', 
    name: 'Kulfi Blast Peanut Butter', 
    category: 'Protein Spreads',
    price: 12.99,
    originalPrice: 15.99,
    description: 'An artisanal fusion of slow-roasted Himalayan peanuts blended with aromatic royal cardamom, saffron whispers, and caramelized kulfi essence.',
    keyBenefits: ['8g Whey-infused protein per serving', 'Zero palm oil, zero trans fats', 'Loaded with heart-healthy monounsaturated fats', 'Exotic royal kulfi flavor profile'],
    nutritionalInfo: 'Per 32g: 190 kcal | 8g Protein | 6g Carbohydrates | 15g Unsaturated Fats',
    ingredients: 'Slow-Roasted Grade A Peanuts, Whey Protein Concentrate, Elaichi (Green Cardamom), Saffron Extract, Pure Stevia, Himalayan Pink Salt',
    usage: 'Spread generously on warm artisanal toast, blend into breakfast power bowls, or enjoy straight with a dessert spoon.',
    stockStatus: 'In Stock',
    stockQuantity: 32,
    image: '/assets/aistudio/61Z6RwyreWL_1a612f23.jpg',
    images: [
      '/assets/aistudio/61Z6RwyreWL_1a612f23.jpg',
      '/assets/aistudio/61Z6RwyreWL_1a612f23.jpg'
    ],
    rating: 4.7,
    reviewsCount: 35
  },
  { 
    id: '4', 
    slug: 'cookie-blast-peanut-butter', 
    name: 'Cookie Blast Peanut Butter', 
    category: 'Protein Spreads',
    price: 12.99,
    originalPrice: 16.00,
    description: 'Velvety smooth roasted peanut cream generously folded with crunchy dark cacao cookie crisps for an irresistible gourmet textural contrast.',
    keyBenefits: ['Satisfying crunchy cookie crumb texture', '7g high biological value protein per serving', 'Zero hydrogenated vegetable oils', 'Non-GMO ingredients'],
    nutritionalInfo: 'Per 32g: 200 kcal | 7g Protein | 8g Carbohydrates | 15g Lipids',
    ingredients: 'Roasted Peanuts, Dark Cocoa Biscuit Clusters, Organic Cane Sugar, Cocoa Butter, Sea Salt',
    usage: 'Perfect on sourdough bagels, sliced green apples, blended shakes, or high-protein waffle toppings.',
    stockStatus: 'In Stock',
    stockQuantity: 28,
    image: '/assets/aistudio/images__3__689e8f19.jpeg',
    images: [
      '/assets/aistudio/images__3__689e8f19.jpeg',
      '/assets/aistudio/images__3__689e8f19.jpeg'
    ],
    rating: 4.6,
    reviewsCount: 29
  },
  { 
    id: '5', 
    slug: 'mango-chia-peanut-butter', 
    name: 'Mango Chia Peanut Butter', 
    category: 'Superfoods',
    price: 14.99,
    originalPrice: 18.00,
    description: 'A vibrant tropical symphony featuring naturally sweet Alphonso mango reduction paired with raw organic black chia seeds and golden roasted peanuts.',
    keyBenefits: ['Enriched with plant-based Omega-3 ALA fatty acids', 'Hydrating chia fiber for prolonged satiety', 'Tropical natural sun-ripened mango taste', 'Zero palm oil or synthetic flavoring'],
    nutritionalInfo: 'Per 32g: 180 kcal | 7g Protein | 7g Complex Carbohydrates | 14g Beneficial Fats',
    ingredients: 'Slow Roasted Peanuts, Sun-Ripened Alphonso Mango Pulp, Raw Black Chia Seeds, Cold-Pressed Coconut Nectar, Himalayan Pink Salt',
    usage: 'Swirl into Greek yogurt cups, drizzle across warm oatmeal, or spread onto crisp multi-grain crackers.',
    stockStatus: 'In Stock',
    stockQuantity: 19,
    image: '/assets/aistudio/images__4__877d71a7.jpeg',
    images: [
      '/assets/aistudio/images__4__877d71a7.jpeg',
      '/assets/aistudio/images__4__877d71a7.jpeg'
    ],
    rating: 4.9,
    reviewsCount: 51
  },
];

export const products = initialProducts;
