"use client";

import { ReactNode, useEffect, useState } from "react";

type InvitationOpeningProps = {
  groomName?: string;
  brideName?: string;
  children: ReactNode;
};

export default function InvitationOpening({
  groomName = "AJMAL",
  brideName = "IRFANA",
  children,
}: InvitationOpeningProps) {
  const [opened, setOpened] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = "hidden";
      return;
    }

    const timer = window.setTimeout(() => {
      setFinished(true);
      document.body.style.overflow = "";
    }, 3100);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [opened]);

  if (finished) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`opening-final ${opened ? "opening-final-opened" : ""}`}
        onClick={() => !opened && setOpened(true)}
        role="button"
        tabIndex={0}
        aria-label="Open wedding invitation"
        onKeyDown={(e) => {
          if (!opened && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpened(true);
          }
        }}
      >
        <div className="opening-final-stars" aria-hidden="true">
          <i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i>
        </div>

        <div className="opening-final-content">
          <div className="opening-final-arabic">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>

          <div className="opening-final-subtitle">
            WITH THE BLESSINGS OF ALLAH
          </div>

          <div className="opening-final-envelope">
            <div className="opening-final-shadow" />

            <div className="opening-final-envelope-body">
              {/* Completely closed envelope on first view */}
              <div className="opening-final-back" />

              {/* Card stays hidden behind the envelope until tap */}
              <div className="opening-final-card">
                <div className="opening-final-card-border" />

                <div className="opening-final-card-arabic">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </div>

                <div className="opening-final-rose" aria-hidden="true">
                  <span>✿</span>
                </div>

                <div className="opening-final-names">
                  <strong>{groomName}</strong>
                  <b>&amp;</b>
                  <strong>{brideName}</strong>
                </div>

                <small>WITH THEIR FAMILIES</small>
              </div>

              <div className="opening-final-fold-left" />
              <div className="opening-final-fold-right" />
              <div className="opening-final-fold-bottom" />

              <div className="opening-final-flap">
                <div className="opening-final-flap-line" />
              </div>

              {/* ONLY visible seal before opening */}
              <div className="opening-final-seal">
                <div className="opening-final-seal-outer">
                  <div className="opening-final-seal-inner">
                    <span>♥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="opening-final-hint">
            {opened ? "OPENING YOUR INVITATION" : "TAP THE HEART TO OPEN"}
          </div>

          <div className="opening-final-divider">
            <span />
            <b>♥</b>
            <span />
          </div>
        </div>

        {/* Reveal names only after tapping */}
        <div className="opening-final-reveal" aria-hidden="true">
          <span>{groomName}</span>
          <b>&amp;</b>
          <span>{brideName}</span>
        </div>
      </div>

      <div className="opening-final-page-behind">{children}</div>
    </>
  );
}
