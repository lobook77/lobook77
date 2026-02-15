
import React, { useState } from 'react';
import { generateBibleArt } from '../services/geminiService';
import { Icons } from '../constants';

interface SavedArt {
  url: string;
  verse: string;
  timestamp: Date;
}

const GalleryTab: React.FC = () => {
  const [verse, setVerse] = useState('João 1:1 - No princípio era o Verbo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentArt, setCurrentArt] = useState<string | null>(null);
  const [savedArts, setSavedArts] = useState<SavedArt[]>([
    {
        url: 'https://picsum.photos/seed/creation/800/450',
        verse: 'Gênesis 1:3 - Haja Luz',
        timestamp: new Date()
    }
  ]);

  const handleGenerate = async () => {
    if (!verse.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateBibleArt(verse);
      if (url) {
        setCurrentArt(url);
        setSavedArts(prev => [{ url, verse, timestamp: new Date() }, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12">
      <div className="max-w-3xl">
        <h2 className="serif-title text-3xl text-stone-800 mb-2">Pintando a Palavra</h2>
        <p className="text-stone-500 mb-8">Transforme versículos bíblicos em arte sacra gerada por inteligência artificial.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="Digite um versículo ou cena bíblica..."
            className="flex-1 bg-white border border-stone-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : <Icons.Image />}
            Gerar Visão
          </button>
        </div>
      </div>

      {currentArt && (
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nova Criação</h3>
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white aspect-video">
                <img src={currentArt} alt="Biblical Art" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-lg serif-title italic">"{verse}"</p>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-8">
        <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            Coleção Sagrada
            <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full">{savedArts.length}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArts.map((art, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-shadow group">
                <div className="aspect-video relative overflow-hidden">
                    <img src={art.url} alt={art.verse} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                    <p className="text-stone-700 text-sm font-medium line-clamp-2 mb-2">"{art.verse}"</p>
                    <div className="text-[10px] text-stone-400 uppercase tracking-tighter">
                        {art.timestamp.toLocaleDateString()} • IA Generativa
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryTab;
