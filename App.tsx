import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Image as ImageIcon, BookOpen, Wand2 } from 'lucide-react';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState("");
  const [hair, setHair] = useState("");
  const [outfit, setOutfit] = useState("");
  const [stuff, setStuff] = useState("");
  const [height, setHeight] = useState("");
  const [color, setColor] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt && !gender && !hair && !outfit) {
      setError("Please provide at least a general prompt or some character details.");
      return;
    }

    setIsLoading(true);
    setError("");
    setImageUrl("");
    setInspiration("");

    const aiPrompt = `Anime character design.
General idea: ${prompt || 'Not specified'}
Gender: ${gender || 'Not specified'}
Hair: ${hair || 'Not specified'}
Outfit: ${outfit || 'Not specified'}
Accessories/Stuff: ${stuff || 'Not specified'}
Height: ${height || 'Not specified'}
Main Color Palette: ${color || 'Not specified'}`;

    try {
      const textResPromise = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert anime character designer. Based on the following specifications, research existing anime characters that might inspire this design, and write a brief but captivating character profile and visual description. Do NOT include a backstory.\n\n${aiPrompt}\n\nFormat your response using Markdown, with exactly two sections: "Inspiration / Reference Characters" and "Character Profile". Keep the details concise, strictly on-point to the given prompt details, and total length under 300 words.`,
      });

      const imagePromptDetails = [prompt, gender, hair ? `${hair} hair` : '', outfit ? `${outfit} outfit` : '', stuff ? `${stuff} accessories` : '', height, color ? `${color} main colors` : ''].filter(Boolean).join(', ');

      const imageResPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `full body character standing, ${gender ? gender : 'anime character'}, anime style illustration, 8k resolution, ultra-highly detailed, masterpiece, best quality, precise adherence to prompt details. Specifications: ${imagePromptDetails}. Vibrant colors, dynamic lighting, sharp focus. The background MUST exactly be a transparent-like simple black and white checkered grid background. No other scenery or environmental elements.`,
            },
          ],
        },
      });

      const [textRes, imageRes] = await Promise.all([textResPromise, imageResPromise]);

      if (textRes.text) {
        setInspiration(textRes.text);
      }

      let foundImageUrl = "";
      for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          foundImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
        }
      }
      
      if (foundImageUrl) {
        setImageUrl(foundImageUrl);
      } else {
        setError("Failed to generate image from response.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black/90 font-serif selection:bg-black selection:text-white paper-texture">
      <div className="textured-overlay"></div>
      <header className="border-b-[3px] border-black p-6 sticky top-0 z-10 bg-[#f7f5ef]/80 backdrop-blur-md">
        <div className="max-w-[85rem] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#c1272d] text-[#c1272d] flex items-center justify-center rounded-sm rotate-[-4deg] opacity-90 shrink-0">
                <span className="text-xl" style={{ fontFamily: "'Yuji Boku', serif", writingMode: "vertical-rl" }}>創</span>
              </div>
              <h1 className="text-4xl sm:text-5xl text-black tracking-[0.1em] ml-2 uppercase" style={{ fontFamily: "'Yuji Boku', serif", WebkitTextStroke: "1.5px black", textShadow: "4px 4px 0px rgba(0,0,0,0.12)" }}>
                ANISEDAI STUDIO
              </h1>
            </div>
            <div className="hidden sm:block text-xs font-bold tracking-[0.3em] uppercase text-black/50">
              Character synthesis
            </div>
        </div>
      </header>

      <main className="max-w-[85rem] mx-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-10 items-start mt-4">
        {/* Left Column: Form */}
        <section className="xl:col-span-4 space-y-6">
          <div className="bg-[#e8e4d9]/50 p-6 shadow-sm border-2 border-black/80 relative">
            {/* Paper corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black -translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black translate-x-[2px] -translate-y-[2px]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black -translate-x-[2px] translate-y-[2px]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black translate-x-[2px] translate-y-[2px]" />

            <h2 className="text-2xl font-bold text-black mb-8 tracking-widest border-b-[3px] border-black inline-block pb-1" style={{ fontFamily: "'Yuji Boku', serif" }}>Character Traits</h2>
            
            <div className="space-y-7">
              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">General Idea / Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/30 pb-2 text-black text-lg focus:outline-none focus:border-black transition-colors resize-none placeholder-black/20"
                  placeholder="A futuristic cyberpunk rogue..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="relative group">
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Gender</label>
                    <input 
                      type="text" value={gender} onChange={e => setGender(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                      placeholder="Female, Male..."
                    />
                </div>
                <div className="relative group">
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Height</label>
                    <input 
                      type="text" value={height} onChange={e => setHeight(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                      placeholder="Tall, 160cm..."
                    />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Hair Style & Color</label>
                <input 
                  type="text" value={hair} onChange={e => setHair(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                  placeholder="Spiky red hair, long straight black..."
                />
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Outfit</label>
                <input 
                  type="text" value={outfit} onChange={e => setOutfit(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                  placeholder="School uniform, mecha suit..."
                />
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Accessories (Stuff)</label>
                <input 
                  type="text" value={stuff} onChange={e => setStuff(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                  placeholder="Katana, glasses, mechanical arm..."
                />
              </div>

              <div className="relative group">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-black/60 uppercase mb-1 transition-colors group-focus-within:text-black">Base Color Palette</label>
                <input 
                  type="text" value={color} onChange={e => setColor(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black/30 pb-1 text-black text-lg focus:outline-none focus:border-black transition-colors placeholder-black/20"
                  placeholder="Monochrome, neon pink & cyan..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-900 border-dashed text-red-900 px-4 py-3 text-sm font-bold shadow-sm">
                  {error}
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                style={{ fontFamily: "'Yuji Boku', serif" }}
                className="w-full mt-8 bg-black text-[#f4f1ea] hover:bg-black/90 font-bold tracking-widest py-4 px-6 text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[6px_6px_0_rgba(0,0,0,0.8)] border-2 border-transparent hover:border-black hover:bg-[#f7f5ef] hover:text-black group"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6 group-hover:text-[#c1272d] transition-colors" />}
                {isLoading ? "Synthesizing..." : "Draw Character"}
              </button>

            </div>
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
            
            {/* Image Result */}
            <div className="bg-[#e8e4d9]/80 border-2 border-black/80 shadow-[8px_8px_0_rgba(0,0,0,0.8)] flex flex-col min-h-[500px]">
              <div className="p-4 border-b-2 border-black/80 bg-black text-[#f4f1ea] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-[#c1272d]" />
                  <h3 className="font-bold text-lg tracking-widest uppercase">Portrait</h3>
                </div>
                <div className="w-2 h-2 bg-[#c1272d] rounded-full animate-pulse opacity-50" />
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center relative group min-h-[500px]">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-black z-10 bg-[#f4f1ea]/80 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" strokeWidth={1.5} />
                    <p className="font-bold text-lg tracking-widest uppercase">Drawing. . .</p>
                  </div>
                ) : null}
                
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Generated anime character" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter contrast-105"
                  />
                ) : !isLoading && (
                  <div className="text-black/30 flex flex-col items-center gap-3">
                     <ImageIcon className="w-16 h-16" strokeWidth={1.5} />
                     <p className="text-sm font-bold">Awaiting prompt</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inspiration & Lore Result */}
            <div className="bg-[#e8e4d9]/80 border-2 border-black/80 shadow-[8px_8px_0_rgba(0,0,0,0.8)] flex flex-col min-h-[500px]">
              <div className="p-4 border-b-2 border-black/80 bg-black text-[#f4f1ea] flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#c1272d]" />
                <h3 className="font-bold text-lg tracking-widest uppercase">Record</h3>
              </div>
              <div className="flex-1 p-8 overflow-y-auto relative min-h-[500px]">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-black z-10 bg-[#f4f1ea]/80 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" strokeWidth={1.5} />
                    <p className="font-bold text-lg tracking-widest uppercase">Writing. . .</p>
                  </div>
                ) : null}

                {inspiration ? (
                  <div className="markdown-body">
                    <Markdown>{inspiration}</Markdown>
                  </div>
                ) : !isLoading && (
                  <div className="text-black/30 flex flex-col items-center justify-center h-full gap-3">
                     <BookOpen className="w-16 h-16 mt-10" />
                     <p className="text-sm font-bold">No record found</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
}
