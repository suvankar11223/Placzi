import { useState, useEffect, useCallback } from 'react';
import PropTypes from "prop-types";
import { Target, Loader, TrendingUp, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runSkillGapAnalysis, getSkillGapAnalysis } from "@/Services/resumeAPI";

function SkillGapAnalysis({ resumeId, isOpen, onClose }) {
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchExistingAnalysis = useCallback(async () => {
    try {
      const response = await getSkillGapAnalysis(resumeId);
      if (response.data.skillGapAnalysis && response.data.skillGapAnalysis.status === 'completed') {
        setAnalysisResult(response.data.skillGapAnalysis);
      }
    } catch (error) {
      console.error("Error fetching existing analysis:", error);
    }
  }, [resumeId]);

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchExistingAnalysis();
    }
  }, [isOpen, resumeId, fetchExistingAnalysis]);

  const handleAnalysis = async () => {
    if (!targetRole.trim()) {
      alert("Please enter a target role");
      return;
    }

    setLoading(true);
    try {
      await runSkillGapAnalysis(resumeId, targetRole);
      setPolling(true);

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const response = await getSkillGapAnalysis(resumeId);
          const analysis = response.data;

          if (!analysis || !analysis.status) {
            console.error("No analysis data received");
            setPolling(false);
            clearInterval(pollInterval);
            return;
          }

          if (analysis.status === 'completed') {
            setAnalysisResult(analysis);
            setPolling(false);
            clearInterval(pollInterval);
          } else if (analysis.status === 'failed') {
            alert("Analysis failed. Please try again.");
            setPolling(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Error polling analysis:", error);
          alert("Failed to check analysis status. Please try again.");
          setPolling(false);
          clearInterval(pollInterval);
        }
      }, 2000);

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setPolling(false);
        if (!analysisResult) {
          alert("Analysis is taking longer than expected. Please check back later.");
        }
      }, 30000);

    } catch (error) {
      console.error("Error starting analysis:", error);
      alert("Failed to start analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setTargetRole("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Skill Gap Analysis
          </DialogTitle>
          <DialogDescription>
            Analyze your resume against 1000+ job descriptions to identify the top 3 missing skills for your target role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!analysisResult ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={loading || polling}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleAnalysis} disabled={!targetRole.trim() || loading || polling}>
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Starting Analysis...
                    </>
                  ) : polling ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    "Run Analysis"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Based on analysis of 1000+ {targetRole} job descriptions
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top 3 Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResult.missingSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <Badge variant="secondary" className="text-sm">
                              {skill}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          High priority
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      To achieve a <strong>{analysisResult.targetMatch}% match</strong> for {targetRole} positions,
                      focus on learning these skills in order of priority.
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Next Steps:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Start with online courses (Coursera, Udemy, LinkedIn Learning)</li>
                        <li>• Practice through personal projects or open-source contributions</li>
                        <li>• Network with professionals in the field</li>
                        <li>• Update your resume as you gain proficiency</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetAnalysis}>
                  Run New Analysis
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

SkillGapAnalysis.propTypes = {
  resumeId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SkillGapAnalysis;