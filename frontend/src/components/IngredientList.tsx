import type { IngredientLine } from "../api/types.js";
import { formatQuantity, scaleQuantity } from "../lib/scaler.js";

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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-800 border-b border-amber-100 pb-1">
              {group.name}
            </h4>
          )}
          <ul className="divide-y divide-stone-100">
            {group.items.map((ing, idx) => {
              const scaled = scaleQuantity(
                ing.quantity,
                baseServings,
                currentServings,
              );
              const formattedQty = formatQuantity(scaled);

              return (
                <li
                  key={idx}
                  className="py-2.5 flex items-start gap-3 text-stone-800 text-sm hover:bg-stone-50/60 px-2 rounded-lg transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div className="flex-1 flex flex-wrap items-baseline gap-x-1.5">
                    {formattedQty && (
                      <span className="font-semibold text-stone-900">
                        {formattedQty}
                      </span>
                    )}
                    {ing.unit && (
                      <span className="text-stone-600 font-medium">
                        {ing.unit}
                      </span>
                    )}
                    <span className="text-stone-900 font-medium">
                      {ing.name}
                    </span>
                    {ing.note && (
                      <span className="text-stone-500 text-xs italic">
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
