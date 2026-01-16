
import React from 'react';

interface BallProps {
  number: number;
  type: 'front' | 'back';
  size?: 'sm' | 'md';
}

const Ball: React.FC<BallProps> = ({ number, type, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? "w-10 h-10 text-lg" : "w-12 h-12 text-xl";
  const colorStyle = type === 'front' 
    ? "border border-[#b91c1c] text-[#b91c1c]" 
    : "border border-[#1a1a1a] text-[#1a1a1a]";

  return (
    <div className={`${sizeClasses} flex items-center justify-center relative group`}>
      <div className={`absolute inset-0 ${colorStyle} bg-white/60 transform rotate-3 transition-transform`}></div>
      <span className="relative z-10 chinese-font font-bold">
        {number.toString().padStart(2, '0')}
      </span>
      <div className={`absolute -top-1 -right-1 text-[8px] px-0.5 leading-none text-white ${type === 'front' ? 'bg-[#b91c1c]' : 'bg-[#1a1a1a]'}`}>
        {type === 'front' ? '天' : '地'}
      </div>
    </div>
  );
};

export default Ball;
