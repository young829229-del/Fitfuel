import { Product } from '../types/product';

export const initialProducts: Product[] = [
  { 
    id: '1', 
    slug: 'pintola-high-protein-oats', 
    name: 'Pintola High Protein Oats', 
    price: 1250,
    originalPrice: 1500,
    description: 'Delicious and nutritious rolled oats fortified with ultra-pure whey protein isolate to fuel morning vitality and long-lasting muscle stamina.',
    keyBenefits: ['26g Protein per 100g', 'No added sugar & zero preservatives', 'High soluble dietary fiber', 'Rich dark cocoa flavor'],
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
    price: 3500,
    originalPrice: 4200,
    description: '100% ultra-pure micronized creatine monohydrate engineered for rapid intracellular ATP regeneration, explosive power, and lean muscle mass acceleration.',
    keyBenefits: ['Micronized 200 Mesh for effortless solubility', 'Clinically proven cellular ATP replenishment', 'Zero fillers, zero artificial sweeteners', 'Supports cognitive clarity and physical endurance'],
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
    price: 850,
    originalPrice: 999,
    description: 'An artisanal fusion of slow-roasted Himalayan peanuts blended with aromatic royal cardamom, saffron whispers, and caramelized kulfi essence.',
    keyBenefits: ['8g Whey-infused protein per serving', 'Zero palm oil, zero trans fats', 'Loaded with heart-healthy monounsaturated fats', 'Exotic royal kulfi flavor profile'],
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
    price: 850,
    originalPrice: 1100,
    description: 'Velvety smooth roasted peanut cream generously folded with crunchy dark cacao cookie crisps for an irresistible gourmet textural contrast.',
    keyBenefits: ['Satisfying crunchy cookie crumb texture', '7g high biological value protein per serving', 'Zero hydrogenated vegetable oils', 'Non-GMO ingredients'],
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
    price: 950,
    originalPrice: 1200,
    description: 'A vibrant tropical symphony featuring naturally sweet Alphonso mango reduction paired with raw organic black chia seeds and golden roasted peanuts.',
    keyBenefits: ['Enriched with plant-based Omega-3 ALA fatty acids', 'Hydrating chia fiber for prolonged satiety', 'Tropical natural sun-ripened mango taste', 'Zero palm oil or synthetic flavoring'],
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
