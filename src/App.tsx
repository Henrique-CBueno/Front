import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import Dashboard from "./pages/Dashboard";
import Flashcards from "./pages/Flashcards";
import TokenPurchase from "./pages/TokenPurchase";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAuth } from "./hooks/use-auth";
import RequestPasswordReset from "./RequestPasswordReset";
import VerifyResetPasswordOTP from "./VerifyResetPasswordOTP";
import ConfirmPasswordReset from "./ConfirmPasswordReset";
import Admin from "./pages/Admin";




const App = () => {
  const {user} = useAuth()

  // Simula fetch do usuário no início
  useEffect(() => {
    console.log("Usuário mudou:", user);
  }, [user]);

  function FlashcardRoute() {
    const { pdfId } = useParams();
  
    // Exemplo: checa se o pdfId existe
    const pdfExists = user?.pdfs?.some((pdf: any) => String(pdf.id) === String(pdfId));
  
    return pdfExists ? <Flashcards /> : <NotFound />;
  }


  return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/otp-verification" element={<OTPVerification/>} />
                <Route path="/reset-password" element={<RequestPasswordReset />} />
                <Route path="/reset-password/verify-otp" element={<VerifyResetPasswordOTP />} />
                <Route path="/reset-password/confirm" element={<ConfirmPasswordReset />} />
                <Route path="/*" element={<Login />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/flashcards/:pdfId" element={<FlashcardRoute />} />
                <Route path="/tokens" element={<TokenPurchase />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </>
            )} 
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  );
};

export default App;
