import { GROQ_API_KEY } from "../config/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const AIChatSession = {
  sendMessage: async (message) => {
    const chatCompletion = await groq.chat.completions.create({
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
};
