import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { updateThisResume } from "@/Services/resumeAPI";

const formFields = {
  universityName: "",
  degree: "",
  major: "",
  grade: "",
  gradeType: "CGPA",
  startDate: "",
  endDate: "",
  description: "",
};

function Education({ resumeInfo }) {
  const dispatch = useDispatch();
  const { resume_id } = useParams();

  const [educationalList, setEducationalList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ONE-WAY SYNC: Redux → Local State
  useEffect(() => {
    if (resumeInfo?.education?.length) {
      setEducationalList(resumeInfo.education);
    } else {
      setEducationalList([{ ...formFields }]);
    }
  }, [resumeInfo?.education]);

  // ❌ REMOVED auto-dispatch useEffect (THIS FIXES LOOP)

  const AddNewEducation = () => {
    setEducationalList([...educationalList, { ...formFields }]);
  };

  const RemoveEducation = () => {
    if (educationalList.length > 1) {
      setEducationalList((list) => list.slice(0, -1));
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...educationalList];
    list[index] = { ...list[index], [name]: value };
    setEducationalList(list);
  };

  const onSave = async () => {
    if (!educationalList.length) {
      return toast.error("Please add at least one education");
    }

    setLoading(true);

    try {
      // ✅ Redux update ONLY on Save
      dispatch(
        addResumeData({
          ...resumeInfo,
          education: educationalList,
        })
      );

      await updateThisResume(resume_id, {
        data: { education: educationalList },
      });

      toast.success("Education Updated");
    } catch (error) {
      toast.error("Error updating education");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Education</h2>
      <p>Add Your educational details</p>

      {educationalList.map((item, index) => (
        <div key={index} className="border p-3 my-5 rounded-lg grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label>University Name</label>
            <Input
              name="universityName"
              value={item.universityName}
              onChange={(e) => handleChange(e, index)}
            />
          </div>

          <Input
            name="degree"
            placeholder="Degree"
            value={item.degree}
            onChange={(e) => handleChange(e, index)}
          />

          <Input
            name="major"
            placeholder="Major"
            value={item.major}
            onChange={(e) => handleChange(e, index)}
          />

          <Input
            type="date"
            name="startDate"
            value={item.startDate}
            onChange={(e) => handleChange(e, index)}
          />

          <Input
            type="date"
            name="endDate"
            value={item.endDate}
            onChange={(e) => handleChange(e, index)}
          />

          <div className="col-span-2 flex gap-3">
            <select
              name="gradeType"
              className="py-2 px-4 rounded-md border"
              value={item.gradeType}
              onChange={(e) => handleChange(e, index)}
            >
              <option value="CGPA">CGPA</option>
              <option value="GPA">GPA</option>
              <option value="Percentage">Percentage</option>
            </select>

            <Input
              name="grade"
              placeholder="Grade"
              value={item.grade}
              onChange={(e) => handleChange(e, index)}
            />
          </div>

          <div className="col-span-2">
            <label>Description</label>
            <Textarea
              name="description"
              value={item.description}
              onChange={(e) => handleChange(e, index)}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewEducation}>
            + Add More
          </Button>
          <Button variant="outline" onClick={RemoveEducation}>
            - Remove
          </Button>
        </div>

        <Button onClick={onSave} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default Education;
