export default async function ats({ resumeText, jobDescription }) {
  // dummy logic (replace with your real ATS)
  return {
    type: "ats",
    matchPercentage: 82,
    missingKeywords: ["Docker", "Redis"],
  };
}