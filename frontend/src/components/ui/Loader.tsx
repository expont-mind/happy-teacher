export default function Loader({
  variant = "video",
}: {
  variant?: "video" | "spinner";
}) {
  if (variant === "spinner") {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
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
