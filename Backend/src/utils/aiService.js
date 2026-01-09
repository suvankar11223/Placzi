import Groq from "groq-sdk";

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

export const AIChatSession = {
  sendMessage: async (message) => {
    const client = getGroqClient();
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "llama-3.1-8b-instant",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });
    return {
      response: {
        text: () => chatCompletion.choices[0]?.message?.content || "",
      },
    };
  },
  chatWithContext: async (systemPrompt, userMessage) => {
    const client = getGroqClient();
    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });
    return chatCompletion.choices[0]?.message?.content || "";
  },
};
