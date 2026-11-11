import * as React from "react";
import { cn } from "../../lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex overflow-hidden p-2 [--duration:28s] [--gap:1.5rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        pauseOnHover ? "kiprah-marquee-group" : "",
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical
              ? "animate-kiprah-marquee-vertical flex-col"
              : "animate-kiprah-marquee flex-row"
          )}
          style={{
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
