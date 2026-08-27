import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import StressMeter from "./components/StressMeter.jsx";
import AIHelpCentre from "./components/AIHelpCentre.jsx";
import SwipeUpDrawer from "./components/SwipeUpDrawer.jsx";
import SubscriptionModal from "./components/SubscriptionModal.jsx";
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
      <AIHelpCentre />
      <SwipeUpDrawer />
      <SubscriptionModal />
      <Routes>
        {/* PUBLIC ACCESSIBLE ROUTES (Free front page, branch explorations & free orientation videos) */}
        <Route path="/" element={<Home />} />
        <Route path="/engineering" element={<Branches />} />
        <Route path="/engineering/:branchId" element={<BranchDetail />} />
        <Route path="/medical" element={<MedicalBranches />} />
        <Route path="/medical/:branchId" element={<BranchDetail />} />
        <Route path="/quiz" element={<AssessmentQuiz />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PRO SUBSCRIPTION EXCLUSIVE ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute title="Student Command Dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mcq"
          element={
            <ProtectedRoute title="MCQ Practice Gym & Test Batterys">
              <McqLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute title="Academic Learning Hub & Syllabi">
              <LearningHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute title="Course Catalog & Video Masterclasses">
              <Discover />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute requireSubscription={false} title="Course Lecture Player & Assignments">
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute requireSubscription={false} title="Course Catalog & Video Masterclasses">
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requireSubscription={false} title="Instructor & Creator Studio">
              <InstructorStudio />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

