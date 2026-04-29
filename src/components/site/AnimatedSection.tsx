"use client";

import { motion } from "framer-motion";

const VIEWPORT = { once: true, margin: "-80px" };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

/** Wraps any element in a scroll-triggered fade-up */
export function FadeUp({ children, delay = 0, className }: {
  children: React.ReactNode; delay?: number; className?: string;
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

/** Stagger container for grid/list children */
export function StaggerGrid({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <motion.div
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Each child in a StaggerGrid */
export function StaggerItem({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4, transition: { duration: 0.2 } }} className={className}>
      {children}
    </motion.div>
  );
}

/** Header slide-down */
export function SlideDownHeader({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
