import { Product } from './types';

export const BRAND_NEW_CATEGORIES = [
  { name: 'Adapters', count: 30, img: 'https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=150' },
  { name: 'Cables & Connectors', count: 52, img: 'https://images.unsplash.com/photo-1620803444081-9bba14d33eb4?auto=format&fit=crop&q=80&w=150' },
  { name: 'Computer Casings', count: 45, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=150' },
  { name: 'Coolers', count: 30, img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=150' },
  { name: 'Cooling Pads', count: 10, img: 'https://images.unsplash.com/photo-1621644788390-e43890f84577?auto=format&fit=crop&q=80&w=150' },
  { name: 'Fan Kits', count: 9, img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=150' },
  { name: 'Gaming Chairs', count: 9, img: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=150' },
  { name: 'Gaming Controllers', count: 11, img: 'https://images.unsplash.com/photo-1600000293145-c44d15664db1?auto=format&fit=crop&q=80&w=150' },
  { name: 'Graphics Cards', count: 14, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=150' },
  { name: 'HDD', count: 2, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=150' },
  { name: 'Headset Stand', count: 2, img: 'https://images.unsplash.com/photo-1605648839506-69fc873b43db?auto=format&fit=crop&q=80&w=150' },
  { name: 'Headsets', count: 34, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=150' },
  { name: 'Keyboards', count: 41, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=150' },
  { name: 'Laptops', count: 32, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=150' },
  { name: 'Microphones', count: 11, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=150' },
  { name: 'Monitors', count: 44, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=150' },
  { name: 'Motherboards', count: 23, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=150' },
  { name: 'Mouse', count: 56, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=150' },
  { name: 'Mouse Pads', count: 9, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=150' },
  { name: 'NVMe', count: 21, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=150' },
  { name: 'Pen Drive', count: 7, img: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&q=80&w=150' },
  { name: 'Power Supply Units', count: 21, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=150' },
  { name: 'Processors', count: 21, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=150' },
  { name: 'RAM', count: 20, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=150' },
  { name: 'SATA SSD', count: 5, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=150' },
  { name: 'Speakers', count: 13, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=150' },
  { name: 'Storage Devices', count: 45, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=150' },
  { name: 'UPS', count: 7, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=150' },
  { name: 'Webcam', count: 9, img: 'https://images.unsplash.com/photo-1595787142842-7404bc60470d?auto=format&fit=crop&q=80&w=150' }
];

export const USED_CATEGORIES = [
  { name: 'Other Used Items', count: 1, img: 'https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Power Supply', count: 6, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Monitors', count: 7, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used RAM', count: 9, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Processors', count: 9, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Storage Devices', count: 13, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Motherboards', count: 16, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=150' },
  { name: 'Used Graphics Cards', count: 28, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=150' }
];

export const MOCK_PRODUCTS: Product[] = [
{
    id: '1',
    name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB',
    category: 'Graphics Cards',
    price: 850000,
    originalPrice: 890000,
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600'
    ],
    isNew: true,
    discount: 4,
    status: 'In Stock',
    shortDescription: 'The ROG Strix GeForce RTX 4090 brings a whole new meaning to going with the flow. Inside and out, every element of the card gives the monstrous GPU headroom to breathe freely and achieve ultimate performance.',
    description: 'NVIDIA Ada Lovelace Streaming Multiprocessors: Up to 2x performance and power efficiency. 4th Generation Tensor Cores: Up to 4x performance with DLSS 3 vs. brute-force rendering. 3rd Generation RT Cores: Up to 2x ray tracing performance.',
    sku: 'ROG-STRIX-RTX4090-O24G-GAMING',
    brand: 'ASUS',
    tags: ['GPU', 'Graphics Card', 'ASUS', 'NVIDIA', 'RTX 4090'],
    hashtags: ['#ASUSROG', '#RTX4090', '#PCMasterRace', '#GamingPC'],
    specifications: {
      'Graphics Engine': 'NVIDIA GeForce RTX 4090',
      'Bus Standard': 'PCI Express 4.0',
      'OpenGL': 'OpenGL 4.6',
      'Video Memory': '24GB GDDR6X',
      'Engine Clock': 'OC mode: 2640 MHz',
      'CUDA Core': '16384',
      'Memory Speed': '21 Gbps',
      'Memory Interface': '384-bit'
    }
  },
  {
    id: '2',
    name: 'AMD Ryzen 9 7950X3D Desktop Processor',
    category: 'Processors',
    price: 245000,
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80&w=600'
    ],
    isNew: true,
    status: 'In Stock'
  },
  {
    id: '3',
    name: 'Corsair Vengeance RGB 64GB (2x32GB) DDR5 6000MHz',
    category: 'RAM',
    price: 85000,
    originalPrice: 95000,
    rating: 4.7,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600',
    discount: 11,
    status: 'In Stock'
  },
  {
    id: '4',
    name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD',
    category: 'Storage',
    price: 68000,
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600',
    status: 'In Stock'
  },
  {
    id: '5',
    name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
    category: 'Peripherals',
    price: 48000,
    originalPrice: 55000,
    rating: 4.6,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1527814050087-151f0ce715ee?auto=format&fit=crop&q=80&w=600',
    discount: 13,
    status: 'In Stock'
  },
  {
    id: '6',
    name: 'Keychron Q1 Pro Custom Wireless Mechanical Keyboard',
    category: 'Peripherals',
    price: 72000,
    rating: 4.8,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
    isNew: true,
    status: 'In Stock'
  },
  {
    id: '7',
    name: 'MSI MAG CoreLiquid 360R V2 AIO Liquid Cooler',
    category: 'Cooling',
    price: 42000,
    originalPrice: 49000,
    rating: 4.5,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1555617781-8016d47b1af2?auto=format&fit=crop&q=80&w=600',
    discount: 14,
    status: 'In Stock'
  },
  {
    id: '8',
    name: 'ASUS ROG Zephyrus G14 (2024) Gaming Laptop',
    category: 'Laptops',
    price: 650000,
    rating: 4.9,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600',
    isNew: true,
    status: 'In Stock'
  },
  {
    id: '9',
    name: 'Lenovo Legion Pro 7i Gen 8 Intel Core i9',
    category: 'Laptops',
    price: 720000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
    status: 'In Stock'
  },
  {
    id: '10',
    name: 'MSI Stealth 16 Studio A13V 16" QHD+',
    category: 'Laptops',
    price: 580000,
    originalPrice: 620000,
    discount: 6,
    rating: 4.7,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1593642702821-c823b2816291?auto=format&fit=crop&q=80&w=600',
    status: 'In Stock'
  },
  {
    id: '11',
    name: 'Razer Blade 15 (2023) QHD 240Hz RTX 4070',
    category: 'Laptops',
    price: 850000,
    rating: 4.9,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
    status: 'In Stock'
  },
];

export const formatLKR = (amount: number) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
