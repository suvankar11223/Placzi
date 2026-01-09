import { useState } from "react";
import PropTypes from "prop-types";
import { Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import RAGTailoring from "./RAGTailoring";

function RAGTailoringCard({ resumeList }) {
  const [selectedResume, setSelectedResume] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full p-6 rounded-xl border bg-gradient-to-r from-yellow-50 to-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-yellow-600">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold">RAG Tailoring</h4>
            <p className="text-sm text-muted-foreground">
              AI-powered resume tailoring using Retrieval-Augmented Generation.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" /> RAG Technology
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" /> ATS Optimization
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
        <RAGTailoring
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

RAGTailoringCard.propTypes = {
  resumeList: PropTypes.array.isRequired,
};

export default RAGTailoringCard;