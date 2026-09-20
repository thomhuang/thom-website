import { useEffect, useState } from "react";

import { IDLE, IDLE_SEQUENCES, type AsciiVariant } from "./frames";
import styles from "./AsciiFigure.module.css";

type Props = {
  variant?: AsciiVariant;
  size?: "default" | "large";
};

const DEFAULT_DELAY_MS = 250;

export default function AsciiFigure({ variant = "home", size = "default" }: Props) {
  const [hovered, setHovered] = useState(false);
  const [frame, setFrame] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);

  // The sprite is alive by default: its accessory floats around while it
  // tracks and blinks. Hovering freezes it in place.
  const sequence = IDLE_SEQUENCES[variant];
  const delay = DEFAULT_DELAY_MS;

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
