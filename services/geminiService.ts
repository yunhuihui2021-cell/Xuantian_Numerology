
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LotteryResult } from "../types";

export const predictLottery = async (profile: UserProfile, history: any[]): Promise<LotteryResult> => {
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
    2. 运用“先天演卦”起出一式神机锦囊。
    3. 参破天机，给出今日最契合命格的“胜数”。
    
    【输出格式要求】
    - 必须返回 JSON。
    - 'analysis' 字段：必须以文言文或《三国演义》风格书写。内容应聚焦于“命格定数”与“参破天机”的感悟，词藻华丽、玄妙且庄重。
    - 'hexagram' 字段：包含锦囊卦名（如：神机妙算、火烧连营等变体卦名）及解语。
    - 'luckLevel' 字段：0-100，代表天命感应强度。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          front: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "5 unique front numbers"
          },
          back: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "2 unique back numbers"
          },
          hexagram: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              meaning: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["name", "meaning", "description"]
          },
          analysis: { type: Type.STRING },
          luckLevel: { type: Type.NUMBER }
        },
        required: ["front", "back", "hexagram", "analysis", "luckLevel"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text.trim());
    data.front.sort((a: number, b: number) => a - b);
    data.back.sort((a: number, b: number) => a - b);
    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("星象晦暗，命盘暂不可考，请待吉时重试。");
  }
};
