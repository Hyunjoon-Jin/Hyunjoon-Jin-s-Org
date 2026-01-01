
import React from 'react';
import { AppState, translations, ScheduleCategory } from '../types';

interface DashboardViewProps {
  state: AppState;
}

const DashboardView: React.FC<DashboardViewProps> = ({ state }) => {
  const t = translations[state.settings.language];
  const slots = state.slots.filter(s => s.type === 'actual');

  const categories: ScheduleCategory[] = ['Work', 'Meeting', 'Focus', 'Study', 'Health', 'Break', 'Logistics', 'Social', 'Personal', 'Growth', 'General'];
  
  const data = categories.map(cat => {
    let mins = 0;
    slots.filter(s => s.category === cat).forEach(s => {
      const [h1, m1] = s.start.split(':').map(Number);
      const [h2, m2] = s.end.split(':').map(Number);
      mins += (h2 * 60 + m2) - (h1 * 60 + m1);
    });
    return { name: cat, mins };
  }).filter(d => d.mins > 0);

  const totalMins = data.reduce((acc, curr) => acc + curr.mins, 0);
  const maxMins = Math.max(...data.map(d => d.mins), 1);

  const completedGoals = state.goals.filter(g => g.status === 'completed').length;
  const totalGoals = state.goals.length;
  const achievementScore = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">종합 인사이트 리포트</h2>
          <p className="text-slate-500 font-medium">당신의 시간 투자와 성과를 데이터로 분석합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2.5rem] border-2 border-slate-50 bg-white p-10 shadow-sm space-y-10">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><span className="w-2 h-6 bg-blue-600 rounded-full"></span>분야별 몰입 시간 (실행 데이터)</h3>
           <div className="space-y-6">
              {data.length === 0 ? (
                <p className="text-center py-20 text-slate-400 font-bold">기록된 실행 데이터가 없습니다.</p>
              ) : data.map(item => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-400 tabular-nums">{Math.floor(item.mins / 60)}시간 {item.mins % 60}분</span>
                  </div>
                  <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${(item.mins / maxMins) * 100}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
            <div className="rounded-[2.5rem] border-2 border-slate-900 bg-slate-900 p-10 text-white shadow-2xl space-y-8">
               <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs">전체 성취 지수</h3>
               <div className="space-y-4">
                  <div className="text-6xl font-black tabular-nums tracking-tighter">{achievementScore}<span className="text-2xl opacity-40 ml-1">%</span></div>
                  <p className="text-sm opacity-70 leading-relaxed font-medium">설정한 전체 목표 중 완료된 목표의 비율입니다.</p>
               </div>
               <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div><span className="text-[10px] font-black opacity-40 block uppercase mb-1">총 실행 시간</span><span className="text-2xl font-black text-blue-400 tabular-nums">{Math.floor(totalMins / 60)}h {totalMins % 60}m</span></div>
               </div>
            </div>
            <div className="rounded-[2rem] border-2 border-slate-100 bg-white p-8 shadow-sm"><h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">AI 몰입 조언</h4><p className="text-slate-700 font-bold italic">"{totalMins > 300 ? '오늘은 충분한 몰입 시간을 확보하셨네요. 내일의 에너지를 위해 충분한 휴식도 잊지 마세요!' : '조금 더 목표에 집중할 수 있는 환경을 만들어보는 건 어떨까요?'}"</p></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
