import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { setTemplate } from "@/features/resume/resumeFeatures";
import { Button } from "@/components/ui/button";

function TemplateSelector({ resumeInfo }) {
  const dispatch = useDispatch();

  const templates = [
    { name: "Classic", value: "classic" },
    { name: "Minimal", value: "minimal" },
    { name: "Modern", value: "modern" },
  ];

  const handleTemplateChange = (template) => {
    dispatch(setTemplate(template));
  };

  return (
    <div className="mt-5">
      <h3 className="font-bold text-md mb-2">Select Template</h3>
      <div className="flex gap-3">
        {templates.map((template) => (
          <Button
            key={template.value}
            variant={resumeInfo?.template === template.value ? "default" : "outline"}
            onClick={() => handleTemplateChange(template.value)}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

TemplateSelector.propTypes = {
  resumeInfo: PropTypes.object.isRequired,
};

export default TemplateSelector;