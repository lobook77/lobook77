
import React, { useState, useEffect, useRef } from 'react';
import { askScholar, getGeminiClient } from '../services/geminiService';
import { Icons } from '../constants';
import { ChatMessage } from '../types';
import { Type } from "@google/genai";

const PROTESTANT_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", 
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", 
  "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", 
  "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", 
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", 
  "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

const CATHOLIC_DEUTERO = ["Tobias", "Judite", "1 Macabeus", "2 Macabeus", "Sabedoria", "Eclesiástico", "Baruc"];
const GNOSTIC_BOOKS = ["Evangelho de Tomé", "Evangelho de Maria Madalena", "Evangelho de Filipe", "O Apócrifo de João", "Pistis Sophia"];

const BIBLE_CATEGORIES = [
  { 
    id: 'protestant', 
    name: 'Protestante', 
    versions: [
      'NVI (PT)', 'ARA (PT)', 'ARC (PT)', 'NVT (PT)', 'King James (PT)', 
      'KJV (EN)', 'NIV (EN)', 'ESV (EN)', 'NKJV (EN)', 'NLT (EN)'
    ], 
    books: PROTESTANT_BOOKS 
  },
  { 
    id: 'catholic', 
    name: 'Católica', 
    versions: [
      'Ave Maria (PT)', 'CNBB (PT)', 'Jerusalém (PT)', 
      'RSV-CE (EN)', 'NABRE (EN)', 'Douay-Rheims (EN)'
    ], 
    books: [...PROTESTANT_BOOKS, ...CATHOLIC_DEUTERO] 
  },
  { 
    id: 'gnostic', 
    name: 'Gnóstica', 
    versions: ['Nag Hammadi (PT)', 'Berlim (PT)', 'Thomas Gospel (EN)', 'Mary Magdalene (EN)'], 
    books: GNOSTIC_BOOKS 
  }
];

const ReaderTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(BIBLE_CATEGORIES[0]);
  const [selectedVersion, setSelectedVersion] = useState('NVI (PT)');
  const [selectedBook, setSelectedBook] = useState('João');
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [isFetchingVerses, setIsFetchingVerses] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchVerses = async () => {
    setIsFetchingVerses(true);
    try {
      const ai = getGeminiClient();
      const isEnglish = selectedVersion.includes('(EN)');
      const prompt = `Return a JSON array of strings containing the first 15 verses of ${selectedBook} ${chapter} in the version ${selectedVersion}. 
      Provide the text strictly in the language of the version: ${isEnglish ? 'English' : 'Portuguese'}. 
      Do not include verse numbers inside the strings, just the text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const text = response.text || "[]";
      const data = JSON.parse(text);
      setVerses(Array.isArray(data) && data.length > 0 ? data : ["Texto não disponível para esta versão no momento."]);
    } catch (e) {
      console.error("Erro ao buscar versículos:", e);
      setVerses(["Erro ao conectar com a Biblioteca Sagrada. Japan cortes Religioso está verificando a conexão."]);
    } finally {
      setIsFetchingVerses(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory.books.includes(selectedBook)) {
      setSelectedBook(selectedCategory.books[0]);
      setChapter(1);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchVerses();
  }, [selectedBook, chapter, selectedVersion]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const isEnglish = selectedVersion.includes('(EN)');
      const context = `Reading Context: ${selectedBook} ${chapter} (${selectedVersion}). Patron: Japan cortes Religioso. Answer in ${isEnglish ? 'English' : 'Portuguese'}.`;
      const result = await askScholar(chatInput, context);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: result.text || 'O Erudito está em reflexão.', 
        timestamp: new Date(),
        sources: result.sources
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 flex flex-col lg:flex-row gap-8 min-h-full">
      {/* Coluna Principal de Leitura */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Painel de Controle */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-3">
          <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-2 scrollbar-hide">
            {BIBLE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedVersion(cat.versions[0]);
                }}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap ${
                  selectedCategory.id === cat.id 
                    ? 'bg-amber-700 text-white shadow-lg shadow-amber-900/20' 
                    : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select 
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="bg-stone-50 border-none rounded-xl px-4 py-3 text-amber-800 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-amber-500/10 transition-all"
            >
              {selectedCategory.versions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select 
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="bg-stone-50 border-none rounded-xl px-4 py-3 text-stone-700 font-bold outline-none cursor-pointer text-xs focus:ring-2 focus:ring-amber-500/10 transition-all"
            >
              {selectedCategory.books.map(book => <option key={book} value={book}>{book}</option>)}
            </select>

            <div className="flex items-center bg-stone-50 rounded-xl px-2 justify-between">
              <button onClick={() => setChapter(Math.max(1, chapter - 1))} className="p-2 text-amber-700 hover:scale-125 transition-transform">‹</button>
              <input 
                  type="number"
                  min="1"
                  value={chapter}
                  onChange={(e) => setChapter(parseInt(e.target.value) || 1)}
                  className="w-full bg-transparent border-none text-center font-bold text-stone-800 outline-none text-xs"
              />
              <button onClick={() => setChapter(chapter + 1)} className="p-2 text-amber-700 hover:scale-125 transition-transform">›</button>
            </div>
          </div>
        </div>

        {/* Parchment Container */}
        <div className="parchment flex-1 p-8 md:p-14 rounded-[3rem] shadow-2xl border border-stone-200 relative overflow-hidden flex flex-col min-h-[600px]">
          <div className="serif-title text-amber-900/5 text-[15rem] absolute -top-10 -right-10 select-none pointer-events-none font-black transition-transform duration-700 group-hover:scale-110">
            {chapter}
          </div>
          
          <div className="flex justify-between items-end mb-10 border-b border-amber-900/10 pb-6 relative z-10">
            <div>
              <span className="text-[10px] font-black text-amber-800/40 uppercase tracking-[0.3em] block mb-1">Livro Sagrado</span>
              <h2 className="serif-title text-4xl md:text-5xl text-amber-950">{selectedBook} {chapter}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-amber-800/30 uppercase tracking-[0.2em] block">{selectedCategory.name}</span>
              <span className="text-sm font-bold text-amber-700 bg-amber-100/50 px-3 py-1 rounded-full">{selectedVersion}</span>
            </div>
          </div>
          
          <div className="space-y-8 text-stone-900 text-xl leading-relaxed relative z-10 font-serif italic flex-1">
             {isFetchingVerses ? (
               <div className="flex flex-col items-center justify-center py-32 opacity-20 animate-pulse">
                 <div className="w-14 h-14 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mb-6"></div>
                 <p className="serif-title text-3xl">Consultando os Registros...</p>
               </div>
             ) : (
               verses.map((text, i) => (
                 <p key={i} className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                   <span className="font-bold text-amber-800/40 mr-4 not-italic text-sm">{i + 1}</span>
                   {text}
                 </p>
               ))
             )}
          </div>
          
          <div className="relative mt-16 border-t border-stone-300/50 pt-10 flex flex-col items-center gap-2 z-10">
             <div className="w-12 h-px bg-amber-900/20 mb-2"></div>
             <p className="italic text-stone-400 text-[10px] text-center tracking-[0.4em] uppercase font-black">
               A Sabedoria de <span className="text-amber-900/80">Japan cortes Religioso</span>
             </p>
          </div>
        </div>
      </div>

      {/* Coluna do Erudito (Chat) */}
      <div className="w-full lg:w-[400px] flex flex-col h-[650px] lg:h-auto glass-card rounded-[3rem] shadow-2xl overflow-hidden border border-stone-100 shrink-0">
        <div className="bg-stone-950 p-7 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-600/30 border border-white/10">Ω</div>
            <div>
                <div className="text-sm font-bold">Erudito Multilíngue</div>
                <div className="text-[9px] text-stone-500 uppercase tracking-widest font-black">Japan cortes Religioso</div>
            </div>
          </div>
          <button onClick={() => setChatHistory([])} className="text-stone-500 hover:text-white transition-all hover:rotate-90">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
          {chatHistory.length === 0 && (
            <div className="text-center mt-16 px-8 opacity-20 flex flex-col items-center gap-4">
              <div className="scale-150 text-amber-700"><Icons.Book /></div>
              <p className="text-sm font-medium leading-relaxed">Analise contextos, traduções e arqueologia. O Erudito fala Português e Inglês fluentemente.</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[90%] rounded-[1.5rem] px-5 py-4 text-xs leading-relaxed shadow-sm transition-all ${
                msg.role === 'user' ? 'bg-amber-700 text-white rounded-br-none' : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex gap-1 ml-2"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-.5s]"></div></div>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleAsk} className="p-5 bg-white border-t border-stone-100 flex gap-3">
          <input 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Interpretar texto..."
            className="flex-1 bg-stone-50 border-none rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-stone-300"
          />
          <button type="submit" disabled={isLoading || !chatInput.trim()} className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all active:scale-90 shadow-lg">
            <Icons.Send />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReaderTab;
