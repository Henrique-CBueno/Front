import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Flashcards from "./pages/Flashcards";
import TokenPurchase from "./pages/TokenPurchase";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAuth } from "./hooks/use-auth";


const App = () => {
  const {user} = useAuth()

  // Simula fetch do usuário no início
  useEffect(() => {
    console.log("Usuário mudou:", user);
  }, [user]);


  return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!user ? (
              <Route path="/*" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/flashcards/:pdfId" element={<Flashcards />} />
                <Route path="/tokens" element={<TokenPurchase />} />
                <Route path="*" element={<NotFound />} />
              </>
            )} 
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  );
};

export default App;
