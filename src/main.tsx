import { createRoot } from "react-dom/client";
import App from "./App";
import OverlayShell, { shouldStartInOverlayMode } from "./overlay/OverlayShell";
import "./index.css";

const ensureMountNode = () => {
  const existingRoot = document.getElementById("root");
  if (existingRoot) {
    return existingRoot;
  }

  const mountNode = document.createElement("div");
  mountNode.id = "mainza-overlay-root";
  document.body.appendChild(mountNode);
  return mountNode;
};

const mountNode = ensureMountNode();

createRoot(mountNode).render(shouldStartInOverlayMode() ? <OverlayShell /> : <App />);
