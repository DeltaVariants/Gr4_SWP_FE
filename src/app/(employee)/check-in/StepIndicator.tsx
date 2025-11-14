/**
 * StepIndicator Component
 * Display progress of check-in flow
 */

import { User, Battery, CheckCircle2, ArrowRight } from 'lucide-react';
import { CheckInStep } from './types';

interface StepConfig {
  key: CheckInStep;
  label: string;
  icon: typeof User;
}

const STEPS: StepConfig[] = [
  { key: 'verify', label: 'Verify', icon: User },
  { key: 'swap', label: 'Swap', icon: Battery },
  { key: 'completed', label: 'Complete', icon: CheckCircle2 },
];

interface StepIndicatorProps {
  currentStep: CheckInStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.key;
        const isPassed = idx < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive || isPassed ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isPassed
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : isActive
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              <span
                className={`text-xs font-medium text-center max-w-[65px] ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <ArrowRight className={`w-4 h-4 ${isPassed ? 'text-emerald-500' : 'text-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}


