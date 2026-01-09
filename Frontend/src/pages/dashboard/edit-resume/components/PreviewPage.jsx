import { useSelector } from "react-redux";
import Modern from "./templates/Modern";
import Classic from "./templates/Classic";
import Minimal from "./templates/Minimal";

function PreviewPage() {
  const resumeData = useSelector(
    (state) => state.editResume.resumeData
  );

  if (!resumeData) {
    return <p className="p-5">Loading preview...</p>;
  }

  const renderTemplate = () => {
    const template = resumeData.template || "modern";
    switch (template) {
      case "classic":
        return <Classic resume={resumeData} />;
      case "minimal":
        return <Minimal resume={resumeData} />;
      default:
        return <Modern resume={resumeData} />;
    }
  };

  return renderTemplate();
}

export default PreviewPage;
