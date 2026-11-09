import type { Nutrition } from "../api/types.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface NutritionTableProps {
  nutrition: Nutrition | null;
}

export function NutritionTable({ nutrition }: NutritionTableProps) {
  const { t, tUnit, formatNum } = useTranslation();
  if (!nutrition) return null;

  const items = [
    {
      label: t("recipeDetail.calories"),
      val: nutrition.calories,
      unit: tUnit("kcal"),
    },
    {
      label: t("recipeDetail.protein"),
      val: nutrition.proteinGrams,
      unit: tUnit("g"),
    },
    {
      label: t("recipeDetail.carbs"),
      val: nutrition.carbsGrams,
      unit: tUnit("g"),
    },
    { label: t("recipeDetail.fat"), val: nutrition.fatGrams, unit: tUnit("g") },
    {
      label: t("recipeDetail.fiber"),
      val: nutrition.fiberGrams,
      unit: tUnit("g"),
    },
  ].filter((item) => typeof item.val === "number");

  if (items.length === 0) return null;

  return (
    <div className="bg-sand/30 rounded-3xl p-6 sm:p-8 border border-stone-200/80">
      <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
        {t("recipeDetail.nutritionHeading")}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-white p-4 rounded-2xl border border-stone-200/80 text-center shadow-xs"
          >
            <span className="block font-mono text-[11px] text-stone-500 uppercase tracking-wider">
              {it.label}
            </span>
            <span className="block font-serif text-2xl font-normal text-stone-900 mt-1">
              {formatNum(Math.round(it.val as number))}
              <span className="font-mono text-xs font-normal text-stone-500 ms-1">
                {it.unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
