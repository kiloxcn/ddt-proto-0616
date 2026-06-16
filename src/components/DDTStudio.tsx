import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Monitor, 
  Cpu, 
  Layers, 
  Edit3, 
  Eye, 
  Cloud, 
  HardDrive, 
  Download, 
  Settings, 
  Maximize2, 
  Minimize2, 
  X,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  Trash2,
  Box,
  Map as MapIcon,
  MousePointer2,
  Eraser,
  Square,
  Type,
  Maximize,
  Clock,
  Zap,
  RefreshCw,
  MoreVertical,
  Save,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapData, MappingStatus } from '../types';

export const DDTStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'settings'>('projects');
  const [view, setView] = useState<'dashboard' | 'new_project' | 'editor'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MappingStatus | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<MapData | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
  const [activeTool, setActiveTool] = useState<'select' | 'erase' | 'region' | 'label' | 'level'>('select');
  
  const [projects, setProjects] = useState<MapData[]>([
    { 
      id: '1', 
      name: '仓库A区-1层', 
      createdAt: '2024-04-01 10:30', 
      size: '1.2GB', 
      type: 'cloud', 
      status: 'completed', 
      thumbnail: 'https://picsum.photos/seed/map1/800/450',
      duration: 600,
      area: '1,240 m²'
    },
    { 
      id: '2', 
      name: '办公区-2层', 
      createdAt: '2024-04-05 14:20', 
      size: '0.8GB', 
      type: 'local', 
      status: 'scanned', 
      thumbnail: 'https://picsum.photos/seed/map2/800/450',
      duration: 450
    },
    { 
      id: '3', 
      name: '地下停车场', 
      createdAt: '2024-04-08 09:15', 
      size: '2.1GB', 
      type: 'cloud', 
      status: 'mapping_failed', 
      thumbnail: 'https://picsum.photos/seed/map3/800/450',
      failureReason: '特征匹配点不足，请检查原始数据质量',
      duration: 1200
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    bagFile: null as File | null,
    vramUsage: 0,
    memoryUsage: 0
  });

  const [systemInfo] = useState({
    os: 'Windows 11 Pro 23H2',
    gpu: 'NVIDIA GeForce RTX 4070 Ti',
    driver: '551.23',
    status: 'Ready'
  });

  // Filter and Sort Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, searchQuery, statusFilter]);

  const handleCreateProject = (startNow: boolean) => {
    // Check if there's already an active mapping task
    const activeTask = projects.find(p => p.status === 'mapping' || p.status === 'uploading');
    if (activeTask && startNow) {
      alert('单台 PC 一次只能有一个建图任务，请等待当前任务完成。');
      return;
    }

    const newProject: MapData = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || `未命名项目-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleString(),
      size: '1.5GB',
      type: 'cloud',
      status: startNow ? 'mapping' : 'scanned',
      thumbnail: `https://picsum.photos/seed/new${Date.now()}/800/450`,
      progress: 0,
      vramUsage: formData.vramUsage,
      isProcessing: startNow
    };

    setProjects(prev => [newProject, ...prev]);
    setView('dashboard');
    setFormData({ name: '', bagFile: null, vramUsage: 0, memoryUsage: 0 });

    if (startNow) {
      simulateMapping(newProject.id);
    }
  };

  const simulateMapping = (id: string) => {
    let prog = 0;
    const interval = setInterval(() => {
      prog += 2;
      setProjects(prev => prev.map(p => {
        if (p.id === id) {
          if (prog >= 100) {
            clearInterval(interval);
            return { ...p, status: 'completed', progress: 100, isProcessing: false, area: '1,500 m²' };
          }
          return { ...p, progress: prog, eta: `${Math.ceil((100 - prog) / 5)} min` };
        }
        return p;
      }));
    }, 1000);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('确定要删除该项目吗？删除后无法复原。')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleExport = (format: string) => {
    alert(`正在导出项目为 ${format} 格式...`);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => {
        setActiveTab(id);
        setView('dashboard');
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all border-l-4 ${
        activeTab === id 
          ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
          : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden border border-white/10 rounded-xl shadow-2xl">
      {/* Title Bar */}
      <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
            <Layers size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold tracking-wider text-white/80">DDT STUDIO v3.2.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Minimize2 size={14} className="text-white/40 hover:text-white cursor-pointer" />
          <Maximize2 size={14} className="text-white/40 hover:text-white cursor-pointer" />
          <X size={14} className="text-white/40 hover:text-red-500 cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900/50 border-r border-white/5 flex flex-col">
          <div className="p-6">
            <button 
              onClick={() => setView('new_project')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} />
              新建项目
            </button>
          </div>

          <div className="flex-1">
            <SidebarItem id="projects" icon={Layers} label="我的地图" />
            <SidebarItem id="settings" icon={Settings} label="设置" />
          </div>

          <div className="p-6 border-t border-white/5">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                <Monitor size={12} />
                系统状态
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">GPU</span>
                  <span className="text-green-400 font-mono">RTX 4070 Ti</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40">状态</span>
                  <span className="text-white/80 font-mono">就绪</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-8 space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black mb-2">我的地图</h1>
                    <p className="text-white/40">管理您的重建任务与已生成的模型</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input 
                        type="text" 
                        placeholder="搜索地图名称..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors w-64"
                      />
                    </div>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-slate-900 border border-white/10 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="all">全部状态</option>
                      <option value="completed">建图成功</option>
                      <option value="mapping">建图中</option>
                      <option value="mapping_failed">建图失败</option>
                      <option value="scanned">待生成</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <motion.div 
                      key={project.id}
                      layout
                      className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col"
                    >
                      <div className="aspect-video relative overflow-hidden bg-slate-800">
                        <img 
                          src={project.thumbnail} 
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Status Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40">
                          {project.status === 'mapping' ? (
                            <div className="w-full space-y-3">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-blue-400">正在建图...</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-blue-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-white/40 text-center">
                                预计剩余时间: {project.eta || '计算中...'}
                              </div>
                            </div>
                          ) : project.status === 'mapping_failed' ? (
                            <div className="flex flex-col items-center gap-2 text-red-400">
                              <AlertCircle size={32} />
                              <span className="font-bold">建图失败</span>
                            </div>
                          ) : project.status === 'completed' ? (
                            <div className="flex flex-col items-center gap-2 text-green-400">
                              <CheckCircle2 size={32} />
                              <span className="font-bold text-xs">建图成功</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-white/40">
                              <Clock size={32} />
                              <span className="font-bold">待生成</span>
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          {project.status === 'completed' ? (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedProject(project);
                                  setEditMode('view');
                                  setView('editor');
                                }}
                                className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2"
                              >
                                <Eye size={18} />
                                <span className="text-xs font-bold">查看</span>
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedProject(project);
                                  setEditMode('edit');
                                  setView('editor');
                                }}
                                className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2"
                              >
                                <Edit3 size={18} />
                                <span className="text-xs font-bold">编辑</span>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedProject(project);
                                setFormData({ name: project.name, bagFile: null, vramUsage: 45, memoryUsage: 30 });
                                setView('new_project');
                              }}
                              className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2"
                            >
                              <Edit3 size={18} />
                              <span className="text-xs font-bold">编辑项目</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg truncate mb-1">{project.name}</h3>
                        <div className="flex items-center justify-between text-[10px] text-white/20">
                          <span>{project.createdAt}</span>
                          {project.area && <span className="text-blue-400/60 font-mono">{project.area}</span>}
                        </div>
                        {project.failureReason && (
                          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400">
                            失败原因: {project.failureReason}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'new_project' && (
              <motion.div 
                key="new_project"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-12 overflow-y-auto"
              >
                <div className="max-w-3xl mx-auto space-y-12">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <h1 className="text-4xl font-black">{selectedProject ? '编辑项目' : '新建项目'}</h1>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white/40 uppercase tracking-widest">地图名称</label>
                        <input 
                          type="text" 
                          placeholder="输入地图名称..." 
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-lg focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-white/40 uppercase tracking-widest">地图数据 (Bag 包)</label>
                        <div 
                          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all ${
                            formData.bagFile ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-slate-900/50'
                          }`}
                        >
                          <div className={`p-6 rounded-2xl ${formData.bagFile ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/20'}`}>
                            <HardDrive size={48} />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{formData.bagFile ? formData.bagFile.name : '点击或拖拽 RCS 导出的 Bag 包'}</div>
                            <p className="text-sm text-white/40">支持 .bag, .zip 格式</p>
                          </div>
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  bagFile: file,
                                  vramUsage: 45 + Math.random() * 20,
                                  memoryUsage: 30 + Math.random() * 15
                                }));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 space-y-8">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <Cpu size={24} className="text-blue-400" />
                        资源预估
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-white/40 uppercase">预估显存</span>
                            <span className="text-2xl font-black font-mono text-blue-400">{Math.round(formData.vramUsage)}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${formData.vramUsage}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-white/40 uppercase">预估内存</span>
                            <span className="text-2xl font-black font-mono text-blue-400">{Math.round(formData.memoryUsage)}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${formData.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleCreateProject(true)}
                        className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                      >
                        <Play size={24} fill="currentColor" />
                        立即生成
                      </button>
                      <button 
                        onClick={() => handleCreateProject(false)}
                        className="px-12 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-xl transition-all"
                      >
                        保存项目
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'editor' && selectedProject && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Editor Toolbar */}
                <div className="h-14 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex bg-slate-800 rounded-lg p-1">
                      <button 
                        onClick={() => setEditMode('view')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                          editMode === 'view' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        <Eye size={14} />
                        查看模式
                      </button>
                      <button 
                        onClick={() => setEditMode('edit')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${
                          editMode === 'edit' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        <Edit3 size={14} />
                        编辑模式
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-white/40 uppercase">当前项目:</span>
                      <span className="text-xs font-bold text-blue-400">{selectedProject.name}</span>
                    </div>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <div className="flex gap-2">
                      <select 
                        onChange={(e) => handleExport(e.target.value)}
                        className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                      >
                        <option value="">导出格式...</option>
                        <option value="PLY">PLY 格式</option>
                        <option value="LAS">LAS 格式</option>
                        <option value="XYZ">XYZ 格式</option>
                        <option value="PCD">PCD 格式</option>
                      </select>
                      <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold flex items-center gap-2">
                        <Save size={14} />
                        保存修改
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Tools Panel (Only in Edit Mode) */}
                  <AnimatePresence>
                    {editMode === 'edit' && (
                      <motion.div 
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        className="w-16 bg-slate-900 border-r border-white/5 flex flex-col items-center py-6 gap-4"
                      >
                        {[
                          { id: 'select', icon: MousePointer2, label: '选择' },
                          { id: 'erase', icon: Eraser, label: '剔除' },
                          { id: 'level', icon: Maximize, label: '找平' },
                          { id: 'region', icon: Square, label: '绘制区域' },
                          { id: 'label', icon: Type, label: '绘制标注' },
                        ].map(tool => (
                          <button 
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id as any)}
                            title={tool.label}
                            className={`p-3 rounded-xl transition-all ${
                              activeTool === tool.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <tool.icon size={20} />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Viewport */}
                  <div className="flex-1 relative bg-slate-950 overflow-hidden">
                    {/* Simulated 3D Viewport */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-10" style={{ 
                          backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', 
                          backgroundSize: '40px 40px' 
                        }} />
                        
                        {/* Simulated Point Cloud / Map */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-[600px] h-[400px] bg-blue-500/5 border border-blue-500/20 rounded-full blur-3xl" />
                          <div className="absolute w-[400px] h-[300px] border-2 border-blue-500/20 rounded-3xl transform rotateX-60 flex items-center justify-center">
                            <div className="w-full h-full bg-[url('https://picsum.photos/seed/map-preview/1200/800')] bg-cover bg-center opacity-40 rounded-3xl" />
                            {/* Simulated Annotations */}
                            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        </motion.div>

                        {/* Viewport HUD */}
                        <div className="absolute bottom-6 left-6 flex gap-4">
                          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-white/40 uppercase">渲染模式</span>
                              <span className="text-xs font-bold text-blue-400">点云稠密重建</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10" />
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-white/40 uppercase">点数</span>
                              <span className="text-xs font-bold text-white/80 font-mono">1,420,582</span>
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                          <button className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-blue-600 transition-colors">
                            <Maximize2 size={16} />
                          </button>
                          <button className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-blue-600 transition-colors">
                            <Box size={16} />
                          </button>
                          <button className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-blue-600 transition-colors">
                            <MapIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Properties Panel */}
                  <div className="w-72 bg-slate-900 border-l border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5">
                      <h3 className="font-black text-lg mb-4">项目详情</h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="text-[10px] text-white/40 uppercase font-bold">创建时间</div>
                          <div className="text-sm font-medium">{selectedProject.createdAt}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-white/40 uppercase font-bold">数据大小</div>
                          <div className="text-sm font-medium font-mono">{selectedProject.size}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-white/40 uppercase font-bold">建图面积</div>
                          <div className="text-sm font-medium text-blue-400">{selectedProject.area || '1,240 m²'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 space-y-6">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">编辑历史</h4>
                      <div className="space-y-4">
                        {[
                          { time: '10:45', action: '剔除杂点', user: 'Admin' },
                          { time: '10:52', action: '绘制禁行区', user: 'Admin' },
                          { time: '11:05', action: '地图找平', user: 'Admin' },
                        ].map((log, i) => (
                          <div key={i} className="flex gap-3 text-xs">
                            <span className="text-white/20 font-mono">{log.time}</span>
                            <div className="flex-1">
                              <div className="font-bold text-white/80">{log.action}</div>
                              <div className="text-[10px] text-white/40">操作员: {log.user}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-blue-600/10 border-t border-white/5">
                      <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                        发布地图
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto p-8 space-y-8"
              >
                <h1 className="text-3xl font-black">软件设置</h1>
                
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Monitor size={20} className="text-blue-400" />
                        系统环境
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/20 rounded-xl">
                          <div className="text-xs text-white/40 mb-1">操作系统</div>
                          <div className="font-mono text-sm">{systemInfo.os}</div>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl">
                          <div className="text-xs text-white/40 mb-1">显卡型号</div>
                          <div className="font-mono text-sm text-green-400">{systemInfo.gpu}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Settings size={20} className="text-blue-400" />
                        常规设置
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                          <span>自动检查更新</span>
                          <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                          <span>硬件加速渲染</span>
                          <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
