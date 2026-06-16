import React, { useState } from 'react';
import { 
  Cloud, 
  Users, 
  CreditCard, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Search, 
  Bell, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Zap,
  Plus,
  Tablet,
  Info,
  Settings,
  X,
  ChevronRight,
  LogOut,
  User,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { globalStore } from '../services/store';

const data = [
  { name: '04-01', tasks: 45, compute: 78 },
  { name: '04-02', tasks: 52, compute: 82 },
  { name: '04-03', tasks: 38, compute: 65 },
  { name: '04-04', tasks: 65, compute: 92 },
  { name: '04-05', tasks: 48, compute: 75 },
  { name: '04-06', tasks: 72, compute: 95 },
  { name: '04-07', tasks: 58, compute: 85 },
];

const users = [
  { id: 'U001', name: '千巡科技-研发部', balance: 12450.00, status: 'Active', usage: 124 },
  { id: 'U002', name: '顺丰速运-华东分拨', balance: 8500.25, status: 'Active', usage: 89 },
  { id: 'U003', name: '京东物流-北京仓', balance: 3200.00, status: 'Warning', usage: 245 },
  { id: 'U004', name: '美团配送-上海站', balance: 15000.50, status: 'Active', usage: 56 },
];

interface CloudAdminProps {
  onLogout?: () => void;
}

export const CloudAdmin: React.FC<CloudAdminProps> = ({ onLogout }) => {
  const user = globalStore.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'quota' | 'history' | 'packages'>('overview');
  const [packages, setPackages] = useState(globalStore.getPackages());
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newPkg, setNewPkg] = useState({ duration: '', price: '', originalPrice: '' });

  const handleAddPackage = () => {
    const duration = parseInt(newPkg.duration);
    const price = parseInt(newPkg.price);
    const originalPrice = newPkg.originalPrice ? parseInt(newPkg.originalPrice) : undefined;
    
    if (isNaN(duration) || duration < 1 || duration > 10000) {
      alert('时长必须为 1-10000 之间的整数');
      return;
    }
    if (isNaN(price) || price < 1 || price > 9999) {
      alert('现价必须为 1-9999 之间的整数');
      return;
    }

    globalStore.addPackage({ 
      duration, 
      price, 
      originalPrice: (originalPrice && originalPrice > price) ? originalPrice : undefined 
    });
    setPackages(globalStore.getPackages());
    setIsPackageModalOpen(false);
    setNewPkg({ duration: '', price: '', originalPrice: '' });
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('确定要删除该套餐吗？')) {
      globalStore.deletePackage(id);
      setPackages(globalStore.getPackages());
    }
  };

  const handleToggleStatus = (id: string) => {
    globalStore.togglePackageStatus(id);
    setPackages(globalStore.getPackages());
  };
  const [deviceTab, setDeviceTab] = useState<'mapping' | 'host' | 'fault'>('mapping');
  const [showAlgoConfig, setShowAlgoConfig] = useState(false);
  const [faultHistory, setFaultHistory] = useState([
    { id: 'F_001', sn: 'DDT-SN-20231101', title: 'IMU 传感器丢失', time: '2026-04-20 14:22:05', details: { code: 'ERR_IMU_LOST', raw: 'Sensor data stream interrupted', stack: 'imu_driver.cc:142' } },
    { id: 'F_002', sn: 'DDT-SN-20231215', title: 'NVMe 存储空间异常', time: '2026-04-19 10:15:30', details: { code: 'ERR_STORAGE_FAIL', volume: '/dev/nvme0n1p3', status: 'read-only' } },
    { id: 'F_003', sn: 'DDT-SN-20231101', title: '算力节点连接超时', time: '2026-04-18 16:45:10', details: { code: 'ERR_CLOUD_TIMEOUT', peer: '10.244.1.42', latency: '>5000ms' } },
  ]);

  const [selectedFault, setSelectedFault] = useState<any>(null);
  const [faultFilters, setFaultFilters] = useState({ title: '', sn: '' });
  const [quotaHistory, setQuotaHistory] = useState<any[]>([
    { id: 'q1', sn: 'DDT-SN-20231101', date: '2023-11-01', amount: 1000, type: 'recharge', remark: '充值首次激活赠送' },
    { id: 'q2', sn: 'DDT-SN-20231101', date: '2023-11-05', amount: -50, type: 'consumption', remark: '扣除，建图成功' },
    { id: 'q3', sn: 'DDT-SN-20231215', date: '2023-12-15', amount: 1000, type: 'recharge', remark: '首次激活赠送' },
    { id: 'q4', sn: 'DDT-SN-20231215', date: '2026-04-20', amount: -20, type: 'pre_deduction', remark: '预扣除，开始建图' },
  ]);

  const [algorithmConfig, setAlgorithmConfig] = useState({
    version: 'v1.2.0-效率优化'
  });

  const [mappingHistory, setMappingHistory] = useState([
    { id: 'MAP_001', area: '1240', status: 'completed', progress: 100, size: '422 MB', createdAt: '2026-04-13 13:41:20', duration: 387, type: 'cloud', errorCode: '' },
    { id: 'MAP_002', area: '850', status: 'completed', progress: 100, size: '215 MB', createdAt: '2026-04-12 10:15:45', duration: 245, type: 'local', errorCode: '' },
    { id: 'MAP_003', area: '2100', status: 'mapping_failed', progress: 45, size: '1.2 GB', createdAt: '2026-04-11 16:20:10', duration: null, type: 'cloud', errorCode: 'ERR_COMPUTE_TIMEOUT' },
    { id: 'MAP_004', area: '', status: 'mapping', progress: 65, size: '890 MB', createdAt: '2026-04-15 09:30:00', duration: null, type: 'cloud', errorCode: '' },
  ]);

  const [deviceStats, setDeviceStats] = useState([
    { sn: 'DDT-SN-20231101', activationDate: '2023-11-01', successCount: 90, totalCount: 124, remainingQuota: 100 },
    { sn: 'DDT-SN-20231215', activationDate: '2023-12-15', successCount: 45, totalCount: 52, remainingQuota: 850 },
  ]);

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaTargetDevice, setQuotaTargetDevice] = useState<any>(null);
  const [quotaAction, setQuotaAction] = useState<'gift' | 'collect'>('gift');
  const [quotaAmount, setQuotaAmount] = useState<string>('');
  const [quotaRemark, setQuotaRemark] = useState('');

  const [isRefundExecuting, setIsRefundExecuting] = useState(false);

  const executeRefund = () => {
    if (!quotaTargetDevice || !quotaAmount) return;
    
    const amount = parseInt(quotaAmount);
    if (isNaN(amount) || amount < 1) {
      alert('单次变更时长最小为 1 分钟');
      return;
    }

    const maxRefundable = (quotaTargetDevice.amount || 0) - (quotaTargetDevice.refunded || 0);
    if (amount > maxRefundable) {
      alert(`回收时长超过充值剩余时长，当前剩余：${maxRefundable} 分钟`);
      return;
    }

    setIsRefundExecuting(true);
    
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      
      const newRecord = {
        id: Math.random().toString(36).substr(2, 9),
        sn: quotaTargetDevice.sn,
        date: dateStr,
        amount: -amount,
        type: 'refund',
        remark: quotaRemark || '退款，用户退款扣除'
      };

      setQuotaHistory(prev => {
        // Update the original recharge record's refunded amount
        return [newRecord, ...prev.map(item => 
          item.id === quotaTargetDevice.id 
            ? { ...item, refunded: (item.refunded || 0) + amount } 
            : item
        )];
      });

      // Update device stats remaining quota
      setDeviceStats(prev => prev.map(d => 
        d.sn === quotaTargetDevice.sn 
          ? { ...d, remainingQuota: Math.max(0, d.remainingQuota - amount) } 
          : d
      ));

      alert('扣除成功，请在商户后台手动退款');
      setIsQuotaModalOpen(false);
      setQuotaAmount('');
      setQuotaRemark('');
      setQuotaTargetDevice(null);
      setIsRefundExecuting(false);
    }, 1000);
  };

  const [hostStats, setHostStats] = useState([
    { name: 'WORKSTATION-01', activationDate: '2023-10-20', mappingCount: 156, os: 'Windows 11 Pro', cpu: 'Intel i9-13900K', gpu: 'NVIDIA RTX 4090' },
    { name: 'LAPTOP-DEV-02', activationDate: '2023-11-12', mappingCount: 42, os: 'Windows 10 Enterprise', cpu: 'AMD Ryzen 9 7950X', gpu: 'NVIDIA RTX 3080 Ti' },
  ]);

  const [historyFilter, setHistoryFilter] = useState('all');

  const [quotaFilters, setQuotaFilters] = useState({ sn: '', type: 'all', date: '', remark: '' });
  const [historyTableFilters, setHistoryTableFilters] = useState({ id: '', status: 'all', date: '', type: 'all' });
  const [deviceFilters, setDeviceFilters] = useState({ sn: '', activationDate: '' });
  const [hostFilters, setHostFilters] = useState({ name: '', activationDate: '' });

  // Listen for activations
  React.useEffect(() => {
    const handleDeviceActivated = (e: any) => {
      const { sn } = e.detail;
      setQuotaHistory(prev => [{
        sn,
        date: new Date().toISOString().split('T')[0],
        amount: 1000,
        type: 'recharge',
        remark: '首次激活赠送'
      }, ...prev]);
    };

    window.addEventListener('device-activated', handleDeviceActivated);
    return () => window.removeEventListener('device-activated', handleDeviceActivated);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <div className="text-white/40 text-sm font-medium mb-1">{title}</div>
        <div className="text-3xl font-black">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="h-20 bg-slate-900/50 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Cloud size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">云端建图管理后台</h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white/60">云端节点: 124/128 在线</span>
          </div>
          <div className="flex items-center gap-6 text-white/40">
            <Search size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Bell size={20} className="hover:text-white cursor-pointer transition-colors" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/10" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-slate-900/30 border-r border-white/5 p-8 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <BarChart3 size={20} />
            <span>概览</span>
          </button>
          <button 
            onClick={() => setActiveTab('quota')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'quota' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Zap size={20} />
            <span>额度流水</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <Database size={20} />
            <span>建图统计</span>
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'packages' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            <CreditCard size={20} />
            <span>套餐配置</span>
          </button>
          
          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <button 
              onClick={() => setShowAlgoConfig(true)}
              className="flex items-center gap-4 px-6 py-4 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all w-full text-left"
            >
              <Settings size={20} />
              <span>算法配置</span>
            </button>
          </div>

          <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="m-auto mt-2 text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black truncate">{user?.username || '用户'}</div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">{user?.roles?.join(' / ')}</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold"
            >
              <LogOut size={20} />
              <span>退出系统</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-4 gap-6">
                <StatCard title="今日建图任务" value="1,245" change={12.5} icon={Activity} color="blue" />
                <StatCard title="活跃设备数" value="892" change={4.2} icon={Users} color="purple" />
                <StatCard title="云端存储占用" value="4.2 PB" change={-2.1} icon={Database} color="amber" />
                <StatCard title="建图算力利用率" value="92.4%" change={8.7} icon={Zap} color="green" />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-slate-900 border border-white/5 rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold">任务并发趋势</h3>
                    <div className="flex gap-4 text-xs font-bold">
                      <div className="flex items-center gap-2 text-blue-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" /> 任务数
                      </div>
                      <div className="flex items-center gap-2 text-purple-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" /> 算力消耗
                      </div>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                        <Area type="monotone" dataKey="compute" stroke="#a855f7" strokeWidth={3} fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold mb-8">算力节点分布</h3>
                  <div className="space-y-6">
                    {['华东-上海', '华北-北京', '华南-深圳', '西南-成都'].map((region, i) => (
                      <div key={region}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/60">{region}</span>
                          <span className="font-mono font-bold">{[85, 92, 78, 64][i]}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-${['blue', 'purple', 'green', 'amber'][i]}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${[85, 92, 78, 64][i]}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quota' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">额度流水</h2>
                <div className="text-sm text-white/40">
                  云端建图设备额度流水
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4 items-center">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="筛选设备 SN..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                      value={quotaFilters.sn}
                      onChange={(e) => setQuotaFilters(prev => ({ ...prev, sn: e.target.value }))}
                    />
                  </div>
                  <div className="w-32">
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-bold"
                      value={quotaFilters.type}
                      onChange={(e) => setQuotaFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="all">全部类型</option>
                      <option value="recharge">充值</option>
                      <option value="pre_deduction">预扣除</option>
                      <option value="consumption">扣除</option>
                      <option value="refund">退款</option>
                    </select>
                  </div>
                  <div className="w-40">
                    <input 
                      type="text" 
                      placeholder="筛选时间..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                      value={quotaFilters.date}
                      onChange={(e) => setQuotaFilters(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="筛选备注..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                      value={quotaFilters.remark}
                      onChange={(e) => setQuotaFilters(prev => ({ ...prev, remark: e.target.value }))}
                    />
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                      <th className="px-8 py-6 font-medium">设备 SN</th>
                      <th className="px-8 py-6 font-medium">变更类型</th>
                      <th className="px-8 py-6 font-medium">变更数量</th>
                      <th className="px-8 py-6 font-medium">变更时间</th>
                      <th className="px-8 py-6 font-medium">备注文本</th>
                      <th className="px-8 py-6 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {quotaHistory
                      .filter(item => item.sn.toLowerCase().includes(quotaFilters.sn.toLowerCase()))
                      .filter(item => quotaFilters.type === 'all' || item.type === quotaFilters.type)
                      .filter(item => item.date.includes(quotaFilters.date))
                      .filter(item => item.remark.toLowerCase().includes(quotaFilters.remark.toLowerCase()))
                      .map((item, i) => (
                        <tr key={item.id || i} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 font-mono font-bold text-blue-400">{item.sn}</td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.type === 'recharge' ? 'bg-green-500/10 text-green-400' : 
                            item.type === 'pre_deduction' ? 'bg-white/5 text-white/40' :
                            item.type === 'refund' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {item.type === 'recharge' ? '充值' : 
                             item.type === 'pre_deduction' ? '预扣除' :
                             item.type === 'refund' ? '退款' : '扣除'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`flex items-center gap-2 font-bold ${
                            item.type === 'pre_deduction' ? 'text-white/40' :
                            item.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {item.amount > 0 ? `+${item.amount}` : item.amount}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-white/40">{item.date}</td>
                        <td className="px-8 py-6 text-white/60 text-sm whitespace-pre-wrap max-w-xs">{item.remark}</td>
                        <td className="px-8 py-6 text-right">
                          {item.type === 'recharge' && (
                            <button 
                              onClick={() => {
                                setQuotaTargetDevice(item);
                                setQuotaAmount('');
                                setQuotaRemark('');
                                setIsQuotaModalOpen(true);
                              }}
                              className="px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                            >
                              退款
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">建图统计</h2>
                <div className="flex gap-4">
                  <select 
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none"
                  >
                    <option value="all">全部状态</option>
                    <option value="completed">建图成功</option>
                    <option value="mapping_failed">建图失败</option>
                    <option value="mapping">进行中</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4 items-center">
                  <div className="w-48">
                    <input 
                      type="text" 
                      placeholder="筛选 ID..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                      value={historyTableFilters.id}
                      onChange={(e) => setHistoryTableFilters(prev => ({ ...prev, id: e.target.value }))}
                    />
                  </div>
                  <div className="w-40">
                    <input 
                      type="text" 
                      placeholder="筛选创建时间..." 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                      value={historyTableFilters.date}
                      onChange={(e) => setHistoryTableFilters(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="w-32">
                    <select 
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-bold"
                      value={historyTableFilters.status}
                      onChange={(e) => setHistoryTableFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="all">全部状态</option>
                      <option value="completed">成功</option>
                      <option value="mapping_failed">失败</option>
                      <option value="mapping">进行中</option>
                    </select>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                      <th className="px-6 py-6 font-medium">地图 ID</th>
                      <th className="px-6 py-6 font-medium">建图种类</th>
                      <th className="px-6 py-6 font-medium">面积 (m²)</th>
                      <th className="px-6 py-6 font-medium">包大小</th>
                      <th className="px-6 py-6 font-medium">创建时间</th>
                      <th className="px-6 py-6 font-medium">建图时长</th>
                      <th className="px-6 py-6 font-medium">异常原因</th>
                      <th className="px-6 py-6 font-medium">状态 / 进度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mappingHistory
                      .filter(m => m.type === 'cloud') // Cloud only
                      .filter(m => historyFilter === 'all' || m.status === historyFilter)
                      .filter(m => historyTableFilters.status === 'all' || m.status === historyTableFilters.status)
                      .filter(m => m.id.toLowerCase().includes(historyTableFilters.id.toLowerCase()))
                      .filter(m => m.createdAt.includes(historyTableFilters.date))
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-6 font-bold">{item.id}</td>
                          <td className="px-6 py-6">
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400">
                              云端
                            </span>
                          </td>
                          <td className="px-6 py-6 text-white/60">{item.area ? `${item.area} 平方米` : '--'}</td>
                          <td className="px-6 py-6 text-white/60">{item.size}</td>
                          <td className="px-6 py-6 text-white/40 text-xs">{item.createdAt}</td>
                          <td className="px-6 py-6 font-mono text-sm">
                            {item.status === 'completed' && item.duration ? (
                              `${Math.floor(item.duration / 60)}时${item.duration % 60}分 (${item.duration}分钟)`
                            ) : '--'}
                          </td>
                          <td className="px-6 py-6 text-red-400 font-mono text-xs">{item.errorCode || '--'}</td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-2">
                              <span className={`text-[10px] font-bold uppercase ${
                                item.status === 'completed' ? 'text-green-400' :
                                item.status === 'mapping_failed' ? 'text-red-400' : 'text-blue-400'
                              }`}>
                                {item.status === 'completed' ? '成功' : 
                                 item.status === 'mapping_failed' ? '失败' : `进行中 (${item.progress}%)`}
                              </span>
                              {item.status === 'mapping' && (
                                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500" style={{ width: `${item.progress}%` }} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">套餐配置</h2>
                <button 
                  onClick={() => setIsPackageModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Plus size={20} />
                  新增套餐
                </button>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                      <th className="px-10 py-6 font-medium">套餐时长</th>
                      <th className="px-10 py-6 font-medium">价格/折扣</th>
                      <th className="px-10 py-6 font-medium">当前状态</th>
                      <th className="px-10 py-6 font-medium">创建日期</th>
                      <th className="px-10 py-6 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {packages.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-xl font-black">{pkg.duration} 分钟</span>
                            <span className="text-xs text-white/40 uppercase tracking-widest">({Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m)</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-2xl font-black text-green-400">¥{pkg.price}</span>
                            {pkg.originalPrice && (
                              <div className="flex flex-col">
                                <span className="text-xs text-white/20 line-through font-bold">¥{pkg.originalPrice}</span>
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase">-{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${pkg.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${pkg.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                              {pkg.status === 'active' ? '已上架' : '已下架'}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-white/40 font-bold">{pkg.createdAt}</td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleToggleStatus(pkg.id)}
                              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border ${
                                pkg.status === 'active' 
                                  ? 'bg-amber-600/10 text-amber-500 border-amber-500/20 hover:bg-amber-600 hover:text-white' 
                                  : 'bg-green-600/10 text-green-500 border-green-500/20 hover:bg-green-600 hover:text-white'
                              }`}
                            >
                              {pkg.status === 'active' ? '下架' : '上架'}
                            </button>
                            <button 
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg font-bold text-xs transition-all border border-red-500/20"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {packages.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 text-center text-white/20 font-bold">
                          暂无套餐，请点击右上方按钮添加
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">设备统计</h2>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setDeviceTab('mapping')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${deviceTab === 'mapping' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    建图设备
                  </button>
                  <button 
                    onClick={() => setDeviceTab('host')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${deviceTab === 'host' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    DDT Studio 主机
                  </button>
                  <button 
                    onClick={() => setDeviceTab('fault')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${deviceTab === 'fault' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    故障历史
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                {deviceTab === 'mapping' ? (
                  <>
                    <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4 items-center">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="筛选 SN..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={deviceFilters.sn}
                          onChange={(e) => setDeviceFilters(prev => ({ ...prev, sn: e.target.value }))}
                        />
                      </div>
                      <div className="w-48">
                        <input 
                          type="text" 
                          placeholder="筛选激活时间..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={deviceFilters.activationDate}
                          onChange={(e) => setDeviceFilters(prev => ({ ...prev, activationDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                          <th className="px-8 py-6 font-medium">设备 SN</th>
                          <th className="px-8 py-6 font-medium">激活时间</th>
                          <th className="px-8 py-6 font-medium">累计建图次数 (成功/总)</th>
                          <th className="px-8 py-6 font-medium">剩余建图时长</th>
                          <th className="px-8 py-6 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {deviceStats
                          .filter(d => d.sn.toLowerCase().includes(deviceFilters.sn.toLowerCase()))
                          .filter(d => d.activationDate.includes(deviceFilters.activationDate))
                          .map(device => (
                            <tr key={device.sn} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-6 font-mono font-bold text-blue-400">{device.sn}</td>
                              <td className="px-8 py-6 text-white/40">{device.activationDate}</td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold">{device.successCount}/{device.totalCount} 次</span>
                                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500" 
                                      style={{ width: `${(device.successCount / device.totalCount) * 100}%` }} 
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="text-xl font-black text-white">
                                  {device.remainingQuota.toLocaleString()} <span className="text-xs text-white/40 font-normal">分钟</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => {
                                    setQuotaTargetDevice(device);
                                    setIsQuotaModalOpen(true);
                                  }}
                                  className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-all border border-blue-500/20"
                                >
                                  时长变更
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                ) : deviceTab === 'host' ? (
                  <>
                    <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4 items-center">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="筛选名称..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={hostFilters.name}
                          onChange={(e) => setHostFilters(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="w-48">
                        <input 
                          type="text" 
                          placeholder="筛选激活时间..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={hostFilters.activationDate}
                          onChange={(e) => setHostFilters(prev => ({ ...prev, activationDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                          <th className="px-8 py-6 font-medium">设备名称</th>
                          <th className="px-8 py-6 font-medium">激活时间</th>
                          <th className="px-8 py-6 font-medium">累计建图次数</th>
                          <th className="px-8 py-6 font-medium">系统 / 硬件</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {hostStats
                          .filter(h => h.name.toLowerCase().includes(hostFilters.name.toLowerCase()))
                          .filter(h => h.activationDate.includes(hostFilters.activationDate))
                          .map(host => (
                            <tr key={host.name} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-6 font-bold">{host.name}</td>
                              <td className="px-8 py-6 text-white/40">{host.activationDate}</td>
                              <td className="px-8 py-6 font-mono font-bold">{host.mappingCount} 次</td>
                              <td className="px-8 py-6">
                                <div className="flex flex-col gap-1">
                                  <div className="text-xs font-bold">{host.os}</div>
                                  <div className="text-[10px] text-white/40">{host.cpu} | {host.gpu}</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4 items-center">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="筛选故障标题..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={faultFilters.title}
                          onChange={(e) => setFaultFilters(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="筛选设备 SN..." 
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs outline-none focus:border-blue-500"
                          value={faultFilters.sn}
                          onChange={(e) => setFaultFilters(prev => ({ ...prev, sn: e.target.value }))}
                        />
                      </div>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/5">
                          <th className="px-8 py-6 font-medium">故障标题</th>
                          <th className="px-8 py-6 font-medium">设备 SN</th>
                          <th className="px-8 py-6 font-medium">发生时间</th>
                          <th className="px-8 py-6 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {faultHistory
                          .filter(f => f.title.toLowerCase().includes(faultFilters.title.toLowerCase()))
                          .filter(f => f.sn.toLowerCase().includes(faultFilters.sn.toLowerCase()))
                          .map((fault, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="font-bold">{fault.title}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-mono text-blue-400">{fault.sn}</td>
                            <td className="px-8 py-6 text-white/40">{fault.time}</td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => setSelectedFault(fault)}
                                className="px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg font-bold text-xs transition-all border border-red-500/20"
                              >
                                详情 (JSON)
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fault Detail Modal */}
      <AnimatePresence>
        {isPackageModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
              onClick={() => setIsPackageModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black">新增时长套餐</h3>
                  <X size={24} className="text-white/40 cursor-pointer" onClick={() => setIsPackageModalOpen(false)} />
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">套餐时长 (1-10000 分钟)</label>
                    <input 
                      type="number"
                      placeholder="输入时长..."
                      className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl px-6 text-xl font-bold outline-none focus:border-blue-500 transition-all"
                      value={newPkg.duration}
                      onChange={(e) => setNewPkg(p => ({ ...p, duration: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">现价 (1-9999 元)</label>
                    <input 
                      type="number"
                      placeholder="设置目前售价..."
                      className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl px-6 text-xl font-bold outline-none focus:border-blue-500 transition-all text-green-400"
                      value={newPkg.price}
                      onChange={(e) => setNewPkg(p => ({ ...p, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">原价 (可选，展示折扣)</label>
                    <input 
                      type="number"
                      placeholder="设置原始价格..."
                      className="w-full h-16 bg-slate-800 border border-white/10 rounded-2xl px-6 text-xl font-bold outline-none focus:border-blue-500 transition-all text-white/20"
                      value={newPkg.originalPrice}
                      onChange={(e) => setNewPkg(p => ({ ...p, originalPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsPackageModalOpen(false)}
                    className="flex-1 h-16 bg-white/5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleAddPackage}
                    className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-600/20"
                  >
                    确定添加
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Existing Fault Detail Modal */}
      {selectedFault && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => setSelectedFault(null)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-900 border border-white/10 rounded-[40px] p-0 max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-2xl font-black text-red-400">故障详细信息</h3>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedFault.title} | SN: {selectedFault.sn}</p>
              </div>
              <button 
                onClick={() => setSelectedFault(null)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full"
              >
                <Plus className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-black/20">
              <div className="font-mono text-xs text-blue-400 leading-relaxed">
                <pre>{JSON.stringify(selectedFault.details, null, 2)}</pre>
              </div>
            </div>
            <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
              <button 
                onClick={() => setSelectedFault(null)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all text-white/60"
              >
                关闭窗口
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Algorithm Configuration Modal */}
      <AnimatePresence>
        {showAlgoConfig && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlgoConfig(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
                    <Cpu size={20} />
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter">建图算法配置</h3>
                </div>
                <button 
                  onClick={() => setShowAlgoConfig(false)}
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-white/20 uppercase tracking-widest pl-2">全局默认算法版本（点云高斯二合一）</label>
                  <div className="relative">
                    <select 
                      value={algorithmConfig.version}
                      onChange={(e) => setAlgorithmConfig({ version: e.target.value })}
                      className="w-full h-16 bg-slate-800 border-2 border-white/5 rounded-2xl px-6 appearance-none font-bold text-lg focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="v1.2.0-效率优化">v1.2.0-效率优化（推荐）</option>
                      <option value="v1.1.5-稳定性提升">v1.1.5-稳定性提升</option>
                      <option value="v1.1.0-支持超大场景">v1.1.0-支持超大场景</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                      <ChevronRight size={20} className="rotate-90" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/20 px-2 italic">※ 配置源由 KOS 高级算力控制台实时提供同步</p>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
                  <Info size={20} className="text-blue-400 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-blue-400">生效说明</div>
                    <div className="text-xs text-white/40 leading-relaxed">
                      该配置为全局生效。修改版本将同步至所有云端节点。配置将在下一次建图任务启动时生效。
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] flex gap-4">
                <button 
                  onClick={() => setShowAlgoConfig(false)}
                  className="flex-1 h-16 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    alert('建图算法配置已更新。配置将在下一次建图任务启动时生效。');
                    setShowAlgoConfig(false);
                  }}
                  className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all"
                >
                  确认配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quota Modal */}
      {isQuotaModalOpen && quotaTargetDevice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsQuotaModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-900 border border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                  <h3 className="text-2xl font-black mb-1">发起退款</h3>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">设备: {quotaTargetDevice.sn}</p>
              </div>
              <button 
                onClick={() => setIsQuotaModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full"
              >
                <Plus className="rotate-45" />
              </button>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-8">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">原充值记录</span>
                <span className="text-white/60 font-mono">{quotaTargetDevice.date}</span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <div className="text-lg font-bold text-blue-400">+{quotaTargetDevice.amount} min</div>
                <div className="text-[10px] text-white/40 italic">已退款: {quotaTargetDevice.refunded || 0} min</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">退款时长 (分钟)</label>
                  <span className="text-[10px] text-white/40 font-mono">最大可扣: {(quotaTargetDevice.amount || 0) - (quotaTargetDevice.refunded || 0)}m</span>
                </div>
                <input 
                  type="number"
                  placeholder="请输入扣除时长"
                  value={quotaAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setQuotaAmount(val);
                  }}
                  className="w-full h-16 bg-slate-950 border border-white/10 rounded-2xl px-6 text-xl font-mono font-bold focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">备注信息</label>
                <textarea 
                  rows={3}
                  placeholder="填写变更原因，如：节日赠送 / 售后退款..."
                  value={quotaRemark}
                  onChange={(e) => setQuotaRemark(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-sm focus:border-blue-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all text-white/60"
                >
                  取消
                </button>
                  <button 
                    onClick={executeRefund}
                    disabled={isRefundExecuting || !quotaAmount}
                    className={`py-4 rounded-2xl font-black transition-all shadow-xl ${
                      isRefundExecuting || !quotaAmount ? 'bg-slate-700 text-white/20' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                    }`}
                  >
                    {isRefundExecuting ? '提交中...' : '确定退款'}
                  </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
