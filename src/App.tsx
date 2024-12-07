import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";

// Lazy load components
const Main = React.lazy(() => import("./components/main/Main"));
const SignIn = React.lazy(() => import("./components/auth/SignIn"));
const SignUp = React.lazy(() => import("./components/auth/SignUp"));
const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard"));
const LectureView = React.lazy(
  () => import("./components/lectures/LectureView")
);
const LectureCreate = React.lazy(
  () => import("./components/lectures/LectureCreate")
);
const FlashcardSetCreate = React.lazy(
  () => import("./components/flashcards/FlashcardSetCreate")
);
const FlashcardSetView = React.lazy(
  () => import("./components/flashcards/FlashcardSetView")
);
const FlashcardSetEdit = React.lazy(
  () => import("./components/flashcards/FlashcardSetEdit")
);
const QuizCreate = React.lazy(() => import("./components/quizzes/QuizCreate"));
const QuizView = React.lazy(() => import("./components/quizzes/QuizView"));
const QuizEdit = React.lazy(() => import("./components/quizzes/QuizEdit"));
const Progress = React.lazy(() => import("./components/progress/Progress"));
const Settings = React.lazy(() => import("./components/settings/Settings"));

// Shared Layout Components
const Navigation = React.lazy(() => import("./components/Navigation"));

// Coming Soon Page
function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
        <p className="mt-4 text-lg text-gray-600">
          We are working hard to bring you new features. Stay tuned!
        </p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" />;
  }

  return <Outlet />;
}

// Query Client
const queryClient = new QueryClient();

// Main App
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Main />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />

              {/* Protected Routes with Shared Layout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Lectures */}
                <Route path="/lectures/create" element={<LectureCreate />} />
                <Route path="/lectures/:lectureId" element={<LectureView />} />

                {/* Flashcards */}
                <Route path="/flashcards/:id" element={<FlashcardSetView />} />
                <Route
                  path="/flashcards/:id/edit"
                  element={<FlashcardSetEdit />}
                />
                <Route
                  path="/lectures/:lectureId/flashcards/create"
                  element={<FlashcardSetCreate />}
                />

                {/* Quizzes */}
                <Route
                  path="/lectures/:lectureId/quizzes/create"
                  element={<QuizCreate />}
                />
                <Route path="/quizzes/:id" element={<QuizView />} />
                <Route path="/quizzes/:id/edit" element={<QuizEdit />} />

                {/* Progress */}
                <Route path="/progress" element={<Progress />} />

                {/* Coming Soon */}
                <Route path="/profile" element={<ComingSoon />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-All Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </React.Suspense>
      </Router>
    </QueryClientProvider>
  );
}

// Shared Layout for Protected Routes
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navigation />
      {children}
    </div>
  );
}

export default App;
