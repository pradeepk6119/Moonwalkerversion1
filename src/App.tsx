/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  ShoppingBag, 
  X, 
  Star, 
  ChevronRight, 
  Info, 
  Tag, 
  Users, 
  CheckCircle2,
  Check,
  Heart,
  User,
  ShieldCheck,
  Ruler,
  Mail,
  MoreVertical,
  Footprints,
  Minus,
  Plus,
  Trash2,
  Smartphone,
  Wallet,
  Landmark,
  CreditCard,
  Banknote,
  Sparkles,
  Send,
  Loader2,
  Clock,
  History,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

// --- Types ---
interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  features: string[];
  stock?: { [size: string]: number };
  reviews?: Review[];
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface Drop {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  dropDate: string;
  description: string;
}

interface Message {
  role: "user" | "model";
  text: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface Address {
  id: string;
  houseNumber: string;
  area: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface User {
  email: string;
  name: string;
  orders: Order[];
  addresses: Address[];
  points: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'PLACED' | 'AUTHENTICATING' | 'PACKAGED' | 'SHIPPED' | 'DELIVERED';
  discount?: number;
  earnedPoints?: number;
}

type View = 'HOME' | 'DASHBOARD' | 'COLLECTIONS' | 'BRANDS' | 'WISHLIST' | 'CHECKOUT' | 'THANK_YOU' | 'PRIVACY' | 'TERMS' | 'PROFILE' | 'STYLING';

// --- Constants ---
const DROPS: Drop[] = [
  { 
    id: 'd1', 
    title: 'Travis Scott x Air Jordan 1 Low "Pink"', 
    brand: 'Jordan', 
    price: 154999, 
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    dropDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    description: 'The highly anticipated collaboration featuring premium materials and iconic reverse swoosh.'
  },
  { 
    id: 'd2', 
    title: 'Adidas Bad Bunny Campus "Brown"', 
    brand: 'Adidas', 
    price: 18999, 
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800',
    dropDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    description: 'Chunky silhouette with double tongue and signature Bad Bunny eye logo.'
  }
];
const SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'];

const SIZE_CONVERSIONS = [
  { us: '7', uk: '6', eu: '40', cm: '25' },
  { us: '8', uk: '7', eu: '41', cm: '26' },
  { us: '9', uk: '8', eu: '42', cm: '27' },
  { us: '10', uk: '9', eu: '43', cm: '28' },
  { us: '11', uk: '10', eu: '44', cm: '29' },
  { us: '12', uk: '11', eu: '45', cm: '30' },
];

// --- Product Database ---
const PRODUCTS: Product[] = [
  { 
    id: 1, 
    title: "Nike SB Dunk Low Jarritos", 
    brand: "Nike", 
    price: 69999, 
    rating: 4.8, 
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", 
    features: ["Premium canvas and leather upper", "Tear-away overlays", "Jarritos branding"],
    stock: { "US 8": 2, "US 9": 5, "US 10": 1 },
    reviews: [
      { id: 'r1', user: 'SneakerHead_99', rating: 5, comment: 'The materials are insane. The tear-away feature is so unique!', date: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=r1' },
      { id: 'r2', user: 'Rahul K.', rating: 4, comment: 'Slightly tight fit, but looks amazing in person.', date: '1 week ago', avatar: 'https://i.pravatar.cc/150?u=r2' }
    ]
  },
  { 
    id: 2, 
    title: "Air Jordan 1 Retro High", 
    brand: "Jordan", 
    price: 15499, 
    rating: 4.5, 
    image: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=800", 
    features: ["Classic high-top", "Full-grain leather", "Air-Sole unit"],
    stock: { "US 9": 10, "US 10": 2, "US 11": 8 },
    reviews: [
      { id: 'r3', user: 'Ajay S.', rating: 5, comment: 'Classic heat. Every collection needs a pair of AJ1s.', date: '3 days ago', avatar: 'https://i.pravatar.cc/150?u=r3' }
    ]
  },
  { 
    id: 3, 
    title: "Adidas Yeezy Boost 350", 
    brand: "Adidas", 
    price: 22999, 
    rating: 4.9, 
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800", 
    features: ["Primeknit upper", "BOOST midsole", "Sock-like fit"],
    stock: { "US 8": 1, "US 9": 0, "US 10": 3 },
    reviews: [
      { id: 'r4', user: 'Karthik V.', rating: 5, comment: 'Walking on clouds. The Boost technology is unmatched.', date: '5 days ago', avatar: 'https://i.pravatar.cc/150?u=r4' }
    ]
  },
  { id: 4, title: "New Balance 550 White/Green", brand: "New Balance", price: 11999, rating: 4.6, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800", features: ["Retro basketball design", "Leather upper", "Durable rubber outsole"] },
  { id: 5, title: "Puma RS-X3 Puzzle", brand: "Puma", price: 8999, rating: 4.2, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", features: ["Bulky RS silhouette", "Mesh and suede overlays", "Lightweight cushioning"] },
  { id: 6, title: "Converse Chuck Taylor All Star", brand: "Converse", price: 4999, rating: 4.7, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", features: ["Canvas upper", "Classic star patch", "OrthoLite insole"] },
  { id: 7, title: "Nike Air Max 270", brand: "Nike", price: 12999, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Large Air Max unit", "Stretch mesh upper", "Dual-density foam"] },
  { id: 8, title: "Adidas Ultraboost 22", brand: "Adidas", price: 16999, rating: 4.8, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800", features: ["Linear Energy Push system", "Continental Rubber outsole", "Primeblue material"] },
  { id: 9, title: "Jordan 4 Retro Military Black", brand: "Jordan", price: 34999, rating: 4.9, image: "https://images.unsplash.com/photo-1628253106385-48419688402d?auto=format&fit=crop&q=80&w=800", features: ["Mesh side panels", "Visible Air unit", "Herringbone traction"] },
  { id: 10, title: "New Balance 2002R Protection Pack", brand: "New Balance", price: 18999, rating: 4.7, image: "https://images.unsplash.com/photo-1636130090382-7f7223696614?auto=format&fit=crop&q=80&w=800", features: ["Deconstructed design", "ABZORB cushioning", "N-ergy outsole"] },
  { id: 11, title: "Vans Old Skool Core Classics", brand: "Vans", price: 5499, rating: 4.6, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", features: ["Canvas and suede upper", "Signature side stripe", "Waffle outsole"] },
  { id: 12, title: "Adidas Forum Low", brand: "Adidas", price: 9999, rating: 4.3, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800", features: ["Removable strap", "Leather construction", "X-detail on ankle"] },
  { id: 13, title: "Asics Gel-Lyte III OG", brand: "Asics", price: 10999, rating: 4.5, image: "https://images.unsplash.com/photo-1588666606010-83f1246f9ec3?auto=format&fit=crop&q=80&w=800", features: ["Split-tongue design", "GEL technology", "Suede overlays"] },
  { id: 14, title: "Reebok Club C 85", brand: "Reebok", price: 7999, rating: 4.4, image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800", features: ["Soft leather upper", "Low-cut design", "Molded sockliner"] },
  { id: 15, title: "Nike Air Force 1 '07", brand: "Nike", price: 9499, rating: 4.7, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", features: ["Stitched leather overlays", "Nike Air cushioning", "Padded collar"] },
  { id: 16, title: "Balenciaga Triple S", brand: "Balenciaga", price: 85000, rating: 4.1, image: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&q=80&w=800", features: ["Three-layered sole", "Complex upper construction", "Embroidered logo"] },
  { id: 17, title: "Off-White x Nike Dunk Low", brand: "Off-White", price: 55000, rating: 4.8, image: "https://images.unsplash.com/photo-1520316587275-5e4f06f355e6?auto=format&fit=crop&q=80&w=800", features: ["Secondary lace system", "Exposed foam tongue", "Zip-tie detail"] },
  { id: 18, title: "Dr. Martens 1460 Smooth", brand: "Dr. Martens", price: 14999, rating: 4.7, image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800", features: ["Smooth leather", "AirWair cushion sole", "Yellow welt stitching"] },
  { id: 19, title: "Timberland 6-Inch Premium", brand: "Timberland", price: 16999, rating: 4.6, image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800", features: ["Waterproof construction", "PrimaLoft insulation", "Anti-fatigue technology"] },
  { id: 20, title: "Nike Blazer Mid '77", brand: "Nike", price: 8999, rating: 4.3, image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", features: ["Vintage midsole finish", "Autoclave construction", "Suede details"] },
  { id: 21, title: "Adidas Stan Smith", brand: "Adidas", price: 7999, rating: 4.5, image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800", features: ["Minimalist design", "Leather upper", "Signature heel tab"] },
  { id: 22, title: "Jordan 11 Retro Cool Grey", brand: "Jordan", price: 28999, rating: 4.9, image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=800", features: ["Patent leather mudguard", "Full-length Air unit", "Carbon fiber shank"] },
  { id: 23, title: "New Balance 990v5 Grey", brand: "New Balance", price: 19999, rating: 4.8, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800", features: ["ENCAP midsole", "Dual-density collar foam", "Premium pigskin suede"] },
  { id: 24, title: "Puma Suede Classic", brand: "Puma", price: 5999, rating: 4.4, image: "https://images.unsplash.com/photo-1533552044237-773df013bf69?auto=format&fit=crop&q=80&w=800", features: ["Full suede upper", "Rubber cupsole", "Puma Formstrip"] },
  { id: 25, title: "Vans Slip-On Checkerboard", brand: "Vans", price: 4999, rating: 4.5, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800", features: ["Iconic checkerboard print", "Easy slip-on entry", "Padded collar"] },
  { id: 26, title: "Nike Air Max 90 Infrared", brand: "Nike", price: 13999, rating: 4.7, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800", features: ["Max Air unit", "Waffle outsole", "Stitched overlays"] },
  { id: 27, title: "Adidas NMD_R1", brand: "Adidas", price: 11999, rating: 4.3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", features: ["Stretch mesh upper", "Boost midsole", "Signature NMD plugs"] },
  { id: 28, title: "Jordan 1 Low Travis Scott Reverse Mocha", brand: "Jordan", price: 125000, rating: 5.0, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800", features: ["Suede and leather upper", "Reverse Swoosh", "Cactus Jack branding"] },
  { id: 29, title: "Converse Run Star Hike", brand: "Converse", price: 9999, rating: 4.5, image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800", features: ["Exaggerated lugged sole", "Canvas construction", "Platform elevation"] },
  { id: 30, title: "Nike Sacai VaporWaffle", brand: "Off-White", price: 42000, rating: 4.7, image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=800", features: ["Doubled-up details", "Split chunky sole", "Mix of mesh and suede"] },
  { id: 31, title: "Asics Novablast 3", brand: "Asics", price: 12999, rating: 4.8, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", features: ["FF BLAST PLUS foam", "Trampoline-inspired outsole", "Gusseted tongue winged fit"] },
  { id: 32, title: "Adidas Samba OG", brand: "Adidas", price: 8999, rating: 4.6, image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800", features: ["Suede T-toe", "Gum rubber cupsole", "Serrated 3-Stripes"] },
  { id: 33, title: "Nike Air Max Plus TN", brand: "Nike", price: 15999, rating: 4.4, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", features: ["Tuned Air technology", "TPU cage overlays", "Breathable synthetic upper"] },
  { id: 34, title: "Jordan 3 Retro White Cement", brand: "Jordan", price: 21999, rating: 4.8, image: "https://images.unsplash.com/photo-1597044003314-ec20300c3b9b?auto=format&fit=crop&q=80&w=800", features: ["Elephant print overlays", "Air-Sole unit", "Genuine leather upper"] },
  { id: 35, title: "New Balance 327 White/Blue", brand: "New Balance", price: 8999, rating: 4.3, image: "https://images.unsplash.com/photo-1636130090382-7f7223696614?auto=format&fit=crop&q=80&w=800", features: ["Oversized 'N' branding", "Trail-inspired lug sole", "Mesh and suede upper"] },
  { id: 36, title: "Yeezy 700 Wave Runner", brand: "Adidas", price: 45000, rating: 4.9, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800", features: ["Heritage-inspired chunky design", "Full-length Boost midsole", "Vibrant grey, black, and teal"] },
  { id: 37, title: "Balenciaga Speed Trainer", brand: "Balenciaga", price: 65000, rating: 4.0, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800", features: ["Sock-like technical knit", "Ergonomic sole design", "Ultra-flexible molded sole"] },
  { id: 38, title: "Nike Dunk High Panda", brand: "Nike", price: 11999, rating: 4.5, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", features: ["Crisp leather upper", "Monochrome colorway", "High-top support"] },
  { id: 39, title: "Off-White ODSY-1000", brand: "Off-White", price: 72000, rating: 4.2, image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=800", features: ["Hiking-inspired silhouette", "Chunky track sole", "Signature zip-tie"] },
  { id: 40, title: "Jordan 6 Retro Carmine", brand: "Jordan", price: 18999, rating: 4.7, image: "https://images.unsplash.com/photo-1615664086526-5383399ac11a?auto=format&fit=crop&q=80&w=800", features: ["OG colorway", "Toggle lace lock", "Visible Air cushioning"] },
  { id: 41, title: "Adidas Superstar", brand: "Adidas", price: 7999, rating: 4.6, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800", features: ["Rubber shell toe", "Three-stripe branding", "Leather upper"] },
  { id: 42, title: "Gucci Ace Sneaker", brand: "Puma", price: 58000, rating: 4.3, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", features: ["Exotic leather details", "Web stripe with bee", "Low-top profile"] },
  { id: 43, title: "Prada Cloudbust Thunder", brand: "Puma", price: 82000, rating: 3.9, image: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&q=80&w=800", features: ["Heavy sculpted sole", "Rubber eyelet details", "Technical fabric upper"] },
  { id: 44, title: "Nike Air Zoom Spiridon Cage 2", brand: "Nike", price: 13999, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Caged Zoom Air unit", "Mesh and synthetic materials", "Retro tech runner vibe"] },
  { id: 45, title: "Adidas Gazelle Indoor", brand: "Adidas", price: 9499, rating: 4.5, image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800", features: ["Translucent gum sole", "Suede upper", "Contrast branding"] },
  { id: 46, title: "New Balance 9060", brand: "New Balance", price: 15499, rating: 4.8, image: "https://images.unsplash.com/photo-1647466827011-9e1e55d5b78d?auto=format&fit=crop&q=80&w=800", features: ["Futuristic wavy lines", "Dual-density midsole", "Crinkled leather details"] },
  { id: 47, title: "Nike Air Max 1 '87 Safari", brand: "Nike", price: 14999, rating: 4.6, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800", features: ["Iconic safari print", "Suede and canvas upper", "Classic Air damping"] },
  { id: 48, title: "Jordan 12 Retro Royalty", brand: "Jordan", price: 17999, rating: 4.7, image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=800", features: ["Gold accents", "Full-length Zoom Air", "Sunray-inspired stitching"] },
  { id: 49, title: "Adidas Adilette Slides", brand: "Adidas", price: 2999, rating: 4.8, image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800", features: ["Contoured footbed", "Quick-dry synthetic", "Three-stripe bandage"] },
  { id: 50, title: "Nike Air Presto Mid Utility", brand: "Nike", price: 12999, rating: 4.2, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Water-repellent upper", "Mid-cut profile", "Warm lining"] },
  { id: 51, title: "Vans Sk8-Hi MTE", brand: "Vans", price: 9499, rating: 4.5, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", features: ["Weather-resistant leather", "Heat retention layer", "Lugged MTE outsole"] },
  { id: 52, title: "Converse CDG Play 70", brand: "Converse", price: 12999, rating: 4.9, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", features: ["Filip Pagowski heart logo", "Heavyweight canvas", "Enhanced cushioning"] },
  { id: 53, title: "Adidas Yeezy Slide Bone", brand: "Adidas", price: 8999, rating: 4.8, image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800", features: ["Injected EVA foam", "Minimalist aesthetic", "Textured footbed"] },
  { id: 54, title: "Nike Air Huarache", brand: "Nike", price: 10999, rating: 4.3, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Neoprene inner sleeve", "External heel cage", "Air technology"] },
  { id: 55, title: "Jordan 13 Retro Court Purple", brand: "Jordan", price: 16999, rating: 4.6, image: "https://images.unsplash.com/photo-1636733221946-b18420eb7325?auto=format&fit=crop&q=80&w=800", features: ["Holographic 'cat eye'", "Podular outsole", "Quilted leather upper"] },
  { id: 56, title: "New Balance 1906R", brand: "New Balance", price: 13999, rating: 4.7, image: "https://images.unsplash.com/photo-1636130090382-7f7223696614?auto=format&fit=crop&q=80&w=800", features: ["N-ergy shock absorption", "Stability Web support", "Acteva Lite midsole"] },
  { id: 57, title: "Asics Gel-Kayano 29", brand: "Asics", price: 14999, rating: 4.8, image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80&w=800", features: ["LITETRUSS technology", "FF BLAST PLUS cushioning", "Aharplus heel plug"] },
  { id: 58, title: "Adidas Ultraboost Light", brand: "Adidas", price: 18999, rating: 4.9, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800", features: ["30% lighter Boost", "Primeknit+ upper", "Sustainable construction"] },
  { id: 59, title: "Nike Air Max 95 Neon", brand: "Nike", price: 15499, rating: 4.7, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800", features: ["Anatomy-inspired design", "Innovative lacing", "Forefoot Max Air"] },
  { id: 60, title: "Jordan 5 Retro Fire Red", brand: "Jordan", price: 19999, rating: 4.8, image: "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?auto=format&fit=crop&q=80&w=800", features: ["Reflective tongue", "Lace lock system", "Icy translucent sole"] },
  { id: 61, title: "Puma Cali Dream", brand: "Puma", price: 7499, rating: 4.1, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", features: ["Platform cupsole", "Suede/leather mix", "California styling"] },
  { id: 62, title: "Vans Era Classic", brand: "Vans", price: 4499, rating: 4.4, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", features: ["Low top lace-up", "Metal eyelets", "Signature waffle outsole"] },
  { id: 63, title: "Nike Cortez '23", brand: "Nike", price: 7999, rating: 4.3, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", features: ["Serrated outsole", "Wider toe box", "Vintage design"] },
  { id: 64, title: "Adidas ZX 8000", brand: "Adidas", price: 10999, rating: 4.5, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800", features: ["Torsion System support", "Jacquard mesh", "TPU heel cage"] },
  { id: 65, title: "Asics Gel-1130", brand: "Asics", price: 8999, rating: 4.6, image: "https://images.unsplash.com/photo-1615291167063-8283940178d8?auto=format&fit=crop&q=80&w=800", features: ["Gel tech cushioning", "Synthetic leather overlays", "Retro aesthetic"] },
  { id: 66, title: "Nike Air Max 97 Silver Bullet", brand: "Nike", price: 16999, rating: 4.8, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800", features: ["Full-length Air Max", "Reflective piping", "Speed lacing system"] },
  { id: 67, title: "Jordan 1 Retro Low OG", brand: "Jordan", price: 11999, rating: 4.7, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Authentic low-cut OG", "Premium leather", "Encapsulated Air"] },
  { id: 68, title: "Adidas 4DFWD 3", brand: "Adidas", price: 19999, rating: 4.6, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800", features: ["3D-printed midsole", "Forward-motion tech", "Primeknit+ upper"] },
  { id: 69, title: "Reebok Zig Kinetica II", brand: "Reebok", price: 9999, rating: 4.2, image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800", features: ["Floatride Fuel foam", "Zig Energy Shell", "Kinetic energy return"] },
  { id: 70, title: "Jordan 7 Retro Sapphire", brand: "Jordan", price: 18999, rating: 4.4, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Shimmering overlays", "Internal bootie construction", "Huarache-inspired fit"] },
  { id: 71, title: "Nike Air Force 1 Luxe", brand: "Nike", price: 12999, rating: 4.5, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", features: ["Double-stitched upper", "Rugged outsole tread", "Premium tumbled leather"] },
  { id: 72, title: "Adidas Continental 80", brand: "Adidas", price: 7499, rating: 4.3, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800", features: ["Soft leather build", "Split rubber cupsole", "Retro tennis style"] },
  { id: 73, title: "Puma Mayze Wedge", brand: "Puma", price: 8999, rating: 4.0, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", features: ["Dramatic wedge sole", "Puma branding details", "Street-ready look"] },
  { id: 74, title: "Converse All Star BB Trilliant", brand: "Converse", price: 11999, rating: 4.6, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", features: ["CX cushioning", "Glow-in-the-dark sole", "Performance basketball model"] },
  { id: 75, title: "Vans Ultrarange Exo", brand: "Vans", price: 8499, rating: 4.7, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800", features: ["UltraCush midsole", "RapidWeld details", "Breathable mesh upper"] },
  { id: 76, title: "New Balance Fresh Foam 1080", brand: "New Balance", price: 14999, rating: 4.8, image: "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?auto=format&fit=crop&q=80&w=800", features: ["Hypoknit upper", "Fresh Foam X", "Seamless construction"] },
  { id: 77, title: "Adidas Retropy E5", brand: "Adidas", price: 10999, rating: 4.5, image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800", features: ["Boost cushioning", "Vintage nylon upper", "Suede overlays"] },
  { id: 78, title: "Nike Air Max Scorpion", brand: "Nike", price: 21999, rating: 4.1, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Massive Air bubble", "Flyknit Chenille upper", "Point-loaded cushioning"] },
  { id: 79, title: "Jordan 1 Retro High Lost and Found", brand: "Jordan", price: 38999, rating: 5.0, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Cracked collar leather", "Vintage-inspired box", "OG Chicago colorway"] },
  { id: 80, title: "Yeezy 500 Utility Black", brand: "Adidas", price: 24999, rating: 4.7, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800", features: ["adiPRENE+ cushioning", "Suede/mesh combo", "Bold chunky look"] },
  { id: 81, title: "Balenciaga Defender", brand: "Balenciaga", price: 92000, rating: 3.8, image: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&q=80&w=800", features: ["Aggressive tire-tread sole", "Distressed effect", "Mesh and nylon upper"] },
  { id: 82, title: "Alexander McQueen Oversized", brand: "Puma", price: 42000, rating: 4.5, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", features: ["Smooth calf leather", "Chunky rubber sole", "Signature heel tab"] },
  { id: 83, title: "Off-White Out Of Office", brand: "Off-White", price: 45000, rating: 4.6, image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=800", features: ["Late 80s aesthetic", "Gel inserts in sole", "Zip-tie branding"] },
  { id: 84, title: "Nike Air Max 2013 Stussy", brand: "Nike", price: 18999, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Full-length visible Air", "Engineered mesh", "Hemp-inspired color"] },
  { id: 85, title: "Adidas Yeezy 700 V3 Azael", brand: "Adidas", price: 32000, rating: 4.8, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800", features: ["Glow-in-the-dark cage", "Monofilament mesh", "EVA core for comfort"] },
  { id: 86, title: "New Balance 1300 JP3", brand: "New Balance", price: 28999, rating: 4.9, image: "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?auto=format&fit=crop&q=80&w=800", features: ["Made in USA quality", "Horween leather trim", "Steel blue classic"] },
  { id: 87, title: "Jordan 1 Center Court", brand: "Jordan", price: 10999, rating: 4.3, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Minimalist stitched upper", "Premium leather", "Zoom Air in heel"] },
  { id: 88, title: "Nike Air Penny 2", brand: "Nike", price: 14999, rating: 4.5, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", features: ["Dual visible Air units", "Penny 1-Cent logo", "Aggressive wing detail"] },
  { id: 89, title: "Asics Gel-Nimbus 25", brand: "Asics", price: 14999, rating: 4.9, image: "https://images.unsplash.com/photo-1512374382149-433a42b6a936?auto=format&fit=crop&q=80&w=800", features: ["PureGEL technology", "FF BLAST PLUS ECO", "Soft knit upper"] },
  { id: 90, title: "Adidas Ultraboost 1.0 OG", brand: "Adidas", price: 14999, rating: 4.8, image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800", features: ["Legendary weave", "Full-length Boost", "Classic purple heel"] },
  { id: 91, title: "Gucci Screener Sneaker", brand: "Puma", price: 68000, rating: 4.2, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", features: ["Vintage 70s look", "GG canvas details", "Scuffed effect finish"] },
  { id: 92, title: "Off-White x Nike Air Terra Forma", brand: "Off-White", price: 16999, rating: 4.0, image: "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?auto=format&fit=crop&q=80&w=800", features: ["Subversive design", "Spiked outsole", "Over-the-top branding"] },
  { id: 93, title: "Jordan 1 Zoom CMFT", brand: "Jordan", price: 12999, rating: 4.5, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Zoom Air cushioning", "Suede construction", "Deconstructed collar"] },
  { id: 94, title: "Nike Air Max Dawn", brand: "Nike", price: 9499, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", features: ["Sustainability-conscious", "Air bag window", "Vintage running lines"] },
  { id: 95, title: "Adidas Gazelle Bold", brand: "Adidas", price: 10499, rating: 4.6, image: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800", features: ["Triple-stacked sole", "Classic suede upper", "Serrated 3-Stripes"] },
  { id: 96, title: "Puma Slipstream Lo", brand: "Puma", price: 8499, rating: 4.3, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", features: ["Heritage hoop design", "Leather/suede panels", "Soft ride experience"] },
  { id: 97, title: "New Balance 574 Core", brand: "New Balance", price: 7999, rating: 4.7, image: "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbb?auto=format&fit=crop&q=80&w=800", features: ["ENCAP midsole", "Timeless silhouette", "Standard grey colorway"] },
  { id: 98, title: "Jordan 1 Low SE", brand: "Jordan", price: 9499, rating: 4.5, image: "https://images.unsplash.com/photo-1552346154-21d328109a27?auto=format&fit=crop&q=80&w=800", features: ["Unique textures", "Specialized branding", "Low-profile Air"] },
  { id: 99, title: "Nike Dunk Low Retro SE", brand: "Nike", price: 10999, rating: 4.6, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", features: ["Vibrant color-blocking", "Crisp leather finish", "Enhanced durability"] },
  { id: 100, title: "Converse Weapons CX", brand: "Converse", price: 10999, rating: 4.4, image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", features: ["80s hoops archive", "CX foam comfort", "Leather construction"] }
];

const BRANDS = ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Puma', 'Converse', 'Asics', 'Vans', 'Off-White', 'Balenciaga'];

const ORDER_STATUS_STEPS = [
  { status: 'PLACED', label: 'Order Placed', description: 'Your order is in the vault.' },
  { status: 'AUTHENTICATING', label: 'Quality Check', description: 'Moonwalk experts are verifying authenticity.' },
  { status: 'PACKAGED', label: 'Packaged', description: 'Heat is ready for dispatch.' },
  { status: 'SHIPPED', label: 'Shipped', description: 'Your kicks are on the move.' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Enjoy your new pickup!' }
] as const;

const COUPONS = {
  'MOONWALK20': 0.20,
  'KICKSTART': 0.10,
  'SNEAKERHEAD': 0.15
};

const OrderTimeline = ({ currentStatus }: { currentStatus: Order['status'] }) => {
  const currentIndex = ORDER_STATUS_STEPS.findIndex(s => s.status === currentStatus);
  
  return (
    <div className="py-6 px-2">
      <div className="relative flex justify-between">
        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-10" />
        <div 
          className="absolute top-4 left-0 h-[2px] bg-black transition-all duration-1000 -z-10" 
          style={{ width: `${(currentIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
        />
        
        {ORDER_STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          
          return (
            <div key={idx} className="flex flex-col items-center gap-3 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isCompleted ? 'bg-black text-white scale-110' : 'bg-white text-gray-300 border-2 border-gray-100'}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                {isActive && (
                  <motion.div 
                    layoutId="active-glow"
                    className="absolute -inset-2 bg-black/5 rounded-full -z-10"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
              <div className="text-center">
                <p className={`text-[8px] font-black uppercase tracking-widest ${isCompleted ? 'text-black' : 'text-gray-300'}`}>{step.label}</p>
                {isActive && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[7px] text-gray-500 font-medium absolute top-full left-1/2 -translate-x-1/2 w-24 mt-2"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProfileView = ({ user, onLogout, onHome, onRemoveAddress }: { 
  user: User; 
  onLogout: () => void; 
  onHome: () => void;
  onRemoveAddress: (index: number) => void;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black italic tracking-tighter uppercase">My <span className="text-gray-400">Profile</span></h2>
          <p className="text-gray-500 font-medium">Manage your vault and track your latest pickups.</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-gray-100 text-gray-900 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Order <span className="text-gray-400">History</span></h3>
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Moon Points</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-black text-xl">{user.points || 0}</span>
                </div>
              </div>
            </div>
            {user.orders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium italic">No orders found yet. Time to cop some heat?</p>
                <button onClick={onHome} className="text-sm font-bold underline">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <div key={order.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</p>
                        <p className="font-bold font-mono">#{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                        <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">{order.status}</span>
                      </div>
                    </div>

                    <OrderTimeline currentStatus={order.status} />

                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                       {order.items.map((item, idx) => (
                         <div key={idx} className="w-16 h-16 rounded-xl bg-white border border-gray-100 p-1 shrink-0 relative group">
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl" />
                           <img src={item.product.image} className="w-full h-full object-contain" />
                         </div>
                       ))}
                    </div>
                    
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200/50">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{order.date}</p>
                        {order.discount && (
                          <p className="text-[10px] text-green-600 font-bold uppercase">Promo Applied: -₹{order.discount.toLocaleString('en-IN')}</p>
                        )}
                        {order.earnedPoints && (
                          <p className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1">
                            <Star className="w-2 h-2 fill-current" />
                            +{order.earnedPoints} Points Earned
                          </p>
                        )}
                      </div>
                      <p className="font-black text-2xl">₹{order.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-gray-900 text-white p-8 rounded-[40px] shadow-xl space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">My <span className="text-gray-400">Info</span></h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</p>
                <p className="font-bold text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</p>
                <p className="font-bold text-lg truncate">{user.email}</p>
              </div>
            </div>
           </section>

           <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Saved <span className="text-gray-400">Addresses</span></h3>
              <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-black transition-colors" />
            </div>
            {user.addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 font-medium italic">No addresses saved yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.addresses.map((address, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl relative group">
                    <button 
                      onClick={() => onRemoveAddress(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-bold text-gray-900">{address.houseNumber}</p>
                    <p className="text-xs text-gray-500">{address.area}</p>
                    <p className="text-xs text-gray-500">{address.landmark}</p>
                    <p className="text-xs font-black mt-1 uppercase tracking-widest">{address.city}, {address.pincode}</p>
                  </div>
                ))}
              </div>
            )}
           </section>
        </div>
      </div>
    </motion.div>
  );
};

// --- Components ---

// --- Components ---

const StylingView = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Yo! I'm your AI Sneaker Stylist. Need help pairing your kicks with an outfit or finding your next pair? Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a professional sneaker stylist and enthusiast. You know everything about sneaker history, fashion trends, and outfit coordination. Be concise, trendy, and helpful. Use emojis. If asked about prices, remind users to check the Moonwalk catalog."
        }
      });

      const aiResponse = response.text || "Sorry, I'm feeling a bit out of the loop. Try again!";
      setMessages(prev => [...prev, { role: "model", text: aiResponse }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "My laces are tied! 😅 I'm having trouble connecting. Make sure your API key is configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-[70vh] flex flex-col gap-6"
    >
      <div className="flex justify-between items-center bg-black text-white p-6 rounded-[30px] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">AI <span className="text-gray-400">Stylist</span></h2>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Powered by Gemini</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/50 backdrop-blur-sm rounded-[40px] p-6 space-y-4 border border-gray-100">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-5 rounded-[25px] text-sm font-medium shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[25px] rounded-bl-none border border-gray-100 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Stylist is thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative group p-4 bg-white rounded-[40px] shadow-2xl border border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for style tips, brand history, or outfit ideas..."
            className="w-full bg-gray-50 border-none rounded-[30px] px-8 py-6 pr-20 focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium text-gray-900"
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-black text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ComingSoonSection = ({ onNotify }: { onNotify: (drop: Drop) => void }) => {
  return (
    <section className="space-y-10 py-20 border-t border-gray-100 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div className="space-y-2">
          <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">The <span className="text-gray-400">Launchpad</span></h2>
          <p className="text-gray-500 font-medium">Coming soon to Moonwalk. Set your reminders.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 px-4">
        {DROPS.map((drop) => (
          <div key={drop.id} className="group relative overflow-hidden rounded-[50px] bg-gray-50 border border-gray-100 flex flex-col lg:flex-row">
            <div className="lg:w-1/2 h-[300px] lg:h-auto overflow-hidden bg-white flex items-center justify-center p-12">
              <motion.img 
                whileHover={{ scale: 1.1, rotate: -5 }}
                src={drop.image} 
                className="w-full h-full object-contain transition-transform duration-700" 
                alt={drop.title}
              />
            </div>
            <div className="lg:w-1/2 p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Limited Drop</span>
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">{drop.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{drop.description}</p>
                <p className="text-2xl font-black">₹{drop.price.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {['Days', 'Hrs', 'Min', 'Sec'].map((label, idx) => (
                    <div key={label} className="bg-white p-3 rounded-2xl border border-gray-100 text-center">
                      <p className="text-xl font-black">{idx === 0 ? '03' : idx === 1 ? '12' : idx === 2 ? '45' : '01'}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onNotify(drop)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PulseToast: React.FC<{ activity: { id: number, text: string } }> = ({ activity }) => (
  <motion.div 
    initial={{ opacity: 0, x: 50, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 20, scale: 0.9 }}
    className="bg-white/90 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto min-w-[320px]"
  >
    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/20">
      <TrendingUp className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold text-gray-900 leading-tight">{activity.text}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Verified Activity
      </p>
    </div>
  </motion.div>
);

const CheckoutView = ({ 
  items, 
  user,
  onComplete, 
  onBack 
}: { 
  items: CartItem[], 
  user: User | null,
  onComplete: (details: any) => void,
  onBack: () => void 
}) => {
  type PaymentMethod = 'CARD' | 'UPI' | 'WALLET' | 'BANK' | 'COD';
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [details, setDetails] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    houseNumber: '',
    area: '',
    landmark: '',
    city: '', 
    pincode: '',
    saveAddress: false
  });
  
  const subtotal = useMemo(() => 
    items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
  [items]);

  const promoDiscount = useMemo(() => subtotal * discountPercent, [subtotal, discountPercent]);
  
  // Points logic: Each point is ₹1. Max redemption: 20% of subtotal.
  const maxPointsRedeemable = Math.min(user?.points || 0, subtotal * 0.2);
  const pointsDiscount = usePoints ? maxPointsRedeemable : 0;
  
  const total = subtotal - promoDiscount - pointsDiscount;
  const pointsToEarn = Math.floor(total * 0.05); // Earn 5% back as points

  const applyPromo = () => {
    const rate = COUPONS[promoCode as keyof typeof COUPONS];
    if (rate) {
      setDiscountPercent(rate);
    } else {
      alert('Invalid Promo Code');
      setDiscountPercent(0);
    }
  };

  const useSavedAddress = (address: Address) => {
    setDetails({
      ...details,
      houseNumber: address.houseNumber,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      pincode: address.pincode,
      saveAddress: false
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 px-4"
    >
      {/* Form */}
      <div className="space-y-8">
        <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-black flex items-center gap-2">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Store
        </button>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Shipping <span className="text-gray-600">Details</span></h2>
          
          {user && user.addresses.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saved Addresses</p>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {user.addresses.map((address, idx) => (
                  <button 
                    key={idx}
                    onClick={() => useSavedAddress(address)}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black transition-all text-left min-w-[200px] shrink-0"
                  >
                    <p className="text-xs font-bold truncate">{address.houseNumber}</p>
                    <p className="text-[10px] text-gray-500 truncate">{address.area}</p>
                    <p className="text-[10px] font-black mt-1">{address.city}, {address.pincode}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Full Name" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900"
              value={details.name}
              onChange={e => setDetails({...details, name: e.target.value})}
            />
            <input 
              placeholder="Email Address" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900"
              value={details.email}
              onChange={e => setDetails({...details, email: e.target.value})}
            />
            <input 
              placeholder="House/Flat/Office No." 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900 md:col-span-2"
              value={details.houseNumber}
              onChange={e => setDetails({...details, houseNumber: e.target.value})}
            />
            <input 
              placeholder="Street/Area" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900 md:col-span-2"
              value={details.area}
              onChange={e => setDetails({...details, area: e.target.value})}
            />
            <input 
              placeholder="Landmark" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900 md:col-span-2"
              value={details.landmark}
              onChange={e => setDetails({...details, landmark: e.target.value})}
            />
            <input 
              placeholder="City" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900"
              value={details.city}
              onChange={e => setDetails({...details, city: e.target.value})}
            />
            <input 
              placeholder="Pincode" 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-gray-100 transition-all outline-none font-medium text-gray-900"
              value={details.pincode}
              onChange={e => setDetails({...details, pincode: e.target.value})}
            />
          </div>

          {user && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                className="hidden"
                checked={details.saveAddress}
                onChange={e => setDetails({...details, saveAddress: e.target.checked})}
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${details.saveAddress ? 'bg-black border-black text-white shadow-lg' : 'border-gray-200 group-hover:border-black'}`}>
                {details.saveAddress && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className="text-sm font-bold text-gray-600 group-hover:text-black">Save this address to my profile</span>
            </label>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Payment <span className="text-gray-600">Method</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => setMethod('CARD')}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${method === 'CARD' ? 'border-black bg-gray-50 shadow-lg shadow-gray-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'CARD' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg">Card</span>
                </div>
                {method === 'CARD' && <CheckCircle2 className="w-5 h-5 text-black" />}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-11">Credit or Debit</p>
            </button>

            <button 
              onClick={() => setMethod('UPI')}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${method === 'UPI' ? 'border-black bg-gray-50 shadow-lg shadow-gray-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'UPI' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg">UPI</span>
                </div>
                {method === 'UPI' && <CheckCircle2 className="w-5 h-5 text-black" />}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-11">Instant Transfer</p>
            </button>

            <button 
              onClick={() => setMethod('WALLET')}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${method === 'WALLET' ? 'border-black bg-gray-50 shadow-lg shadow-gray-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'WALLET' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg">Wallets</span>
                </div>
                {method === 'WALLET' && <CheckCircle2 className="w-5 h-5 text-black" />}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-11">GPay, PhonePe, Paytm</p>
            </button>

            <button 
              onClick={() => setMethod('BANK')}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${method === 'BANK' ? 'border-black bg-gray-50 shadow-lg shadow-gray-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'BANK' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg">Bank</span>
                </div>
                {method === 'BANK' && <CheckCircle2 className="w-5 h-5 text-black" />}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-11">Net Banking</p>
            </button>

            <button 
              onClick={() => setMethod('COD')}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${method === 'COD' ? 'border-black bg-gray-50 shadow-lg shadow-gray-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'COD' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="font-black text-lg">COD</span>
                </div>
                {method === 'COD' && <CheckCircle2 className="w-5 h-5 text-black" />}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-11">Cash on Delivery</p>
            </button>
          </div>
        </div>

        <button 
          onClick={() => {
            if (!details.name || !details.email || !details.houseNumber || !details.area || !details.city || !details.pincode) {
              alert('Please fill in all shipping details.');
              return;
            }
            onComplete({ 
              ...details, 
              method, 
              total, 
              discount: promoDiscount + pointsDiscount,
              pointsSpent: pointsDiscount, // Since 1 point = ₹1
              pointsToEarn: user ? pointsToEarn : 0
            });
          }}
          className="w-full bg-black text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {method === 'COD' ? 'Place Order' : 'Proceed to Pay'}
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Summary */}
      <div className="space-y-8 lg:sticky lg:top-32 h-fit">
        <div className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 relative z-10 flex items-center gap-3">
             <ShoppingBag className="w-6 h-6 text-gray-400" />
             Order Summary
          </h3>
          <div className="space-y-6 relative z-10">
            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10 group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-1">
                      <img src={item.product.image} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-black truncate max-w-[140px] text-white">{item.product.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity} | {item.size}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-white/10 space-y-6">
              {/* Promo Code Input */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unlock Discount</p>
                <div className="flex gap-2">
                  <input 
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold focus:border-white/30 transition-all outline-none text-white focus:bg-white/10"
                  />
                  <button 
                    onClick={applyPromo}
                    className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Moon Points Loyalty */}
              {user && (
                <div className={`p-5 rounded-3xl border transition-all ${usePoints ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${usePoints ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                        <Star className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Moon Points</p>
                        <p className="text-[9px] text-gray-400 font-medium">Balance: {user.points || 0} Points</p>
                      </div>
                    </div>
                    {(user.points || 0) > 0 && (
                      <button 
                        onClick={() => setUsePoints(!usePoints)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all ${usePoints ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {usePoints ? 'Remove' : 'Redeem'}
                      </button>
                    )}
                  </div>
                  {usePoints && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-yellow-400">
                      <span>Redemption applied</span>
                      <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-xs font-bold uppercase tracking-widest animate-in slide-in-from-right duration-300">
                    <span>Promo Discount</span>
                    <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-yellow-400 text-xs font-bold uppercase tracking-widest animate-in slide-in-from-right duration-300">
                    <span>Points Redemption</span>
                    <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <span>Shipping Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-2xl font-black uppercase tracking-tighter italic">Grand Total</span>
                    {user && (
                      <p className="text-[9px] text-blue-400 font-black tracking-widest uppercase">+ {pointsToEarn} Moon Points Earned</p>
                    )}
                  </div>
                  <span className="text-3xl font-black text-white">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="p-4 bg-gray-100 rounded-[24px] text-black group-hover:rotate-12 transition-transform">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
             <h4 className="font-black text-gray-900 uppercase italic tracking-tight">MoonWalk Guarantee</h4>
             <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">100% Authentic. Secure Payments.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ThankYouView = ({ 
  orderId, 
  onHome 
}: { 
  orderId: string, 
  onHome: () => void 
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="max-w-xl mx-auto py-24 px-4 text-center space-y-8"
  >
    <div className="relative inline-block">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-32 h-32 bg-gray-900 rounded-[48px] flex items-center justify-center mx-auto shadow-2xl shadow-gray-200"
      >
        <CheckCircle2 className="w-16 h-16 text-white" />
      </motion.div>
      <div className="absolute top-0 right-0 w-8 h-8 bg-black rounded-full animate-bounce delay-100 shadow-lg shadow-gray-200 flex items-center justify-center">
        <Star className="w-4 h-4 text-white fill-white" />
      </div>
    </div>
    
    <div className="space-y-2">
      <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic text-gray-900">Order <span className="text-black underline">Confirmed!</span></h2>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Your heat is on its way.</p>
    </div>

    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-4">
        <span className="text-gray-400 uppercase tracking-widest">Order ID</span>
        <span className="text-gray-900">{orderId}</span>
      </div>
      <div className="flex justify-between items-center text-sm font-bold pt-2">
        <span className="text-gray-400 uppercase tracking-widest">Estimated Delivery</span>
        <span className="text-gray-900">3-5 Business Days</span>
      </div>
    </div>

    <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
      Thank you for shopping with MoonWalk. You'll receive an email confirmation with tracking info shortly.
    </p>

    <button 
      onClick={onHome}
      className="w-full bg-gray-900 text-white py-6 rounded-[32px] font-black text-xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
    >
      Continue Shopping
    </button>
  </motion.div>
);

const SizeGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-[40px] p-8 relative z-10 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-2xl">
                <Ruler className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Size <span className="text-gray-500">Guide</span></h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-[24px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="py-4 px-4 text-left">US</th>
                  <th className="py-4 px-4 text-left">UK</th>
                  <th className="py-4 px-4 text-left">EU</th>
                  <th className="py-4 px-4 text-left">CM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SIZE_CONVERSIONS.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-black">US {s.us}</td>
                    <td className="py-4 px-4 text-gray-500 font-bold">{s.uk}</td>
                    <td className="py-4 px-4 text-gray-500 font-bold">{s.eu}</td>
                    <td className="py-4 px-4 text-gray-500 font-bold">{s.cm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-[32px] space-y-2">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" /> Measuring Tip
            </p>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Place your foot on a flat surface with your heel against a straight edge or wall. Measure from the wall to the tip of your longest toe.
            </p>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;
    
    // Simulated auth
    const user: User = {
      email,
      name: isLogin ? email.split('@')[0] : name,
      orders: [],
      addresses: [],
      points: isLogin ? 0 : 500 // 500 points welcome bonus for new accounts
    };
    
    onLogin(user);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">
                  {isLogin ? 'Welcome' : 'Join the'}<br/>
                  <span className="text-gray-400">{isLogin ? 'Back' : 'Club'}</span>
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {isLogin ? 'Sign in to access your sneaker vault.' : 'Create an account for exclusive drops and tracking.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-black outline-none transition-all font-medium"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sneakerhead@example.com"
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-black outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-black outline-none transition-all font-medium"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-900 transition-all active:scale-95 mt-4"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs font-bold text-gray-500 hover:text-black transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Components ---

interface NavbarProps {
  currentView: View;
  setView: (v: View) => void;
  cartCount: number;
  cartTotal: number;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onCartClick: () => void;
  onWishlistClick: () => void;
  wishlistCount: number;
  currentUser: User | null;
  onAccountClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  cartCount, 
  cartTotal,
  searchTerm, 
  setSearchTerm,
  onCartClick,
  onWishlistClick,
  wishlistCount,
  currentUser,
  onAccountClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header id="navbar" className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          id="logo"
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('HOME')}
        >
          <div className="p-2 bg-black rounded-lg group-hover:rotate-[-12deg] transition-transform duration-300">
            <Footprints className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Moon<span className="text-gray-500">Walk</span>
          </span>
        </div>

        {/* Search */}
        <div id="search-bar" className="hidden md:flex flex-1 max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search for sneakers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-400 focus:bg-white transition-all text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (currentView !== 'COLLECTIONS') setView('COLLECTIONS');
            }}
          />
        </div>

        {/* Links */}
        <div id="nav-links" className="hidden lg:flex items-center gap-8">
          {(['dashboard', 'collections', 'brands', 'wishlist'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setView(view.toUpperCase() as View)}
              className={`text-sm font-semibold capitalize transition-colors ${
                currentView === view.toUpperCase() ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* User Account */}
          <div 
            onClick={onAccountClick}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className={`p-1.5 rounded-full ${currentUser ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-0.5">
                {currentUser ? 'Member' : 'Welcome'}
              </p>
              <p className="text-[12px] font-black text-gray-900 leading-none truncate max-w-[80px]">
                {currentUser ? currentUser.name : 'Sign In'}
              </p>
            </div>
          </div>

          {/* Wishlist */}
          <div 
            onClick={onWishlistClick}
            className="relative cursor-pointer hover:scale-110 transition-transform p-2 hidden sm:block"
          >
            <Heart className={`w-6 h-6 ${currentView === 'WISHLIST' ? 'text-black fill-black' : 'text-gray-700'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Cart */}
          <div 
            id="cart-btn" 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all"
            onClick={onCartClick}
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
            {cartTotal > 0 && (
              <span className="text-sm font-black text-gray-900 hidden sm:block">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden relative">
            <button 
              id="menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-black text-white rotate-90 shadow-lg' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <MoreVertical className="w-6 h-6" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {(['dashboard', 'collections', 'brands', 'wishlist', 'profile', 'styling'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => {
                        if (view === 'profile') {
                          onAccountClick();
                        } else {
                          setView(view.toUpperCase() as View);
                        }
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-sm font-bold capitalize text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        {view === 'styling' && <Sparkles className="w-4 h-4 text-yellow-500" />}
                        {view === 'profile' && !currentUser ? 'Sign In' : view}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetails,
  onToggleWishlist,
  onBuyNow,
  isWishlisted
}) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col relative"
  >
    {/* Wishlist Button */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggleWishlist(product);
      }}
      className="absolute top-3 left-3 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:scale-110 transition-transform shadow-sm"
    >
      <Heart className={`w-4 h-4 ${isWishlisted ? 'text-black fill-black' : 'text-gray-400'}`} />
    </button>

    <div 
      className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      <img 
        src={product.image} 
        alt={product.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
        <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
        <span className="text-xs font-bold text-gray-700">{product.rating}</span>
      </div>
    </div>
    
    <div className="p-5 flex flex-col flex-1">
      <h3 
        className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors cursor-pointer line-clamp-1"
        onClick={() => onViewDetails(product)}
      >
        {product.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">{product.brand}</p>
      
      <div className="mt-2 text-xl font-extrabold text-gray-900 mb-4">
        ₹{product.price.toLocaleString('en-IN')}
      </div>
      
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
        <button 
          onClick={() => onAddToCart(product)}
          className="bg-gray-100 text-gray-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors active:scale-95"
        >
          Add to Cart
        </button>
        <button 
          onClick={() => onBuyNow(product)}
          className="bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors active:scale-95 shadow-sm shadow-gray-100"
        >
          Buy Now
        </button>
      </div>
    </div>
  </motion.div>
);

interface ToastProps {
  message: string;
  onRemove: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 pointer-events-auto"
    >
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = useMemo(() => 
    items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
  [items]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="cart-drawer-container" className="fixed inset-0 z-[150] pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-black" />
                <h2 className="text-lg font-bold text-gray-900 uppercase">Your Cart ({items.length})</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="p-6 bg-gray-50 rounded-full">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is empty.</p>
                  <button 
                    onClick={onClose}
                    className="text-black font-bold text-sm uppercase tracking-tighter"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    key={item.product.id} 
                    className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                      <img src={item.product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.product.title}</h4>
                        <p className="text-sm font-black text-black">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Size: {item.size} | ₹{item.product.price.toLocaleString('en-IN')} each</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="p-1 hover:text-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="p-1 hover:text-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.product.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Subtotal</span>
                  <span className="text-2xl font-black text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Checkout Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-tighter">
                  Free shipping on all premium sneaker orders.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ReviewForm = ({ onReview }: { onReview: (rating: number, comment: string) => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-black">Write a Review</h5>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setRating(s)}
            className="focus:outline-none transition-transform active:scale-95"
          >
            <Star className={`w-5 h-5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Share your thoughts on this pair..."
        className="w-full p-4 bg-gray-50 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all h-24 resize-none"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        disabled={!comment.trim()}
        onClick={() => {
          onReview(rating, comment);
          setComment('');
          setRating(5);
        }}
        className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Review
      </button>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('moonwalk_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('moonwalk_user');
    if (!saved) return null;
    const user = JSON.parse(saved);
    // Migration: add points if missing
    if (user.points === undefined) user.points = 1000; 
    return user;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('moonwalk_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('moonwalk_products', JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('US 9');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [showCookies, setShowCookies] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [toasts, setToasts] = useState<{ id: number, message: string }[]>([]);
  const [pulseActivities, setPulseActivities] = useState<{ id: number, text: string }[]>([]);

  useEffect(() => {
    const pulsePrompts = [
      "Someone in Mumbai just copped the Jordan 4s!",
      "New drop reminder set by a user in Delhi",
      "Limited SB Dunk just sold out in US 10",
      "Fresh review: 'The comfort on these Yeezys is insane!'",
      "Trend Alert: New Balance 550 is selling fast today",
      "New pickup in Bangalore: Adidas Samba OG",
      "Someone just used AI Stylist for the first time!"
    ];

    const interval = setInterval(() => {
      const id = Date.now();
      const text = pulsePrompts[Math.floor(Math.random() * pulsePrompts.length)];
      setPulseActivities(prev => [...prev, { id, text }]);
      setTimeout(() => setPulseActivities(prev => prev.filter(p => p.id !== id)), 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('moonwalk_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('moonwalk_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('moonwalk_user');
    }
  }, [currentUser]);

  const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=1400"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filtering and Sorting logic
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => 
      p.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    // Sorting logic
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // 'featured' - keep original order
        break;
    }

    return result;
  }, [debouncedSearchTerm, sortBy]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
  };

  const handleLogin = (user: User) => {
    // Ensure points exist for existing accounts
    const syncedUser = { ...user, points: user.points ?? 0 };
    setCurrentUser(syncedUser);
    addToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('HOME');
    addToast('Logged out successfully.');
  };

  const addToCart = (product: Product, size?: string) => {
    setCart(prev => {
      const selectedS = size || 'US 9';
      const existing = prev.find(item => item.product.id === product.id && item.size === selectedS);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.size === selectedS
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, size: selectedS }];
    });
    addToast(`${product.title} added to cart!`);
  };

  const handleBuyNow = (product: Product, size?: string) => {
    setCart([{ product, quantity: 1, size: size || 'US 9' }]);
    setCurrentView('CHECKOUT');
    addToast(`Starting checkout for ${product.title}`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const toggleWishlist = (product: Product) => {
    const isExist = wishlist.find(p => p.id === product.id);
    if (isExist) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
      addToast(`${product.title} removed from wishlist.`);
    } else {
      setWishlist(prev => [...prev, product]);
      addToast(`${product.title} added to wishlist!`);
    }
  };

  const handleAddReview = (productId: number, user: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      user,
      rating,
      comment,
      date: 'Just now',
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    };

    setAllProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return { ...p, reviews: updatedReviews, rating: newRating };
      }
      return p;
    }));

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const updatedReviews = [newReview, ...(prev.reviews || [])];
        const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return { ...prev, reviews: updatedReviews, rating: newRating };
      });
    }

    addToast('Review posted successfully!');
  };

  const totalCartCount = useMemo(() => 
    cart.reduce((acc, item) => acc + item.quantity, 0),
  [cart]);

  const totalCartPrice = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
  [cart]);

  const handleCheckoutComplete = (details: any) => {
    const orderId = `MW-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    if (currentUser) {
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...cart],
        total: details.total,
        status: 'PLACED',
        discount: details.discount,
        earnedPoints: details.pointsToEarn
      };
      
      const newAddresses = [...currentUser.addresses];
      if (details.saveAddress) {
        const addressExists = newAddresses.some(a => 
          a.houseNumber === details.houseNumber && 
          a.pincode === details.pincode
        );
        if (!addressExists) {
          newAddresses.push({
            id: Date.now().toString(),
            houseNumber: details.houseNumber,
            area: details.area,
            landmark: details.landmark,
            city: details.city,
            pincode: details.pincode
          });
        }
      }

      setCurrentUser(prev => prev ? {
        ...prev,
        orders: [newOrder, ...prev.orders],
        addresses: newAddresses,
        points: (prev.points || 0) - (details.pointsSpent || 0) + (details.pointsToEarn || 0)
      } : null);
    }
    
    setLastOrderId(orderId);
    setCart([]);
    addToast(`Order ${orderId} placed successfully!`);
    setCurrentView('THANK_YOU');
  };

  const handleRemoveAddress = (index: number) => {
    if (!currentUser) return;
    const newAddresses = [...currentUser.addresses];
    newAddresses.splice(index, 1);
    setCurrentUser({
      ...currentUser,
      addresses: newAddresses
    });
    addToast('Address removed from profile.');
  };

  const handleNotify = (drop: Drop) => {
    addToast(`Reminder set for ${drop.title}! We'll notify you on the drop date.`);
  };

  const filterByBrand = (brand: string) => {
    setSearchTerm(brand);
    setCurrentView('COLLECTIONS');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast("Please enter a valid sneakerhead email!");
      return;
    }
    
    // Simulate API call
    setIsSubscribed(true);
    addToast(`Subscription successful! Check ${newsletterEmail} for your welcome offer.`);
    
    // Reset after success if needed, or just keep the "Success" state
    setNewsletterEmail('');
  };

  return (
    <div id="app-container" className="min-h-screen bg-[#fafafa] font-sans selection:bg-gray-200 selection:text-black">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setCurrentView('WISHLIST')}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onAccountClick={() => currentUser ? setCurrentView('PROFILE') : setIsAuthModalOpen(true)}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('CHECKOUT');
        }}
      />

      <main id="main-content" className="pt-8 px-4 pb-24">
        <AnimatePresence mode="wait">
          {/* STYLING VIEW */}
          {currentView === 'STYLING' && (
            <StylingView key="styling" />
          )}

          {/* HOME VIEW */}
          {currentView === 'HOME' && (
            <motion.section 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto space-y-16"
            >
              {/* Hero */}
              <div id="hero" className="relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden bg-gray-900 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeHeroIndex}
                    src={HERO_IMAGES[activeHeroIndex]} 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    alt="Hero Gallery"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-10 pointer-events-none">
                  <motion.h1 
                    key={`h1-${activeHeroIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter"
                  >
                    Step Into The <span className="text-gray-400 italic">Future</span>
                  </motion.h1>
                  <motion.p 
                    key={`p-${activeHeroIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/90 text-lg md:text-xl max-w-2xl font-medium mb-10 leading-relaxed"
                  >
                    Explore limited edition drops and the most coveted sneaker collections globally.
                  </motion.p>
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentView('COLLECTIONS')}
                    className="bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2 group pointer-events-auto"
                  >
                    Shop Collections
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                {/* Gallery Controls */}
                <div className="absolute inset-x-8 bottom-8 flex justify-between items-center z-20">
                  <div className="flex gap-2">
                    {HERO_IMAGES.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveHeroIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${activeHeroIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveHeroIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto"
                    >
                      <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <button 
                      onClick={() => setActiveHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Section */}
              <div id="featured-drops" className="space-y-8">
                <div className="flex items-center justify-between border-l-4 border-black pl-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Featured Drops</h2>
                    <p className="text-gray-500 font-medium">The most popular releases this month</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('COLLECTIONS')}
                    className="hidden md:flex items-center gap-2 text-black font-bold hover:underline"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {allProducts.slice(0, 4).map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={addToCart}
                        onViewDetails={setSelectedProduct}
                        onToggleWishlist={toggleWishlist}
                        onBuyNow={handleBuyNow}
                        isWishlisted={wishlist.some(p => p.id === product.id)}
                      />
                    ))}
                  </div>
              </div>

              {/* Launchpad: Coming Soon Section */}
              <ComingSoonSection onNotify={handleNotify} />
            </motion.section>
          )}

          {/* DASHBOARD VIEW */}
          {currentView === 'DASHBOARD' && (
            <motion.section 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Store <span className="text-black italic underline">Dashboard</span></h2>
                <p className="text-gray-500 max-w-xl mx-auto font-medium">Managing the pulse of modern sneaker culture since 2026.</p>
              </div>

              <div id="about-card" className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex items-start gap-6">
                   <div className="p-4 bg-gray-100 rounded-2xl text-black">
                      <Info className="w-8 h-8" />
                   </div>
                   <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      MoonWalk is more than a store; it's a premium destination for enthusiasts who value authenticity. 
                      We work with global suppliers to ensure every pair that hits your collection is 100% verified.
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5" />
                       Mission: To connect sneakerheads with their favorite kicks.
                    </p>
                   </div>
                </div>
              </div>

              <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Tag, label: 'Total Collections', value: allProducts.length, color: 'blue' },
                  { icon: Star, label: 'Partner Brands', value: BRANDS.length, color: 'yellow' },
                  { icon: Users, label: 'Happy Customers', value: '12K+', color: 'green' }
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-900 p-8 rounded-[32px] text-white space-y-2 text-center hover:scale-105 transition-transform cursor-default">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-4xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Authenticity Requirements */}
              <div id="authenticity" className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">Essential <span className="text-black italic">Requirements</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-gray-50 text-black rounded-2xl flex items-center justify-center">
                         <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold">Authenticity Guarantee</h4>
                      <p className="text-gray-500 font-medium">Every pair sold through MoonWalk is verified by our team of specialists. We check materials, stitching, and tags against our global database.</p>
                   </div>
                   <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                      <div className="w-12 h-12 bg-gray-50 text-black rounded-2xl flex items-center justify-center">
                         <Ruler className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold">Accurate Size Guide</h4>
                      <p className="text-gray-500 font-medium">We provide detailed measurements for every brand. Note: Yeezy 350s run small, we recommend rounding up. Nike SB Dunks are true to size.</p>
                   </div>
                </div>
              </div>

              {/* Newsletter */}
              <div id="newsletter" className="bg-black rounded-[40px] p-12 text-center text-white space-y-6 relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]" />
                 
                 <AnimatePresence mode="wait">
                   {!isSubscribed ? (
                     <motion.div 
                       key="sub-form"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="space-y-6 relative z-10"
                     >
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Don't Miss The Next Drop</h3>
                        <p className="text-gray-400 max-w-md mx-auto font-medium">Join 50,000+ sneakerheads who get notified about restocks and secret drops.</p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input 
                              type="email" 
                              required
                              placeholder="Enter your sneakerhead email"
                              value={newsletterEmail}
                              onChange={(e) => setNewsletterEmail(e.target.value)}
                              className="flex-1 px-8 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            />
                            <button 
                              type="submit"
                              className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl active:scale-95"
                            >
                              Subscribe
                            </button>
                        </form>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="sub-success"
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="space-y-4 relative z-10 py-4"
                     >
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                           <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">Welcome to the Club</h3>
                        <p className="text-gray-400 max-w-md mx-auto font-medium">
                          You're on the list! Check your inbox for exclusive offers and restock alerts.
                        </p>
                        <button 
                          onClick={() => setIsSubscribed(false)}
                          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                          Use another email
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </motion.section>
          )}

          {/* COLLECTIONS VIEW */}
          {currentView === 'COLLECTIONS' && (
            <motion.section 
              key="collections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Full <span className="text-black italic">Inventory</span></h2>
                  <p className="text-gray-500 font-medium">Browse our full range of curated kicks.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sort By:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-gray-100 transition-all shadow-sm cursor-pointer"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="title">Alphabetical</option>
                    </select>
                  </div>

                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-100 px-4 py-2 rounded-full font-bold shadow-sm"
                    >
                      Clear Filter: "{searchTerm}" <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div id="collections-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                      onViewDetails={setSelectedProduct}
                      onToggleWishlist={toggleWishlist}
                      onBuyNow={handleBuyNow}
                      isWishlisted={wishlist.some(p => p.id === product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div id="empty-state" className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-200 space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">No sneakers found</h3>
                  <p className="text-gray-500">We couldn't find any results for "{searchTerm}". Try a different term!</p>
                </div>
              )}
            </motion.section>
          )}

          {/* BRANDS VIEW */}
          {currentView === 'BRANDS' && (
            <motion.section 
              key="brands"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-7xl mx-auto space-y-12"
            >
               <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Global <span className="text-black italic underline">Partners</span></h2>
                <p className="text-gray-500 max-w-xl mx-auto font-medium">Click a brand to explore their exclusive catalog.</p>
              </div>

              <div id="brands-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BRANDS.map((brand, i) => (
                  <motion.div
                    key={brand}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => filterByBrand(brand)}
                    className="h-40 bg-white rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer group hover:bg-black transition-colors relative overflow-hidden"
                  >
                    <span className="text-4xl font-black italic tracking-tighter text-gray-900 group-hover:text-white transition-colors relative z-10">
                      {brand.toUpperCase()}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-[radial-gradient(circle,white_10%,transparent_11%)] bg-[length:10px_10px]" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* WISHLIST VIEW */}
          {currentView === 'WISHLIST' && (
            <motion.section 
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto space-y-12"
            >
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Your <span className="text-black italic">Wishlist</span></h2>
                  <p className="text-gray-500 font-medium">Items you're eyeing for your next cop.</p>
                </div>

              {wishlist.length > 0 ? (
                <div id="wishlist-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {wishlist.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                      onViewDetails={setSelectedProduct}
                      onToggleWishlist={toggleWishlist}
                      onBuyNow={handleBuyNow}
                      isWishlisted={true}
                    />
                  ))}
                </div>
              ) : (
                <div id="wishlist-empty" className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-200 space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-red-400">
                    <Heart className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h3>
                  <p className="text-gray-500">Add some sneakers you love to see them here!</p>
                  <button 
                    onClick={() => setCurrentView('COLLECTIONS')}
                    className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors"
                  >
                    Go Shopping
                  </button>
                </div>
              )}
            </motion.section>
          )}

          {/* PROFILE VIEW */}
          {currentView === 'PROFILE' && currentUser && (
            <ProfileView 
              user={currentUser}
              onLogout={handleLogout}
              onHome={() => setCurrentView('HOME')}
              onRemoveAddress={handleRemoveAddress}
            />
          )}

          {/* CHECKOUT VIEW */}
          {currentView === 'CHECKOUT' && (
            <CheckoutView 
              items={cart}
              user={currentUser}
              onBack={() => setCurrentView('COLLECTIONS')}
              onComplete={handleCheckoutComplete}
            />
          )}

          {/* THANK YOU VIEW */}
          {currentView === 'THANK_YOU' && (
            <ThankYouView 
              orderId={lastOrderId}
              onHome={() => setCurrentView('HOME')}
            />
          )}

          {/* PRIVACY POLICY */}
          {currentView === 'PRIVACY' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto py-12 px-4 space-y-8"
            >
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Privacy <span className="text-black">Policy</span></h2>
              <div className="prose prose-neutral max-w-none space-y-6 text-gray-600 font-medium">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">1. Information We Collect</h3>
                  <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes name, email, shipping address, and payment information.</p>
                </section>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">2. How We Use Your Information</h3>
                  <p>We use the information we collect to process your orders, provide customer support, and send you technical notices, updates, and promotional messages.</p>
                </section>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">3. Data Security</h3>
                  <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
                </section>
              </div>
              <button 
                onClick={() => setCurrentView('HOME')}
                className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all"
              >
                Back to Home
              </button>
            </motion.div>
          )}

          {/* TERMS OF SERVICE */}
          {currentView === 'TERMS' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto py-12 px-4 space-y-8"
            >
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Terms of <span className="text-black">Service</span></h2>
              <div className="prose prose-neutral max-w-none space-y-6 text-gray-600 font-medium">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">1. Acceptance of Terms</h3>
                  <p>By accessing or using MoonWalk, you agree to be bound by these terms. If you do not agree to all the terms, you may not access the service.</p>
                </section>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">2. Use of Service</h3>
                  <p>MoonWalk provides a platform for purchasing authentic sneakers. You must provide accurate information when making a purchase.</p>
                </section>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">3. Limitation of Liability</h3>
                  <p>MoonWalk is not liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.</p>
                </section>
              </div>
              <button 
                onClick={() => setCurrentView('HOME')}
                className="bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all"
              >
                Back to Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Cookie Modal */}
      <AnimatePresence>
        {showCookies && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-8 right-8 md:left-auto md:w-96 bg-white border border-gray-100 shadow-2xl rounded-[32px] p-8 z-[100] space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-black rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-900 uppercase italic tracking-tight">Cookie Settings</h4>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies for performance, analytics, and marketing.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowCookies(false);
                  addToast("Cookie preferences saved.");
                }}
                className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-200"
              >
                Accept All
              </button>
              <button 
                onClick={() => setShowCookies(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Footprints className="text-black w-8 h-8" />
                <span className="text-2xl font-black italic tracking-tighter text-gray-900">MoonWalk</span>
              </div>
              <p className="text-gray-500 font-medium max-w-xs">
                The ultimate premium destination for sneakerheads and streetwear enthusiasts worldwide.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:col-span-2">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Navigation</h4>
                <ul className="space-y-2 text-gray-500 font-medium">
                  <li><button onClick={() => setCurrentView('HOME')} className="hover:text-black">Home</button></li>
                  <li><button onClick={() => setCurrentView('COLLECTIONS')} className="hover:text-black">Collections</button></li>
                  <li><button onClick={() => setCurrentView('BRANDS')} className="hover:text-black">Brands</button></li>
                  <li><button onClick={() => setCurrentView('WISHLIST')} className="hover:text-black">Wishlist</button></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Legal</h4>
                <ul className="space-y-2 text-gray-500 font-medium">
                  <li><button onClick={() => setCurrentView('PRIVACY')} className="hover:text-black">Privacy Policy</button></li>
                  <li><button onClick={() => setCurrentView('TERMS')} className="hover:text-black">Terms of Service</button></li>
                  <li><button onClick={() => setShowCookies(true)} className="hover:text-black">Cookie Settings</button></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400 font-semibold">
            &copy; 2026 MOONWALK SNEAKER STORE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div 
            id="modal-overlay"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div 
              layoutId={`product-${selectedProduct.id}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="md:w-1/2 h-[300px] md:h-auto bg-gray-50 group flex items-center justify-center p-8">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8 md:p-12 md:w-1/2 flex flex-col overflow-y-auto">
                <p className="text-black font-bold uppercase tracking-widest text-xs mb-2">Authentic {selectedProduct.brand}</p>
                <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedProduct.title}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-black text-gray-900">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    {selectedProduct.rating} Rating
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Size</h4>
                    <button 
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black hover:underline"
                    >
                      <Ruler className="w-3 h-3" /> Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map(size => {
                      const stockCount = selectedProduct.stock?.[size];
                      const isOutOfStock = stockCount === 0;
                      const isLowStock = stockCount !== undefined && stockCount > 0 && stockCount <= 3;
                      
                      return (
                        <div key={size} className="space-y-1">
                          <button 
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSize(size)}
                            className={`w-full py-4 rounded-2xl text-xs font-black transition-all border-2 flex flex-col items-center justify-center ${
                              selectedSize === size 
                                ? 'border-black bg-black text-white shadow-lg' 
                                : isOutOfStock
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-100 bg-white text-gray-600 hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                          {isLowStock && (
                             <p className="text-[8px] font-black uppercase text-orange-600 text-center animate-pulse">Only {stockCount} Left!</p>
                          )}
                          {isOutOfStock && (
                             <p className="text-[8px] font-black uppercase text-red-500 text-center">Sold Out</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Key Features</h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {selectedProduct.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl text-gray-700 font-medium text-sm">
                          <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reviews Integration */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Community Reviews ({selectedProduct.reviews?.length || 0})</h4>
                       <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>

                    <ReviewForm onReview={(rating, comment) => 
                      handleAddReview(selectedProduct.id, currentUser?.name || 'Anonymous', rating, comment)
                    } />
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                         selectedProduct.reviews.map(review => (
                           <div key={review.id} className="bg-gray-50 p-5 rounded-[24px] space-y-3">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <img src={review.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                    <span className="text-xs font-black">{review.user}</span>
                                 </div>
                                 <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                 </div>
                              </div>
                              <p className="text-xs text-gray-600 font-medium italic">"{review.comment}"</p>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest text-right">{review.date}</p>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No reviews yet. Be the first to drop one!</p>
                         </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct, selectedSize);
                        setSelectedProduct(null);
                      }}
                      className="w-full bg-gray-100 text-gray-900 py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => {
                        handleBuyNow(selectedProduct, selectedSize);
                        setSelectedProduct(null);
                      }}
                      className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Pulse Activity Toasts */}
      <div className="fixed bottom-8 left-8 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {pulseActivities.map((activity) => (
            <PulseToast key={activity.id} activity={activity} />
          ))}
        </AnimatePresence>
      </div>

      {/* Toasts */}
      <div id="toast-container" className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast 
              key={toast.id} 
              message={toast.message} 
              onRemove={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
