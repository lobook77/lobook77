
import React, { useState } from 'react';
import { exploreArchaeology } from '../services/geminiService';
import { Icons } from '../constants';

const ArchaeologyTab: React.FC = () => {
  const [query, setQuery] = useState('Babilônia');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await exploreArchaeology(query);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-10">
      <div className="max-w-3xl">
        <h2 className="serif-title text-3xl text-stone-800 mb-2">Explorador de Lugares Sagrados</h2>
        <p className="text-stone-500 mb-8">Compare localizações bíblicas com o mapa geopolítico atual utilizando inteligência artificial.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Nínive, Ur, Cafarnaum, Monte Sinai..."
            className="flex-1 bg-white border border-stone-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-medium"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-stone-900 hover:bg-black text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Icons.Map />}
            Explorar
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-8 opacity-5">
                    <Icons.Map />
                </div>
                <h3 className="serif-title text-2xl text-amber-900 mb-6 border-b border-amber-100 pb-2">Análise Comparativa</h3>
                <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {result.text}
                </div>
            </div>

            {result.mapLinks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.mapLinks.map((chunk: any, i: number) => (
                  <a 
                    key={i} 
                    href={chunk.maps.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Icons.Map />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-amber-800 uppercase tracking-widest">Abrir no Google Maps</div>
                        <div className="text-sm font-medium text-stone-700 truncate max-w-[150px]">{chunk.maps.title}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
              <h4 className="text-amber-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Fontes de Pesquisa</h4>
              <div className="space-y-4">
                {result.searchLinks.length > 0 ? result.searchLinks.map((chunk: any, i: number) => (
                  <a 
                    key={i} 
                    href={chunk.web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-sm font-medium mb-1 line-clamp-2">{chunk.web.title}</div>
                    <div className="text-[10px] text-stone-400 truncate">{chunk.web.uri}</div>
                  </a>
                )) : (
                    <p className="text-xs text-stone-500 italic">Pesquisa histórica integrada via Google Search.</p>
                )}
              </div>
            </div>

            <div className="parchment p-8 rounded-[2.5rem] border border-stone-300 shadow-lg">
                <h4 className="serif-title text-xl text-amber-950 mb-4">Curiosidade Arqueológica</h4>
                <p className="text-sm text-amber-900/70 italic leading-relaxed">
                    Muitas cidades bíblicas hoje são "Tells" - montículos formados por camadas de civilizações acumuladas ao longo de milênios.
                </p>
            </div>
          </div>
        </div>
      )}
      
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-300 opacity-50">
            <div className="mb-4 scale-150"><Icons.Map /></div>
            <p className="serif-title text-xl">Digite um local para ver o antes e o depois</p>
        </div>
      )}
    </div>
  );
};

export default ArchaeologyTab;
