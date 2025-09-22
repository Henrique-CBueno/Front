import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OTPInput } from "@/components/ui/otp-input";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { BookOpen, Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const VerifyResetPasswordOTP = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const emailFromStorage = sessionStorage.getItem("passwordResetEmail");
    
    if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      toast({
        variant: "destructive",
        title: "Sessão inválida",
        description: "Nenhum email encontrado para redefinição. Por favor, comece novamente.",
      });
      navigate("/reset-password");
    }
  }, [navigate, toast]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Código inválido",
        description: "Por favor, insira o código de 6 dígitos.",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("http://localhost:8000/auth/reset-password/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp_code: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao verificar código");
      }

      // Salva o token temporário para a próxima etapa
      sessionStorage.setItem("resetToken", data.reset_token);

      toast({
        title: "Código verificado!",
        description: "Agora você pode criar uma nova senha.",
      });
      
      navigate("/reset-password/confirm");

    } catch (error) {
      console.error("Erro ao verificar OTP de reset:", error);
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Código inválido ou expirado.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      const response = await fetch("http://localhost:8000/auth/reset-password/request", {
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

      setOtp("");
      setCanResend(false);
      setTimerKey(prev => prev + 1); // Reinicia o timer

    } catch (error) {
      console.error("Erro ao reenviar OTP de reset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reenviar",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCountdownComplete = () => {
    setCanResend(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 gradient-primary rounded-2xl shadow-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">My Idea</h1>
          <p className="text-white/80">Verificação de código</p>
        </div>

        <Card className="gradient-card shadow-card border-0 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifique seu email</CardTitle>
            <CardDescription>
              Enviamos um código de 6 dígitos para
              <br />
              <span className="font-semibold text-primary">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={isVerifying}
                    className="text-lg"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <CountdownTimer
                    initialSeconds={300} // 5 minutos, conforme backend
                    onComplete={handleCountdownComplete}
                    className="text-sm"
                    resetKey={timerKey}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full h-12 rounded-xl cursor-pointer gradient-primary hover:shadow-glow transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar e continuar"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={!canResend || isResending}
                  className="w-full h-12 rounded-xl border-border/50 hover:bg-background/50 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    "Reenviar código"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/login")}
                className="text-muted-foreground hover:text-primary cursor-pointer font-medium p-0 h-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyResetPasswordOTP;