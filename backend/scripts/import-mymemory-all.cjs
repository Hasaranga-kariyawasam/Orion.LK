const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://hasskariyawasam_db_user:pBmRHWrYBURBaVAd@ac-8s9c95e-shard-00-00.2mqazu9.mongodb.net:27017,ac-8s9c95e-shard-00-01.2mqazu9.mongodb.net:27017,ac-8s9c95e-shard-00-02.2mqazu9.mongodb.net:27017/orionlk?ssl=true&authSource=admin&appName=Cluster0';

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractBrand(product) {
  const brands = [
    'WiWU', 'UGREEN', 'SanDisk', 'Xiaomi', 'Kieslect', 'JBL', 'Haylou', 'DJI',
    'CMF', 'Baseus', 'ASPOR', 'Anker', 'Soundcore', 'Plokama', 'Samsung', 'Apple',
    'Sony', 'Huawei', 'Redmi', 'Amazfit', 'Realme', 'Remax', 'Havit', 'A4Tech',
    'Logitech', 'Razer', 'Boya', 'Saramonic', 'Godox', 'Ulanzi', 'K&F Concept'
  ];

  for (const b of brands) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(product.name)) return b;
  }

  // Check attributes
  if (Array.isArray(product.attributes)) {
    const brandAttr = product.attributes.find(a => /brand|manufacturer/i.test(a.name));
    if (brandAttr && brandAttr.terms && brandAttr.terms[0]) {
      return brandAttr.terms[0].name;
    }
  }

  return product.name.split(/\s+/)[0] || 'Orion';
}

function cleanHtmlText(text = '') {
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    isNewProduct: { type: Boolean, default: false },
    discount: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Delivered', 'In Stock', 'Out of Stock', 'Sold Out'],
      default: 'In Stock',
    },
    shortDescription: { type: String },
    description: { type: String },
    sku: { type: String, unique: true, sparse: true },
    brand: { type: String },
    tags: [{ type: String }],
    hashtags: [{ type: String }],
    specifications: { type: Map, of: String },
    stock: { type: Number, default: 15 },
    warranty: { type: String, default: '6 Months' },
    colors: [{ type: String }],
    descriptionShipping: { type: String },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    img: { type: String, default: '' },
    count: { type: Number, default: 0 },
    group: { type: String, enum: ['components', 'accessories', 'other'], default: 'accessories' },
    type: { type: String, default: 'new' },
    parentId: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  let page = 1;
  let totalImported = 0;
  const categoryCounts = new Map();
  const categoryImages = new Map();

  while (true) {
    console.log(`Fetching page ${page} from mymemorylk.com...`);
    const url = `https://mymemorylk.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    
    if (!res.ok) {
      console.log(`Page ${page} returned status ${res.status}. Ending fetch.`);
      break;
    }

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      console.log('No more items returned. Finishing loop.');
      break;
    }

    console.log(`Processing ${items.length} products on page ${page}...`);

    for (const item of items) {
      const name = cleanHtmlText(item.name || '').trim();
      if (!name) continue;

      const rawPrice = Number(item.prices?.price || 0) / 100;
      const rawRegular = Number(item.prices?.regular_price || 0) / 100;
      const price = rawPrice > 0 ? rawPrice : rawRegular;
      const originalPrice = rawRegular > price ? rawRegular : (price > 0 ? Math.round(price * 1.15) : 0);
      const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      // Extract images
      const images = (item.images || []).map(img => img.src).filter(Boolean);
      const mainImage = images[0] || 'https://mymemorylk.com/wp-content/uploads/2025/10/Creator-Zone-448x1024.webp';

      // Category extraction
      const catObj = (item.categories || [])[0] || { name: 'Accessories', slug: 'accessories' };
      const catName = cleanHtmlText(catObj.name);
      const catSlug = slugify(catName);

      categoryCounts.set(catName, (categoryCounts.get(catName) || 0) + 1);
      if (!categoryImages.has(catName) && mainImage) {
        categoryImages.set(catName, mainImage);
      }

      // Brand
      const brand = extractBrand(item);

      // Clean descriptions
      const cleanShort = cleanHtmlText(stripHtml(item.short_description || ''));
      const cleanDesc = cleanHtmlText(item.description || item.short_description || '');

      // Specifications Map
      const specs = new Map();
      specs.set('Brand', brand);
      specs.set('Category', catName);
      if (item.attributes && Array.isArray(item.attributes)) {
        for (const attr of item.attributes) {
          if (attr.name && attr.terms && attr.terms[0]) {
            specs.set(cleanHtmlText(attr.name), cleanHtmlText(attr.terms.map(t => t.name).join(', ')));
          }
        }
      }

      const warrantyAttr = (item.attributes || []).find(a => /warranty/i.test(a.name));
      const warranty = warrantyAttr?.terms?.[0]?.name ? cleanHtmlText(warrantyAttr.terms[0].name) : '6 Months Warranty';

      const sku = `MM-${item.id}`;

      await Product.findOneAndUpdate(
        { sku },
        {
          name,
          category: catName,
          price,
          originalPrice,
          discount,
          rating: 4.8 + Math.round(Math.random() * 2) / 10,
          reviews: Math.floor(Math.random() * 30) + 5,
          image: mainImage,
          images: images.length > 0 ? images : [mainImage],
          isNewProduct: item.is_on_sale || false,
          status: 'In Stock',
          shortDescription: cleanShort || name,
          description: cleanDesc || cleanShort || name,
          sku,
          brand,
          tags: [catName, brand, 'Accessories', 'Gadgets'],
          hashtags: [`#${slugify(brand)}`, `#${catSlug}`],
          specifications: specs,
          stock: 25,
          warranty,
        },
        { upsert: true, new: true }
      );

      totalImported++;
    }

    page++;
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`Successfully upserted ${totalImported} products from MyMemory.lk!`);

  console.log('Now updating/inserting categories into MongoDB...');
  for (const [name, count] of categoryCounts.entries()) {
    const slug = slugify(name);
    const img = categoryImages.get(name) || '';

    await Category.findOneAndUpdate(
      { slug },
      {
        name,
        slug,
        img,
        count,
        group: 'accessories',
        type: 'new',
        displayOrder: 20
      },
      { upsert: true }
    );
  }

  console.log(`Categories updated. Total categories: ${categoryCounts.size}`);
  await mongoose.disconnect();
  console.log('MongoDB disconnected. Ingestion complete!');
}

main().catch(err => {
  console.error('Error running import:', err);
  process.exit(1);
});
