import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Resume from "../models/resume.model.js";
import { pipeline } from "@xenova/transformers";
import { AIChatSession } from "../utils/aiService.js";

const start = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Welcome to Resume Builder API"));
};

const createResume = async (req, res) => {
  const { title, themeColor } = req.body;

  // Validate that the title and themeColor are provided
  if (!title || !themeColor) {
    return res
      .status(400)
      .json(new ApiError(400, "Title and themeColor are required."));
  }

  try {
    // Create a new resume with empty fields for other attributes
    const resume = await Resume.create({
      title,
      themeColor,
      user: req.user._id, // Set the user ID from the authenticated user
      firstName: "",
      lastName: "",
      email: "",
      summary: "",
      jobTitle: "",
      phone: "",
      address: "",
      experience: [],
      education: [], // Initialize as an empty array
      skills: [],
      projects: [],
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { resume }, "Resume created successfully"));
  } catch (error) {
    console.error("Error creating resume:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error", [error.message], error.stack)
      );
  }
};

const getALLResume = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user });
    return res
      .status(200)
      .json(new ApiResponse(200, resumes, "Resumes fetched successfully"));
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [], error.stack));
  }
};

const getResume = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(new ApiError(400, "Resume ID is required."));
    }

    // Find the resume by ID
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(
          new ApiError(403, "You are not authorized to access this resume.")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume, "Resume fetched successfully"));
  } catch (error) {
    console.error("Error fetching resume:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [], error.stack));
  }
};

const updateResume = async (req, res) => {
  console.log("Resume update request received:");
  const id = req.query.id;

  try {
    // Find and update the resume with the provided ID and user ID
    console.log("Database update request started");
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: req.body, $currentDate: { updatedAt: true } }, // Set updatedAt to current date
      { new: true } // Return the modified document
    );

    if (!updatedResume) {
      console.log("Resume not found or unauthorized");
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Resume not found or unauthorized"));
    }

    console.log("Resume updated successfully:");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedResume, "Resume updated successfully"));
  } catch (error) {
    console.error("Error updating resume:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Internal Server Error", [error.message], error.stack)
      );
  }

  // return res.status(200).json({ message: "Hello World" });
};

const removeResume = async (req, res) => {
  const id = req.query.id;

  try {
    // Check if the resume exists and belongs to the current user
    const resume = await Resume.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!resume) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "Resume not found or not authorized to delete this resume"
          )
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Resume deleted successfully"));
  } catch (error) {
    console.error("Error while deleting resume:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

const matchATS = async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  if (!resumeId || !jobDescription) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID and Job Description are required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Extract text from resume
    let resumeText = `${resume.firstName} ${resume.lastName}\n`;
    resumeText += `${resume.summary}\n`;
    resumeText += `${resume.jobTitle}\n`;
    resume.experience.forEach(exp => {
      resumeText += `${exp.title} at ${exp.companyName}: ${exp.workSummary}\n`;
    });
    resume.education.forEach(edu => {
      resumeText += `${edu.degree} in ${edu.major} from ${edu.universityName}\n`;
    });
    resume.skills.forEach(skill => {
      resumeText += `${skill.name}\n`;
    });
    resume.projects.forEach(proj => {
      resumeText += `${proj.name}: ${proj.description}\n`;
    });

    // Load the sentence transformer model
    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    // Generate embeddings
    const resumeEmbedding = await extractor(resumeText, { pooling: "mean", normalize: true });
    const jdEmbedding = await extractor(jobDescription, { pooling: "mean", normalize: true });

    // Calculate cosine similarity
    const dotProduct = resumeEmbedding.data.reduce((sum, val, i) => sum + val * jdEmbedding.data[i], 0);
    const magnitudeResume = Math.sqrt(resumeEmbedding.data.reduce((sum, val) => sum + val * val, 0));
    const magnitudeJD = Math.sqrt(jdEmbedding.data.reduce((sum, val) => sum + val * val, 0));
    const cosineSimilarity = dotProduct / (magnitudeResume * magnitudeJD);

    // Convert to percentage
    const matchPercentage = Math.round(cosineSimilarity * 100);

    // Update resume with ATS results
    await Resume.findByIdAndUpdate(resumeId, {
      'atsMatcher.matchPercentage': matchPercentage,
      'atsMatcher.missingKeywords': [], // Could be enhanced to calculate missing keywords
      'atsMatcher.status': 'completed',
      'atsMatcher.lastAnalyzed': new Date()
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { matchPercentage }, "ATS match calculated successfully"));
  } catch (error) {
    console.error("Error calculating ATS match:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const skillGapAnalysis = async (req, res) => {
  const { resumeId, targetRole } = req.body;

  if (!resumeId) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID is required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processSkillGapAnalysis(resumeId, targetRole || "software engineer");

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "Skill gap analysis started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting skill gap analysis:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const resumeHeatmap = async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID is required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processResumeHeatmap(resumeId);

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "Resume heatmap analysis started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting resume heatmap:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getATSMatcher = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.atsMatcher, "ATS matcher results retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving ATS matcher results:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getSkillGapAnalysis = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.skillGapAnalysis, "Skill gap analysis retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving skill gap analysis:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getResumeHeatmap = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.resumeHeatmap, "Resume heatmap retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving resume heatmap:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const ragTailoring = async (req, res) => {
  const { resumeId, jobDescription } = req.body;

  if (!resumeId || !jobDescription) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID and Job Description are required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processRAGTailoring(resumeId, jobDescription);

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "RAG tailoring started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting RAG tailoring:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getRAGTailoring = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.ragTailoring, "RAG tailoring retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving RAG tailoring:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};


const quantificationEngine = async (req, res) => {
  const { resumeId, bulletPoints } = req.body;

  if (!resumeId || !bulletPoints) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID and Bullet Points are required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processQuantificationEngine(resumeId, bulletPoints);

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "Quantification engine started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting quantification engine:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getQuantificationEngine = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.quantificationEngine, "Quantification engine retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving quantification engine:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const careerPathPrediction = async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID is required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processCareerPathPrediction(resumeId);

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "Career path prediction started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting career path prediction:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getCareerPathPrediction = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.careerPathPrediction, "Career path prediction retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving career path prediction:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const integrityGuardian = async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    return res
      .status(400)
      .json(new ApiError(400, "Resume ID is required."));
  }

  try {
    // Find the resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    // Start async processing
    processIntegrityGuardian(resumeId);

    return res
      .status(202)
      .json(new ApiResponse(202, { status: "processing" }, "Integrity guardian started. Results will be available shortly."));
  } catch (error) {
    console.error("Error starting integrity guardian:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

const getIntegrityGuardian = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Resume ID is required."));
  }

  try {
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json(new ApiError(404, "Resume not found."));
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(new ApiError(403, "You are not authorized to access this resume."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, resume.integrityGuardian, "Integrity guardian retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving integrity guardian:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", [error.message], error.stack));
  }
};

// Async processing functions
const processSkillGapAnalysis = async (resumeId, targetRole) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Simulate processing delay
    setTimeout(async () => {
      try {
        // Extract current skills from resume
        const currentSkills = resume.skills.map(skill => skill.name.toLowerCase());

        // Simulated job descriptions database (in real implementation, this would be a large dataset)
        const jobDescriptions = generateMockJobDescriptions(targetRole, 1000);

        // Extract skills from all job descriptions
        const allJobSkills = new Set();
        jobDescriptions.forEach(jd => {
          jd.requiredSkills.forEach(skill => allJobSkills.add(skill.toLowerCase()));
        });

        // Find missing skills
        const missingSkills = Array.from(allJobSkills).filter(skill =>
          !currentSkills.includes(skill)
        );

        // Calculate skill importance based on frequency
        const skillFrequency = {};
        jobDescriptions.forEach(jd => {
          jd.requiredSkills.forEach(skill => {
            skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
          });
        });

        // Sort missing skills by frequency and take top 3
        const topMissingSkills = missingSkills
          .sort((a, b) => (skillFrequency[b] || 0) - (skillFrequency[a] || 0))
          .slice(0, 3);

        // Update resume with analysis results
        await Resume.findByIdAndUpdate(resumeId, {
          'skillGapAnalysis.missingSkills': topMissingSkills,
          'skillGapAnalysis.status': 'completed',
          'skillGapAnalysis.lastAnalyzed': new Date()
        });

      } catch (error) {
        console.error("Error in skill gap analysis processing:", error);
        await Resume.findByIdAndUpdate(resumeId, {
          'skillGapAnalysis.status': 'failed'
        });
      }
    }, 3000); // Simulate 3 second processing time

  } catch (error) {
    console.error("Error starting skill gap analysis:", error);
  }
};

const processResumeHeatmap = async (resumeId) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Simulate processing delay
    setTimeout(async () => {
      try {
        // Analyze resume structure for eye movement prediction
        const sections = [];

        // Personal details (highest priority)
        if (resume.firstName || resume.lastName || resume.jobTitle) {
          sections.push({
            section: 'personal',
            duration: 8,
            priority: 1
          });
        }

        // Summary (second priority)
        if (resume.summary) {
          sections.push({
            section: 'summary',
            duration: 15,
            priority: 2
          });
        }

        // Experience (third priority)
        if (resume.experience && resume.experience.length > 0) {
          sections.push({
            section: 'experience',
            duration: 25,
            priority: 3
          });
        }

        // Skills (fourth priority)
        if (resume.skills && resume.skills.length > 0) {
          sections.push({
            section: 'skills',
            duration: 12,
            priority: 4
          });
        }

        // Education (fifth priority)
        if (resume.education && resume.education.length > 0) {
          sections.push({
            section: 'education',
            duration: 10,
            priority: 5
          });
        }

        // Projects (lowest priority)
        if (resume.projects && resume.projects.length > 0) {
          sections.push({
            section: 'projects',
            duration: 8,
            priority: 6
          });
        }

        // Calculate formatting score based on completeness
        let formattingScore = 50; // Base score
        if (resume.firstName && resume.lastName) formattingScore += 10;
        if (resume.summary) formattingScore += 15;
        if (resume.experience.length > 0) formattingScore += 15;
        if (resume.skills.length > 0) formattingScore += 10;
        if (resume.education.length > 0) formattingScore += 10;
        if (resume.projects.length > 0) formattingScore += 5;

        // Update resume with heatmap results
        await Resume.findByIdAndUpdate(resumeId, {
          'resumeHeatmap.eyeMovementPath': sections,
          'resumeHeatmap.formattingScore': Math.min(formattingScore, 100),
          'resumeHeatmap.status': 'completed',
          'resumeHeatmap.lastAnalyzed': new Date()
        });

      } catch (error) {
        console.error("Error in resume heatmap processing:", error);
        await Resume.findByIdAndUpdate(resumeId, {
          'resumeHeatmap.status': 'failed'
        });
      }
    }, 2000); // Simulate 2 second processing time

  } catch (error) {
    console.error("Error starting resume heatmap:", error);
  }
};

