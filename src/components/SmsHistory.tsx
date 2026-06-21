import { SmsMessage } from '@/types/sms';

const statusStyles = {
  pending: 'bg-slate-900/40 text-slate-400 border border-slate-800/60',
  sent: 'bg-sky-950/40 text-sky-400 border border-sky-900/60',
  delivered: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60',
  failed: 'bg-rose-950/40 text-rose-400 border border-rose-900/60',
};

const statusLabels = {
  pending: 'WAIT',
  sent: 'SENT',
  delivered: 'OK',
  failed: 'ERR',
};

export default function SmsHistory({ items }: { items: SmsMessage[] }) {
  return (
    <div className="bg-[#161b26] border border-slate-800 rounded-sm flex flex-col h-full max-h-[500px] overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-[#161b26] shrink-0">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Терминал мониторинга</h2>
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500 text-xs italic">
                  Ожидание входящих логов рассылки...
                </td>
              </tr>
            ) : (
              items.map((msg) => (
                <tr key={msg.id} className="h-7 hover:bg-[#1a202c] transition-colors group">
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
                    <span className={`inline-flex justify-center items-center px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold leading-none w-10 ${statusStyles[msg.status]}`}>
                      {statusLabels[msg.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}