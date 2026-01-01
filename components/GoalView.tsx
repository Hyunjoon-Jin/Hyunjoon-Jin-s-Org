
import React, { useState, useMemo } from 'react';
import { AppState, Goal, SubGoal, Task, GoalType, Routine } from '../types';
import { suggestSubgoals } from '../services/geminiService';

const GoalView: React.FC<{ state: AppState, updateState: (u: (p: AppState) => AppState) => void }> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ title: '', category: 'Career', priority: 'medium', status: 'active' });
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('created');

  const [routineConfig, setRoutineConfig] = useState<{ task: Task, goalId: string } | null>(null);
  const [newRoutineParams, setNewRoutineParams] = useState({ 
    start: '09:00', 
    end: '10:00',
    cycle: 'daily' as Routine['cycle'],
    endDate: '',
    days: [1, 2, 3, 4, 5] 
  });

  const goalCategories: GoalType[] = ['Career', 'Health', 'Study', 'Finance', 'Hobby', 'Personal', 'Networking', 'Learning', 'Lifestyle', 'Travel', 'Project'];

  const filteredAndSortedGoals = useMemo(() => {
    let result = [...state.goals];
    if (search.trim()) {
      result = result.filter(g => g.title.toLowerCase().includes(search.toLowerCase().trim()));
    }
    if (filterCategory !== 'all') {
      result = result.filter(g => g.category === filterCategory);
    }
    result.sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.end) return 1;
        if (!b.end) return -1;
        return a.end.localeCompare(b.end);
      }
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return b.id.localeCompare(a.id);
    });
    return result;
  }, [state.goals, search, filterCategory, sortBy]);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.title.trim()) {
      alert('목표 제목을 입력해주세요.');
      return;
    }
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      category: (newGoal.category as GoalType) || 'Career',
      start: new Date().toISOString().split('T')[0],
      end: newGoal.end || '',
      description: newGoal.description || '',
      status: 'active',
      priority: (newGoal.priority as any) || 'medium'
    };
    updateState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    setIsAdding(false);
    setNewGoal({ title: '', category: 'Career', priority: 'medium', status: 'active' });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) return;
    updateState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === editingGoal.id ? editingGoal : g)
    }));
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 목표를 삭제하시겠습니까? 관련 모든 하위 전략도 함께 삭제됩니다.')) {
      updateState(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id),
        subgoals: prev.subgoals.filter(s => s.pid !== id)
      }));
    }
  };

  const handleAddSubGoal = (goalId: string) => {
    const sub: SubGoal = {
      id: Date.now().toString(),
      pid: goalId,
      title: '새 하위 전략',
      date: new Date().toISOString().split('T')[0],
      tasks: []
    };
    updateState(prev => ({ ...prev, subgoals: [...prev.subgoals, sub] }));
  };

  const handleDeleteSubGoal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 하위 전략을 삭제하시겠습니까?')) {
      updateState(prev => ({
        ...prev,
        subgoals: prev.subgoals.filter(s => s.id !== id)
      }));
    }
  };

  const handleUpdateSubGoalTitle = (id: string, title: string) => {
    updateState(prev => ({
      ...prev,
      subgoals: prev.subgoals.map(s => s.id === id ? { ...s, title } : s)
    }));
  };

  const handleDeleteTask = (subGoalId: string, taskId: string) => {
    updateState(prev => ({
      ...prev,
      subgoals: prev.subgoals.map(s => s.id === subGoalId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s)
    }));
  };

  const generateAIProposedSubgoals = async (goal: Goal) => {
    setLoadingAI(goal.id);
    const suggested = await suggestSubgoals(goal.title);
    
    const newSubs: SubGoal[] = suggested.map((s: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      pid: goal.id,
      title: s.title,
      date: goal.end || new Date().toISOString().split('T')[0],
      tasks: s.tasks.map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        done: false,
        suggestedAsRoutine: t.suggestedAsRoutine
      }))
    }));
    
    updateState(prev => ({ ...prev, subgoals: [...prev.subgoals, ...newSubs] }));
    setLoadingAI(null);
  };

  const toggleDay = (day: number) => {
    setNewRoutineParams(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
      cycle: 'custom'
    }));
  };

  const commitRoutineConversion = () => {
    if (!routineConfig) return;
    const { task, goalId } = routineConfig;
    
    const routine: Routine = {
      id: Date.now().toString(),
      title: task.title,
      category: 'Growth',
      start: newRoutineParams.start,
      end: newRoutineParams.end,
      cycle: newRoutineParams.cycle,
      days: newRoutineParams.cycle === 'custom' ? newRoutineParams.days : [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: newRoutineParams.endDate || undefined,
      goalId: goalId
    };
    
    updateState(prev => ({ ...prev, routines: [...prev.routines, routine] }));
    setRoutineConfig(null);
    alert(`"${task.title}"이 루틴으로 등록되었습니다!`);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">전략적 목표 수립</h2>
          <p className="text-slate-500 font-medium">체계적인 계획이 성공을 가져옵니다.</p>
        </div>
        <button 
          onClick={() => {
            setNewGoal({ title: '', category: 'Career', priority: 'medium', status: 'active' });
            setIsAdding(true);
          }} 
          className="rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          새 목표 추가
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border-2 border-slate-50 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="목표 검색..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
        </div>
        <select className="p-3 bg-slate-50 border-none rounded-xl font-bold text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">전체</option>
          {goalCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="p-3 bg-slate-50 border-none rounded-xl font-bold text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="created">최신순</option>
          <option value="deadline">마감일순</option>
          <option value="priority">우선순위순</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {filteredAndSortedGoals.map(goal => {
          const subs = state.subgoals.filter(s => s.pid === goal.id);
          const totalTasks = subs.reduce((acc, curr) => acc + curr.tasks.length, 0);
          const doneTasks = subs.reduce((acc, curr) => acc + curr.tasks.filter(t => t.done).length, 0);
          const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
          
          return (
            <div key={goal.id} className="rounded-[3rem] border-2 bg-white p-10 shadow-sm hover:shadow-xl transition-all border-slate-100 relative group/goal">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                   <div className="flex gap-2 mb-3">
                      <span className="bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase">{goal.category}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${goal.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{goal.priority}</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 mb-2">{goal.title}</h3>
                   <div className="text-xs font-bold text-slate-400">📅 {goal.start} ~ {goal.end || '미정'}</div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setEditingGoal(goal)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2.5}/></svg>
                   </button>
                   <button onClick={(e) => handleDeleteGoal(goal.id, e)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-600 transition-all">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth={2.5}/></svg>
                   </button>
                   <button onClick={() => generateAIProposedSubgoals(goal)} className="px-5 py-3 bg-blue-50 rounded-2xl text-blue-600 font-black text-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                      {loadingAI === goal.id ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : '🤖 AI 전략'}
                   </button>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-12">
                 <div className="h-5 flex-1 rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100 shadow-inner">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
                 <span className="text-2xl font-black tabular-nums text-slate-800">{progress}%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subs.map(sub => (
                  <div key={sub.id} className="group relative p-6 bg-slate-50/30 rounded-[2rem] border-2 border-slate-100 hover:border-blue-100 transition-all hover:bg-white">
                    <button onClick={(e) => handleDeleteSubGoal(sub.id, e)} className="absolute -top-3 -right-3 h-8 w-8 bg-white rounded-full shadow-md border-2 border-slate-50 text-slate-300 hover:text-red-500 flex items-center justify-center z-10">
                       <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                    </button>
                    <input className="bg-transparent text-lg font-black text-slate-800 outline-none w-full mb-4" value={sub.title} onChange={(e) => handleUpdateSubGoalTitle(sub.id, e.target.value)} />
                    <div className="space-y-3">
                      {sub.tasks.map(task => (
                        <div key={task.id} className="group/task flex items-center gap-3 p-3.5 bg-white rounded-[1.25rem] shadow-sm border border-slate-50">
                           <button onClick={() => updateState(p => ({ ...p, subgoals: p.subgoals.map(s => s.id === sub.id ? { ...s, tasks: s.tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t) } : s) }))} className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                              {task.done && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7"/></svg>}
                           </button>
                           <span className={`text-xs font-bold flex-1 ${task.done ? 'line-through text-slate-300' : 'text-slate-600'}`}>{task.title}</span>
                           <div className="flex gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                              {task.suggestedAsRoutine && <button onClick={() => setRoutineConfig({ task, goalId: goal.id })} className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white">루틴화</button>}
                              <button onClick={() => handleDeleteTask(sub.id, task.id)} className="p-1.5 text-slate-300 hover:text-red-500"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth={2}/></svg></button>
                           </div>
                        </div>
                      ))}
                      <div className="relative">
                         <input placeholder="+ 새로운 행동 추가..." className="w-full text-xs p-4 bg-white/40 border-dashed border-2 border-slate-200 rounded-[1.25rem] outline-none focus:border-blue-300 transition-all font-bold placeholder:text-slate-300" onKeyDown={(e) => {
                           if (e.key === 'Enter' && (e.target as any).value) {
                              updateState(p => ({ ...p, subgoals: p.subgoals.map(s => s.id === sub.id ? { ...s, tasks: [...s.tasks, { id: Date.now().toString(), title: (e.target as any).value, done: false }] } : s) }));
                              (e.target as any).value = '';
                           }
                         }} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleAddSubGoal(goal.id)} className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-blue-500 transition-all gap-4">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth={3} /></svg>
                    <span className="font-black text-xs uppercase">Add Strategy</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(isAdding || editingGoal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-3xl font-black mb-10 text-slate-800">{editingGoal ? '목표 정보 수정' : '새로운 목표 설계'}</h3>
              <div className="space-y-8">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Goal Title</label>
                    <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={editingGoal ? editingGoal.title : newGoal.title} onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, title: e.target.value }) : setNewGoal({ ...newGoal, title: e.target.value })} placeholder="예: 상반기 체중 5kg 감량" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Category</label>
                       <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingGoal ? editingGoal.category : newGoal.category} onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, category: e.target.value as any }) : setNewGoal({ ...newGoal, category: e.target.value as any })}>{goalCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Deadline</label>
                       <input type="date" className="w-full p-5 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingGoal ? editingGoal.end : newGoal.end} onChange={(e) => editingGoal ? setEditingGoal({ ...editingGoal, end: e.target.value }) : setNewGoal({ ...newGoal, end: e.target.value })} />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Priority</label>
                    <div className="flex gap-4">
                       {(['low', 'medium', 'high'] as const).map(p => (
                         <button key={p} onClick={() => editingGoal ? setEditingGoal({ ...editingGoal, priority: p }) : setNewGoal({ ...newGoal, priority: p })} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all ${ (editingGoal ? editingGoal.priority : newGoal.priority) === p ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}>{p}</button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="flex gap-4 mt-12">
                 <button onClick={() => { setIsAdding(false); setEditingGoal(null); }} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">취소</button>
                 <button onClick={editingGoal ? handleUpdateGoal : handleAddGoal} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">{editingGoal ? '업데이트' : '생성하기'}</button>
              </div>
           </div>
        </div>
      )}

      {routineConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-black mb-6">루틴 상세 설정</h3>
              <p className="text-slate-400 text-sm font-bold mb-8">"{routineConfig.task.title}" 활동의 반복 규칙을 설정하세요.</p>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">시작 시간</label>
                       <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={newRoutineParams.start} onChange={(e) => setNewRoutineParams({ ...newRoutineParams, start: e.target.value })} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">종료 시간</label>
                       <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={newRoutineParams.end} onChange={(e) => setNewRoutineParams({ ...newRoutineParams, end: e.target.value })} />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">루틴 종료 예정일 (선택)</label>
                    <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={newRoutineParams.endDate} onChange={(e) => setNewRoutineParams({ ...newRoutineParams, endDate: e.target.value })} />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest">실행 요일 선택</label>
                    <div className="flex justify-between">
                       {['일','월','화','수','목','금','토'].map((day, idx) => (
                         <button key={idx} onClick={() => toggleDay(idx)} className={`h-11 w-11 rounded-xl font-black text-sm transition-all ${newRoutineParams.days.includes(idx) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{day}</button>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="flex gap-4 mt-12">
                 <button onClick={() => setRoutineConfig(null)} className="flex-1 py-4 text-slate-400 font-bold">취소</button>
                 <button onClick={commitRoutineConversion} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">루틴 생성</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GoalView;
