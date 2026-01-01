
import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, saveUser, setSessionUser } from '../db';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.userId === userId && u.password === password);
      if (user) {
        setSessionUser(user);
        onLogin(user);
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } else {
      if (users.find(u => u.userId === userId)) {
        setError('이미 존재하는 아이디입니다.');
        return;
      }
      const newUser: User = { id: Date.now().toString(), userId, password, name };
      saveUser(newUser);
      setSessionUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
             <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Productivity Pro</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">나만의 몰입을 위한 다이어리</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded-xl">{error}</div>}
          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                required
                className="w-full rounded-xl border-none bg-slate-50 p-4 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              type="text"
              required
              className="w-full rounded-xl border-none bg-slate-50 p-4 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              placeholder="아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full rounded-xl border-none bg-slate-50 p-4 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            {isLogin ? '로그인' : '회원가입 및 시작하기'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {isLogin ? '처음이신가요? 계정 만들기' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
