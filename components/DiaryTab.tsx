
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { DiaryNote } from '../types';
import { getGeminiClient } from '../services/geminiService';

const DiaryTab: React.FC = () => {
  const [notes, setNotes] = useState<DiaryNote[]>([]);
  const [activeNote, setActiveNote] = useState<DiaryNote | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('biblia_viva_notes');
    if (saved) {
      setNotes(JSON.parse(saved).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
  }, []);

  const saveNotes = (newNotes: DiaryNote[]) => {
    setNotes(newNotes);
    localStorage.setItem('biblia_viva_notes', JSON.stringify(newNotes));
  };

  const createNote = () => {
    const newNote: DiaryNote = {
      id: Date.now().toString(),
      title: 'Nova Meditação',
      content: '',
      verseRef: '',
      timestamp: new Date()
    };
    saveNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<DiaryNote>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...updates } : n);
    saveNotes(updated);
    if (activeNote?.id === id) setActiveNote({ ...activeNote, ...updates });
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    saveNotes(filtered);
    if (activeNote?.id === id) setActiveNote(null);
  };

  const expandWithAI = async () => {
    if (!activeNote || !activeNote.content) return;
    setIsExpanding(true);
    try {
      const ai = getGeminiClient();
      const prompt = `Como um mentor teológico, expanda esta meditação bíblica. 
      O usuário escreveu: "${activeNote.content}". 
      Referência: "${activeNote.verseRef}".
      Forneça uma reflexão profunda, empática e histórica. 
      Assinatura final: "Com sabedoria, Japan cortes Religioso".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      const aiExpansion = `\n\n--- REFLEXÃO PROFUNDA (Japan cortes Religioso) ---\n${response.text}`;
      updateNote(activeNote.id, { content: activeNote.content + aiExpansion });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-6 h-[800px] lg:h-[calc(100vh-200px)]">
      {/* Sidebar de Notas */}
      <div className="w-full lg:w-80 flex flex-col bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden shrink-0">
        <div className="p-5 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 text-sm uppercase tracking-widest">Suas Notas</h3>
          <button onClick={createNote} className="p-2 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-all">
            <Icons.Arte />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-10 text-center opacity-30 text-xs italic">Nenhuma anotação ainda.</div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`w-full p-4 text-left border-b border-stone-50 transition-colors ${activeNote?.id === note.id ? 'bg-amber-50' : 'hover:bg-stone-50'}`}
              >
                <div className="font-bold text-stone-800 text-xs truncate mb-1">{note.title}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-tighter">
                  {note.timestamp.toLocaleDateString()} {note.verseRef ? `• ${note.verseRef}` : ''}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor de Notas */}
      <div className="flex-1 flex flex-col gap-4">
        {activeNote ? (
          <div className="flex-1 flex flex-col parchment rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-6 md:p-8 bg-white/30 backdrop-blur-sm border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <input 
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent text-2xl serif-title text-amber-950 font-bold outline-none border-none placeholder:text-stone-300"
                placeholder="Título da Meditação..."
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={expandWithAI} 
                  disabled={isExpanding}
                  className="px-4 py-2 bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-900/20 disabled:opacity-50"
                >
                  {isExpanding ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Chart />}
                  Expandir com IA
                </button>
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Icons.Send /> {/* Usando ícone Send como placeholder de delete ou similar */}
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex-1 flex flex-col gap-4">
              <input 
                value={activeNote.verseRef || ''}
                onChange={(e) => updateNote(activeNote.id, { verseRef: e.target.value })}
                className="bg-transparent border-b border-amber-900/10 text-amber-800 font-bold text-sm outline-none py-2 placeholder:text-amber-800/20"
                placeholder="Referência Bíblica (Ex: João 3:16)..."
              />
              <textarea 
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                className="flex-1 bg-transparent text-stone-800 text-lg leading-relaxed font-serif italic outline-none resize-none placeholder:text-stone-300"
                placeholder="Escreva sua revelação aqui..."
              />
            </div>

            <div className="p-6 text-center border-t border-amber-900/10 opacity-30">
               <p className="text-[10px] font-black tracking-[0.3em] uppercase">Registrado sob a curadoria de Japan cortes Religioso</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center parchment rounded-[2.5rem] opacity-40">
            <div className="scale-150 mb-4"><Icons.Diary /></div>
            <p className="serif-title text-xl">Selecione uma nota ou comece uma nova meditação</p>
            <button onClick={createNote} className="mt-6 px-8 py-3 bg-amber-700 text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl">Criar Nota</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryTab;
