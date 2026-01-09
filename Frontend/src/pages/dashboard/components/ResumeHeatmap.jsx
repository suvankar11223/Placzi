import { useState, useEffect, useCallback } from 'react';
import PropTypes from "prop-types";
import { Eye, Loader, TrendingUp, FileText, Clock, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { runResumeHeatmap, getResumeHeatmap } from "@/Services/resumeAPI";

function ResumeHeatmap({ resumeId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [heatmapResult, setHeatmapResult] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchExistingHeatmap = useCallback(async () => {
    try {
      const response = await getResumeHeatmap(resumeId);
      if (response.data && response.data.status === 'completed') {
        setHeatmapResult(response.data);
      }
    } catch (error) {
      console.error("Error fetching existing heatmap:", error);
    }
  }, [resumeId]);

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchExistingHeatmap();
    }
  }, [isOpen, resumeId, fetchExistingHeatmap]);

  const handleHeatmapAnalysis = async () => {
    setLoading(true);
    try {
      await runResumeHeatmap(resumeId);
      setPolling(true);

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const response = await getResumeHeatmap(resumeId);
          const heatmap = response.data;

          if (!heatmap || !heatmap.status) {
            console.error("No heatmap data received");
            setPolling(false);
            clearInterval(pollInterval);
            return;
          }

          if (heatmap.status === 'completed') {
            setHeatmapResult(heatmap);
            setPolling(false);
            clearInterval(pollInterval);
          } else if (heatmap.status === 'failed') {
            alert("Heatmap analysis failed. Please try again.");
            setPolling(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Error polling heatmap:", error);
          alert("Failed to check heatmap status. Please try again.");
          setPolling(false);
          clearInterval(pollInterval);
        }
      }, 2000);

      // Stop polling after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setPolling(false);
        if (!heatmapResult) {
          alert("Heatmap analysis is taking longer than expected. Please check back later.");
        }
      }, 30000);

    } catch (error) {
      console.error("Error starting heatmap analysis:", error);
      alert("Failed to start heatmap analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetHeatmap = () => {
    setHeatmapResult(null);
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'personal': return <Target className="w-4 h-4" />;
      case 'summary': return <FileText className="w-4 h-4" />;
      case 'experience': return <TrendingUp className="w-4 h-4" />;
      case 'skills': return <Eye className="w-4 h-4" />;
      case 'education': return <FileText className="w-4 h-4" />;
      case 'projects': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      case 6: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Resume Heatmap Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis showing how recruiters typically read your resume, based on eye-tracking studies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!heatmapResult ? (
            <>
              <div className="text-center space-y-4">
                <div className="bg-muted p-6 rounded-lg">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Resume Reading Patterns</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover how recruiters scan your resume. Our AI analyzes thousands of eye-tracking studies
                    to show reading time and priority for each section.
                  </p>
                </div>
                <Button onClick={handleHeatmapAnalysis} disabled={loading || polling} className="w-full">
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
                    "Run Heatmap Analysis"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Based on eye-tracking data from 10,000+ resume reviews
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resume Formatting Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <Badge variant={heatmapResult.formattingScore >= 80 ? "default" : heatmapResult.formattingScore >= 60 ? "secondary" : "destructive"}>
                        {heatmapResult.formattingScore}/100
                      </Badge>
                    </div>
                    <Progress value={heatmapResult.formattingScore} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      {heatmapResult.formattingScore >= 80 ? "Excellent formatting - recruiters will love this!" :
                       heatmapResult.formattingScore >= 60 ? "Good formatting with room for improvement" :
                       "Needs formatting improvements to stand out"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Recruiter Reading Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sections ordered by typical recruiter attention (1 = highest priority)
                    </p>
                    {heatmapResult.eyeMovementPath.map((section) => (
                      <div key={section.section} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getPriorityColor(section.priority)} flex items-center justify-center text-white text-sm font-bold`}>
                            {section.priority}
                          </div>
                          <div className="flex items-center gap-2">
                            {getSectionIcon(section.section)}
                            <span className="font-medium capitalize">{section.section}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {section.duration}s average reading time
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">High Priority Sections</h4>
                      <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                        <li>• Focus on Personal Details and Summary - these get the most attention</li>
                        <li>• Ensure Experience section is compelling and quantifiable</li>
                        <li>• Skills section should be scannable and relevant</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">Formatting Tips</h4>
                      <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                        <li>• Use clear headings and consistent formatting</li>
                        <li>• Keep sections concise but comprehensive</li>
                        <li>• Use bullet points for easy scanning</li>
                        <li>• Include metrics and achievements</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={resetHeatmap}>
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

ResumeHeatmap.propTypes = {
  resumeId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ResumeHeatmap;