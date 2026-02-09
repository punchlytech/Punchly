export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Header skeleton */}
      <div className="h-16 bg-[#0B3C5D]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white border border-[#E1E6EB] rounded-lg">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Action cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-white border border-[#E1E6EB] rounded-lg">
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse mb-4" />
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
