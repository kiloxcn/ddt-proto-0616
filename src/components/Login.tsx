import React, { useState, useEffect } from 'react';
import { User, Lock, Chrome, ShieldAlert, CheckCircle2, X, Shield, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { globalStore } from '../services/store';

// Encrypt / Decrypt helpers for safety
const encryptData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data).split('').reverse().join(''));
  } catch (e) {
    return '';
  }
};

const decryptData = (encrypted: string): string => {
  try {
    return decodeURIComponent(atob(encrypted).split('').reverse().join(''));
  } catch (e) {
    return '';
  }
};

// Cookie helpers
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string => {
  const key = name + "=";
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(key) === 0) return decodeURIComponent(c.substring(key.length, c.length));
  }
  return '';
};

const eraseCookie = (name: string) => {
  document.cookie = name + '=; Max-Age=-99999999;path=/;SameSite=Strict';
};

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLarkModal, setShowLarkModal] = useState(false);
  const [larkLoading, setLarkLoading] = useState<string | null>(null);

  // Auto-login on mount if encrypted remember token matches in cookies or storage
  useEffect(() => {
    const token = getCookie('ddt_remember_token') || localStorage.getItem('ddt_remember_token');
    if (token) {
      const decrypted = decryptData(token);
      if (decrypted) {
        try {
          const credentials = JSON.parse(decrypted);
          if (credentials.roles && credentials.roles.includes('DDT')) {
            globalStore.login(credentials.username, credentials.roles, true);
            onLoginSuccess();
          }
        } catch (e) {
          // Bad token, erase
          eraseCookie('ddt_remember_token');
          localStorage.removeItem('ddt_remember_token');
        }
      }
    }
  }, [onLoginSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('请输入帐号和密码');
      return;
    }

    setLoading(true);

    // Mock API response delay for immersive tech-feel
    setTimeout(() => {
      // 1. Account name and password authentication rules
      if (username === 'admin' && password === 'admin') {
        const roles = ['DDT', 'ADMIN'];
        // KOS DDT mapping auth rule validation
        executeLoginFlow(username, roles);
      } else if (username === 'user' && password === 'user') {
        const roles = ['DDT'];
        executeLoginFlow(username, roles);
      } else if (username === 'test' && password === 'test') {
        // User correct login details but is KOS user but doesn't have DDT mapping role
        setError('用户角色权限不足，请联系管理员');
        setLoading(false);
      } else {
        // Error requirement 1: "帐号密码不正确"
        setError('帐号密码不正确');
        setLoading(false);
      }
    }, 800);
  };

  const executeLoginFlow = (username: string, roles: string[]) => {
    if (roles.includes('DDT')) {
      globalStore.login(username, roles, rememberMe);

      // Branch: If user checks "Remember Me", write part-encrypted config to Cookie & localStorage
      if (rememberMe) {
        const tokenVal = encryptData(JSON.stringify({ username, roles }));
        setCookie('ddt_remember_token', tokenVal, 14); // 14 days Cookie
        localStorage.setItem('ddt_remember_token', tokenVal);
      } else {
        eraseCookie('ddt_remember_token');
        localStorage.removeItem('ddt_remember_token');
      }

      onLoginSuccess();
    } else {
      setError('用户角色权限不足，请联系管理员');
    }
    setLoading(false);
  };

  // Handles simulated Lark Feishu logins with the 3 distinct target flows requested
  const handleSimulateLarkLogin = (type: 'success' | 'unlinked' | 'unauthorized') => {
    setLarkLoading(type);
    setTimeout(() => {
      setLarkLoading(null);
      setShowLarkModal(false);

      if (type === 'success') {
        // Logged in with Feishu, has DDT role mapped successfully
        const roles = ['DDT'];
        globalStore.login('飞书千巡用户', roles, rememberMe);
        
        if (rememberMe) {
          const tokenVal = encryptData(JSON.stringify({ username: '飞书千巡用户', roles }));
          setCookie('ddt_remember_token', tokenVal, 14);
          localStorage.setItem('ddt_remember_token', tokenVal);
        }

        onLoginSuccess();
      } else if (type === 'unlinked') {
        // Error requirement 2: "飞书未关联用户帐号"
        setError('飞书未关联用户帐号');
      } else if (type === 'unauthorized') {
        // Error requirement 3: "用户角色权限不足，请联系管理员"
        setError('用户角色权限不足，请联系管理员');
      }
    }, 1200);
  };

  return (
    <div 
      className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-6 bg-cover bg-center relative" 
      style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 1))' }}
    >
      <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[2px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[480px] bg-slate-950 border border-white/10 rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden p-10 sm:p-12 space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="text-blue-500 w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">KOS 千巡运营系统</h1>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">DDT 智能建图综合网关</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text"
                placeholder="千巡 KOS 账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-white font-medium text-sm placeholder:text-white/20"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                placeholder="KOS 密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-white font-medium text-sm placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  rememberMe ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-white/10 bg-white/5 group-hover:border-white/25'
                }`}
              >
                {rememberMe && <CheckCircle2 size={12} className="text-white fill-current" />}
              </div>
              <span className="text-xs font-bold text-white/50 group-hover:text-white/70 transition-colors">记住密码</span>
            </label>
            <button 
              type="button" 
              onClick={() => alert('请联系 KOS 系统管理员或服务中心重置密码。')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              忘记密码？
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold border border-red-500/20 leading-relaxed"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />
                <span className="flex-1">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl text-white font-black text-sm transition-all shadow-xl shadow-blue-600/15 active:scale-[0.98] flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                正在校验 KOS 系统安全性...
              </span>
            ) : '登录'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-white/10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">或快捷方式</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button 
            type="button"
            onClick={() => setShowLarkModal(true)}
            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <img src="https://img.icons8.com/color/48/lark.png" alt="Lark Logo" className="w-5 h-5" />
            <span className="text-xs font-black text-white/80">飞书联合单点登录</span>
          </button>
        </div>
      </motion.div>

      {/* lark integration simulated login window overlay popup */}
      <AnimatePresence>
        {showLarkModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-800 w-full max-w-[440px] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <img src="https://img.icons8.com/color/48/lark.png" alt="Lark Logo" className="w-6 h-6" />
                  <span className="text-sm font-black text-slate-800">飞书联合应用授权登录</span>
                </div>
                <button 
                  onClick={() => setShowLarkModal(false)}
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">安全令牌授权接入</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    千巡运营系统（KOS）正在申请代表你访问飞书上的个人及团队身份信息。请选择一个联合认证模拟账号：
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    disabled={!!larkLoading}
                    onClick={() => handleSimulateLarkLogin('success')}
                    className="w-full p-4 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {larkLoading === 'success' ? <RefreshCw className="animate-spin" size={16} /> : 'A'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">千巡飞书专员 (已绑定 DDT 角色)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">自动带入包含 DDT 角色配额授权</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 hover:underline">接入</span>
                  </button>

                  <button
                    disabled={!!larkLoading}
                    onClick={() => handleSimulateLarkLogin('unlinked')}
                    className="w-full p-4 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                        {larkLoading === 'unlinked' ? <RefreshCw className="animate-spin" size={16} /> : 'B'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">飞书孤立测试员工 (未关联 KOS 账号)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">测试飞书身份未注册情况</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 hover:underline">接入</span>
                  </button>

                  <button
                    disabled={!!larkLoading}
                    onClick={() => handleSimulateLarkLogin('unauthorized')}
                    className="w-full p-4 hover:bg-red-50/50 border border-slate-100 hover:border-red-200 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">
                        {larkLoading === 'unauthorized' ? <RefreshCw className="animate-spin" size={16} /> : 'C'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">局外测试职员 (无 DDT 角色)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">仅包含一般基础 KOS 功能</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 hover:underline">接入</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-2 border border-slate-100">
                  <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    根据安全策略，跨源 SSO 联合认证在没有显式角色关系下会被阻断。选择测试账号将严格演练您的分支校验流。
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
