import React from "react";

type Props = {
  index?: number;
};

const LoadingCard = ({ index = 0 }: Props) => {
  // Stagger animation delay based on index for visual interest
  const delay = (index % 6) * 100;

  return (
    <div
      className="rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title placeholder */}
        <div className="relative h-5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        {/* Price/info placeholder */}
        <div className="relative h-4 w-2/5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animationDelay: "100ms",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;
