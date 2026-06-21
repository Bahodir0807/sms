'use client';

import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { Contact } from '@/types/sms';

interface SmsContactsProps {
  onSelectContact: (phone: string) => void;
}

export default function SmsContacts({ onSelectContact }: SmsContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sms_gw_contacts');
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  const addContact = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: Contact = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      phone: phone.replace(/[^\d+]/g, ''),
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('sms_gw_contacts', JSON.stringify(updated));
    setName('');
    setPhone('');
  };

  const removeContact = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('sms_gw_contacts', JSON.stringify(updated));
  };

  return (
    <div className="bg-[#161b26] border border-slate-800 rounded-sm p-3 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Быстрые контакты</h2>
      </div>

      <form onSubmit={addContact} className="flex gap-2">
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#0d1117] border border-slate-800 rounded-sm px-2.5 py-1.5 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="998..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[#0d1117] border border-slate-800 rounded-sm px-2.5 py-1.5 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          required
        />
        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-sm transition-colors border border-slate-700 focus:outline-none focus:border-blue-500">
          +
        </button>
      </form>

      <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto pr-1">
        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2 text-center border border-dashed border-slate-800 rounded-sm">Контакты отсутствуют</p>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectContact(c.phone)}
              className="group flex justify-between items-center p-2 rounded-sm bg-[#0d1117] border border-slate-800 hover:border-slate-600 hover:bg-[#121620] cursor-pointer transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium">{c.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{c.phone}</span>
              </div>
              <button
                onClick={(e) => removeContact(c.id, e)}
                className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}