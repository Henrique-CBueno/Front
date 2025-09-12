import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle, 
  Loader2,
  AlertCircle 
} from "lucide-react";
// Função para calcular tokens baseado no tamanho do arquivo PDF
const calculateTokensFromFileSize = (fileSizeInBytes: number): { tokens: number; sizeInMB: number } => {
  // 1 token = 409.600 bytes
  const bytesPerToken = 409600;
  const tokens = Math.ceil(fileSizeInBytes / bytesPerToken);
  const sizeInMB = fileSizeInBytes / (1024 * 1024);
  return { tokens, sizeInMB };
};

interface FileUploadAreaProps {
  onClose: () => void;
  tokens: number
}

const FileUploadArea = ({ onClose, tokens }: FileUploadAreaProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [neededTokens, setNeededTokens] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const analyzePDF = async (file: File) => {
    setAnalyzing(true);
    try {
      // Simular um pequeno delay para mostrar o estado de análise
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calcular tokens baseado no tamanho do arquivo
      const { tokens: tokensNeeded, sizeInMB } = calculateTokensFromFileSize(file.size);
      
      setCharacterCount(Math.floor(file.size / 1024)); // Mostrar tamanho em KB para referência
      setNeededTokens(tokensNeeded);
      
      // Verificar se o usuário tem tokens suficientes
      if (tokensNeeded > tokens) {
        toast({
          title: "Tokens insuficientes",
          description: `Este PDF precisa de ${tokensNeeded} tokens (${sizeInMB.toFixed(2)} MB), mas você tem apenas ${tokens}.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao analisar PDF:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Analisar o PDF antes de definir como selecionado
    const canProcess = await analyzePDF(file);
    if (canProcess) {
      setSelectedFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // --- MODIFIED FUNCTION ---
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      setUploadProgress(10);
      setUploadProgress(30);
      setUploadProgress(80);
      
      const response = await fetch('http://localhost:8000/logic/flashcards', {
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);

      if (response.ok) {
        toast({
          title: "PDF enviado com sucesso!",
          description: `${selectedFile.name} foi processado.`,
        });
        // Wait a moment before closing to show the completed progress bar
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        // Handle server errors
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress(0); // Reset progress on failure
      toast({
        title: "Erro no envio",
        description: error instanceof Error ? error.message : "Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      // The uploading state is set to false only after all operations,
      // including potential error handling, are complete.
      setUploading(false);
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setNeededTokens(0);
    setCharacterCount(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg gradient-card shadow-card border-0 animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Enviar PDF</CardTitle>
              <CardDescription>
                Faça upload do seu PDF para gerar flashcards <br/> 1 Token para 400 KB (409.600 bytes)
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {analyzing ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Analisando PDF...
              </h3>
              <p className="text-muted-foreground">
                Calculando tokens necessários
              </p>
            </div>
          ) : !selectedFile ? (
            <div
              className={`
                border-2 border-dashed rounded-2xl p-8 text-center transition-smooth
                ${dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-primary/2"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">
                Arraste seu PDF aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                ou clique para selecionar um arquivo
              </p>
              
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button 
                  variant="outline" 
                  className="hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-smooth"
                  asChild
                >
                  <span className="cursor-pointer">Selecionar Arquivo</span>
                </Button>
              </label>

              <p className="text-xs text-muted-foreground mt-4">
                PDF • Máximo 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Arquivo selecionado */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {characterCount.toLocaleString()} KB
                  </p>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFile}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progress bar and status */}
              {/* We show this as long as a file is selected and we are attempting to upload */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {uploadProgress < 100 ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Enviando... {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                         <CheckCircle className="h-4 w-4 text-green-500" />
                         <span>Concluído!</span>
                      </>
                    )}
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Aviso de tokens */}
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                neededTokens > tokens 
                  ? "bg-red-50 border-red-200" 
                  : "bg-yellow-50 border-yellow-200"
              }`}>
                <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  neededTokens > tokens ? "text-red-600" : "text-yellow-600"
                }`} />
                <div className="text-sm">
                  <p className={`font-medium ${
                    neededTokens > tokens ? "text-red-800" : "text-yellow-800"
                  }`}>
                    Este upload consumirá {neededTokens} token{neededTokens !== 1 ? 's' : ''} ({(neededTokens * 0.4).toFixed(1)} MB)
                  </p>
                  <p className={neededTokens > tokens ? "text-red-700" : "text-yellow-700"}>
                    Você tem {tokens} token{tokens !== 1 ? 's' : ''} disponível{tokens !== 1 ? 'is' : ''} ({(tokens * 0.4).toFixed(1)} MB)
                  </p>
                  {neededTokens > tokens && (
                    <p className="text-red-600 font-medium mt-1">
                      Tokens insuficientes! Compre mais tokens para continuar.
                    </p>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload} // Use the new upload function
                  disabled={uploading || neededTokens > tokens}
                  className="flex-1 gradient-primary hover:shadow-glow transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : neededTokens > tokens ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Tokens insuficientes
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadArea;