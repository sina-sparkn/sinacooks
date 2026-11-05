import type { Step } from "../api/types.js";

interface StepListProps {
  steps: Step[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:border-amber-200 transition-colors"
        >
          {/* Step Number Badge */}
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
            {idx + 1}
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-stone-800 text-base leading-relaxed">
              {step.instruction}
            </p>

            {step.timerMinutes && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-semibold">
                <span>⏱️ Timer:</span>
                <span>{step.timerMinutes} minutes</span>
              </div>
            )}

            {step.image && (
              <div className="mt-3 rounded-xl overflow-hidden max-w-md aspect-video bg-stone-100">
                <img
                  src={step.image.url}
                  alt={step.image.alt || `Step ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
