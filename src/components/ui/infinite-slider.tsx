"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  speed?: number;
  speedOnHover?: number;
  reverse?: boolean;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
};

const STYLE_ID = "infinite-slider-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes infinite-slider-v {
      0% { transform: translateY(0%); }
      100% { transform: translateY(-50%); }
    }
    @keyframes infinite-slider-v-reverse {
      0% { transform: translateY(-50%); }
      100% { transform: translateY(0%); }
    }
    @keyframes infinite-slider-h {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    @keyframes infinite-slider-h-reverse {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0%); }
    }
    .infinite-slider-hover-pause:hover {
      animation-play-state: paused !important;
    }
  `;
  document.head.appendChild(style);
}

export function InfiniteSlider({
  children,
  direction = "horizontal",
  speed = 30,
  speedOnHover,
  reverse = false,
  gap = 24,
  className,
  style,
}: InfiniteSliderProps) {
  React.useEffect(() => {
    ensureStyles();
  }, []);

  const isVertical = direction === "vertical";
  const animName = isVertical
    ? reverse
      ? "infinite-slider-v-reverse"
      : "infinite-slider-v"
    : reverse
    ? "infinite-slider-h-reverse"
    : "infinite-slider-h";

  const duration = speed > 0 ? speed : 30;

  return (
    <div
      className={cn(
        "relative overflow-hidden select-none",
        isVertical ? "h-full flex flex-col" : "w-full flex flex-row",
        className
      )}
      style={style}
    >
      <div
        className="infinite-slider-hover-pause"
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          gap: `${gap}px`,
          width: isVertical ? "100%" : "max-content",
          height: isVertical ? "max-content" : "100%",
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            gap: `${gap}px`,
          }}
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            gap: `${gap}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default InfiniteSlider;
