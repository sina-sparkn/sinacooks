import { useState } from "react";
import { Check } from "lucide-react";
import type { IngredientLine } from "../api/types.js";
import { formatQuantity, scaleQuantity } from "../lib/scaler.js";
import { useTranslation } from "../features/i18n/I18nContext.js";

interface IngredientListProps {
  ingredients: IngredientLine[];
  baseServings: number;
  currentServings: number;
}

export function IngredientList({
  ingredients,
  baseServings,
  currentServings,
}: IngredientListProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const { tUnit, formatNum } = useTranslation();

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Group ingredients by group header if present
  const groups: { name: string | null; items: IngredientLine[] }[] = [];
  const map = new Map<string | null, IngredientLine[]>();

  for (const item of ingredients) {
    const key = item.group || null;
    if (!map.has(key)) {
      const arr: IngredientLine[] = [];
      map.set(key, arr);
      groups.push({ name: key, items: arr });
    }
    map.get(key)!.push(item);
  }

  return (
    <div className="space-y-6">
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-3">
          {group.name && (
            <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-terracotta border-b border-terracotta/20 pb-1.5 pt-2">
              {group.name}
            </h4>
          )}
          <ul className="divide-y divide-stone-100">
            {group.items.map((ing, idx) => {
              const itemId = `${gIdx}-${idx}-${ing.name}`;
              const isChecked = checkedItems.includes(itemId);
              const scaled = scaleQuantity(
                ing.quantity,
                baseServings,
                currentServings,
              );
              const formattedQty = formatQuantity(scaled);

              return (
                <li
                  key={idx}
                  onClick={() => toggleChecked(itemId)}
                  className={`py-3 px-3 rounded-xl flex items-start gap-3.5 cursor-pointer transition-colors ${
                    isChecked
                      ? "bg-stone-100/60 opacity-60"
                      : "hover:bg-sand/30"
                  }`}
                >
                  {/* Subtle checklist circle */}
                  <div
                    className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? "bg-terracotta border-terracotta text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isChecked && (
                      <Check
                        className="w-2.5 h-2.5 stroke-[3]"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="flex-1 flex flex-wrap items-baseline gap-x-2">
                    {formattedQty && (
                      <span
                        className={`font-mono font-bold text-stone-900 ${
                          isChecked ? "line-through text-stone-400" : ""
                        }`}
                      >
                        {formatNum(formattedQty)}
                      </span>
                    )}
                    {ing.unit && (
                      <span
                        className={`font-mono text-xs text-stone-600 font-medium ${
                          isChecked ? "line-through text-stone-400" : ""
                        }`}
                      >
                        {tUnit(ing.unit)}
                      </span>
                    )}
                    <span
                      className={`font-sans font-medium text-stone-900 ${
                        isChecked ? "line-through text-stone-400" : ""
                      }`}
                    >
                      {ing.name}
                    </span>
                    {ing.note && (
                      <span className="font-sans text-stone-500 text-xs italic">
                        ({ing.note})
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
