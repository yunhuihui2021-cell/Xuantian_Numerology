
export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
}

export interface LotteryResult {
  front: number[];
  back: number[];
  hexagram: {
    name: string;
    meaning: string;
    description: string;
  };
  analysis: string;
  luckLevel: number; // 0-100
}

export interface HistoricalData {
  drawDate: string;
  numbers: number[];
}
