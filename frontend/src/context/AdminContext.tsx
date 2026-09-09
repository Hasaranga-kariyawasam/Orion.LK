import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Accessory {
  id: string;
  name: string;
  image: string;
  colorClass: string;
  gradientClass: string;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  banner?: string;
  visible?: boolean;
}

interface AdminContextType {
  heroImages: string[];
  setHeroImages: (images: string[]) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  accessories: Accessory[];
  setAccessories: (accessories: Accessory[]) => void;
  brands: Brand[];
  setBrands: (brands: Brand[]) => void;
  saveSettings: () => void;
}

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800"
];

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=v0oASOYTq0s";

const DEFAULT_ACCESSORIES: Accessory[] = [
  {
    id: "1",
    name: "Adapters",
    image: "https://images.unsplash.com/photo-1583394838084-25e1a38481ff?auto=format&fit=crop&q=80&w=300",
    colorClass: "bg-[#5a2e98]",
    gradientClass: "from-purple-800 to-indigo-600"
  },
  {
    id: "2",
    name: "Headsets",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=300",
    colorClass: "bg-[#d43763]",
    gradientClass: "from-rose-500 to-pink-500"
  },
  {
    id: "3",
    name: "Controllers",
    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=300",
    colorClass: "bg-[#2563eb]",
    gradientClass: "from-blue-600 to-cyan-500"
  },
  {
    id: "4",
    name: "Keyboards",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=300",
    colorClass: "bg-[#059669]",
    gradientClass: "from-emerald-600 to-teal-500"
  }
];

const DEFAULT_BRANDS: Brand[] = [
  { id: "1", name: "ASUS ROG", image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/ROG_Logo.svg", banner: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=1200", visible: true },
  { id: "2", name: "MSI", image: "https://upload.wikimedia.org/wikipedia/commons/b/b1/MSI_logo.svg", visible: true },
  { id: "3", name: "Gigabyte", image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Gigabyte_Technology_logo.svg", visible: true },
  { id: "4", name: "Corsair", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Corsair_Logo.svg", visible: true },
  { id: "5", name: "Razer", image: "https://upload.wikimedia.org/wikipedia/en/4/40/Razer_snake_logo.svg", visible: true },
  { id: "6", name: "Logitech", image: "https://upload.wikimedia.org/wikipedia/commons/1/17/Logitech_logo.svg", visible: true }
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadState = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    const value = saved ? JSON.parse(saved) : defaultValue;
    return key === 'admin_videoUrl' && (
      !value ||
      value === 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' ||
      value === 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    ) ? defaultValue : value;
  };

  const [heroImages, setHeroImages] = useState<string[]>(() => loadState('admin_heroImages', DEFAULT_HERO_IMAGES));
  const [videoUrl, setVideoUrl] = useState<string>(() => loadState('admin_videoUrl', DEFAULT_VIDEO_URL));
  const [accessories, setAccessories] = useState<Accessory[]>(() => loadState('admin_accessories', DEFAULT_ACCESSORIES));
  const [brands, setBrands] = useState<Brand[]>(() => loadState('admin_brands', DEFAULT_BRANDS));

  const saveSettings = () => {
    localStorage.setItem('admin_heroImages', JSON.stringify(heroImages));
    localStorage.setItem('admin_videoUrl', JSON.stringify(videoUrl));
    localStorage.setItem('admin_accessories', JSON.stringify(accessories));
    localStorage.setItem('admin_brands', JSON.stringify(brands));
    alert('Settings saved successfully!');
  };

  return (
    <AdminContext.Provider value={{
      heroImages, setHeroImages,
      videoUrl, setVideoUrl,
      accessories, setAccessories,
      brands, setBrands,
      saveSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
