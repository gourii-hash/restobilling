import { GoogleGenAI } from "@google/genai";
import { Order, MenuItem } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateSalesInsight = async (orders: Order[], menu: MenuItem[]) => {
  try {
    const ai = getClient();
    
    // Prepare data for the prompt (summarize to avoid token limits if many orders)
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const itemCounts: Record<string, number> = {};
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');

    const prompt = `
      As a restaurant manager AI, analyze the following daily sales summary and provide 3 key insights or actionable suggestions.
      
      Data:
      - Total Revenue: ${totalRevenue.toFixed(2)}
      - Total Orders: ${completedOrders.length}
      - Top Selling Items: ${popularItems}
      - Order Times: ${completedOrders.map(o => new Date(o.completedAt || 0).getHours() + ':00').join(', ')}

      Format the output as a JSON object with a "summary" string and an array of "insights" (strings).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating insight:", error);
    return {
      summary: "Could not generate insights at this time.",
      insights: ["Please check your internet connection or API key."]
    };
  }
};
