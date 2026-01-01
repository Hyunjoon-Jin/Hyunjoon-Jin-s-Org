
import React from 'react';
import { AppState, translations } from '../types';

interface SettingsViewProps {
  state: AppState;
  updateState: (u: (p: AppState) => AppState) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, updateState }) => {
  const settings = state.settings;
  const t = translations[settings.language];

  const updateSettings = (data: Partial<AppState['settings']>) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...data }
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productivity_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        updateState(() => imported);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Invalid data format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{t.settings}</h2>
        <p className="text-slate-500 text-sm">Configure your personal work environment</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t.userName}</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              value={settings.userName || ''}
              onChange={(e) => updateSettings({ userName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t.lang}</label>
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 font-bold"
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t.theme}</label>
            <select 
              className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200 font-bold"
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as any })}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode (Beta)</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t.workStart} & {t.workEnd}</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t.workStart}</label>
              <input 
                type="time" 
                className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200"
                value={settings.defaultWorkStart}
                onChange={(e) => updateSettings({ defaultWorkStart: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t.workEnd}</label>
              <input 
                type="time" 
                className="w-full p-3 bg-slate-50 rounded-xl ring-1 ring-slate-200"
                value={settings.defaultWorkEnd}
                onChange={(e) => updateSettings({ defaultWorkEnd: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Data Management</h3>
          <div className="flex gap-4">
            <button 
              onClick={handleExport}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
            >
              {t.export}
            </button>
            <label className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold text-blue-700 transition-colors text-center cursor-pointer">
              {t.import}
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
