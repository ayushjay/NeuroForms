import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FormList from "./pages/FormList";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import FormFill from "./pages/FormFill";
import FormResults from "./pages/FormResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/forms" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
            <Route path="/dashboard/forms/create" element={<ProtectedRoute><CreateForm /></ProtectedRoute>} />
            <Route path="/dashboard/forms/:id/edit" element={<ProtectedRoute><EditForm /></ProtectedRoute>} />
            <Route path="/forms/:id" element={<FormFill />} />
            <Route path="/forms/:id/results" element={<ProtectedRoute><FormResults /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
