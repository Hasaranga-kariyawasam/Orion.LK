const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const TARGET_COUNT = 165;
const PAGE_SIZE = 100;
const SOURCES = [
  { name: 'Pentium City', url: 'https://pentiumcity.com/wp-json/wc/store/products' },
];
const COMPUTER_CATEGORY_PATTERN = /motherboard|mouse|casing|keyboard|ram|headset|monitor|graphic|power supply|processor|nvme|cooler|laptop|speaker|usb hub|converter|fan|cooling pad|microphone|ssd|hdd|printer|enclosure|thermal paste|webcam|gaming controller|combo|ups|storage|adapter|cable/i;
const RECOGNIZED_BRAND_PATTERN = /ASUS|MSI|Gigabyte|Acer|Dell|HP|Lenovo|Apple|Intel|AMD|NVIDIA|Kingston|Corsair|G\.Skill|Samsung|Western Digital|WD|Seagate|Crucial|Redragon|Havit|Jedel|Logitech|Razer|Thermaltake|Deepcool|Cooler Master|Antec|FSP|EVGA|Adata|TeamGroup|Transcend|Ugreen|Baseus|TP-Link|Rapoo|JBL|A4Tech|Epson|Canon|Brother|Zotac|Palit|Galax|Biostar|Asrock|ViewSonic|AOC|BenQ|Philips|D-Link|Xiaomi|Gamdias|Jungle Leopard|Kingfast|Hikvision|Dahua/i;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is required');
}

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const categorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const brandSchema = new mongoose.Schema({}, { strict: false, collection: 'brands' });
const Product = mongoose.models.SupplierProduct || mongoose.model('SupplierProduct', productSchema);
const Category = mongoose.models.SupplierCategory || mongoose.model('SupplierCategory', categorySchema);
const Brand = mongoose.models.SupplierBrand || mongoose.model('SupplierBrand', brandSchema);

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function productBrand(product) {
  const attribute = (product.attributes || []).find((item) => /brand|manufacturer/i.test(item.name));
  return attribute?.terms?.[0]?.name || product.name.split(/\s+/)[0] || 'Supplier Catalog';
}

async function fetchProducts(source) {
  const products = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${source.url}?page=${page}&per_page=${PAGE_SIZE}&orderby=date&order=desc`);
    if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
    const batch = await response.json();
    if (!batch.length) break;
    products.push(...batch.map((product) => ({ ...product, source: source.name })));
    if (batch.length < PAGE_SIZE) break;
  }
  return products;
}

async function main() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  const sourceProducts = (await Promise.all(SOURCES.map(fetchProducts))).flat();
  const selected = sourceProducts
    .filter((product) => Number(product.prices?.price || 0) / 100 >= 1000)
    .filter((product) => {
      const category = (product.categories || []).map((item) => item.name).join(' ');
      return COMPUTER_CATEGORY_PATTERN.test(category) && RECOGNIZED_BRAND_PATTERN.test(product.name);
    })
    .filter((product) => product.images?.[0]?.src)
    .slice(0, TARGET_COUNT);

  if (selected.length < TARGET_COUNT) {
    throw new Error(`Only found ${selected.length} usable products; refusing a partial replacement`);
  }

  await Product.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});

  const categories = new Map();
  const brands = new Map();
  const documents = selected.map((product, index) => {
    const category = product.categories?.[0]?.name || 'Computer Accessories';
    const brand = productBrand(product);
    const price = Number(product.prices.price) / 100;
    const regularPrice = Number(product.prices.regular_price || product.prices.price) / 100;
    const images = product.images.map((image) => image.src).filter(Boolean);
    const sourceSku = product.sku || `${product.source}-${product.id}`;

    if (!categories.has(category)) categories.set(category, images[0]);
    if (!brands.has(brand)) brands.set(brand, images[0]);

    return {
      name: product.name,
      category,
      price,
      originalPrice: Math.max(price, regularPrice),
      rating: Number(product.average_rating || 0),
      reviews: Number(product.review_count || 0),
      image: images[0],
      images,
      isNewProduct: true,
      discount: regularPrice > price ? Math.round((1 - price / regularPrice) * 100) : 0,
      status: product.is_in_stock === false ? 'Out of Stock' : 'In Stock',
      shortDescription: stripHtml(product.short_description || product.description).slice(0, 240),
      description: stripHtml(product.description || product.short_description),
      sku: `${product.source.slice(0, 3).toUpperCase()}-${sourceSku}-${index}`,
      brand,
      stock: Number(product.stock_quantity || 0),
      warranty: 'Supplier warranty',
      specifications: {
        Source: product.source,
        SupplierUrl: product.permalink || '',
      },
    };
  });

  await Product.insertMany(documents, { ordered: false });
  await Category.insertMany([...categories].map(([name, img]) => ({
    name,
    slug: slugify(name),
    type: 'brand-new',
    count: documents.filter((product) => product.category === name).length,
    img,
  })));
  await Brand.insertMany([...brands].map(([name, image]) => ({ name, image, visible: true })));

  console.log(JSON.stringify({
    imported: documents.length,
    categories: categories.size,
    brands: brands.size,
    sources: SOURCES.map((source) => source.name),
  }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
