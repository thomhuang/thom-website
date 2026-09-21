import { useEffect, useState } from "react";

import { FRAME_DELAYS, IDLE, IDLE_SEQUENCES, type AsciiVariant } from "./frames";
import styles from "./AsciiFigure.module.css";

type Props = {
  variant?: AsciiVariant;
  size?: "default" | "large";
};

export default function AsciiFigure({ variant = "home", size = "default" }: Props) {
  const [hovered, setHovered] = useState(false);
  const [frame, setFrame] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);

  // The sprite is alive by default: the home figure flaps its arms while the
  // others idle. Hovering freezes it in place.
  const sequence = IDLE_SEQUENCES[variant];
  const delay = FRAME_DELAYS[variant];

  useEffect(() => {
    if (hovered) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setMotionEnabled(true);
    const id = window.setInterval(
      () => setFrame((current) => current + 1),
      delay,
    );
    return () => window.clearInterval(id);
  }, [hovered, delay]);

  return (
    <pre
      aria-hidden="true"
      className={[styles.figure, size === "large" ? styles.large : ""].join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setFrame(0);
      }}
    >
      {motionEnabled ? sequence[frame % sequence.length] : IDLE[variant]}
    </pre>
  );
}
