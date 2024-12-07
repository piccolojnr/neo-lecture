import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";

// Lazy load components
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
const Navigation = React.lazy(() => import("./components/Navigation"));
const Progress = React.lazy(() => import("./components/progress/Progress"));

// Create a client
const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}

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
          <div className="min-h-screen bg-gray-100 pt-20">
            <Navigation />
            <Routes>
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lectures/:lectureId"
                element={
                  <ProtectedRoute>
                    <LectureView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lectures/create"
                element={
                  <ProtectedRoute>
                    <LectureCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lectures/:lectureId/flashcards/create"
                element={
                  <ProtectedRoute>
                    <FlashcardSetCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:id"
                element={
                  <ProtectedRoute>
                    <FlashcardSetView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:id/edit"
                element={
                  <ProtectedRoute>
                    <FlashcardSetEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lectures/:lectureId/quizzes/create"
                element={
                  <ProtectedRoute>
                    <QuizCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:id"
                element={
                  <ProtectedRoute>
                    <QuizView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:id/edit"
                element={
                  <ProtectedRoute>
                    <QuizEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </React.Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
