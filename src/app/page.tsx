'use client';

import { useState, useEffect, FormEvent } from 'react';
import SmsForm from '@/components/SmsForm';
import SmsHistory from '@/components/SmsHistory';
import SmsContacts from '@/components/SmsContacts';
import { SmsMessage } from '@/types/sms';

// Захардкоженные логин и пароль для мини-защиты
const ADMIN_LOGIN = 'admin';
const ADMIN_PASS = 'inter2026';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [history, setHistory] = useState<SmsMessage[]>([]);
  const [selectedPhone, setSelectedPhone] = useState('');

  useEffect(() => {
    // Проверяем, авторизован ли уже пользователь в этой сессии
    const auth = sessionStorage.getItem('sms_gw_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Подгружаем историю из локального хранилища браузера
    const savedHistory = localStorage.getItem('sms_gw_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginInput === ADMIN_LOGIN && passInput === ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sms_gw_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sms_gw_auth');
  };

  const handleNewSent = (newMessages: SmsMessage[]) => {
    setHistory((prev) => {
      // Оставляем до 200 сообщений, чтобы можно было листать, но не перегружать память
      const updated = [...newMessages, ...prev].slice(0, 200);
      localStorage.setItem('sms_gw_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectContact = (phone: string) => {
    setSelectedPhone(phone);
    setTimeout(() => setSelectedPhone(''), 50);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex justify-center items-center p-4">
        <form onSubmit={handleLogin} className="bg-[#161b26] border border-slate-800 rounded-sm p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
          <div className="text-center mb-2">
            <h1 className="text-slate-100 font-medium tracking-wide text-lg">SECURITY CHECK</h1>
            <p className="text-[10px] font-mono text-slate-500 mt-1">AUTHORIZED PERSONNEL ONLY</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Логин</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-sm px-3 py-2 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="Введите логин"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Пароль</label>
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full bg-[#0d1117] border border-slate-800 rounded-sm px-3 py-2 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          {authError && (
            <p className="text-[10px] font-mono text-rose-400 text-center bg-rose-950/40 border border-rose-900/60 py-1 rounded-sm">
              ОШИБКА ДОСТУПА. НЕВЕРНЫЕ ДАННЫЕ.
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 rounded-sm transition-colors border border-transparent focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          >
            ПОЛУЧИТЬ ДОСТУП
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 lg:p-4 bg-[#0b0f19] flex justify-center items-start">
      <div className="w-full max-w-7xl flex flex-col gap-3">
        
        {/* Компактный промышленный Хедер */}
        <header className="flex justify-between items-center bg-[#161b26] border border-slate-800 rounded-sm px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-100 font-medium tracking-wide">SMS Gateway Terminal</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PROVIDER: ESKIZ.UZ</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 hidden sm:inline-block">
              NODE_OK
            </span>
            <button 
              onClick={handleLogout}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-900/60 bg-[#0d1117] px-2 py-0.5 rounded"
            >
              ВЫЙТИ ✕
            </button>
          </div>
        </header>

        {/* Рабочая область 1/3 к 2/3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <div className="md:col-span-1 flex flex-col gap-3">
            <SmsForm onSent={handleNewSent} externalPhone={selectedPhone} />
            <SmsContacts onSelectContact={handleSelectContact} />
          </div>
          <div className="md:col-span-2">
            <SmsHistory items={history} />
          </div>
        </div>

      </div>
    </div>
  );
}