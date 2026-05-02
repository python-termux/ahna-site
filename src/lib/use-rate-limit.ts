"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useRateLimit() {
  const [retryAfter, setRetryAfter] = useState(0); // seconds remaining
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLimited = retryAfter > 0;

  // Start countdown from a given number of seconds
  const startCooldown = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRetryAfter(seconds);
    timerRef.current = setInterval(() => {
      setRetryAfter((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // Call this with a Response or json body when you get a 429
  const handle429 = useCallback((retryAfterSec: number) => {
    startCooldown(retryAfterSec > 0 ? retryAfterSec : 60);
  }, [startCooldown]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Formatted label: "59s" or "2m 3s"
  const label = retryAfter >= 60
    ? `${Math.floor(retryAfter / 60)}m ${retryAfter % 60}s`
    : `${retryAfter}s`;

  return { isLimited, retryAfter, label, handle429 };
}
