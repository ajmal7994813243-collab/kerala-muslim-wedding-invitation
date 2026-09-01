"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownProps = {
  date?: string;
  time?: string;
};

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function parseTarget(date?: string, time?: string) {
  if (!date) return null;

  const match = date.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);

  let hours = 0;
  let minutes = 0;

  if (time) {
    const timeMatch = time.match(
      /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
    );

    if (timeMatch) {
      hours = Number(timeMatch[1]);
      minutes = Number(timeMatch[2] || 0);

      const meridiem = (timeMatch[3] || "").toLowerCase();

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0);
}

function getRemaining(target: Date): Remaining {
  const difference = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const fillHearts = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${6 + ((index * 37) % 88)}%`,
  bottom: `${5 + ((index * 23) % 78)}%`,
  size: `${7 + ((index * 13) % 8)}px`,
  delay: `${(index * 0.075) % 3.2}s`,
}));

const rainHearts = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${2 + ((index * 31) % 96)}%`,
  delay: `${(index * 0.33) % 7}s`,
  duration: `${4.8 + ((index * 17) % 34) / 10}s`,
  size: `${6 + ((index * 11) % 8)}px`,
}));

const burstHearts = Array.from({ length: 36 }, (_, index) => {
  const angle = (index / 36) * Math.PI * 2;
  const radius = 135 + ((index * 29) % 95);

  return {
    id: index,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    delay: `${(index % 6) * 0.018}s`,
    size: `${8 + ((index * 7) % 10)}px`,
    rotation: `${-30 + ((index * 19) % 60)}deg`,
  };
});

export default function Countdown({ date, time }: CountdownProps) {
  const target = useMemo(() => parseTarget(date, time), [date, time]);

  const [remaining, setRemaining] = useState<Remaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!target) return;

    const update = () => {
      setRemaining(getRemaining(target));
    };

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [target]);

  /*
    The visual cycle is independent of the actual countdown:
    hearts collect → card becomes full → big heart blast →
    reset → collect again.
  */
  useEffect(() => {
    const start = window.setTimeout(() => {
      setBurst(true);

      window.setTimeout(() => {
        setBurst(false);
      }, 1350);
    }, 10800);

    const cycle = window.setInterval(() => {
      setBurst(true);

      window.setTimeout(() => {
        setBurst(false);
      }, 1350);
    }, 14500);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(cycle);
    };
  }, []);

  if (!target) return null;

  const values = [
    ["days", remaining.days],
    ["hours", remaining.hours],
    ["minutes", remaining.minutes],
    ["seconds", remaining.seconds],
  ] as const;

  return (
    <section className="lux-countdown" aria-label="Wedding countdown">
      <div className="lux-countdown-glow" />

      <div className="lux-heart-rain" aria-hidden="true">
        {rainHearts.map((heart) => (
          <span
            key={heart.id}
            className="lux-falling-heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              fontSize: heart.size,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div className="lux-countdown-inner">
        <div className="lux-ornament" aria-hidden="true">
          <span />
          <b>✦</b>
          <span />
        </div>

        <p className="lux-eyebrow">THE BIG DAY IS GETTING CLOSER</p>

        <h2 className="lux-title">Counting the moments</h2>

        <div className="lux-countdown-grid">
          {values.map(([label, value], index) => (
            <div
              className="lux-time-group"
              key={label}
            >
              <div
                className={`lux-time-box ${
                  mounted ? "lux-time-pulse" : ""
                }`}
              >
                <span className="lux-time-number">
                  {String(value).padStart(2, "0")}
                </span>

                <span className="lux-time-label">
                  {label.toUpperCase()}
                </span>
              </div>

              {index < values.length - 1 && (
                <span className="lux-colon">:</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lux-heart-rain lux-heart-rain-lower" aria-hidden="true">
        {rainHearts.slice(0, 22).map((heart, index) => (
          <span
            key={`lower-${heart.id}`}
            className="lux-falling-heart lux-falling-heart-lower"
            style={{
              left: `${4 + ((index * 43) % 92)}%`,
              animationDelay: `${1.2 + ((index * 0.27) % 6)}s`,
              animationDuration: `${4.5 + ((index * 0.21) % 3)}s`,
              fontSize: `${6 + ((index * 5) % 8)}px`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div
        className={`lux-date-target-wrap ${
          burst ? "is-bursting" : ""
        }`}
      >
        <div className="lux-date-target">
          <div className="lux-date-fill" aria-hidden="true">
            {fillHearts.map((heart) => (
              <span
                key={heart.id}
                className="lux-fill-heart"
                style={{
                  left: heart.left,
                  bottom: heart.bottom,
                  fontSize: heart.size,
                  animationDelay: heart.delay,
                }}
              >
                ♥
              </span>
            ))}
          </div>

          <div className="lux-date-heart" aria-hidden="true">
            ♥
          </div>

          <span className="lux-date-label">OUR SPECIAL DAY</span>

          <strong>{date}</strong>

          {time && <em>{time}</em>}
        </div>

        <div className="lux-blast" aria-hidden="true">
          {burstHearts.map((heart) => (
            <span
              key={heart.id}
              className="lux-blast-heart"
              style={{
                "--x": `${heart.x}px`,
                "--y": `${heart.y}px`,
                "--delay": heart.delay,
                fontSize: heart.size,
                rotate: heart.rotation,
              } as React.CSSProperties}
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      <div className="lux-bottom-ornament" aria-hidden="true">
        <span />
        <b>♥</b>
        <span />
      </div>
    </section>
  );
}
