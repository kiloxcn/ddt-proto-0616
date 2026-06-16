import React, { useState } from 'react';
import { Tablet, Monitor, Cloud, Info, ArrowRight, Layers, Cpu, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RCSDevice } from './components/RCSDevice';
import { DDTStudio } from './components/DDTStudio';
import { CloudAdmin } from './components/CloudAdmin';
import { globalStore } from './services/store';
import { Login } from './components/Login';

type ViewMode = 'device' | 'studio' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewMode>('device');
  const [user, setUser] = useState(globalStore.getCurrentUser());

  const handleLogout = () => {
    globalStore.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={() => setUser(globalStore.getCurrentUser())} />;
  }

  const NavButton = ({ id, icon: Icon, label }: { id: ViewMode, icon: any, label: string }) => (
    <button 
      onClick={() => setView(id)}
      className={`flex-1 flex flex-col items-center gap-4 p-8 rounded-3xl transition-all border-2 ${
        view === id 
          ? 'bg-blue-600 border-blue-400 text-white shadow-2xl shadow-blue-600/40 scale-105 z-10' 
          : 'bg-slate-900 border-white/5 text-white/40 hover:bg-slate-800 hover:border-white/10'
      }`}
    >
      <div className={`p-5 rounded-2xl ${view === id ? 'bg-white/20' : 'bg-white/5'}`}>
        <Icon size={32} />
      </div>
      <div className="text-center">
        <div className="text-xl font-black">{label}</div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Global Navigation */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Layers size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter">DDT 建图生态系统</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">系统在线</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-12">
          <NavButton id="device" icon={Tablet} label="RCS 设备端" />
          <NavButton id="studio" icon={Monitor} label="DDT Studio" />
          <NavButton id="admin" icon={Cloud} label="云端建图" />
        </div>

        <div className="relative min-h-[800px] flex items-center justify-center bg-slate-950/50 rounded-[40px] border border-white/5 overflow-hidden shadow-inner">
          <AnimatePresence mode="wait">
            {view === 'device' && (
              <motion.div 
                key="device"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-12 flex gap-12 items-start"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-blue-600/20 rounded-[56px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative border-8 border-slate-800 rounded-[48px] overflow-hidden shadow-2xl">
                    <RCSDevice onLogout={handleLogout} />
                  </div>
                </div>
                
                {/* Quick Navigation Panel (Dev Only) */}
                <div className="w-64 space-y-4 pt-8">
                  <div className="text-xs font-black text-white/20 uppercase tracking-widest mb-4">快速导航（开发调试）</div>
                  {[
                    { label: 'Wi-Fi连接', view: 'wifi_setup' },
                    { label: '设备激活', view: 'activation' },
                    { label: '首页', view: 'home' },
                    { label: '网络设置', view: 'network_settings' },
                    { label: '关于本机', view: 'about' },
                    { label: '云端建图时长', view: 'quota_details' },
                    { label: '扫图前校验', view: 'pre_scan_check' },
                    { label: '扫图中', view: 'scanning' },
                    { label: '上传和建图', view: 'cloud_progress' },
                    { label: '最新项目', view: 'home' }, // 'home' covers latest projects section
                  ].map(item => (
                    <button 
                      key={item.label}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('rcs-navigate', { detail: item.view }));
                      }}
                      className="w-full px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-left text-sm font-bold text-white/60 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'studio' && (
              <motion.div 
                key="studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full max-w-6xl h-[700px] p-8"
              >
                <DDTStudio />
              </motion.div>
            )}

            {view === 'admin' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <CloudAdmin onLogout={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-8 py-12 border-t border-white/5 flex justify-between items-center text-white/20 text-xs font-bold uppercase tracking-widest">
        <div>© 2024 千巡科技 (DDT) | 内部演示系统</div>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">隐私政策</span>
          <span className="hover:text-white cursor-pointer transition-colors">服务条款</span>
          <span className="hover:text-white cursor-pointer transition-colors">联系支持</span>
        </div>
      </div>
    </div>
  );
}
