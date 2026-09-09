import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, onAuthStateChanged, logout as firebaseLogout } from '../lib/firebase';
import { updateProfile, User } from 'firebase/auth';
import { 
  getMyProfile, 
  registerOrSyncUser, 
  updateMyProfile, 
  uploadImageToServer, 
  MongoUser 
} from '../lib/api';

interface AuthContextType {
  user: User | null;
  mongoUser: MongoUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateMongoProfile: (updates: Partial<MongoUser>) => Promise<MongoUser | null>;
  uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mongoUser, setMongoUser] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (fbUser: User) => {
    try {
      let profile = await getMyProfile();
      if (!profile) {
        profile = await registerOrSyncUser(fbUser.displayName || undefined, fbUser.email || undefined);
      }
      setMongoUser(profile);
    } catch (e) {
      console.warn('Error fetching MongoDB profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    setMongoUser(null);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  };

  const updateMongoProfile = async (updates: Partial<MongoUser>): Promise<MongoUser | null> => {
    try {
      const updated = await updateMyProfile(updates);
      if (updated) {
        setMongoUser(updated);
        // Also sync displayName to Firebase Auth if updated
        if (updates.name && auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: updates.name });
        }
      }
      return updated;
    } catch (e) {
      console.error('Failed to update profile:', e);
      return null;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      // 1. Upload to image server
      let avatarUrl = '';
      try {
        avatarUrl = await uploadImageToServer(file);
      } catch (uploadErr) {
        console.warn('Backend image server upload failed, using Data URL fallback:', uploadErr);
        // Fallback to base64 Data URL so upload never fails for user
        avatarUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      // 2. Update Firebase Auth profile if URL fits within Firebase's 2048 char limit
      if (auth.currentUser && !avatarUrl.startsWith('data:') && avatarUrl.length <= 2048) {
        try {
          await updateProfile(auth.currentUser, { photoURL: avatarUrl });
          setUser({ ...auth.currentUser } as User);
        } catch (fbErr) {
          console.warn('Firebase photoURL update non-fatal warning:', fbErr);
        }
      }

      // 3. Update MongoDB user record (MongoDB supports full-length URLs and base64)
      const updated = await updateMyProfile({ avatar: avatarUrl });
      if (updated) {
        setMongoUser(updated);
      } else {
        setMongoUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      }

      return avatarUrl;
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      mongoUser,
      loading,
      logout,
      refreshProfile,
      updateMongoProfile,
      uploadAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
