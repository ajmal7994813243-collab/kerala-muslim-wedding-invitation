"use client";

import { useEffect, useRef, useState } from "react";

type ReelVideo = {
  id?: string;
  url: string;
  title?: string;
  caption?: string;
};

export default function ReelsGallery({
  videos,
}: {
  videos: ReelVideo[];
}) {
  const [activeId, setActiveId] = useState<string>("");
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = (visible.target as HTMLElement).dataset.reelId || "";
        setActiveId(id);

        Object.entries(refs.current).forEach(([key, video]) => {
          if (!video) return;

          if (key === id) {
            video.muted = true;
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: [0.65, 0.8, 0.95],
      }
    );

    const elements = document.querySelectorAll<HTMLElement>("[data-reel-id]");
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [videos]);

  if (!videos.length) return null;

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div
        className="h-[78vh] min-h-[520px] snap-y snap-mandatory overflow-y-auto rounded-[2rem] bg-[#12080b] p-3 shadow-[0_30px_90px_rgba(30,5,10,0.25)] md:p-5"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="space-y-4">
          {videos.map((video, index) => {
            const id = video.id || `${index}-${video.url}`;
            const isActive = activeId === id;

            return (
              <article
                key={id}
                data-reel-id={id}
                className="relative min-h-[72vh] snap-center overflow-hidden rounded-[1.6rem] bg-black"
              >
                <video
                  ref={(node) => {
                    refs.current[id] = node;
                  }}
                  src={video.url}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  controls
                  className="h-full min-h-[72vh] w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-6 pt-24 text-white">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/70">
                        REEL {String(index + 1).padStart(2, "0")}
                      </p>

                      {video.title && (
                        <h3 className="font-serif text-2xl">
                          {video.title}
                        </h3>
                      )}

                      {video.caption && (
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                          {video.caption}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                      {isActive ? "Playing" : "Swipe"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-stone-400">
        Swipe up to explore our reels
      </p>
    </div>
  );
}
