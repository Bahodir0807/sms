'use client';

import { useState } from 'react';
import { SmsMessage } from '@/types/sms';

const statusStyles: Record<string, string> = {
  pending: 'bg-slate-900/40 text-slate-400 border border-slate-800/60',
  waiting: 'bg-slate-900/40 text-slate-400 border border-slate-800/60',
  sent: 'bg-sky-950/40 text-sky-400 border border-sky-900/60',
  delivered: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60',
  failed: 'bg-rose-950/40 text-rose-400 border border-rose-900/60',
  error: 'bg-rose-950/40 text-rose-400 border border-rose-900/60',
};

const statusLabels: Record<string, string> = {
  pending: 'WAIT',
  waiting: 'WAIT',
  sent: 'SENT',
  delivered: 'OK',
  failed: 'ERR',
  error: 'ERR',
};

export default function SmsHistory({ items: localItems }: { items: SmsMessage[] }) {
  const [apiItems, setApiItems] = useState<SmsMessage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sms/history?page=${targetPage}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Eskiz API Response:', data); // Выводим в консоль для дебага
        
        // Надежно ищем массив с сообщениями в ответе Eskiz
        let messagesArray: any[] = [];
        if (Array.isArray(data)) messagesArray = data;
        else if (Array.isArray(data?.data)) messagesArray = data.data;
        else if (Array.isArray(data?.data?.data)) messagesArray = data.data.data;
        else if (Array.isArray(data?.data?.messages)) messagesArray = data.data.messages;
        else if (Array.isArray(data?.messages)) messagesArray = data.messages;
        else if (typeof data?.data === 'object') {
           // Если это объект, попробуем найти в нем массив
           const arraysInObject = Object.values(data.data).find(val => Array.isArray(val));
           if (arraysInObject) messagesArray = arraysInObject as any[];
        }

        const fetchedMessages = messagesArray.map((msg: any) => ({
          id: msg.id || Math.random().toString(),
          phone: msg.mobile_phone || msg.phone || 'Unknown',
          text: msg.message || msg.text || '',
          status: (msg.status || 'sent').toLowerCase(),
          createdAt: msg.created_at || msg.date || new Date().toISOString()
        }));

        setApiItems(fetchedMessages);
        setPage(targetPage);
        
        // Eskiz обычно возвращает pagination инфу
        if (data?.data?.last_page) {
          setTotalPages(data.data.last_page);
        } else {
          setTotalPages(targetPage + 1); // fallback infinite pages
        }
      } else {
        alert('Ошибка получения истории из API. Возможно неверный эндпоинт или ключи.');
      }
    } catch (err) {
      console.error(err);
      alert('Сетевая ошибка при запросе к API.');
    } finally {
      setLoading(false);
    }
  };

  const displayItems = apiItems !== null ? apiItems : localItems;
  // Если смотрим локальные данные, делаем клиентскую пагинацию по 20 штук
  const paginatedLocalItems = apiItems === null ? localItems.slice((page - 1) * 20, page * 20) : [];
  const itemsToRender = apiItems !== null ? displayItems : paginatedLocalItems;
  const localTotalPages = Math.max(1, Math.ceil(localItems.length / 20));
  const currentTotalPages = apiItems !== null ? totalPages : localTotalPages;

  return (
    <div className="bg-[#161b26] border border-slate-800 rounded-sm flex flex-col h-full max-h-[500px] overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-[#161b26] shrink-0 flex justify-between items-center">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Терминал мониторинга {apiItems ? '(ДАННЫЕ API)' : '(ЛОКАЛЬНО)'}
        </h2>
        <button 
          onClick={() => fetchHistory(1)}
          disabled={loading}
          className="text-[10px] font-bold uppercase tracking-wider bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-900/60 px-2 py-0.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? '⟳ ЗАГРУЗКА...' : 'ЗАПРОСИТЬ ИЗ API ☁'}
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-[#161b26] shadow-[0_1px_0_0_#1e293b]">
            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th className="w-24 px-3 py-2">Время</th>
              <th className="w-32 px-3 py-2">Получатель</th>
              <th className="px-3 py-2">Сообщение</th>
              <th className="w-16 px-3 py-2 text-right">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {itemsToRender.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500 text-xs italic">
                  {loading ? 'Загрузка данных...' : 'Ожидание логов рассылки...'}
                </td>
              </tr>
            ) : (
              itemsToRender.map((msg, idx) => (
                <tr key={msg.id || idx} className="h-7 hover:bg-[#1a202c] transition-colors group">
                  <td className="px-3 text-slate-400 text-[11px] whitespace-nowrap truncate font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-3 text-slate-300 text-[11px] whitespace-nowrap truncate font-mono">
                    {msg.phone}
                  </td>
                  <td className="px-3 text-slate-200 text-[11px] whitespace-nowrap overflow-hidden text-ellipsis max-w-0" title={msg.text}>
                    {msg.text}
                  </td>
                  <td className="px-3 text-right whitespace-nowrap">
                    <span className={`inline-flex justify-center items-center px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none w-10 ${statusStyles[msg.status] || statusStyles.pending}`}>
                      {statusLabels[msg.status] || 'WAIT'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация (листы) */}
      <div className="px-4 py-2 border-t border-slate-800 bg-[#121620] shrink-0 flex justify-center items-center gap-2">
        <button
          onClick={() => apiItems ? fetchHistory(page - 1) : setPage(page - 1)}
          disabled={page <= 1 || loading}
          className="px-2 py-1 bg-[#1a202c] text-slate-400 rounded-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
        >
          ◀
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, currentTotalPages) }, (_, i) => {
            // Простая логика отображения соседних страниц
            let pageNum = i + 1;
            if (currentTotalPages > 5 && page > 3) {
              pageNum = page - 2 + i;
            }
            if (pageNum > currentTotalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => apiItems ? fetchHistory(pageNum) : setPage(pageNum)}
                disabled={loading}
                className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono rounded-sm border ${
                  page === pageNum 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#1a202c] border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => apiItems ? fetchHistory(page + 1) : setPage(page + 1)}
          disabled={page >= currentTotalPages || loading}
          className="px-2 py-1 bg-[#1a202c] text-slate-400 rounded-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800"
        >
          ▶
        </button>
        {apiItems && (
           <button onClick={() => { setApiItems(null); setPage(1); }} className="ml-4 text-[9px] text-slate-500 hover:text-rose-400 uppercase tracking-wider">
             Сбросить API
           </button>
        )}
      </div>
    </div>
  );
}