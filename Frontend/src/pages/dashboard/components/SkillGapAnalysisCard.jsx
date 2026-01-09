import { useState } from "react";
import PropTypes from "prop-types";
import { Target, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkillGapAnalysis from "./SkillGapAnalysis";

function SkillGapAnalysisCard({ resumeList }) {
  const [selectedResume, setSelectedResume] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full p-6 rounded-xl border bg-gradient-to-r from-purple-50 to-pink-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-purple-600">
            <Target className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold">Skill Gap Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Identify missing skills for your target role using AI analysis.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> AI Analysis
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Skill Recommendations
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          {resumeList.map((resume) => (
            <Button
              key={resume._id}
              variant="outline"
              className="justify-start p-3"
              onClick={() => {
                setSelectedResume(resume);
                setOpen(true);
              }}
            >
              <div className="text-left">
                <div className="font-medium">{resume.title}</div>
                <div className="text-xs text-muted-foreground">
                  {resume.firstName || ""} {resume.lastName || ""}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {selectedResume && (
        <SkillGapAnalysis
          resumeId={selectedResume._id}
          isOpen={open}
          onClose={() => {
            setOpen(false);
            setSelectedResume(null);
          }}
        />
      )}
    </>
  );
}

SkillGapAnalysisCard.propTypes = {
  resumeList: PropTypes.array.isRequired,
};

export default SkillGapAnalysisCard;