export type MappingStatus = 
  | 'idle' 
  | 'scanning' 
  | 'scanned' 
  | 'uploading' 
  | 'upload_failed' 
  | 'uploaded' 
  | 'queuing'
  | 'mapping' 
  | 'mapping_failed' 
  | 'completed';

export interface Alert {
  level: 'red' | 'orange' | 'yellow';
  message: string;
  blocking?: boolean;
  onConfirm?: () => void;
}

export interface ScanningPopup {
  id: string;
  type: 'alarm' | 'warning';
  message: string;
}

export interface SensorStatus {
  lidar: boolean;
  imu: boolean;
  camera: boolean;
  rtk: boolean;
}

export interface QuotaFlow {
  id: string;
  sn: string;
  type: 'gift' | 'recharge' | 'refund' | 'consumption' | 'pre_deduction';
  amount: number;
  date: string;
  description: string;
  mappingName?: string;
}

export interface User {
  id: string;
  phone: string;
  quota: number;
  history: QuotaFlow[];
}

export interface QuotaPackage {
  id: string;
  duration: number; // in minutes
  price: number; // in CNY
  originalPrice?: number; // optional original price for showing discounts
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AlgorithmConfig {
  version: string;
}

export interface Warranty {
  deviceName: string;
  sn: string;
  activationDate: string;
  expiryDate: string;
}

export type RTKStatus = 'FIXED' | 'FLOAT' | 'SINGLE' | 'NONE';

export interface WifiNetwork {
  ssid: string;
  signal: number; // 0-100
  encryption: 'WPA2' | 'Open';
  isSaved: boolean;
  ip?: string;
  mac?: string;
  speed?: string;
  rssi?: number;
  isStatic?: boolean;
  subnetMask?: string;
  gateway?: string;
  dns?: string;
}

export interface CellularStatus {
  operator: string;
  iccid: string;
  type: '2G' | '3G' | '4G' | '5G';
  uploadSpeed: string;
  downloadSpeed: string;
  signalStrength: string; // e.g. "8db"
}

export interface NetworkState {
  type: 'none' | 'wifi' | 'cellular' | 'wired';
  wifiEnabled: boolean;
  cellularEnabled: boolean;
  connectedSsid?: string;
  cellular?: CellularStatus;
  wiredConnected: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
  roles: string[];
  isRemembered?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface DeviceState {
  battery: number;
  network: NetworkState;
  rtkStatus: RTKStatus;
  isCharging: boolean;
  isDeveloperMode: boolean;
  isActivated: boolean; // Hardware activation
  isUserActivated: boolean; // User binding activation
  serialNumber: string;
  machineCode: string;
  currentMapId?: string;
  mappingStatus: MappingStatus;
  progress: number;
  cloudQuota: number; // in minutes
  storage: number; // in GB (used)
  totalStorage: number; // in GB
  version: string;
  sensors: SensorStatus;
  scanDuration: number; // in seconds
  user?: User;
  warranty?: Warranty;
}

export interface MapData {
  id: string;
  name: string;
  createdAt: string;
  size: string;
  type: 'local' | 'cloud';
  status: MappingStatus;
  thumbnail?: string;
  duration?: number; // scan duration in seconds
  mappingDuration?: number; // mapping duration in seconds
  progress?: number;
  area?: string;
  eta?: string;
  vramUsage?: number; // percentage
  failureReason?: string;
  isProcessing?: boolean;
  isDownloaded?: boolean;
  downloadProgress?: number;
  hasSemantics?: boolean;
}

export interface UpdatePackage {
  version: string;
  size: string;
  description: string;
  items: number; // number of components to update
}
