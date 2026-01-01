
import React, { useState, useMemo } from 'react';
import { AppState, Person } from '../types';
import { getPersonFollowUp } from '../services/geminiService';

interface PeopleViewProps {
  state: AppState;
  updateState: (u: (p: AppState) => AppState) => void;
}

const PeopleView: React.FC<PeopleViewProps> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [filterRelation, setFilterRelation] = useState('all');
  
  const [aiFollowUp, setAiFollowUp] = useState<{ id: string, text: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    name: '', relation: 'friend', phone: '', birthday: '', address: '', notes: '', tags: [], company: ''
  });

  const handleAdd = () => {
    if (!newPerson.name || !newPerson.name.trim()) {
      alert('성명을 입력해주세요.');
      return;
    }
    const person: Person = {
      id: Date.now().toString(),
      name: newPerson.name.trim(),
      relation: (newPerson.relation as any) || 'friend',
      phone: newPerson.phone || '',
      birthday: newPerson.birthday || '',
      address: newPerson.address || '',
      notes: newPerson.notes || '',
      tags: newPerson.tags || [],
      company: newPerson.company || '',
      lastContactDate: new Date().toISOString().split('T')[0]
    };
    updateState(prev => ({ ...prev, people: [...prev.people, person] }));
    setNewPerson({ name: '', relation: 'friend', phone: '', birthday: '', address: '', notes: '', tags: [], company: '' });
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editingPerson || !editingPerson.name.trim()) return;
    updateState(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === editingPerson.id ? editingPerson : p)
    }));
    setEditingPerson(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('인맥 정보를 삭제하시겠습니까?')) {
      updateState(prev => ({ ...prev, people: prev.people.filter(p => p.id !== id) }));
    }
  };

  const updateContact = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    updateState(prev => ({
      ...prev,
      people: prev.people.map(p => p.id === id ? { ...p, lastContactDate: today } : p)
    }));
    alert('연락 상태가 업데이트 되었습니다.');
  };

  const generateFollowUp = async (person: Person) => {
    setLoadingAi(person.id);
    const result = await getPersonFollowUp(person);
    setAiFollowUp({ id: person.id, text: result });
    setLoadingAi(null);
  };

  const getRelationshipHealth = (lastDate?: string) => {
    if (!lastDate) return { label: '신규', color: 'text-slate-400', bg: 'bg-slate-50' };
    const diff = (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24);
    if (diff <= 7) return { label: '따뜻함', color: 'text-rose-500', bg: 'bg-rose-50' };
    if (diff <= 30) return { label: '안정적', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    return { label: '소원해짐', color: 'text-slate-400', bg: 'bg-slate-100' };
  };

  const filteredPeople = useMemo(() => {
    let result = [...state.people];
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowSearch) || 
        p.company?.toLowerCase().includes(lowSearch) ||
        p.tags.some(t => t.toLowerCase().includes(lowSearch))
      );
    }
    if (filterRelation !== 'all') {
      result = result.filter(p => p.relation === filterRelation);
    }
    return result;
  }, [state.people, searchTerm, filterRelation]);

  const relationColors = {
    family: 'bg-rose-100 text-rose-700',
    friend: 'bg-blue-100 text-blue-700',
    relative: 'bg-amber-100 text-amber-700',
    colleague: 'bg-indigo-100 text-indigo-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const addTag = (isEdit: boolean) => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim();
    if (isEdit && editingPerson) {
      if (editingPerson.tags.includes(tag)) return;
      setEditingPerson({ ...editingPerson, tags: [...editingPerson.tags, tag] });
    } else {
      if (newPerson.tags?.includes(tag)) return;
      setNewPerson({ ...newPerson, tags: [...(newPerson.tags || []), tag] });
    }
    setTagInput('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">인맥 데이터베이스</h2>
          <p className="text-slate-500 font-medium">소중한 관계의 온도를 관리하세요.</p>
        </div>
        <button onClick={() => {
          setNewPerson({ name: '', relation: 'friend', phone: '', birthday: '', address: '', notes: '', tags: [], company: '' });
          setIsAdding(true);
        }} className="px-8 py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 text-sm transition-all">새 인맥 등록</button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border-2 border-slate-50 shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <input 
            type="text" 
            placeholder="이름, 소속, 관심사 검색..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
        </div>
        <select className="p-3 bg-slate-50 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500" value={filterRelation} onChange={(e) => setFilterRelation(e.target.value)}>
          <option value="all">전체</option>
          <option value="family">가족</option>
          <option value="friend">친구</option>
          <option value="relative">친척</option>
          <option value="colleague">직장 동료</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPeople.map(person => {
          const health = getRelationshipHealth(person.lastContactDate);
          return (
            <div key={person.id} className="group p-6 rounded-[2.5rem] border-2 border-slate-50 bg-white hover:border-blue-200 transition-all hover:shadow-2xl relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => setEditingPerson(person)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2}/></svg></button>
                <button onClick={() => handleDelete(person.id)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" strokeWidth={2}/></svg></button>
              </div>
              
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-2xl uppercase shadow-inner">{person.name[0]}</div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-xl truncate">{person.name}</h4>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${health.bg} ${health.color}`}>● {health.label}</div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap min-h-[24px]">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${relationColors[person.relation] || relationColors.other}`}>
                      {person.relation}
                    </span>
                    {person.tags.map(t => (
                      <span key={t} className="px-2 py-1 bg-slate-50 text-slate-400 text-[8px] font-black rounded-lg border border-slate-100">#{t}</span>
                    ))}
                </div>

                {person.notes && (
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2">{person.notes}</p>
                )}
                
                <div className="space-y-2 pt-4 border-t border-slate-50 mt-auto">
                  <div className="flex gap-2">
                    <button onClick={() => updateContact(person.id)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black transition-all">연락 완료</button>
                    <button 
                      onClick={() => generateFollowUp(person)} 
                      disabled={loadingAi === person.id}
                      className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      {loadingAi === person.id ? "..." : "🤖 대화 제안"}
                    </button>
                  </div>

                  {aiFollowUp && aiFollowUp.id === person.id && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-blue-600 uppercase">Follow-up Suggestion</span>
                          <button onClick={() => setAiFollowUp(null)} className="text-blue-300 hover:text-blue-500">×</button>
                       </div>
                       <div className="text-[10px] text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">
                          {aiFollowUp.text}
                       </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-1">
                    <span>마지막 연락: {person.lastContactDate || '없음'}</span>
                    {person.birthday && <span>🎂 {person.birthday}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(isAdding || editingPerson) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
           <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 my-8">
              <h3 className="text-2xl font-black mb-8 text-slate-800">{editingPerson ? '인맥 수정' : '신규 인맥 등록'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">성명 (필수)</label>
                       <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPerson ? editingPerson.name : newPerson.name} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, name: e.target.value }) : setNewPerson({ ...newPerson, name: e.target.value })} placeholder="이름" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">관계</label>
                       <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500" value={editingPerson ? editingPerson.relation : newPerson.relation} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, relation: e.target.value as any }) : setNewPerson({ ...newPerson, relation: e.target.value as any })}>
                          <option value="friend">친구</option>
                          <option value="family">가족</option>
                          <option value="relative">친척</option>
                          <option value="colleague">직장 동료</option>
                          <option value="other">기타</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">연락처</label>
                       <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPerson ? editingPerson.phone : newPerson.phone} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, phone: e.target.value }) : setNewPerson({ ...newPerson, phone: e.target.value })} placeholder="010-0000-0000" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">소속</label>
                       <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPerson ? editingPerson.company : newPerson.company} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, company: e.target.value }) : setNewPerson({ ...newPerson, company: e.target.value })} placeholder="회사, 학교 등" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">생일</label>
                       <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100" value={editingPerson ? editingPerson.birthday : newPerson.birthday} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, birthday: e.target.value }) : setNewPerson({ ...newPerson, birthday: e.target.value })} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">거주지</label>
                       <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPerson ? editingPerson.address : newPerson.address} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, address: e.target.value }) : setNewPerson({ ...newPerson, address: e.target.value })} placeholder="도시 혹은 상세 주소" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">태그 및 관심사</label>
                       <div className="flex gap-2 mb-3">
                          <input 
                            className="flex-1 p-3 bg-slate-50 rounded-xl font-bold ring-1 ring-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="태그 입력..." 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(!!editingPerson);
                              }
                            }}
                          />
                          <button onClick={() => addTag(!!editingPerson)} className="bg-slate-900 text-white px-4 rounded-xl text-xs font-black">추가</button>
                       </div>
                       <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl min-h-[50px]">
                          {(editingPerson ? editingPerson.tags : newPerson.tags)?.map(t => (
                            <span key={t} className="bg-white px-3 py-1 rounded-full text-[10px] font-black border shadow-sm flex items-center gap-2">
                              #{t}
                              <button onClick={() => {
                                if (editingPerson) setEditingPerson({ ...editingPerson, tags: editingPerson.tags.filter(tag => tag !== t) });
                                else setNewPerson({ ...newPerson, tags: (newPerson.tags || []).filter(tag => tag !== t) });
                              }} className="text-red-400 hover:text-red-600">×</button>
                            </span>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">비고 (Notes)</label>
                    <textarea rows={3} className="w-full p-4 bg-slate-50 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" value={editingPerson ? editingPerson.notes : newPerson.notes} onChange={(e) => editingPerson ? setEditingPerson({ ...editingPerson, notes: e.target.value }) : setNewPerson({ ...newPerson, notes: e.target.value })} placeholder="대화했던 내용, 성향, 특이사항 등..." />
                 </div>
              </div>
              <div className="flex gap-4 mt-10">
                 <button onClick={() => { setIsAdding(false); setEditingPerson(null); }} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">취소</button>
                 <button onClick={editingPerson ? handleUpdate : handleAdd} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">{editingPerson ? '수정 완료' : '정보 저장'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;
