import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import FlipCard from "@/components/FlipCard";
import FlashcardMobile from "@/components/FlashcardMobile";
import FlashcardCarousel from "@/components/FlashcardCarousel";
import { 
  ArrowLeft,  
  RotateCcw,
  BookOpen,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

const Flashcards = () => {
  const { pdfId } = useParams();
  const {user} = useAuth()
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const isMobile = useIsMobile();

  // Dados simulados dos flashcards
  const Flashcards = user.pdfs.find((p: any) => p.id === Number(pdfId)).flashcards

  const pdfData = {
    name: user.pdfs.find((p: any) => p.id === Number(pdfId)).name.split('.'),
    totalCards: Flashcards.length,
  };

  const filteredCards = Flashcards.filter((card: any) =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.category.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 lg:ml-0 pt-10 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="grid lg:flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2 w-full lg:w-fit cursor-pointer hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-smooth"
              >
                <ArrowLeft className="h-4 w-4" />
                <p className="text-sm lg:text-base">Voltar aos Meus PDFs</p>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-2xl font-bold">{pdfData.name[0]}</h1>
                  <p className="text-sm text-muted-foreground">
                    {pdfData.totalCards} flashcards gerados
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Start Button */}
          {filteredCards.length > 0 && (
            <div className="mb-6 flex justify-center w-full">
              <Button
                onClick={() => setIsCarouselOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-1/2"
              >
                🚀 Começar
              </Button>
            </div>
          )}

          {/* Flashcards Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCards.map((flashcard: any, index: any) => 
              isMobile ? (
                <FlashcardMobile
                  key={flashcard.id}
                  front={flashcard.front}
                  back={flashcard.back}
                  index={index}
                />
              ) : (
                <FlipCard
                  key={flashcard.id}
                  front={flashcard.front}
                  back={flashcard.back}
                  index={index}
                />
              )
            )}
          </div>

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum flashcard encontrado</h3>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpar Busca
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Info Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Clique nos cards para ver as respostas
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Carousel Modal */}
      <FlashcardCarousel
        flashcards={filteredCards}
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
      />
    </div>
  );
};

export default Flashcards;