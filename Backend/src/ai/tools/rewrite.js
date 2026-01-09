import { exec } from "child_process";

export default async function rewrite({ text, targetRole }) {
  return new Promise((resolve) => {
    exec(
      `ollama run llama3 "Rewrite this for ${targetRole}: ${text}"`,
      (err, stdout) => {
        resolve({
          type: "rewrite",
          before: text,
          after: stdout.trim(),
        });
      }
    );
  });
}