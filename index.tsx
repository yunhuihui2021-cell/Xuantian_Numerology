
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
}

interface LotteryResult {
  front: number[];
  back: number[];
  hexagram: {
    name: string;
    meaning: string;
    description: string;
  };
  analysis: string;
}

// --- Components ---
const Ball: React.FC<{ number: number; type: 'front' | 'back'; size?: 'sm' | 'md' }> = ({ number, type, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? "w-10 h-10 text-lg" : "w-12 h-12 text-xl";
  const colorStyle = type === 'front' 
    ? "border border-[#b91c1c] text-[#b91c1c]" 
    : "border border-[#1a1a1a] text-[#1a1a1a]";

  return (
    <div className={`${sizeClasses} flex items-center justify-center relative`}>
      <div className={`absolute inset-0 ${colorStyle} bg-white/60 transform rotate-3`}></div>
      <span className="relative z-10 chinese-font font-bold">
        {number.toString().padStart(2, '0')}
      </span>
      <div className={`absolute -top-1 -right-1 text-[8px] px-0.5 leading-none text-white ${type === 'front' ? 'bg-[#b91c1c]' : 'bg-[#1a1a1a]'}`}>
        {type === 'front' ? '天' : '地'}
      </div>
    </div>
  );
};

// --- Services ---
const predictLottery = async (profile: UserProfile): Promise<LotteryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    你是一位执掌乾坤的三国顶级谋士与大卜师。你深谙《易经》之道，精通“玄天演卦”之术，能够看穿每个人的“命格定数”。
    
    【预测目标】
    大乐透（5+2）预测：
    - 前区5个号码（1-35）
    - 后区2个号码（1-12）
    
    【命格主信息】
    - 名讳：${profile.name}
    - 破尘之时（诞辰）：${profile.birthDate} ${profile.birthTime}
    - 阴阳禀赋：${profile.gender === 'male' ? '乾（阳）' : '坤（阴）'}
    
    【演算任务】
    1. 根据缘主生辰八字，推演其在本命年景下的“天机动向”。
    2. 运用“先天演卦”起出一式神机锦囊（卦名必须华丽庄重）。
    3. 参破天机，给出今日最契合命格的“胜数”。
    
    【输出格式要求】
    - 必须返回 JSON。
    - 'analysis' 字段：必须以文言文或《三国演义》风格书写。内容应聚焦于“命格定数”与“参破天机”的感悟。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          back: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          hexagram: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              meaning: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "meaning", "description"]
          },
          analysis: { type: Type.STRING }
        },
        required: ["front", "back", "hexagram", "analysis"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text.trim());
    data.front.sort((a: number, b: number) => a - b);
    data.back.sort((a: number, b: number) => a - b);
    return data;
  } catch (e) {
    throw new Error("星象晦暗，命盘暂不可考，请待吉时重试。");
  }
};

