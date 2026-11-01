export function PostCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="skeleton w-7 h-7 rounded-full" />
            <div>
              <div className="skeleton h-3 w-20 mb-1" />
              <div className="skeleton h-3 w-14" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-3 w-8" />
            <div className="skeleton h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="skeleton h-10 w-3/4 mb-4" />
      <div className="skeleton h-6 w-1/2 mb-8" />
      <div className="skeleton h-72 w-full rounded-2xl mb-8" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-4 w-full" style={{ width: `${Math.random() * 30 + 70}%` }} />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </div>
  );
}
