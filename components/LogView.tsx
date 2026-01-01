
import React, { useState } from 'react';
import { AppState, DailyLog, translations } from '../types';

interface LogViewProps {
  state: AppState;
  date: string;
  updateState: (u: (p: AppState) => AppState) => void;
  onDateChange: (date: string) => void;
}

const LogView: React.FC<LogViewProps> = ({ state, date, updateState, onDateChange }) => {
  const t = translations[state.settings.language];
  const log = state.diary[date] || { mood: 3, energy: 3, text: '', tags: [] };
  const [tagInput, setTagInput] = useState('');

  const saveLog = (data: Partial<DailyLog>) => {
    updateState(prev => ({
      ...prev,
      diary: { ...prev.diary, [date]: { ...log, ...data } }
    }));
  };

  const addTag = () => {
    if (!tagInput || log.tags.includes(tagInput)) return;
    saveLog({ tags: [...log.tags, tagInput] });
    setTagInput('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">{t.log}</h2>
        <div className="flex items-center justify-center gap-3">
           <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">기록 날짜:</span>
           <input 
             type="date" 
             value={date} 
             onChange={(e) => onDateChange(e.target.value)}
             className="rounded-xl border-2 px-4 py-2 text-sm font-black shadow-sm focus:ring-2 focus:ring-blue-500 outline-none border-blue-50 bg-white"
           />
        </div>
        <p className="text-slate-400 font-medium">과거의 나를 돌아보고 내일의 나를 설계하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-10 shadow-sm transition-all hover:shadow-md">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 block text-center">오늘의 기분</label>
          <div className="flex justify-between items-center px-2">
            {[1, 2, 3, 4, 5].map(v => (
              <button 
                key={v}
                onClick={() => saveLog({ mood: v })}
                className={`text-5xl transition-all duration-300 hover:scale-125 ${log.mood === v ? 'scale-125 brightness-100 drop-shadow-2xl' : 'grayscale opacity-20'}`}
              >
                {v === 1 ? '😡' : v === 2 ? '😟' : v === 3 ? '😐' : v === 4 ? '😊' : '🥰'}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-10 shadow-sm transition-all hover:shadow-md">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8 block text-center">에너지 레벨</label>
          <div className="space-y-6 px-2">
            <div className="flex justify-between font-black text-blue-600 text-sm tracking-widest">
              <span>낮음</span>
              <span className="text-3xl tabular-nums bg-blue-50 px-4 py-1 rounded-2xl">{log.energy}</span>
              <span>높음</span>
            </div>
            <input 
              type="range" min="1" max="5" step="1"
              value={log.energy}
              onChange={(e) => saveLog({ energy: Number(e.target.value) })}
              className="w-full h-4 bg-slate-100 rounded-full appearance-none accent-blue-600 cursor-pointer shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[3rem] border-2 border-slate-50 bg-white p-12 shadow-xl space-y-10">
        <div>
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 block">상세 회고</label>
          <textarea 
            className="w-full h-72 p-8 bg-slate-50 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-100 border-none transition-all font-bold text-slate-700 leading-relaxed shadow-inner placeholder:text-slate-300"
            placeholder="오늘의 성공, 배움, 그리고 감사했던 점을 자유롭게 기록해보세요."
            value={log.text}
            onChange={(e) => saveLog({ text: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 block">키워드 태그</label>
          <div className="flex flex-wrap gap-3 mb-8">
            {log.tags.map(t => (
              <span key={t} className="flex items-center gap-2 rounded-2xl bg-blue-50 px-5 py-2.5 text-xs font-black text-blue-600 shadow-sm border border-blue-100">
                #{t}
                <button onClick={() => saveLog({ tags: log.tags.filter(tg => tg !== t) })} className="hover:text-red-500 transition-colors">
                   <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            {log.tags.length === 0 && <span className="text-xs text-slate-300 font-bold italic">아직 등록된 태그가 없습니다.</span>}
          </div>
          <div className="flex gap-4">
            <input 
              className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none ring-2 ring-slate-100 focus:ring-blue-500 font-bold"
              placeholder="태그 입력 후 엔터"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <button onClick={addTag} className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl">태그 추가</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogView;
