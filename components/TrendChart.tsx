
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { MOCK_HISTORY } from '../constants';

const MysticalNode = (props: any) => {
  const { cx, cy, stroke } = props;
  if (cx === undefined || cy === undefined) return null;

  return (
    <g transform={`translate(${cx - 8}, ${cy - 8})`}>
      <circle cx="8" cy="8" r="6" fill="white" fillOpacity={0.8} stroke={stroke} strokeWidth="1" />
      <path d="M4 8h8M8 4v8" stroke={stroke} strokeWidth="0.5" />
      <circle cx="8" cy="8" r="2" fill={stroke} className="animate-pulse" />
    </g>
  );
};

const TrendChart: React.FC = () => {
  const data = MOCK_HISTORY.map((h, i) => ({
    draw: i + 1,
    avg: h.numbers.slice(0, 5).reduce((a, b) => a + b, 0) / 5,
    backAvg: h.numbers.slice(5).reduce((a, b) => a + b, 0) / 2,
    intensity: h.numbers[0] + h.numbers[1], // Sum of first two as a "momentum" metric
  }));

  return (
    <div className="w-full h-full min-h-[220px] relative group p-4 border border-black/10">
      {/* Background ink wash effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent"></div>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] text-gray-500 chinese-font tracking-widest">【 乾 坤 数 理 脉 络 】</span>
        <div className="flex gap-4">
           <div className="flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-[#7c1c1c]"></span>
             <span className="text-[9px] text-gray-400 font-serif">阳脉</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
             <span className="text-[9px] text-gray-400 font-serif">阴枢</span>
           </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id="inkYang" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c1c1c" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#7c1c1c" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="inkYin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#000" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(242, 232, 207, 0.95)', 
              border: '1px solid #000', 
              borderRadius: '0',
              fontFamily: 'Noto Serif SC',
              fontSize: '10px',
              color: '#000'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="avg" 
            stroke="#7c1c1c" 
            strokeWidth={1.5} 
            fill="url(#inkYang)" 
            dot={<MysticalNode stroke="#7c1c1c" />}
          />
          <Area 
            type="monotone" 
            dataKey="backAvg" 
            stroke="#000" 
            strokeWidth={1} 
            strokeDasharray="4 4"
            fill="url(#inkYin)" 
            dot={<MysticalNode stroke="#000" />}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Decorative Brush Stroke at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
    </div>
  );
};

export default TrendChart;
