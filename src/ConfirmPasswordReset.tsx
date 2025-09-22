import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

const ConfirmPasswordReset = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Token de redefinição inválido ou expirado. Por favor, comece novamente.",
      });
      navigate("/reset-password");
    }
  }, [navigate, toast]);

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      passwordSchema.parse({ password: newPassword, confirmPassword });
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

    const token = sessionStorage.getItem("resetToken");

    try {
      const response = await fetch("http://localhost:8000/auth/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erro ao redefinir a senha");
      }

      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Você já pode fazer login.",
      });

      // Limpa os dados da sessão e redireciona
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("passwordResetEmail");
      navigate("/login");

    } catch (error) {
      console.error("Erro ao confirmar reset:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Token inválido ou expirado. Tente novamente.",
      });
      // Se o token expirou, limpa e redireciona
      if (error instanceof Error && (error.message.includes("expirado") || error.message.includes("inválido"))) {
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("passwordResetEmail");
        navigate("/reset-password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 gradient-primary rounded-2xl shadow-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">My Idea</h1>
          <p className="text-white/80">Crie sua nova senha</p>
        </div>

        <Card className="gradient-card shadow-card border-0 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
            <CardDescription>
              Escolha uma nova senha para sua conta.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-border/50 focus:border-primary transition-smooth"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10 cursor-pointer hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-border/50 focus:border-primary transition-smooth"
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
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
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
    </>
  );
};

export default ConfirmPasswordReset;