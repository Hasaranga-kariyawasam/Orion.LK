const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://hasskariyawasam_db_user:pBmRHWrYBURBaVAd@ac-8s9c95e-shard-00-00.2mqazu9.mongodb.net:27017,ac-8s9c95e-shard-00-01.2mqazu9.mongodb.net:27017,ac-8s9c95e-shard-00-02.2mqazu9.mongodb.net:27017/orionlk?ssl=true&authSource=admin&appName=Cluster0';

const COMPONENT_CATEGORIES = new Set([
  'processors', 'processor',
  'motherboards', 'motherboard',
  'ram', 'desktop ram',
  'graphics cards', 'graphic card', 'graphics-cards',
  'computer casings', 'casing', 'computer-casings',
  'power supply units', 'power supply', 'power-supply-units',
  'coolers', 'cooler', 'liquid cooler', 'air cooler',
  'storage devices', 'storage', 'nvme', 'ssd', 'hdd', 'sata ssd',
  'fans', 'fan kits',
  'thermal paste & grease', 'thermal',
  'vga stands', 'gpu stand'
]);

const USED_PATTERNS = /used|pre-owned|pre owned|second hand/i;

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractBrand(product) {
  const attribute = (product.attributes || []).find(item => /brand|manufacturer/i.test(item.name));
  if (attribute?.terms?.[0]?.name) return attribute.terms[0].name;

  const brands = [
    'ASUS', 'MSI', 'Gigabyte', 'Acer', 'Dell', 'HP', 'Lenovo', 'Apple', 'Intel', 'AMD',
    'NVIDIA', 'Kingston', 'Corsair', 'G.Skill', 'Samsung', 'Western Digital', 'WD',
    'Seagate', 'Crucial', 'Redragon', 'Havit', 'Jedel', 'Logitech', 'Razer',
    'Thermaltake', 'Deepcool', 'Cooler Master', 'Antec', 'FSP', 'EVGA', 'Adata',
    'TeamGroup', 'Transcend', 'Ugreen', 'Baseus', 'TP-Link', 'Rapoo', 'JBL',
    'A4Tech', 'Epson', 'Canon', 'Brother', 'Zotac', 'Palit', 'Galax', 'Biostar',
    'Asrock', 'ViewSonic', 'AOC', 'BenQ', 'Philips', 'D-Link', 'Xiaomi', 'Gamdias',
    'Jungle Leopard', 'Kingfast', 'Hikvision', 'Dahua', 'Sony', 'PlayStation', 'Nintendo'
  ];

  for (const b of brands) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(product.name)) return b;
  }

  return product.name.split(/\s+/)[0] || 'Orion';
}

function classifyCategory(catName, catSlug, parentId) {
  const lowerName = (catName || '').toLowerCase();
  const lowerSlug = (catSlug || '').toLowerCase();

  // If parent is PRE OWNED (ID 748) or name contains used
  if (parentId === 748 || USED_PATTERNS.test(lowerName) || USED_PATTERNS.test(lowerSlug)) {
    return { group: 'used', type: 'used' };
  }

  // Check if component
  for (const comp of COMPONENT_CATEGORIES) {
    if (lowerName === comp || lowerSlug === comp || lowerName.includes(comp)) {
      return { group: 'components', type: 'brand-new' };
    }
  }

  // Everything else is accessory
  return { group: 'accessories', type: 'brand-new' };
}

async function fetchAllProducts() {
  const allProducts = [];
  const pageSize = 100;
  let page = 1;

  console.log('Fetching products from https://pentiumcity.com/wp-json/wc/store/v1/products ...');

  while (true) {
    const url = `https://pentiumcity.com/wp-json/wc/store/v1/products?per_page=${pageSize}&page=${page}`;
    try {
      console.log(`Fetching page ${page}...`);
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          console.log(`Reached end of catalog at page ${page}`);
          break;
        }
        throw new Error(`HTTP ${res.status} on page ${page}`);
      }
      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) {
        break;
      }
      allProducts.push(...batch);
      console.log(`Page ${page}: got ${batch.length} products (total so far: ${allProducts.length})`);
      if (batch.length < pageSize) {
        break;
      }
      page++;
      // brief pause to be polite
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`Error on page ${page}:`, err.message);
      break;
    }
  }

  return allProducts;
}

