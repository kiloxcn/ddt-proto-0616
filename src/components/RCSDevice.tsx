import React, { useState, useEffect, useRef } from 'react';
import { 
  Battery, 
  Wifi, 
  WifiOff,
  Settings, 
  Play, 
  Square, 
  Download, 
  Calendar,
  Info, 
  Cloud, 
  HardDrive, 
  QrCode,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Zap,
  Clock,
  Database,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  FileDown,
  FileText,
  X,
  ChevronRight,
  Network,
  Smartphone,
  History,
  Globe,
  Activity,
  Signal,
  Lock,
  Unlock,
  Monitor,
  Cpu,
  Camera,
  Scan,
  CreditCard,
  User,
  LogOut,
  Layers,
  FolderOpen,
  CloudLightning,
  Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeviceState, MappingStatus, MapData, WifiNetwork, RTKStatus, UpdatePackage, Alert, ScanningPopup, QuotaFlow, AlgorithmConfig, QuotaPackage } from '../types';
import { globalStore } from '../services/store';

function formatDateTime(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

interface RCSDeviceProps {
  onLogout?: () => void;
}

export const RCSDevice: React.FC<RCSDeviceProps> = ({ onLogout }) => {
  const user = globalStore.getCurrentUser();
  const [state, setState] = useState<DeviceState>({
    battery: 85,
    network: {
      type: 'wifi',
      wifiEnabled: true,
      cellularEnabled: true,
      connectedSsid: 'DDT-Office-5G',
      wiredConnected: false,
      cellular: {
        operator: '中国移动',
        iccid: '89860012345678901234',
        type: '5G',
        uploadSpeed: '1.2 MB/s',
        downloadSpeed: '8.5 MB/s',
        signalStrength: '12db'
      }
    },
    rtkStatus: 'FIXED',
    isCharging: false,
    isDeveloperMode: false,
    isActivated: false, // Hardware activation
    isUserActivated: false, // User binding activation
    serialNumber: 'H22S0456',
    machineCode: 'DDT-MC-7F2A9B4C', // 默认机器码，符合激活校验规则
    mappingStatus: 'idle',
    progress: 0,
    cloudQuota: 0, // Starts at 0, becomes 1000 after activation
    storage: 127.2, // 127.2GB used, leaving <1GB free
    totalStorage: 128, // 128GB total
    version: '5.14.0',
    sensors: { lidar: true, imu: true, camera: true, rtk: true },
    batteryLevel: 85,
    scanDuration: 0,
  });

  const [activationCode, setActivationCode] = useState('');
  const [aboutClickCount, setAboutClickCount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [showBagQR, setShowBagQR] = useState(false);
  const [showMachineCodeQR, setShowMachineCodeQR] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFormatConfirm, setShowFormatConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [mappingHistory, setMappingHistory] = useState<MapData[]>([
    { id: 'M001', name: 'Office_Main', createdAt: '2024-04-20 10:00:00', size: '2.4 GB', type: 'cloud', status: 'completed', duration: 1200, area: '450', hasSemantics: true },
    { id: 'M002', name: 'Parking_Lot', createdAt: '2024-04-21 09:15:00', size: '3.8 GB', type: 'cloud', status: 'completed', duration: 1800, area: '1200', hasSemantics: false },
    { id: 'M003', name: 'Basement_01', createdAt: '2024-04-22 14:30:00', size: '1.2 GB', type: 'cloud', status: 'mapping_failed', duration: 600, area: '200', failureReason: 'ERR_OOM' },
    { id: 'M004', name: 'Warehouse_A', createdAt: '2024-04-23 16:45:00', size: '5.6 GB', type: 'cloud', status: 'mapping', duration: 3600, area: '2500', progress: 45 },
  ]);
  const [adminTab, setAdminTab] = useState<'abnormal' | 'history'>('abnormal');
  const [view, setView] = useState<
    | 'boot' | 'home' | 'scanning' | 'mapping' | 'settings' | 'about' | 'activation' 
    | 'wifi_setup' | 'pre_scan_check' | 'cloud_init' | 'recharge' | 'download' 
    | 'user_activation' | 'self_check_detail'
    | 'network_settings' | 'cellular_settings' | 'wifi_settings' | 'wifi_config'
    | 'update_check' | 'updating'
    | 'quota_flow' | 'payment_qr' | 'cloud_admin'
    | 'map_details' | 'share_method' | 'share_file_type' | 'download_file_type' | 'local_share' | 'online_share' | 'cloud_progress' | 'map_list'
    | 'mapping_history' | 'saving' | 'cloud_options' | 'preparing_file'
    | 'scan_preview' | 'scan_init'
  >('boot');
  const [scanInitState, setScanInitState] = useState<'none' | 'initializing' | 'static_wait' | 'countdown'>('none');
  const [scanCountdown, setScanCountdown] = useState<number>(10);
  const [shutterSpeed, setShutterSpeed] = useState<string>('1/400');
  const [exposureEnvMode, setExposureEnvMode] = useState<'indoor' | 'outdoor'>('indoor');
  const [useMapSemantics, setUseMapSemantics] = useState(true);
  const [activeCamera, setActiveCamera] = useState<'CAM_01' | 'CAM_02' | 'CAM_03'>('CAM_01');
  const [shareMethod, setShareMethod] = useState<'local' | 'online' | null>(null);
  const [shareFileType, setShareFileType] = useState<'ddt' | 'ply' | 'las' | null>(null);
  const [downloadFileType, setDownloadFileType] = useState<'ddt' | 'ply' | 'las' | null>(null);
  const [availablePackages, setAvailablePackages] = useState<QuotaPackage[]>([]);

  useEffect(() => {
    if (view === 'recharge') {
      setAvailablePackages(globalStore.getActivePackages());
    }
  }, [view]);

  const [selectedPackage, setSelectedPackage] = useState<QuotaPackage | null>(null);
  const [rechargeQuantity, setRechargeQuantity] = useState(1);
  const [quotaFlows, setQuotaFlows] = useState<QuotaFlow[]>([
    { id: 'f1', sn: 'DDT-SN-20231101', type: 'recharge', amount: 1000, date: '2023-11-01 10:00:00', description: '充值首次激活赠送' },
    { id: 'f2', sn: 'DDT-SN-20231101', type: 'pre_deduction', amount: -50, date: '2023-11-05 14:30:00', description: '预扣除，开始建图', mappingName: 'Office_Main_Cloud' },
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mappingProgress, setMappingProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'failed' | 'disconnected'>('idle');
  const [mappingStatus, setMappingStatus] = useState<'idle' | 'queuing' | 'mapping' | 'completed' | 'failed' | 'canceled'>('idle');
  const [avgUploadSpeed, setAvgUploadSpeed] = useState('12.8 MB/s');
  const [activeCloudTasks, setActiveCloudTasks] = useState(0);
  const [networkRetryCountdown, setNetworkRetryCountdown] = useState(30);
  const [showCancelUploadConfirm, setShowCancelUploadConfirm] = useState(false);
  const [showCancelMappingConfirm, setShowCancelMappingConfirm] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(900); // 15 mins
  const [paymentExpiryTimer, setPaymentExpiryTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) {
        setView(e.detail as any);
      }
    };
    window.addEventListener('rcs-navigate', handleNavigate);
    return () => window.removeEventListener('rcs-navigate', handleNavigate);
  }, []);

  const [historyFilter, setHistoryFilter] = useState<MappingStatus | 'all'>('all');
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | null>(null);
  const [selfCheckStatus, setSelfCheckStatus] = useState<'checking' | 'normal' | 'abnormal'>('normal');
  const [selfCheckStep, setSelfCheckStep] = useState(0);
  const [selfCheckProgress, setSelfCheckProgress] = useState<string>('');
  const [hasRunInitialCheck, setHasRunInitialCheck] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [abnormalRequests, setAbnormalRequests] = useState<any[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [shareSource, setShareSource] = useState<{browser: string, ip: string} | null>(null);
  const [showShareQR, setShowShareQR] = useState<{type: string, ip: string} | null>(null);

  // Sync state.mappingStatus and progress to maps
  useEffect(() => {
    if (state.currentMapId) {
      setMaps(prev => prev.map(m => 
        m.id === state.currentMapId 
          ? { ...m, status: state.mappingStatus, progress: state.mappingStatus === 'uploading' ? uploadProgress : mappingProgress } 
          : m
      ));
    }
  }, [state.mappingStatus, uploadProgress, mappingProgress, state.currentMapId]);

  const fetchAbnormalRequests = async () => {
    try {
      const response = await fetch('/api/cloud/abnormal-requests');
      const data = await response.json();
      setAbnormalRequests(data);
    } catch (error) {
      console.error('Failed to fetch abnormal requests');
    }
  };
  const [validationStep, setValidationStep] = useState(0);
  const [isFirstBoot, setIsFirstBoot] = useState(true);
  const [lastValidationResult, setLastValidationResult] = useState<boolean | null>(null);
  const [preScanCheckStatus, setPreScanCheckStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle');
  const [showStartButton, setShowStartButton] = useState(false);
  const [preScanCountdown, setPreScanCountdown] = useState<number | null>(null);
  const [scanningPopups, setScanningPopups] = useState<ScanningPopup[]>([]);
  const [forceEndTimer, setForceEndTimer] = useState<number | null>(null);

  const addScanningPopup = (type: 'alarm' | 'warning', message: string, duration: number = 10000) => {
    setScanningPopups(prev => {
      // 同一种告警，同时只展示1个
      if (prev.some(p => p.message === message)) return prev;
      
      const id = Math.random().toString(36).substr(2, 9);
      const newPopup = { id, type, message };
      
      // 按优先级排序 (alarm > warning)
      const next = [...prev, newPopup].sort((a, b) => {
        if (a.type === 'alarm' && b.type === 'warning') return -1;
        if (a.type === 'warning' && b.type === 'alarm') return 1;
        return 0;
      });

      if (duration > 0) {
        setTimeout(() => {
          setScanningPopups(curr => curr.filter(p => p.id !== id));
        }, duration);
      }

      return next;
    });
  };
  const [wallsDetected, setWallsDetected] = useState(1);
  const [maps, setMaps] = useState<MapData[]>([
    { id: '7', name: 'DDT_07', createdAt: '2026-06-15 16:12:35', size: '1.8GB', type: 'cloud', status: 'queuing', duration: 1100, isDownloaded: false },
    { id: '6', name: 'DDT_06', createdAt: '2026-06-15 15:10:00', size: '2.4GB', type: 'cloud', status: 'uploading', progress: 65, duration: 1540, isDownloaded: false },
    { id: '5', name: 'DDT_05', createdAt: '2024-04-22 10:30:15', size: '1.5GB', type: 'cloud', status: 'mapping', progress: 45, duration: 800, mappingDuration: 450, isDownloaded: false },
    { id: '4', name: 'DDT_04', createdAt: '2024-04-20 15:20:42', size: '2.1GB', type: 'cloud', status: 'mapping_failed', progress: 30, failureReason: '云服务异常退出', duration: 900, mappingDuration: 200, isDownloaded: false },
    { id: '3', name: 'DDT_03', createdAt: '2024-04-10 16:45:09', size: '2.9GB', type: 'cloud', status: 'completed', duration: 1200, mappingDuration: 1800, isDownloaded: true },
    { id: '2', name: 'DDT_02', createdAt: '2024-04-05 14:20:55', size: '0.8GB', type: 'cloud', status: 'uploaded', duration: 450, isDownloaded: false },
    { id: '1', name: 'DDT_01', createdAt: '2024-04-01 10:30:21', size: '1.2GB', type: 'cloud', status: 'completed', duration: 600, mappingDuration: 900, isDownloaded: false },
  ]);
  const [statusFilter, setStatusFilter] = useState<string | null>('completed');
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [mapListPage, setMapListPage] = useState(1);
  const [wifiPage, setWifiPage] = useState(1);
  const [isReconstructingSemantics, setIsReconstructingSemantics] = useState(false);
  const [semanticStepText, setSemanticStepText] = useState('');
  const [showQRPrompt, setShowQRPrompt] = useState(false);
  const [showUploadExitConfirm, setShowUploadExitConfirm] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState('0 KB/s');
  const [uploadEta, setUploadEta] = useState('--:--');
  const [mappingEta, setMappingEta] = useState('--:--');
  const [queueInfo, setQueueInfo] = useState<{ position: number, total: number } | null>(null);

  // Handle Scan Initialization Stages
  useEffect(() => {
    if (view === 'scan_init' && scanInitState === 'initializing') {
      const timer = setTimeout(() => {
        setScanInitState('static_wait');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [view, scanInitState]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (view === 'scan_init' && scanInitState === 'countdown') {
      timer = setInterval(() => {
        setScanCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer!);
            const newId = Math.random().toString(36).substr(2, 9);
            const scanCount = maps.length + 1;
            const newName = `DDT_${scanCount.toString().padStart(2, '0')}`;
            const dateStr = formatDateTime(new Date());
            
            const newMap: MapData = {
              id: newId,
              name: newName,
              createdAt: dateStr,
              size: '0MB',
              type: 'cloud',
              status: 'scanning',
              duration: 0,
              progress: 0
            };

            setMaps(prevMaps => [newMap, ...prevMaps]);
            setState(prevState => ({ 
              ...prevState, 
              mappingStatus: 'scanning', 
              progress: 0, 
              scanDuration: 0,
              currentMapId: newId
            }));
            setWallsDetected(1);
            setView('scanning');
            setScanInitState('none');
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [view, scanInitState, maps.length]);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([
    { ssid: 'DDT-Office-5G', signal: 95, encryption: 'WPA2', isSaved: true, ip: '192.168.1.105', mac: '00:1A:2B:3C:4D:5E', speed: '866 Mbps', rssi: -45 },
    { ssid: 'Kilox-Guest', signal: 80, encryption: 'Open', isSaved: true },
    { ssid: 'ChinaNet-2.4G', signal: 60, encryption: 'WPA2', isSaved: false },
    { ssid: 'Starlink-778', signal: 45, encryption: 'WPA2', isSaved: false },
    { ssid: 'TP-LINK_5G_A1', signal: 30, encryption: 'WPA2', isSaved: false },
    { ssid: 'DDT-Factory-Guest', signal: 75, encryption: 'WPA2', isSaved: false },
    { ssid: 'Xiaomi-MeetingRoom', signal: 70, encryption: 'WPA2', isSaved: false },
    { ssid: 'ChinaUnicom-F3B0', signal: 55, encryption: 'WPA2', isSaved: false },
    { ssid: 'NETGEAR_79', signal: 50, encryption: 'WPA2', isSaved: false },
    { ssid: 'ASUS_ROUTER_5G', signal: 40, encryption: 'WPA2', isSaved: false },
    { ssid: 'KOS-Industrial-Node', signal: 35, encryption: 'WPA2', isSaved: true, ip: '192.168.1.189', mac: '00:1A:2B:6F:4D:9E', speed: '433 Mbps', rssi: -65 },
    { ssid: 'Tencent-FreeWiFi', signal: 20, encryption: 'Open', isSaved: false }
  ]);
  const [selectedWifi, setSelectedWifi] = useState<WifiNetwork | null>(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [isStaticIp, setIsStaticIp] = useState(false);
  const [staticConfig, setStaticConfig] = useState({
    ip: '',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8'
  });
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [preparingCountdown, setPreparingCountdown] = useState(290);
  const [linkExpiryCountdown, setLinkExpiryCountdown] = useState(86379);
  const [codeExpiryCountdown, setCodeExpiryCountdown] = useState(300);
  const [shareCode] = useState('ww7qt');
  const [availableUpdates, setAvailableUpdates] = useState<UpdatePackage[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdatePackage | null>(null);
  const [updateSearchQuery, setUpdateSearchQuery] = useState('');
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateSpeed, setUpdateSpeed] = useState('0 MB/s');
  const [updateETA, setUpdateETA] = useState('0 分钟');
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const SCAN_TIMEOUT = 1800; // 30 minutes in seconds

  useEffect(() => {
    if (view === 'boot') {
      const timer = setTimeout(() => {
        setView('wifi_setup');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'preparing_file') {
      const interval = setInterval(() => {
        setPreparingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setView('online_share');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'online_share') {
      const interval = setInterval(() => {
        setLinkExpiryCountdown(prev => Math.max(0, prev - 1));
        setCodeExpiryCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [view]);

  // Run initial self-check when entering home
  useEffect(() => {
    if (view === 'home' && !hasRunInitialCheck) {
      setHasRunInitialCheck(true);
      startSelfCheck();
    }
  }, [view, hasRunInitialCheck]);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivationSuccess, setIsActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState<{message: string, code: string} | null>(null);
  // Payment timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'payment_qr' && paymentCountdown > 0) {
      timer = setInterval(() => {
        setPaymentCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setAlert({ 
              level: 'red', 
              message: '充值失败：订单已超时自动取消，请返回重新发起。', 
              blocking: false,
              onConfirm: () => setView('recharge')
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [view, paymentCountdown]);

  const handleActivate = async () => {
    setIsVerifying(true);
    setActivationError(null);
    setIsActivationSuccess(false);
    
    try {
      // 模拟激活请求
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineCode: state.machineCode,
          activationCode: 'PROD-ACT-H22S0456' // Fixed code for the new simple flow
        })
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        // 先设为成功状态，展示成功界面
        setIsActivationSuccess(true);
        
        // 延迟加载完成后的状态更新，或者等用户点击“完成”后再进首页
        // 这里我们先更新后台状态
        setState(prev => ({ 
          ...prev, 
          isActivated: true, 
          isUserActivated: true,
          serialNumber: 'H22S0456',
          cloudQuota: data.quota,
        }));
      } else {
        setActivationError({
          code: result.code || 'UNKNOWN_ERROR',
          message: result.message || '激活失败'
        });
      }
    } catch (error) {
      setActivationError({
        code: 'NETWORK_ERROR',
        message: '网络连接不可用，请检查网络设置'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleActivationComplete = () => {
    setView('home');
    setIsActivationSuccess(false);
  };

  const copyMachineCode = () => {
    navigator.clipboard.writeText(state.machineCode);
    setAlert({ level: 'yellow', message: '机器码已复制: ' + state.machineCode, blocking: false });
  };

  // Listen for simulated device activation from mobile app
  useEffect(() => {
    const handleDeviceActivated = (e: any) => {
      const { sn, quota } = e.detail;
      if (sn === state.serialNumber) {
        setState(prev => ({ 
          ...prev, 
          isUserActivated: true, 
          cloudQuota: quota,
          warranty: {
            deviceName: 'DDT MAPPING ROBOT v3',
            sn: sn,
            activationDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          }
        }));
        setView('home');
      }
    };

    window.addEventListener('device-activated', handleDeviceActivated);
    return () => window.removeEventListener('device-activated', handleDeviceActivated);
  }, [state.serialNumber]);

  // Simulate progress and scanning anomalies
  useEffect(() => {
    let interval: any;
    if (state.mappingStatus === 'scanning') {
      interval = setInterval(() => {
        setState(prev => {
          const newDuration = prev.scanDuration + 1;
          const newBattery = prev.battery - 0.05;
          const newStorage = prev.storage - 0.01;

          // Time sync anomaly simulation (at 15s)
          /*
          if (newDuration === 15) {
            setAlert({ 
              level: 'red', 
              message: '检测到时间跳变，本次扫图结果不保存，请重新建图', 
              blocking: true,
              onConfirm: () => setView('home')
            });
          }
          */

          // Sensor anomaly simulation (at 45s)
          /*
          if (newDuration === 45) {
            setAlert({
              level: 'red',
              message: '激光雷达传感器连接断开，请检查硬件连接',
              blocking: true,
              onConfirm: () => setView('home')
            });
          }
          */

          // Resource monitoring
          if (newBattery < 5 && !forceEndTimer) {
            addScanningPopup('alarm', '电量低于 5%，尽快完成或外接充电');
            setForceEndTimer(30);
          } else if (newBattery < 30 && !scanningPopups.some(p => p.message.includes('30%'))) {
            addScanningPopup('warning', '电量低于 30%，尽快完成或外接充电');
          }

          if (forceEndTimer !== null) {
            if (state.isCharging) {
              setForceEndTimer(null);
            } else if (forceEndTimer <= 0) {
              stopScanning();
              setForceEndTimer(null);
            } else {
              setForceEndTimer(prev => (prev || 30) - 1);
            }
          }

          const availableStorage = prev.totalStorage - prev.storage;
          if (availableStorage < 1 && !scanningPopups.some(p => p.message.includes('不足1G'))) {
            addScanningPopup('warning', '存储已不足1G，请清理空间');
          }

          // Wall detection simulation
          const wallMessage = '请调整设备角度，同时扫到 3 面墙壁';
          if (wallsDetected < 3) {
            addScanningPopup('warning', wallMessage, 0); // 0 for persistent
          } else {
            setScanningPopups(prev => prev.filter(p => p.message !== wallMessage));
          }

          if (newDuration === 10) {
            setWallsDetected(3);
          }

          if (newDuration >= SCAN_TIMEOUT) {
            stopScanning();
          }

          return {
            ...prev,
            scanDuration: newDuration,
            batteryLevel: Math.max(0, newBattery),
            storage: Math.min(prev.totalStorage, prev.storage + 0.01),
            progress: Math.min((newDuration / SCAN_TIMEOUT) * 100, 100)
          };
        });
      }, 1000);
    } else if (state.mappingStatus === 'uploading' || state.mappingStatus === 'mapping' || state.mappingStatus === 'queuing') {
      interval = setInterval(() => {
        // Network drop simulation logic
        if (state.mappingStatus === 'uploading' && state.network.type === 'none') {
          if (uploadStatus !== 'disconnected') {
            setUploadStatus('disconnected');
            setNetworkRetryCountdown(30);
          }
          setNetworkRetryCountdown(prev => {
            if (prev <= 1) {
              // Not reconnecting automatically after 30s in this sim, unless network restored
              return 0;
            }
            return prev - 1;
          });
          return; // Pause progress
        } else if (state.mappingStatus === 'uploading' && state.network.type !== 'none' && uploadStatus === 'disconnected') {
          setUploadStatus('uploading');
        }

        setState(prev => {
          let nextStatus = prev.mappingStatus;
          let newProgress = prev.progress;

          if (prev.mappingStatus === 'uploading') {
            const step = 5;
            newProgress = Math.min(prev.progress + step, 100);
            setUploadProgress(newProgress);
            setUploadSpeed(`${(Math.random() * 5 + 2).toFixed(1)} MB/s`);
            setUploadEta(`${Math.ceil((100 - newProgress) / step)}s`);
            
            if (newProgress === 100) {
              setUploadStatus('completed');
              setAvgUploadSpeed('12.8 MB/s');
              // Decide if we should queue or go straight to mapping
              const shouldQueue = Math.random() > 0.5;
              if (shouldQueue) {
                nextStatus = 'queuing';
                setQueueInfo({ position: 1, total: 12 });
              } else {
                nextStatus = 'mapping';
                newProgress = 0;
                setMappingProgress(0);
              }
            }
          } else if (prev.mappingStatus === 'queuing') {
            // Simulate queue progress
            if (Math.random() > 0.8) {
              nextStatus = 'mapping';
              newProgress = 0;
              setMappingProgress(0);
            }
          } else if (prev.mappingStatus === 'mapping') {
            // Mapping progress updates every 10%
            if (Math.random() > 0.5) {
              newProgress = Math.min(prev.progress + 10, 100);
              setMappingProgress(newProgress);
              setMappingEta(`${Math.ceil((100 - newProgress) / 5)}m`); // Simplified ETA
            }
            
            // Simulate random failure
            if (newProgress > 40 && newProgress < 80 && Math.random() < 0.05) {
              nextStatus = 'mapping_failed';
              // Actually for failed mapping, we follow the requirement: 建图失败不扣除
              // Since we now deduct on SUCCESS, we just stop here.
              setAlert({ level: 'red', message: `云端建图失败：算法执行异常。本次建图未消耗时长。`, blocking: false });
              setActiveCloudTasks(curr => Math.max(0, curr - 1));
            } else if (newProgress === 100) {
              nextStatus = 'completed';
              setMappingProgress(100);
              setActiveCloudTasks(curr => Math.max(0, curr - 1));

              // Deduct on success: 3.3 Requirement
              const consumption = Math.ceil((prev.scanDuration / 60) * mappingMode.ratio);
              // Cap at 0: 3.3 Requirement
              const actualDeduction = Math.min(prev.cloudQuota, consumption);
              
              if (actualDeduction > 0) {
                const now = new Date();
                const dateStr = now.toISOString().replace('T', ' ').split('.')[0];
                const newFlow: QuotaFlow = {
                  id: Math.random().toString(36).substr(2, 9),
                  sn: prev.serialNumber,
                  type: 'consumption',
                  amount: -actualDeduction,
                  date: dateStr,
                  description: `建图成功扣除 (${mappingMode.type})`
                };
                setQuotaFlows(q => [newFlow, ...q]);
                // Update quota in state - use function update to ensure we have latest state
                return {
                  ...prev,
                  mappingStatus: nextStatus,
                  progress: 100,
                  cloudQuota: prev.cloudQuota - actualDeduction
                };
              }
            }
          }

          // Update map in list
          if (prev.currentMapId) {
            setMaps(currentMaps => currentMaps.map(m => 
              m.id === prev.currentMapId 
                ? { 
                    ...m, 
                    status: nextStatus as any, 
                    progress: newProgress,
                    area: nextStatus === 'completed' ? '1,240 m²' : m.area,
                    duration: nextStatus === 'completed' ? prev.scanDuration : m.duration
                  } 
                : m
            ));
          }

          return {
            ...prev,
            mappingStatus: nextStatus,
            progress: newProgress,
            cloudQuota: (nextStatus === 'mapping_failed' && prev.mappingStatus !== 'mapping_failed')
              ? prev.cloudQuota + Math.ceil((prev.scanDuration / 60) * mappingMode.ratio)
              : prev.cloudQuota
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.mappingStatus, alert]);

  const getShutterBrightness = (speed: string) => {
    let base = 1.0;
    switch (speed) {
      case '1/1000': base = 0.55; break;
      case '1/800': base = 0.65; break;
      case '1/640': base = 0.75; break;
      case '1/500': base = 0.85; break;
      case '1/400': base = 1.0; break;
      case '1/320': base = 1.15; break;
      case '1/250': base = 1.30; break;
      case '1/200': base = 1.50; break;
      default: base = 1.0;
    }
    // If outdoor ambient lighting is chosen, make the camera sensor ingest 1.5x brightness
    if (exposureEnvMode === 'outdoor') {
      return base * 1.45;
    }
    return base;
  };

  const startScanning = () => {
    if (preScanCheckStatus === 'passed') {
      // Start 10s countdown before actual scanning
      setPreScanCountdown(10);
      const timer = setInterval(() => {
        setPreScanCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setPreScanCountdown(null);
            
            const newId = Math.random().toString(36).substr(2, 9);
            const scanCount = maps.length + 1;
            const newName = `DDT_${scanCount.toString().padStart(2, '0')}`;
            const dateStr = formatDateTime(new Date());
            
            const newMap: MapData = {
              id: newId,
              name: newName,
              createdAt: dateStr,
              size: '0MB',
              type: 'cloud',
              status: 'scanning',
              duration: 0,
              progress: 0
            };

            setMaps(prevMaps => [newMap, ...prevMaps]);
            setState(prevState => ({ 
              ...prevState, 
              mappingStatus: 'scanning', 
              progress: 0, 
              scanDuration: 0,
              currentMapId: newId
            }));
            setWallsDetected(1);
            setView('scanning');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setView('pre_scan_check');
      runPreScanValidation();
    }
  };

  const runPreScanValidation = () => {
    setPreScanCheckStatus('checking');
    setValidationStep(0);
    setShowStartButton(false);
    
    const steps = [
      { id: 1, name: '激光雷达状态', check: () => state.sensors.lidar ? 'normal' : 'critical' },
      { id: 2, name: 'IMU状态', check: () => state.sensors.imu ? 'normal' : 'critical' },
      { id: 3, name: '摄像头状态', check: () => state.sensors.camera ? 'normal' : 'critical' },
      { id: 4, name: 'RTK状态', check: () => state.sensors.rtk ? 'normal' : 'warning' },
      { id: 5, name: '剩余存储空间', check: () => (state.totalStorage - state.storage) > 5 ? 'normal' : 'warning' },
      { id: 6, name: '剩余电量', check: () => state.batteryLevel > 50 ? 'normal' : 'warning' }
    ];

    let current = 0;
    let hasCritical = false;
    let hasWarning = false;

    const runNext = () => {
      if (current < steps.length) {
        const step = steps[current];
        const result = step.check();
        
        if (result === 'critical') hasCritical = true;
        if (result === 'warning') hasWarning = true;

        setValidationStep(current + 1);
        current++;
        
        if (hasCritical) {
          setPreScanCheckStatus('failed');
          return;
        }
        
        setTimeout(runNext, 800);
      } else {
        setPreScanCheckStatus('passed');
        setLastValidationResult(!hasWarning);
        setTimeout(() => setShowStartButton(true), 1000);
      }
    };

    setTimeout(runNext, 1000);
  };

  const [mappingMode, setMappingMode] = useState<{type: 'professional' | 'quick-ply' | 'quick-las', ratio: number}>({type: 'professional', ratio: 12});

  const stopScanning = () => {
    setView('saving');
    setTimeout(() => {
      setState(prev => {
        if (prev.currentMapId) {
          setMaps(currentMaps => currentMaps.map(m => 
            m.id === prev.currentMapId ? { 
              ...m, 
              status: 'scanned', 
              size: '450MB',
              duration: prev.scanDuration,
              area: '计算中...'
            } : m
          ));
        }
        return { ...prev, mappingStatus: 'scanned' };
      });
      // Show cloud options page for the user to select reconstructed options and mapping mode
      setView('cloud_options');
      setAlert(null);
    }, 2000);
  };

  const handleCloudInit = (mode: 'professional' | 'quick-ply' | 'quick-las', ratio: number) => {
    if (state.network.type === 'none') {
      setAlert({ 
        level: 'red', 
        message: '请连接到互联网后，再开始云端建图', 
        blocking: false,
        onConfirm: () => setView('network_settings')
      });
      return;
    }

    if (activeCloudTasks >= 2) {
      setAlert({ level: 'yellow', message: '你已有2个建图任务，请等待前面任务完成后，再启动新的建图任务', blocking: false });
      return;
    }

    setMappingMode({ type: mode, ratio });
    setActiveCloudTasks(prev => prev + 1);
    startMapping('cloud', ratio);
  };

  const startReconstructSemantics = (mapId: string) => {
    setIsReconstructingSemantics(true);
    setSemanticStepText('正在下载关联的云端激光元数据点云包...');
    
    setTimeout(() => {
      setSemanticStepText('分析三维场景：提取墙体、物理隔断及核心语义掩膜...');
    }, 850);

    setTimeout(() => {
      setSemanticStepText('执行高维姿态解算：检测走廊连通域与走道障碍拓扑...');
    }, 1700);

    setTimeout(() => {
      setSemanticStepText('写入高精 DDT Studio 语义特征包，保存属性...');
    }, 2500);

    setTimeout(() => {
      setMaps(currentMaps => {
        const nextMaps = currentMaps.map(m => 
          m.id === mapId ? { ...m, hasSemantics: true } : m
        );
        const updatedMap = nextMaps.find(m => m.id === mapId);
        if (updatedMap) {
          setSelectedMap(updatedMap);
        }
        return nextMaps;
      });
      setIsReconstructingSemantics(false);
      setAlert({ level: 'green', message: '高精地图语义重建已全部完成！', blocking: false });
    }, 3300);
  };

  const startMapping = (type: 'local' | 'cloud', ratio: number = 12) => {
    const currentId = state.currentMapId;
    if (currentId) {
      setMaps(currentMaps => {
        const nextMaps = currentMaps.map(m => 
          m.id === currentId ? { ...m, status: 'uploading', progress: 0 } : m
        );
        const curMap = nextMaps.find(m => m.id === currentId);
        if (curMap) {
          setSelectedMap(curMap);
        }
        return nextMaps;
      });
    }

    setState(prev => ({ 
      ...prev, 
      mappingStatus: 'uploading',
      progress: 0
    }));
    setUploadProgress(0);
    setMappingProgress(0);
    setUploadStatus('uploading');
    setUploadSpeed('1.2 MB/s');
    setUploadEta('2分15秒');
    setMappingEta('15分30秒');
    setQueueInfo(null);
    setView('map_details');
  };

  const retryOperation = (mapId: string, type: 'upload' | 'mapping') => {
    setState(prev => ({
      ...prev,
      currentMapId: mapId,
      mappingStatus: type === 'upload' ? 'uploading' : 'mapping',
      progress: 0
    }));
    setMaps(currentMaps => {
      const nextMaps = currentMaps.map(m => 
        m.id === mapId ? { ...m, status: type === 'upload' ? 'uploading' : 'mapping', progress: 0 } : m
      );
      const curMap = nextMaps.find(m => m.id === mapId);
      if (curMap) {
        setSelectedMap(curMap);
      }
      return nextMaps;
    });
    setUploadProgress(0);
    setMappingProgress(0);
    setUploadStatus(type === 'upload' ? 'uploading' : 'completed');
    setUploadSpeed('1.2 MB/s');
    setUploadEta('2分15秒');
    setMappingEta('15分30秒');
    setQueueInfo(null);
    setView('map_details');
  };

  const handleRecharge = () => {
    if (!selectedPackage) return;
    
    const totalMinutes = selectedPackage.duration * rechargeQuantity;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').split('.')[0];
    
    const newFlow: QuotaFlow = {
      id: Math.random().toString(36).substr(2, 9),
      sn: state.serialNumber,
      type: 'recharge',
      amount: totalMinutes,
      date: dateStr,
      description: `扫码充值 (+${totalMinutes} 分钟)`
    };

    setQuotaFlows(prev => [newFlow, ...prev]);
    setState(prev => ({ 
      ...prev, 
      cloudQuota: prev.cloudQuota + totalMinutes
    }));
    
    setView('quota_flow');
    setAlert({ level: 'green', message: `充值成功: +${totalMinutes}分钟`, blocking: false });
    setSelectedPackage(null);
    setPaymentMethod(null);
    setRechargeQuantity(1);
  };

  const pollPaymentStatus = () => {
    setIsPollingPayment(true);
    setTimeout(() => {
      setIsPollingPayment(false);
      handleRecharge();
    }, 2000);
  };

  const handleAboutClick = () => {
    if (state.isDeveloperMode) return;
    const newCount = aboutClickCount + 1;
    setAboutClickCount(newCount);
    if (newCount >= 7) {
      setState(prev => ({ ...prev, isDeveloperMode: true }));
      setAlert({ level: 'yellow', message: '开发者模式已开启：Web端口已开放 (Port: 8080)', blocking: false });
    }
  };

  const disableDeveloperMode = () => {
    setState(prev => ({ ...prev, isDeveloperMode: false }));
    setAboutClickCount(0);
    setAlert({ level: 'yellow', message: '开发者模式已关闭', blocking: false });
  };

  const startSelfCheck = () => {
    setSelfCheckStatus('checking');
    setSelfCheckStep(0);
    const steps = [
      '激光雷达正常',
      'IMU正常',
      '摄像头正常',
      'RTK正常',
      '存储空间正常',
      '电池电量正常'
    ];
    
    steps.forEach((msg, index) => {
      setTimeout(() => {
        setSelfCheckStep(index + 1);
        setSelfCheckProgress(msg);
        if (index === steps.length - 1) {
          // Final check result based on current state
          const isAbnormal = state.battery < 50 || state.storage < 5;
          setSelfCheckStatus(isAbnormal ? 'abnormal' : 'normal');
        }
      }, (index + 1) * 800);
    });
  };

  const connectToWifi = (network: WifiNetwork, password?: string) => {
    setConnectionStatus('connecting');
    setSelectedWifi(network);
    
    setTimeout(() => {
      // Simulate connection success
      setConnectionStatus('connected');
      setState(prev => ({
        ...prev,
        network: {
          ...prev.network,
          type: 'wifi',
          connectedSsid: network.ssid
        }
      }));
      setWifiNetworks(prev => prev.map(n => 
        n.ssid === network.ssid ? { ...n, isSaved: true, ip: '192.168.1.105', mac: '00:1A:2B:3C:4D:5E', speed: '866 Mbps', rssi: -45 } : n
      ));
      setTimeout(() => {
        setConnectionStatus('idle');
        setView('wifi_settings');
      }, 1000);
    }, 2000);
  };

  const handleFactoryReset = () => {
    setShowResetConfirm(false);
    setIsResetting(true);
    
    // Simulate reset process (e.g. wiping storage, clearing caches)
    setTimeout(() => {
      // Wipe user data
      setMaps([]);
      setMappingHistory([]);
      setQuotaFlows([]);
      setWifiNetworks(prev => prev.map(nw => ({ ...nw, isSaved: false, ip: undefined, mac: undefined })));
      
      // Reset state settings
      setState(prev => ({
        ...prev,
        storage: 0,
        network: {
          ...prev.network,
          connectedSsid: undefined,
        },
        // We keep isActivated: true as per requirements
        cloudQuota: 0,
        isUserActivated: false,
      }));

      // Simulate reboot delay
      setTimeout(() => {
        setIsResetting(false);
        setView('wifi_setup');
      }, 2000);
    }, 3000);
  };

  const handleFormat = () => {
    // Formatting will permanently delete all data, including un-uploaded mapping data.
    // However, mapping, success, and failed projects remain visible until deleted from detail page.
    setMaps(prev => prev.filter(map => 
      ['mapping', 'completed', 'mapping_failed', 'upload_failed', 'uploaded'].includes(map.status)
    ));
    setState(prev => ({ ...prev, storage: 0 }));
    setShowFormatConfirm(false);
    setAlert({ level: 'yellow', message: '存储空间已格式化', blocking: false });
  };

  const checkUpdates = () => {
    if (state.network.type === 'none') {
      setAlert({ level: 'red', message: '网络未连接，无法检查更新', blocking: false });
      return;
    }
    setIsCheckingUpdates(true);
    setAvailableUpdates([]);
    
    // Simulate API call to KOS
    setTimeout(() => {
      const allPackages: UpdatePackage[] = [
        { version: '5.14.6', size: '120 MB', description: '修复了已知传感器同步问题，优化了RTK收敛速度。', items: 2 },
        { version: '5.15.12', size: '850 MB', description: '重大功能更新：支持多楼层自动拼接，提升建图精度。', items: 5 },
        { version: '5.16.2', size: '1.2 GB', description: '全新算法镜像，支持动态避障预览。', items: 8 },
      ];
      
      // Filter logic:
      // 1. Higher than current version
      // 2. For each major.minor, only latest release
      const filtered = allPackages.filter(pkg => {
        const [pMaj, pMin, pPat] = pkg.version.split('.').map(Number);
        const [cMaj, cMin, cPat] = state.version.split('.').map(Number);
        
        if (pMaj > cMaj) return true;
        if (pMaj === cMaj && pMin > cMin) return true;
        if (pMaj === cMaj && pMin === cMin && pPat > cPat) return true;
        return false;
      });

      setAvailableUpdates(filtered);
      setIsCheckingUpdates(false);
    }, 1500);
  };

  const startUpdate = (pkg: UpdatePackage) => {
    setSelectedUpdate(pkg);
    setView('updating');
    setUpdateProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUpdateProgress(100);
        setTimeout(() => {
          setShowRestartConfirm(true);
        }, 500);
      } else {
        setUpdateProgress(progress);
        setUpdateSpeed(`${(Math.random() * 5 + 2).toFixed(1)} MB/s`);
        setUpdateETA(`${Math.ceil((100 - progress) / 3)} 分钟`);
      }
    }, 1000);
  };

  const handleRestart = () => {
    if (selectedUpdate) {
      setState(prev => ({ ...prev, version: selectedUpdate.version }));
    }
    setShowRestartConfirm(false);
    setAlert({ level: 'yellow', message: '系统已重启并应用更新', blocking: false });
    setView('home');
  };

  const selectDownloadFileType = (type: 'ddt' | 'ply' | 'las') => {
    setDownloadFileType(type);
    setView('map_details');
    handleDownload();
  };

  const handleDownload = () => {
    if (!selectedMap) return;
    setIsDownloading(true);
    setDownloadError(false);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setMaps(prevMaps => prevMaps.map(m => 
            m.id === selectedMap.id ? { ...m, isDownloaded: true } : m
          ));
          setSelectedMap(prev => prev ? { ...prev, isDownloaded: true } : null);
          setAlert({ level: 'green', message: '地图下载完成', blocking: false });
          return 100;
        }
        // 模拟随机失败
        if (prev > 40 && prev < 50 && Math.random() < 0.05) {
          clearInterval(interval);
          setIsDownloading(false);
          setDownloadError(true);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleRemap = (map: MapData) => {
    const isFirstTime = map.status === 'uploaded' || map.status === 'scanned';
    const cost = Math.ceil((map.duration || 0) / 60) * mappingMode.ratio;
    
    if (state.cloudQuota < cost) {
      setAlert({ 
        level: 'red', 
        message: `云端配额不足。本次建图预计消耗 ${cost} 分钟，当前剩余 ${Math.floor(state.cloudQuota/60)}h ${state.cloudQuota%60}m。`, 
        blocking: false 
      });
      return;
    }

    setAlert({
      level: 'yellow',
      message: isFirstTime 
        ? `确认开始云端建图？将消耗 ${cost} 分钟配额。` 
        : `确认重新开始云端建图？将再次消耗 ${cost} 分钟配额。`,
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          cloudQuota: prev.cloudQuota - cost,
          mappingStatus: 'queuing',
          progress: 0,
          currentMapId: map.id
        }));

        setMaps(prev => prev.map(m => 
          m.id === map.id ? { ...m, status: 'queuing', progress: 0 } : m
        ));

        // Create transaction flow record
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').split('.')[0];
        const newFlow: QuotaFlow = {
          id: Math.random().toString(36).substr(2, 9),
          sn: state.serialNumber,
          type: 'pre_deduction',
          amount: -cost,
          date: dateStr,
          description: isFirstTime ? `启动建图预扣除` : `重新建图扣除`,
          mappingName: map.name
        };
        setQuotaFlows(q => [newFlow, ...q]);

        setUploadStatus('completed');
        setMappingProgress(0);
        setQueueInfo({ position: 2, total: 5 });
        setView('map_details');
      }
    });
  };

  const handleShare = () => {
    if (!selectedMap) return;
    if (state.network.type === 'none') {
      setAlert({ level: 'red', message: '请先连接网络', blocking: false });
      return;
    }
    setShareMethod('online');
    setView('share_file_type');
  };

  const selectShareMethod = (method: 'local' | 'online') => {
    setShareMethod(method);
    setView('share_file_type');
  };

  const selectShareFileType = (type: 'ddt' | 'ply' | 'las') => {
    setShareFileType(type);
    if (shareMethod === 'local') {
      // Local share check for download
      // Private format 'ddt' might not need prior manual download if it's internal
      // but 'ply' and 'las' usually do.
      // Based on PRD: ddt: 私有格式... ply: 行业通用... las: 行业存储...
      const isDownloaded = selectedMap?.isDownloaded; 
      // For this demo, let's assume 'ply' requires isDownloaded: true
      if (type === 'ddt' || isDownloaded) {
        setView('local_share');
        // Simulate connection
        setTimeout(() => {
          setShareSource({ browser: 'Chrome(Windows)', ip: '192.168.98.54' });
        }, 3000);
      } else {
        setAlert({ 
          level: 'yellow', 
          message: `本地分享需要先将项目下载至设备`, 
          blocking: false,
          onConfirm: () => { handleDownload(); }
        });
      }
    } else {
      if (type === 'ddt') {
        setView('online_share');
      } else {
        setPreparingCountdown(290);
        setView('preparing_file');
      }
    }
  };
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        isUserActivated: true,
        cloudQuota: 1000 // Give default quota even if skipped for demo purposes
      }));
      setView('home');
      setAlert({ level: 'yellow', message: '已跳过激活过程', blocking: false });
    }, 2000); // 2 seconds long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const StatusHeader = () => {
    const getRTKColor = (status: RTKStatus) => {
      switch (status) {
        case 'FIXED': return 'text-green-400';
        case 'FLOAT': return 'text-yellow-400';
        case 'SINGLE': return 'text-red-400';
        default: return 'text-white/20';
      }
    };

    const getWifiBars = (signal: number) => {
      const bars = Math.ceil(signal / 25);
      return (
        <div className="flex gap-0.5 items-end h-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`w-1 rounded-t-sm ${i <= bars ? 'bg-blue-400' : 'bg-white/10'}`} 
              style={{ height: `${i * 25}%` }}
            />
          ))}
        </div>
      );
    };

    return (
      <div className="flex justify-between items-center px-6 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {state.network.wiredConnected && <Monitor size={20} className="text-blue-400" />}
            {state.network.type === 'wifi' && state.network.connectedSsid && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/60">{state.network.connectedSsid}</span>
                {getWifiBars(wifiNetworks.find(n => n.ssid === state.network.connectedSsid)?.signal || 0)}
              </div>
            )}
            {state.network.type === 'cellular' && <Signal size={20} className="text-blue-400" />}
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className={`text-xs font-black ${getRTKColor(state.rtkStatus)}`}>RTK</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {state.rtkStatus === 'FIXED' ? '固定解' : state.rtkStatus === 'FLOAT' ? '浮点解' : '单点解'}
            </span>
          </div>

          {state.isDeveloperMode && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold animate-pulse">
              DEV MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/80">{Math.round(state.battery)}%</span>
          <Battery size={24} className={state.battery < 20 ? 'text-red-500' : 'text-green-400'} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-[720px] h-[720px] bg-slate-900 text-white overflow-hidden relative font-sans select-none">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <StatusHeader />

      <div className="p-8 h-[calc(100%-64px)] flex flex-col">
        <AnimatePresence mode="wait">
          {view === 'boot' && (
            <motion.div 
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black flex items-center justify-center z-[200]"
            >
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ 
                    duration: 2.5, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="flex flex-col items-center"
                >
                  <span className="text-[180px] font-black text-white tracking-widest leading-none select-none" style={{ fontFamily: 'serif' }}>
                    DDT
                  </span>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 240 }}
                    transition={{ duration: 1.5, delay: 2 }}
                    className="h-1 bg-white/30 rounded-full mt-4"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {view === 'wifi_setup' && (
            <motion.div 
              key="wifi_setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center gap-10"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wifi size={48} className="text-blue-400" />
                </div>
                <h2 className="text-4xl font-black">连接 Wi-Fi</h2>
                <p className="text-white/40 text-lg">首次开机，请先连接网络以激活设备</p>
              </div>

              <div className="w-full max-w-md space-y-4">
                {['DDT-Office-5G', 'Kilox-Guest', 'ChinaNet-2.4G'].map((ssid) => (
                  <button 
                    key={ssid}
                    onClick={() => {
                      setState(prev => ({ ...prev, network: 'wifi' }));
                      if (!state.isActivated) {
                        setView('activation');
                      } else if (!state.isUserActivated) {
                        setView('user_activation');
                      } else {
                        setView('home');
                      }
                    }}
                    className="w-full h-20 bg-slate-800/50 border border-white/10 rounded-2xl px-8 flex items-center justify-between hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <Wifi size={24} className="text-white/60" />
                      <span className="text-xl font-bold">{ssid}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-1 h-4 rounded-full ${i <= 3 ? 'bg-blue-400' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'activation' && (
            <motion.div 
              key="activation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-12 p-12"
            >
              <AnimatePresence mode="wait">
                {isActivationSuccess ? (
                  <motion.div 
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20">
                      <CheckCircle2 size={48} className="text-white" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black">激活成功</h2>
                      <p className="text-white/40 text-lg">设备已成功激活并绑定权益</p>
                    </div>
                    <button 
                      onClick={handleActivationComplete}
                      className="w-full max-w-xs h-20 bg-blue-600 hover:bg-blue-500 rounded-2xl text-2xl font-black shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                      完成
                    </button>
                  </motion.div>
                ) : activationError ? (
                  <motion.div 
                    key="failure"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertCircle size={48} className="text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black">激活失败</h2>
                      <p className="text-red-400/80 text-lg max-w-md">
                        原因：{activationError.message} (SN: {state.serialNumber})
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                      <button 
                        onClick={() => {
                          setActivationError(null);
                          handleActivate();
                        }}
                        className="h-20 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xl font-black transition-all active:scale-95"
                      >
                        重试激活
                      </button>
                      <button 
                        onClick={() => setView('wifi_setup')}
                        className="text-white/40 font-bold hover:text-white transition-colors"
                      >
                        返回上一步
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center space-y-10"
                  >
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black tracking-tight">激活DDT建图设备</h2>
                      <div className="inline-flex px-4 py-2 bg-slate-900 border border-white/5 rounded-full">
                        <span className="text-white/40 text-sm font-bold uppercase tracking-widest">序列号：{state.serialNumber}</span>
                      </div>
                    </div>

                    <div className="max-w-md p-8 bg-slate-900/50 rounded-3xl border border-white/5 space-y-4">
                      <p className="text-white/60 leading-relaxed">
                        点击激活即代表同意产品使用条款并授权设备硬件信息、账号信息、绑定云端权益。
                      </p>
                    </div>

                    <button 
                      disabled={isVerifying}
                      onClick={handleActivate}
                      className={`w-full max-w-md h-24 rounded-[32px] text-3xl font-black transition-all active:scale-95 flex items-center justify-center gap-4 ${
                        isVerifying 
                        ? 'bg-slate-800 text-white/40 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/40'
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 size={32} className="animate-spin" />
                          激活中...
                        </>
                      ) : (
                        '同意'
                      )}
                    </button>

                    <div className="flex items-center gap-6 text-white/10">
                      <div 
                        onClick={() => {
                          setView('cloud_admin');
                          fetchAbnormalRequests();
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:text-blue-400/40 transition-colors"
                      >
                        <Cloud size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">云端建图管理</span>
                      </div>
                      <div className="w-1 h-1 bg-white/5 rounded-full" />
                      <div className="flex items-center gap-2">
                        <Info size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">机器码: {state.machineCode}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}


          {view === 'user_activation' && (
            <motion.div 
              key="user_activation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex gap-12 items-center"
            >
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tight">欢迎使用</h2>
                  <p className="text-2xl text-white/60 leading-relaxed">
                    为了保障您的权益，请先完成设备绑定。
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-blue-400">
                    <CheckCircle2 size={24} />
                    <span className="text-xl font-bold">激活即享 1000 分钟云端建图配额</span>
                  </div>
                  <div className="flex items-center gap-4 text-blue-400">
                    <CheckCircle2 size={24} />
                    <span className="text-xl font-bold">开启全国联保与在线技术支持</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <div className="text-xs text-white/20 font-bold uppercase tracking-widest mb-2">设备序列号</div>
                  <div className="text-2xl font-mono font-bold text-white/40">{state.serialNumber}</div>
                </div>
              </div>

              <div 
                onMouseDown={handleLongPressStart}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={handleLongPressStart}
                onTouchEnd={handleLongPressEnd}
                className="w-80 h-80 bg-white p-8 rounded-[40px] shadow-2xl shadow-blue-600/20 relative group cursor-pointer active:scale-95 transition-transform"
              >
                <QrCode size={256} className="text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">请扫码绑定</div>
                </div>
                <div className="absolute -bottom-12 left-0 right-0 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                  长按二维码跳过激活
                </div>
              </div>
            </motion.div>
          )}

          {view === 'network_settings' && (
            <motion.div 
              key="network_settings"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">网络设置</h2>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setView('wifi_settings')}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-3xl p-6 flex items-center justify-between hover:bg-slate-700 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Wifi size={32} className="text-blue-400" />
                    </div>
                    <div className="text-left font-sans">
                      <div className="text-xl font-bold">Wi-Fi 设置</div>
                      <div className="text-sm text-white/40">{state.network.connectedSsid || '未连接'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${state.network.wifiEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {state.network.wifiEnabled ? '启用' : '停用'}
                    </div>
                    <ChevronRight size={24} className="text-white/20" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'wifi_settings' && (
            <motion.div 
              key="wifi_settings"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('network_settings')} className="p-2 hover:bg-white/10 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black">Wi-Fi 设置</h2>
                </div>
                <button 
                  onClick={() => setState(prev => ({ ...prev, network: { ...prev.network, wifiEnabled: !prev.network.wifiEnabled } }))}
                  className={`w-16 h-8 rounded-full relative transition-colors ${state.network.wifiEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <motion.div 
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                    animate={{ x: state.network.wifiEnabled ? 32 : 0 }}
                  />
                </button>
              </div>

              {state.network.wifiEnabled && (() => {
                const sortedWifiList = [...wifiNetworks].sort((a, b) => {
                  const isConnectedA = state.network.connectedSsid === a.ssid;
                  const isConnectedB = state.network.connectedSsid === b.ssid;
                  if (isConnectedA && !isConnectedB) return -1;
                  if (!isConnectedA && isConnectedB) return 1;
                  
                  if (a.isSaved && !b.isSaved) return -1;
                  if (!a.isSaved && b.isSaved) return 1;
                  
                  return b.signal - a.signal;
                });

                const WIFI_PER_PAGE = 3;
                const totalWifiPages = Math.ceil(sortedWifiList.length / WIFI_PER_PAGE);
                const currentWifiPage = Math.min(wifiPage, totalWifiPages || 1);
                const paginatedWifiList = sortedWifiList.slice((currentWifiPage - 1) * WIFI_PER_PAGE, currentWifiPage * WIFI_PER_PAGE);

                return (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden gap-4">
                    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                      {paginatedWifiList.map(network => {
                        const isConnected = state.network.connectedSsid === network.ssid;
                        return (
                          <button 
                            key={network.ssid}
                            onClick={() => {
                              setSelectedWifi(network);
                              setView('wifi_config');
                            }}
                            className={`w-full border rounded-2xl p-5 flex flex-col gap-3 transition-all text-left group cursor-pointer ${
                              isConnected 
                                ? 'bg-blue-600/10 border-blue-500/30' 
                                : network.isSaved 
                                  ? 'bg-slate-800/40 border-white/10 hover:bg-slate-700/50' 
                                  : 'bg-slate-800/20 border-white/5 hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Wifi size={22} className={isConnected ? 'text-blue-400 font-bold' : network.isSaved ? 'text-teal-400' : 'text-white/40'} />
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold flex items-center gap-2 font-sans">
                                    {network.ssid}
                                    {network.isSaved && !isConnected && (
                                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 border border-teal-500/25 uppercase tracking-widest font-sans">已保存</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isConnected ? (
                                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/15 border border-blue-500/25 rounded px-1.5 py-0.5 font-sans">已连接</span>
                                ) : (
                                  <>
                                    {network.encryption === 'WPA2' ? <Lock size={14} className="text-white/20" /> : <Unlock size={14} className="text-white/20" />}
                                    <div className="flex gap-0.5 items-end h-3.5">
                                      {[1, 2, 3, 4].map(i => (
                                        <div 
                                          key={i} 
                                          className={`w-0.5 rounded-t-sm ${i <= Math.ceil(network.signal / 25) ? 'bg-white/40' : 'bg-white/5'}`} 
                                          style={{ height: `${i * 25}%` }}
                                        />
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {isConnected && (
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-white/60 pt-2 border-t border-white/5 mt-1 font-mono">
                                <div className="flex justify-between"><span className="text-white/30 font-sans">IP 地址</span><span>{network.ip}</span></div>
                                <div className="flex justify-between"><span className="text-white/30 font-sans">MAC 地址</span><span className="text-[9px]">{network.mac}</span></div>
                                <div className="flex justify-between"><span className="text-white/30 font-sans">传输速率</span><span>{network.speed}</span></div>
                                <div className="flex justify-between"><span className="text-white/30 font-sans">信号强度</span><span>{network.rssi} dBm</span></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Wi-Fi Pagination block */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between shrink-0">
                      <button
                        disabled={currentWifiPage <= 1}
                        onClick={() => setWifiPage(prev => Math.max(prev - 1, 1))}
                        className="px-4 h-9 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white text-xs font-bold rounded-xl transition-all disabled:pointer-events-none active:scale-95"
                      >
                        上一页
                      </button>
                      <span className="text-white/40 font-black text-xs uppercase tracking-widest font-mono">
                        页码 {currentWifiPage} / {totalWifiPages || 1}
                      </span>
                      <button
                        disabled={currentWifiPage >= totalWifiPages}
                        onClick={() => setWifiPage(prev => Math.min(prev + 1, totalWifiPages))}
                        className="px-4 h-9 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white text-xs font-bold rounded-xl transition-all disabled:pointer-events-none active:scale-95"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {view === 'wifi_config' && selectedWifi && (
            <motion.div 
              key="wifi_config"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('wifi_settings')} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">{selectedWifi.ssid}</h2>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {(!selectedWifi.isSaved || connectionStatus === 'connecting') && (
                  <div className="space-y-4">
                    <div className="text-xs font-black text-white/20 uppercase tracking-widest px-2">身份验证</div>
                    {selectedWifi.encryption === 'WPA2' && (
                      <input 
                        type="password"
                        placeholder="请输入密码"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl px-6 text-xl outline-none focus:border-blue-500 transition-all"
                      />
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="text-xs font-black text-white/20 uppercase tracking-widest">IP 设置</div>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                      <button 
                        onClick={() => setIsStaticIp(false)}
                        className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${!isStaticIp ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                      >
                        DHCP
                      </button>
                      <button 
                        onClick={() => setIsStaticIp(true)}
                        className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${isStaticIp ? 'bg-blue-600 text-white' : 'text-white/40'}`}
                      >
                        静态 IP
                      </button>
                    </div>
                  </div>

                  {isStaticIp && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/20 font-bold uppercase ml-2">IP 地址</label>
                        <input 
                          type="text"
                          value={staticConfig.ip}
                          onChange={(e) => setStaticConfig({ ...staticConfig, ip: e.target.value })}
                          placeholder="192.168.1.100"
                          className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/20 font-bold uppercase ml-2">子网掩码</label>
                        <input 
                          type="text"
                          value={staticConfig.subnetMask}
                          onChange={(e) => setStaticConfig({ ...staticConfig, subnetMask: e.target.value })}
                          className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/20 font-bold uppercase ml-2">网关</label>
                        <input 
                          type="text"
                          value={staticConfig.gateway}
                          onChange={(e) => setStaticConfig({ ...staticConfig, gateway: e.target.value })}
                          className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/20 font-bold uppercase ml-2">DNS 服务器</label>
                        <input 
                          type="text"
                          value={staticConfig.dns}
                          onChange={(e) => setStaticConfig({ ...staticConfig, dns: e.target.value })}
                          className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {selectedWifi.isSaved && isStaticIp && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex gap-4 text-amber-400">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-xs leading-relaxed">
                      修改后，将关闭专属网络，需重启路由器生效，请等待150秒后查看。
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => connectToWifi(selectedWifi, wifiPassword)}
                  disabled={connectionStatus === 'connecting'}
                  className={`w-full h-20 rounded-3xl text-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                    connectionStatus === 'connecting' ? 'bg-slate-700 text-white/40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  }`}
                >
                  {connectionStatus === 'connecting' ? (
                    <>
                      <RefreshCw size={24} className="animate-spin" />
                      正在连接...
                    </>
                  ) : connectionStatus === 'connected' ? (
                    <>
                      <CheckCircle2 size={24} />
                      已连接
                    </>
                  ) : (
                    selectedWifi.isSaved ? '保存并连接' : '连接'
                  )}
                </button>
              </div>
            </motion.div>
          )}
          {view === 'update_check' && (
            <motion.div 
              key="update_check"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('about')} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">检查更新</h2>
              </div>

              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="搜索版本号..."
                    value={updateSearchQuery}
                    onChange={(e) => setUpdateSearchQuery(e.target.value)}
                    className="w-full h-14 bg-slate-800 border border-white/10 rounded-2xl px-6 text-lg outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {isCheckingUpdates ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                      <RefreshCw size={48} className="text-blue-400 animate-spin" />
                      <span className="text-white/40 font-bold">正在检查更新中...</span>
                    </div>
                  ) : availableUpdates.length > 0 ? (
                    availableUpdates
                      .filter(pkg => pkg.version.includes(updateSearchQuery))
                      .map(pkg => (
                        <div 
                          key={pkg.version}
                          className="bg-slate-800/50 border border-white/10 rounded-3xl p-6 space-y-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-2xl font-black font-mono">{pkg.version}</div>
                              <div className="text-sm text-white/40 mt-1">文件大小: {pkg.size}</div>
                            </div>
                            <button 
                              onClick={() => startUpdate(pkg)}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all active:scale-95"
                            >
                              现在更新
                            </button>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed bg-black/20 p-4 rounded-xl">
                            {pkg.description}
                          </p>
                        </div>
                      ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
                      <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} className="text-green-400" />
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-black">已是最新版本</div>
                        <div className="text-white/40 font-mono">{state.version}</div>
                      </div>
                      <p className="text-sm text-white/20 max-w-xs text-center">
                        当前系统已是最新版本，无需更新。我们将持续为您提供更好的服务。
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={checkUpdates}
                  disabled={isCheckingUpdates}
                  className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  检查更新
                </button>
              </div>
            </motion.div>
          )}

          {view === 'updating' && selectedUpdate && (
            <motion.div 
              key="updating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-12"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <RefreshCw size={48} className="text-blue-400 animate-spin" />
                </div>
                <h2 className="text-4xl font-black">正在安装更新</h2>
                <p className="text-white/40 text-xl">正在安装 {selectedUpdate.items} 项更新内容...</p>
              </div>

              <div className="w-full max-w-md space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                    <span className="text-white/40">总进度</span>
                    <span className="text-blue-400">{Math.round(updateProgress)}%</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${updateProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-white/20 text-[10px] font-bold uppercase mb-1">实时速度</div>
                    <div className="text-xl font-mono font-bold text-blue-400">{updateSpeed}</div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-white/20 text-[10px] font-bold uppercase mb-1">预计剩余</div>
                    <div className="text-xl font-mono font-bold text-green-400">{updateETA}</div>
                  </div>
                </div>
              </div>

              <div className="text-white/20 text-sm italic">
                更新过程中请勿关闭电源或断开网络连接
              </div>
            </motion.div>
          )}

          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-5">
                {/* Cell 1: 开始扫图 (Large core button spanning left column) */}
                <button 
                  onClick={startScanning}
                  className="row-span-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 rounded-[32px] flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer group shadow-lg shadow-blue-500/10 p-6"
                >
                  <div className="text-center w-full flex flex-col items-center justify-center">
                    <div className="text-[76px] font-black text-white tracking-widest leading-none whitespace-nowrap">
                      开始
                    </div>
                    <div className="text-[76px] font-black text-blue-400 tracking-widest leading-none mt-4 whitespace-nowrap">
                      扫图
                    </div>
                  </div>
                </button>

                {/* Cell 2: 最近项目 (Custom styled button routing to list view) */}
                <button 
                  onClick={() => { setView('map_list'); setMapListPage(1); }}
                  className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer text-center group"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-[60px] font-black text-teal-400 tracking-wider whitespace-nowrap">
                      最近项目
                    </div>
                    <div className="text-3xl px-4 py-1 rounded-full bg-teal-500/20 text-teal-300 font-black font-mono inline-block">
                      {maps.filter(m => m.status === 'completed').length}/{maps.length}
                    </div>
                  </div>
                </button>

                {/* Cell 3: 建图时长 */}
                <button 
                  onClick={() => setView('quota_flow')}
                  className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer text-center group"
                >
                  <div className="text-[60px] font-black text-blue-400 tracking-wider whitespace-nowrap">
                    建图时长
                  </div>
                  <div className="text-2xl font-bold text-white/50 mt-2">
                    剩余 {state.cloudQuota} 分钟
                  </div>
                </button>

                {/* Cell 4: 网络设置 */}
                <button 
                  onClick={() => setView('network_settings')}
                  className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer text-center group animate-fade-in animate-duration-300"
                >
                  <div className="text-[60px] font-black text-purple-400 tracking-wider whitespace-nowrap">
                    网络设置
                  </div>
                </button>

                {/* Cell 5: 关于本机 */}
                <button 
                  onClick={() => setView('about')}
                  className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all active:scale-[0.98] cursor-pointer text-center group"
                >
                  <div className="text-[60px] font-black text-orange-400 tracking-wider whitespace-nowrap">
                    关于本机
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'map_list' && (
            <motion.div 
              key="map_list"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setStatusFilter(null); setView('home'); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black">项目列表</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-teal-400 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full">
                    共计 {maps.length} 个项目
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3 py-4 overflow-x-auto shrink-0 border-b border-white/5">
                {[
                  { label: '成功', value: 'completed' },
                  { label: '上传中', value: 'uploading' },
                  { label: '排队中', value: 'queuing' },
                  { label: '建图中', value: 'mapping' },
                  { label: '失败/取消', value: 'mapping_failed' },
                ].map(filter => {
                  const count = maps.filter(m => m.status === filter.value).length;
                  return (
                    <button
                      key={filter.label}
                      onClick={() => { setStatusFilter(filter.value); setMapListPage(1); }}
                      className={`px-5 py-2 rounded-full whitespace-nowrap text-xl font-bold transition-colors ${
                        statusFilter === filter.value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {filter.label} {count}
                    </button>
                  );
                })}
              </div>

              {/* List */}
              <div className="flex-1 my-4 mx-0.5 overflow-hidden">
                {(() => {
                  const filteredMaps = maps.filter(m => statusFilter ? m.status === statusFilter : true);
                  const MAPS_PER_PAGE = 4;
                  const sortedMaps = filteredMaps.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  const sliced = sortedMaps.slice((mapListPage - 1) * MAPS_PER_PAGE, mapListPage * MAPS_PER_PAGE);
                  
                  if (sliced.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-2xl bg-slate-900/20">
                        <FileText size={48} className="text-white/20 mb-4" />
                        <p className="text-xl font-bold text-white/40">该状态下暂无任何项目数据</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                      {sliced.map(map => {
                        const getReadableDuration = (seconds: number) => {
                          const min = Math.round(seconds / 60);
                          return `${min || 1}分钟`;
                        };

                        return (
                          <div 
                            key={map.id} 
                            onClick={() => {
                              setSelectedMap(map);
                              if (map.status === 'uploading' || map.status === 'mapping' || map.status === 'queuing') {
                                setState(s => ({ ...s, currentMapId: map.id, mappingStatus: map.status, progress: map.progress || 0 }));
                              }
                              setView('map_details');
                            }}
                            className="relative bg-slate-900/40 hover:bg-slate-800/65 border border-white/5 hover:border-blue-500/30 rounded-3xl overflow-hidden flex items-stretch cursor-pointer group transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                          >
                            <div className="relative w-72 bg-slate-950/80 overflow-hidden shrink-0 border-r border-white/5">
                              <img 
                                src={`https://picsum.photos/seed/pointcloud_${map.id}/300/180`}
                                alt={map.name} 
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                              
                              <div className="absolute top-3 left-3">
                                <span className={`text-sm px-3 py-1 rounded-xl font-bold uppercase tracking-wide border ${
                                  map.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/25' : 
                                  map.status === 'mapping_failed' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                                  map.status === 'uploading' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25 animate-pulse' :
                                  map.status === 'queuing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25 animate-pulse' :
                                  map.status === 'mapping' ? 'bg-purple-500/10 text-purple-400 border-purple-500/25 animate-pulse' :
                                  map.status === 'scanned' ? 'bg-white/5 text-white/40 border-white/10' :
                                  'bg-blue-500/10 text-blue-400 border-blue-500/25'
                                }`}>
                                  {map.status === 'completed' ? '已就绪' : 
                                   map.status === 'mapping_failed' ? '中断' :
                                   map.status === 'uploading' ? '上传中' :
                                   map.status === 'queuing' ? '排队中' :
                                   map.status === 'mapping' ? '建图中' :
                                   map.status === 'scanned' ? '已扫描' :
                                   map.status === 'uploaded' ? '已上传' : '进行中'}
                                </span>
                              </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col justify-between text-left">
                              <div className="flex items-start justify-between">
                                <div className="font-black text-xl text-white group-hover:text-blue-400 transition-colors truncate max-w-sm flex items-center gap-3">
                                  <span className="truncate">{map.name}</span>
                                  {map.hasSemantics && (
                                    <span className="text-sm font-bold px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider shrink-0 select-none">
                                      语义
                                    </span>
                                  )}
                                </div>
                                <div className="text-base font-mono text-white/40 bg-slate-950/80 px-3 py-1 rounded select-none">
                                  {map.size}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xl text-white/40 mt-2">
                                <span className="flex items-center gap-3">
                                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                                  <span>{getReadableDuration(map.duration || 0)}</span>
                                </span>
                                <span className="font-mono opacity-50">{map.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Pagination block */}
              {(() => {
                const filteredMapsForPagination = maps.filter(m => statusFilter ? m.status === statusFilter : true);
                const MAPS_PER_PAGE = 4;
                const totalPages = Math.ceil(filteredMapsForPagination.length / MAPS_PER_PAGE);
                
                return (
                  <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between shrink-0">
                    <button
                      disabled={mapListPage <= 1}
                      onClick={() => setMapListPage(prev => Math.max(prev - 1, 1))}
                      className="px-6 h-12 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white text-xl font-bold rounded-2xl transition-all disabled:pointer-events-none active:scale-95 cursor-pointer"
                    >
                      上一页
                    </button>
                    <span className="text-white/40 font-black text-xl uppercase tracking-widest font-mono select-none">
                      页码 {mapListPage} / {totalPages || 1}
                    </span>
                    <button
                      disabled={mapListPage >= totalPages || totalPages === 0}
                      onClick={() => setMapListPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-6 h-12 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white text-xl font-bold rounded-2xl transition-all disabled:pointer-events-none active:scale-95 cursor-pointer"
                    >
                      下一页
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {view === 'map_details' && selectedMap && (
            <motion.div 
              key="map_details"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col justify-between h-full overflow-hidden text-left"
            >
              {/* Always query the live state from master maps lists so status ticks in real-time */}
              {(() => {
                const activeMap = maps.find(m => m.id === selectedMap.id) || selectedMap;

                return (
                  <>
                    {/* Part 1: Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setView('map_list')} className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                          <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-2xl font-black text-white">{activeMap.name}</h2>
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-widest">
                            {activeMap.status === 'uploading' ? '上传层' : activeMap.status === 'queuing' ? '队列层' : '建图层'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white/20 font-mono">{activeMap.createdAt}</span>
                    </div>

                    {/* Part 2: Horizontal Metadata Row */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between shrink-0 my-2">
                      <div className="grid grid-cols-4 w-full text-left gap-2">
                        <div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-0.5 font-mono">文件大小</div>
                          <div className="text-sm font-black text-white">{activeMap.size}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-0.5 font-mono">扫图时间</div>
                          <div className="text-sm font-black text-white truncate font-mono">{activeMap.createdAt.split(' ')[0]}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-0.5 font-mono">扫图时长</div>
                          <div className="text-sm font-black text-white font-mono">
                            {Math.floor((activeMap.duration || 0) / 60)}分 {activeMap.duration ? (activeMap.duration % 60) + '秒' : '0秒'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mb-0.5 font-mono">地图语义</div>
                          <div className="text-sm font-black flex items-center gap-1.5">
                            {activeMap.hasSemantics ? (
                              <span className="text-green-400 font-bold text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                已生成
                              </span>
                            ) : (
                              <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                未生成
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Part 3: Main Dynamic Panel */}
                    <div className="flex-1 bg-slate-950/85 border border-white/5 rounded-2xl p-4 my-2.5 flex flex-col justify-between relative overflow-hidden shrink-0 h-[210px]">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-40 pointer-events-none" />
                      
                      {activeMap.status === 'uploading' ? (
                        /* Case 1: Uploading - Pure uploading progress layout */
                        <div className="relative z-10 flex-grow flex flex-col justify-between h-full p-1 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UploadCloud className="text-blue-400 animate-bounce" size={18} />
                              <span className="text-xs font-black text-white/90">三维扫描源数据上传中 (1/2)</span>
                            </div>
                            <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                              正在上传
                            </span>
                          </div>

                          <div className="flex items-center justify-between my-2">
                            <div className="space-y-1">
                              <div className="text-3.5xl font-mono font-black text-white">{activeMap.progress || 0}%</div>
                              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono">物理层级压缩分块中</div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-xs font-bold text-blue-400 font-mono">速度: {uploadSpeed || '1.2 MB/s'}</div>
                              <div className="text-[10px] text-white/40 font-mono">预计剩余: {uploadEta || '2分15秒'}</div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full space-y-1 mt-2">
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${activeMap.progress || 0}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] text-white/20 font-bold tracking-wider font-mono">
                              <span>CHUNK_01_OF_12</span>
                              <span>DDT CLOUD STREAMER V3.2</span>
                            </div>
                          </div>
                        </div>
                      ) : activeMap.status === 'queuing' ? (
                        /* Case 2: Queuing - Queue status layout */
                        <div className="relative z-10 flex-grow flex flex-col justify-between h-full p-1 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Hourglass className="text-yellow-400 animate-spin" size={16} style={{ animationDuration: '3s' }} />
                              <span className="text-xs font-black text-white/95">云端高算力 GPU 编译排队中 (2/2)</span>
                            </div>
                            <span className="text-[9px] font-mono font-black text-yellow-400 uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                              排队中
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center my-1.5 grow">
                            <div className="text-3xl font-black text-yellow-400 flex items-center gap-2">
                              第 {queueInfo?.position || 1} 位
                              <span className="text-sm font-bold text-white/40">/ 共 {queueInfo?.total || 3} 人</span>
                            </div>
                            <p className="text-[10px] text-white/30 text-center mt-2 max-w-sm font-bold leading-relaxed">
                              DDT 云服务器正为您自动锁定物理 GPU。就绪后将即刻启动解算。
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[8.5px] text-white/20 font-mono">
                            <span>运算空间: GEFORCE-RTX-4090-ADA</span>
                            <span>算力状态: READY</span>
                          </div>
                        </div>
                      ) : activeMap.status === 'mapping' ? (
                        /* Case 3: Mapping - Pure mapping progress layout, no upload progress */
                        <div className="relative z-10 flex-grow flex flex-col justify-between h-full p-1 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Cpu className="text-purple-400 animate-pulse" size={18} />
                              <span className="text-xs font-black text-white/95">服务器端多维高精三维解算中 (2/2)</span>
                            </div>
                            <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              建图中
                            </span>
                          </div>

                          <div className="flex items-center justify-between my-2">
                            <div className="space-y-1">
                              <div className="text-3.5xl font-mono font-black text-purple-400">{activeMap.progress || 0}%</div>
                              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono">基于三维高感光拟合计算</div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-xs font-bold text-purple-400 font-mono">GPU负载: 98.4%</div>
                              <div className="text-[10px] text-white/40 font-mono">预估解算剩余: {mappingEta || '15分30秒'}</div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full space-y-1 mt-2">
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                              <motion.div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${activeMap.progress || 0}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] text-white/20 font-bold tracking-wider font-mono">
                              <span>MODELING_NODE_03</span>
                              <span>POWERED BY DDT NEURAL FIELD</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Case 4: Default normal item details visualizer */
                        <div className="relative z-10 flex-1 flex flex-col justify-center p-1">
                          <div className="flex items-center gap-6 bg-slate-900/30 border border-white/5 rounded-2xl p-4">
                            {/* Left Side: Square First Frame Image */}
                            <div className="relative w-32 h-32 shrink-0 aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-900/60 flex items-center justify-center">
                              <img 
                                src={`https://picsum.photos/seed/pointcloud_${activeMap.id}/200/200`}
                                alt="LiDAR Scan Frame #001" 
                                className="w-full h-full object-cover opacity-75"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
                              
                              {/* Camera corner indicators */}
                              <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[7.5px] font-mono font-bold text-red-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                1ST FRAME
                              </div>
                              
                              <div className="absolute bottom-1.5 right-1.5 text-[7.5px] font-mono text-white/30 tracking-wider">
                                #{activeMap.id}
                              </div>
                            </div>

                            {/* Right Side: Map processing details separated */}
                            <div className="flex-grow flex flex-col justify-center space-y-3 ps-1 text-left">
                              <div className="space-y-0.5">
                                <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider font-mono">
                                  画面第一帧
                                </div>
                                <div className="text-xs font-black text-white/90">
                                  SCAN_FRAME_001.png
                                </div>
                                <div className="text-[10px] text-white/40">
                                  LiDAR传感器采集初始点
                                </div>
                              </div>

                              <div className="border-t border-white/5 pt-2.5 space-y-1">
                                <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider font-mono">
                                  处理状态
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    activeMap.status === 'completed' ? 'bg-green-400 animate-pulse' :
                                    activeMap.status === 'mapping_failed' ? 'bg-red-500' :
                                    'bg-blue-400'
                                  }`} />
                                  <span className={`text-xs font-black ${
                                    activeMap.status === 'completed' ? 'text-green-400' :
                                    activeMap.status === 'mapping_failed' ? 'text-red-400' :
                                    'text-blue-400'
                                  }`}>
                                    {activeMap.status === 'completed' ? '已就绪 (处理完成)' : 
                                     activeMap.status === 'mapping_failed' ? '意外中断 (处理异常)' : 
                                     '待建图 (准备就绪)'}
                                  </span>
                                </div>
                                {activeMap.status === 'mapping_failed' && activeMap.failureReason && (
                                  <span className="text-[9px] text-red-400 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded font-mono">
                                    {activeMap.failureReason === 'ERR_OOM' ? 'GPU_OUT_OF_MEMORY' : activeMap.failureReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isReconstructingSemantics && (
                      <div className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center gap-3 z-30">
                        <RefreshCw size={32} className="text-blue-500 animate-spin" />
                        <div className="text-center space-y-1">
                          <p className="text-xs font-black text-white animate-pulse">{semanticStepText}</p>
                        </div>
                        <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden mt-1 border border-white/5">
                          <motion.div 
                            className="h-full bg-blue-500" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3.2, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Part 3.5: Action Button Layout based on active states */}
                    <div className="relative z-10 border-t border-white/5 pt-3.5 flex items-center justify-between gap-3 shrink-0">
                      {activeMap.status === 'uploading' ? (
                        <button
                          onClick={() => {
                            setMaps(prev => prev.map(m => m.id === activeMap.id ? { ...m, status: 'scanned', progress: 0 } : m));
                            setUploadStatus('idle');
                            setUploadProgress(0);
                            setState(s => ({ ...s, currentMapId: null, mappingStatus: 'scanned' }));
                            setAlert({ level: 'yellow', message: '已取消上传并恢复至待处理状态', blocking: false });
                          }}
                          className="w-full h-11 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md shadow-red-600/15 cursor-pointer border border-red-500"
                        >
                          <X size={14} />
                          取消上传任务
                        </button>
                      ) : activeMap.status === 'queuing' ? (
                        <button
                          onClick={() => {
                            setMaps(prev => prev.map(m => m.id === activeMap.id ? { ...m, status: 'scanned', progress: 0 } : m));
                            setMappingProgress(0);
                            setState(s => ({ ...s, currentMapId: null, mappingStatus: 'scanned' }));
                            setAlert({ level: 'yellow', message: '已取消排队并释放云服务器分配', blocking: false });
                          }}
                          className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md shadow-orange-600/15 cursor-pointer border border-orange-500"
                        >
                          <X size={14} />
                          取消排队
                        </button>
                      ) : activeMap.status === 'mapping' ? (
                        <button
                          onClick={() => {
                            setMaps(prev => prev.map(m => m.id === activeMap.id ? { ...m, status: 'scanned', progress: 0 } : m));
                            setMappingProgress(0);
                            setState(s => ({ ...s, currentMapId: null, mappingStatus: 'canceled' }));
                            setAlert({ level: 'yellow', message: '核心建图解算任务已终止', blocking: false });
                          }}
                          className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md shadow-orange-600/15 cursor-pointer border border-orange-500"
                        >
                          <X size={14} />
                          中断建图并中止算力
                        </button>
                      ) : activeMap.status === 'completed' ? (
                        <div className="flex items-center gap-3 w-full">
                          <button
                            onClick={handleShare}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md shadow-blue-600/10 cursor-pointer"
                          >
                            <Globe size={14} />
                            分享地图
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <button
                            onClick={() => handleRemap(activeMap)}
                            className={`flex-1 h-11 ${activeMap.status === 'mapping_failed' ? 'bg-red-600 hover:bg-red-500 border-red-500/30' : 'bg-blue-600 hover:bg-blue-500 border-blue-500/30' } text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md border cursor-pointer`}
                          >
                            {activeMap.status === 'mapping_failed' ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                            {activeMap.status === 'mapping_failed' ? '重新建图' : '开始建图'}
                          </button>

                          <div className="bg-slate-900 border border-white/5 rounded-xl px-3 h-11 flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold text-white/50 select-none">使用语义</span>
                            <button
                              onClick={() => setUseMapSemantics(!useMapSemantics)}
                              className={`relative w-9 h-5 rounded-full transition-all duration-300 flex items-center p-0.5 border cursor-pointer ${
                                useMapSemantics 
                                  ? 'bg-blue-600 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]' 
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              <motion.div 
                                layout
                                className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                                animate={{ x: useMapSemantics ? 14 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Part 4: Delete button thin row */}
                    <button 
                      onClick={() => {
                        setMaps(prev => prev.filter(m => m.id !== activeMap.id));
                        setView('map_list');
                        setAlert({ level: 'yellow', message: '当前地图项目已被妥善删除', blocking: false });
                      }}
                      className="h-8.5 bg-white/[0.01] hover:bg-red-500/10 text-white/10 hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 w-full shrink-0 cursor-pointer my-1.5"
                    >
                      <X size={11} />
                      删除当前项目数据
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}

          {view === 'download_file_type' && (
            <motion.div 
              key="download_file_type"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="flex-1 flex flex-col gap-10"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('map_details')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">选择下载格式</h2>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-6">
                {[
                  { 
                    id: 'ddt', 
                    title: 'ddt 格式', 
                    desc: '私有格式，只支持DDT Studio预览，支持点云、高斯模型等多类型数据存储，并针对渲染做了专门优化',
                    color: 'blue'
                  },
                  { 
                    id: 'ply', 
                    title: 'ply 格式', 
                    desc: '行业通用的高斯点云模型，支持与主流处理软件的兼容交互',
                    color: 'purple'
                  },
                  { 
                    id: 'las', 
                    title: 'las 格式', 
                    desc: '激光雷达点云数据的标准存储格式，适用于测绘、建筑、林业等',
                    color: 'amber'
                  }
                ].map((type) => (
                  <button 
                    key={type.id}
                    onClick={() => selectDownloadFileType(type.id as any)}
                    className="bg-slate-900 border border-white/5 rounded-[40px] p-8 flex flex-col gap-8 text-left hover:bg-white/5 transition-all active:scale-95 group shadow-xl"
                  >
                    <div className={`w-16 h-16 bg-${type.color}-500/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                      <FileDown size={32} className={`text-${type.color}-400`} />
                    </div>
                    <div className="space-y-4">
                      <div className="text-xl font-bold">{type.title}</div>
                      <p className="text-white/40 text-[10px] leading-relaxed line-clamp-5">
                        {type.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'share_method' && (
            <motion.div 
              key="share_method"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex-1 flex flex-col gap-10"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('map_details')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">选择分享方式</h2>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-8">
                <button 
                  onClick={() => selectShareMethod('local')}
                  className="bg-slate-900 border border-white/5 rounded-[48px] p-12 flex flex-col items-center justify-center gap-8 group hover:bg-blue-600/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-2xl"
                >
                  <div className="w-24 h-24 bg-blue-500/20 rounded-[32px] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wifi size={48} className="text-blue-400" />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-black">本地分享</div>
                    <p className="text-white/40 leading-relaxed text-sm text-center">
                      PC需要在同一个局域网<br />需要先下载到建图设备
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => selectShareMethod('online')}
                  className="bg-slate-900 border border-white/5 rounded-[48px] p-12 flex flex-col items-center justify-center gap-8 group hover:bg-purple-600/10 hover:border-purple-500/30 transition-all active:scale-95 shadow-2xl"
                >
                  <div className="w-24 h-24 bg-purple-500/20 rounded-[32px] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe size={48} className="text-purple-400" />
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-black">在线分享</div>
                    <p className="text-white/40 leading-relaxed text-sm text-center">
                      需要能连接公网<br />不需要下载到建图设备
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'share_file_type' && (
            <motion.div 
              key="share_file_type"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="flex-1 flex flex-col gap-10"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('map_details')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">选择分享文件类型</h2>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-6">
                {[
                  { 
                    id: 'ddt', 
                    title: 'ddt 格式', 
                    desc: '私有格式，只支持DDT Studio预览，支持点云、高斯模型等多类型数据存储，并针对渲染做了专门优化',
                    color: 'blue'
                  },
                  { 
                    id: 'ply', 
                    title: 'ply 格式', 
                    desc: '行业通用的高斯点云模型，支持与主流处理软件的兼容交互',
                    color: 'purple'
                  },
                  { 
                    id: 'las', 
                    title: 'las 格式', 
                    desc: '激光雷达点云数据的标准存储格式，适用于测绘、建筑、林业等',
                    color: 'amber'
                  }
                ].map((type) => (
                  <button 
                    key={type.id}
                    onClick={() => selectShareFileType(type.id as any)}
                    className="bg-slate-900 border border-white/5 rounded-[40px] p-8 flex flex-col gap-8 text-left hover:bg-white/5 transition-all active:scale-95 group shadow-xl"
                  >
                    <div className={`w-16 h-16 bg-${type.color}-500/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                      <FileText size={32} className={`text-${type.color}-400`} />
                    </div>
                    <div className="space-y-4">
                      <div className="text-xl font-bold">{type.title}</div>
                      <p className="text-white/40 text-[10px] leading-relaxed line-clamp-5">
                        {type.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'local_share' && selectedMap && (
            <motion.div 
              key="local_share"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="flex-1 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setView('map_details'); setShareSource(null); }} className="p-2 hover:bg-white/10 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black">请在浏览器打开链接</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                  <Activity size={16} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">局域网分享运行中</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p className="text-lg text-white/60 leading-relaxed">
                    在同一个局域网的设备中打开链接，即可下载 <span className="text-blue-400 font-bold">{selectedMap.name}.{shareFileType}</span>
                  </p>

                  <div className="space-y-4">
                    {/* 有线 */}
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">有线传输 (IP 排前)</div>
                        <div className="text-xl font-mono font-bold text-blue-400">http://172.16.6.76:53317</div>
                      </div>
                      <button 
                        onClick={() => setShowShareQR({ type: '有线', ip: '172.16.6.76' })}
                        className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      >
                        <QrCode size={20} />
                      </button>
                    </div>

                    {/* 无线 */}
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">无线传输</div>
                        <div className="text-xl font-mono font-bold text-blue-400">http://192.168.98.9:53317</div>
                      </div>
                      <button 
                        onClick={() => setShowShareQR({ type: '无线', ip: '192.168.98.9' })}
                        className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      >
                        <QrCode size={20} />
                      </button>
                    </div>
                  </div>

                  {shareSource && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Monitor size={24} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">检测到连接</div>
                        <div className="font-bold">{shareSource.browser} <span className="text-white/40 ml-2 font-mono">{shareSource.ip}</span></div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[48px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/5 pulse" />
                  <div className="text-center p-8 space-y-6 relative z-10">
                    <div className="bg-white p-6 rounded-[48px] inline-block shadow-2xl">
                      <QrCode size={200} className="text-slate-900" />
                    </div>
                    <div className="space-y-2">
                       <div className="text-white/40 text-xs font-bold uppercase tracking-widest">扫描二维码下载地图</div>
                       <div className="text-xl font-mono font-bold">172.16.6.76</div>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showShareQR && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                  >
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-white p-10 rounded-[48px] flex flex-col items-center gap-6 relative"
                    >
                      <button 
                        onClick={() => setShowShareQR(null)}
                        className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <X size={24} />
                      </button>
                      <div className="text-center space-y-1 mb-2">
                        <div className="text-xs font-black text-blue-600 uppercase tracking-widest">{showShareQR.type}分享二维码</div>
                        <div className="text-xl font-black text-slate-900">http://{showShareQR.ip}:53317</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                        <QrCode size={240} className="text-slate-900" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium">请使用电脑浏览器扫码下载</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'preparing_file' && selectedMap && (
            <motion.div 
              key="preparing_file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-12"
            >
              <div className="space-y-4 text-center">
                <Loader2 size={64} className="text-blue-500 animate-spin mx-auto" />
                <h2 className="text-4xl font-black">文件准备中...</h2>
                <p className="text-white/40 text-xl">正在将项目转换为 {shareFileType?.toUpperCase()} 格式</p>
              </div>
              
              <div className="w-full max-w-md space-y-4">
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${((290 - preparingCountdown) / 290) * 100}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <div className="flex justify-between items-center px-2 font-mono text-sm">
                  <span className="text-white/40 uppercase tracking-widest font-bold">预计剩余</span>
                  <span className="text-blue-400 font-bold">
                    {Math.floor(preparingCountdown / 60)}分 {(preparingCountdown % 60).toString().padStart(2, '0')}秒
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'online_share' && selectedMap && (
            <motion.div 
              key="online_share"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('share_file_type')} className="p-2 hover:bg-white/10 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black">在线分享</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  <Cloud size={16} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {shareFileType === 'ddt' ? `文件已就绪 (${shareFileType?.toUpperCase()})` : `文件已转化为 ${shareFileType?.toUpperCase()} 格式`}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 space-y-4">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center">分享链接</div>
                  <div className="bg-black/40 p-6 rounded-2xl break-all font-mono text-lg text-blue-400 border border-white/10 leading-relaxed text-center">
                     https://c.wss.ink/f/jq892frjq3o
                  </div>
                  <div className="flex justify-center items-center gap-2 pt-2 text-yellow-400">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">有效期:</span>
                    <span className="text-2xl font-black font-mono">
                      {Math.floor(linkExpiryCountdown / 3600).toString().padStart(2, '0')}:
                      {Math.floor((linkExpiryCountdown % 3600) / 60).toString().padStart(2, '0')}:
                      {(linkExpiryCountdown % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center space-y-4">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">分享码</div>
                    <div className="py-2">
                      <span className="text-7xl font-black font-mono tracking-tighter text-white">{shareCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">有效期:</span>
                      <span className="text-xl font-black font-mono">
                        {Math.floor(codeExpiryCountdown / 60)}分 {codeExpiryCountdown % 60}秒
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-[40px] flex flex-col items-center justify-center p-8 relative overflow-hidden group cursor-pointer"
                       onClick={() => setShowQR(true)}>
                    {!showQR ? (
                      <>
                        <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            <QrCode size={32} className="text-white/40" />
                          </div>
                          <div className="text-white/60 font-bold">点击查看二维码</div>
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center gap-4 scale-90">
                        <div className="bg-white p-4 rounded-3xl">
                          <QrCode size={180} className="text-slate-900" />
                        </div>
                        <div className="text-white/40 text-xs uppercase font-bold tracking-widest">扫码访问</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 flex gap-4">
                  <Info size={24} className="text-blue-400 shrink-0" />
                  <p className="text-sm text-blue-400 leading-relaxed">
                    可在 AXS 网站地图管理，导入中输入分享码，提取文件，注意有效期内完成操作。
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'pre_scan_check' && (
            <motion.div 
              key="pre_scan_check"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto w-full px-4"
            >
              {preScanCountdown !== null ? (
                <div className="text-center space-y-8">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className="text-blue-500"
                        strokeDasharray="565"
                        initial={{ strokeDashoffset: 565 }}
                        animate={{ strokeDashoffset: 565 - (565 * (10 - preScanCountdown)) / 10 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-black font-mono">{preScanCountdown}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black">请放在地面静置</h2>
                    <p className="text-white/40 text-lg">正在进行惯性导航系统初始化，请勿移动设备</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black">扫图前校验</h2>
                    <p className="text-white/40 text-lg">正在确保设备处于最佳状态...</p>
                  </div>

                  <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
                    {[
                      { id: 1, name: '激光雷达状态', value: state.sensors.lidar ? '正常' : '异常' },
                      { id: 2, name: 'IMU状态', value: state.sensors.imu ? '正常' : '异常' },
                      { id: 3, name: '摄像头状态', value: state.sensors.camera ? '正常' : '异常' },
                      { id: 4, name: 'RTK状态', value: state.sensors.rtk ? 'FIXED' : 'FLOAT' },
                      { id: 5, name: '剩余存储空间', value: `${(state.totalStorage - state.storage).toFixed(1)}GB` },
                      { id: 6, name: '剩余电量', value: `${state.batteryLevel}%` },
                    ].map(step => {
                      const isChecking = validationStep === step.id;
                      const isPassed = validationStep > step.id;
                      const isCritical = step.id <= 3 && step.value === '异常';
                      const isWarning = (step.id === 4 && step.value === 'FLOAT') ||
                                      (step.id === 5 && (state.totalStorage - state.storage) < 5) ||
                                      (step.id === 6 && state.batteryLevel < 50);

                      return (
                        <div 
                          key={step.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                            isPassed ? (isCritical ? 'bg-red-500/10 border-red-500/30 text-red-400' : isWarning ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-green-500/10 border-green-500/30 text-green-400') :
                            isChecking ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' :
                            'bg-slate-800/50 border-white/5 text-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isPassed ? (
                              isCritical ? <AlertCircle size={20} /> :
                              isWarning ? <AlertTriangle size={20} /> :
                              <CheckCircle2 size={20} />
                            ) : isChecking ? (
                              <RefreshCw size={20} className="animate-spin" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />
                            )}
                            <div className="font-bold text-sm">{step.name}</div>
                          </div>
                          {isPassed && <div className="text-xs font-mono font-bold opacity-60">{step.value}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {preScanCheckStatus === 'failed' && (
                    <div className="flex flex-col items-center gap-6">
                      <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold">
                        硬件状态异常，请联系售后支持
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setView('home')}
                          className="px-8 py-4 bg-slate-800 rounded-2xl font-bold hover:bg-slate-700 transition-all text-white/85"
                        >
                          返回首页
                        </button>
                        <button 
                          disabled
                          className="px-12 py-4 bg-slate-700 text-white/40 rounded-2xl font-black text-xl cursor-not-allowed"
                        >
                          无法建图
                        </button>
                      </div>
                    </div>
                  )}

                  {preScanCheckStatus === 'passed' && showStartButton && (
                    <div className="flex flex-col items-center gap-6">
                      {lastValidationResult === false && (
                        <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 font-bold text-center max-w-md">
                          检测到部分项目状态欠佳，建议在开始前进行优化（如充电或清理空间）
                        </div>
                      )}
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setView('home')}
                          className="px-8 py-4 bg-slate-800 rounded-2xl font-bold hover:bg-slate-700 transition-all text-white/85"
                        >
                          返回首页
                        </button>
                        <button 
                          onClick={() => setView('scan_preview')}
                          className={`px-12 py-4 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center gap-3 ${
                            lastValidationResult === false 
                              ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-yellow-500/20' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                          }`}
                        >
                          <Play size={24} fill="currentColor" />
                          立即扫图 (Camera Preview)
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {view === 'scan_preview' && (() => {
            const cameraFeeds = {
              CAM_01: {
                name: '镜头 1',
                url: 'https://picsum.photos/seed/ddt-mapping-warehouse/1280/720',
                description: '前置三维重建光电传感器'
              },
              CAM_02: {
                name: '镜头 2',
                url: 'https://picsum.photos/seed/ddt-mapping-factory/1280/720',
                description: '侧向大视角安全防避障传感器'
              },
              CAM_03: {
                name: '镜头 3',
                url: 'https://picsum.photos/seed/ddt-mapping-corridor/1280/720',
                description: '红外补光高密度真彩色材质提取镜头'
              }
            };
            
            return (
              <motion.div 
                key="scan_preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-2.5 max-w-4xl mx-auto w-full px-4 py-1.5 overflow-hidden h-full"
              >
                {/* Header section with Indoor/Outdoor mode selection */}
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setView('pre_scan_check')} 
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-white">请调整亮度</h2>
                    </div>
                  </div>

                  {/* Ambient Mode toggles */}
                  <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setExposureEnvMode('indoor')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                        exposureEnvMode === 'indoor'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>🏠 室内模式</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExposureEnvMode('outdoor')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                        exposureEnvMode === 'outdoor'
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>☀️ 室外模式</span>
                    </button>
                  </div>
                </div>

                {/* 16:9 Camera Feed Display */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-xl max-h-[220px]">
                  {/* Image Stream */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300 ease-out"
                    style={{ 
                      backgroundImage: `url('${cameraFeeds[activeCamera].url}')`,
                      filter: `brightness(${getShutterBrightness(shutterSpeed)})` 
                    }}
                  />

                  {/* Laser line effect */}
                  <div className="absolute inset-x-0 h-[1.5px] bg-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-scan pointer-events-none" />

                  {/* Floating Interactive Camera Switcher Overlay Button - Switch cameras */}
                  <div className="absolute bottom-3 right-3 z-20">
                    <div className="bg-black/95 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex gap-1 shadow-lg">
                      {(['CAM_01', 'CAM_02', 'CAM_03'] as const).map((cam) => {
                        const isSelected = activeCamera === cam;
                        return (
                          <button
                            key={cam}
                            type="button"
                            onClick={() => setActiveCamera(cam)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all flex items-center gap-1 border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                            }`}
                          >
                            <span>{cameraFeeds[cam].name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Operations Control Area */}
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest font-sans">
                        快门速度调节
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 font-bold">
                        当前值: {shutterSpeed}s
                      </span>
                    </div>

                    {/* Preset buttons */}
                    <div className="flex items-center gap-3 bg-black/35 p-2 rounded-2xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          const presets = ['1/1000', '1/800', '1/640', '1/500', '1/400', '1/320', '1/250', '1/200'];
                          const idx = presets.indexOf(shutterSpeed);
                          if (idx > 0) {
                            setShutterSpeed(presets[idx - 1]);
                          }
                        }}
                        disabled={shutterSpeed === '1/1000'}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white/60 disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <div className="flex-1 overflow-x-auto scrollbar-none flex items-center justify-between gap-1">
                        {['1/1000', '1/800', '1/640', '1/500', '1/400', '1/320', '1/250', '1/200'].map((preset) => {
                          const isSelected = shutterSpeed === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setShutterSpeed(preset)}
                              className={`flex-1 h-9 rounded-lg flex flex-col items-center justify-center transition-all border text-[9px] font-bold font-mono ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                  : 'bg-white/5 hover:bg-white/10 text-white/40 border-white/5'
                              }`}
                            >
                              <span>{preset}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const presets = ['1/1000', '1/800', '1/640', '1/500', '1/400', '1/320', '1/250', '1/200'];
                          const idx = presets.indexOf(shutterSpeed);
                          if (idx < presets.length - 1) {
                            setShutterSpeed(presets[idx + 1]);
                          }
                        }}
                        disabled={shutterSpeed === '1/200'}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white/60 disabled:opacity-20 disabled:pointer-events-none"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Clean info box without unneeded technical parameters */}
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-2">
                    <Info size={14} className="text-blue-400 shrink-0" />
                    <div className="text-[10px] text-white/60 leading-normal font-sans">
                      {exposureEnvMode === 'indoor' 
                        ? '室内推荐采用 1/400秒 ~ 1/320秒，以保证传感器配准材质饱满。' 
                        : '室外推荐采用 1/1000秒 ~ 1/640秒 快门防止产生画面曝光过度。'}
                    </div>
                  </div>

                  {/* Back / Continue actions */}
                  <div className="flex gap-3 pt-2 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setView('pre_scan_check')}
                      className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs transition-colors text-white/60"
                    >
                      返回
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setScanCountdown(10);
                        setScanInitState('initializing');
                        setView('scan_init');
                      }}
                      className="flex-[2] h-11 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-xs transition-colors text-white flex items-center justify-center gap-1 shadow-lg cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" />
                      开始建图
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {view === 'scan_init' && (
            <motion.div 
              key="scan_init"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto w-full px-4 text-center h-full"
            >
              {scanInitState === 'initializing' && (
                <div className="space-y-6 flex flex-col items-center justify-center flex-1">
                  <RefreshCw size={48} className="text-blue-500 animate-spin" />
                  <h2 className="text-2xl font-black text-white">设备初始化中</h2>
                </div>
              )}

              {scanInitState === 'static_wait' && (
                <div className="space-y-8 flex flex-col items-center justify-center flex-1">
                  <h2 className="text-2xl font-black text-white">将设备平稳放置在桌面上</h2>
                  <button
                    onClick={() => {
                      setScanCountdown(10);
                      setScanInitState('countdown');
                    }}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 cursor-pointer"
                  >
                    确认
                  </button>
                </div>
              )}

              {scanInitState === 'countdown' && (
                <div className="space-y-8 flex flex-col items-center justify-center flex-1">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <motion.circle 
                        cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className="text-blue-500"
                        strokeDasharray="565"
                        initial={{ strokeDashoffset: 565 }}
                        animate={{ strokeDashoffset: 565 - (565 * (10 - scanCountdown)) / 10 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-black font-mono text-white">{scanCountdown}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-white">稍等片刻，请勿触碰</h2>
                </div>
              )}
            </motion.div>
          )}

          {view === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between p-4 max-h-[500px]">
                
                {/* Top status bar */}
                <div className="flex items-center justify-between w-full z-20">
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-bold text-xs">数据记录中</span>
                  </div>

                  {/* Force end power timer banner if battery critical */}
                  {forceEndTimer !== null && (
                    <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg animate-pulse">
                      <Zap size={12} />
                      <span>{forceEndTimer}s 强制结束</span>
                    </div>
                  )}
                </div>

                {/* Simulated Point Cloud Trajectory Area */}
                <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-[1.5px] bg-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.4)] animate-scan pointer-events-none" />
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                      d="M 360,360 Q 400,300 450,350 T 550,400 T 600,300"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.4)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1800, ease: "linear" }}
                    />
                    <motion.circle
                      r="6"
                      fill="#3b82f6"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      style={{ offsetPath: "path('M 360,360 Q 400,300 450,350 T 550,400 T 600,300')" }}
                      transition={{ duration: 1800, ease: "linear" }}
                    />
                  </svg>
                </div>

                {/* Active Anomaly Warnings Overlay (Stacked in center context, very clean and styled) */}
                <div className="flex flex-col gap-2 w-full max-w-md mx-auto z-20 mt-2 select-none">
                  {/* Warning 1: Turning rate */}
                  <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl backdrop-blur-md shadow-md">
                    <AlertTriangle className="text-amber-400 shrink-0 animate-bounce" size={16} />
                    <div className="text-left font-sans">
                      <div className="text-xs font-black text-amber-400">转向过快</div>
                      <div className="text-[10px] text-white/70 mt-0.5 leading-normal">
                        影响采集质量，请缓慢转弯
                      </div>
                    </div>
                  </div>

                  {/* Warning 2: Walking speed */}
                  <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl backdrop-blur-md shadow-md">
                    <AlertTriangle className="text-amber-400 shrink-0 animate-bounce" size={16} />
                    <div className="text-left font-sans">
                      <div className="text-xs font-black text-amber-400">走的太快</div>
                      <div className="text-[10px] text-white/70 mt-0.5 leading-normal">
                        影响采集质量，请不要超过0.5米每秒
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-view Video monitor without labels */}
                <div className="w-28 h-18 bg-black/60 rounded-lg border border-white/15 overflow-hidden shadow-xl z-20 self-start mt-auto mb-2 relative">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/rcs-cam/300/200')] bg-cover bg-center opacity-45" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[1px] bg-green-500/30 animate-scan" />
                  </div>
                </div>

                {/* Bottom Control row with remaining time and Confirm ("确定") button */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5 w-full z-20">
                  <div className="flex flex-col text-left font-sans">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Remaining Time</span>
                    <span className="text-lg font-mono font-black text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                      {Math.floor((SCAN_TIMEOUT - state.scanDuration) / 60)}:{((SCAN_TIMEOUT - state.scanDuration) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={stopScanning}
                    className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xl shadow-blue-600/35 transition-all active:scale-95 border border-blue-500/20 cursor-pointer font-sans"
                  >
                    <span>确定</span>
                  </button>
                </div>

                {/* Alert Overlay */}
                <AnimatePresence>
                  {alert && (
                    <motion.div 
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`max-w-xs w-full p-5 rounded-2xl border flex flex-col items-center text-center gap-3 ${
                          alert.level === 'red' ? 'bg-red-950/90 border-red-500 text-red-100' :
                          'bg-yellow-950/90 border-yellow-500 text-yellow-100'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          alert.level === 'red' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          <AlertTriangle size={18} className="text-white" />
                        </div>
                        
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-black uppercase tracking-tight">提示</h3>
                          <p className="text-[11px] font-medium leading-relaxed opacity-80">
                            {alert.message}
                          </p>
                        </div>

                        <button 
                          type="button"
                          onClick={() => {
                            if (alert.onConfirm) {
                              alert.onConfirm();
                            }
                            setAlert(null);
                          }}
                          className={`w-full py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${
                            alert.level === 'red' ? 'bg-red-500 hover:bg-red-400' :
                            'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
                          }`}
                        >
                          确定
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {view === 'self_check_detail' && (
            <motion.div 
              key="self_check_detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-3xl font-black">自检详情</h2>
              </div>

              <div className="flex-1 bg-slate-800/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {[
                    { name: '激光雷达', status: state.sensors.lidar ? 'normal' : 'disconnected' },
                    { name: 'IMU', status: 'normal' },
                    { name: '摄像头', status: state.sensors.camera ? 'normal' : 'abnormal' },
                    { name: 'RTK', status: state.sensors.rtk ? 'normal' : 'disconnected' },
                    { name: '存储空间', status: state.storage < 5 ? 'abnormal' : 'normal', value: `${state.storage.toFixed(1)}GB` },
                    { name: '电池电量', status: state.battery < 50 ? 'abnormal' : 'normal', value: `${Math.round(state.battery)}%` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'normal' ? 'bg-green-400' :
                          item.status === 'abnormal' ? 'bg-red-400' : 'bg-slate-500'
                        }`} />
                        <span className="font-bold">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {item.value && <span className="text-white/40 font-mono text-sm">{item.value}</span>}
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          item.status === 'normal' ? 'text-green-400' :
                          item.status === 'abnormal' ? 'text-red-400' : 'text-slate-500'
                        }`}>
                          {item.status === 'normal' ? '正常' :
                           item.status === 'abnormal' ? '异常' : '未连接'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-white/5 border-t border-white/5">
                  <button 
                    onClick={startSelfCheck}
                    disabled={selfCheckStatus === 'checking'}
                    className={`w-full h-16 rounded-2xl font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      selfCheckStatus === 'checking' ? 'bg-slate-700 text-white/40 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {selfCheckStatus === 'checking' ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        自检中，请等待
                      </>
                    ) : '重新自检'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'saving' && (
            <motion.div 
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              <div className="relative">
                <div className="w-32 h-32 border-4 border-blue-500/20 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <Database size={48} className="absolute inset-0 m-auto text-blue-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">保存成果中</h2>
                <p className="text-white/40 animate-pulse">正在封装数据包并上传云端元数据...</p>
              </div>
            </motion.div>
          )}

          {view === 'cloud_options' && (
            <motion.div 
              key="cloud_options"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col gap-8 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black">扫图已完成</h2>
                  <p className="text-white/40">时长：{Math.floor(state.scanDuration / 60)}分{state.scanDuration % 60}秒，文件：450MB</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-right">
                    <div className="text-[10px] text-white/20 font-bold tracking-widest uppercase">剩余建图时长</div>
                    <div className="text-xl font-black text-blue-400">{state.cloudQuota} m</div>
                  </div>
                </div>
              </div>

              {/* Map Semantics Reconstruction Option (Checked by default) */}
              <div className="bg-slate-900/50 border border-white/5 rounded-[24px] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Layers size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      地图语义重建 (Semantic Mapping)
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        默认勾选
                      </span>
                    </div>
                    <div className="text-xs text-white/40 mt-1 leading-relaxed">
                      开启 AI 三维高精语义理解，检测生成物理隔离隔断、墙体等深度场景语义
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseMapSemantics(!useMapSemantics)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 border ${
                    useMapSemantics 
                      ? 'bg-blue-600 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.35)]' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <motion.div 
                    layout
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                    animate={{ x: useMapSemantics ? 22 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* ONLY ONE Professional Mode Card / Container */}
              {(() => {
                const cost = Math.ceil((state.scanDuration / 60) * 12);

                return (
                  <div className="relative overflow-hidden bg-slate-900/60 p-6 rounded-[28px] border border-blue-500/10 hover:border-blue-500/25 transition-all flex flex-col justify-between h-[180px] shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">专业建图模式</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                              比率 1:12
                            </span>
                          </div>
                          <div className="text-white/40 text-[11px] mt-1 leading-relaxed max-w-sm">
                            完整构建核心 ddt 格式三维高精地图，可自由导出为行业通用的高斯溅射点云 (ply) 及激光点云数据 (las) 格式。支持高维神经网络测绘、自动机器人及室内建模。
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-mono font-black text-white">{cost} m</div>
                        <span className="text-[9px] text-white/30 font-bold tracking-wider uppercase block mt-1">预计建图消耗</span>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-3 mt-2 text-[10px] text-white/30">
                      <span>格式支持: DDT STUDIO / PLY / LAS</span>
                      <span>深度场景解析已强制加固</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4 mt-auto">
                <button 
                  onClick={() => {
                    if (state.currentMapId) {
                      setMaps(prev => prev.map(m => m.id === state.currentMapId ? { ...m, status: 'scanned' } : m));
                    }
                    setView('home');
                  }}
                  className="flex-1 h-16 bg-slate-800 hover:bg-slate-700 rounded-2xl text-lg font-bold transition-all border border-white/5 text-white/60 cursor-pointer text-center"
                >
                  暂不处理
                </button>
                <button 
                  onClick={() => handleCloudInit('professional', 12)}
                  className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Play size={18} />
                  <span>开始建图</span>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'cloud_progress' && (
            <motion.div 
              key="cloud_progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <button 
                  onClick={() => {
                    if (state.mappingStatus === 'uploading') {
                      setShowCancelUploadConfirm(true);
                    } else if (state.mappingStatus === 'queuing' || state.mappingStatus === 'mapping') {
                      // Exit during mapping is fine, it continues in background
                      setView('home');
                    } else {
                      setView('home');
                    }
                  }} 
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ChevronLeft size={24} />
                  <span className="text-xl">返回首页</span>
                </button>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${
                    state.mappingStatus === 'completed' ? 'bg-green-500' :
                    state.mappingStatus === 'mapping_failed' ? 'bg-red-500' : 
                    uploadStatus === 'disconnected' ? 'bg-orange-500' : 
                    state.mappingStatus === 'canceled' ? 'bg-white/20' : 'bg-blue-500 animate-pulse'
                  }`} />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    {uploadStatus === 'disconnected' ? '网络异常' :
                     state.mappingStatus === 'uploading' ? '数据上传中' :
                     state.mappingStatus === 'queuing' ? '排队中' :
                     state.mappingStatus === 'mapping' ? '云端建图中' :
                     state.mappingStatus === 'completed' ? '建图成功' : 
                     state.mappingStatus === 'canceled' ? '已取消' : '建图失败'}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-12 max-w-2xl mx-auto w-full pt-4">
                {/* Data Upload Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        uploadStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        uploadStatus === 'disconnected' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <UploadCloud size={20} />
                      </div>
                      <span className="text-xl font-black">数据上传</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${
                        uploadStatus === 'completed' ? 'text-green-400' : 
                        uploadStatus === 'disconnected' ? 'text-orange-400' : 
                        uploadStatus === 'failed' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {uploadStatus === 'completed' ? '已完成' : 
                         uploadStatus === 'disconnected' ? '已暂停' : 
                         uploadStatus === 'failed' ? '上传失败' : '进行中'}
                      </span>
                      {state.mappingStatus === 'uploading' && uploadStatus !== 'completed' && (
                        <button 
                          onClick={() => setShowCancelUploadConfirm(true)}
                          className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors bg-white/5 px-2 py-1 rounded"
                        >
                          取消上传
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-3xl font-black font-mono">
                        {uploadStatus === 'completed' ? '2.4G / 2.4G' : `${(2.4 * uploadProgress / 100).toFixed(1)}G / 2.4G`}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${uploadStatus === 'completed' ? 'text-green-400' : 'text-blue-400'}`}>
                          {uploadStatus === 'completed' ? `平均速度: ${avgUploadSpeed}` : uploadSpeed}
                        </div>
                        {uploadStatus !== 'completed' && uploadStatus !== 'disconnected' && (
                          <div className="text-white/40 text-xs">预计剩余: {uploadEta}</div>
                        )}
                      </div>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden border ${uploadStatus === 'disconnected' ? 'bg-white/5 border-orange-500/30' : 'bg-white/5 border-white/10'}`}>
                      <motion.div 
                        className={`h-full ${
                          uploadStatus === 'completed' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 
                          uploadStatus === 'disconnected' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    {uploadStatus === 'disconnected' && (
                      <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                        <div className="space-y-1">
                          <div className="text-orange-400 font-bold text-sm flex items-center gap-2">
                            <WifiOff size={16} /> 网络连接已断开，上传已暂停
                          </div>
                          <div className="text-white/40 text-xs">将在 {networkRetryCountdown}s 内尝试自动重填，支持断点续传</div>
                        </div>
                        <button 
                          onClick={() => setView('network_settings')}
                          className="px-4 py-2 bg-orange-500 text-slate-900 text-xs font-bold rounded-xl active:scale-95 transition-all"
                        >
                          检查网络
                        </button>
                      </div>
                    )}
                  </div>
                  {uploadStatus === 'failed' && (
                    <button 
                      onClick={() => setUploadStatus('uploading')}
                      className="flex items-center gap-2 text-red-400 text-sm font-bold hover:underline"
                    >
                      <RefreshCw size={14} /> 重试上传
                    </button>
                  )}
                </div>

                {/* Cloud Mapping Section */}
                <div className={`space-y-6 transition-all duration-500 ${uploadStatus === 'completed' ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4 pointer-events-none'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        state.mappingStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        state.mappingStatus === 'canceled' ? 'bg-white/5 text-white/20' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        <Database size={20} />
                      </div>
                      <span className="text-xl font-black">云端建图 ({mappingMode.type === 'professional' ? '专业' : '快速'})</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      state.mappingStatus === 'completed' ? 'text-green-400' :
                      state.mappingStatus === 'queuing' ? 'text-yellow-400' :
                      state.mappingStatus === 'mapping' ? 'text-purple-400' : 
                      state.mappingStatus === 'canceled' ? 'text-white/20' : 'text-white/10'
                    }`}>
                      {state.mappingStatus === 'completed' ? '建图成功' :
                       state.mappingStatus === 'queuing' ? '排队中' :
                       state.mappingStatus === 'mapping' ? '进行中' :
                       state.mappingStatus === 'mapping_failed' ? '建图失败' : 
                       state.mappingStatus === 'canceled' ? '已取消' : '等待上传'}
                    </span>
                  </div>

                  {state.mappingStatus === 'queuing' ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3 text-yellow-400 font-bold">
                        <Clock size={18} className="animate-spin-slow" />
                        <span>{activeCloudTasks > 1 ? '由于您已有正在运行的任务，需要排队' : '当前云端算力紧张，正在排队中'}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        预计还要等待 30 分钟。您可以退出此页面，任务将在后台继续。
                      </p>
                    </div>
                  ) : state.mappingStatus === 'canceled' ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-6">
                      <div className="text-white/40 text-lg font-bold">建图任务已手动取消</div>
                      <button 
                        onClick={() => {
                          setState(prev => ({ ...prev, mappingStatus: 'mapping' }));
                          setMappingProgress(0);
                        }}
                        className="px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/20"
                      >
                        重新建图
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="text-3xl font-black font-mono">
                          {state.mappingStatus === 'completed' ? '100.0%' : `${mappingProgress.toFixed(1)}%`}
                        </div>
                        <div className="text-right">
                          {state.mappingStatus === 'mapping' && (
                            <div className="text-purple-400 font-bold">预计还需: {mappingEta}</div>
                          )}
                          {state.mappingStatus === 'completed' && (
                            <div className="text-green-400 font-bold">建图已完成</div>
                          )}
                        </div>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          className={`h-full ${state.mappingStatus === 'completed' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${mappingProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">
                          每 10% 更新一次进度
                        </div>
                        {state.mappingStatus === 'mapping' && (
                          <button 
                            onClick={() => setShowCancelMappingConfirm(true)}
                            className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors"
                          >
                            取消建图任务
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {state.mappingStatus === 'mapping_failed' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between">
                      <div className="text-red-400 font-bold">建图算法执行异常</div>
                      <button 
                        onClick={() => {
                          setState(prev => ({ ...prev, mappingStatus: 'mapping' }));
                          setMappingProgress(0);
                        }}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all"
                      >
                        重试建图
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Tips */}
                {state.mappingStatus !== 'completed' && !state.mappingStatus.includes('failed') && state.mappingStatus !== 'canceled' && (
                  <p className="text-center text-white/20 text-xs mt-auto">
                    {uploadStatus === 'completed' 
                      ? '数据已在云端，建图将在后台继续，您可以离开此页面。'
                      : '上传过程中请保持网络连接，退出上传将导致任务重置。'}
                  </p>
                ) || (
                  <div className="mt-auto" />
                )}

                {/* Success Primary Action */}
                {state.mappingStatus === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-auto pb-8"
                  >
                    <button 
                      onClick={() => {
                        const targetMap = maps.find(m => m.id === state.currentMapId);
                        if (targetMap) {
                          setSelectedMap(targetMap);
                          setView('map_details');
                        } else {
                          setView('home');
                        }
                      }}
                      className="w-full py-6 bg-green-600 hover:bg-green-500 rounded-3xl text-2xl font-black shadow-2xl shadow-green-600/30 transition-all flex items-center justify-center gap-4 group"
                    >
                      <span>进图项目详情</span>
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Confirm Overlays */}
              <AnimatePresence>
                {showCancelUploadConfirm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8"
                  >
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-sm w-full space-y-8 text-center shadow-2xl">
                      <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-500">
                        <AlertCircle size={40} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white">确认取消上传？</h3>
                        <p className="text-white/40 leading-relaxed font-bold">
                          取消后需要重新从 0% 开始上传，是否确定？
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                          onClick={() => setShowCancelUploadConfirm(false)}
                          className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all text-white/60"
                        >
                          继续上传
                        </button>
                        <button 
                          onClick={() => {
                            setShowCancelUploadConfirm(false);
                            setUploadStatus('idle');
                            setUploadProgress(0);
                            setState(s => ({ ...s, mappingStatus: 'scanned' }));
                            setView('home');
                          }}
                          className="py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-bold transition-all text-white"
                        >
                          确认取消
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showCancelMappingConfirm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-8"
                  >
                    <div className="bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-sm w-full space-y-8 text-center shadow-2xl">
                      <div className="w-20 h-20 bg-orange-500/20 rounded-3xl flex items-center justify-center mx-auto text-orange-500">
                        <Zap size={40} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white">中止建图任务？</h3>
                        <p className="text-white/40 leading-relaxed font-bold">
                          停止云端算力调度，当前已产生的配额消耗将无法退还。
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                          onClick={() => setShowCancelMappingConfirm(false)}
                          className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all text-white/60"
                        >
                          维持现况
                        </button>
                        <button 
                          onClick={() => {
                            setShowCancelMappingConfirm(false);
                            setState(s => ({ ...s, mappingStatus: 'canceled' }));
                          }}
                          className="py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold transition-all text-white"
                        >
                          确认中断
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'quota_flow' && (
            <motion.div 
              key="quota_flow"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('home')} className="flex items-center gap-2 text-white/60">
                  <ChevronLeft size={24} />
                  <span className="text-xl">返回</span>
                </button>
                <button 
                  onClick={() => setView('recharge')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-all"
                >
                  时长充值
                </button>
              </div>

              <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/10 mb-8 text-center">
                <div className="text-white/40 mb-2">剩余云端建图时长</div>
                <div className="text-6xl font-black text-blue-400 mb-4">
                  {Math.floor(state.cloudQuota / 60)}h {state.cloudQuota % 60}m
                </div>
                <div className="text-white/20 text-sm">时长由云端建图实时同步</div>
              </div>

              <div className="flex-1 bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <span className="text-sm font-bold text-white/40 uppercase tracking-widest">额度流水</span>
                  <span className="text-[10px] text-white/20 font-mono">SN: {state.serialNumber}</span>
                </div>
                <div className="flex-1 overflow-y-auto relative">
                  {quotaFlows.slice().reverse().map((record, idx) => (
                    <div key={idx} className="px-6 py-4 border-b border-white/5 last:border-0 flex justify-between items-center group">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`font-bold ${record.type === 'pre_deduction' ? 'text-white/40' : 'text-white'}`}>
                            {record.mappingName || record.description}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            record.type === 'gift' || record.type === 'recharge' ? 'bg-green-500/20 text-green-400' :
                            record.type === 'pre_deduction' ? 'bg-white/5 text-white/20' :
                            record.type === 'refund' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {record.type === 'recharge' || record.type === 'gift' ? '充值' : 
                             record.type === 'pre_deduction' ? '预扣除' :
                             record.type === 'refund' ? '退款' : '扣除'}
                          </span>
                        </div>
                        <div className="text-xs text-white/20 mt-1">{record.date}</div>
                        {record.mappingName && (
                          <div className="text-[10px] text-white/10 mt-0.5 italic">{record.description}</div>
                        )}
                      </div>
                      <div className={`text-lg font-mono font-bold ${
                        record.type === 'pre_deduction' ? 'text-white/20' :
                        (record.type === 'consumption' || record.type === 'refund' && record.amount < 0) ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {record.amount > 0 ? '+' : ''}{record.amount} min
                      </div>
                    </div>
                  ))}
                  {quotaFlows.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p>暂无记录</p>
                    </div>
                  )}
                </div>
                <div className="bg-white/5 px-6 py-3 border-t border-white/5 flex items-start gap-3">
                  <Info size={14} className="text-white/20 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/20 leading-relaxed italic">
                    使用预扣除逻辑：建图开始时从时长中预扣除（冻结），若建图成功则转换为实际扣除，若建图失败则不扣除并取消该记录。
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'recharge' && (
            <motion.div 
              key="recharge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('quota_flow')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={24} />
                  <span className="text-xl">返回</span>
                </button>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                  <Database size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-white/60">当前余额: {state.cloudQuota} 分钟</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full gap-8">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-black">建立图时长充值</h2>
                  <p className="text-white/40 text-lg">套餐实时到账，支持多端共用</p>
                </div>

                {availablePackages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-6">
                      {availablePackages.map(pkg => (
                        <button 
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`p-8 rounded-[32px] border-2 transition-all relative overflow-hidden group ${
                            selectedPackage?.id === pkg.id 
                              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                              : 'border-white/5 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="text-2xl font-black mb-1">{pkg.duration} 分钟</div>
                          <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-8">
                            约 {Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m
                          </div>
                          
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-blue-400">¥</span>
                            <span className="text-4xl font-black text-blue-400">{pkg.price}</span>
                            {pkg.originalPrice && (
                              <span className="text-xs text-white/20 line-through font-bold ml-2">¥{pkg.originalPrice}</span>
                            )}
                          </div>

                          {pkg.originalPrice && (
                            <div className="absolute -top-1 -right-8 bg-red-500 text-white text-[8px] font-black py-4 px-10 rotate-45 shadow-lg uppercase tracking-tighter">
                              -{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% DISCOUNT
                            </div>
                          )}

                          {selectedPackage?.id === pkg.id && (
                            <div className="absolute top-6 right-6">
                              <CheckCircle2 size={24} className="text-blue-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-6">
                      <button 
                        onClick={() => { 
                          if (!selectedPackage) {
                            setAlert({ level: 'yellow', message: '请先选择一个充值套餐', blocking: false });
                            return;
                          }
                          setPaymentMethod('aggregate'); 
                          setPaymentCountdown(900);
                          setView('payment_qr'); 
                        }}
                        disabled={!selectedPackage}
                        className="w-full h-24 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-white/20 rounded-[32px] flex items-center justify-center gap-3 font-black text-2xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-white"
                      >
                        {selectedPackage ? `确认支付 ¥${selectedPackage.price}` : '请选择套餐'}
                      </button>
                      <p className="text-center text-white/20 text-xs">
                        充值即视为同意《云端建图服务协议》及《隐私政策》
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 bg-white/5 rounded-[40px] border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-white/20">
                      <CreditCard size={40} />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-bold">运营商正在补充库存</h3>
                       <p className="text-white/40">当前暂无可用套餐，请联系售后支持或稍后再试</p>
                    </div>
                    <button 
                      onClick={() => setView('quota_flow')}
                      className="px-8 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      返回账户概览
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'cloud_admin' && (
            <motion.div 
              key="cloud_admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-6 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('home')} className="p-2 hover:bg-white/10 rounded-full">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black">云端管理后台</h2>
                </div>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  <button 
                    onClick={() => setAdminTab('abnormal')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'abnormal' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    异常接入
                  </button>
                  <button 
                    onClick={() => setAdminTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    建图统计
                  </button>
                </div>
              </div>

              {adminTab === 'abnormal' ? (
                <div className="flex-1 bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                  <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-white/40 uppercase tracking-widest">异常接入请求列表</span>
                    <button 
                      onClick={fetchAbnormalRequests}
                      className="p-1 text-blue-400 hover:bg-blue-400/10 rounded"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {abnormalRequests.length > 0 ? (
                      abnormalRequests.map((req, idx) => (
                        <div key={idx} className="px-6 py-4 border-b border-white/5 last:border-0 flex justify-between items-center">
                          <div>
                            <div className="font-bold font-mono text-red-400">{req.machineCode}</div>
                            <div className="text-xs text-white/40 mt-1">
                              原因: {req.reason === 'SN_NOT_FOUND' ? 'SN 码不存在 (出厂未登记)' : req.reason}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">{new Date(req.timestamp).toLocaleString()}</div>
                            <div className="text-[10px] font-mono text-white/20 mt-1">Code: {req.activationCode}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <p>暂无异常接入记录</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                  <div className="px-6 py-4 bg-white/5 border-b border-white/5">
                    <span className="text-sm font-bold text-white/40 uppercase tracking-widest">全局建图任务记录</span>
                  </div>
                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          <th className="px-6 py-4">地图 ID/名称</th>
                          <th className="px-6 py-4">创建时间</th>
                          <th className="px-6 py-4">面积 (m²)</th>
                          <th className="px-6 py-4">状态/进度</th>
                          <th className="px-6 py-4">资源消耗</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingHistory.map((map) => (
                          <tr key={map.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold">{map.name}</div>
                              <div className="text-[10px] font-mono text-white/20">{map.id}</div>
                            </td>
                            <td className="px-6 py-4 text-xs text-white/40">{map.createdAt}</td>
                            <td className="px-6 py-4 font-mono">{map.area || '--'}</td>
                            <td className="px-6 py-4">
                              <div className={`text-xs font-bold ${
                                map.status === 'completed' ? 'text-green-400' :
                                map.status === 'mapping_failed' ? 'text-red-400' : 'text-blue-400 animate-pulse'
                              }`}>
                                {map.status === 'completed' ? '建图成功' : 
                                 map.status === 'mapping_failed' ? `失败 (${map.failureReason})` : `处理中 (${map.progress}%)`}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs">{map.size}</div>
                              <div className="text-[10px] text-white/20">{Math.floor((map.duration || 0) / 60)} min</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {view === 'payment_qr' && (
            <motion.div 
              key="payment_qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center -mt-4 gap-4"
            >
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#07C160]/20 text-[#07C160] flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#1677FF]/20 text-[#1677FF] flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter">扫码完成支付</h2>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xs text-white/40 font-bold uppercase">共计</span>
                  <span className="text-5xl font-black text-white">¥{selectedPackage ? selectedPackage.price * rechargeQuantity : 0}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-[32px] relative group shadow-2xl">
                <QrCode size={160} className="text-slate-900" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-[32px] p-2 text-center">
                  <div className="flex gap-1 mb-2">
                    <div className="w-8 h-8 bg-[#07C160] text-white rounded-lg flex items-center justify-center"><Smartphone size={16}/></div>
                    <div className="w-8 h-8 bg-[#1677FF] text-white rounded-lg flex items-center justify-center"><Smartphone size={16}/></div>
                  </div>
                  <p className="text-slate-900 font-bold text-[10px] leading-tight">
                    聚合支付测试<br/>
                    <span className="text-slate-400 font-normal">支持微信/支付宝</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-500 px-6 py-2 rounded-full border border-yellow-400/20">
                <Clock size={16} className="animate-pulse" />
                <span className="font-black font-mono text-lg">
                  {Math.floor(paymentCountdown / 60)}:{(paymentCountdown % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-col gap-3 w-full max-w-sm pt-2">
                <button 
                  onClick={pollPaymentStatus}
                  disabled={isPollingPayment}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-lg font-black shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPollingPayment ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      正在同步...
                    </>
                  ) : (
                    '我已完成支付'
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    setAlert({
                      level: 'yellow',
                      message: '确认退出？订单将失效',
                      onConfirm: () => {
                        setView('recharge');
                        setSelectedPackage(null);
                        setPaymentMethod(null);
                      }
                    });
                  }}
                  className="w-full h-8 text-white/20 hover:text-white transition-colors font-bold text-sm"
                >
                  取消支付并返回
                </button>
              </div>
            </motion.div>
          )}

          {view === 'mapping' && (
            <motion.div 
              key="mapping"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-12"
            >
              <div className="flex bg-slate-800/50 p-2 rounded-2xl border border-white/10">
                <button className={`flex-1 py-4 rounded-xl font-bold transition-all ${state.mappingStatus === 'uploading' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40'}`}>
                  1. 数据上传
                </button>
                <button className={`flex-1 py-4 rounded-xl font-bold transition-all ${(state.mappingStatus === 'mapping' || state.mappingStatus === 'uploaded') ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40'}`}>
                  2. 云端建图
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-12">
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <motion.circle 
                      cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      className={state.mappingStatus === 'uploading' ? 'text-blue-500' : 'text-purple-500'}
                      strokeDasharray="754"
                      initial={{ strokeDashoffset: 754 }}
                      animate={{ strokeDashoffset: 754 - (754 * state.progress) / 100 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black font-mono">{state.progress}%</span>
                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2 text-center px-4 leading-tight">
                      {state.mappingStatus === 'uploading' ? '数据上传中' : '执行稠密重建与回环检测'}
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-md grid grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-white/20 text-[10px] font-bold uppercase mb-1">实时速度</div>
                    <div className="text-xl font-mono font-bold">12.5 MB/s</div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-white/20 text-[10px] font-bold uppercase mb-1">预计剩余</div>
                    <div className="text-xl font-mono font-bold">02:45</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowExitConfirm(true)}
                className="h-20 bg-slate-800 border border-white/10 rounded-2xl text-xl font-bold hover:bg-slate-700 transition-all"
              >
                退出并返回首页
              </button>
            </motion.div>
          )}

          {view === 'download' && selectedMap && (
            <motion.div 
              key="download"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-8"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-white/60 mb-4">
                <ChevronLeft size={24} />
                <span className="text-xl">返回项目列表</span>
              </button>

              <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/10 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Database size={40} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{selectedMap.name}</h2>
                    <p className="text-white/40">{selectedMap.createdAt} | {selectedMap.size}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="text-white/40 font-bold uppercase tracking-widest text-xs">选择下载格式</div>
                  <div className="grid grid-cols-3 gap-4">
                    {['PLY', 'LAS', 'XYZ'].map(format => (
                      <button 
                        key={format}
                        onClick={() => setShowQR(true)}
                        className="h-20 bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all"
                      >
                        <FileDown size={24} className="text-blue-400" />
                        <span className="font-bold">{format}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setMaps(prev => prev.filter(m => m.id !== selectedMap.id));
                      setView('home');
                      setAlert({ level: 'yellow', message: '项目已删除', blocking: false });
                    }}
                    className="w-full h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all"
                  >
                    删除项目
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'about' && (
            <motion.div 
              key="about"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-white/60 mb-8">
                <ChevronLeft size={24} />
                <span className="text-xl">返回</span>
              </button>

              <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/10 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-white/40 text-lg">设备型号</span>
                  <span className="text-xl font-bold">DDT-X1 Mapping Bot</span>
                </div>
                <div 
                  onClick={handleAboutClick}
                  className="flex justify-between items-center border-b border-white/5 pb-6 cursor-pointer active:bg-white/5 transition-colors"
                >
                  <span className="text-white/40 text-lg">序列号</span>
                  <span className="text-xl font-mono">{state.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-white/40 text-lg">保障状态</span>
                  <div className="text-right">
                    {state.warranty ? (
                      <>
                        <span className={`text-xl font-bold ${new Date(state.warranty.expiryDate) > new Date() ? 'text-green-400' : 'text-red-400'}`}>
                          {new Date(state.warranty.expiryDate) > new Date() ? '保障中' : '已过期'}
                        </span>
                        <div className="text-sm text-white/40 mt-1">
                          {new Date(state.warranty.expiryDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-white/20">未激活</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-white/40 text-lg">RCS 版本</span>
                  <button 
                    onClick={() => {
                      setView('update_check');
                      checkUpdates();
                    }}
                    className="text-xl font-mono font-bold text-blue-400 hover:underline"
                  >
                    {state.version}
                  </button>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                  <span className="text-white/40 text-lg">存储信息</span>
                  <div className="text-right">
                    <span className="text-xl font-bold">{state.storage}G / {state.totalStorage}G</span>
                    <button 
                      onClick={() => setShowFormatConfirm(true)}
                      className="ml-4 px-4 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-all"
                    >
                      格式化
                    </button>
                  </div>
                </div>

                <div 
                  onClick={() => setShowResetConfirm(true)}
                  className="flex justify-between items-center cursor-pointer active:bg-white/5 transition-colors"
                >
                  <span className="text-white/40 text-lg">重置选项</span>
                  <ChevronRight size={24} className="text-white/40" />
                </div>

                {state.isDeveloperMode && (
                  <button 
                    onClick={disableDeveloperMode}
                    className="w-full py-4 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl font-bold hover:bg-amber-500/30 transition-all active:scale-95"
                  >
                    关闭开发者模式
                  </button>
                )}

                <div 
                  className="mt-12 p-8 border-2 border-dashed border-white/5 rounded-2xl text-center"
                >
                  <div className="text-white/20 text-sm mb-2">点击此处查看法律声明</div>
                  <div className="text-white/10 text-xs italic">© 2024 千巡科技 (DDT) 版权所有</div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Restart Confirmation Modal */}
      <AnimatePresence>
        {showRestartConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-4xl p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw size={40} className="text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">更新已就绪</h3>
                <p className="text-white/40 leading-relaxed">
                  RCS 软件更新已完成安装，需要重启系统以应用更改。
                </p>
              </div>
              <button 
                onClick={handleRestart}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95"
              >
                立即重启
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Exit Confirmation Modal */}
      <AnimatePresence>
        {showUploadExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadExitConfirm(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-4xl p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">确认取消上传？</h2>
                <p className="text-white/40 leading-relaxed">
                  当前建图包尚未上传完成。如果现在退出，上传任务将被取消，下次需从头开始重传。
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowUploadExitConfirm(false)}
                  className="flex-1 h-16 bg-slate-800 border border-white/10 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  继续上传
                </button>
                <button 
                  onClick={() => {
                    setShowUploadExitConfirm(false);
                    setState(prev => ({ ...prev, mappingStatus: 'idle', progress: 0 }));
                    setActiveCloudTasks(curr => Math.max(0, curr - 1));
                    setView('home');
                  }}
                  className="flex-1 h-16 bg-red-600 hover:bg-red-500 rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  确认取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format Confirmation Modal */}
      <AnimatePresence>
        {showFormatConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFormatConfirm(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-4xl p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} className="text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-red-400">确认格式化？</h3>
                <p className="text-white/40 leading-relaxed">
                  格式化将永久删除所有本地数据，包括未上传云端建图的部分。此操作不可撤销。
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowFormatConfirm(false)}
                  className="flex-1 h-16 bg-slate-800 rounded-2xl font-bold"
                >
                  取消
                </button>
                <button 
                  onClick={handleFormat}
                  className="flex-1 h-16 bg-red-600 rounded-2xl font-bold"
                >
                  确认格式化
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-4xl p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={40} className="text-orange-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">确认退出？</h3>
                <p className="text-white/40">建图将在云端后台继续运行，您可以在“最近项目”中查看进度。</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 h-16 bg-slate-800 rounded-2xl font-bold"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    setShowExitConfirm(false);
                    setView('home');
                    setState(prev => ({ ...prev, mappingStatus: 'idle' }));
                  }}
                  className="flex-1 h-16 bg-blue-600 rounded-2xl font-bold"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bag Export QR Modal */}
      <AnimatePresence>
        {showBagQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-[120] flex items-center justify-center p-12"
          >
            <div className="bg-white p-10 rounded-[40px] flex flex-col items-center gap-6 w-full max-w-md">
              <div className="w-full flex justify-between items-center text-slate-900 mb-2">
                <h3 className="text-xl font-black">导出 Bag 数据包</h3>
                <button onClick={() => setShowBagQR(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="w-56 h-56 bg-slate-100 rounded-3xl flex items-center justify-center p-4">
                <QrCode size={180} className="text-slate-900" />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  请确保您的电脑与 RCS 设备连接在<strong>同一个局域网</strong>下，否则无法下载。
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => {
                    setShowBagQR(false);
                    setAlert({ level: 'yellow', message: '已开始下载 Bag 数据包', blocking: false });
                  }}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-bold flex flex-col items-center gap-1"
                >
                  <Download size={20} />
                  <span className="text-xs">下载地图</span>
                </button>
                <button 
                  onClick={() => {
                    setShowBagQR(false);
                    setAlert({ level: 'yellow', message: '链接已复制到剪贴板', blocking: false });
                  }}
                  className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold flex flex-col items-center gap-1"
                >
                  <FileText size={20} />
                  <span className="text-xs">复制链接</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-12"
          >
            <div className="bg-white p-12 rounded-4xl flex flex-col items-center gap-8">
              <div 
                className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center cursor-pointer relative group"
                onClick={() => {
                  setShowQR(false);
                  setShowQRPrompt(true);
                }}
              >
                <QrCode size={200} className="text-slate-900" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                  <span className="text-white font-bold">模拟扫码</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 text-2xl font-black mb-2">扫码下载地图</h3>
                <p className="text-slate-500">请使用 DDT Studio 扫码</p>
              </div>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl"
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scan Result Prompt */}
      <AnimatePresence>
        {showQRPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowQRPrompt(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-4xl p-10 w-full max-w-md text-center space-y-8"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={40} className="text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">扫码成功</h3>
                <p className="text-slate-500">已识别到云端地图项目：{selectedMap?.name}</p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowQRPrompt(false);
                    setAlert({ level: 'yellow', message: '正在加载云端地图预览...', blocking: false });
                  }}
                  className="w-full h-16 bg-blue-600 text-white rounded-2xl font-bold text-lg"
                >
                  访问云端地图
                </button>
                <button 
                  onClick={() => {
                    setShowQRPrompt(false);
                    setAlert({ level: 'yellow', message: '地图已开始下载到本地', blocking: false });
                  }}
                  className="w-full h-16 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg"
                >
                  下载到本地
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Factory Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[120] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/10 rounded-[48px] p-12 w-full max-w-xl text-center space-y-10"
            >
              <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={64} className="text-red-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-red-500">恢复出厂设置</h3>
                <p className="text-white/60 text-xl leading-relaxed">
                  清除所有用户数据，请做好备份，恢复所有用户设置到出厂状态。
                </p>
              </div>
              <div className="flex gap-6 pt-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 h-24 bg-slate-800 rounded-3xl text-2xl font-black transition-all active:scale-95"
                >
                  取消
                </button>
                <button 
                  onClick={handleFactoryReset}
                  className="flex-1 h-24 bg-red-600 hover:bg-red-500 rounded-3xl text-2xl font-black shadow-2xl shadow-red-600/20 transition-all active:scale-95"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resetting Overlay */}
      <AnimatePresence>
        {isResetting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <RefreshCw size={80} className="text-blue-500" />
              <div className="absolute inset-0 blur-xl bg-blue-500/20" />
            </motion.div>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter">正在重置和重启</h2>
              <p className="text-white/40 text-lg uppercase tracking-[0.2em]">系统正在清理数据并重启，请勿切断电源</p>
            </div>
            
            {/* Progress indicator */}
            <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mt-8">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Machine Code */}
      <AnimatePresence>
        {showMachineCodeQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-12"
          >
            <div className="bg-white p-12 rounded-4xl flex flex-col items-center gap-8">
              <div className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center">
                <QrCode size={200} className="text-slate-900" />
              </div>
              <div className="text-center">
                <h3 className="text-slate-900 text-2xl font-black mb-2">设备机器码</h3>
                <p className="text-slate-500 font-mono font-bold text-lg">{state.machineCode}</p>
                <p className="text-slate-400 text-sm mt-2">请使用 KOS 运营系统扫码激活</p>
              </div>
              <button 
                onClick={() => setShowMachineCodeQR(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl"
              >
                关闭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
