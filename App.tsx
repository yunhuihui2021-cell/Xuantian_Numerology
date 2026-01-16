
import React, { useState, useRef } from 'react';
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
    
    // Ensure fonts are loaded
    await document.fonts.ready;

    const canvas = document.getElementById('hidden-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas height for a more compact "Spirit Slip"
    canvas.height = 720; 

    // Clear and Set Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Faint Ink Texture
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let i = 0; i < 2000; i++) {
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Border
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // Subtle background calligraphy
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '280px "Ma Shan Zheng"';
    ctx.textAlign = 'center';
    ctx.fillText('吉', canvas.width / 2, canvas.height / 2 + 80);
    ctx.globalAlpha = 1.0;

    // Title
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 90px "Ma Shan Zheng"';
    ctx.textAlign = 'center';
    ctx.fillText('天 选 胜 数', canvas.width / 2, 170);

    // Subtitle
    ctx.font = '22px "Noto Serif SC"';
    ctx.fillStyle = '#666';
    ctx.fillText('玄 天 演 卦 · 命 格 定 数', canvas.width / 2, 230);

    // Divider
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(250, 270);
    ctx.lineTo(canvas.width - 250, 270);
    ctx.stroke();

    // Front Numbers Section
    ctx.font = 'bold 32px "Ma Shan Zheng"';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('【 天 罡 · 阳 数 】', canvas.width / 2, 340);
    
    const ballRadius = 45;
    const spacing = 110;
    const startXFront = (canvas.width - (result.front.length * spacing - (spacing - ballRadius * 2))) / 2 + ballRadius;
    result.front.forEach((num, i) => {
        const x = startXFront + (i * spacing);
        const y = 430;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 46px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // Back Numbers Section
    ctx.font = 'bold 32px "Ma Shan Zheng"';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('【 地 煞 · 阴 数 】', canvas.width / 2, 560);

    const startXBack = (canvas.width - (result.back.length * spacing - (spacing - ballRadius * 2))) / 2 + ballRadius;
    result.back.forEach((num, i) => {
        const x = startXBack + (i * spacing);
        const y = 650;
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 46px "Ma Shan Zheng"';
        ctx.fillText(num.toString().padStart(2, '0'), x, y + 16);
    });

    // Corner Seal (Hexagram Name)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(60, 60, 90, 90);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Ma Shan Zheng"';
    ctx.textAlign = 'center';
    // Stack hexagram name if it's long, or just vertical
    const hexName = result.hexagram.name.slice(0, 4);
    if (hexName.length >= 2) {
      ctx.fillText(hexName.slice(0, 2), 105, 105);
      ctx.fillText(hexName.slice(2, 4), 105, 135);
    } else {
      ctx.fillText(hexName, 105, 115);
    }

    // Footer Stamp
    ctx.font = '18px "Noto Serif SC"';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('— 道法自然 · 灵感天机 —', canvas.width / 2, canvas.height - 60);

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
      }, 2500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(err instanceof Error ? err.message : '星象晦暗，缘分未至');
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 md:px-8 relative z-10 flex flex-col items-center">
      
      <header className="py-8 md:py-12 text-center animate-ink">
        <div className="flex flex-col items-center">
          <span className="chinese-font text-lg md:text-2xl tracking-[0.5em] text-gray-400 mb-2 opacity-60">先天演卦 · 命格定数</span>
          <h1 className="text-5xl md:text-8xl font-black text-[#1a1a1a] chinese-font mb-4 tracking-tighter">
            玄天数测
          </h1>
          <div className="h-[1px] w-32 md:w-64 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
        </div>
      </header>

      <main className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Input Tablet */}
        <section className="lg:col-span-4 lg:sticky lg:top-10 order-1">
          <div className="divine-card p-6 md:p-8 rounded-sm">
            <div className="mb-8 text-center">
               <span className="red-seal chinese-font px-4 py-1 text-lg">录入命籍</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 tracking-[0.5em] uppercase">缘主名讳</label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border-b-2 border-black/10 px-0 py-2 focus:outline-none focus:border-black transition-all text-[#1a1a1a] chinese-font text-2xl md:text-3xl placeholder-gray-200"
                  placeholder="请输入姓名"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 tracking-[0.5em] uppercase">诞辰之时</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    required
                    className="w-full bg-white/30 border border-black/5 px-2 md:px-4 py-3 focus:outline-none focus:border-black/40 text-[#1a1a1a] text-sm md:text-base"
                    value={profile.birthDate}
                    onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
                  />
                  <input
                    type="time"
                    required
                    className="w-full bg-white/30 border border-black/5 px-2 md:px-4 py-3 focus:outline-none focus:border-black/40 text-[#1a1a1a] text-sm md:text-base"
                    value={profile.birthTime}
                    onChange={e => setProfile({ ...profile, birthTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-[0.5em] uppercase block text-center mb-4">阴阳禀赋</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex-1 py-3 border transition-all duration-500 chinese-font text-xl ${profile.gender === 'male' ? 'bg-[#1a1a1a] text-white border-black shadow-lg' : 'border-black/10 text-gray-300'}`}
                    onClick={() => setProfile({ ...profile, gender: 'male' })}
                  >
                    乾 · 阳
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 border transition-all duration-500 chinese-font text-xl ${profile.gender === 'female' ? 'bg-[#1a1a1a] text-white border-black shadow-lg' : 'border-black/10 text-gray-300'}`}
                    onClick={() => setProfile({ ...profile, gender: 'female' })}
                  >
                    坤 · 阴
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full ink-btn py-4 md:py-6 rounded-none font-bold text-xl md:text-2xl chinese-font disabled:opacity-30 relative overflow-hidden group"
              >
                <span className="relative z-10">{loading ? '演卦中...' : '参破天机'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Revelation Panel */}
        <section className="lg:col-span-8 min-h-[400px] md:min-h-[700px] flex flex-col items-center justify-center order-2">
          
          {!showResult && !loading && (
            <div className="text-center opacity-10 floating py-12 md:py-20">
                <div className="text-[120px] md:text-[250px] leading-none text-black chinese-font">命</div>
                <h3 className="chinese-font text-xl md:text-5xl text-black tracking-[1em]">静观其变</h3>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-6 md:gap-12 animate-ink">
               <div className="w-12 h-12 md:w-24 md:h-24 border-b-2 border-black rounded-full animate-spin"></div>
               <p className="chinese-font text-2xl md:text-5xl text-[#1a1a1a] animate-pulse">窥探无极...</p>
            </div>
          )}

          {showResult && result && (
            <div className="w-full max-w-4xl reveal-scroll px-2 md:px-0">
              <div className="divine-card p-0.5 md:p-1 relative border-black/5 overflow-hidden">
                <div className="bg-white/40 border-[1px] border-black/5 p-4 md:p-12 relative">
                  
                  <div className="absolute top-2 left-2 text-3xl md:text-7xl text-black opacity-5 chinese-font">演</div>
                  <div className="absolute bottom-2 right-2 text-3xl md:text-7xl text-black opacity-5 chinese-font">卦</div>

                  <div className="mb-8 md:mb-16 text-center border-b border-black/10 pb-4 md:pb-10">
                     <span className="text-[10px] font-bold text-gray-400 tracking-[0.5em] uppercase block mb-2 md:mb-6">Revelation of Destiny</span>
                     <h2 className="text-4xl md:text-7xl font-black chinese-font text-[#1a1a1a]">天 选 胜 数</h2>
                  </div>

                  <div className="space-y-10 md:space-y-20">
                    <div className="space-y-4 md:space-y-8">
                       <div className="flex items-center gap-4">
                          <span className="chinese-font text-lg md:text-2xl font-black text-[#b91c1c]">【 天 罡 · 阳 数 】</span>
                       </div>
                       <div className="flex flex-wrap gap-2 md:gap-10 justify-center">
                          {result.front.map((num, idx) => (
                            <Ball key={`f-${idx}`} number={num} type="front" size="md" />
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4 md:space-y-8">
                       <div className="flex items-center gap-4">
                          <span className="chinese-font text-lg md:text-2xl font-black text-[#1a1a1a]">【 地 煞 · 阴 数 】</span>
                       </div>
                       <div className="flex flex-wrap gap-2 md:gap-10 justify-center">
                          {result.back.map((num, idx) => (
                            <Ball key={`b-${idx}`} number={num} type="back" size="md" />
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 border-t border-black/10 pt-8 md:pt-16">
                    <div className="space-y-4">
                       <div className="flex items-end gap-3 border-b border-black/10 pb-2">
                          <span className="red-seal text-white chinese-font text-lg md:text-xl px-2">锦囊</span>
                          <span className="chinese-font text-xl md:text-2xl font-black">{result.hexagram.name}</span>
                       </div>
                       <div className="bg-white/50 p-4 border-l-4 border-[#b91c1c] text-gray-700 italic font-serif text-sm md:text-base">
                         “ {result.hexagram.description} ”
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-end gap-3 border-b border-black/10 pb-2">
                          <span className="chinese-font text-xl md:text-2xl font-black">【 参 破 】</span>
                       </div>
                       <p className="text-[#1a1a1a] text-lg md:text-2xl chinese-font leading-relaxed whitespace-pre-line">
                          {result.analysis}
                       </p>
                    </div>
                  </div>

                  <div className="mt-10 md:mt-12 flex flex-col items-center gap-4 md:gap-6">
                    <button 
                      onClick={generateImage}
                      className="text-xs md:text-sm font-bold text-[#b91c1c] border-b border-[#b91c1c] px-4 py-2 hover:bg-[#b91c1c] hover:text-white transition-all uppercase tracking-widest"
                    >
                      生成灵签图片 (长按保存)
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-12 text-center">
                <button 
                   onClick={() => setShowResult(false)}
                   className="text-gray-400 hover:text-black transition-colors chinese-font text-2xl md:text-4xl tracking-widest"
                >
                  叩 别 天 门
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Share Modal */}
      {shareImage && (
        <div className="fixed inset-0 z-[100] modal-overlay flex items-center justify-center p-4" onClick={() => setShareImage(null)}>
          <div className="relative max-w-full max-h-full flex flex-col items-center animate-ink" onClick={e => e.stopPropagation()}>
            <img src={shareImage} alt="Divine Seal" className="max-w-[95vw] md:max-w-[80vw] max-h-[85vh] shadow-2xl rounded-sm object-contain" />
            <p className="text-white chinese-font text-lg md:text-xl mt-4 md:mt-6 tracking-[0.5em] animate-pulse">长 按 灵 签 · 收 纳 锦 囊</p>
            <button onClick={() => setShareImage(null)} className="mt-4 md:mt-8 text-gray-400 text-xs md:text-sm border border-gray-400 rounded-full px-6 py-2 hover:bg-white/10 transition-colors">关闭预览</button>
          </div>
        </div>
      )}

      <footer className="mt-12 md:mt-20 text-center opacity-10 pb-4 md:pb-12 animate-ink">
        <p className="text-black chinese-font text-lg md:text-2xl tracking-[1em] mb-2">
          道 法 自 然 · 数 在 其 中
        </p>
      </footer>
    </div>
  );
};

export default App;
