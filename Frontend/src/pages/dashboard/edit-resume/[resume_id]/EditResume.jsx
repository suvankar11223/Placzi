import { useEffect } from "react";
import ResumeForm from "../components/ResumeForm";
import PreviewPage from "../components/PreviewPage";
import TemplateGear from "../components/TemplateGear";
import { useParams } from "react-router-dom";
import { getResumeData } from "@/Services/resumeAPI";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jsPDF";

const downloadPDF = async () => {
  const element = document.getElementById("resume-preview");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("resume.pdf");
};

export function EditResume() {
  const { resume_id } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    getResumeData(resume_id).then((data) => {
      dispatch(addResumeData(data.data));
    });
  }, [resume_id, dispatch]);
  return (
    <div className="p-10">
      <div className="flex justify-end items-center gap-10 mb-4">
        <TemplateGear />
        <Button onClick={downloadPDF}>Download PDF</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ResumeForm />
        <PreviewPage />
      </div>
    </div>
  );
}

export default EditResume;
