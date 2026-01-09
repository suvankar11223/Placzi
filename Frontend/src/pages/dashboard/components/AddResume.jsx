import { useState } from "react";
import { CopyPlus, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createNewResume } from "@/Services/resumeAPI";
import { useNavigate } from "react-router-dom";

function AddResume() {
  const [isDialogOpen, setOpenDialog] = useState(false);
  const [resumetitle, setResumetitle] = useState("");
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();

  const createResume = async () => {
    setLoading(true);
    if (resumetitle === "")
      return console.log("Please add a title to your resume");
    const data = {
      title: resumetitle,
      themeColor: "#000000",
    };
    console.log(`Creating Resume ${resumetitle}`);
    createNewResume(data)
      .then((res) => {
        console.log("Prinitng From AddResume Respnse of Create Resume", res);
        Navigate(`/dashboard/edit-resume/${res.data.resume._id}`);
      })
      .finally(() => {
        setLoading(false);
        setResumetitle("");
      });
  };
  return (
    <>
      <div
        className="w-[220px] aspect-[210/297] p-6 py-12 flex items-center justify-center border-2 border-dashed border-gray-300 bg-white/70 backdrop-blur-xl rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] transform-gpu"
        onClick={() => setOpenDialog(true)}
      >
        <CopyPlus className="transition-transform duration-300 text-gray-600 w-8 h-8" />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Resume</DialogTitle>
            <DialogDescription>
              Add a title and Description to your new resume
            </DialogDescription>
            <Input
              className="my-3"
              type="text"
              placeholder="Ex: Backend Resume"
              value={resumetitle}
              onChange={(e) => setResumetitle(e.target.value.trimStart())}
            />
            <div className="gap-2 flex justify-end">
              <Button variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createResume} disabled={!resumetitle || loading}>
                {loading ? (
                  <Loader className=" animate-spin" />
                ) : (
                  "Create Resume"
                )}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddResume;
