
import React, { useState, useEffect } from 'react';

export const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Header: React.FC<{ date: string }> = ({ date }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Productivity <span className="text-blue-600">Pro</span></h1>
        <div className="hidden h-6 w-px bg-slate-200 md:block"></div>
        <div className="hidden text-sm font-bold text-slate-500 md:block">
          {new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm font-bold text-slate-600 tabular-nums">
        <span className="rounded-full bg-slate-100 border px-4 py-1.5 shadow-inner">
          {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </header>
  );
};

export default Header;
