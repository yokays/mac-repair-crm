export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-40 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 h-64" />
    </div>
  );
}
