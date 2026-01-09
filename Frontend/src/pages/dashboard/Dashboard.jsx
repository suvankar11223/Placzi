import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AddResume from "./components/AddResume";
import ResumeCard from "./components/ResumeCard";
import ATSMatcherCard from "./components/ATSMatcherCard";
import QuantificationEngineCard from "./components/QuantificationEngineCard";
import SkillGapAnalysisCard from "./components/SkillGapAnalysisCard";
import RAGTailoringCard from "./components/RAGTailoringCard";
import ResumeHeatmapCard from "./components/ResumeHeatmapCard";
import { getAllResumeData } from "@/Services/resumeAPI";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✅ Access the full slice to get loading/status flags
  const { userData, isLoading } = useSelector((state) => state.editUser || {});
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    // ✅ ONLY redirect if loading is finished AND userData is still missing
    if (!isLoading && !userData) {
      navigate("/auth/sign-in");
    }
  }, [userData, isLoading, navigate]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await getAllResumeData();
        if (response.statusCode === 200) {
          setResumes(response.data);
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      }
    };

    if (userData) {
      fetchResumes();
    }
  }, [userData]);

  // ✅ Prevent "False Redirects": Show a loader while Redux is hydrating
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-medium">Verifying Session...</div>
      </div>
    );
  }

  // If we finished loading and there's still no user, don't render anything (redirecting...)
  if (!userData) return null;

  const handleResumeCreated = (newResume) => {
    setResumes((prev) => [...prev, newResume]);
  };

  const refreshResumes = async () => {
    try {
      const response = await getAllResumeData();
      if (response.statusCode === 200) {
        setResumes(response.data);
      }
    } catch (error) {
      console.error("Error refreshing resumes:", error);
    }
  };

  return (
    <div className="p-10 md:px-20 lg:px-32 animate-in fade-in duration-500">
      <h2 className="font-bold text-3xl">My Resume</h2>
      <p className="text-gray-500">Welcome back, {userData?.firstName || 'User'}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-10">
        <AddResume onResumeCreated={handleResumeCreated} />
        {resumes.map((resume, index) => (
          <ResumeCard key={index} resume={resume} refreshData={refreshResumes} />
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-bold text-2xl mb-6">AI-Powered Resume Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.length > 0 && (
            <>
              <ATSMatcherCard resumeList={resumes} />
              <SkillGapAnalysisCard resumeList={resumes} />
              <RAGTailoringCard resumeList={resumes} />
              <ResumeHeatmapCard resumeList={resumes} />
              <QuantificationEngineCard resumeList={resumes} />
            </>
          )}
          {resumes.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>Create a resume to access AI-powered tools.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;