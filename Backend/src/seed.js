import { connectDB } from "./db/index.js";
import User from "./models/user.model.js";
import Resume from "./models/resume.model.js";
import dotenv from "dotenv";

dotenv.config();

const dummyData = {
  firstName: "James",
  lastName: "Carter",
  jobTitle: "full stack developer",
  address: "525 N tryon Street, NC 28117",
  phone: "(123)-456-7890",
  email: "exmaple@gmail.com",
  themeColor: "#ff6666",
  summary:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  experience: [
    {
      title: "Full Stack Developer",
      companyName: "Amazon",
      city: "New York",
      state: "NY",
      startDate: "Jan 2021",
      endDate: "",
      currentlyWorking: true,
      workSummary:
        " Designed, developed, and maintained full-stack applications using React and Node.js.\n" +
        "• Implemented responsive user interfaces with React, ensuring seamless user experiences across\n" +
        "various devices and browsers.\n" +
        "• Maintaining the React Native in-house organization application." +
        "• CreatedRESTfulAPIs withNode.js and Express,facilitating data communicationbetween the front-end" +
        "and back-end systems.",
    },
    {
      title: "Frontend Developer",
      companyName: "Google",
      city: "Charlotte",
      state: "NC",
      startDate: "May 2019",
      endDate: "Jan 2021",
      currentlyWorking: false,
      workSummary:
        " Designed, developed, and maintained full-stack applications using React and Node.js." +
        "• Implemented responsive user interfaces with React, ensuring seamless user experiences across" +
        "various devices and browsers." +
        "• Maintaining the React Native in-house organization application." +
        "• CreatedRESTfulAPIs withNode.js and Express,facilitating data communicationbetween the front-end" +
        "and back-end systems.",
    },
  ],
  projects: [
    {
      projectName: "E-commerce Website",
      techStack: "React, Node.js, Express, MongoDB",
      projectSummary:
        "Designed and developed an e-commerce website using React and Node.js. Implemented a responsive user interface with React, ensuring seamless user experiences across various devices and browsers. Created RESTful APIs with Node.js and Express, facilitating data communication between the front-end and back-end systems.",
    },
    {
      projectName: "Portfolio Website",
      techStack: "",
      projectSummary:
        "Designed and developed a portfolio website using React and Node.js. Implemented a responsive user interface with React, ensuring seamless user experiences across various devices and browsers. Created RESTful APIs with Node.js and Express, facilitating data communication between the front-end and back-end systems.",
    },
  ],
  education: [
    {
      universityName: "Western Illinois University",
      startDate: "Aug 2018",
      endDate: "Dec:2019",
      degree: "Master",
      gradeType: "CGPA",
      grade: "3.5",
      major: "Computer Science",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",
    },
    {
      universityName: "Western Illinois University",
      startDate: "Aug 2018",
      endDate: "Dec:2019",
      degree: "Master",
      gradeType: "CGPA",
      grade: "3.5",
      major: "Computer Science",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",
    },
  ],
  skills: [
    {
      name: "Angular",
      rating: 80,
    },
    {
      name: "React",
      rating: 100,
    },
    {
      name: "MySql",
      rating: 80,
    },
    {
      name: "React Native",
      rating: 100,
    },
  ],
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Create a dummy user
    const user = new User({
      fullName: "James Carter",
      email: "james@example.com",
      password: "password123", // This will be hashed by the pre-save hook
    });
    await user.save();
    console.log("User created:", user._id);

    // Create resume with dummy data
    const resume = new Resume({
      ...dummyData,
      user: user._id,
      title: "My Resume", // Required field
    });
    await resume.save();
    console.log("Resume created:", resume._id);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();