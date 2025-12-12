export default function ParticipantCardSkeleton() {
  return (
    <div className="p-4 flex flex-col sm:flex-row items-left justify-between sm:items-center bg-gray-100 animate-pulse">
      <div className="flex-1 space-y-2">
        {/* Identifier skeleton */}
        <div className="h-5 bg-gray-300 rounded w-32"></div>
        {/* Name skeleton */}
        <div className="h-4 bg-gray-300 rounded w-48"></div>
        {/* Badges skeleton */}
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-16 bg-gray-300 rounded"></div>
          <div className="h-6 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        {/* Button skeletons */}
        <div className="h-9 w-24 bg-gray-300 rounded"></div>
        <div className="h-9 w-24 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
