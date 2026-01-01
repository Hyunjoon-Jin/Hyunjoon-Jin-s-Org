
import React, { useState, useEffect } from 'react';
import { loadState, saveState, getSessionUser, setSessionUser } from './db';
import { AppState, User } from './types';
import CalendarView from './components/CalendarView';
import ScheduleView from './components/ScheduleView';
import GoalView from './components/GoalView';
import RoutineView from './components/RoutineView';
import LogView from './components/LogView';
import PeopleView from './components/PeopleView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import FocusMode from './components/FocusMode';
import DashboardView from './components/DashboardView';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(getSessionUser());
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<'cal' | 'sch' | 'goal' | 'rt' | 'log' | 'ai' | 'set' | 'focus' | 'dash' | 'people'>('cal');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  useEffect(() => {
    if (currentUser) {
      setState(loadState(currentUser.id));
    } else {
      setState(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (state && currentUser) {
      saveState(currentUser.id, state);
    }
  }, [state, currentUser]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => prev ? updater(prev) : null);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setCurrentUser(null);
    setState(null);
  };

  if (!currentUser || !state) {
    return <AuthView onLogin={setCurrentUser} />;
  }

  return (
    <div className={`flex min-h-screen ${state.settings.theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={state.settings.language} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Header date={selectedDate} />
        
        <div className="p-4 md:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'cal' && (
            <CalendarView 
              state={state} 
              onSelectDate={(d) => { setSelectedDate(d); setActiveTab('sch'); }} 
              currentDate={selectedDate}
              updateState={updateState}
            />
          )}
          
          {activeTab === 'sch' && (
            <ScheduleView 
              state={state} 
              date={selectedDate} 
              updateState={updateState}
              setDate={setSelectedDate}
            />
          )}

          {activeTab === 'dash' && <DashboardView state={state} />}
          {activeTab === 'focus' && <FocusMode state={state} />}
          {activeTab === 'goal' && <GoalView state={state} updateState={updateState} />}
          {activeTab === 'rt' && <RoutineView state={state} updateState={updateState} />}
          {activeTab === 'people' && <PeopleView state={state} updateState={updateState} />}
          {activeTab === 'log' && <LogView state={state} date={selectedDate} updateState={updateState} onDateChange={setSelectedDate} />}
          {activeTab === 'ai' && <AIAssistant state={state} />}
          {activeTab === 'set' && (
            <div className="space-y-8">
              <SettingsView state={state} updateState={updateState} />
              <div className="max-w-2xl mx-auto">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 text-red-500 font-bold border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  {state.settings.language === 'ko' ? '로그아웃' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
