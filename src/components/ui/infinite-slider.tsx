"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  speed?: number; // duration in seconds for one full loop
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function InfiniteSlider({
  children,
  direction = "vertical",
  speed = 35,
  gap = 20,
  className,
  style,
}: InfiniteSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const firstSetRef = React.useRef<HTMLDivElement>(null);

  const [singleHeight, setSingleHeight] = React.useState(0);
  const singleHeightRef = React.useRef(0);
  singleHeightRef.current = singleHeight;

  // Transform offset in pixels
  const offsetRef = React.useRef(0);

  // Interaction tracking refs
  const isDraggingRef = React.useRef(false);
  const isInteractingRef = React.useRef(false);
  const startYRef = React.useRef(0);
  const startOffsetRef = React.useRef(0);
  const resumeTimerRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);

  // Measure content height with ResizeObserver
  React.useEffect(() => {
    const el = firstSetRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.offsetHeight + gap;
      if (h > 10) {
        setSingleHeight(h);
        singleHeightRef.current = h;
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });
    ro.observe(el);

    // Also update on window load/resize
    window.addEventListener("resize", updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [gap, children]);

  // Pause auto-scroll temporarily during manual drag/scroll and resume after 1s of inactivity
  const markManualInteraction = React.useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
    }, 1200);
  }, []);

  // Main continuous 60fps/120fps animation loop using GPU translate3d
  React.useEffect(() => {
    let animId: number;

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      let H = singleHeightRef.current;
      if (H <= 0 && firstSetRef.current) {
        H = firstSetRef.current.offsetHeight + gap;
        if (H > 0) {
          singleHeightRef.current = H;
        }
      }

      const track = trackRef.current;

      // Auto-scroll runs continuously! Only pauses when user is actively dragging or scrolling
      if (!isDraggingRef.current && !isInteractingRef.current && H > 0) {
        const pxPerSecond = Math.max(24, H / (speed || 35));
        offsetRef.current += pxPerSecond * dt;
      }

      // Wrap around seamlessly
      if (H > 0) {
        offsetRef.current = ((offsetRef.current % H) + H) % H;
      }

      // Apply GPU-accelerated translation
      if (track) {
        track.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [speed, gap]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startOffsetRef.current = offsetRef.current;
    markManualInteraction();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dy = e.clientY - startYRef.current;
    const H = singleHeightRef.current;
    offsetRef.current = startOffsetRef.current - dy;
    if (H > 0) {
      offsetRef.current = ((offsetRef.current % H) + H) % H;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
    }
    markManualInteraction();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    markManualInteraction();
  };

  // Touch Drag Handlers (Mobile Screen Swipe)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startYRef.current = e.touches[0].clientY;
    startOffsetRef.current = offsetRef.current;
    markManualInteraction();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dy = e.touches[0].clientY - startYRef.current;
    const H = singleHeightRef.current;
    offsetRef.current = startOffsetRef.current - dy;
    if (H > 0) {
      offsetRef.current = ((offsetRef.current % H) + H) % H;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
    }
    markManualInteraction();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    markManualInteraction();
  };

  // Mousewheel / Trackpad scroll handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const H = singleHeightRef.current;
    offsetRef.current += e.deltaY * 0.8;
    if (H > 0) {
      offsetRef.current = ((offsetRef.current % H) + H) % H;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(0, ${-offsetRef.current}px, 0)`;
    }
    markManualInteraction();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className={cn(
        "relative h-full overflow-hidden select-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        touchAction: "pan-y",
        ...style,
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${gap}px`,
          willChange: "transform",
        }}
      >
        {/* Set 1 */}
        <div
          ref={firstSetRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${gap}px`,
          }}
        >
          {children}
        </div>

        {/* Set 2 */}
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

        {/* Set 3 */}
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

        {/* Set 4 */}
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
    </div>
  );
}

export default InfiniteSlider;
