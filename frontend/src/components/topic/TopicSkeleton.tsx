export default function TopicSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
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
