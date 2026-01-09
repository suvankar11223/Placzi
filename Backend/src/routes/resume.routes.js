import { Router } from "express";
import Resume from "../models/resume.model.js";
import {
  start,
  createResume,
  getALLResume,
  getResume,
  updateResume,
  removeResume,
  matchATS,
  getATSMatcher,
  skillGapAnalysis,
  resumeHeatmap,
  getSkillGapAnalysis,
  getResumeHeatmap,
  // Advanced AI Features
  ragTailoring,
  getRAGTailoring,
  quantificationEngine,
  getQuantificationEngine,
  careerPathPrediction,
  getCareerPathPrediction,
  integrityGuardian,
  getIntegrityGuardian,
  processRAGTailoring,
  processQuantificationEngine,
  processCareerPathPrediction,
  processIntegrityGuardian
} from "../controller/resume.controller.js";
import { isUserAvailable } from "../middleware/auth.js";

const router = Router();

router.get("/", start);
router.post("/createResume", isUserAvailable, createResume);
router.get("/getAllResume", isUserAvailable, getALLResume);
router.get("/getResume", isUserAvailable, getResume);
router.put("/updateResume", isUserAvailable, updateResume);
router.delete("/removeResume", isUserAvailable, removeResume);
router.post("/match-ats", isUserAvailable, matchATS);
router.get("/get-ats-matcher", isUserAvailable, getATSMatcher);
router.post("/skill-gap-analysis", isUserAvailable, skillGapAnalysis);
router.post("/resume-heatmap", isUserAvailable, resumeHeatmap);
router.get("/get-skill-gap-analysis", isUserAvailable, getSkillGapAnalysis);
router.get("/get-resume-heatmap", isUserAvailable, getResumeHeatmap);
// Advanced AI Features
router.post("/rag-tailoring", isUserAvailable, ragTailoring);
router.get("/get-rag-tailoring", isUserAvailable, getRAGTailoring);
router.post("/quantification-engine", isUserAvailable, quantificationEngine);
router.get("/get-quantification-engine", isUserAvailable, getQuantificationEngine);
router.post("/career-path-prediction", isUserAvailable, careerPathPrediction);
router.get("/get-career-path-prediction", isUserAvailable, getCareerPathPrediction);
router.post("/integrity-guardian", isUserAvailable, integrityGuardian);
router.get("/get-integrity-guardian", isUserAvailable, getIntegrityGuardian);

export default router;
