import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { useParams } from "react-router-dom";
import { updateThisResume } from "@/Services/resumeAPI";
import { useDebounce } from "@/hooks/useDebounce";

const emptySkill = {
  name: "",
  rating: 0,
};

function Skills({ resumeInfo }) {
  const { resume_id } = useParams();

  const [skillsList, setSkillsList] = useState([]);

  // ✅ ONE-WAY SYNC: Redux → Local state
  useEffect(() => {
    if (resumeInfo?.skills?.length) {
      setSkillsList(resumeInfo.skills);
    } else {
      setSkillsList([{ ...emptySkill }]);
    }
  }, [resumeInfo?.skills]);

  const AddNewSkills = () => {
    setSkillsList([...skillsList, { ...emptySkill }]);
  };

  const RemoveSkills = () => {
    if (skillsList.length > 1) {
      setSkillsList(skillsList.slice(0, -1));
    }
  };

  const handleChange = (index, key, value) => {
    const list = [...skillsList];
    list[index] = { ...list[index], [key]: value };
    setSkillsList(list);
  };

  // ✅ Autosave with debounce
  const debouncedSave = useDebounce(() => {
    updateThisResume(resume_id, {
      data: { skills: skillsList },
    });
  }, 1000);

  useEffect(() => {
    debouncedSave();
  }, [skillsList, debouncedSave]);

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Skills</h2>
      <p>Add your top professional skills</p>

      {skillsList.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center mb-2 border rounded-lg p-3"
        >
          <div className="w-full mr-4">
            <label className="text-xs">Name</label>
            <Input
              value={item.name}
              onChange={(e) =>
                handleChange(index, "name", e.target.value)
              }
            />
          </div>

          <Rating
            style={{ maxWidth: 120 }}
            value={item.rating}
            onChange={(v) => handleChange(index, "rating", v)}
          />
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewSkills}>
            + Add Skill
          </Button>
          <Button variant="outline" onClick={RemoveSkills}>
            - Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Skills;
