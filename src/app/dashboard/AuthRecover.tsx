"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Rendered when the dashboard server render found no session. On mobile the
// auth cookies can be committed a moment AFTER navigation, so the first server
// render misses them. Here we check the client session (reliable) and reload
// once with ?r=1 so the server picks up the now-committed cookies. If there's
// genuinely no session, we go to login. Bounded to a single retry — no loop.
export default function AuthRecover() {
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          window.location.replace("/dashboard?r=1");
          return;
        }
      } catch {
        // fall through to login
      }
      window.location.replace("/auth/login");
    })();
  }, []);

  return <div className="min-h-screen bg-background" />;
}
