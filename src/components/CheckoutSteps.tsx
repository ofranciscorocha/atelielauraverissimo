'use client'

import { Check } from 'lucide-react'

interface CheckoutStepsProps {
  currentStep: 'cart' | 'delivery' | 'payment'
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { id: 'cart', label: 'CARRINHO', number: 1 },
    { id: 'delivery', label: 'ENTREGA', number: 2 },
    { id: 'payment', label: 'PAGAMENTO', number: 3 },
  ]

  const getCurrentStepNumber = () => {
    return steps.find(s => s.id === currentStep)?.number || 1
  }

  const currentNumber = getCurrentStepNumber()

  return (
    <div className="bg-white border-b border-black/5 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = step.number < currentNumber
            const isUpcoming = step.number > currentNumber

            return (
              <div key={step.id} className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                      isCompleted
                        ? 'bg-[#304930] text-white'
                        : isActive
                        ? 'bg-[#304930] text-white ring-4 ring-[#304930]/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      isActive || isCompleted
                        ? 'text-[#304930]'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`hidden md:block w-16 h-0.5 transition-colors ${
                      isCompleted ? 'bg-[#304930]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
