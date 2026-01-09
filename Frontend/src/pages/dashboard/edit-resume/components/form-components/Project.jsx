import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import SimpeRichTextEditor from "@/components/custom/SimpeRichTextEditor";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { updateThisResume } from "@/Services/resumeAPI";

const formFields = {
  projectName: "",
  techStack: "",
  projectSummary: "",
};

function Project({ resumeInfo, setEnabledNext, setEnabledPrev }) {
  const dispatch = useDispatch();
  const { resume_id } = useParams();

  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ONE-WAY SYNC: Redux → Local
  useEffect(() => {
    if (resumeInfo?.projects) {
      setProjectList(resumeInfo.projects);
    }
  }, [resumeInfo?.projects]);

  // ❌ REMOVE the auto-dispatch useEffect (THIS FIXES THE LOOP)

  const addProject = () => {
    setProjectList([...projectList, { ...formFields }]);
  };

  const removeProject = (index) => {
    setProjectList(projectList.filter((_, i) => i !== index));
  };

  const handleChange = (e, index) => {
    setEnabledNext(false);
    setEnabledPrev(false);

    const { name, value } = e.target;
    const list = [...projectList];
    list[index] = { ...list[index], [name]: value };
    setProjectList(list);
  };

  const handleRichTextEditor = (value, name, index) => {
    const list = [...projectList];
    list[index] = { ...list[index], [name]: value };
    setProjectList(list);
  };

  const onSave = async () => {
    setLoading(true);

    try {
      // ✅ Update Redux ONCE
      dispatch(
        addResumeData({
          ...resumeInfo,
          projects: projectList,
        })
      );

      await updateThisResume(resume_id, {
        data: { projects: projectList },
      });

      toast.success("Projects Updated");
      setEnabledNext(true);
      setEnabledPrev(true);
    } catch (error) {
      toast.error("Error updating projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Project</h2>
      <p>Add your projects</p>

      {projectList.map((project, index) => (
        <div key={index}>
          <div className="flex justify-between my-2">
            <h3 className="font-bold text-lg">Project {index + 1}</h3>
            <Button variant="outline" className="text-red-500" onClick={() => removeProject(index)}>
              <Trash2 />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
            <div>
              <label className="text-xs">Project Name</label>
              <Input
                name="projectName"
                value={project.projectName}
                onChange={(e) => handleChange(e, index)}
              />
            </div>

            <div>
              <label className="text-xs">Tech Stack</label>
              <Input
                name="techStack"
                value={project.techStack}
                placeholder="React, Node.js, MongoDB"
                onChange={(e) => handleChange(e, index)}
              />
            </div>

            <div className="col-span-2">
              <SimpeRichTextEditor
                index={index}
                defaultValue={project.projectSummary}
                onRichTextEditorChange={(value) =>
                  handleRichTextEditor(value, "projectSummary", index)
                }
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between py-2">
        <Button onClick={addProject} variant="outline" className="text-primary">
          + Add Project
        </Button>

        <Button onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default Project;
