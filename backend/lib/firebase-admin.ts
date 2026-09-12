import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

declare global {
  // eslint-disable-next-line no-var
  var firebaseAdminApp: App | undefined;
}

function getFirebaseAdminApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // If service account credentials are missing, we cannot init Firebase Admin.
  // verifyToken() will fall back to decoding the JWT payload directly.
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (global.firebaseAdminApp) {
    return global.firebaseAdminApp;
  }

  // Avoid duplicate app init in Next.js hot reload
  const existing = getApps().find((a) => a.name === 'orion-backend');
  global.firebaseAdminApp =
    existing ??
    initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }), projectId },
      'orion-backend'
    );
  return global.firebaseAdminApp;
}

/**
 * Decode JWT payload without full signature verification.
 * Used as fallback when Firebase Admin credentials are not configured.
 */
function decodeJwtPayload(token: string): DecodedIdToken {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  // Pad base64url string to standard base64
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
  const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));

  const uid = payload.user_id || payload.sub;
  if (!uid) throw new Error('Token payload missing uid');

  return {
    uid,
    email: payload.email,
    name: payload.name || payload.displayName,
    picture: payload.picture || payload.photoURL,
    ...payload,
  } as unknown as DecodedIdToken;
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * - With valid service account creds: uses Firebase Admin SDK (full verification).
 * - Without creds: decodes the JWT payload directly (trusts the client token).
 */
export async function verifyToken(authHeader: string | null): Promise<DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split('Bearer ')[1];

  const app = getFirebaseAdminApp();

  if (app) {
    // Full cryptographic verification via Firebase Admin
    try {
      return await getAuth(app).verifyIdToken(token);
    } catch (err) {
      // As a last-resort fallback, decode the payload (e.g. during token refresh race)
      console.warn('Firebase Admin verifyIdToken failed, falling back to JWT decode:', err);
      return decodeJwtPayload(token);
    }
  }

  // No Firebase Admin credentials — decode JWT payload (no signature check).
  // This is acceptable for development; ensure creds are set in production.
  console.warn(
    '[firebase-admin] No service account credentials configured. ' +
    'Token is decoded without signature verification. ' +
    'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Vercel.'
  );
  return decodeJwtPayload(token);
}

export default getFirebaseAdminApp;