// Helper function to generate mock job descriptions for simulation
const generateMockJobDescriptions = (targetRole, count) => {
  const skillsPool = {
    'software engineer': [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker',
      'TypeScript', 'MongoDB', 'Express.js', 'REST APIs', 'Agile', 'CI/CD',
      'Kubernetes', 'Microservices', 'GraphQL', 'Redis', 'Linux', 'Testing'
    ],
    'data scientist': [
      'Python', 'R', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn',
      'TensorFlow', 'Statistics', 'Data Visualization', 'Jupyter', 'Git',
      'AWS', 'Tableau', 'Power BI', 'Hadoop', 'Spark', 'Deep Learning'
    ],
    'product manager': [
      'Product Strategy', 'Agile', 'Scrum', 'User Research', 'Analytics',
      'SQL', 'Data Analysis', 'Roadmapping', 'Stakeholder Management',
      'A/B Testing', 'Market Research', 'Prototyping', 'Jira', 'Figma'
    ]
  };

  const roleSkills = skillsPool[targetRole.toLowerCase()] || skillsPool['software engineer'];

  const jobDescriptions = [];
  for (let i = 0; i < count; i++) {
    // Randomly select 5-8 skills for each job description
    const numSkills = Math.floor(Math.random() * 4) + 5; // 5-8 skills
    const shuffled = [...roleSkills].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffled.slice(0, numSkills);

    jobDescriptions.push({
      id: i + 1,
      title: `${targetRole} Position ${i + 1}`,
      requiredSkills: selectedSkills
    });
  }

  return jobDescriptions;
};

// Advanced AI Processing Functions

