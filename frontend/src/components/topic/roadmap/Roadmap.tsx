"use client";

import { Check, Lock, Star, BookOpen } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";

export type RoadmapItem = {
  id: string;
  title: string;
};

interface RoadmapProps {
  topicKey: string;
  items: RoadmapItem[];
}

export default function Roadmap({ topicKey, items }: RoadmapProps) {
  const { getCompletedLessons } = useAuth();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const loadCompletedLessons = async () => {
      const completed = await getCompletedLessons(topicKey);
      setCompletedIds(completed);
    };
    loadCompletedLessons();
  }, [topicKey, getCompletedLessons]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width
    updateWidth();

    // Watch for resizes
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const canEnter = (index: number) => {
    if (index === 0) return true;
    const prevId = items[index - 1]?.id;
    return completedIds.includes(prevId);
  };

  const progressPercent = useMemo(() => {
    if (items.length === 0) return 0;
    const done = items.filter((i) => completedIds.includes(i.id)).length;
    return Math.round((done / items.length) * 100);
  }, [completedIds, items]);

  // Calculate card positions - 3-column zigzag flow
  const cardPositions = useMemo(() => {
    return items.map((_, idx) => {
      // Alternate between Center (50%), Left (20%), Center (50%), Right (80%)
      const patterns = [50, 20, 50, 80];
      const x = patterns[idx % patterns.length];

      // Calculate Y position (downward flow)
      const rowHeight = 180; // Increased for better spacing
      const y = 80 + idx * rowHeight;

      return { x, y };
    });
  }, [items]);

  // Calculate total height for container
  const containerHeight = useMemo(() => {
    if (items.length === 0) return 400;
    return items.length * 180 + 200;
  }, [items.length]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="sticky top-20 z-50 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Таны явц
          </span>
          <span className="text-sm font-black text-(--duo-green)">
            {progressPercent}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-(--duo-green) transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Roadmap Container */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: `${containerHeight}px` }}
      >
        {/* Path SVG */}
        {containerWidth > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          >
            {items.map((_, idx) => {
              if (idx === 0) return null;
              const current = cardPositions[idx];
              const prev = cardPositions[idx - 1];

              const prevCompleted = completedIds.includes(items[idx - 1]?.id);

              // Convert percentage X to pixels for perfect circular radii
              const prevX = (prev.x / 100) * containerWidth;
              const currX = (current.x / 100) * containerWidth;

              // Orthogonal path with rounded corners
              const midY = prev.y + (current.y - prev.y) / 2;
              const radius = 20; // Corner radius in pixels
              const direction = currX > prevX ? 1 : -1;
              const dist = Math.abs(currX - prevX);

              // Ensure radius isn't larger than half the distance
              const safeRadius = Math.min(radius, dist / 2);

              // Construct path: Vertical -> Turn -> Horizontal -> Turn -> Vertical
              let d = "";
              if (dist < 2) {
                // Straight line if vertically aligned
                d = `M ${prevX} ${prev.y} L ${currX} ${current.y}`;
              } else {
                d = `
                M ${prevX} ${prev.y}
                L ${prevX} ${midY - safeRadius}
                Q ${prevX} ${midY} ${prevX + direction * safeRadius} ${midY}
                L ${currX - direction * safeRadius} ${midY}
                Q ${currX} ${midY} ${currX} ${midY + safeRadius}
                L ${currX} ${current.y}
              `;
              }

              return (
                <g key={`path-${idx}`}>
                  {/* Background Path (Road) */}
                  <path
                    d={d}
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="15 15"
                    className="opacity-80"
                    strokeLinejoin="round"
                  />
                  {/* Progress Path (Colored) */}
                  {prevCompleted && (
                    <path
                      d={d}
                      stroke="var(--duo-green)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-1000"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Lessons */}
        <div className="relative" style={{ zIndex: 1 }}>
          {items.map((item, idx) => {
            const unlocked = canEnter(idx);
            const done = completedIds.includes(item.id);
            const isCurrent = unlocked && !done;
            const position = cardPositions[idx];

            return (
              <div
                key={item.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}px`,
                }}
              >
                <a
                  href={unlocked ? `/topic/${topicKey}/${item.id}` : undefined}
                  className={`relative transition-transform duration-200 ${
                    unlocked
                      ? "active:scale-95 cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  {/* Tooltip / Title Bubble */}
                  <div
                    className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-xl bg-white border-2 border-gray-100 shadow-sm transition-all duration-300 ${
                      isCurrent
                        ? "opacity-100 -translate-y-2"
                        : "opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:-translate-y-2"
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-700">
                      {item.title}
                    </span>
                    {/* Triangle pointer */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-100 rotate-45"></div>
                  </div>

                  {/* Node - Rounded Square (Squircle) */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center border-b-4 transition-all duration-300 ${
                      done
                        ? "bg-(--duo-green) border-(--duo-green-dark)"
                        : isCurrent
                        ? "bg-(--duo-blue) border-(--duo-blue-dark) animate-float"
                        : "bg-gray-200 border-gray-300"
                    }`}
                  >
                    {done ? (
                      <Check size={32} className="text-white" strokeWidth={4} />
                    ) : isCurrent ? (
                      <Star
                        size={32}
                        className="text-white fill-white"
                        strokeWidth={2}
                      />
                    ) : unlocked ? (
                      <BookOpen
                        size={28}
                        className="text-gray-400"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Lock
                        size={24}
                        className="text-gray-400"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  {/* Stars / Rating (Optional decoration) */}
                  {done && (
                    <div className="absolute -right-2 -bottom-4 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className="text-(--duo-yellow) fill-(--duo-yellow)"
                        />
                      ))}
                    </div>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
