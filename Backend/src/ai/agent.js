import Groq from "groq-sdk";
import { tools } from "./tools/index.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are an Elite AI Resume Strategist.
Your sole purpose is to analyze user requests and select the most effective tool to optimize their career documents.

GUIDELINES:
1. OBJECTIVITY: Base all decisions on standard recruitment best practices.
2. LIMITATION: You never modify data; you only suggest the correct tool and arguments.
3. OUTPUT: You MUST respond with a valid JSON object only. No preamble.

AVAILABLE TOOLS:
- rewrite_resume_section: Use when the user wants to improve specific wording or bullets.
- ats_match: Use to compare a resume against a job description.
- skill_gap_analysis: Use to identify missing technical or soft skills.

RESPONSE FORMAT:
{
  "tool": "tool_name",
  "args": { "key": "value" }
}
`;

export async function runAgent({ message, resume }) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile", // Versatile models are often better for JSON logic
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Resume Context: ${JSON.stringify(resume)}\n\nUser Message: ${message}` },
      ],
      response_format: { type: "json_object" }, // Forces the model to provide JSON
      temperature: 0.1, // Lower temperature ensures more consistent tool selection
    });

    const content = completion.choices[0].message.content;
    const decision = JSON.parse(content);

    const tool = tools[decision.tool];
    if (!tool) {
      console.error(`Tool "${decision.tool}" not found in registry.`);
      throw new Error("The AI strategist selected an unavailable tool.");
    }

    // Pass the resume context along with the AI-generated arguments
    const result = await tool({ ...decision.args, resumeContext: resume });

    return {
      agentDecision: decision.tool,
      result,
    };
  } catch (error) {
    console.error("Agent Execution Error:", error);
    return {
      error: "The AI strategist encountered an issue processing your request.",
      details: error.message
    };
  }
}