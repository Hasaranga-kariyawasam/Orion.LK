import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import Product from '@/models/Product';

export const BRAND_NEW_CATEGORIES = [
  { name: 'Adapters', count: 30, img: 'https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=300' },
  { name: 'Cables & Connectors', count: 52, img: 'https://images.unsplash.com/photo-1620803444081-9bba14d33eb4?auto=format&fit=crop&q=80&w=300' },
  { name: 'Computer Casings', count: 45, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=300' },
  { name: 'Coolers', count: 30, img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=300' },
  { name: 'Cooling Pads', count: 10, img: 'https://images.unsplash.com/photo-1621644788390-e43890f84577?auto=format&fit=crop&q=80&w=300' },
  { name: 'Fan Kits', count: 9, img: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=300' },
  { name: 'Gaming Chairs', count: 9, img: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=300' },
  { name: 'Gaming Controllers', count: 11, img: 'https://images.unsplash.com/photo-1600000293145-c44d15664db1?auto=format&fit=crop&q=80&w=300' },
  { name: 'Graphics Cards', count: 14, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=300' },
  { name: 'HDD', count: 12, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=300' },
  { name: 'Headset Stand', count: 8, img: 'https://images.unsplash.com/photo-1605648839506-69fc873b43db?auto=format&fit=crop&q=80&w=300' },
  { name: 'Headsets', count: 34, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300' },
  { name: 'Keyboards', count: 41, img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=300' },
  { name: 'Laptops', count: 32, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=300' },
  { name: 'Microphones', count: 11, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=300' },
  { name: 'Monitors', count: 44, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=300' },
  { name: 'Motherboards', count: 23, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300' },
  { name: 'Mouse', count: 56, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=300' },
  { name: 'Mouse Pads', count: 19, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=300' },
  { name: 'NVMe', count: 21, img: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=300' },
  { name: 'Pen Drive', count: 17, img: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&q=80&w=300' },
  { name: 'Power Supply Units', count: 21, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=300' },
  { name: 'Processors', count: 21, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=300' },
  { name: 'RAM', count: 20, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=300' },
  { name: 'SATA SSD', count: 15, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=300' },
  { name: 'Speakers', count: 13, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=300' },
  { name: 'Storage Devices', count: 45, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=300' },
  { name: 'UPS', count: 7, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=300' },
  { name: 'Webcam', count: 9, img: 'https://images.unsplash.com/photo-1595787142842-7404bc60470d?auto=format&fit=crop&q=80&w=300' }
];

export const USED_CATEGORIES = [
  { name: 'Other Used Items', count: 5, img: 'https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Power Supply', count: 8, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Monitors', count: 12, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used RAM', count: 14, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Processors', count: 11, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Storage Devices', count: 15, img: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Motherboards', count: 16, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300' },
  { name: 'Used Graphics Cards', count: 28, img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=300' }
];

export const INITIAL_BRANDS = [
  { name: 'ASUS ROG', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/ROG_Logo.svg', banner: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1200', visible: true },
  { name: 'MSI', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/MSI_logo.svg', visible: true },
  { name: 'Gigabyte', image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Gigabyte_Technology_logo.svg', visible: true },
  { name: 'Corsair', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Corsair_Logo.svg', visible: true },
  { name: 'Razer', image: 'https://upload.wikimedia.org/wikipedia/en/4/40/Razer_snake_logo.svg', visible: true },
  { name: 'Logitech', image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg', visible: true },
  { name: 'Apple', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', visible: true },
  { name: 'Samsung', image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', visible: true },
  { name: 'Haylou', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/PlaceholderLC.png/120px-PlaceholderLC.png', visible: true },
  { name: 'Intel', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg', visible: true },
  { name: 'AMD', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg', visible: true },
  { name: 'Kingston', image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Kingston_Technology_logo.svg', visible: true },
  { name: 'Western Digital', image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Western_Digital_Logo.svg', visible: true },
  { name: 'Lian Li', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/PlaceholderLC.png/120px-PlaceholderLC.png', visible: true }
];

export const INITIAL_PRODUCTS = [
  // 1. Graphics Cards
  {
    name: 'ASUS ROG Strix GeForce RTX 4090 OC Edition 24GB',
    category: 'Graphics Cards',
    price: 850000,
    originalPrice: 890000,
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 4,
    status: 'In Stock',
    shortDescription: 'Ultimate 24GB flagship Ada Lovelace GPU with Axial-tech fans.',
    description: 'NVIDIA Ada Lovelace architecture with 4th Gen Tensor Cores and 3rd Gen RT Cores.',
    sku: 'ROG-STRIX-RTX4090-O24G',
    brand: 'ASUS ROG',
    stock: 8,
    warranty: '36 Months',
    specifications: { 'Memory': '24GB GDDR6X', 'Clock': '2640 MHz', 'Bus': 'PCIe 4.0', 'CUDA Cores': '16384' }
  },
  {
    name: 'MSI GeForce RTX 4070 Ti SUPER 16G GAMING X SLIM',
    category: 'Graphics Cards',
    price: 365000,
    originalPrice: 385000,
    rating: 4.8,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 5,
    status: 'In Stock',
    shortDescription: 'TRI FROZR 3 thermal design, TORX Fan 5.0, 16GB GDDR6X.',
    description: 'Perfect 1440p and 4K gaming card with high frame rates and DLSS 3 support.',
    sku: 'MSI-RTX4070TIS-16G',
    brand: 'MSI',
    stock: 14,
    warranty: '36 Months',
    specifications: { 'Memory': '16GB GDDR6X', 'Boost Clock': '2685 MHz', 'Memory Bus': '256-bit' }
  },
  {
    name: 'Gigabyte GeForce RTX 4060 WINDFORCE OC 8G',
    category: 'Graphics Cards',
    price: 135000,
    originalPrice: 145000,
    rating: 4.7,
    reviews: 88,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 7,
    status: 'In Stock',
    shortDescription: 'WINDFORCE cooling system, Alternate spinning, Protection backplate.',
    description: 'High efficiency 1080p esports and AAA powerhouse card.',
    sku: 'GV-N4060WF2OC-8GD',
    brand: 'Gigabyte',
    stock: 25,
    warranty: '36 Months',
    specifications: { 'Memory': '8GB GDDR6', 'Clock': '2475 MHz', 'Interface': '128-bit' }
  },

  // 2. Processors
  {
    name: 'AMD Ryzen 9 7950X3D Desktop Processor',
    category: 'Processors',
    price: 245000,
    originalPrice: 260000,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 6,
    status: 'In Stock',
    shortDescription: '16 Cores, 32 Threads, 144MB Cache with 3D V-Cache Technology.',
    description: 'The definitive gaming processor with uncompromised content creation prowess.',
    sku: 'AMD-R9-7950X3D',
    brand: 'AMD',
    stock: 12,
    warranty: '36 Months',
    specifications: { 'Cores': '16', 'Threads': '32', 'Boost Clock': '5.7 GHz', 'Socket': 'AM5' }
  },
  {
    name: 'AMD Ryzen 7 7800X3D 8-Core Gaming CPU',
    category: 'Processors',
    price: 165000,
    originalPrice: 175000,
    rating: 5.0,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 6,
    status: 'In Stock',
    shortDescription: 'World best gaming processor with 96MB 3D V-Cache.',
    description: 'Incredible frame rates and power efficiency on the AM5 platform.',
    sku: 'AMD-R7-7800X3D',
    brand: 'AMD',
    stock: 20,
    warranty: '36 Months',
    specifications: { 'Cores': '8', 'Threads': '16', 'Max Boost': '5.0 GHz', 'Socket': 'AM5' }
  },
  {
    name: 'Intel Core i7-14700K 20-Core Processor',
    category: 'Processors',
    price: 155000,
    originalPrice: 168000,
    rating: 4.8,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 8,
    status: 'In Stock',
    shortDescription: '20 Cores (8P + 12E), up to 5.6 GHz, LGA1700 Socket.',
    description: 'Raptor Lake Refresh powerhouse for intense multitasking and AAA gaming.',
    sku: 'BX8071514700K',
    brand: 'Intel',
    stock: 18,
    warranty: '36 Months',
    specifications: { 'Total Cores': '20', 'Total Threads': '28', 'Max Turbo': '5.6 GHz', 'Socket': 'LGA1700' }
  },

  // 3. Motherboards
  {
    name: 'ASUS ROG MAXIMUS Z790 DARK HERO',
    category: 'Motherboards',
    price: 265000,
    originalPrice: 280000,
    rating: 4.9,
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 5,
    status: 'In Stock',
    shortDescription: 'Intel Z790 chipset, 20+1 power stages, PCIe 5.0, WiFi 7.',
    description: 'Flagship enthusiast motherboard built for extreme overclocking and stability.',
    sku: 'ROG-MAX-Z790-DH',
    brand: 'ASUS ROG',
    stock: 6,
    warranty: '36 Months',
    specifications: { 'Form Factor': 'ATX', 'Socket': 'LGA1700', 'Memory': 'DDR5 up to 8000MHz' }
  },
  {
    name: 'MSI MAG B650 TOMAHAWK WIFI AM5 Motherboard',
    category: 'Motherboards',
    price: 88000,
    originalPrice: 95000,
    rating: 4.8,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 7,
    status: 'In Stock',
    shortDescription: 'AM5 Socket, DDR5, PCIe 4.0, 2.5G LAN, WiFi 6E.',
    description: 'The golden standard AM5 motherboard for AMD Ryzen 7000 and 9000 CPUs.',
    sku: 'MSI-MAG-B650-TOMA',
    brand: 'MSI',
    stock: 22,
    warranty: '36 Months',
    specifications: { 'Socket': 'AM5', 'RAM Support': 'DDR5 6400+ (OC)', 'Form': 'ATX' }
  },

  // 4. RAM
  {
    name: 'Corsair Vengeance RGB 64GB (2x32GB) DDR5 6000MHz',
    category: 'RAM',
    price: 85000,
    originalPrice: 95000,
    rating: 4.7,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 11,
    status: 'In Stock',
    shortDescription: 'High frequency DDR5 memory with ten-zone RGB lighting.',
    description: 'Optimized for Intel and AMD motherboards with custom XMP 3.0 profiles.',
    sku: 'CMH64GX5M2B6000C30',
    brand: 'Corsair',
    stock: 15,
    warranty: 'Lifetime',
    specifications: { 'Speed': '6000 MHz', 'Latency': 'CL30', 'Capacity': '64GB (2x32GB)' }
  },
  {
    name: 'Kingston FURY Beast RGB 32GB (2x16GB) DDR5 5600MHz',
    category: 'RAM',
    price: 46000,
    originalPrice: 52000,
    rating: 4.8,
    reviews: 72,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 12,
    status: 'In Stock',
    shortDescription: 'Plug N Play automatic overclocking with patented Infrared Sync.',
    description: 'High reliability Kingston gaming RAM.',
    sku: 'KF556C40BBAK2-32',
    brand: 'Kingston',
    stock: 30,
    warranty: 'Lifetime',
    specifications: { 'Speed': '5600 MHz', 'Capacity': '32GB (2x16GB)', 'Type': 'DDR5' }
  },

  // 5. NVMe / Storage
  {
    name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD',
    category: 'NVMe',
    price: 68000,
    originalPrice: 75000,
    rating: 4.9,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 9,
    status: 'In Stock',
    shortDescription: 'Blistering sequential read/write speeds up to 7,450 / 6,900 MB/s.',
    description: 'Top-tier NVMe SSD for high-end gaming and 4K/8K video rendering.',
    sku: 'MZ-V9P2T0B/AM',
    brand: 'Samsung',
    stock: 25,
    warranty: '60 Months',
    specifications: { 'Capacity': '2TB', 'Read': '7450 MB/s', 'Write': '6900 MB/s', 'Interface': 'PCIe Gen 4' }
  },
  {
    name: 'Kingston NV2 1TB PCIe 4.0 NVMe M.2 SSD',
    category: 'NVMe',
    price: 24000,
    originalPrice: 28000,
    rating: 4.6,
    reviews: 310,
    image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 14,
    status: 'In Stock',
    shortDescription: 'Affordable Gen 4x4 NVMe speed for modern desktops & laptops.',
    description: 'Speeds up to 3,500 MB/s read and 2,100 MB/s write.',
    sku: 'SNV2S/1000G',
    brand: 'Kingston',
    stock: 45,
    warranty: '36 Months',
    specifications: { 'Capacity': '1TB', 'Read': '3500 MB/s', 'Form': 'M.2 2280' }
  },
  {
    name: 'Seagate Barracuda 2TB 3.5" Internal HDD',
    category: 'HDD',
    price: 22000,
    originalPrice: 25000,
    rating: 4.5,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 12,
    status: 'In Stock',
    shortDescription: '7200 RPM 256MB Cache SATA 6Gb/s mass desktop storage.',
    description: 'Reliable mass storage drive for games, archives, and backups.',
    sku: 'ST2000DM008',
    brand: 'Western Digital',
    stock: 20,
    warranty: '24 Months',
    specifications: { 'Capacity': '2TB', 'RPM': '7200 RPM', 'Interface': 'SATA 6Gb/s' }
  },
  {
    name: 'Samsung 870 EVO 500GB 2.5" SATA SSD',
    category: 'SATA SSD',
    price: 18500,
    originalPrice: 21000,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 11,
    status: 'In Stock',
    shortDescription: 'Industry standard SATA SSD with 560MB/s sequential read.',
    description: 'Perfect upgrade for older laptops and secondary desktop drives.',
    sku: 'MZ-77E500B/AM',
    brand: 'Samsung',
    stock: 30,
    warranty: '60 Months',
    specifications: { 'Form': '2.5 inch', 'Speed': '560 MB/s', 'Capacity': '500GB' }
  },

  // 6. Laptops
  {
    name: 'ASUS ROG Zephyrus G14 (2024) Gaming Laptop',
    category: 'Laptops',
    price: 650000,
    originalPrice: 690000,
    rating: 4.9,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 5,
    status: 'In Stock',
    shortDescription: 'AMD Ryzen 9 8945HS, RTX 4070 8GB, 3K 120Hz OLED, 32GB LPDDR5X.',
    description: 'CNC aluminum unibody premium ultraportable gaming machine.',
    sku: 'GA403UI-QS025W',
    brand: 'ASUS ROG',
    stock: 5,
    warranty: '24 Months',
    specifications: { 'Display': '14" 3K OLED 120Hz', 'CPU': 'Ryzen 9 8945HS', 'GPU': 'RTX 4070 8GB', 'RAM': '32GB' }
  },
  {
    name: 'Lenovo Legion Pro 7i Gen 8 Intel Core i9',
    category: 'Laptops',
    price: 720000,
    originalPrice: 760000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 5,
    status: 'In Stock',
    shortDescription: 'i9-13900HX, RTX 4080 12GB, 16" WQXGA 240Hz, 32GB RAM, 1TB SSD.',
    description: 'Coldfront 5.0 cooling with vapor chamber and AI tuning.',
    sku: '82WQ002RUS',
    brand: 'Lenovo',
    stock: 4,
    warranty: '24 Months',
    specifications: { 'Display': '16" 240Hz 500 nits', 'CPU': 'Core i9-13900HX', 'GPU': 'RTX 4080 12GB' }
  },
  {
    name: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'Laptops',
    price: 1150000,
    originalPrice: 1200000,
    rating: 5.0,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 4,
    status: 'In Stock',
    shortDescription: 'Liquid Retina XDR display, Space Black, M3 Max chip with 14-core CPU.',
    description: 'Industry-leading battery life and computational power for creative professionals.',
    sku: 'MUW63LL/A',
    brand: 'Apple',
    stock: 6,
    warranty: '12 Months',
    specifications: { 'Chip': 'Apple M3 Max', 'Memory': '36GB Unified', 'Storage': '1TB SSD', 'Screen': '16.2" Liquid Retina XDR' }
  },

  // 7. Monitors
  {
    name: 'ASUS ROG Swift OLED PG27AQDM 27" 240Hz',
    category: 'Monitors',
    price: 345000,
    originalPrice: 370000,
    rating: 4.9,
    reviews: 48,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 7,
    status: 'In Stock',
    shortDescription: '1440p QHD OLED, 0.03ms response time, 240Hz refresh, custom heatsink.',
    description: 'Elite competitive esports gaming monitor with true 10-bit color and deep blacks.',
    sku: 'PG27AQDM',
    brand: 'ASUS ROG',
    stock: 7,
    warranty: '36 Months',
    specifications: { 'Resolution': '2560 x 1440', 'Refresh Rate': '240Hz', 'Panel': 'OLED', 'Response': '0.03ms' }
  },
  {
    name: 'Samsung Odyssey G7 28" 4K UHD 144Hz IPS',
    category: 'Monitors',
    price: 215000,
    originalPrice: 235000,
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 8,
    status: 'In Stock',
    shortDescription: '4K 144Hz, 1ms, HDR400, G-Sync compatible, HDMI 2.1.',
    description: 'Superb UHD gaming screen ideal for both PC and PS5 / Xbox Series X.',
    sku: 'LS28BG700EPXXU',
    brand: 'Samsung',
    stock: 10,
    warranty: '36 Months',
    specifications: { 'Size': '28 Inch', 'Resolution': '3840 x 2160', 'Refresh': '144Hz', 'Panel': 'IPS' }
  },

  // 8. Keyboards & Mouse
  {
    name: 'Keychron Q1 Pro Custom Wireless Mechanical Keyboard',
    category: 'Keyboards',
    price: 72000,
    originalPrice: 78000,
    rating: 4.8,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 8,
    status: 'In Stock',
    shortDescription: 'Full aluminum body, QMK/VIA programmable, hot-swappable switches.',
    description: 'Premium gasket-mounted mechanical typing experience with Bluetooth 5.1.',
    sku: 'KEYCHRON-Q1-PRO',
    brand: 'Keychron',
    stock: 16,
    warranty: '12 Months',
    specifications: { 'Switches': 'Gateron Jupiter Red', 'Connectivity': 'Wireless / Type-C', 'Layout': '75%' }
  },
  {
    name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
    category: 'Mouse',
    price: 48000,
    originalPrice: 55000,
    rating: 4.8,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 13,
    status: 'In Stock',
    shortDescription: '63g ultra-lightweight design, Focus Pro 30K Optical Sensor.',
    description: 'Ergonomic esports mouse trusted by top professional gamers worldwide.',
    sku: 'RZ01-04630100',
    brand: 'Razer',
    stock: 22,
    warranty: '24 Months',
    specifications: { 'Weight': '63 grams', 'Sensor': '30,000 DPI', 'Battery': 'Up to 90 hrs' }
  },
  {
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    category: 'Mouse',
    price: 52000,
    originalPrice: 58000,
    rating: 4.9,
    reviews: 135,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 10,
    status: 'In Stock',
    shortDescription: 'HERO 2 sensor with 32,000 DPI, LIGHTFORCE hybrid switches, 60g.',
    description: 'The premier FPS gaming mouse with 2000Hz polling rate and USB-C.',
    sku: 'LOGI-GPX2-BLK',
    brand: 'Logitech',
    stock: 19,
    warranty: '24 Months',
    specifications: { 'Weight': '60g', 'Polling Rate': '2000Hz', 'Sensor': 'HERO 2' }
  },

  // 9. Coolers & Fan Kits & Casings
  {
    name: 'MSI MAG CoreLiquid 360R V2 AIO Liquid Cooler',
    category: 'Coolers',
    price: 42000,
    originalPrice: 49000,
    rating: 4.5,
    reviews: 34,
    image: 'https://images.unsplash.com/photo-1555617781-8016d47b1af2?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1555617781-8016d47b1af2?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 14,
    status: 'In Stock',
    shortDescription: '360mm radiator, ARGB fans, rotatable blockhead, LGA1700/AM5 support.',
    description: 'High-performance liquid cooling to sustain max turbo frequencies.',
    sku: 'MAG-CORELIQUID-360R-V2',
    brand: 'MSI',
    stock: 15,
    warranty: '36 Months',
    specifications: { 'Radiator': '360mm', 'Fans': '3x 120mm ARGB', 'Sockets': 'AM5, AM4, LGA1700' }
  },
  {
    name: 'Lian Li O11 Dynamic EVO RGB Mid Tower Case',
    category: 'Computer Casings',
    price: 68000,
    originalPrice: 75000,
    rating: 4.9,
    reviews: 62,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 9,
    status: 'In Stock',
    shortDescription: 'Dual-chamber showpiece chassis with removable front pillar.',
    description: 'Top-tier airflow and radiator mounting flexibility in premium aluminum.',
    sku: 'O11D-EVO-RGB-BLK',
    brand: 'Lian Li',
    stock: 11,
    warranty: '12 Months',
    specifications: { 'Dimensions': '478 x 290 x 471 mm', 'Motherboard': 'E-ATX, ATX, Micro-ATX' }
  },
  {
    name: 'Corsair RM850x 850W 80 PLUS Gold Modular PSU',
    category: 'Power Supply Units',
    price: 54000,
    originalPrice: 59000,
    rating: 4.9,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 8,
    status: 'In Stock',
    shortDescription: 'Fully modular, 135mm magnetic levitation fan, Zero RPM mode.',
    description: 'Rock-solid power delivery with 100% Japanese 105C capacitors.',
    sku: 'CP-9020200-NA',
    brand: 'Corsair',
    stock: 20,
    warranty: '120 Months',
    specifications: { 'Wattage': '850W', 'Efficiency': '80 PLUS Gold', 'Modularity': 'Fully Modular' }
  },

  // 10. Headsets & Audio & Webcams
  {
    name: 'Razer BlackShark V2 Pro (2023) Wireless Headset',
    category: 'Headsets',
    price: 64000,
    originalPrice: 72000,
    rating: 4.8,
    reviews: 58,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 11,
    status: 'In Stock',
    shortDescription: 'HyperClear Super Wideband Mic, TriForce Titanium 50mm Drivers.',
    description: 'Pro audio tuned for competitive FPS esports.',
    sku: 'RZ04-04530100',
    brand: 'Razer',
    stock: 18,
    warranty: '24 Months',
    specifications: { 'Battery': 'Up to 70 hrs', 'Connection': '2.4GHz + Bluetooth', 'Weight': '320g' }
  },
  {
    name: 'Logitech C922 Pro Stream 1080p Webcam',
    category: 'Webcam',
    price: 29000,
    originalPrice: 34000,
    rating: 4.6,
    reviews: 80,
    image: 'https://images.unsplash.com/photo-1595787142842-7404bc60470d?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1595787142842-7404bc60470d?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 15,
    status: 'In Stock',
    shortDescription: 'Full 1080p at 30fps or 720p at 60fps streaming camera with tripod.',
    description: 'Automatic light correction and stereo microphones for creators.',
    sku: 'LOGI-C922-PRO',
    brand: 'Logitech',
    stock: 25,
    warranty: '12 Months',
    specifications: { 'Resolution': '1080p/30fps, 720p/60fps', 'Focus': 'Autofocus', 'FOV': '78 degrees' }
  },
  {
    name: 'Logitech G PRO X 2 LIGHTSPEED Wireless Gaming Headset',
    category: 'Headsets',
    price: 88000,
    originalPrice: 98000,
    rating: 4.9,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: true,
    discount: 10,
    status: 'In Stock',
    shortDescription: '50mm Graphene drivers, LIGHTSPEED wireless, Bluetooth, 50-hour battery.',
    description: 'Designed in collaboration with championship esports pros.',
    sku: 'LOGI-PROX2-WL',
    brand: 'Logitech',
    stock: 14,
    warranty: '24 Months',
    specifications: { 'Driver': '50mm Graphene', 'Battery': '50 Hours', 'Weight': '345g' }
  },

  // 11. Used / Pre-Owned Items
  {
    name: 'Used ASUS TUF Gaming GeForce RTX 3080 10GB OC',
    category: 'Used Graphics Cards',
    price: 185000,
    originalPrice: 220000,
    rating: 4.8,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: false,
    discount: 16,
    status: 'In Stock',
    shortDescription: 'Tested & bench-marked GPU in immaculate condition with original box.',
    description: 'FurMark and 3DMark stability tested. Cleaned and repasted.',
    sku: 'USED-RTX3080-TUF',
    brand: 'ASUS ROG',
    stock: 3,
    warranty: '6 Months',
    specifications: { 'Memory': '10GB GDDR6X', 'Condition': '9/10 Like New', 'Burn-in Temp': '67°C Max' }
  },
  {
    name: 'Used AMD Ryzen 7 5800X 8-Core Desktop CPU',
    category: 'Used Processors',
    price: 62000,
    originalPrice: 75000,
    rating: 4.7,
    reviews: 26,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: false,
    discount: 17,
    status: 'In Stock',
    shortDescription: 'AM4 8-Core 16-Thread processor in pristine working order.',
    description: 'Carefully checked for straight pins, bench tested for 24h stress test.',
    sku: 'USED-R7-5800X',
    brand: 'AMD',
    stock: 5,
    warranty: '6 Months',
    specifications: { 'Cores': '8', 'Threads': '16', 'Socket': 'AM4', 'Condition': 'Grade A' }
  },
  {
    name: 'Used MSI B550 GAMING PLUS Motherboard',
    category: 'Used Motherboards',
    price: 36000,
    originalPrice: 45000,
    rating: 4.6,
    reviews: 14,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: false,
    discount: 20,
    status: 'In Stock',
    shortDescription: 'ATX AM4 motherboard with updated latest BIOS, includes IO shield.',
    description: 'Fully functional, tested with Ryzen 5000 series.',
    sku: 'USED-MSI-B550-GP',
    brand: 'MSI',
    stock: 4,
    warranty: '6 Months',
    specifications: { 'Socket': 'AM4', 'RAM': 'DDR4 up to 4400MHz', 'Condition': 'Grade A' }
  },
  {
    name: 'Used Corsair Corsair RM750 750W Gold Power Supply',
    category: 'Used Power Supply',
    price: 28000,
    originalPrice: 38000,
    rating: 4.8,
    reviews: 11,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: false,
    discount: 26,
    status: 'In Stock',
    shortDescription: '80 PLUS Gold certified fully modular PSU with all original cables.',
    description: 'Voltage ripple tested under full load.',
    sku: 'USED-COR-RM750',
    brand: 'Corsair',
    stock: 6,
    warranty: '6 Months',
    specifications: { 'Wattage': '750W', 'Efficiency': 'Gold', 'Condition': 'Grade A' }
  },
  {
    name: 'Used Corsair Vengeance RGB PRO 16GB (2x8GB) DDR4 3200MHz',
    category: 'Used RAM',
    price: 16500,
    originalPrice: 22000,
    rating: 4.8,
    reviews: 35,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600',
    images: ['https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&q=80&w=600'],
    isNewProduct: false,
    discount: 25,
    status: 'In Stock',
    shortDescription: 'MemTest86 passed 0 errors. Vibrant dynamic multi-zone RGB.',
    description: 'Authentic Corsair DDR4 memory kit.',
    sku: 'USED-COR-16GB-3200',
    brand: 'Corsair',
    stock: 9,
    warranty: '6 Months',
    specifications: { 'Type': 'DDR4', 'Speed': '3200 MHz', 'Capacity': '16GB' }
  }
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    // 1. Seed Categories
    const existingCatCount = await Category.countDocuments();
    let seededCategories = 0;
    if (existingCatCount === 0 || force) {
      if (force) await Category.deleteMany({});
      
      const allCats = [
        ...BRAND_NEW_CATEGORIES.map(c => ({
          name: c.name,
          slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          type: 'brand-new',
          count: c.count,
          img: c.img,
        })),
        ...USED_CATEGORIES.map(c => ({
          name: c.name,
          slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          type: 'used',
          count: c.count,
          img: c.img,
        })),
      ];

      await Category.insertMany(allCats);
      seededCategories = allCats.length;
    }

    // 2. Seed Brands
    const existingBrandCount = await Brand.countDocuments();
    let seededBrands = 0;
    if (existingBrandCount === 0 || force) {
      if (force) await Brand.deleteMany({});
      await Brand.insertMany(INITIAL_BRANDS);
      seededBrands = INITIAL_BRANDS.length;
    }

    // 3. Seed Products
    const existingProductCount = await Product.countDocuments();
    let seededProducts = 0;
    if (existingProductCount === 0 || force) {
      if (force) await Product.deleteMany({});

      // Expand to ensure EVERY single category has multiple realistic items (100+ products)
      const expandedProducts: any[] = [...INITIAL_PRODUCTS];
      const allCategoryList = [...BRAND_NEW_CATEGORIES, ...USED_CATEGORIES];

      // Add variations per category so total count exceeds 100 items
      allCategoryList.forEach((cat, idx) => {
        const isUsed = cat.name.toLowerCase().includes('used');
        const itemCount = isUsed ? 2 : 3;
        for (let i = 1; i <= itemCount; i++) {
          const brandName = INITIAL_BRANDS[(idx * 3 + i) % INITIAL_BRANDS.length].name;
          expandedProducts.push({
            name: `${brandName} ${cat.name.replace(/Used /g, '')} ${i === 1 ? 'Ultra' : i === 2 ? 'Elite OC' : 'Max Pro'} Edition`,
            category: cat.name,
            price: Math.floor((Math.random() * 50 + 10) * 1000),
            originalPrice: Math.floor((Math.random() * 60 + 65) * 1000),
            rating: parseFloat((4.4 + Math.random() * 0.6).toFixed(1)),
            reviews: Math.floor(Math.random() * 80 + 12),
            image: cat.img,
            images: [cat.img],
            isNewProduct: !isUsed,
            discount: Math.floor(Math.random() * 15 + 5),
            status: 'In Stock',
            shortDescription: `Original genuine ${cat.name} by ${brandName} with official warranty.`,
            description: `Experience premier performance with the genuine ${cat.name} from ${brandName}. Fully tested, guaranteed authentic, and backed by Orion LK support.`,
            sku: `ORK-${cat.name.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase()}-${idx * 10 + i}`,
            brand: brandName,
            stock: Math.floor(Math.random() * 20 + 5),
            warranty: isUsed ? '6 Months' : '24 Months',
            specifications: {
              'Brand': brandName,
              'Category': cat.name,
              'Type': isUsed ? 'Certified Pre-Owned' : 'Brand New Boxed',
              'Warranty': isUsed ? '6 Months Orion LK Warranty' : '2 Years Official Warranty',
              'Condition': isUsed ? 'Grade A Tested' : 'Brand New Factory Sealed'
            }
          });
        }
      });

      await Product.insertMany(expandedProducts);
      seededProducts = expandedProducts.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      seededCategories,
      seededBrands,
      seededProducts,
      totalCategories: await Category.countDocuments(),
      totalBrands: await Brand.countDocuments(),
      totalProducts: await Product.countDocuments(),
    });
  } catch (err: any) {
    console.error('[POST /api/seed]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
