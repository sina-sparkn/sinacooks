export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm animate-pulse">
      <div className="h-48 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-stone-200 rounded-full" />
          <div className="h-5 w-14 bg-stone-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-stone-200 rounded" />
        <div className="h-4 w-full bg-stone-200 rounded" />
        <div className="h-4 w-2/3 bg-stone-200 rounded" />
        <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
          <div className="h-4 w-20 bg-stone-200 rounded" />
          <div className="h-4 w-16 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="h-96 bg-stone-200 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-10 w-2/3 bg-stone-200 rounded" />
        <div className="h-5 w-full bg-stone-200 rounded" />
        <div className="h-5 w-3/4 bg-stone-200 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-100 rounded-2xl">
        <div className="h-12 bg-stone-200 rounded-lg" />
        <div className="h-12 bg-stone-200 rounded-lg" />
        <div className="h-12 bg-stone-200 rounded-lg" />
        <div className="h-12 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}
