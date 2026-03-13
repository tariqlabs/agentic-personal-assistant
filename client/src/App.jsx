import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./shared/hooks/useAuth.jsx";
import { LoginPage } from "./features/auth/LoginPage.jsx";
import { SignupPage } from "./features/auth/SignupPage.jsx";
import { VerifyPage } from "./features/auth/VerifyPage.jsx";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage.jsx";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage.jsx";
import { AppLayout } from "./layout/AppLayout.jsx";
import { ChatLayout } from "./features/chat/ChatLayout.jsx";
import { ExamSetupPage } from "./features/exam/ExamSetupPage.jsx";
import { ExamPage } from "./features/exam/ExamPage.jsx";
import { HomePage } from "./features/home/HomePage.jsx";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/verify" element={<VerifyPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/app"
        element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
      >
        <Route index element={<ChatLayout />} />
        <Route path="exam" element={<ExamSetupPage />} />
        <Route path="exam/:id" element={<ExamPage />} />
      </Route>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
