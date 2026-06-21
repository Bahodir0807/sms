'use client';

import { useState, useEffect, FormEvent } from 'react';
import { SmsMessage } from '@/types/sms';

interface SmsFormProps {
  onSent: (messages: SmsMessage[]) => void;
  externalPhone: string;
}

const DEFAULT_MESSAGE = "Assalomu aleykum!!! Inter talim o’quv markazi uchun qarzdorlik mavjud to’lo’vni o’z vaqtida amalga oshirshingzni soraymiz😊";

export default function SmsForm({ onSent, externalPhone }: SmsFormProps) {
  const [phones, setPhones] = useState('');
  const [text, setText] = useState(DEFAULT_MESSAGE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalPhone) {
      setPhones((prev) => {
        const current = prev.trim();
        if (!current) return externalPhone;
        if (current.includes(externalPhone)) return prev;
        return `${current}\n${externalPhone}`;
      });
    }
  }, [externalPhone]);

  const parsePhones = (raw: string): string[] =>
    raw.split(/[\n,]/).map(p => p.replace(/[^\d+]/g, '')).filter(Boolean);

  const charCount = text.length;
  const isCyrillic = /[а-яА-ЯёЁ]/.test(text);
  const limit = isCyrillic ? 70 : 160;
  const smsCount = charCount === 0 ? 0 : Math.ceil(charCount <= limit ? 1 : charCount / (isCyrillic ? 67 : 153));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const phoneList = parsePhones(phones);
    if (!phoneList.length || !text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: phoneList, text }),
      });
      if (res.ok) {
        const data: SmsMessage[] = await res.json();
        onSent(data);
        setPhones('');
        // We do NOT clear the text here because it should always be this message.
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#161b26] border border-slate-800 rounded-sm p-3 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Получатели</label>
          {phones && (
            <button type="button" onClick={() => setPhones('')} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider">
              Очистить ✕
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={phones}
          onChange={(e) => setPhones(e.target.value)}
          placeholder="998901234567&#10;998907654321"
          className="w-full bg-[#0d1117] border border-slate-800 rounded-sm px-2.5 py-1.5 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Текст сообщения (Зафиксировано)</label>
        <textarea
          rows={4}
          value={text}
          readOnly
          className="w-full bg-[#0d1117]/50 border border-slate-800/80 rounded-sm px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none resize-none cursor-not-allowed"
          required
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] font-mono text-slate-500">Символов: <span className={charCount > limit ? "text-amber-500" : "text-slate-300"}>{charCount}</span></span>
          <span className="text-[10px] font-mono text-slate-500">Частей: <span className="text-slate-300">{smsCount}</span></span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !phones.trim() || !text.trim()}
        className="mt-1 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-sm transition-colors border border-transparent focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin text-[10px]">⚙️</span> ОТПРАВКА...
          </>
        ) : (
          <>
            <span className="text-[10px]">⚡</span> ОТПРАВИТЬ ПАКЕТ
          </>
        )}
      </button>
    </form>
  );
}