
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Icons } from '../constants';

const MentorTab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const currentInputTrans = useRef('');
  const currentOutputTrans = useRef('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Implementação manual de decode e encode conforme orientações
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try { session.close(); } catch(e) {}
        });
        sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    if (isConnecting || isActive) return;
    
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Rely solely on sessionPromise resolves
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTrans.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTrans.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const u = currentInputTrans.current;
              const m = currentOutputTrans.current;
              if (u || m) {
                setTranscriptionHistory(prev => [...prev.slice(-10), `Você: ${u || '(áudio)'}`, `Mentor: ${m || '(áudio)'}`]);
              }
              currentInputTrans.current = '';
              currentOutputTrans.current = '';
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + buffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Erro na Live Session:", e);
            stopSession();
          },
          onclose: () => {
            console.log("Sessão encerrada");
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Você é um mentor espiritual profundo e acolhedor. Ajude o usuário a encontrar paz e sabedoria através das escrituras. Seja conciso mas caloroso. Japan cortes Religioso é o canal que patrocina esta sabedoria.',
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Falha ao iniciar sessão:", err);
      setIsConnecting(false);
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="p-6 md:p-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-stone-100 flex items-center justify-center mx-auto border-4 transition-all duration-500 ${isActive ? 'border-amber-500 shadow-amber-200 shadow-2xl scale-105' : 'border-stone-200'}`}>
          <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-400'}`}>
            <Icons.Mic />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="serif-title text-4xl text-stone-800">{isActive ? 'Canal de Voz Ativo' : 'Aconselhamento por Voz'}</h2>
          <p className="text-stone-500 max-w-md mx-auto">{isActive ? 'Fale agora, o Mentor está em sintonia com suas palavras...' : 'Inicie uma conversa profunda guiada pela sabedoria milenar.'}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`px-12 py-4 rounded-full font-bold text-lg transition-all shadow-xl active:scale-95 ${isActive ? 'bg-stone-800 text-white hover:bg-black' : 'bg-amber-700 text-white hover:bg-amber-800'}`}
          >
            {isConnecting ? 'Estabelecendo conexão...' : isActive ? 'Encerrar Mentoria' : 'Conectar com Mentor'}
          </button>
          
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            Powered by <span className="text-amber-800/60">Japan cortes Religioso</span>
          </p>
        </div>
        
        {transcriptionHistory.length > 0 && (
          <div className="mt-8 p-6 bg-white/70 border border-amber-100 rounded-3xl text-left space-y-3 shadow-inner max-h-[300px] overflow-y-auto">
            {transcriptionHistory.map((line, i) => (
              <div key={i} className={`text-sm p-3 rounded-xl ${line.startsWith('Você') ? 'text-stone-500 bg-stone-50/50' : 'text-stone-800 font-medium bg-amber-50/40 border-l-4 border-amber-300 pl-4'}`}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorTab;
