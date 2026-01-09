import { FaEye, FaEdit, FaTrashAlt, FaSpinner } from "react-icons/fa";
import { Target, FileText } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteThisResume } from "@/Services/resumeAPI";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ATSMatcher from "./ATSMatcher";

function ResumeCard({ resume, refreshData }) {
  const gradients = [
    "from-indigo-500 to-purple-500",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-orange-500",
    "from-blue-500 to-cyan-500",
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  const [loading, setLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [openATS, setOpenATS] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteThisResume(resume._id);
      refreshData();
    } catch (error) {
      toast(error.message);
    } finally {
      setLoading(false);
      setOpenAlert(false);
    }
  };

  return (
    <>
      {/* GLASS CARD */}
      <div
        className="
          w-[220px] aspect-[210/297]
          rounded-xl
          bg-white/70 backdrop-blur-xl
          border border-white/40
          shadow-[0_10px_30px_rgba(0,0,0,0.12)]
          hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]
          transition-all duration-300
          flex flex-col justify-between
        "
      >
        {/* TOP GRADIENT STRIP */}
        <div className={`h-3 rounded-t-xl bg-gradient-to-r ${gradient}`} />

        {/* HEADER */}
        <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {resume.title}
            </h3>
            <p className="text-xs text-gray-500">Resume Document</p>
          </div>
        </div>

        {/* CONTENT PREVIEW */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-around items-center px-3 py-3 border-t border-gray-200 bg-white/60 rounded-b-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/view-resume/${resume._id}`)}
          >
            <FaEye className="text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/edit-resume/${resume._id}`)}
          >
            <FaEdit className="text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenATS(true)}
          >
            <Target className="w-5 h-5 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenAlert(true)}
          >
            <FaTrashAlt className="text-gray-600" />
          </Button>
        </div>
      </div>

      {/* DELETE DIALOG */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? <FaSpinner className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ATSMatcher
        resumeId={resume._id}
        isOpen={openATS}
        onClose={() => setOpenATS(false)}
      />
    </>
  );
}

ResumeCard.propTypes = {
  resume: PropTypes.object.isRequired,
  refreshData: PropTypes.func.isRequired,
};

export default ResumeCard;
