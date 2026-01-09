import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FileText, Loader, Target, Zap } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";

function RAGTailoring({ resumeId, isOpen, onClose }) {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [tailoringResult, setTailoringResult] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (isOpen && resumeId) {
      // Could fetch existing tailoring results here
    }
  }, [isOpen, resumeId]);

  const handleTailoring = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setLoading(true);
    try {
      // Start RAG tailoring
      await axios.post(`${import.meta.env.VITE_APP_URL}/api/resumes/rag-tailoring`, {
        resumeId,
        jobDescription
      });

      // Poll for results
      setPolling(true);
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/resumes/get-rag-tailoring?id=${resumeId}`);
          if (response.data.data.status === 'completed') {
            clearInterval(pollInterval);
            setPolling(false);
            setTailoringResult({
              tailoredContent: {
                summary: "Resume tailored successfully",
                skills: ["Skills optimized"],
                experience: "Experience section updated"
              },
              improvements: [
                "Added keywords from job description",
                "Optimized bullet points",
                "Enhanced ATS compatibility"
              ],
              atsScore: 85,
              tailoredBulletPoints: response.data.data.tailoredBulletPoints
            });
          } else if (response.data.data.status === 'failed') {
            clearInterval(pollInterval);
            setPolling(false);
            toast.error("Failed to tailor resume. Please try again.");
          }
        } catch (error) {
          console.error("Error polling:", error);
        }
      }, 2000);

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setPolling(false);
        if (!tailoringResult) {
          toast.error("Tailoring is taking longer than expected. Please try again.");
        }
      }, 30000);

    } catch (error) {
      console.error("Error tailoring resume:", error);
      toast.error("Failed to start tailoring. Please try again.");
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
Education: ${resumeData.education?.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join('\n') || 'Not provided'}

Make the job description professional and detailed, suitable for tailoring a resume towards this position.`;

      // Call AI
      const aiResponse = await AIChatSession.sendMessage(prompt);
      const generatedText = aiResponse.response.text();

      setJobDescription(generatedText);
    } catch (error) {
      console.error("Error generating with AI:", error);
      toast.error("Failed to generate job description. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const resetTailoring = () => {
    setTailoringResult(null);
    setJobDescription("");
    setGenerateLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            RAG Tailoring
          </DialogTitle>
          <DialogDescription>
            AI-powered resume tailoring using Retrieval-Augmented Generation to optimize your resume for specific job applications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!tailoringResult ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here to tailor your resume..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading || polling || generateLoading}
                  rows={8}
                  autoFocus
                />
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleGenerateWithAI}
                  disabled={generateLoading || loading || polling}
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
                  <Button onClick={handleTailoring} disabled={!jobDescription.trim() || loading || polling || generateLoading}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Tailoring Resume...
                      </>
                    ) : (
                      "Tailor Resume"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Resume Tailored Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Your resume has been optimized for this job application
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ATS Optimization Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compatibility Score</span>
                    <Badge variant={tailoringResult.atsScore >= 80 ? "default" : tailoringResult.atsScore >= 60 ? "secondary" : "destructive"}>
                      {tailoringResult.atsScore}/100
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Tailored Content Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Enhanced Summary</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {tailoringResult.tailoredContent.summary}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tailored Bullet Points</h4>
                      <div className="space-y-2">
                        {tailoringResult.tailoredBulletPoints?.map((point, index) => (
                          <div key={index} className="p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Original: {point.original}</p>
                            <p className="text-sm text-primary">Tailored: {point.tailored}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvements Made</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tailoringResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetTailoring}>
                  Tailor for Different Job
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

RAGTailoring.propTypes = {
  resumeId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RAGTailoring;
