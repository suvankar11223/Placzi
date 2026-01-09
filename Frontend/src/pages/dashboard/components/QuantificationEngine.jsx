import { useState } from "react";
import PropTypes from "prop-types";
import { Calculator, Loader, TrendingUp, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumeData } from "@/Services/resumeAPI";
import { AIChatSession } from "@/Services/AiModel";

function QuantificationEngine({ resumeId, isOpen, onClose }) {
  const [bulletPoints, setBulletPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [quantifiedResult, setQuantifiedResult] = useState(null);

  const handleQuantify = async () => {
    if (!bulletPoints.trim()) {
      alert("Please enter bullet points to quantify");
      return;
    }

    setLoading(true);
    try {
      // Prepare prompt for AI to quantify bullet points
      const prompt = `Take the following vague achievement bullet points and transform them into quantified, impactful statements with specific metrics, numbers, or percentages. Make them sound professional and demonstrate clear value.

Bullet points to quantify:
${bulletPoints}

For each bullet point, provide a quantified version that includes:
- Specific numbers, percentages, or metrics
- Measurable impact
- Professional language

Format each quantified bullet point on a new line, starting with a dash (-).`;

      // Call AI
      const aiResponse = await AIChatSession.sendMessage(prompt);
      const generatedText = aiResponse.response.text();

      // Parse the response into an array of bullet points
      const quantifiedBullets = generatedText.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());

      setQuantifiedResult(quantifiedBullets);
    } catch (error) {
      console.error("Error quantifying:", error);
      alert("Failed to quantify. Please try again.");
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

      // Prepare prompt for AI to generate vague bullet points at different levels
      const prompt = `Based on the following resume data, generate exactly 3 vague achievement bullet points that can be quantified, categorized by experience level:

Resume Summary: ${resumeData.summary || 'Not provided'}
Skills: ${resumeData.skills?.map(s => s.skill).join(', ') || 'Not provided'}
Experience: ${resumeData.experience?.slice(0, 2).map(exp => `${exp.position} at ${exp.company}: ${exp.description}`).join('\n') || 'Not provided'}
Projects: ${resumeData.projects?.map(proj => `${proj.name}: ${proj.description}`).join('\n') || 'Not provided'}

Generate exactly 3 bullet points, one for each level:

1. **Amateur Level**: Entry-level or basic achievements that show foundational skills
2. **Intermediate Level**: Mid-level achievements showing growing responsibility and impact
3. **Advanced Level**: Senior-level achievements demonstrating leadership and significant impact

Each bullet point should:
- Start with a dash (-)
- Be vague and need quantification (no specific numbers)
- Be realistic based on the resume
- Represent increasing complexity and impact

Examples:
- Improved system performance (Amateur)
- Led development team initiatives (Intermediate)
- Reduced operational costs through strategic planning (Advanced)

Format: Just the 3 bullet points, one per line, nothing else.`;

      // Call AI
      const aiResponse = await AIChatSession.sendMessage(prompt);
      const generatedText = aiResponse.response.text();

      console.log("AI Response:", generatedText); // Debug log

      // Parse the response into bullet points text
      const bulletPointsArray = generatedText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .filter(line => line.length > 0);

      if (bulletPointsArray.length < 3) {
        // Fallback if parsing fails or insufficient points
        const fallbackPoints = [
          "Improved application performance", // Amateur
          "Led cross-functional team collaboration", // Intermediate
          "Reduced infrastructure costs through optimization" // Advanced
        ];
        setBulletPoints(fallbackPoints.join('\n'));
      } else {
        // Take only the first 3 points
        setBulletPoints(bulletPointsArray.slice(0, 3).join('\n'));
      }
    } catch (error) {
      console.error("Error generating with AI:", error);
      alert("Failed to generate bullet points. Please try again.");
    } finally {
      setGenerateLoading(false);
    }
  };

  const resetQuantify = () => {
    setQuantifiedResult(null);
    setBulletPoints("");
    setGenerateLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Quantification Engine
          </DialogTitle>
          <DialogDescription>
            Transform vague achievements into quantifiable metrics that demonstrate impact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!quantifiedResult ? (
            <>
              <Textarea
                placeholder={`Paste your bullet points here (one per line), or use "Generate with AI" to create 3 categorized examples...

Amateur Level: Improved system performance
Intermediate Level: Led development team initiatives
Advanced Level: Reduced operational costs through strategic planning`}
                value={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.value)}
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
                  <Button onClick={handleQuantify} disabled={!bulletPoints.trim() || loading || generateLoading}>
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Quantifying...
                      </>
                    ) : (
                      "Quantify Achievements"
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quantified Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(quantifiedResult) && quantifiedResult.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed flex-1">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetQuantify}>
                  Quantify More
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

QuantificationEngine.propTypes = {
  resumeId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default QuantificationEngine;