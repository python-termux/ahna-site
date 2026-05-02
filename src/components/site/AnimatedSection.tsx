"use client";

import InView from "@/components/InView";

export function FadeUp({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <InView animation="up" delay={delay} className={className}>
      {children}
    </InView>
  );
}

export function StaggerGrid({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((child, i) => (
        <InView key={i} animation="up" delay={i * 0.08}>
          {child}
        </InView>
      ))}
    </div>
  );
}

export function StaggerItem({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <InView animation="up" className={className}>
      {children}
    </InView>
  );
}

export function SlideDownHeader({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`anim-down ${className ?? ""}`}>
      {children}
    </div>
  );
}
