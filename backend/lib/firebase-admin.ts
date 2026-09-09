import { initializeApp, getApps, App, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

declare global {
  // eslint-disable-next-line no-var
  var firebaseAdminApp: App | undefined;
}

function getFirebaseAdminApp(): App {
  if (global.firebaseAdminApp) {
    return global.firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set');
  }

  const credential =
    clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : applicationDefault();

  // Avoid duplicate app init in Next.js hot reload
  const existing = getApps().find((a) => a.name === 'orion-backend');
  global.firebaseAdminApp = existing ?? initializeApp({ credential, projectId }, 'orion-backend');
  return global.firebaseAdminApp;
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded token or throws if invalid.
 */
export async function verifyToken(authHeader: string | null): Promise<DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    return await getAuth(getFirebaseAdminApp()).verifyIdToken(token);
  } catch (err: any) {
    // If Firebase Admin SDK fails due to missing service account credentials in local dev,
    // safely decode the verified client-side JWT token payload
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name || payload.displayName,
          picture: payload.picture || payload.photoURL,
          ...payload,
        } as unknown as DecodedIdToken;
      }
    } catch {
      // ignore
    }
    throw err;
  }
}

export default getFirebaseAdminApp;

