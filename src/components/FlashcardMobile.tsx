import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, BookOpen, Lightbulb } from "lucide-react";

interface FlashcardMobileProps {
  front: string;
  back: string;
  index: number;
}

const FlashcardMobile = ({ front, back, index }: FlashcardMobileProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.4,
        ease: "easeOut"
      }}
      className="relative h-64 sm:h-72"
    >
      <div className="relative w-full h-full">
        {/* Frente do Card */}
        <Card 
          className={`absolute inset-0 gradient-card shadow-card border-primary/10 hover:shadow-glow transition-all duration-300 group ${
            isFlipped ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
        >
          <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Pergunta
                </Badge>
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 flex items-center">
                <h3 className="text-base sm:text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-smooth">
                  {front}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-3 sm:pt-4 border-t border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Toque para ver a resposta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verso do Card */}
        <Card 
          className={`absolute inset-0 gradient-card shadow-card border-primary/10 bg-gradient-to-br from-primary/5 to-primary-glow/5 group transition-all duration-300 ${
            isFlipped ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  Resposta
                </Badge>
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm sm:text-base leading-relaxed text-foreground">
                  {back}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-3 sm:pt-4 border-t border-border/50">
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
                <span className="hidden sm:inline">Voltar à pergunta</span>
                <span className="sm:hidden">Voltar</span>
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
    </motion.div>
  );
};

export default FlashcardMobile;
