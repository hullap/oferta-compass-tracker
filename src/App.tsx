
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppSidebar from "./components/AppSidebar";
import "./App.css";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);

  const handleNewOfferClick = () => {
    setIsCreatingOffer(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="app-layout">
              <Routes>
                <Route 
                  path="/auth" 
                  element={<Auth />} 
                />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <div className="app-layout">
                        <AppSidebar onNewOfferClick={handleNewOfferClick} />
                        <main className="main-content">
                          <Routes>
                            <Route 
                              path="/" 
                              element={<Index />} 
                            />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
