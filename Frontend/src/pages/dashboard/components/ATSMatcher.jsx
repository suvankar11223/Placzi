import { useState } from "react";
import PropTypes from "prop-types";
import { Target, Loader, Zap } from "lucide-react";
import { getResumeData } from "@/Services/resumeAPI";
import { AIChatSession } from "@/Services/AiModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { matchATS } from "@/Services/resumeAPI";

function ATSMatcher({ resumeId, isOpen, onClose }) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description");
      return;
    }

    setLoading(true);
    try {
      const response = await matchATS(resumeId, jobDescription);
      setMatchResult(response.data.matchPercentage);
    } catch (error) {
      console.error("Error matching ATS:", error);
      alert("Failed to calculate match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    setGenerateLoading(true);
    try {
      // Fetch resume data
      const resumeResponse = await getResumeData(resumeId);
      const resumeData = resumeResponse.data;

      // Prepare prompt for AI to generate job description
      const prompt = `Based on the following resume data, generate a detailed job description that would be a good match for this person's skills and experience. Create a realistic job posting that includes:

1. Job title
2. Company overview
3. Key responsibilities
4. Required skills and qualifications
5. Preferred experience
6. Benefits/why join us

Resume Summary: ${resumeData.summary || 'Not provided'}
Skills: ${resumeData.skills?.map(s => s.skill).join(', ') || 'Not provided'}
Experience: ${resumeData.experience?.slice(0, 2).map(exp => `${exp.position} at ${exp.company}: ${exp.description}`).join('\n') || 'Not provided'}
Education: ${resumeData.education?.map(edu => `${edu.degree} in ${edu.major} from ${edu.universityName}`).join('\n') || 'Not provided'}

Make the job description professional and detailed, suitable for testing ATS matching.`;

      // Call AI
      const aiResponse = await AIChatSession.sendMessage(prompt);
      const generatedText = aiResponse.response.text();

      setJobDescription(generatedText);
    } catch (error) {
      console.error("Error generating with AI:", error);
      alert("Failed to generate job description. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const resetMatch = () => {
    setMatchResult(null);
    setJobDescription("");
    setGenerateLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Semantic ATS Matcher
          </DialogTitle>
          <DialogDescription>
            Paste a job description to see how well your resume matches using AI-powered semantic analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!matchResult ? (
            <>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading || generateLoading}
                className="min-h-[200px] resize-none"
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleGenerateWithAI}
                  disabled={generateLoading || loading}
                  className="flex items-center gap-2"
                >
                  {generateLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleMatch} disabled={!jobDescription.trim() || loading || generateLoading}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      "Calculate Match"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary">
                {matchResult}%
              </div>
              <p className="text-lg">
                Your resume is a <strong>{matchResult}% match</strong> for this job description.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetMatch}>
                  Try Another JD
                </Button>
                <Button onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

ATSMatcher.propTypes = {
  resumeId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ATSMatcher;
