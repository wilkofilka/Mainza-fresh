import { useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { EmbeddedMainza } from "@/App";

interface OverlayConfig {
  defaultOpen?: boolean;
  zIndex?: number;
  title?: string;
}

declare global {
  interface Window {
    MAINZA_OVERLAY_CONFIG?: OverlayConfig;
  }
}

export const shouldStartInOverlayMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("mainzaOverlay") === "1" || Boolean(window.MAINZA_OVERLAY_CONFIG);
};

const OverlayShell = () => {
  const config = window.MAINZA_OVERLAY_CONFIG;
  const [open, setOpen] = useState(config?.defaultOpen ?? false);

  const zIndex = config?.zIndex ?? 9999;
  const title = useMemo(() => config?.title ?? "Mainza Overlay", [config?.title]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          pointerEvents: "auto",
          borderRadius: "999px",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          background: "linear-gradient(135deg, #1f2937, #111827)",
          color: "#f9fafb",
          padding: "0.75rem 1rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.4)",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
        {open ? "Zamknij" : title}
      </button>

      {open ? (
        <section
          style={{
            position: "fixed",
            inset: "4rem 1.5rem 5.5rem 1.5rem",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            overflow: "hidden",
            pointerEvents: "auto",
            boxShadow: "0 30px 90px rgba(0, 0, 0, 0.45)",
            background: "#020617"
          }}
        >
          <EmbeddedMainza />
        </section>
      ) : null}
    </div>
  );
};

export default OverlayShell;
