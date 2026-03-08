export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 bg-gray-200 rounded-lg" />
        <div>
          <div className="h-7 w-56 bg-gray-200 rounded-lg" />
          <div className="h-4 w-32 bg-gray-100 rounded mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-48" />
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-32" />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-56" />
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-40" />
        </div>
      </div>
    </div>
  );
}
