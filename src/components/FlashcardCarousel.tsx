import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, RotateCcw, BookOpen, Lightbulb } from "lucide-react";

interface FlashcardCarouselProps {
  flashcards: any[];
  isOpen: boolean;
  onClose: () => void;
}

const FlashcardCarousel = ({ flashcards, isOpen, onClose }: FlashcardCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setIsFlipped(false);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleClose = () => {
    setSelectedIndex(0);
    setIsFlipped(false);
    if (emblaApi) emblaApi.scrollTo(0);
    onClose();
  };

  // Setup Embla listeners
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  if (!isOpen || flashcards.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-background rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Flashcard {selectedIndex + 1} de {flashcards.length}</h3>
                <div className="w-32 bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((selectedIndex + 1) / flashcards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex">
                {flashcards.map((flashcard) => (
                  <div key={flashcard.id} className="embla__slide flex-[0_0_100%] min-w-0">
                    <div className="relative h-80">
                      {/* Frente do Card */}
                      <Card 
                        className={`absolute inset-0 gradient-card shadow-card border-primary/10 transition-all duration-300 ${
                          isFlipped ? 'opacity-0 invisible' : 'opacity-100 visible'
                        }`}
                      >
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                Pergunta
                              </Badge>
                              <div className="p-1.5 bg-primary/10 rounded-lg">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            
                            <div className="flex-1 flex items-center">
                              <h3 className="text-lg font-semibold leading-tight text-foreground text-center">
                                {flashcard.front}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground text-center">
                              Toque para ver a resposta
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Verso do Card */}
                      <Card 
                        className={`absolute inset-0 gradient-card shadow-card border-primary/10 bg-gradient-to-br from-primary/5 to-primary-glow/5 transition-all duration-300 ${
                          isFlipped ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      >
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                Resposta
                              </Badge>
                              <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-base leading-relaxed text-foreground text-center">
                                {flashcard.back}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center pt-4 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(false);
                              }}
                              className="gap-2 text-xs hover:bg-primary/10 hover:text-primary transition-smooth"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Voltar à pergunta
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Overlay para capturar cliques */}
                      <div 
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollPrev}
                disabled={selectedIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, flashcards.length) }, (_, i) => {
                  // Calcular o índice real baseado na posição atual
                  let startIndex = Math.max(0, selectedIndex - 2);
                  if (selectedIndex >= flashcards.length - 2) {
                    startIndex = Math.max(0, flashcards.length - 5);
                  }
                  
                  const realIndex = startIndex + i;
                  const isActive = realIndex === selectedIndex;
                  
                  return (
                    <button
                      key={realIndex}
                      onClick={() => {
                        scrollTo(realIndex);
                        setIsFlipped(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        isActive ? 'bg-primary scale-110' : 'bg-muted hover:bg-muted-foreground/50'
                      }`}
                    />
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={scrollNext}
                disabled={selectedIndex === flashcards.length - 1}
                className="gap-2"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashcardCarousel;
