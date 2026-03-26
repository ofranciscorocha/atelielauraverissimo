export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariant {
  modelId: string;
  colors: string[];
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  technique: string;
  price: number;
  category: string; 
  modelId: string; // Keep for compatibility or primary model
  collectionId?: string;
  image: string;
  images?: string[];
  inStock: boolean;
  stock: number;
  launchDate?: string;
  salesCount: number;
  colors?: string[];
  reviews?: Review[];
  observations?: string;
  variants?: ProductVariant[];
}

export interface CapacityVariant {
  id: string;
  label: string;        // ex: "450ml", "650ml", "600ml"
  priceAdjust: number;  // valor adicionado ao preço base (0 = mesmo preço)
  stock: number;
  inStock: boolean;
}

export type ModelCategory = "tacas" | "arte";

export interface ProductModel {
  id: string;
  name: string;
  image: string;
  description?: string;
  modelCategory?: ModelCategory; // "tacas" ou "arte"
  capacityVariants?: CapacityVariant[];
}

export interface Collection {
  id: string;
  name: string;
  modelId: string;
  image: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
}

export const initialCategories: Category[] = [
  { 
    id: "lancamentos", 
    name: "Lançamentos", 
    image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c",
    description: "Peças inéditas e exclusivas saindo do forno."
  },
  { 
    id: "personalizados", 
    name: "Crie sua Taça", 
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2",
    description: "Personalize cada detalhe da sua peça."
  }
];

export const initialModels: ProductModel[] = [
  {
    id: "gin-600",
    name: "Taça de Cristal Gin",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a",
    modelCategory: "tacas",
    capacityVariants: [
      { id: "600ml", label: "600ml", priceAdjust: 0, stock: 15, inStock: true },
    ],
  },
  {
    id: "vinho",
    name: "Taça de Cristal Vinho",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
    modelCategory: "tacas",
    capacityVariants: [
      { id: "450ml", label: "450ml", priceAdjust: 0, stock: 12, inStock: true },
      { id: "650ml", label: "650ml", priceAdjust: 50, stock: 8, inStock: true },
    ],
  },
  {
    id: "shot-60",
    name: "Copo de Cristal Shot",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
    modelCategory: "tacas",
    capacityVariants: [
      { id: "60ml", label: "60ml", priceAdjust: 0, stock: 20, inStock: true },
    ],
  },
  {
    id: "champagne-220",
    name: "Taça de Cristal Champagne",
    image: "https://images.unsplash.com/photo-1592318718033-5730d72ad78c",
    modelCategory: "tacas",
    capacityVariants: [
      { id: "220ml", label: "220ml", priceAdjust: 0, stock: 10, inStock: true },
    ],
  },
  {
    id: "coupe-220",
    name: "Taça de Cristal Coupe",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
    modelCategory: "tacas",
    capacityVariants: [
      { id: "220ml", label: "220ml", priceAdjust: 0, stock: 10, inStock: true },
    ],
  },
  {
    id: "pintura-floral",
    name: "Pintura Floral",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2",
    modelCategory: "arte",
    description: "Flores delicadas pintadas à mão com tinta especial para vidro.",
  },
  {
    id: "pintura-geometrica",
    name: "Pintura Geométrica",
    image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c",
    modelCategory: "arte",
    description: "Padrões geométricos modernos em ouro 24k e prata.",
  },
  {
    id: "personalizar",
    name: "Crie sua Taça",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2",
    modelCategory: "arte",
  },
];

export const initialCollections: Collection[] = [
  { id: "imperial", name: "Imperial Royal", modelId: "vinho", image: "https://images.unsplash.com/photo-1565597645100-302a9cf2bc46" },
  { id: "diamante", name: "Diamante Esmeralda", modelId: "gin-600", image: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c" }
];

// Categorias dinâmicas baseadas nos modelos, mantendo "Lançamentos" e "Crie sua Taça" como fixas
export const categories = ["Todas", "Lançamentos", "Crie sua Taça", ...initialModels.filter(m => m.id !== "personalizar").map(m => m.name)];

// Cupons Iniciais para o Lançamento
export const initialCoupons = [
  { id: 1, codigo: "LAURA10", desconto: "10%", status: "Ativo", usos: 0, limite: 100, tipo: "Porcentagem" },
  { id: 2, codigo: "BEMVINDO", desconto: "R$ 50", status: "Ativo", usos: 0, limite: 50, tipo: "Valor Fixo" },
  { id: 3, codigo: "VIPTACA", desconto: "15%", status: "Ativo", usos: 0, limite: 1000, tipo: "Exclusivo VIP" },
];
export const mockCupons = initialCoupons;

export const initialProducts: Product[] = [
  {
    id: "custom-order",
    name: "Crie sua Própria Taça",
    description: "Personalize sua peça com cores, iniciais e desenhos exclusivos. Uma obra de arte feita sob medida para você.",
    technique: "Personalização Artesanal",
    price: 350,
    category: "Crie sua Taça",
    modelId: "personalizar",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=800&fit=crop",
    images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=800&fit=crop"],
    inStock: true,
    stock: 999,
    salesCount: 150
  }
];
