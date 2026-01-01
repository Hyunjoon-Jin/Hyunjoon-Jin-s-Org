
import React, { useState } from 'react';
import { AppState, DayMeta, ScheduleSlot } from '../types';

interface CalendarViewProps {
  state: AppState;
  onSelectDate: (date: string) => void;
  currentDate: string;
  updateState: (u: (p: AppState) => AppState) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ state, onSelectDate, currentDate, updateState }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [configDate, setConfigDate] = useState<string | null>(null);
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayStats = (d: number, index: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const meta = state.meta[dateStr];
    const log = state.diary[dateStr];
    const daySlots = state.slots.filter(s => s.date === dateStr);
    
    let totalWorkMinutes = 0;
    daySlots.filter(s => s.type === 'actual' && s.category === 'Work').forEach(s => {
      const [h1, m1] = s.start.split(':').map(Number);
      const [h2, m2] = s.end.split(':').map(Number);
      totalWorkMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
    });

    const hasHighImp = daySlots.some(s => s.importance === 'high');
    const moodMap: Record<number, string> = { 1: '😡', 2: '😟', 3: '😐', 4: '😊', 5: '🥰' };
    
    // 중요도가 높거나 약속인 일정 필터링
    const filteredSlots = daySlots.filter(s => s.importance === 'high' || s.importance === 'appointment');
    const isWeekend = index % 7 === 0 || index % 7 === 6;
    const isOff = meta?.type === 'holiday' || meta?.type === 'vacation' || meta?.noWork || isWeekend;

    return { dateStr, meta, log, hasHighImp, totalWorkMinutes, moodIcon: log?.mood ? moodMap[log.mood] : '', filteredSlots, isOff };
  };

  const handleUpdateDayMeta = (dateStr: string, data: Partial<DayMeta>) => {
    updateState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [dateStr]: { ...prev.meta[dateStr], ...data }
      }
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{viewDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
          <p className="text-slate-500 font-medium text-xs">우클릭하여 근무시간/휴무 조정</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="rounded-2xl border-2 bg-white p-3 hover:bg-slate-50 transition-colors border-slate-100 shadow-sm"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={3}/></svg></button>
          <button onClick={() => setViewDate(new Date())} className="rounded-2xl border-2 bg-white px-6 py-2 text-sm font-black hover:bg-slate-50 border-slate-100 shadow-sm">오늘</button>
          <button onClick={nextMonth} className="rounded-2xl border-2 bg-white p-3 hover:bg-slate-50 transition-colors border-slate-100 shadow-sm"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg></button>
        </div>
      </div>

      <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-slate-50/50 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <div className="py-4 text-red-400">Sun</div>
          <div className="py-4">Mon</div>
          <div className="py-4">Tue</div>
          <div className="py-4">Wed</div>
          <div className="py-4">Thu</div>
          <div className="py-4">Fri</div>
          <div className="py-4 text-blue-400">Sat</div>
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-50">
          {days.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} className="h-44 bg-slate-50/20"></div>;
            
            const { dateStr, meta, log, hasHighImp, totalWorkMinutes, moodIcon, filteredSlots, isOff } = getDayStats(d, i);
            const isToday = dateStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
            const isWeekend = i % 7 === 0 || i % 7 === 6;

            const workS = meta?.customWorkStart || state.settings.defaultWorkStart;
            const workE = meta?.customWorkEnd || state.settings.defaultWorkEnd;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setConfigDate(dateStr);
                }}
                className={`group relative flex h-44 flex-col p-3 text-left transition-all hover:bg-blue-50/20 ${
                  isToday ? 'bg-blue-50/30 ring-2 ring-inset ring-blue-100' : 
                  meta?.type === 'holiday' ? 'bg-red-50/30' : 
                  meta?.type === 'vacation' ? 'bg-green-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-sm font-black ${
                    isToday ? 'flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg' : 
                    isWeekend ? (i % 7 === 0 ? 'text-red-500' : 'text-blue-500') : 'text-slate-700'
                  }`}>
                    {d}
                  </span>
                  <div className="flex flex-col gap-0.5 items-end">
                    {meta?.type === 'holiday' && <span className="px-1 py-0.5 rounded-md bg-red-100 text-red-600 text-[7px] font-black uppercase tracking-tight">휴일</span>}
                    {meta?.type === 'vacation' && <span className="px-1 py-0.5 rounded-md bg-green-100 text-green-600 text-[7px] font-black uppercase tracking-tight">휴가</span>}
                    {meta?.noWork && <span className="px-1 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[7px] font-black uppercase tracking-tight">근무X</span>}
                    {hasHighImp && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-sm"></span>}
                  </div>
                </div>

                {!isOff && (
                  <div className="text-[7px] font-black text-slate-300 mb-2 truncate">
                    💼 {workS} - {workE}
                  </div>
                )}
                
                <div className="flex-1 space-y-1 overflow-hidden">
                   {filteredSlots.sort((a,b) => a.start.localeCompare(b.start)).slice(0, 3).map(slot => (
                     <div key={slot.id} className={`flex flex-col px-1.5 py-0.5 rounded border-l-2 text-[8px] font-bold truncate ${slot.type === 'plan' ? 'bg-slate-50 border-slate-300 text-slate-500' : 'bg-blue-50 border-blue-400 text-blue-700'}`}>
                        <div className="flex justify-between items-center">
                           <span className="truncate">{slot.content}</span>
                           {slot.importance === 'appointment' && <span className="text-[6px]">🗓️</span>}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-1 flex items-end justify-between border-t border-slate-50 pt-1">
                   <span className="text-sm">{moodIcon}</span>
                   {totalWorkMinutes > 0 && (
                      <span className="text-[8px] font-black text-blue-600 tabular-nums">{Math.floor(totalWorkMinutes/60)}h {totalWorkMinutes%60}m</span>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {configDate && (
        <DayConfigModal 
          date={configDate} 
          meta={state.meta[configDate]} 
          defaults={state.settings}
          onClose={() => setConfigDate(null)}
          onSave={(data) => {
            handleUpdateDayMeta(configDate, data);
            setConfigDate(null);
          }}
        />
      )}
    </div>
  );
};

const DayConfigModal: React.FC<{ date: string, meta: DayMeta | undefined, defaults: any, onClose: () => void, onSave: (d: any) => void }> = ({ date, meta, defaults, onClose, onSave }) => {
  const [type, setType] = useState<DayMeta['type']>(meta?.type || 'normal');
  const [start, setStart] = useState(meta?.customWorkStart || defaults.defaultWorkStart);
  const [end, setEnd] = useState(meta?.customWorkEnd || defaults.defaultWorkEnd);
  const [noWork, setNoWork] = useState(meta?.noWork || false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-sm:max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl font-black mb-6 text-slate-800">{date} 설정</h3>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">구분</label>
            <div className="flex gap-2">
              {(['normal', 'holiday', 'vacation'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black border-2 transition-all ${type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50'}`}
                >
                  {t === 'normal' ? '평일' : t === 'holiday' ? '공휴일' : '휴가'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <input 
              type="checkbox" 
              id="noWorkCheck"
              checked={noWork} 
              onChange={(e) => setNoWork(e.target.checked)}
              className="h-5 w-5 rounded-md border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="noWorkCheck" className="text-sm font-black text-slate-700 cursor-pointer">이 날은 근무 없음</label>
          </div>
          <div className={`grid grid-cols-2 gap-4 transition-opacity ${noWork ? 'opacity-30 pointer-events-none' : ''}`}>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">근무 시작</label>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold ring-1 ring-slate-100" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">근무 종료</label>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold ring-1 ring-slate-100" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">취소</button>
          <button onClick={() => onSave({ type, customWorkStart: start, customWorkEnd: end, noWork })} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl">저장</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
