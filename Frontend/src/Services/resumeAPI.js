import axios from "axios";
import { VITE_APP_URL } from "@/config/config";

const axiosInstance = axios.create({
  baseURL: VITE_APP_URL + "/api/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getAllResumeData = async () => {
  try {
    const response = await axiosInstance.get("resumes/getAllResume");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const deleteThisResume = async (resumeId) => {
  try {
    const response = await axiosInstance.delete(`resumes/removeResume?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getResumeData = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/getResume?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const updateThisResume = async (resumeId, data) => {
  try {
    const response = await axiosInstance.put(`resumes/updateResume?id=${resumeId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const createNewResume = async (data) => {
  try {
    const response = await axiosInstance.post("resumes/createResume", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const matchATS = async (resumeId, jobDescription) => {
  try {
    const response = await axiosInstance.post("resumes/match-ats", {
      resumeId,
      jobDescription,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runSkillGapAnalysis = async (resumeId, targetRole) => {
  try {
    const response = await axiosInstance.post("resumes/skill-gap-analysis", {
      resumeId,
      targetRole,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getSkillGapAnalysis = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-skill-gap-analysis?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runResumeHeatmap = async (resumeId) => {
  try {
    const response = await axiosInstance.post("resumes/resume-heatmap", {
      resumeId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getResumeHeatmap = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-resume-heatmap?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runQuantificationEngine = async (resumeId, bulletPoints) => {
  try {
    const response = await axiosInstance.post("resumes/quantification-engine", {
      resumeId,
      bulletPoints,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getQuantificationEngine = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-quantification-engine?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runCareerPathPrediction = async (resumeId) => {
  try {
    const response = await axiosInstance.post("resumes/career-path-prediction", {
      resumeId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getCareerPathPrediction = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-career-path-prediction?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runIntegrityGuardian = async (resumeId) => {
  try {
    const response = await axiosInstance.post("resumes/integrity-guardian", {
      resumeId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getIntegrityGuardian = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-integrity-guardian?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const runRAGTailoring = async (resumeId, jobDescription) => {
  try {
    const response = await axiosInstance.post("resumes/rag-tailoring", {
      resumeId,
      jobDescription,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

const getRAGTailoring = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`resumes/get-rag-tailoring?id=${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || error?.message || "Something Went Wrong"
    );
  }
};

export {
  getAllResumeData,
  deleteThisResume,
  getResumeData,
  updateThisResume,
  createNewResume,
  matchATS,
  runSkillGapAnalysis,
  getSkillGapAnalysis,
  runResumeHeatmap,
  getResumeHeatmap,
  runQuantificationEngine,
  getQuantificationEngine,
  runCareerPathPrediction,
  getCareerPathPrediction,
  runIntegrityGuardian,
  getIntegrityGuardian,
  runRAGTailoring,
  getRAGTailoring,
};
