import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  initialSeconds: number
  onComplete?: () => void
  className?: string
  resetKey?: number | string
}

export function CountdownTimer({ 
  initialSeconds, 
  onComplete, 
  className,
  resetKey
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  // Reset timer when resetKey changes
  useEffect(() => {
    setSeconds(initialSeconds)
    setIsActive(true)
  }, [resetKey, initialSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          if (seconds <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return seconds - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, seconds, onComplete])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn("text-sm font-medium", className)}>
      {isActive ? (
        <span className="text-muted-foreground">
          Reenviar em {formatTime(seconds)}
        </span>
      ) : (
        <span className="text-primary">Pode reenviar</span>
      )}
    </div>
  )
}
