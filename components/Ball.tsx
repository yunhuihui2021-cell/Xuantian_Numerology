
import React from 'react';

interface BallProps {
  number: number;
  type: 'front' | 'back';
  size?: 'sm' | 'md' | 'lg';
}

const Ball: React.FC<BallProps> = ({ number, type, size = 'md' }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 md:w-14 md:h-14 text-xl",
    lg: "w-16 h-16 md:w-20 md:h-20 text-3xl"
  };

  // Red (Yang) for front, Deep Ink (Yin) for back
  const gemStyle = type === 'front' 
    ? "border-2 border-[#b91c1c] text-[#b91c1c] bg-white/50" 
    : "border-2 border-[#1a1a1a] text-[#1a1a1a] bg-white/50";

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center font-black transition-all hover:scale-110 relative group`}>
      {/* Ink Spread Background */}
      <div className={`absolute inset-0 ${type === 'front' ? 'bg-[#b91c1c]' : 'bg-[#1a1a1a]'} opacity-[0.03] rounded-full scale-150 blur-xl group-hover:opacity-10 transition-opacity`}></div>
      
      {/* Ball / Seal Container */}
      <div className={`absolute inset-0 ${gemStyle} z-0 rounded-sm transform rotate-3 group-hover:rotate-0 transition-transform`}></div>
      
      <span className="relative z-20 chinese-font drop-shadow-sm">
        {number.toString().padStart(2, '0')}
      </span>
      
      {/* Small corner tag like a collector's mark */}
      <div className={`absolute -top-1 -right-1 text-[8px] font-bold z-30 px-1 ${type === 'front' ? 'bg-[#b91c1c] text-white' : 'bg-[#1a1a1a] text-white'}`}>
        {type === 'front' ? '天' : '地'}
      </div>
    </div>
  );
};

export default Ball;
