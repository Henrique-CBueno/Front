import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
});

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse({ email });
    } catch (error: any) {
      const firstError = error.issues?.[0];
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: firstError?.message || "Dados inválidos",
      });
      setIsLoading(false);
      return;
    }

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
        throw new Error(data.detail || "Erro ao solicitar redefinição de senha");
      }

      toast({
        title: "Email enviado!",
        description: "Um código de verificação foi enviado para seu email.",
      });

      // Salva o email para a próxima etapa no sessionStorage
      sessionStorage.setItem("passwordResetEmail", email);
      
      navigate("/reset-password/verify-otp");

    } catch (error) {
      console.error("Erro ao solicitar reset:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-white/80">Redefinir sua senha</p>
        </div>

        <Card className="gradient-card shadow-card border-0 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              Insira seu email para receber um código de verificação.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary transition-smooth"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl cursor-pointer gradient-primary hover:shadow-glow transition-smooth font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar código"
                )}
              </Button>
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

export default RequestPasswordReset;