"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, fadeIn, fadeDown, scaleIn, stagger, heroStagger, VIEWPORT } from "@/lib/motion";
export { AnimatePresence };

// ── Generic wrappers ──────────────────────────────────────────────────────────

/** Fades up on scroll-into-view */
export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Fades in on scroll */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — children animate sequentially */
export function StaggerList({
  children,
  delay = 0.08,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={stagger(delay)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Single child inside a StaggerList */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/** Scale + fade on mount (good for cards/modals) */
export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Slides down from top on mount */
export function SlideDown({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeDown}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Full page fade-in wrapper */
export function PageFade({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Hero section sequential stagger */
export function HeroStagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={heroStagger}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual hero item */
export function HeroItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/** Card with hover lift */
export function HoverCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated counter number */
export function AnimatedNumber({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {value}
    </motion.span>
  );
}
