import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { addResumeData } from "@/features/resume/resumeFeatures";

const templates = [
  { id: "classic", color: "#000000" },
  { id: "modern", color: "#22c55e" },
  { id: "minimal", color: "#3b82f6" },
];

export default function ThemeSelector({ onClose }) {
  const dispatch = useDispatch();

  const applyTheme = (template) => {
    dispatch(addResumeData({ themeColor: template.color }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-[280px] shadow-lg border-2 border-gray-300">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => applyTheme(t)}
              className="cursor-pointer rounded border-2 border-gray-400 p-1 hover:border-blue-500 transition-colors bg-white"
            >
              <div
                className="h-4 w-full rounded-sm border border-gray-300"
                style={{ backgroundColor: t.color }}
              />
              <p className="text-center text-xs mt-1 capitalize font-semibold text-gray-800">{t.id}</p>
            </div>
          ))}
        </div>
        <h2 className="font-bold text-sm text-center text-gray-600">Choose Template</h2>
      </div>
    </div>
  );
}

ThemeSelector.propTypes = {
  onClose: PropTypes.func.isRequired,
};