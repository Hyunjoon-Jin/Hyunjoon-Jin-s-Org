
import React, { useState, useEffect, useRef } from 'react';
import { AppState, ScheduleSlot, SlotType, Goal, Routine, ScheduleCategory, Person } from '../types';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ScheduleViewProps {
  state: AppState;
  date: string;
  updateState: (updater: (prev: AppState) => AppState) => void;
  setDate: (date: string) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ state, date, updateState, setDate }) => {
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [nowLineTop, setNowLineTop] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isDraggingToCreate, setIsDraggingToCreate] = useState<{type: SlotType, startY: number, currentY: number} | null>(null);
  const isResizingRef = useRef(false);
  const slotHeight = 60; 

  const dayMeta = state.meta[date];
  const workStart = dayMeta?.customWorkStart || state.settings.defaultWorkStart;
  const workEnd = dayMeta?.customWorkEnd || state.settings.defaultWorkEnd;

  const dObj = new Date(date);
  const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
  const isOff = dayMeta?.type === 'holiday' || dayMeta?.type === 'vacation' || dayMeta?.noWork || isWeekend;

  useEffect(() => {
    const updateNowLine = () => {
      const n = new Date();
      setCurrentTime(n.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }));
      if (date === getLocalDateString()) {
        const mins = n.getHours() * 60 + n.getMinutes();
        setNowLineTop((mins / 60) * slotHeight);
      } else {
        setNowLineTop(-1);
      }
    };
    updateNowLine();
    const interval = setInterval(updateNowLine, 30000);
    return () => clearInterval(interval);
  }, [date]);

  const timeToY = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h + m / 60) * slotHeight;
  };

  const yToTime = (y: number) => {
    const totalMins = (y / slotHeight) * 60;
    const roundedMins = Math.round(totalMins / 5) * 5; 
    const h = Math.min(23, Math.floor(roundedMins / 60));
    const m = Math.floor(roundedMins % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const routineSlots = state.routines
    .filter(r => {
      if (date < r.startDate) return false;
      if (r.endDate && date > r.endDate) return false;
      if (state.deletedRoutineInstances.includes(`${r.id}-${date}`)) return false;
      
      const dayOfWeek = dObj.getDay();
      if (r.cycle === 'daily') return true;
      if (r.cycle === 'weekday' && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
      if (r.cycle === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) return true;
      if (r.cycle === 'custom' && r.days.includes(dayOfWeek)) return true;
      return false;
    })
    .map(r => ({
      id: `routine-${r.id}-${date}`,
      originalRoutineId: r.id, 
      date,
      type: 'plan' as SlotType,
      start: r.start,
      end: r.end,
      content: `[루틴] ${r.title}`,
      category: r.category as ScheduleCategory,
      importance: 'medium' as any,
      isRoutine: true
    }));
  
  const daySlots = state.slots.filter(s => s.date === date);
  const mergedPlanSlots = [
    ...daySlots.filter(s => s.type === 'plan'),
    ...routineSlots.filter(rs => !daySlots.some(ds => ds.type === 'plan' && ds.start === rs.start))
  ];

  const handleTimelineMouseDown = (type: SlotType, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.slot-item')) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top + (e.currentTarget as HTMLElement).scrollTop;
    setIsDraggingToCreate({ type, startY: y, currentY: y });
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingToCreate) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top + (e.currentTarget as HTMLElement).scrollTop;
    setIsDraggingToCreate(prev => prev ? { ...prev, currentY: y } : null);
  };

  const handleTimelineMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingToCreate) return;
    const { type, startY, currentY } = isDraggingToCreate;
    const actualStart = Math.min(startY, currentY);
    const actualEnd = Math.max(startY, currentY);
    
    if (actualEnd - actualStart > 10) {
      const startTime = yToTime(actualStart);
      const endTime = yToTime(actualEnd);
      const newSlot: ScheduleSlot = {
        id: Date.now().toString(),
        date,
        type,
        start: startTime,
        end: endTime,
        content: '새 일정',
        category: 'General',
        importance: 'medium'
      };
      updateState(prev => ({ ...prev, slots: [...prev.slots, newSlot] }));
      setEditingSlot(newSlot);
    }
    setIsDraggingToCreate(null);
  };

  const handleDrop = (e: React.DragEvent, targetType: SlotType) => {
    e.preventDefault();
    const slotStr = e.dataTransfer.getData('slot');
    if (!slotStr) return;
    const slot = JSON.parse(slotStr) as ScheduleSlot;

    // 드롭 위치를 기반으로 새로운 시작 시간 계산
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top + (e.currentTarget as HTMLElement).scrollTop;
    const newStart = yToTime(y);
    
    // 기존 일정의 소요 시간(Duration) 계산
    const startMins = (timeToY(slot.start) / slotHeight) * 60;
    const endMins = (timeToY(slot.end) / slotHeight) * 60;
    const duration = endMins - startMins;
    
    // 새로운 종료 시간 계산
    const [nh, nm] = newStart.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(nh, nm + duration);
    const newEnd = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    if (slot.isRoutine) {
      // 루틴 인스턴스를 일반 일정으로 변환하여 복사/이동
      const newSlot: ScheduleSlot = {
        ...slot,
        id: Date.now().toString(),
        type: targetType,
        start: newStart,
        end: newEnd,
        isRoutine: false,
        date: date
      };
      updateState(prev => ({ ...prev, slots: [...prev.slots, newSlot] }));
    } else {
      // 일반 일정의 이동 또는 복사
      if (slot.type === 'plan' && targetType === 'actual') {
        // 계획 -> 실행 드롭 시 복사 (Copy)
        const newActual: ScheduleSlot = {
          ...slot,
          id: Date.now().toString(),
          type: 'actual',
          start: newStart,
          end: newEnd,
          date: date
        };
        updateState(prev => ({ ...prev, slots: [...prev.slots, newActual] }));
      } else {
        // 같은 타입 내 이동 또는 다른 케이스 (Move)
        updateState(prev => {
          const exists = prev.slots.find(s => s.id === slot.id);
          if (exists) {
            return {
              ...prev,
              slots: prev.slots.map(s => s.id === slot.id ? { ...s, start: newStart, end: newEnd, type: targetType, date: date } : s)
            };
          } else {
            return {
              ...prev,
              slots: [...prev.slots, { ...slot, start: newStart, end: newEnd, type: targetType, date: date }]
            };
          }
        });
      }
    }
  };

  const handleResize = (slotId: string, newEndY: number) => {
    isResizingRef.current = true;
    const newEnd = yToTime(newEndY);
    updateState(prev => ({
      ...prev,
      slots: prev.slots.map(s => {
        if (s.id === slotId) {
          if (timeToY(newEnd) <= timeToY(s.start)) return s;
          return { ...s, end: newEnd };
        }
        return s;
      })
    }));
    setTimeout(() => { isResizingRef.current = false; }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">몰입 타임라인</h2>
        <div className="flex items-center gap-4">
           {date === getLocalDateString() && (
             <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black animate-pulse border border-red-100">
               LIVE {currentTime}
             </div>
           )}
           <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-2 px-4 py-2 text-sm font-bold border-blue-50 bg-white shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[780px] relative">
        <TimelineColumn 
          title="계획 (PLAN)" 
          type="plan" 
          slots={mergedPlanSlots} 
          timeToY={timeToY} 
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          onMouseUp={handleTimelineMouseUp}
          onEdit={(s: any) => { if(!isResizingRef.current) setEditingSlot(s); }}
          onResize={handleResize}
          nowLineTop={nowLineTop}
          currentTime={currentTime}
          workHours={{ start: workStart, end: workEnd, isOff }}
          onDrop={(e: any) => handleDrop(e, 'plan')}
          isDraggingToCreate={isDraggingToCreate}
        />
        <TimelineColumn 
          title="실행 (ACTUAL)" 
          type="actual" 
          slots={daySlots.filter(s => s.type === 'actual')} 
          timeToY={timeToY} 
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          onMouseUp={handleTimelineMouseUp}
          onEdit={(s: any) => { if(!isResizingRef.current) setEditingSlot(s); }}
          onResize={handleResize}
          nowLineTop={nowLineTop}
          currentTime={currentTime}
          workHours={{ start: workStart, end: workEnd, isOff }}
          onDrop={(e: any) => handleDrop(e, 'actual')}
          isDraggingToCreate={isDraggingToCreate}
        />
      </div>

      {editingSlot && (
        <SlotEditor 
          slot={editingSlot} 
          onClose={() => setEditingSlot(null)} 
          updateState={updateState}
          goals={state.goals}
          people={state.people}
          date={date}
        />
      )}
    </div>
  );
};

