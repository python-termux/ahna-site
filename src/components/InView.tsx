"use client";

import { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animation?: "up" | "in" | "down";
  delay?: number;
  margin?: string;
}

export default function InView({
  children,
  className = "",
  style,
  animation = "up",
  delay = 0,
  margin = "-60px 0px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("seen");
          obs.disconnect();
        }
      },
      { rootMargin: margin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);

  const animClass = `anim-${animation}`;

  return (
    <div
      ref={ref}
      className={`inview ${animClass} ${className}`}
      style={delay ? { animationDelay: `${delay}s`, ...style } : style}
    >
      {children}
    </div>
  );
}
