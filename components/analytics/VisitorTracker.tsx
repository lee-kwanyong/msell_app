"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/visitors/register", {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => {});

    return () => controller.abort();
  }, []);

  return null;
}