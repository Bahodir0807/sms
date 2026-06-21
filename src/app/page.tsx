'use client';

import { useState } from 'react';
import SmsForm from '@/components/SmsForm';
import SmsHistory from '@/components/SmsHistory';
import SmsContacts from '@/components/SmsContacts';
import { SmsMessage } from '@/types/sms';

export default function Home() {
  const [history, setHistory] = useState<SmsMessage[]>([]);
  const [selectedPhone, setSelectedPhone] = useState('');

  const handleNewSent = (newMessages: SmsMessage[]) => {
    setHistory((prev) => [...newMessages, ...prev]);
  };

  const handleSelectContact = (phone: string) => {
    setSelectedPhone(phone);
    setTimeout(() => setSelectedPhone(''), 50);
  };

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
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
            NODE_OK
          </span>
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