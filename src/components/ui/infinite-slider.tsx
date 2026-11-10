"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  speed?: number; // duration in seconds for one full loop
  speedOnHover?: number;
  reverse?: boolean;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
};

const STYLE_ID = "infinite-slider-interactive-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .no-scrollbar::-webkit-scrollbar {
      display: none !important;
    }
    .no-scrollbar {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
  `;
  document.head.appendChild(style);
}

export function InfiniteSlider({
  children,
  direction = "vertical",
  speed = 35,
  gap = 20,
  className,
  style,
}: InfiniteSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const firstSetRef = React.useRef<HTMLDivElement>(null);

  const [halfHeight, setHalfHeight] = React.useState(0);
  const halfHeightRef = React.useRef(0);
  halfHeightRef.current = halfHeight;

  // Interaction tracking refs
  const isInteractingRef = React.useRef(false);
  const isDraggingRef = React.useRef(false);
  const startYRef = React.useRef(0);
  const startScrollTopRef = React.useRef(0);
  const resumeTimerRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    ensureStyles();
  }, []);

  // Measure content height with ResizeObserver
  React.useEffect(() => {
    const el = firstSetRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight + gap;
      setHalfHeight(h);
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [gap, children]);

  // Pause interaction and resume after 2.5s of inactivity
  const markUserInteraction = React.useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
    }, 2400);
  }, []);

  // Animation Loop (requestAnimationFrame for 60/120fps smoothness)
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1); // delta in seconds
      lastTimeRef.current = now;

      const half = halfHeightRef.current;

      // Handle wraparound seamlessly at any time
      if (half > 0 && container) {
        if (container.scrollTop >= half) {
          container.scrollTop -= half;
        } else if (container.scrollTop <= 0 && isInteractingRef.current) {
          container.scrollTop += half;
        }
      }

      // Auto-scroll when user is not touching or hovering
      if (!isInteractingRef.current && half > 0 && container) {
        const pxPerSecond = Math.max(18, half / (speed || 35));
        container.scrollTop += pxPerSecond * dt;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [speed]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startScrollTopRef.current = container.scrollTop;
    markUserInteraction();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const dy = e.clientY - startYRef.current;
    containerRef.current.scrollTop = startScrollTopRef.current - dy;
    markUserInteraction();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={markUserInteraction}
      onTouchMove={markUserInteraction}
      onWheel={markUserInteraction}
      onMouseEnter={markUserInteraction}
      className={cn(
        "no-scrollbar relative h-full overflow-y-auto select-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch",
        ...style,
      }}
    >
      {/* Set 1 */}
      <div
        ref={firstSetRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
          paddingBottom: `${gap}px`,
        }}
      >
        {children}
      </div>

      {/* Set 2 (Duplicate for Seamless Infinite Loop) */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default InfiniteSlider;
