import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAuth } from "./hooks/useAuth";
import useThemeStore from "./store/themeStore";

// Layout
import Layout from "./components/layout/Layout";

// Guest
import Home from "./pages/guest/Home";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";

// Entrepreneur
import EntrepreneurDashboard from "./pages/entrepreneur/Dashboard";
import EntrepreneurProjects from "./pages/entrepreneur/Projects";
import EntrepreneurProjectDetails from "./pages/entrepreneur/ProjectDetails";
import EntrepreneurChat from "./pages/entrepreneur/Chat";
import EntrepreneurProfile from "./pages/entrepreneur/Profile";
import EntrepreneurNotifications from "./pages/entrepreneur/Notifications";
import EntrepreneurEvents from "./pages/entrepreneur/Events";
import EntrepreneurEventDetails from "./pages/entrepreneur/EventDetails";

// Co-Founder
import CofounderDashboard from "./pages/cofounder/Dashboard";
import CofounderAddProject from "./pages/cofounder/AddProject";
import CofounderOtherProjects from "./pages/cofounder/OtherProjects";
import CofounderProjectDetails from "./pages/cofounder/ProjectDetails";
import CofounderChat from "./pages/cofounder/Chat";
import CofounderProfile from "./pages/cofounder/Profile";
import CofounderNotifications from "./pages/cofounder/Notifications";
import CofounderEvents from "./pages/cofounder/Events";
import CofounderEventDetails from "./pages/cofounder/EventDetails";

// Event Manager
import AddEvent from "./pages/eventmanager/AddEvent";
import EventManagerEvents from "./pages/eventmanager/Events";
import EventManagerEventDetails from "./pages/eventmanager/EventDetails";
import EventManagerProfile from "./pages/eventmanager/Profile";
import EventManagerNotifications from "./pages/eventmanager/Notifications";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProjects from "./pages/admin/Projects";
import AdminEvents from "./pages/admin/Events";
import AdminSendNotification from "./pages/admin/SendNotification";
import AdminContactMessages from "./pages/admin/ContactMessages";
import AdminProfile from "./pages/admin/Profile";
import AdminProjectDetails from "./pages/admin/ProjectDetails";
import AdminEventDetails from "./pages/admin/EventDetails";
import AdminSubscriptions from "./pages/admin/Subscriptions";

// General
import NotFound from "./pages/NotFound";
import Offline from "./pages/Offline";

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to proper dashboard based on role
    const routes = {
      entrepreneur: "/entrepreneur/dashboard",
      co_founder: "/cofounder/dashboard",
      event_manager: "/eventmanager/add-event",
      admin: "/admin/dashboard",
    };
    return <Navigate to={routes[profile.role] || "/"} replace />;
  }

  return children;
};

function App() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Entrepreneur Routes */}
          <Route
            path="/entrepreneur/dashboard"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/projects"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/projects/:id"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/chat"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/profile"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/notifications"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/events"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entrepreneur/events/:id"
            element={
              <ProtectedRoute allowedRoles={["entrepreneur"]}>
                <EntrepreneurEventDetails />
              </ProtectedRoute>
            }
          />

          {/* Co-Founder Routes */}
          <Route
            path="/cofounder/dashboard"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/add-project"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderAddProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/other-projects"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderOtherProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/projects/:id"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/chat"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/profile"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/notifications"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/events"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder/events/:id"
            element={
              <ProtectedRoute allowedRoles={["co_founder"]}>
                <CofounderEventDetails />
              </ProtectedRoute>
            }
          />

          {/* Event Manager Routes */}
          <Route
            path="/eventmanager/add-event"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <AddEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventmanager/edit-event/:id"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <AddEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventmanager/events"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <EventManagerEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventmanager/events/:id"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <EventManagerEventDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventmanager/profile"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <EventManagerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventmanager/notifications"
            element={
              <ProtectedRoute allowedRoles={["event_manager"]}>
                <EventManagerNotifications />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/send-notification"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSendNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact-messages"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminContactMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEventDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSubscriptions />
              </ProtectedRoute>
            }
          />

          {/* Auth Callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Offline & NotFound */}
          <Route path="/offline" element={<Offline />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;
