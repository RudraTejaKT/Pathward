import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import StressMeter from "./components/StressMeter.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Branches from "./pages/Branches.jsx";
import BranchDetail from "./pages/BranchDetail.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LearningHub from "./pages/LearningHub.jsx";
import McqLab from "./pages/McqLab.jsx";
import InstructorStudio from "./pages/InstructorStudio.jsx";
import AssessmentQuiz from "./pages/AssessmentQuiz.jsx";
import MedicalBranches from "./pages/MedicalBranches.jsx";
import Discover from "./pages/Discover.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <StressMeter />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/courses" element={<CourseDetail />} />
        <Route path="/quiz" element={<AssessmentQuiz />} />
        <Route path="/engineering" element={<Branches />} />
        <Route path="/engineering/:branchId" element={<BranchDetail />} />
        <Route path="/medical" element={<MedicalBranches />} />
        <Route path="/medical/:branchId" element={<BranchDetail />} />
        <Route path="/learn" element={<LearningHub />} />
        <Route path="/mcq" element={<McqLab />} />
        <Route path="/instructor" element={<InstructorStudio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
