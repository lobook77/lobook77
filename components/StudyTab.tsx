
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { getGeminiClient } from '../services/geminiService';

type OutlineStyle = 'curto' | 'profundo' | 'expositivo' | 'tematico';

const StudyTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<string | null>(null);
  const [outline, setOutline] = useState<string | null>(null);
  const [outlineTopic, setOutlineTopic] = useState('');
  const [outlineStyle, setOutlineStyle] = useState<OutlineStyle>('profundo');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
        handleDictionarySearch(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleDictionarySearch = async (termOverride?: string) => {
    const query = termOverride || searchTerm;
    if (!query.trim()) return;
    
    setIsSearching(true);
    setDefinition(null);
    try {
      const ai = getGeminiClient();
      const prompt = `Você é um dicionário teológico exaustivo. Defina o termo: "${query}". 
      Inclua: 1. Significado em Grego/Hebraico (se aplicável), 2. Contexto Bíblico, 3. Aplicação Teológica. 
      Linguagem: Português e referências em Inglês quando necessário. 
      Assinatura: "Curadoria de Japan cortes Religioso".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setDefinition(response.text);
    } catch (e) {
      console.error(e);
      setDefinition("Erro ao consultar o dicionário sagrado.");
    } finally {
      setIsSearching(false);
    }
  };

  const generateOutline = async () => {
    if (!outlineTopic.trim()) return;
    setIsGenerating(true);
    setOutline(null);
    try {
      const ai = getGeminiClient();
      const prompt = `Gere um esboço de pregação ${outlineStyle} sobre o tema/versículo: "${outlineTopic}". 
      Estrutura: Título Criativo, Texto Base, Introdução, 3 Pontos Principais com versículos de apoio, Aplicação Prática e Conclusão. 
      Estilo de entrega: Profundo, bíblico e inspirador. 
      Assinatura final: "Este esboço foi preparado por Japan cortes Religioso para edificação do corpo de Cristo".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setOutline(response.text);
    } catch (e) {
      console.error(e);
      setOutline("Erro ao gerar esboço.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Dicionário Section */}
      <section className="bg-white rounded-[3rem] shadow-xl border border-stone-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="serif-title text-3xl text-stone-800">Dicionário de Originais</h2>
              <p className="text-stone-500 text-sm">Pesquise termos em Grego, Hebraico e conceitos teológicos.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleListening}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
              >
                <Icons.Mic />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDictionarySearch()}
              placeholder="Digite um termo (ex: Graça, Shalom, Logos)..."
              className="flex-1 bg-stone-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
            />
            <button 
              onClick={() => handleDictionarySearch()}
              disabled={isSearching}
              className="px-8 bg-stone-950 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              {isSearching ? '...' : 'Definir'}
            </button>
          </div>

          {definition && (
            <div className="parchment p-8 rounded-[2rem] border border-stone-200 shadow-inner animate-in slide-in-from-top-4">
              <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed whitespace-pre-wrap font-serif italic text-lg">
                {definition}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Esboços Section */}
      <section className="bg-stone-900 rounded-[3rem] shadow-2xl border border-stone-800 overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          <div className="text-center md:text-left">
            <h2 className="serif-title text-3xl text-amber-500">Esboços de Pregação</h2>
            <p className="text-stone-400 text-sm">Ferramenta expositiva para pastores e líderes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-1">Tema ou Versículo Base</label>
              <input 
                value={outlineTopic}
                onChange={(e) => setOutlineTopic(e.target.value)}
                placeholder="Ex: João 3:16 ou O Fruto do Espírito"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-1">Estilo do Esboço</label>
              <div className="grid grid-cols-2 gap-2">
                {(['curto', 'profundo', 'expositivo', 'tematico'] as OutlineStyle[]).map(style => (
                  <button
                    key={style}
                    onClick={() => setOutlineStyle(style)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${outlineStyle === style ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={generateOutline}
            disabled={isGenerating || !outlineTopic}
            className="w-full py-5 bg-amber-700 text-white rounded-[1.5rem] font-bold text-lg hover:bg-amber-800 transition-all shadow-xl shadow-amber-900/20 active:scale-95 disabled:opacity-30"
          >
            {isGenerating ? 'A IA está estruturando a mensagem...' : 'Gerar Esboço Edificante'}
          </button>

          {outline && (
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-inner text-stone-900 animate-in zoom-in-95 duration-500">
               <div className="max-w-none prose prose-stone whitespace-pre-wrap font-serif text-lg leading-relaxed">
                  {outline}
               </div>
               <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col items-center opacity-40">
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400">Desenvolvido por Japan cortes Religioso</p>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudyTab;
