import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PersonaBackground } from "./components/ui/PersonaBG";
import SignupPage from "./pages/auth/Signup";
import ForgotPassPage from "./pages/auth/ForgotPass";
import ResetPassPage from "./pages/auth/ResetPass";
import ResendVerificationPage from "./pages/auth/ResendVerification";
import VerifyEmailPage from "./pages/auth/VerifyEmail";
import UserDashboard from "./pages/dashboard/UserDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CreateQuiz from "./pages/admin/CreateQuiz";
import QuizPage from "./pages/quiz/QuizPage";
import { QuizProvider } from "./context/QuizContext";

export default function App() {
  return (
    <>
      <PersonaBackground />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassPage />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
          <Route 
            path="/user/dashboard" 
            element={
              <QuizProvider>
                <UserDashboard />
              </QuizProvider>
            } 
          />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route 
            path="/admin/dashboard" 
            element={
              <QuizProvider>
                <AdminDashboard />
              </QuizProvider>
            } 
          />
          <Route path="/admin/quiz/create" element={<CreateQuiz />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