const processRAGTailoring = async (resumeId, jobDescription) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Extract bullet points from resume
    const bulletPoints = [];
    resume.experience.forEach(exp => {
      if (exp.description) {
        const points = exp.description.split('\n').filter(point => point.trim());
        bulletPoints.push(...points);
      }
    });

    if (bulletPoints.length === 0) {
      await Resume.findByIdAndUpdate(resumeId, {
        'ragTailoring.tailoredBulletPoints': [],
        'ragTailoring.status': 'completed',
        'ragTailoring.lastAnalyzed': new Date()
      });
      return;
    }

    // Use AI to tailor bullet points
    const prompt = `You are a resume optimization expert. Given the following job description and resume bullet points, rewrite each bullet point to better align with the job requirements. Make them more impactful and include relevant keywords from the job description.

Job Description:
${jobDescription}

Resume Bullet Points:
${bulletPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

Please provide the tailored bullet points in the same format, one per line, starting with the number.`;

    const aiResponse = await AIChatSession.sendMessage(prompt);
    const tailoredText = aiResponse.response.text();

    // Parse the response into tailored bullet points
    const tailoredBulletPoints = tailoredText.split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map((line, index) => ({
        original: bulletPoints[index] || '',
        tailored: line.replace(/^\d+\.\s*/, '').trim(),
        jobDescription: jobDescription.substring(0, 100) + '...'
      }));

    await Resume.findByIdAndUpdate(resumeId, {
      'ragTailoring.tailoredBulletPoints': tailoredBulletPoints,
      'ragTailoring.status': 'completed',
      'ragTailoring.lastAnalyzed': new Date()
    });

  } catch (error) {
    console.error("Error in RAG tailoring processing:", error);
    await Resume.findByIdAndUpdate(resumeId, {
      'ragTailoring.status': 'failed'
    });
  }
};


const processQuantificationEngine = async (resumeId, bulletPoints) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Handle bulletPoints as string or array
    let bulletPointsArray = [];
    if (typeof bulletPoints === 'string') {
      bulletPointsArray = bulletPoints.split('\n').filter(point => point.trim());
    } else if (Array.isArray(bulletPoints)) {
      bulletPointsArray = bulletPoints;
    }

    if (!bulletPointsArray || bulletPointsArray.length === 0) {
      await Resume.findByIdAndUpdate(resumeId, {
        'quantificationEngine.quantifiedBulletPoints': [],
        'quantificationEngine.status': 'completed',
        'quantificationEngine.lastAnalyzed': new Date()
      });
      return;
    }

    // Use AI to quantify bullet points
    const prompt = `You are a resume expert. Take these bullet points and quantify them by adding specific metrics, numbers, and measurable achievements. Make them more impactful by replacing vague statements with quantifiable results.

Bullet Points:
${bulletPointsArray.map((point, index) => `${index + 1}. ${point}`).join('\n')}

Please provide quantified versions in the same format, one per line, starting with the number. Focus on adding metrics like percentages, numbers, dollar amounts, time saved, etc.`;

    const aiResponse = await AIChatSession.sendMessage(prompt);
    const quantifiedText = aiResponse.response.text();

    // Parse the response into quantified bullet points
    const quantifiedBulletPoints = quantifiedText.split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map((line, index) => ({
        original: bulletPointsArray[index] || '',
        quantified: line.replace(/^\d+\.\s*/, '').trim()
      }));

    await Resume.findByIdAndUpdate(resumeId, {
      'quantificationEngine.quantifiedBulletPoints': quantifiedBulletPoints,
      'quantificationEngine.status': 'completed',
      'quantificationEngine.lastAnalyzed': new Date()
    });

  } catch (error) {
    console.error("Error in quantification engine processing:", error);
    await Resume.findByIdAndUpdate(resumeId, {
      'quantificationEngine.status': 'failed'
    });
  }
};

