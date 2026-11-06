import { useState } from "react";
import { Check, Clock } from "lucide-react";
import type { Step } from "../api/types.js";
import { StepCheckButton } from "./StepCheckButton.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface StepListProps {
  steps: Step[];
}

export function StepList({ steps }: StepListProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { t, formatNum } = useTranslation();

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const progressPercent =
    steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  return (
    <div className="space-y-8 relative">
      {/* Progress Line Header */}
      <div className="bg-sand/30 border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between text-xs font-mono text-stone-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terracotta" />
          <span>{t("recipeDetail.executionProgress")}</span>
          <span className="font-bold text-stone-900">
            {t("recipeDetail.stepsCompleted", {
              completed: formatNum(completedSteps.length),
              total: formatNum(steps.length),
            })}
          </span>
        </div>
        <span className="font-bold text-terracotta font-mono">
          {formatNum(Math.round(progressPercent))}%
        </span>
      </div>

      {/* Steps List with Connecting Line */}
      <div className="relative ps-6 sm:ps-10 space-y-8">
        {/* Continuous Vertical Guide Line */}
        <div
          className="absolute start-3 sm:start-5 top-4 bottom-4 w-0.5 bg-stone-200 pointer-events-none"
          aria-hidden="true"
        />

        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const stepNumber = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

          return (
            <div
              key={idx}
              className={`relative group bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 shadow-[0_2px_16px_rgba(23,21,19,0.03)] hover:shadow-md ${
                isDone
                  ? "border-sage/40 bg-sage-light/20 opacity-80"
                  : "border-stone-200/80 hover:border-terracotta/40"
              }`}
            >
              {/* Step Node Marker on Line */}
              <button
                type="button"
                onClick={() => toggleStep(idx)}
                aria-label={`Mark step ${idx + 1} as ${isDone ? "incomplete" : "complete"}`}
                className={`absolute -start-6 sm:-start-10 top-7 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-transform duration-300 cursor-pointer ${
                  isDone
                    ? "bg-sage border-sage text-white scale-105"
                    : "bg-white border-stone-300 text-stone-600 hover:border-terracotta hover:scale-110"
                }`}
              >
                {isDone ? (
                  <Check
                    className="w-3.5 h-3.5 stroke-[2.5]"
                    aria-hidden="true"
                  />
                ) : (
                  formatNum(idx + 1)
                )}
              </button>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {t("common.step")} {formatNum(stepNumber)}
                  </span>
                  <StepCheckButton
                    isDone={isDone}
                    onToggle={() => toggleStep(idx)}
                    stepNumber={idx + 1}
                  />
                </div>

                {/* Instruction Text */}
                <p
                  className={`font-sans text-base sm:text-lg leading-relaxed ${
                    isDone
                      ? "line-through text-stone-400"
                      : "text-stone-800 font-normal"
                  }`}
                >
                  {step.instruction}
                </p>

                {/* Step Timer Badge */}
                {step.timerMinutes && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-butter text-amber-900 border border-amber-200/70 rounded-full font-mono text-xs font-medium">
                    <Clock
                      className="w-3.5 h-3.5 text-amber-800"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>{t("recipeDetail.timer")}:</span>
                    <span className="font-bold">
                      {formatNum(step.timerMinutes)} {t("common.mins")}
                    </span>
                  </div>
                )}

                {/* Step Image */}
                {step.image && (
                  <div className="mt-4 rounded-2xl overflow-hidden max-w-lg aspect-video bg-stone-100 border border-stone-200">
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
          );
        })}
      </div>
    </div>
  );
}
