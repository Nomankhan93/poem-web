"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("POEM global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            background: "#f7f4ec",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              padding: "32px",
              borderRadius: "24px",
              background: "white",
              textAlign: "center",
            }}
          >
            <h1>POEM could not load this page.</h1>
            <p>
              A temporary application error occurred. Please try
              again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "16px",
                padding: "12px 20px",
                border: 0,
                borderRadius: "999px",
                background: "#082b21",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
