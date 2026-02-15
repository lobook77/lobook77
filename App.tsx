
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import { Icons } from './constants';
import ReaderTab from './components/ReaderTab';
import MentorTab from './components/MentorTab';
import VisualizerTab from './components/VisualizerTab';
import GalleryTab from './components/GalleryTab';
import ArchaeologyTab from './components/ArchaeologyTab';
import DiaryTab from './components/DiaryTab';
import StudyTab from './components/StudyTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Reader);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#fcfaf7] overflow-hidden">
      {/* Sidebar Desktop / Bottom Nav Mobile */}
      <nav className="fixed bottom-0 w-full md:relative md:w-28 md:h-screen bg-stone-950 text-stone-400 flex md:flex-col items-center justify-around md:justify-start md:pt-12 gap-6 py-3 md:py-8 z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] md:shadow-none border-t border-white/5 md:border-t-0 shrink-0">
        <div className="hidden md:flex mb-10 flex-col items-center gap-2">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-amber-900/40 border border-white/10">
                <span className="serif-title font-black text-2xl">B</span>
            </div>
            <span className="text-[10px] font-black text-amber-600 tracking-[0.3em] uppercase">VIVA</span>
        </div>
        
        <NavItem active={activeTab === AppTab.Reader} onClick={() => setActiveTab(AppTab.Reader)} icon={<Icons.Book />} label="Leitura" />
        <NavItem active={activeTab === AppTab.Study} onClick={() => setActiveTab(AppTab.Study)} icon={<Icons.Study />} label="Estudo" />
        <NavItem active={activeTab === AppTab.Diary} onClick={() => setActiveTab(AppTab.Diary)} icon={<Icons.Diary />} label="Diário" />
        <NavItem active={activeTab === AppTab.Mentor} onClick={() => setActiveTab(AppTab.Mentor)} icon={<Icons.Mic />} label="Voz" />
        <NavItem active={activeTab === AppTab.Maps} onClick={() => setActiveTab(AppTab.Maps)} icon={<Icons.Map />} label="Mapa" />
        <NavItem active={activeTab === AppTab.Visualizer} onClick={() => setActiveTab(AppTab.Visualizer)} icon={<Icons.Chart />} label="Análise" />
        <NavItem active={activeTab === AppTab.Gallery} onClick={() => setActiveTab(AppTab.Gallery)} icon={<Icons.Image />} label="Arte" />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#fcfaf7]">
        <header className="px-6 py-4 md:px-12 md:py-8 flex items-center justify-between border-b border-stone-200 bg-white/60 backdrop-blur-xl z-40 shrink-0">
           <div>
              <h1 className="text-xl md:text-3xl font-bold serif-title text-stone-900 leading-tight">
                {activeTab === AppTab.Reader && 'Biblioteca Global'}
                {activeTab === AppTab.Study && 'Centro de Estudos'}
                {activeTab === AppTab.Diary && 'Diário de Meditações'}
                {activeTab === AppTab.Mentor && 'Mentor de Voz'}
                {activeTab === AppTab.Maps && 'Locais Sagrados'}
                {activeTab === AppTab.Visualizer && 'Temas Visuais'}
                {activeTab === AppTab.Gallery && 'Arte Espiritual'}
              </h1>
              <div className="text-[9px] md:text-[10px] text-amber-700 font-black uppercase tracking-[0.25em] mt-0.5">
                Japan cortes Religioso <span className="text-stone-400 font-medium lowercase">apresenta</span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-[10px] font-black text-stone-800 uppercase tracking-tighter bg-amber-400 px-2 py-0.5 rounded shadow-sm">Premium</div>
                <div className="text-[11px] text-stone-400 font-medium italic">Japan cortes Religioso</div>
              </div>
              <div className="w-11 h-11 rounded-2xl border border-amber-200 p-0.5 shadow-sm bg-white overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Japan&backgroundColor=1c1917`} alt="User" className="w-full h-full object-cover" />
              </div>
           </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 flex flex-col scroll-smooth">
          <div className="flex-1 w-full max-w-7xl mx-auto">
            {activeTab === AppTab.Reader && <ReaderTab />}
            {activeTab === AppTab.Study && <StudyTab />}
            {activeTab === AppTab.Diary && <DiaryTab />}
            {activeTab === AppTab.Mentor && <MentorTab />}
            {activeTab === AppTab.Maps && <ArchaeologyTab />}
            {activeTab === AppTab.Visualizer && <VisualizerTab />}
            {activeTab === AppTab.Gallery && <GalleryTab />}
          </div>
          
          <footer className="py-12 text-center border-t border-stone-200/50 bg-stone-50/80 backdrop-blur-sm px-6">
             <div className="flex flex-col items-center gap-4">
                <div className="text-stone-300 text-[10px] font-black tracking-[0.6em] uppercase">Soli Deo Gloria</div>
                <div className="flex items-center gap-6">
                  <div className="h-px w-12 bg-amber-200"></div>
                  <p className="text-stone-600 text-lg font-bold tracking-widest italic">
                    Japan cortes Religioso
                  </p>
                  <div className="h-px w-12 bg-amber-200"></div>
                </div>
                <div className="flex gap-4 text-[9px] text-stone-400 font-medium uppercase tracking-[0.2em]">
                   <span>Estudo Bíblico IA</span>
                   <span className="text-amber-300">•</span>
                   <span>© 2025</span>
                   <span className="text-amber-300">•</span>
                   <span>Alta Teologia</span>
                </div>
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative group ${active ? 'text-amber-500' : 'text-stone-600 hover:text-stone-300'}`}
  >
    <div className={`p-3 rounded-2xl transition-all duration-500 ${active ? 'bg-amber-500/10 scale-110 shadow-2xl shadow-amber-500/10 border border-amber-500/20' : 'group-active:scale-95 hover:bg-white/5'}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
      {label}
    </span>
    {active && (
        <div className="hidden md:block absolute -right-[2.3rem] top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-l-full shadow-[0_0_20px_rgba(245,158,11,0.6)]"></div>
    )}
  </button>
);

export default App;
