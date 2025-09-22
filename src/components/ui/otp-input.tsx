import * as React from "react"
import { cn } from "@/lib/utils"

export interface OTPInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  ({ className, value, onChange, length = 6, disabled, ...props }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
    
    const handleChange = (index: number, inputValue: string) => {
      if (disabled) return
      
      // Remove caracteres não numéricos
      const numericValue = inputValue.replace(/\D/g, '')
      
      // Atualiza o valor
      const newValue = value.split('')
      newValue[index] = numericValue.slice(-1) // Pega apenas o último caractere
      
      // Preenche com vazios se necessário
      while (newValue.length < length) {
        newValue.push('')
      }
      
      const finalValue = newValue.slice(0, length).join('')
      onChange(finalValue)
      
      // Move para o próximo input se digitou algo
      if (numericValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return
      
      // Backspace
      if (e.key === 'Backspace') {
        if (!value[index] && index > 0) {
          // Se o campo atual está vazio, volta para o anterior
          inputRefs.current[index - 1]?.focus()
        } else {
          // Limpa o campo atual
          const newValue = value.split('')
          newValue[index] = ''
          onChange(newValue.join(''))
        }
      }
      
      // Arrow keys
      if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    
    const handlePaste = (e: React.ClipboardEvent) => {
      if (disabled) return
      
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
      
      if (pastedData.length > 0) {
        const newValue = pastedData.slice(0, length).padEnd(length, '')
        onChange(newValue)
        
        // Foca no último campo preenchido ou no último campo
        const lastFilledIndex = Math.min(pastedData.length - 1, length - 1)
        inputRefs.current[lastFilledIndex]?.focus()
      }
    }
    
    return (
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
              if (index === 0 && ref) {
                if (typeof ref === 'function') {
                  ref(el)
                } else {
                  ref.current = el
                }
              }
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              value[index] 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50",
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }
)

OTPInput.displayName = "OTPInput"

export { OTPInput }
