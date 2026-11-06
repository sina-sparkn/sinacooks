import { useState, useEffect } from "react";
import {
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import type { Step } from "../api/types.js";
import { useLenis } from "./useLenis.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface CookingModeModalProps {
  recipeTitle: string;
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
}

function StepTimer({ timerMinutes }: { timerMinutes: number }) {
  const { t, formatNum } = useTranslation();
  const [timerSeconds, setTimerSeconds] = useState(timerMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formattedMins = formatNum(mins);
    const formattedSecs = formatNum(secs < 10 ? `0${secs}` : secs);
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="pt-4 flex flex-col items-center gap-3">
      <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-terracotta">
        {formatTimer(timerSeconds)}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsTimerRunning((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            isTimerRunning
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-terracotta text-white hover:bg-terracotta-dark"
          }`}
        >
          {isTimerRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>{t("cookingMode.pauseTimer")}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{t("cookingMode.startTimer")}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsTimerRunning(false);
            setTimerSeconds(timerMinutes * 60);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 text-white/70 hover:text-white text-xs font-mono transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t("cookingMode.reset")}</span>
        </button>
      </div>
    </div>
  );
}

export function CookingModeModal({
  recipeTitle,
  steps,
  isOpen,
  onClose,
}: CookingModeModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { stopScroll, startScroll } = useLenis();
  const { t, formatNum, isRTL } = useTranslation();

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;

  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setCurrentStepIndex(0);
    }
  }

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      stopScroll();
      document.body.style.overflow = "hidden";
    } else {
      startScroll();
      document.body.style.overflow = "";
    }

    return () => {
      startScroll();
      document.body.style.overflow = "";
    };
  }, [isOpen, startScroll, stopScroll]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        if (isRTL) {
          setCurrentStepIndex((prev) => Math.max(0, prev - 1));
        } else {
          setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
        }
      } else if (e.key === "ArrowLeft") {
        if (isRTL) {
          setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
        } else {
          setCurrentStepIndex((prev) => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalSteps, onClose, isRTL]);

  if (!isOpen || !currentStep) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("cookingMode.title")}
      className="fixed inset-0 z-[100] bg-[#171513]/95 backdrop-blur-xl text-white flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-300"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta font-semibold">
            {t("cookingMode.title")}
          </span>
          <h2 className="font-serif text-xl sm:text-2xl text-white/90 truncate max-w-lg mt-0.5">
            {recipeTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          data-magnetic="true"
        >
          <span>{t("cookingMode.exitEsc")}</span>
          <X className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* Main Step Center View */}
      <div className="max-w-3xl mx-auto w-full my-auto py-8 space-y-8 text-center">
        {/* Step Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-xs tracking-wider">
          <span>{t("cookingMode.stepBadge")}</span>
          <span className="font-bold text-terracotta">
            {formatNum(currentStepIndex + 1)}
          </span>
          <span className="text-white/40">/</span>
          <span className="text-white/60">{formatNum(totalSteps)}</span>
        </div>

        {/* Step Instruction */}
        <p className="font-serif text-2xl sm:text-4xl lg:text-4xl text-[#FBF8F3] leading-relaxed font-normal">
          {currentStep.instruction}
        </p>

        {/* Optional Step Timer */}
        {currentStep.timerMinutes && (
          <StepTimer
            key={currentStepIndex}
            timerMinutes={currentStep.timerMinutes}
          />
        )}

        {/* Optional Step Image */}
        {currentStep.image && (
          <div className="mt-6 max-w-md mx-auto rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10 shadow-2xl">
            <img
              src={currentStep.image.url}
              alt={currentStep.image.alt || `Step ${currentStepIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom Step Navigation */}
      <div className="border-t border-white/10 pt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          data-magnetic="true"
        >
          <PrevIcon className="w-4 h-4" />
          <span>{t("cookingMode.previousStep")}</span>
        </button>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-1.5 flex-1 max-w-xs mx-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                idx === currentStepIndex
                  ? "bg-terracotta"
                  : idx < currentStepIndex
                    ? "bg-white/60"
                    : "bg-white/15"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (currentStepIndex < totalSteps - 1) {
              setCurrentStepIndex((prev) => prev + 1);
            } else {
              onClose();
            }
          }}
          className="px-6 py-3 rounded-full bg-terracotta hover:bg-terracotta-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
          data-magnetic="true"
        >
          <span className="inline-flex items-center gap-1.5">
            {currentStepIndex === totalSteps - 1 ? (
              <>
                <span>{t("cookingMode.finishRecipe")}</span>
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </>
            ) : (
              <>
                <span>{t("cookingMode.nextStep")}</span>
                <NextIcon className="w-4 h-4" />
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
