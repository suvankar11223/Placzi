export default async function skillGap({ resumeSkills, targetRole }) {
  return {
    type: "skill_gap",
    missingSkills: ["System Design", "Docker"],
    suggestions: [
      "Build a scalable backend project",
      "Learn containerization",
    ],
  };
}