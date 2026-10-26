import { Product } from '../types';
import type { SpecialOffer } from '../context/AdminContext';

export interface ActiveSpecialOffer<T extends Product> {
  product: T;
  offer: SpecialOffer;
}

export function getActiveSpecialOffers<T extends Product & { _id?: string }>(
  products: T[],
  offers: SpecialOffer[],
  deadline: string,
  now = Date.now(),
): ActiveSpecialOffer<T>[] {
  const deadlineTime = deadline ? Date.parse(deadline) : NaN;
  if (Number.isFinite(deadlineTime) && now >= deadlineTime) return [];

  const productsById = new Map<string, T>();
  products.forEach(product => {
    productsById.set(String(product.id), product);
    if (product._id) productsById.set(String(product._id), product);
  });

  return offers.flatMap(offer => {
    if (!offer.enabled) return [];
    const product = productsById.get(String(offer.productId));
    return product ? [{ product, offer }] : [];
  });
}

export function getOfferProduct<T extends Product>(
  product: T,
  offer: SpecialOffer,
): T {
  if (!offer.offerPrice || offer.offerPrice <= 0 || offer.offerPrice >= product.price) return product;
  return {
    ...product,
    price: offer.offerPrice,
    discount: Math.round((1 - offer.offerPrice / product.price) * 100),
  };
}
