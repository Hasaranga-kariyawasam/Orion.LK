import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
 * Format avatar URL: if it points to an unauthenticated R2 endpoint,
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
