import type { Nutrition } from "../api/types.js";

interface NutritionTableProps {
  nutrition: Nutrition | null;
}

export function NutritionTable({ nutrition }: NutritionTableProps) {
  if (!nutrition) return null;

  const items = [
    { label: "Calories", val: nutrition.calories, unit: "kcal" },
    { label: "Protein", val: nutrition.proteinGrams, unit: "g" },
    { label: "Carbs", val: nutrition.carbsGrams, unit: "g" },
    { label: "Fat", val: nutrition.fatGrams, unit: "g" },
    { label: "Fiber", val: nutrition.fiberGrams, unit: "g" },
  ].filter((item) => typeof item.val === "number");

  if (items.length === 0) return null;

  return (
    <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
        Nutrition per Serving
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-white p-3 rounded-xl border border-stone-200/80 text-center"
          >
            <span className="block text-xs text-stone-500">{it.label}</span>
            <span className="block text-lg font-bold text-stone-900 mt-0.5">
              {it.val}
              <span className="text-xs font-normal text-stone-500 ml-0.5">
                {it.unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
