"use client";

export default function Butterflies() {
  return (
    <div className="butterfly-layer">

      {/* Realistic butterfly atmosphere */}
      <div className="butterfly-photo-layer" />

      {/* Animated butterflies */}

      <div
        className="premium-butterfly-flight butterfly-one"
        style={
          {
            "--butterfly-drift": "180px",
            "--butterfly-rotate": "-8deg",
          } as React.CSSProperties
        }
      >
        <span className="premium-butterfly">
          <span className="butterfly-body" />
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
        </span>
      </div>

      <div
        className="premium-butterfly-flight butterfly-two"
        style={
          {
            "--butterfly-drift": "-220px",
            "--butterfly-rotate": "9deg",
          } as React.CSSProperties
        }
      >
        <span className="premium-butterfly">
          <span className="butterfly-body" />
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
        </span>
      </div>

      <div
        className="premium-butterfly-flight butterfly-three"
        style={
          {
            "--butterfly-drift": "250px",
            "--butterfly-rotate": "-12deg",
          } as React.CSSProperties
        }
      >
        <span className="premium-butterfly">
          <span className="butterfly-body" />
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
        </span>
      </div>

      <div
        className="premium-butterfly-flight butterfly-four"
        style={
          {
            "--butterfly-drift": "-160px",
            "--butterfly-rotate": "7deg",
          } as React.CSSProperties
        }
      >
        <span className="premium-butterfly">
          <span className="butterfly-body" />
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
        </span>
      </div>

      <div
        className="premium-butterfly-flight butterfly-five"
        style={
          {
            "--butterfly-drift": "120px",
            "--butterfly-rotate": "-5deg",
          } as React.CSSProperties
        }
      >
        <span className="premium-butterfly">
          <span className="butterfly-body" />
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
        </span>
      </div>

    </div>
  );
}