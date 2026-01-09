import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/custom/RichTextEditor";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { updateThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";

const formFields = {
  title: "",
  companyName: "",
  city: "",
  state: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  workSummary: "",
};

function Experience({ resumeInfo, enabledNext, enabledPrev }) {
  const dispatch = useDispatch();
  const { resume_id } = useParams();

  const [experienceList, setExperienceList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ONE-WAY SYNC: Redux → Local
  useEffect(() => {
    if (resumeInfo?.experience) {
      setExperienceList(resumeInfo.experience);
    }
  }, [resumeInfo?.experience]);

  const addExperience = () => {
    setExperienceList((prev) => [...prev, { ...formFields }]);
  };

  const removeExperience = (index) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e, index) => {
    enabledNext(false);
    enabledPrev(false);

    const { name, value, checked, type } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setExperienceList((prev) => {
      const updated = [...prev];
      if (name === 'currentlyWorking') {
        updated[index] = { ...updated[index], [name]: fieldValue, endDate: fieldValue ? "" : updated[index].endDate };
      } else {
        updated[index] = { ...updated[index], [name]: fieldValue };
      }
      return updated;
    });
  };

  const handleRichTextEditor = (value, name, index) => {
    setExperienceList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const onSave = async () => {
    setLoading(true);

    const data = {
      data: { experience: experienceList },
    };

    try {
      // ✅ Update Redux ONCE
      dispatch(addResumeData({ ...resumeInfo, experience: experienceList }));

      // ✅ Persist to backend
      await updateThisResume(resume_id, data);

      toast.success("Resume Updated");
      enabledNext(true);
      enabledPrev(true);
    } catch (error) {
      toast.error("Error updating resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Experience</h2>
      <p>Add Your Previous Job Experience</p>

      {experienceList.map((experience, index) => (
        <div key={index}>
          <div className="flex justify-between my-2">
            <h3 className="font-bold text-lg">Experience {index + 1}</h3>
            <Button
              variant="outline"
              className="text-red-500"
              onClick={() => removeExperience(index)}
            >
              <Trash2 />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
            <InputField label="Position Title" name="title" value={experience.title} onChange={(e) => handleChange(e, index)} />
            <InputField label="Company Name" name="companyName" value={experience.companyName} onChange={(e) => handleChange(e, index)} />
            <InputField label="City" name="city" value={experience.city} onChange={(e) => handleChange(e, index)} />
            <InputField label="State" name="state" value={experience.state} onChange={(e) => handleChange(e, index)} />
            <InputField label="Start Date" name="startDate" type="date" value={experience.startDate} onChange={(e) => handleChange(e, index)} />
            <InputField label="End Date" name="endDate" type="date" value={experience.endDate} onChange={(e) => handleChange(e, index)} disabled={experience.currentlyWorking} />

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="currentlyWorking"
                  checked={experience.currentlyWorking}
                  onChange={(e) => handleChange(e, index)}
                />
                Currently Working
              </label>
            </div>

            <div className="col-span-2">
              <RichTextEditor
                index={index}
                defaultValue={experience.workSummary}
                onRichTextEditorChange={(value) =>
                  handleRichTextEditor(value, "workSummary", index)
                }
                resumeInfo={resumeInfo}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between py-2">
        <Button variant="outline" className="text-primary" onClick={addExperience}>
          + Add Experience
        </Button>
        <Button onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

// Small helper
function InputField({ label, ...props }) {
  return (
    <div>
      <label className="text-xs">{label}</label>
      <Input {...props} />
    </div>
  );
}

export default Experience;
