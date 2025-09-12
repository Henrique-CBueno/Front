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
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();
  const {user} = useAuth()

  
  const PDFs = user.pdfs

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
          text: "Processando"
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Erro"
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex pt-8 flex-col sm:flex-row sm:items-center sm:justify-between lg:pt-0 gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Meus PDFs</h1>
              <p className="text-muted-foreground">
                Gerencie seus documentos e flashcards
              </p>
            </div>
            
            <Button 
              onClick={() => setShowUpload(true)}
              className="gradient-primary hover:shadow-glow transition-smooth gap-2"
            >
              <Upload className="h-4 w-4" />
              Enviar Novo PDF
            </Button>
          </div>

          {/* Aviso de Tokens */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium text-primary">Atenção: Você precisa de tokens para enviar PDFs</p>
                  <p className="text-sm text-muted-foreground">
                    Você tem {user.tokens} tokens disponíveis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de PDFs */}
          <div className="grid gap-6 md:grid-cols-2">
            {PDFs.map((pdf: any) => {
              pdf.status = "processed"
              const statusConfig = getStatusConfig(pdf.status);
              const StatusIcon = statusConfig.icon;
              const pdfName = pdf.name.split('.')
              
              return (
                <Card 
                  key={pdf.id} 
                  className="hover:shadow-card transition-smooth cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-smooth">
                          {pdfName[0]}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {pdf.createdAt}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${statusConfig.bg}`}>
                          <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                        </div>
                        <span className="text-sm font-medium">{statusConfig.text}</span>
                        {pdf.flashcardsCount > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {pdf.flashcardsCount} cards
                          </Badge>
                        )}
                      </div>
                      
                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pdf.status !== "processed"}
                          onClick={() => navigate(`/flashcards/${pdf.id}`)}
                          className="flex-1 gap-2 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-smooth"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Flashcards
                        </Button>
                      </div>
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
        <FileUploadArea onClose={() => setShowUpload(false)} tokens={user.tokens} />
      )}
    </div>
  );
};

export default Dashboard;