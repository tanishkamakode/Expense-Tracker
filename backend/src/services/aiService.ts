import fetch from "node-fetch";

export const analyzeSpending = async (insights: any) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", // recommended by OpenRouter
            "X-Title": "Expense Tracker"
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b:free",
            messages: [
                {
                    role: "system",
                    content: `You are a financial assistant.
          IMPORTANT:
- All amounts are in Indian Rupees (INR).
- Always use ₹ symbol (₹), NEVER use $.

Explain spending patterns clearly and simply.
Give reasons for overspending and practical saving advice.
Keep answers short and easy to understand.`
                },
                {
                    role: "user",
                    content: `Analyze this financial data and answer:
"Why did I overspend in March?"

Currency: INR (₹)

Data:
${JSON.stringify(insights)}`
                }
            ]
        }),
    });

    const data: any = await response.json();

    // 🔍 DEBUG (VERY IMPORTANT)
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    //  Handle API errors
    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
    }

    //  Handle missing choices
    if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid AI response: " + JSON.stringify(data));
    }

    return data.choices[0].message.content;
};