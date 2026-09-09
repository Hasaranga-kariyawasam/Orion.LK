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
  return getAuth(getFirebaseAdminApp()).verifyIdToken(token);
}

export default getFirebaseAdminApp;