const TimelineColumn: React.FC<any> = ({ 
  title, type, slots, timeToY, onMouseDown, onMouseMove, onMouseUp, isDraggingToCreate, onEdit, onResize, nowLineTop, currentTime, onDrop, workHours
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const colors: Record<string, string> = {
    'Work': 'bg-blue-50 border-blue-400 text-blue-700',
    'Focus': 'bg-indigo-50 border-indigo-400 text-indigo-700',
    'Meeting': 'bg-amber-50 border-amber-400 text-amber-700',
    'Health': 'bg-green-50 border-green-400 text-green-700',
    'Study': 'bg-purple-50 border-purple-400 text-purple-700',
    'Social': 'bg-pink-50 border-pink-400 text-pink-700',
    'Personal': 'bg-red-50 border-red-400 text-red-700',
    'General': 'bg-slate-50 border-slate-400 text-slate-700'
  };

  const workTop = timeToY(workHours.start);
  const workBottom = timeToY(workHours.end);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden relative"
         onDragOver={(e) => e.preventDefault()}
         onDrop={onDrop}>
      <div className={`p-4 text-center font-black tracking-widest text-xs border-b ${type === 'plan' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{title}</div>
      <div className="relative flex-1 overflow-y-auto scroll-smooth" onMouseDown={(e) => onMouseDown(type, e)} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
        <div className="absolute inset-0 pointer-events-none">
          {!workHours.isOff && (
            <div className="absolute left-16 right-0 bg-slate-400/5 pointer-events-none" style={{ top: `${workTop}px`, height: `${workBottom - workTop}px` }}></div>
          )}
          {hours.map(h => <div key={h} className="h-[60px] border-b border-slate-50 flex items-start pl-3 pt-1"><span className="text-[10px] text-slate-300 font-bold tabular-nums">{String(h).padStart(2, '0')}:00</span></div>)}
        </div>
        {isDraggingToCreate && isDraggingToCreate.type === type && (
          <div className="absolute left-16 right-3 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-xl z-10 pointer-events-none" 
               style={{ top: `${Math.min(isDraggingToCreate.startY, isDraggingToCreate.currentY)}px`, height: `${Math.abs(isDraggingToCreate.currentY - isDraggingToCreate.startY)}px` }}></div>
        )}
        {nowLineTop > 0 && (
          <div className="absolute left-0 right-0 h-0.5 bg-red-500/50 z-40 pointer-events-none flex items-center" style={{ top: `${nowLineTop}px` }}>
            <div className="absolute left-10 transform -translate-x-1/2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg ring-2 ring-white">NOW</div>
            <div className="w-full h-px border-t border-red-500 border-dashed"></div>
          </div>
        )}
        {slots.map((slot: any) => {
          const top = timeToY(slot.start);
          const height = Math.max(40, timeToY(slot.end) - top);
          const colorClass = colors[slot.category] || colors['General'];
          return (
            <div key={slot.id} 
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('slot', JSON.stringify(slot)); }}
              onClick={(e) => { e.stopPropagation(); onEdit(slot); }} 
              className={`slot-item absolute left-16 right-3 rounded-2xl border-l-8 p-3 text-xs font-bold shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all z-20 overflow-hidden ${colorClass} ${slot.isRoutine ? 'opacity-70 border-dashed' : ''}`} 
              style={{ top: `${top}px`, height: `${height}px` }}>
              <div className="flex justify-between items-start mb-1 gap-1">
                <span className="truncate flex-1">{slot.content}</span>
                <div className="flex gap-1 shrink-0 items-center">
                  {slot.isMeeting && <span className="text-[8px] bg-amber-500 text-white px-1 rounded">회의</span>}
                  {slot.importance === 'appointment' && <span className="text-[8px] bg-red-500 text-white px-1 rounded">약속</span>}
                  {slot.isRoutine && <span className="text-[8px] bg-slate-900 text-white px-1 rounded">루틴</span>}
                  {slot.goalId && <span className="text-[9px] bg-white/60 px-1 rounded">🎯</span>}
                </div>
              </div>
              <div className="flex gap-2 opacity-60 font-mono text-[10px]"><span>{slot.start} - {slot.end}</span></div>
              {!slot.isRoutine && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-black/5 flex items-center justify-center group"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startY = e.clientY;
                    const currentHeight = height;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaY = moveEvent.clientY - startY;
                      onResize(slot.id, top + currentHeight + deltaY);
                    };
                    const handleMouseUp = () => {
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="w-10 h-1 bg-black/10 rounded-full group-hover:bg-black/20"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SlotEditor: React.FC<{ slot: ScheduleSlot, onClose: () => void, updateState: (u: (p: AppState) => AppState) => void, goals: Goal[], people: Person[], date: string }> = ({ slot, onClose, updateState, goals, people, date }) => {
  const [data, setData] = useState<ScheduleSlot>(slot);

  const handleSave = () => {
    if (slot.isRoutine) {
      const newSlot = { ...data, id: Date.now().toString(), isRoutine: false };
      updateState(prev => ({ ...prev, slots: [...prev.slots, newSlot] }));
    } else {
      updateState(prev => ({ ...prev, slots: prev.slots.map(s => s.id === slot.id ? data : s) }));
    }
    onClose();
  };

  const handleDelete = () => {
    if (slot.isRoutine) {
      const routineId = (slot as any).originalRoutineId;
      if (routineId) {
        updateState(prev => ({ ...prev, deletedRoutineInstances: [...prev.deletedRoutineInstances, `${routineId}-${date}`] }));
      }
    } else {
      updateState(prev => ({ ...prev, slots: prev.slots.filter(s => s.id !== slot.id) }));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-2xl font-black mb-6">스케줄 상세 편집</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <input className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 font-bold" value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} placeholder="일정 제목" />
            <div className="grid grid-cols-2 gap-4">
              <input type="time" className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={data.start} onChange={(e) => setData({ ...data, start: e.target.value })} />
              <input type="time" className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={data.end} onChange={(e) => setData({ ...data, end: e.target.value })} />
            </div>
          </div>
          <div className="space-y-6">
             <div className="flex gap-2">
                <button onClick={() => setData({...data, isMeeting: !data.isMeeting})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${data.isMeeting ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>회의</button>
                <button onClick={() => setData({...data, importance: data.importance === 'appointment' ? 'medium' : 'appointment'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${data.importance === 'appointment' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-400'}`}>약속</button>
             </div>
             <div>
                <select className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={data.goalId || ''} onChange={(e) => setData({...data, goalId: e.target.value})}>
                   <option value="">연계 목표 없음</option>
                   {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
             </div>
          </div>
        </div>
        <div className="flex gap-4 mt-10">
          <button onClick={handleDelete} className="px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl">삭제</button>
          <div className="flex-1"></div>
          <button onClick={onClose} className="px-6 py-4 text-slate-400 font-bold">취소</button>
          <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl">저장</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
