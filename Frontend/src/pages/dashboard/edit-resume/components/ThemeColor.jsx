import PropTypes from "prop-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { updateThisResume } from "@/Services/resumeAPI";
import { useState } from "react";

function ThemeColor({ resumeInfo }) {
  const dispatch = useDispatch();
  const { resume_id } = useParams();

  const [open, setOpen] = useState(false);

  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
    "#33FFA1", "#FF7133", "#71FF33", "#7133FF", "#FF3371",
    "#33FF71", "#3371FF", "#A1FF33", "#33A1FF", "#5733FF",
    "#33FF5A", "#5A33FF", "#FF335A", "#335AFF",
  ];

  const onColorSelect = async (color) => {
    // 1. IMMEDIATELY close the popover to stop Radix UI from tracking updates
    setOpen(false);

    // 2. Prevent logic if color hasn't changed
    if (color === resumeInfo?.themeColor) return;

    // 3. Dispatch to Redux
    dispatch(
      addResumeData({
        ...resumeInfo,
        themeColor: color,
      })
    );

    try {
      await updateThisResume(resume_id, {
        data: { themeColor: color },
      });
      toast.success("Theme Color Updated");
    } catch (err) {
      toast.error("Error updating theme color");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
          type="button"
        >
          <Palette /> Theme
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <h2 className="mb-2 text-sm font-bold">Select Theme Color</h2>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((item) => (
            <div
              key={item}
              onClick={() => onColorSelect(item)}
              className={`h-5 w-5 rounded-full cursor-pointer border
                hover:border-black
                ${resumeInfo?.themeColor === item ? "border-black" : ""}
              `}
              style={{ background: item }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

ThemeColor.propTypes = {
  resumeInfo: PropTypes.object.isRequired,
};

export default ThemeColor;
