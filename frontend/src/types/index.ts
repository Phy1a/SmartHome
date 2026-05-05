// ===== MODELS =====

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  birthDate?: string;
  memberType: string;
  photoUrl?: string;
  level: Level;
  points: number;
  loginCount: number;
  actionCount: number;
  isValidated?: boolean;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export type Level = "débutant" | "intermédiaire" | "avancé" | "expert";

export interface Device {
  id: number;
  uniqueId: string;
  name: string;
  description?: string;
  type: string;
  brand?: string;
  room?: string;
  status: "actif" | "inactif";
  connectivity?: string;
  signalStrength?: string;
  batteryLevel: number;
  energyConsumption: number;
  lastInteraction?: string;
  createdAt?: string;
  // For extensibility, we can store additional attributes in a flexible way
  attributes: Record<string, string>;
  history?: DeviceDataPoint[];
}

export interface DeviceDataPoint {
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface Room {
  id: number;
  name: string;
  floor: number;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

export interface Alert {
  id: number;
  deviceId?: number;
  deviceName?: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  isRead: boolean;
  createdAt: string;
}

export interface DeletionRequest {
  id: number;
  deviceId: number;
  deviceName: string;
  requester: string;
  reason?: string;
  createdAt: string;
}

export interface DeviceStats {
  total: number;
  active: number;
  inactive: number;
  totalEnergy: number;
  byType: Array<{ type: string; count: number }>;
  byRoom: Array<{ room: string; count: number }>;
  energyTrend: Array<{ day: string; total: number }>;
}

export interface PlatformStats {
  totalUsers: number;
  validatedUsers: number;
  totalDevices: number;
  unreadAlerts: number;
  loginsLastWeek: number;
  pendingDeletions: number;
  usersByLevel: Record<string, number>;
}

export interface PointsResponse {
  points: number;
  level: Level;
  actionCount: number;
  loginCount: number;
}

export interface PublicMember {
  id: number;
  username: string;
  age?: number;
  gender?: string;
  memberType: string;
  level: Level;
  points: number;
  photoUrl?: string;
}

// ===== FORM TYPES =====

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  memberType: string;
  age: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  age: string | number;
  gender: string;
  birthDate: string;
  memberType: string;
  photoUrl: string;
  newPassword?: string;
}

export interface DeviceForm {
  name: string;
  description: string;
  type: string;
  brand: string;
  room: string;
  status: string;
  energyConsumption: number;
  attributes?: Record<string, string>;
}

export interface DeviceFilters {
  keyword: string;
  type: string;
  status: string;
  room: string;
  brand: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
}

// ===== AUTH CONTEXT =====

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  loginUser: (token: string, userData: User) => void;
  logout: () => void;
  canAccess: (minLevel: Level) => boolean;
  getLevel: () => Level;
}