async function main() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log('Connected to MongoDB.');

  const rawProducts = await fetchAllProducts();
  console.log(`Total raw products fetched: ${rawProducts.length}`);

  if (rawProducts.length === 0) {
    throw new Error('No products fetched from pentiumcity.com!');
  }

  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false, collection: 'categories' }));

  // Prepare categories map
  const categoryMap = new Map();

  const formattedProducts = rawProducts.map((p, idx) => {
    const priceMinor = Number(p.prices?.price || 0);
    const regPriceMinor = Number(p.prices?.regular_price || p.prices?.price || 0);
    const price = priceMinor > 0 ? priceMinor / 100 : 0;
    const originalPrice = regPriceMinor > 0 ? regPriceMinor / 100 : price;

    const discount = (originalPrice > price && originalPrice > 0)
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : (p.on_sale ? 5 : 0);

    const images = (p.images || []).map(img => img.src).filter(Boolean);
    const primaryImage = images[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600';

    // Primary category
    const mainCat = (p.categories && p.categories.length > 0) ? p.categories[0] : { name: 'Others', slug: 'others', id: 0 };
    const classification = classifyCategory(mainCat.name, mainCat.slug, mainCat.parent);

    // Normalize category name and slug
    let categoryName = mainCat.name.trim();
    if (classification.type === 'used' && !/^used|^pre-owned/i.test(categoryName)) {
      categoryName = `Used ${categoryName}`;
    }
    const categorySlug = slugify(categoryName);

    const brand = extractBrand(p);
    const shortDesc = stripHtml(p.short_description || p.description || '').slice(0, 300);
    const desc = stripHtml(p.description || p.short_description || '');

    // Track category
    if (!categoryMap.has(categoryName)) {
      let uniqueSlug = categorySlug;
      let counter = 1;
      const existingSlugs = new Set(Array.from(categoryMap.values()).map(c => c.slug));
      while (existingSlugs.has(uniqueSlug)) {
        uniqueSlug = `${categorySlug}-${counter++}`;
      }
      categoryMap.set(categoryName, {
        name: categoryName,
        slug: uniqueSlug,
        type: classification.type,
        group: classification.group,
        img: primaryImage,
        count: 0
      });
    }
    const catEntry = categoryMap.get(categoryName);
    catEntry.count += 1;
    if (!catEntry.img && primaryImage) catEntry.img = primaryImage;

    const isInStock = p.is_in_stock !== false;
    const stock = isInStock ? (p.stock_quantity || 15) : 0;
    const status = isInStock ? 'In Stock' : 'Out of Stock';

    return {
      name: p.name,
      category: categoryName,
      price: price > 0 ? price : 1500,
      originalPrice: Math.max(price, originalPrice),
      rating: Number(p.average_rating || (4 + Math.random() * 0.9).toFixed(1)),
      reviews: Number(p.review_count || Math.floor(Math.random() * 25) + 3),
      image: primaryImage,
      images: images.length > 0 ? images : [primaryImage],
      isNewProduct: !classification.type.includes('used'),
      discount,
      status,
      shortDescription: shortDesc,
      description: desc,
      sku: p.sku || `PC-${p.id}-${idx}`,
      brand,
      stock,
      warranty: classification.type === 'used' ? '3 Months Warranty' : '1 Year Warranty',
      tags: [brand, mainCat.name, classification.group],
      hashtags: [`#${slugify(brand)}`, `#${slugify(mainCat.name)}`],
      specifications: {
        'Brand': brand,
        'Category': mainCat.name,
        'Condition': classification.type === 'used' ? 'Pre-Owned / Used' : 'Brand New',
        'Stock Status': status,
        'Warranty': classification.type === 'used' ? '3 Months' : '1 Year'
      }
    };
  });

  console.log(`Formatted ${formattedProducts.length} products across ${categoryMap.size} categories.`);

  // Clear existing items as requested: "datata tiyan ewa ayin karann"
  console.log('Clearing existing products and categories in database...');
  await Product.deleteMany({});
  await Category.deleteMany({});

  // Insert products in batches
  const batchSize = 200;
  for (let i = 0; i < formattedProducts.length; i += batchSize) {
    const chunk = formattedProducts.slice(i, i + batchSize);
    await Product.insertMany(chunk);
    console.log(`Inserted products ${i + 1} to ${Math.min(i + batchSize, formattedProducts.length)}`);
  }

  // Insert categories
  const categoryDocs = Array.from(categoryMap.values());
  await Category.insertMany(categoryDocs);
  console.log(`Inserted ${categoryDocs.length} categories.`);

  // Print summary by group
  const groupCounts = { components: 0, accessories: 0, used: 0 };
  for (const cat of categoryDocs) {
    groupCounts[cat.group] = (groupCounts[cat.group] || 0) + cat.count;
  }

  console.log('\n=== IMPORT COMPLETE ===');
  console.log(`Total Products: ${formattedProducts.length}`);
  console.log(`- PC Build Components products: ${groupCounts.components}`);
  console.log(`- Other Accessories products: ${groupCounts.accessories}`);
  console.log(`- Used Products: ${groupCounts.used}`);
  console.log(`Total Categories: ${categoryDocs.length}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Done!');
}

main().catch(err => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
