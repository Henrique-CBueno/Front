import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface OTPState {
  email: string;
  isPending: boolean;
  isVerified: boolean;
}

interface UseOTPReturn {
  otpState: OTPState;
  setEmail: (email: string) => void;
  setPending: (pending: boolean) => void;
  setVerified: (verified: boolean) => void;
  verifyOTP: (email: string, otpCode: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  clearOTPState: () => void;
}

export function useOTP(): UseOTPReturn {
  const [otpState, setOtpState] = useState<OTPState>({
    email: "",
    isPending: false,
    isVerified: false,
  });
  
  const { toast } = useToast();

  const setEmail = useCallback((email: string) => {
    setOtpState(prev => ({ ...prev, email }));
  }, []);

  const setPending = useCallback((pending: boolean) => {
    setOtpState(prev => ({ ...prev, isPending: pending }));
  }, []);

  const setVerified = useCallback((verified: boolean) => {
    setOtpState(prev => ({ ...prev, isVerified: verified }));
  }, []);

  const verifyOTP = useCallback(async (email: string, otpCode: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao verificar código");
      }

      toast({
        title: "Email verificado!",
        description: "Sua conta foi ativada com sucesso.",
      });

      setOtpState(prev => ({
        ...prev,
        isVerified: true,
        isPending: false,
      }));

      return true;
    } catch (error) {
      console.error("Erro ao verificar OTP:", error);
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
      });
      return false;
    }
  }, [toast]);

  const resendOTP = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8000/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao reenviar código");
      }

      toast({
        title: "Código reenviado!",
        description: "Um novo código foi enviado para seu email.",
      });

      return true;
    } catch (error) {
      console.error("Erro ao reenviar OTP:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reenviar",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
      });
      return false;
    }
  }, [toast]);

  const clearOTPState = useCallback(() => {
    setOtpState({
      email: "",
      isPending: false,
      isVerified: false,
    });
  }, []);

  return {
    otpState,
    setEmail,
    setPending,
    setVerified,
    verifyOTP,
    resendOTP,
    clearOTPState,
  };
}
