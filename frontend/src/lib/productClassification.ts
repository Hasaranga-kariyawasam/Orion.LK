import { ProductType } from '../types';

export const PRODUCT_TYPES: ProductType[] = ['pc', 'laptop', 'other'];

const PC_CATEGORY_PATTERN =
  /\b(processors?|cpus?|motherboards?|ram|desktop\s+ram|memory|graphics?\s+cards?|gpus?|computer\s+casings?|pc\s+cases?|power\s+supply|psus?|coolers?|liquid\s+coolers?|air\s+coolers?|storage(?:\s+devices?)?|nvme|ssds?|hdds?|sata\s+ssds?|fans?|fan\s+kits|thermal(?:\s+paste)?|vga\s+stands?|gpu\s+stands?|monitors?|keyboards?|mice|mouse|headsets?|webcams?|microphones?)\b/;
const LAPTOP_PATTERN = /\b(laptops?|notebooks?|chromebooks?)\b/;

export function inferProductType(name = '', category = ''): ProductType {
  const categoryName = category.toLowerCase().replace(/^used\s+/, '');
  const productName = name.toLowerCase();

  if (LAPTOP_PATTERN.test(categoryName)) return 'laptop';
  if (PC_CATEGORY_PATTERN.test(categoryName) ||
      /\b(pc|pcs|desktop(?:\s+(?:pc|computer|computers))?|pre[- ]built|gaming\s+pc|system\s+unit|computer\s+builds?)\b/.test(categoryName)) {
    return 'pc';
  }
  if (LAPTOP_PATTERN.test(productName)) return 'laptop';
  if (PC_CATEGORY_PATTERN.test(productName) ||
      /\b(gaming\s+pc|desktop\s+(?:pc|computer)|pre[- ]built|all[- ]in[- ]one\s+pc|system\s+unit|pc\s+builds?)\b/.test(productName)) return 'pc';
  return 'other';
}

export function getProductType(
  productType: ProductType | undefined,
  name: string,
  category: string,
  productTypeManual = false,
): ProductType {
  const inferredType = inferProductType(name, category);
  if (!productType || (productType === 'other' && !productTypeManual && inferredType !== 'other')) {
    return inferredType;
  }
  return productType;
}

export function isUsedProduct(
  product: { isNewProduct?: boolean; isNew?: boolean; category: string },
  categoryType?: 'brand-new' | 'used',
): boolean {
  const isNew = product.isNewProduct ?? product.isNew;
  if (isNew !== undefined) return !isNew;
  return categoryType === 'used' || product.category.toLowerCase().startsWith('used ');
}
