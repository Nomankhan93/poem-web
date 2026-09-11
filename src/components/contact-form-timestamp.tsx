"use client";

import { useEffect, useRef } from "react";

export function ContactFormTimestamp() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = String(Date.now());
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="hidden"
      name="formStartedAt"
      defaultValue=""
    />
  );
}
