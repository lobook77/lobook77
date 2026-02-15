
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getThemeAnalysis } from '../services/geminiService';
import { ThemeStats } from '../types';
// Fix: Import Icons from constants
import { Icons } from '../constants';

const VisualizerTab: React.FC = () => {
  const [book, setBook] = useState('Salmos');
  const [data, setData] = useState<ThemeStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stats = await getThemeAnalysis(book);
      setData(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [book]);

  return (
    <div className="p-6 md:p-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="serif-title text-3xl text-stone-800">Análise Temática</h2>
          <p className="text-stone-500">Visualizando a frequência de conceitos em {book}</p>
        </div>
        <select 
          value={book}
          onChange={(e) => setBook(e.target.value)}
          className="bg-white border border-stone-200 rounded-lg px-6 py-3 font-medium text-stone-700 outline-none focus:ring-2 focus:ring-amber-500"
        >
          {["Gênesis", "Êxodo", "Salmos", "Provérbios", "Mateus", "João", "Romanos", "Apocalipse"].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm h-[400px]">
            <h3 className="font-bold text-stone-700 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Frequência Relativa de Temas
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#fcfaf7'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-bold text-stone-700 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Distribuição Doutrinária
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
               {data.map((item, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-medium text-stone-500">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                   {item.name}
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-900 text-amber-100 p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="serif-title text-2xl mb-2">Insight Profundo</h3>
          <p className="text-amber-200/80 max-w-2xl">
            Baseado na análise de IA, o livro de {book} foca intensamente em <strong>{data[0]?.name}</strong>. Isso sugere que o leitor deve prestar atenção especial à forma como as passagens se conectam a este pilar teológico.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
          <Icons.Chart />
        </div>
      </div>
    </div>
  );
};

export default VisualizerTab;
