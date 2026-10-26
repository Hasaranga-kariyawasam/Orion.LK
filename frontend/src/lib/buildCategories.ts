import {
  Battery,
  Box,
  Cpu,
  HardDrive,
  Keyboard,
  Maximize,
  MemoryStick,
  Monitor,
  Mouse,
  PlusCircle,
  Server,
  Wind,
} from 'lucide-react';

export const BUILD_CATEGORIES = [
  { id: 'processor', name: 'Processor', icon: Cpu },
  { id: 'motherboard', name: 'Motherboard', icon: Box },
  { id: 'memory', name: 'Memory', icon: MemoryStick },
  { id: 'graphics', name: 'Graphics card', icon: Maximize },
  { id: 'primary-storage', name: 'Primary storage', icon: HardDrive },
  { id: 'extra-storage', name: 'Extra storage', icon: HardDrive },
  { id: 'power-supply', name: 'Power supply', icon: Battery },
  { id: 'cpu-cooler', name: 'CPU cooler', icon: Wind },
  { id: 'computer-case', name: 'Computer case', icon: Server },
  { id: 'case-fans', name: 'Case fans', icon: Wind },
  { id: 'monitor', name: 'Monitor', icon: Monitor },
  { id: 'keyboard', name: 'Keyboard', icon: Keyboard },
  { id: 'mouse', name: 'Mouse', icon: Mouse },
  { id: 'ups', name: 'UPS', icon: Battery },
  { id: 'more', name: 'More products', icon: PlusCircle },
] as const;

export type BuildCategoryId = typeof BUILD_CATEGORIES[number]['id'];

export const BUILD_CATEGORY_DEFAULT_KEYWORDS: Record<BuildCategoryId, string[]> = {
  processor: ['processor', 'cpu'],
  motherboard: ['motherboard'],
  memory: ['ram', 'memory'],
  graphics: ['graphics', 'gpu', 'video card'],
  'primary-storage': ['ssd', 'nvme', 'storage'],
  'extra-storage': ['hdd', 'hard drive'],
  'power-supply': ['power supply', 'psu'],
  'cpu-cooler': ['cpu cooler', 'cooling'],
  'computer-case': ['computer case', 'pc case', 'chassis'],
  'case-fans': ['case fan', 'fan kit'],
  monitor: ['monitor', 'display'],
  keyboard: ['keyboard'],
  mouse: ['mouse'],
  ups: ['ups'],
  more: [],
};
