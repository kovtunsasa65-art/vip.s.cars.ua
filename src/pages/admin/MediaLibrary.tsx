import { useState, useEffect } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MediaLibrary() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    setLoading(true);
    const { data } = await supabase.storage.from('cars').list();
    setFiles(data || []);
    setLoading(false);
  }

  async function deleteFile(name: string) {
    if (!confirm('Видалити файл з хмари?')) return;
    await supabase.storage.from('cars').remove([name]);
    loadFiles();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-900">🖼️ Медіатека</h1>
        <button onClick={loadFiles} className="p-2 text-slate-400 hover:text-brand-blue transition-colors"><RefreshCw size={18} /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square bg-slate-50 relative overflow-hidden">
              <img src={supabase.storage.from('cars').getPublicUrl(f.name).data.publicUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => deleteFile(f.name)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-3">
              <div className="text-[9px] font-black text-slate-400 uppercase truncate" title={f.name}>{f.name}</div>
              <div className="text-[9px] text-slate-300 font-bold">{(f.metadata.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
        ))}
        {loading && <div className="col-span-full py-20 text-center text-xs font-black text-slate-300 uppercase tracking-widest animate-pulse">Завантаження медіа...</div>}
        {files.length === 0 && !loading && <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest">Хмара порожня</div>}
      </div>
    </div>
  );
}