const processCareerPathPrediction = async (resumeId) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Extract resume data for analysis
    const currentRole = resume.jobTitle || 'Unknown';
    const experienceYears = resume.experience ? resume.experience.length : 0;
    const skills = resume.skills ? resume.skills.map(s => s.name) : [];
    const education = resume.education ? resume.education.map(e => e.degree) : [];

    // Use AI to predict career paths
    const prompt = `Based on this resume data, predict potential career paths and next steps. Consider current role, experience, skills, and education.

Current Role: ${currentRole}
Years of Experience: ${experienceYears}
Skills: ${skills.join(', ')}
Education: ${education.join(', ')}

Please respond with a JSON object containing:
{
  "predictedPaths": [
    {
      "role": "Predicted Role",
      "confidence": 0-100,
      "reasoning": "Why this path",
      "nextSteps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "skillGaps": ["Skill to learn", "Another skill"],
  "timeline": "Estimated time to next promotion/level"
}`;

    const aiResponse = await AIChatSession.sendMessage(prompt);
    const responseText = aiResponse.response.text();

    // Try to parse JSON
    let prediction;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback prediction
      prediction = {
        predictedPaths: [
          {
            role: "Senior " + currentRole,
            confidence: 75,
            reasoning: "Based on experience and skills",
            nextSteps: ["Gain more experience", "Learn advanced skills", "Network in the field"]
          }
        ],
        skillGaps: ["Advanced technical skills", "Leadership skills"],
        timeline: "2-3 years"
      };
    }

    await Resume.findByIdAndUpdate(resumeId, {
      'careerPathPrediction.predictedPaths': prediction.predictedPaths,
      'careerPathPrediction.skillGaps': prediction.skillGaps,
      'careerPathPrediction.timeline': prediction.timeline,
      'careerPathPrediction.status': 'completed',
      'careerPathPrediction.lastAnalyzed': new Date()
    });

  } catch (error) {
    console.error("Error in career path prediction processing:", error);
    await Resume.findByIdAndUpdate(resumeId, {
      'careerPathPrediction.status': 'failed'
    });
  }
};

const processIntegrityGuardian = async (resumeId) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return;

    // Extract full resume text
    let resumeText = `${resume.firstName} ${resume.lastName}\n${resume.summary}\n`;
    resume.experience.forEach(exp => {
      resumeText += `${exp.description}\n`;
    });
    resume.skills.forEach(skill => {
      resumeText += `${skill.name}\n`;
    });

    // Use AI to analyze for integrity issues
    const prompt = `Analyze this resume for potential integrity issues that could flag it as fake in ATS systems. Look for:
1. Keyword stuffing (hidden keywords in white text, excessive repetition)
2. Inconsistencies in dates, experience, or claims
3. Overly generic or suspicious content
4. Any other red flags

Resume Content:
${resumeText}

Please respond with a JSON object:
{
  "keywordStuffingScore": 0-100,
  "inconsistencies": [
    {
      "type": "keyword_stuffing|date_inconsistency|generic_content|other",
      "description": "Description of the issue"
    }
  ],
  "overallScore": 0-100
}`;

    const aiResponse = await AIChatSession.sendMessage(prompt);
    const responseText = aiResponse.response.text();

    // Try to parse JSON
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback analysis
      let keywordStuffingScore = 0;
      const inconsistencies = [];

      // Check for repeated keywords
      const skillsText = resume.skills.map(s => s.name).join(' ').toLowerCase();
      const experienceText = resume.experience.map(exp => exp.description || '').join(' ').toLowerCase();

      const keywords = ['javascript', 'python', 'react', 'node', 'sql'];
      keywords.forEach(keyword => {
        const skillCount = (skillsText.match(new RegExp(keyword, 'g')) || []).length;
        const expCount = (experienceText.match(new RegExp(keyword, 'g')) || []).length;

        if (skillCount > 3 || expCount > 5) {
          keywordStuffingScore += 20;
          inconsistencies.push({
            type: 'keyword_stuffing',
            description: `Keyword "${keyword}" appears excessively (${skillCount + expCount} times)`
          });
        }
      });

      // Check for date inconsistencies
      resume.experience.forEach((exp, index) => {
        if (exp.startDate && exp.endDate && new Date(exp.startDate) > new Date(exp.endDate)) {
          inconsistencies.push({
            type: 'date_inconsistency',
            description: `Experience ${index + 1}: Start date is after end date`
          });
        }
      });

      analysis = {
        keywordStuffingScore,
        inconsistencies,
        overallScore: Math.max(0, 100 - keywordStuffingScore - (inconsistencies.length * 10))
      };
    }

    await Resume.findByIdAndUpdate(resumeId, {
      'integrityGuardian.keywordStuffingScore': analysis.keywordStuffingScore,
      'integrityGuardian.inconsistencies': analysis.inconsistencies,
      'integrityGuardian.overallScore': analysis.overallScore,
      'integrityGuardian.status': 'completed',
      'integrityGuardian.lastAnalyzed': new Date()
    });

  } catch (error) {
    console.error("Error in integrity guardian processing:", error);
    await Resume.findByIdAndUpdate(resumeId, {
      'integrityGuardian.status': 'failed'
    });
  }
};

export {
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
  processIntegrityGuardian,
};
