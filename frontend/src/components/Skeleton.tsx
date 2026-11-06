export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-stone-200/70 shadow-xs animate-pulse">
      <div className="aspect-4/3 bg-stone-200/80" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-stone-200 rounded-full" />
          <div className="h-4 w-14 bg-stone-200 rounded-full" />
        </div>
        <div className="h-7 w-3/4 bg-stone-200 rounded-lg" />
        <div className="h-4 w-full bg-stone-200 rounded" />
        <div className="h-4 w-2/3 bg-stone-200 rounded" />
        <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
          <div className="h-4 w-20 bg-stone-200 rounded" />
          <div className="h-4 w-16 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse pb-16">
      <div className="aspect-16/9 bg-stone-200/80 rounded-[36px]" />
      <div className="space-y-4">
        <div className="h-12 w-2/3 bg-stone-200 rounded-xl" />
        <div className="h-5 w-full bg-stone-200 rounded" />
        <div className="h-5 w-3/4 bg-stone-200 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="h-20 bg-stone-200/70 rounded-2xl" />
        <div className="h-20 bg-stone-200/70 rounded-2xl" />
        <div className="h-20 bg-stone-200/70 rounded-2xl" />
        <div className="h-20 bg-stone-200/70 rounded-2xl" />
      </div>
    </div>
  );
}
