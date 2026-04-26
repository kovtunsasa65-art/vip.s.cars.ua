import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { RefreshCw, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function UsersManager() {
  const [users, setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(id: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', id);
    loadUsers();
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700', manager: 'bg-brand-blue/10 text-brand-blue',
    editor: 'bg-purple-100 text-purple-700', user: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">👥 Команда та Користувачі</h1>
        <button onClick={loadUsers} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={18} /></button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-4">Користувач</th>
              <th className="p-4">Роль</th>
              <th className="p-4">Статус</th>
              <th className="p-4 text-right">Останній вхід</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <User size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{u.name || 'Анонім'}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{u.phone || u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                    className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer transition-all', roleColors[u.role])}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider', u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="text-[10px] text-slate-500 font-bold">
                    {u.last_login_at ? format(new Date(u.last_login_at), 'dd.MM HH:mm') : 'Ніколи'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="py-12 text-center text-slate-300 text-xs font-black uppercase animate-pulse">Завантаження...</div>}
      </div>
    </div>
  );
}
