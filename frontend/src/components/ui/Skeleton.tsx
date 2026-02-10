import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      {...props}
    >
      <video
        src="/bouncing-loader.webm"
        autoPlay
        loop
        muted
        playsInline
        className="w-40 h-40"
      />
    </div>
  );
}
