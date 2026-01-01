
import React, { useState, useEffect } from 'react';
import { AppState, translations } from '../types';

interface FocusModeProps {
  state: AppState;
}

const FocusMode: React.FC<FocusModeProps> = ({ state }) => {
  const t = translations[state.settings.language];
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          const nextIsBreak = !isBreak;
          setIsActive(false);
          setIsBreak(nextIsBreak);
          setMinutes(nextIsBreak ? 5 : 25);
          alert(nextIsBreak ? "집중 시간이 끝났습니다! 휴식을 취하세요." : "휴식이 끝났습니다! 다시 집중해봅시다.");
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-black text-slate-800 tracking-tight">몰입 엔진</h2>
        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">{isBreak ? "에너지 충전 중" : "딥 워크 진행 중"}</p>
      </div>

      <div className={`relative flex items-center justify-center w-80 h-80 rounded-full border-8 transition-all duration-700 ${isBreak ? 'border-green-100' : 'border-blue-100'} shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)]`}>
        <div className={`absolute inset-4 rounded-full border-4 border-dashed animate-spin-slow opacity-30 ${isBreak ? 'border-green-400' : 'border-blue-400'}`}></div>
        <div className="text-7xl font-black text-slate-800 tabular-nums tracking-tighter">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-amber-500 shadow-amber-200' : 'bg-blue-600 shadow-blue-200'}`}
        >
          {isActive ? "일시 정지" : "몰입 시작"}
        </button>
        <button 
          onClick={resetTimer}
          className="px-10 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-colors shadow-sm"
        >
          초기화
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full">
         <div className="p-5 bg-white rounded-[1.5rem] border-2 border-slate-50 text-center shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">뽀모도로</span>
            <div className="text-2xl font-black text-slate-800">25분</div>
         </div>
         <div className="p-5 bg-white rounded-[1.5rem] border-2 border-slate-50 text-center shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">짧은 휴식</span>
            <div className="text-2xl font-black text-slate-800">5분</div>
         </div>
         <div className="p-5 bg-white rounded-[1.5rem] border-2 border-slate-50 text-center shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">긴 휴식</span>
            <div className="text-2xl font-black text-slate-800">15분</div>
         </div>
      </div>
    </div>
  );
};

export default FocusMode;
