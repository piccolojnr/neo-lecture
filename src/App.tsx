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
const Main = React.lazy(() => import("./pages/Main"));
const SignIn = React.lazy(() => import("./pages/auth/SignIn"));
const SignUp = React.lazy(() => import("./pages/auth/SignUp"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const LectureView = React.lazy(() => import("./pages/lectures/LectureView"));
const LectureCreate = React.lazy(
  () => import("./pages/lectures/LectureCreate")
);
const FlashcardSetCreate = React.lazy(
  () => import("./pages/flashcards/FlashcardSetCreate")
);
const FlashcardSetView = React.lazy(
  () => import("./pages/flashcards/FlashcardSetView")
);
const FlashcardSetEdit = React.lazy(
  () => import("./pages/flashcards/FlashcardSetEdit")
);
const QuizCreate = React.lazy(() => import("./pages/quizzes/QuizCreate"));
const QuizView = React.lazy(() => import("./pages/quizzes/QuizView"));
const QuizEdit = React.lazy(() => import("./pages/quizzes/QuizEdit"));
const Progress = React.lazy(() => import("./pages/progress/Progress"));
const Settings = React.lazy(() => import("./pages/settings/Settings"));

// Admin Pages
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminLectures = React.lazy(() => import("./pages/admin/Lectures"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminLogin = React.lazy(() => import("./pages/admin/Login"));

// Shared Layout Components
const Navigation = React.lazy(() => import("./components/Navigation"));
const AdminLayout = React.lazy(() => import("./components/admin/Layout"));

// Placeholder Coming Soon Page
const ComingSoon = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
      <p className="mt-4 text-lg text-gray-600">
        We are working hard to bring you new features. Stay tuned!
      </p>
    </div>
  </div>
);

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" />;
};

// Query Client
const queryClient = new QueryClient();

// Shared Layout
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-100 pt-20">
    <Navigation />
    <main>{children}</main>
  </div>
);

// maintainanace page to show when the app is under maintenance
const Maintenance = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">Maintenance</h1>
      <p className="mt-4 text-lg text-gray-600">
        We are currently under maintenance. Please check back later.
      </p>
    </div>
  </div>
);

const App = () => (
  <>
    {true ? (
      <Maintenance />
    ) : (
      <QueryClientProvider client={queryClient}>
        <Router>
          <React.Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Main />} />
              <Route path="/auth/signin" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/lectures/create" element={<LectureCreate />} />
                  <Route
                    path="/lectures/:lectureId"
                    element={<LectureView />}
                  />
                  <Route
                    path="/flashcards/:id"
                    element={<FlashcardSetView />}
                  />
                  <Route
                    path="/flashcards/:id/edit"
                    element={<FlashcardSetEdit />}
                  />
                  <Route
                    path="/lectures/:lectureId/flashcards/create"
                    element={<FlashcardSetCreate />}
                  />
                  <Route
                    path="/lectures/:lectureId/quizzes/create"
                    element={<QuizCreate />}
                  />
                  <Route path="/quizzes/:id" element={<QuizView />} />
                  <Route path="/quizzes/:id/edit" element={<QuizEdit />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/profile" element={<ComingSoon />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/login" />} />
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <Outlet />
                  </AdminLayout>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="lectures" element={<AdminLectures />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Catch-All Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>
        </Router>
      </QueryClientProvider>
    )}
  </>
);

export default App;
