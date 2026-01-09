import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTemplate, addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { updateThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";

const templates = [
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "modern", label: "Modern" },
];

export default function TemplateGear() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { resume_id } = useParams();
  const resumeData = useSelector((state) => state.editResume.resumeData);
  const current = resumeData?.template || "classic";

  const selectTemplate = async (id) => {
    if (id === current) {
      setOpen(false);
      return;
    }

    setLoading(true);

    dispatch(setTemplate(id));
    dispatch(
      addResumeData({
        ...resumeData,
        template: id,
      })
    );

    try {
      await updateThisResume(resume_id, {
        data: { template: id },
      });
      toast.success("Template Updated");
    } catch (err) {
      toast.error("Error updating template");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Gear Icon */}
      <div
        className="cursor-pointer hover:scale-110 transition-transform"
        onClick={() => setOpen(!open)}
        title="Classic, Modern, Minimal"
      >
        <lord-icon
          src="https://cdn.lordicon.com/jectmwqf.json"
          trigger="loop"
          delay="1500"
          style={{ width: "40px", height: "40px" }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-scaleIn">
          <div className="py-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => !loading && selectTemplate(t.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                  current === t.id ? "bg-green-50 text-green-700" : "text-gray-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}