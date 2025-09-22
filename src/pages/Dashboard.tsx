import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import FileUploadArea from "@/components/FileUploadArea";
import { 
  FileText, 
  Calendar, 
  Eye, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const PDFs = user.pdfs?.sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "processed": 
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Processado"
        };
      case "processing":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Processando, isso pode demorar um pouco...",
          subtext: "lembre-se de atualizar a pagina!"
        };
      default: 
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Falhou"
        };
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error("Falha ao atualizar os dados:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex pt-8 flex-col sm:flex-row sm:items-center sm:justify-between lg:pt-0 gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Meus PDFs</h1>
              <p className="text-muted-foreground">
                Gerencie seus documentos e flashcards
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-primary/10"
              >
                <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button 
                onClick={() => setShowUpload(true)}
                className="gradient-primary hover:shadow-glow transition-smooth gap-2"
              >
                <Upload className="h-4 w-4" />
                Enviar Novo PDF
              </Button>
            </div>
          </div>

          {/* Aviso sobre imagens */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 mb-8 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 leading-relaxed overflow-auto">
              <span className="font-semibold">Atenção:</span> PDFs que contêm apenas{" "}
              <span className="font-semibold">imagens</span> não serão lidos corretamente.  
              Certifique-se de que o PDF contenha texto selecionável.
            </p>
          </div>

          {/* Grid de PDFs */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PDFs.map((pdf: any) => {
              const statusConfig = getStatusConfig(pdf.pdfStatus);

              return (
                <Card 
                  key={pdf.id} 
                  className="hover:shadow-card transition-smooth group flex flex-col"
                >
                  <CardHeader className="flex flex-grow items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <CardTitle 
                        title={pdf.name.split('.')[0]} 
                        className={`
                          text-lg truncate group-hover:text-primary transition-smooth 
                          ${pdf.pdfStatus === 'processed' ? 'cursor-pointer' : 'cursor-default'}
                        `}
                        onClick={(e) => {
                          if (pdf.pdfStatus === 'processed') {
                            e.stopPropagation();
                            navigate(`/flashcards/${pdf.id}`);
                          }
                        }}
                      >
                        {pdf.name.split('.')[0]}
                      </CardTitle>
                      
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {pdf.createdAt}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${statusConfig.bg}`}>
                          <statusConfig.icon className={`h-3 w-3 ${statusConfig.color} ${pdf.pdfStatus === 'processing' ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{statusConfig.text}</span>
                          {statusConfig.subtext ? <span className="text-xs">{statusConfig.subtext}</span> : ""}
                        </div>
                        {pdf.flashcards.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {pdf.flashcards.length} cards
                          </Badge>
                        )}
                      </div>
                      
                      {/* Ações */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pdf.pdfStatus !== "processed"}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/flashcards/${pdf.id}`);
                        }}
                        className="w-full gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-smooth"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Flashcards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Estado vazio */}
          {PDFs.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-24 h-24 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum PDF encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Envie seu primeiro PDF para começar a criar flashcards
                </p>
                <Button 
                  onClick={() => setShowUpload(true)}
                  className="gradient-primary hover:shadow-glow transition-smooth"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Primeiro PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modal de Upload */}
      {showUpload && (
        <FileUploadArea 
          onClose={() => {
            setShowUpload(false);
            handleRefresh();
          }} 
          tokens={user.tokens} 
        />
      )}
    </div>
  );
};

export default Dashboard;
