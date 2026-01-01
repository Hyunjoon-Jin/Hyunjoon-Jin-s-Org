
import React, { useState, useEffect } from 'react';
import { AppState, DailyLog, ScheduleSlot } from '../types';
import { getAIInsights } from '../services/geminiService';

const AIAssistant: React.FC<{ state: AppState }> = ({ state }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const recentLogs = (Object.values(state.diary) as DailyLog[]).slice(-7);
    const recentSlots = (state.slots as ScheduleSlot[]).slice(-50);
    const result = await getAIInsights(recentLogs, recentSlots);
    setAnalysis(result || "인사이트를 생성하지 못했습니다.");
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI 몰입 코치</h2>
          <p className="text-slate-500 font-medium text-sm">당신의 데이터를 분석하여 맞춤형 성과 전략을 제안합니다.</p>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? (
             <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          )}
          {loading ? '분석 중...' : '새 리포트 생성'}
        </button>
      </div>

      <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
           <svg className="h-48 w-48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        
        {!analysis && !loading && (
          <div className="text-center py-24 space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-blue-50 text-blue-600 shadow-inner">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">당신의 잠재력을 깨울 준비가 되셨나요?</h3>
               <p className="text-slate-400 max-w-sm mx-auto font-medium">Gemini AI가 지난 7일간의 기분, 에너지, 그리고 계획 준수율을 종합적으로 분석해드립니다.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-8 border-slate-50"></div>
              <div className="absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">데이터 맥락 파악 중...</h3>
              <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Identifying trends & correlations</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-6">
               <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs shadow-xl">PRO</span>
               <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Performance Analysis Report</span>
            </div>
            <div className="prose prose-blue max-w-none text-slate-700 leading-relaxed font-bold space-y-4 whitespace-pre-wrap text-lg">
               {analysis}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-md">
            <h4 className="font-black text-slate-800 mb-3 text-lg">개인 정보 보호</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">입력하신 로그와 스케줄 데이터는 분석 세션 도중에만 사용됩니다. 우리는 귀하의 데이터를 영구적으로 서버에 저장하지 않습니다.</p>
         </div>
         <div className="rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-md">
            <h4 className="font-black text-slate-800 mb-3 text-lg">상관 관계 분석</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">AI는 '계획 대비 실행(Plan vs Actual)'의 정확도가 기분 및 에너지 수준과 어떤 상관 관계를 갖는지 추적합니다.</p>
         </div>
         <div className="rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/50 p-8 transition-all hover:bg-white hover:shadow-md">
            <h4 className="font-black text-slate-800 mb-3 text-lg">더 나은 습관</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">귀하의 에너지가 가장 높은 시간대를 파악하여 최적의 루틴 시간을 제안합니다.</p>
         </div>
      </div>
    </div>
  );
};

export default AIAssistant;