// --- Main App Component ---
const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    birthDate: '1995-05-18',
    birthTime: '08:00',
    gender: 'male',
  });

  const generateImage = async () => {
    if (!result) return;
    await document.fonts.ready;

    const canvas = document.getElementById('hidden-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Height Adjustment for cleaner image
    canvas.height = 720; 

    // Background & Texture
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Double Borders
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
    ctx.lineWidth = 1; ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.lineWidth = 4; ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // Subtle BG Char
    ctx.globalAlpha = 0.04; ctx.fillStyle = '#1a1a1a'; ctx.font = '300px "Ma Shan Zheng"';
    ctx.textAlign = 'center'; ctx.fillText('吉', canvas.width / 2, canvas.height / 2 + 100);
    ctx.globalAlpha = 1.0;

    // Title & Header
    ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 80px "Ma Shan Zheng"';
    ctx.textAlign = 'center'; ctx.fillText('天 选 胜 数', canvas.width / 2, 160);
    ctx.font = '20px "Noto Serif SC"'; ctx.fillStyle = '#888';
    ctx.fillText('玄 天 演 卦 · 灵 感 天 机', canvas.width / 2, 210);

    // Front Numbers
    ctx.font = 'bold 30px "Ma Shan Zheng"'; ctx.fillStyle = '#b91c1c';
    ctx.fillText('【 天 罡 阳 数 】', canvas.width / 2, 310);
    const ballR = 45; const gap = 110;
    const startXF = (canvas.width - (result.front.length * gap - (gap - ballR * 2))) / 2 + ballR;
    result.front.forEach((num, i) => {
        const x = startXF + (i * gap); const y = 400;
        ctx.beginPath(); ctx.arc(x, y, ballR, 0, Math.PI * 2);
        ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#b91c1c'; ctx.font = 'bold 44px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // Back Numbers
    ctx.font = 'bold 30px "Ma Shan Zheng"'; ctx.fillStyle = '#1a1a1a';
    ctx.fillText('【 地 煞 阴 数 】', canvas.width / 2, 530);
    const startXB = (canvas.width - (result.back.length * gap - (gap - ballR * 2))) / 2 + ballR;
    result.back.forEach((num, i) => {
        const x = startXB + (i * gap); const y = 620;
        ctx.beginPath(); ctx.arc(x, y, ballR, 0, Math.PI * 2);
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 44px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // Seal of Hexagram
    ctx.fillStyle = '#b91c1c'; ctx.fillRect(canvas.width - 150, 60, 90, 90);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px "Ma Shan Zheng"';
    const hex = result.hexagram.name.slice(0, 4);
    if (hex.length >= 2) {
      ctx.fillText(hex.slice(0, 2), canvas.width - 105, 105);
      ctx.fillText(hex.slice(2, 4), canvas.width - 105, 135);
    } else { ctx.fillText(hex, canvas.width - 105, 115); }

    setShareImage(canvas.toDataURL('image/png'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setShowResult(false); setShareImage(null);
    try {
      const prediction = await predictLottery(profile); 
      setResult(prediction);
      setTimeout(() => { setLoading(false); setShowResult(true); }, 2000);
    } catch (err) {
      setLoading(false); alert('天机难测，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 flex flex-col items-center">
      <header className="py-10 text-center animate-ink">
        <span className="chinese-font text-lg tracking-[0.4em] text-gray-500 opacity-60">先天演卦 · 命数预测</span>
        <h1 className="text-6xl font-black text-[#1a1a1a] chinese-font mt-2 mb-4">玄天数测</h1>
        <div className="h-[1px] w-32 bg-black/10 mx-auto"></div>
      </header>

      <main className="w-full max-w-md space-y-8">
        <section className="divine-card p-6 rounded-sm animate-ink">
          <div className="mb-6 text-center">
            <span className="bg-[#b91c1c] text-white chinese-font px-4 py-1 text-sm">命籍录入</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text" required placeholder="缘主名讳"
              className="w-full bg-transparent border-b border-black/10 py-3 focus:outline-none focus:border-black text-2xl chinese-font"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" required className="bg-white/40 border border-black/5 p-3 text-sm"
                value={profile.birthDate} onChange={e => setProfile({...profile, birthDate: e.target.value})} />
              <input type="time" required className="bg-white/40 border border-black/5 p-3 text-sm"
                value={profile.birthTime} onChange={e => setProfile({...profile, birthTime: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setProfile({...profile, gender: 'male'})}
                className={`flex-1 py-3 border chinese-font text-lg transition-all ${profile.gender === 'male' ? 'bg-black text-white' : 'border-black/10 text-gray-300'}`}>乾 · 阳</button>
              <button type="button" onClick={() => setProfile({...profile, gender: 'female'})}
                className={`flex-1 py-3 border chinese-font text-lg transition-all ${profile.gender === 'female' ? 'bg-black text-white' : 'border-black/10 text-gray-300'}`}>坤 · 阴</button>
            </div>
            <button type="submit" disabled={loading} className="w-full ink-btn py-4 text-xl chinese-font disabled:opacity-50">
              {loading ? '演卦中...' : '参破天机'}
            </button>
          </form>
        </section>

        {showResult && result && (
          <section className="animate-ink space-y-6">
            <div className="divine-card p-6 text-center relative overflow-hidden">
              <div className="text-xs text-gray-400 tracking-widest mb-6 border-b border-black/5 pb-2">RESULT OF DIVINATION</div>
              <div className="space-y-8">
                <div>
                  <div className="chinese-font text-[#b91c1c] mb-4">【 天 罡 阳 数 】</div>
                  <div className="flex justify-center gap-3">{result.front.map((n, i) => <Ball key={i} number={n} type="front" />)}</div>
                </div>
                <div>
                  <div className="chinese-font text-black mb-4">【 地 煞 阴 数 】</div>
                  <div className="flex justify-center gap-3">{result.back.map((n, i) => <Ball key={i} number={n} type="back" />)}</div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-black/5 text-left">
                <div className="chinese-font text-2xl font-bold mb-2 text-center">{result.hexagram.name}</div>
                <p className="text-gray-600 italic text-sm mb-4 text-center">“ {result.hexagram.description} ”</p>
                <div className="bg-black/5 p-4 chinese-font text-lg leading-relaxed whitespace-pre-line">{result.analysis}</div>
              </div>
              <button onClick={generateImage} className="mt-6 text-[#b91c1c] text-xs font-bold border-b border-[#b91c1c] pb-1">生成灵签图片