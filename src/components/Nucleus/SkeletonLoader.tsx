export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Executive Summary Skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-slate-200/80 rounded-md w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded-md w-full"></div>
        <div className="h-4 bg-slate-100 rounded-md w-11/12"></div>
        <div className="h-4 bg-slate-100 rounded-md w-4/5"></div>
      </div>

      <hr className="border-slate-100" />

      {/* Highlights / Bullet points Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-200/80 rounded-md w-1/4"></div>
        <div className="flex items-start space-x-3">
          <div className="h-2 w-2 bg-slate-300 rounded-full mt-1.5 shrink-0"></div>
          <div className="h-4 bg-slate-100 rounded-md w-11/12"></div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-2 w-2 bg-slate-300 rounded-full mt-1.5 shrink-0"></div>
          <div className="h-4 bg-slate-100 rounded-md w-10/12"></div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="h-2 w-2 bg-slate-300 rounded-full mt-1.5 shrink-0"></div>
          <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Structural Breakdown / Table Skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-slate-200/80 rounded-md w-1/3"></div>
        <div className="border border-slate-100 rounded-xl overflow-hidden mt-3">
          <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4">
            <div className="h-3 bg-slate-200 rounded w-1/4 mr-4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 bg-slate-100 rounded w-1/5"></div>
              <div className="h-3 bg-slate-100 rounded w-3/5"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-slate-100 rounded w-1/5"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
