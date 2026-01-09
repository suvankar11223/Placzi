export async function getResumeContext(resume) {
  let context = `
Summary:
${resume.summary}

Experience:
${resume.experience.map(e => e.workSummary).join("\n")}

Skills:
${resume.skills.map(s => s.name).join(", ")}

Projects:
${resume.projects.map(p => `${p.projectName}: ${p.projectSummary} (Tech: ${p.techStack})`).join("\n")}
`;

  if (resume.atsMatcher && resume.atsMatcher.status === 'completed') {
    context += `
ATS Matcher Results:
Match Percentage: ${resume.atsMatcher.matchPercentage}%
Missing Keywords: ${resume.atsMatcher.missingKeywords.join(", ")}
`;
  }

  if (resume.skillGapAnalysis && resume.skillGapAnalysis.status === 'completed') {
    context += `
Skill Gap Analysis:
Missing Skills: ${resume.skillGapAnalysis.missingSkills.join(", ")}
Target Match: ${resume.skillGapAnalysis.targetMatch}%
`;
  }

  if (resume.resumeHeatmap && resume.resumeHeatmap.status === 'completed') {
    context += `
Resume Heatmap:
Eye Movement Path: ${resume.resumeHeatmap.eyeMovementPath.map(p => `${p.section}: ${p.duration}ms`).join(", ")}
Formatting Score: ${resume.resumeHeatmap.formattingScore}
`;
  }

  if (resume.ragTailoring && resume.ragTailoring.status === 'completed') {
    context += `
RAG Tailoring:
Tailored Bullet Points: ${resume.ragTailoring.tailoredBulletPoints.map(b => `Original: ${b.original}, Tailored: ${b.tailored}`).join("\n")}
`;
  }

  if (resume.integrityGuardian && resume.integrityGuardian.status === 'completed') {
    context += `
Integrity Guardian:
Keyword Stuffing Score: ${resume.integrityGuardian.keywordStuffingScore}
Inconsistencies: ${resume.integrityGuardian.inconsistencies.map(i => i.description).join(", ")}
Overall Score: ${resume.integrityGuardian.overallScore}
`;
  }

  return context;
}