import Skeleton from "@/src/components/ui/Skeleton";

export default function TopicSkeleton() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Info Card Skeleton */}
          <div className="bg-white rounded-[16px] border-2 border-[#0C0A0126] p-5 flex flex-col gap-6 lg:sticky lg:top-[125px]">
            {/* Video Placeholder */}
            <Skeleton className="aspect-video w-full rounded-2xl" />

            {/* Icon */}
            <Skeleton className="w-16 h-16 rounded-md" />

            <div className="flex flex-col gap-[10px]">
              {/* Title */}
              <Skeleton className="h-8 w-3/4 rounded-md" />
              {/* Description */}
              <Skeleton className="h-6 w-full rounded-md" />
              <Skeleton className="h-6 w-2/3 rounded-md" />

              {/* Stats */}
              <div className="flex gap-[10px] mt-2">
                <Skeleton className="h-7 w-24 rounded-[10px]" />
                <Skeleton className="h-7 w-24 rounded-[10px]" />
              </div>
            </div>

            {/* Bottom Button/Progress */}
            <Skeleton className="h-12 w-full rounded-2xl mt-2" />
          </div>

          {/* Right Column - Roadmap Skeleton */}
          <div className="flex flex-col items-center pt-10 w-full">
            {/* Header */}
            <Skeleton className="h-[61px] w-60 rounded-[16px] mb-9" />

            {/* List Items */}
            <div className="flex flex-col items-center w-full max-w-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                    <Skeleton className="h-5 w-32 rounded-md" />
                  </div>
                  {i !== 5 && (
                    <div className="w-0.5 h-16 border-l-2 border-dashed border-gray-200 my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
