
import React, { useState } from 'react';
import { AppState, Routine, Goal, ScheduleCategory } from '../types';

interface RoutineViewProps {
  state: AppState;
  updateState: (u: (p: AppState) => AppState) => void;
}

const RoutineView: React.FC<RoutineViewProps> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [newRoutine, setNewRoutine] = useState<Partial<Routine>>({ 
    title: '', category: 'General', cycle: 'daily', start: '07:00', end: '08:00', startDate: new Date().toISOString().split('T')[0], goalId: '', days: [1,2,3,4,5]
  });

  const handleAddRoutine = () => {
    if (!newRoutine.title) return;
    const routine: Routine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      category: newRoutine.category || 'General',
      start: newRoutine.start || '00:00',
      end: newRoutine.end || '01:00',
      cycle: newRoutine.cycle as any,
      days: newRoutine.cycle === 'custom' ? newRoutine.days || [] : [],
      startDate: newRoutine.startDate || new Date().toISOString().split('T')[0],
      endDate: newRoutine.endDate,
      goalId: newRoutine.goalId
    };
    updateState(prev => ({ ...prev, routines: [...prev.routines, routine] }));
    setNewRoutine({ title: '', category: 'General', cycle: 'daily', start: '07:00', end: '08:00', startDate: new Date().toISOString().split('T')[0], goalId: '', days: [1,2,3,4,5] });
    setIsAdding(false);
  };

  const handleUpdateRoutine = () => {
    if (!editingRoutine) return;
    updateState(prev => ({
      ...prev,
      routines: prev.routines.map(r => r.id === editingRoutine.id ? editingRoutine : r)
    }));
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (id: string) => {
    if (window.confirm('이 루틴을 삭제하시겠습니까?')) {
      updateState(prev => ({ ...prev, routines: prev.routines.filter(r => r.id !== id) }));
    }
  };

  const toggleDay = (day: number, isEdit: boolean) => {
    if (isEdit && editingRoutine) {
      const newDays = editingRoutine.days.includes(day) ? editingRoutine.days.filter(d => d !== day) : [...editingRoutine.days, day];
      setEditingRoutine({ ...editingRoutine, days: newDays, cycle: 'custom' });
    } else {
      const newDays = (newRoutine.days || []).includes(day) ? (newRoutine.days || []).filter(d => d !== day) : [...(newRoutine.days || []), day];
      setNewRoutine({ ...newRoutine, days: newDays, cycle: 'custom' });
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">자동 루틴 엔진</h2>
          <p className="text-slate-500 font-medium">반복되는 일상의 효율을 극대화하세요.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95">새 루틴 추가</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.routines.map(rt => {
          const linkedGoal = state.goals.find(g => g.id === rt.goalId);
          return (
            <div key={rt.id} className="group relative p-8 rounded-[2.5rem] border-2 bg-white border-slate-50 hover:border-blue-200 transition-all hover:shadow-2xl flex flex-col">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => setEditingRoutine(rt)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2}/></svg></button>
                 <button onClick={() => handleDeleteRoutine(rt.id)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth={2}/></svg></button>
              </div>
              
              <div className="flex flex-col gap-6 flex-1">
                 <div className="flex gap-5 items-center">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                       <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth={2.5} /></svg>
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-800 mb-1">{rt.title}</h4>
                       <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{rt.cycle}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-slate-50 mt-auto">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                       <span>⏰ 시간대</span>
                       <span className="tabular-nums font-black text-slate-800">{rt.start} - {rt.end}</span>
                    </div>
                    {rt.endDate && (
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                         <span>📅 종료 예정일</span>
                         <span className="text-red-500 font-black">{rt.endDate}</span>
                      </div>
                    )}
                    {linkedGoal && (
                       <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                          <span>🎯 연계 목표</span>
                          <span className="text-blue-600 font-black truncate max-w-[120px]">{linkedGoal.title}</span>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {(isAdding || editingRoutine) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
           <div className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 my-8">
              <h3 className="text-3xl font-black mb-10 text-slate-800">{editingRoutine ? '루틴 수정' : '새 루틴 설계'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Routine Title</label>
                       <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingRoutine ? editingRoutine.title : newRoutine.title} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, title: e.target.value }) : setNewRoutine({ ...newRoutine, title: e.target.value })} placeholder="활동 명칭" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Start Time</label>
                          <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingRoutine ? editingRoutine.start : newRoutine.start} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, start: e.target.value }) : setNewRoutine({ ...newRoutine, start: e.target.value })} />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">End Time</label>
                          <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingRoutine ? editingRoutine.end : newRoutine.end} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, end: e.target.value }) : setNewRoutine({ ...newRoutine, end: e.target.value })} />
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Routine End Date (Optional)</label>
                       <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingRoutine ? (editingRoutine.endDate || '') : (newRoutine.endDate || '')} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, endDate: e.target.value }) : setNewRoutine({ ...newRoutine, endDate: e.target.value })} />
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Days of Week</label>
                       <div className="flex justify-between gap-1">
                          {['일','월','화','수','목','금','토'].map((d, i) => {
                            const isSel = editingRoutine ? editingRoutine.days.includes(i) : (newRoutine.days || []).includes(i);
                            return <button key={i} onClick={() => toggleDay(i, !!editingRoutine)} className={`h-10 w-10 rounded-xl font-black text-xs transition-all ${isSel ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{d}</button>
                          })}
                       </div>
                       <div className="mt-3">
                          <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={editingRoutine ? editingRoutine.cycle : newRoutine.cycle} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, cycle: e.target.value as any }) : setNewRoutine({ ...newRoutine, cycle: e.target.value as any })}>
                             <option value="daily">매일</option>
                             <option value="weekday">평일</option>
                             <option value="weekend">주말</option>
                             <option value="custom">사용자 지정 요일</option>
                          </select>
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Linked Goal</label>
                       <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={editingRoutine ? editingRoutine.goalId : newRoutine.goalId} onChange={(e) => editingRoutine ? setEditingRoutine({ ...editingRoutine, goalId: e.target.value }) : setNewRoutine({ ...newRoutine, goalId: e.target.value })}>
                          <option value="">없음</option>
                          {state.goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
              
              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-50">
                 <button onClick={() => { setIsAdding(false); setEditingRoutine(null); }} className="flex-1 py-5 text-slate-400 font-bold">취소</button>
                 <button onClick={editingRoutine ? handleUpdateRoutine : handleAddRoutine} className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl">{editingRoutine ? '업데이트' : '루틴 설계 완료'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoutineView;
