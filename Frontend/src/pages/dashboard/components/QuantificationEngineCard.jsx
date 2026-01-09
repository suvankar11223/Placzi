import { useState } from "react";
import PropTypes from "prop-types";
import { Calculator, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantificationEngine from "./QuantificationEngine";

function QuantificationEngineCard({ resumeList }) {
  const [selectedResume, setSelectedResume] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full p-6 rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-blue-600">
            <Calculator className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold">Quantification Engine</h4>
            <p className="text-sm text-muted-foreground">
              Transform vague achievements into quantifiable metrics.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Achievement Metrics
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" /> Impact Quantification
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
        <QuantificationEngine
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

QuantificationEngineCard.propTypes = {
  resumeList: PropTypes.array.isRequired,
};

export default QuantificationEngineCard;