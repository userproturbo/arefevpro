"use client";

import { useEffect } from "react";

const PING_INTERVAL_MS = 35_000;

export default function AdminPresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    const ping = () => {
      if (cancelled) return;
      fetch("/api/presence/ping", {
        method: "POST",
        cache: "no-store",
        keepalive: true,
      }).catch(() => {});
    };

    ping();
    const timer = window.setInterval(ping, PING_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
