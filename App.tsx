
import React, { useState } from 'react';
import { UserProfile, LotteryResult } from './types';
import { predictLottery } from './services/geminiService';
import Ball from './components/Ball';

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

    // 清空背景
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 纸张纹理
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // 边框
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // 装饰性大字背景
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '300px "Ma Shan Zheng"';
    ctx.textAlign = 'center';
    ctx.fillText('吉', canvas.width / 2, canvas.height / 2 + 100);
    ctx.globalAlpha = 1.0;

    // 标题
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 80px "Ma Shan Zheng"';
    ctx.textAlign = 'center';
    ctx.fillText('天 选 胜 数', canvas.width / 2, 160);
    
    ctx.font = '20px "Noto Serif SC"';
    ctx.fillStyle = '#888';
    ctx.fillText('玄 天 演 卦 · 灵 感 天 机', canvas.width / 2, 210);

    // 分割线
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath(); ctx.moveTo(280, 240); ctx.lineTo(520, 240); ctx.stroke();

    // 前区数字
    ctx.font = 'bold 30px "Ma Shan Zheng"';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('【 天 罡 阳 数 】', canvas.width / 2, 310);
    
    const ballR = 45;
    const gap = 110;
    const startXF = (canvas.width - (result.front.length * gap - (gap - ballR * 2))) / 2 + ballR;
    result.front.forEach((num, i) => {
        const x = startXF + (i * gap); const y = 400;
        ctx.beginPath(); ctx.arc(x, y, ballR, 0, Math.PI * 2);
        ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#b91c1c'; ctx.font = 'bold 44px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // 后区数字
    ctx.font = 'bold 30px "Ma Shan Zheng"';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('【 地 煞 阴 数 】', canvas.width / 2, 530);

    const startXB = (canvas.width - (result.back.length * gap - (gap - ballR * 2))) / 2 + ballR;
    result.back.forEach((num, i) => {
        const x = startXB + (i * gap); const y = 620;
        ctx.beginPath(); ctx.arc(x, y, ballR, 0, Math.PI * 2);
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#1a1a1a'; ctx.font = 'bold 44px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // 卦名印章
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(canvas.width - 150, 60, 90, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Ma Shan Zheng"';
    const hex = result.hexagram.name.slice(0, 4);
    if (hex.length >= 2) {
      ctx.fillText(hex.slice(0, 2), canvas.width - 105, 105);
      ctx.fillText(hex.slice(2, 4), canvas.width - 105, 135);
    } else { ctx.fillText(hex, canvas.width - 105, 115); }

    setShareImage(canvas.toDataURL('image/png'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResult(false);
    setShareImage(null);
    try {
      const prediction = await predictLottery(profile, []); 
      setResult(prediction);
      setTimeout(() => {
        setLoading(false);
        setShowResult(true);
      }, 2000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('天机难测，请稍后再试');
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 flex flex-col items-center">
      <header className="py-10 text-center animate-ink">
        <span className="chinese-font text-lg tracking-[0.4em] text-gray-500 opacity-60">先天演卦 · 命数预测</span>
        <h1 className="text-6xl font-black text-[#1a1a1a] chinese-font mt-2 mb-4">玄天数测</h1>
        <div className="h-[1px] w-32 bg-black/10 mx-auto"></div>
      </header>

      <main className="w-full max-w-md space-y-8 order-2">
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
              <input
                type="date" required
                className="bg-white/40 border border-black/5 p-3 text-sm rounded-none"
                value={profile.birthDate}
                onChange={e => setProfile({...profile, birthDate: e.target.value})}
              />
              <input
                type="time" required
                className="bg-white/40 border border-black/5 p-3 text-sm rounded-none"
                value={profile.birthTime}
                onChange={e => setProfile({...profile, birthTime: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex-1 py-3 border chinese-font text-lg transition-all ${profile.gender === 'male' ? 'bg-black text-white' : 'border-black/10 text-gray-300'}`}
                onClick={() => setProfile({...profile, gender: 'male'})}
              >乾 · 阳</button>
              <button
                type="button"
                className={`flex-1 py-3 border chinese-font text-lg transition-all ${profile.gender === 'female' ? 'bg-black text-white' : 'border-black/10 text-gray-300'}`}
                onClick={() => setProfile({...profile, gender: 'female'})}
              >坤 · 阴</button>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full ink-btn py-4 text-xl chinese-font disabled:opacity-50"
            >
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
                  <div className="flex justify-center gap-3">
                    {result.front.map((n, i) => <Ball key={i} number={n} type="front" size="sm" />)}
                  </div>
                </div>
                <div>
                  <div className="chinese-font text-black mb-4">【 地 煞 阴 数 】</div>
                  <div className="flex justify-center gap-3">
                    {result.back.map((n, i) => <Ball key={i} number={n} type="back" size="sm" />)}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5">
                <div className="chinese-font text-2xl font-bold mb-2">{result.hexagram.name}</div>
                <p className="text-gray-600 italic text-sm mb-4">“ {result.hexagram.description} ”</p>
                <div className="bg-black/5 p-4 text-left chinese-font text-lg leading-relaxed whitespace-pre-line">
                  {result.analysis}
                </div>
              </div>

              <button 
                onClick={generateImage}
                className="mt-6 text-[#b91c1c] text-xs font-bold border-b border-[#b91c1c] pb-1"
              >
                生成灵签图片 (长按保存)
              </button>
            </div>
            
            <button 
              onClick={() => setShowResult(false)}
              className="w-full text-gray-400 chinese-font text-xl py-4"
            >
              叩 别 天 门
            </button>
          </section>
        )}
      </main>

      {shareImage && (
        <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4" onClick={() => setShareImage(null)}>
          <div className="relative flex flex-col items-center animate-ink" onClick={e => e.stopPropagation()}>
            <img src={shareImage} alt="灵签" className="max-w-full max-h-[75vh] shadow-2xl rounded-sm" />
            <div className="mt-6 text-white text-center">
              <p className="chinese-font text-2xl tracking-[0.3em] animate-pulse">长 按 灵 签 · 存 入 相 册</p>
              <button onClick={() => setShareImage(null)} className="mt-6 border border-white/20 px-8 py-2 rounded-full text-xs text-white/60">点击关闭预览</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 opacity-20 text-center">
        <p className="chinese-font text-lg tracking-[0.5em]">道法自然 · 仅供参考</p>
      </footer>
    </div>
  );
};

export default App;
