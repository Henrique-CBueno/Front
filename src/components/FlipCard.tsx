import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, BookOpen, Lightbulb } from "lucide-react";

interface FlipCardProps {
  front: string;
  back: string;
  index: number;
}

const FlipCard = ({ front, back, index }: FlipCardProps) => {
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
      className="relative h-72 perspective-1000"
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Frente do Card */}
        <Card className="absolute inset-0 backface-hidden gradient-card shadow-card fix-blur border-primary/10 hover:shadow-glow transition-smooth group">
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
                <h3 className="text-lg font-semibold leading-tight text-foreground fix-blur group-hover:text-primary transition-smooth">
                  {front}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Clique para ver a resposta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verso do Card */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 gradient-card shadow-card border-primary/10 bg-gradient-to-br from-primary/5 to-primary-glow/5 group">
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
                <p className="text-sm leading-relaxed text-foreground">
                  {back}
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
      </motion.div>
    </motion.div>
  );
};

export default FlipCard;