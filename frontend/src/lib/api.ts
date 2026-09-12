import { auth } from './firebase';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/$/, '');

async function getAuthHeader(): Promise<Record<string, string>> {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch {
      // ignore
    }
  }
  return {};
}

export interface MongoAddress {
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface MongoUser {
  _id?: string;
  id?: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses?: MongoAddress[];
  createdAt?: string;
  orders?: number;
  totalSpent?: number;
  isAdmin?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ApiOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: string;
  createdAt: string;
}

/**
 * Register or sync current user with MongoDB
 */
export async function registerOrSyncUser(name?: string, email?: string): Promise<MongoUser | null> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        name: name || auth.currentUser?.displayName || 'Customer',
        email: email || auth.currentUser?.email || '',
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('registerOrSyncUser error:', err);
    return null;
  }
}

/**
 * Fetch current user profile from MongoDB
 */
export async function getMyProfile(): Promise<MongoUser | null> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { ...authHeaders },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('getMyProfile error:', err);
    return null;
  }
}

/**
 * Update current user profile in MongoDB (name, phone, avatar, addresses)
 */
export async function updateMyProfile(updates: Partial<MongoUser>): Promise<MongoUser | null> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('updateMyProfile error:', err);
    return null;
  }
}

/**
 * Upload an image to the image server
 */
export async function uploadImageToServer(file: File): Promise<string> {
  const authHeaders = await getAuthHeader();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...authHeaders,
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload image');
  }

  const data = await res.json();
  return data.url;
}

/**
 * Get all registered users from MongoDB for Admin Console
 */
export async function getAllUsersFromDb(): Promise<MongoUser[]> {
  try {
    if (!auth.currentUser) return [];
    const authHeaders = await getAuthHeader();
    if (!authHeaders.Authorization) return [];
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: { ...authHeaders },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.warn('getAllUsersFromDb error:', err);
    return [];
  }
}

/**
 * Get current user's real orders from MongoDB
 */
export async function getMyOrders(): Promise<ApiOrder[]> {
  try {
    const authHeaders = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: { ...authHeaders },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch (err) {
    console.warn('getMyOrders error:', err);
    return [];
  }
}

/**
 * Format media/avatar URL: if it points to an unauthenticated R2 endpoint,
 * route it through the backend /api/uploads/ proxy endpoint.
 */
export function formatAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes('.r2.cloudflarestorage.com/uploads/')) {
    const filename = url.split('/uploads/')[1];
    return `${API_BASE_URL}/api/uploads/${filename}`;
  }
  return url;
}

// ---------------- PRODUCTS API ----------------

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number | string;
}): Promise<{ products: any[]; pagination?: any }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return { products: [] };
    const data = await res.json();
    return { products: data.products || [], pagination: data.pagination };
  } catch (err) {
    console.warn('fetchProducts error:', err);
    return { products: [] };
  }
}

export async function fetchProductById(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
  } catch (err) {
    console.warn('fetchProductById error:', err);
    return null;
  }
}

export async function createProductInDb(productData: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create product');
  }
  const data = await res.json();
  return data.product;
}

export async function updateProductInDb(id: string, updates: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update product');
  }
  const data = await res.json();
  return data.product;
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  return res.ok;
}

// ---------------- CATEGORIES API ----------------

export async function fetchCategories(type?: string): Promise<any[]> {
  try {
    const url = type ? `${API_BASE_URL}/api/categories?type=${type}` : `${API_BASE_URL}/api/categories`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.warn('fetchCategories error:', err);
    return [];
  }
}

export async function createCategoryInDb(categoryData: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create category');
  }
  const data = await res.json();
  return data.category;
}

export async function updateCategoryInDb(id: string, updates: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update category');
  }
  const data = await res.json();
  return data.category;
}

export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  return res.ok;
}

// ---------------- BRANDS API ----------------

export async function fetchBrands(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/brands`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.brands || [];
  } catch (err) {
    console.warn('fetchBrands error:', err);
    return [];
  }
}

export async function createBrandInDb(brandData: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/brands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(brandData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create brand');
  }
  const data = await res.json();
  return data.brand;
}

export async function updateBrandInDb(id: string, updates: any): Promise<any> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update brand');
  }
  const data = await res.json();
  return data.brand;
}

export async function deleteBrandFromDb(id: string): Promise<boolean> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  return res.ok;
}

// ---------------- WISHLIST API ----------------

/**
 * Fetch the current user's wishlist product IDs from MongoDB.
 */
export async function getWishlist(): Promise<string[]> {
  try {
    const authHeaders = await getAuthHeader();
    if (!authHeaders.Authorization) return [];
    const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.productIds ?? [];
  } catch (err) {
    console.warn('getWishlist error:', err);
    return [];
  }
}

/**
 * Save (replace) the user's wishlist product IDs in MongoDB.
 */
export async function saveWishlist(productIds: string[]): Promise<void> {
  try {
    const authHeaders = await getAuthHeader();
    if (!authHeaders.Authorization) return;
    await fetch(`${API_BASE_URL}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ productIds }),
    });
  } catch (err) {
    console.warn('saveWishlist error:', err);
  }
}

// ---------------- ORDER TRACKING API ----------------

/**
 * Fetch a single order by its order number for the tracking page.
 * Reuses the existing /api/orders endpoint and filters client-side.
 */
export async function getOrderByNumber(orderNumber: string): Promise<ApiOrder | null> {
  try {
    const authHeaders = await getAuthHeader();
    if (!authHeaders.Authorization) return null;
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'GET',
      headers: { ...authHeaders },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const orders: ApiOrder[] = data.orders ?? [];
    return orders.find(o => o.orderNumber === orderNumber) ?? null;
  } catch (err) {
    console.warn('getOrderByNumber error:', err);
    return null;
  }
}
