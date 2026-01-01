
import React from 'react';
import { Language, translations } from '../types';

type Tab = 'cal' | 'sch' | 'goal' | 'rt' | 'log' | 'ai' | 'set' | 'focus' | 'dash' | 'people';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = translations[lang];
  
  const menu = [
    { id: 'cal', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: t.calendar },
    { id: 'sch', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: t.schedule },
    { id: 'dash', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: t.dashboard },
    { id: 'focus', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: t.focus },
    { id: 'goal', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: t.goals },
    { id: 'rt', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: t.routines },
    { id: 'people', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: t.people },
    { id: 'log', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', label: t.log },
    { id: 'ai', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: t.ai },
    { id: 'set', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: t.settings },
  ];

  return (
    <aside className="hidden w-20 flex-col border-r bg-white md:flex">
      <div className="flex h-16 items-center justify-center border-b">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
           <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
      </div>
      <nav className="flex-1 space-y-2 py-4 px-2 overflow-y-auto">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`group relative flex h-14 w-full flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="mt-1 text-[8px] font-bold text-center leading-tight">{item.label}</span>
            {activeTab === item.id && (
              <span className="absolute left-0 top-3 h-8 w-1 rounded-r-full bg-blue-600"></span>
            )}
          </button>
        ))}
      </nav>
      <div className="border-t p-4 flex justify-center">
        <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
      </div>
    </aside>
  );
};

export default Sidebar;
