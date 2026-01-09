import PropTypes from "prop-types";
import PersonalDeatailPreview from "../preview-components/PersonalDeatailPreview";
import SummeryPreview from "../preview-components/SummaryPreview";
import ExperiencePreview from "../preview-components/ExperiencePreview";
import EducationalPreview from "../preview-components/EducationalPreview";
import SkillsPreview from "../preview-components/SkillsPreview";
import ProjectPreview from "../preview-components/ProjectPreview";

function Classic({ resume }) {
  return (
    <div
      className="shadow-lg h-full p-14 border-4 border-gray-300"
      style={{
        borderColor: resume.themeColor || "#000000",
      }}
    >
      <PersonalDeatailPreview resumeInfo={resume} />

      {resume.summary && (
        <SummeryPreview resumeInfo={resume} />
      )}

      {resume.experience?.length > 0 && (
        <ExperiencePreview resumeInfo={resume} />
      )}

      {resume.projects?.length > 0 && (
        <ProjectPreview resumeInfo={resume} />
      )}

      {resume.education?.length > 0 && (
        <EducationalPreview resumeInfo={resume} />
      )}

      {resume.skills?.length > 0 && (
        <SkillsPreview resumeInfo={resume} />
      )}
    </div>
  );
}

Classic.propTypes = {
  resume: PropTypes.object.isRequired,
};

export default Classic;
