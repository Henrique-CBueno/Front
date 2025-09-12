import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { 
  CreditCard, 
  Check, 
  Star, 
  Zap,
  Crown,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const TokenPurchase = () => {
  const { toast } = useToast();
  const {user} = useAuth()

  const handleBuy = async (productId: number, packageName: string) => {
    try {
      const res = await fetch(`http://localhost:8000/payment/pagamentos/${productId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
      
      const data = await res.json();
      
      if (data.init_point) {
        toast({
          title: "Redirecionando para pagamento",
          description: `Você será redirecionado para o checkout do pacote ${packageName}`,
        });
        window.location.href = data.init_point;
      } else {
        throw new Error(data.detail || "Erro ao processar pagamento");
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const tokenPackages = [
    {
      id: 1,
      name: "Iniciante",
      tokens: 10,
      price: 9.90,
      description: "Perfeito para começar",
      features: [
        "até 10 PDFs processados",
        "Suporte",
        "Flashcards salvos em um banco de dados"
      ],
      icon: Gift,
      popular: false,
      savings: null
    },
    {
      id: 2,
      name: "Profissional",
      tokens: 25,
      price: 19.90,
      description: "Ideal para uso regular",
      features: [
        "até 25 PDFs processados",
        "Suporte",
        "Flashcards salvos em um banco de dados"
      ],
      icon: Star,
      popular: true,
      savings: 20
    },
    {
      id: 3,
      name: "Empresarial",
      tokens: 50,
      price: 34.90,
      description: "Para uso intensivo",
      features: [
        "até 50 PDFs processados",
        "Suporte",
        "Flashcards salvos em um banco de dados"
      ],
      icon: Crown,
      popular: false,
      savings: 30
    }
  ];

  return (
    <div className="flex pt-10 lg:pt-0 min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 gradient-primary rounded-2xl shadow-glow">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Comprar Tokens</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o pacote ideal para suas necessidades de processamento de PDFs
            </p>
            
            {/* Status atual */}
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-primary/10 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">{user.tokens} tokens disponíveis</span>
            </div>
          </div>

          {/* Pacotes de Tokens */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {tokenPackages.map((pkg) => {
              const IconComponent = pkg.icon;
              
              return (
                <Card 
                  key={pkg.id}
                  className={`
                    relative overflow-hidden transition-smooth hover:shadow-card
                    ${pkg.popular 
                      ? "border-primary shadow-glow scale-105 gradient-card" 
                      : "hover:border-primary/30"
                    }
                  `}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="gradient-primary text-white text-center py-2 text-sm font-medium">
                        🔥 Mais Popular
                      </div>
                    </div>
                  )}
                  
                  {pkg.savings && (
                    <Badge 
                      className="absolute top-4 right-4 bg-green-500 hover:bg-green-500"
                    >
                      {pkg.savings}% OFF
                    </Badge>
                  )}

                  <CardHeader className={pkg.popular ? "pt-12" : "pt-6"}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`
                        p-2 rounded-xl
                        ${pkg.popular 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted/50 text-muted-foreground"
                        }
                      `}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">R$ {pkg.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-muted-foreground">/pacote</span>
                      </div>
                      <p className="text-primary font-medium">
                        {pkg.tokens} tokens • R$ {(pkg.price / pkg.tokens).toFixed(2).replace('.', ',')} por token
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <Button
                      onClick={() => handleBuy(pkg.id, pkg.name)}
                      className={`
                        w-full h-12 font-medium transition-smooth
                        ${pkg.popular
                          ? "gradient-primary hover:shadow-glow"
                          : "hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
                        }
                      `}
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Comprar Agora
                    </Button>

                    <div className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="p-1 bg-green-100 rounded-full">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informações Adicionais */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5" />
                  Como funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• <strong>1 token = Até 1 PDF processado (150.000 carcteres)</strong></p>
                <p>• Tokens não expiram</p>
                <p>• Processamento rápido (menos de 1 minuto por PDF)</p>
                <p>• Flashcards gerados automaticamente usando IA</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Crown className="h-5 w-5" />
                  Garantias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-green-700">
                <p>• ✓ Suporte técnico incluso</p>
                <p>• ✓ Processamento garantido</p>
                <p>• ✓ Dados seguros e criptografados</p>
                <p>• ✓ Pagamentos via pix</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Pagamento seguro • SSL • Dados protegidos • Pagamentos Via Pix • bsys.solucoes@gmail.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TokenPurchase;