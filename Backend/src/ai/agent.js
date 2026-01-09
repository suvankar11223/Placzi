import Groq from "groq-sdk";
import { tools } from "./tools/index.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are an AI Resume Agent.

You NEVER modify databases.
You ONLY decide which tool to call.

Available tools:
- rewrite_resume_section
- ats_match
- skill_gap_analysis

Always respond in JSON:
{
  "tool": "<tool_name>",
  "args": { ... }
}
`;

export async function runAgent({ message, resume }) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
  });

  const decision = JSON.parse(completion.choices[0].message.content);

  const tool = tools[decision.tool];
  if (!tool) throw new Error("Invalid tool selected");

  const result = await tool(decision.args);

  return {
    agentDecision: decision.tool,
    result,
  };
}