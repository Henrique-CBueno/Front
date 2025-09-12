import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth} from "@/hooks/use-auth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {refreshUser} = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);    // A chave DEVE ser 'username'
      formData.append('password', password);  // A chave DEVE ser 'password'

      const res = await fetch("http://localhost:8000/auth/token", {
        method: 'POST', // Specifies the HTTP method as POST
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Indicates the content type of the body
        },
        body: formData
      });

      if (!res.ok) throw new Error("Não autorizado");

      const data = await res.json();

      // data deve ter: { access_token: "Bearer ..." }
      const token = data.access_token;

      // Salva no localStorage para persistir entre reloads
      localStorage.setItem("token", token);
      console.log(localStorage)

      
      // Simular login/registro bem-sucedido
      toast({
        title: isLogin ? "Login realizado!" : "Conta criada!",
        description: isLogin ? "Bem-vindo de volta!" : "Sua conta foi criada com sucesso.",
      });

      // Atualiza estado global / hook
      await refreshUser();


      navigate("/dashboard");
      
  } catch (err) {
    console.error("Login falhou:", err);
  }
    

  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const userData = {
        email: email,
        password: password,
      };

      const res = await fetch("http://localhost:8000/auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!res.ok){ 
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Erro",
          description: errorData.detail,
        });
        throw new Error("Não criado")
      };
      
      // Simular login/registro bem-sucedido
      toast({
        title: isLogin ? "Login realizado!" : "Conta criada!",
        description: isLogin ? "Bem-vindo de volta!" : "Sua conta foi criada com sucesso.",
      });

      setIsLogin(true)

      
  } catch (err) {
    console.error("Login falhou:", err);
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
          <p className="text-white/80">Transforme PDFs em flashcards inteligentes</p>
        </div>

        <Card className="gradient-card shadow-card border-0 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Entre na sua conta para continuar" 
                : "Crie sua conta para começar"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-border/50 focus:border-primary transition-smooth"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 cursor-pointer hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl cursor-pointer gradient-primary hover:shadow-glow transition-smooth font-medium"
              >
                {isLogin ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary cursor-pointer hover:text-primary/80 font-medium p-0 h-auto"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60 mt-6">
          Ao continuar, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
};

export default Login;