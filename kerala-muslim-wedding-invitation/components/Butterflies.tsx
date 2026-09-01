"use client";

import { useEffect, useMemo, useState } from "react";

type Butterfly = {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
};

function createButterflies(count: number): Butterfly[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${8 + ((index * 17) % 84)}%`,
    top: `${10 + ((index * 29) % 72)}%`,
    size: 15 + ((index * 11) % 14),
    duration: 11 + ((index * 7) % 9),
    delay: (index * 1.7) % 10,
    drift: 25 + ((index * 19) % 55),
    rotate: -8 + ((index * 13) % 17),
  }));
}

export default function Butterflies() {
  const [visible, setVisible] = useState(true);

  const butterflies = useMemo(() => createButterflies(7), []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="butterfly-layer"
      aria-hidden="true"
    >
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="premium-butterfly-flight"
          style={{
            left: butterfly.left,
            top: butterfly.top,
            animationDuration: `${butterfly.duration}s`,
            animationDelay: `${butterfly.delay}s`,
            "--butterfly-drift": `${butterfly.drift}px`,
            "--butterfly-rotate": `${butterfly.rotate}deg`,
          } as React.CSSProperties}
        >
          <div
            className="premium-butterfly"
            style={{
              width: `${butterfly.size}px`,
              height: `${butterfly.size * 0.82}px`,
            }}
          >
            <span className="butterfly-wing butterfly-wing-left" />
            <span className="butterfly-body" />
            <span className="butterfly-wing butterfly-wing-right" />
          </div>
        </div>
      ))}
    </div>
  );
}
