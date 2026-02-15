
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const exploreArchaeology = async (location: string) => {
  const ai = getGeminiClient();
  const systemInstruction = `Você é um arqueólogo bíblico e geógrafo especializado. 
  Sua tarefa é comparar um local bíblico antigo com sua localização geográfica e estado atual. 
  Use o Google Maps para encontrar as coordenadas e o Google Search para detalhes históricos.
  Forneça uma resposta rica em detalhes: nome antigo, país atual, o que existe lá hoje (ruínas, cidade moderna, etc) e a importância bíblica.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Compare o local bíblico "${location}" com o mapa e realidade atual.`,
    config: {
      systemInstruction,
      tools: [{ googleMaps: {} }, { googleSearch: {} }]
    },
  });

  return {
    text: response.text,
    mapLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.maps) || [],
    searchLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web) || []
  };
};

export const askScholar = async (prompt: string, context?: string) => {
  const ai = getGeminiClient();
  const systemInstruction = `Você é um erudito bíblico altamente respeitado, empático e profundo. 
  Sua missão é explicar as escrituras com clareza histórica, teológica e arqueológica.
  Utilize informações baseadas em pesquisas acadêmicas reais e o Google Search para referências externas.
  Mantenha um tom respeitoso e espiritual. Se o usuário perguntar algo fora do escopo bíblico, gentilmente redirecione para a sabedoria das escrituras.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: context ? `${context}\n\nPergunta do usuário: ${prompt}` : prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
      tools: [{ googleSearch: {} }]
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateBibleArt = async (verse: string) => {
  const ai = getGeminiClient();
  const prompt = `Uma representação artística sagrada, cinematográfica e inspiradora do seguinte versículo bíblico: "${verse}". Estilo de pintura clássica ou arte digital épica, luz divina, proporção 16:9. Alta definição, cores vibrantes, atmosfera celestial.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const getThemeAnalysis = async (book: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise o livro de ${book} na Bíblia e identifique os 5 temas principais. 
    Retorne um JSON com a frequência estimada (0-100) de cada tema e uma cor hexadecimal apropriada para o tema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER },
            color: { type: Type.STRING }
          },
          required: ["name", "value", "color"]
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Erro ao analisar temas:", e);
    return [];
  }
};
