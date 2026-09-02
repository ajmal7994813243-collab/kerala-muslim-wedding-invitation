import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import Countdown from "../../../components/Countdown";
import InvitationOpening from "../../../components/InvitationOpening";
import Butterflies from "../../../components/Butterflies";
import ReelsGallery from "../../../components/ReelsGallery";

export const dynamic = "force-dynamic";

export default async function Invitation({
  params,
}: {
  params: { token: string };
}) {
  const db = adminDb();

  const qs = await db
    .collection("invitations")
    .where("token", "==", params.token)
    .limit(1)
    .get();

  if (qs.empty) return notFound();

  const invitationDoc = qs.docs[0];
  const invitation = invitationDoc.data();

  if (invitation.status !== "active") {
    return (
      <main className="min-h-screen bg-[#16090d] text-white grid place-items-center p-8">
        <div className="text-center">
          <div className="arabic text-5xl">السلام عليكم</div>
          <h1 className="mt-6 text-2xl font-serif">
            Invitation unavailable
          </h1>
        </div>
      </main>
    );
  }

  const [guestSnap, versionSnap] = await Promise.all([
    db.collection("guests").doc(invitation.guestId).get(),

    db
      .collection("weddings")
      .doc(invitation.weddingId)
      .collection("versions")
      .doc(invitation.versionId)
      .get(),
  ]);

  if (!guestSnap.exists || !versionSnap.exists) {
    return notFound();
  }

  const guest = guestSnap.data()!;
  const wedding = versionSnap.data()!;

  await invitationDoc.ref.update({
    openCount: (invitation.openCount || 0) + 1,
    lastOpenedAt: Timestamp.now(),
  });

  const photos = [...(wedding.photos || [])].sort(
    (a: any, b: any) => a.order - b.order
  );

  const videos = [...(wedding.videos || [])].sort(
    (a: any, b: any) => a.order - b.order
  );

  const events = [...(wedding.events || [])].sort(
    (a: any, b: any) => a.order - b.order
  );

  return (
    <InvitationOpening
      groomName={wedding.groomName || "AJMAL"}
      brideName={wedding.brideName || "IRFANA"}
    >
      <Butterflies />
      
      <main className="royal-invitation">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="royal-hero">

        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />

        <div className="hero-content">

          <div className="crescent-mark">
            ☾
          </div>

          <p className="hero-kicker">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          <div className="hero-arabic arabic">
            السلام عليكم
          </div>

          <div className="hero-divider">
            <span />
            <b>✦</b>
            <span />
          </div>

          <p className="hero-small">
            YOU ARE WARMLY INVITED
          </p>

          <h1 className="guest-reveal">
            {guest.name}
          </h1>

          <p className="hero-message">
            {guest.customGreeting ||
              wedding.openingMessage ||
              "With the blessings of Allah and the love of our families, we invite you to share in the joy of our special day."}
          </p>

          <div className="scroll-indicator">
            <span>SCROLL TO EXPLORE</span>
            <i>↓</i>
          </div>

        </div>
      </section>


      {/* =====================================================
          COUPLE
      ===================================================== */}

      <section className="couple-section">

        <div className="section-heading reveal-up">
          <p>WITH THE BLESSINGS OF OUR FAMILIES</p>
          <h2>A New Chapter Begins</h2>
        </div>

        <div className="couple-names">

          <div className="person-name reveal-left">
            <span className="name-label">GROOM</span>

            <h3>
              {wedding.groomName}
            </h3>

            <div className="name-line" />
          </div>

          <div className="ampersand reveal-up">
            <span>✦</span>
            <b>&</b>
            <span>✦</span>
          </div>

          <div className="person-name reveal-right">
            <span className="name-label">BRIDE</span>

            <h3>
              {wedding.brideName}
            </h3>

            <div className="name-line" />
          </div>

        </div>

       {wedding.date && (
  <>
    <div className="date-card reveal-up">

      <span>THE DAY</span>

      <strong>
        {wedding.date}
      </strong>

      {wedding.time && (
        <em>
          {wedding.time}
        </em>
      )}

    </div>

    <Countdown
      date={wedding.date}
      time={wedding.time}
    />
  </>
)}

      </section>


     {/* =====================================================
    THE FAMILIES
===================================================== */}

{(
  wedding.groomFather ||
  wedding.groomMother ||
  wedding.brideFather ||
  wedding.brideMother ||
  wedding.groomParents ||
  wedding.brideParents
) && (
  <section className="families-section">

    <div className="families-heading reveal-up">

      <div className="families-ornament">
        <span />
        <b>✦</b>
        <span />
      </div>

      <p>WITH THEIR FAMILIES</p>

      <h2>The Families</h2>

      <div className="families-subline">
        <i />
        <span>✧</span>
        <i />
      </div>

    </div>

    <div className="families-grid">

      {/* GROOM FAMILY */}

      <div className="family-column reveal-left">

        <span className="family-side-label">
          GROOM&apos;S FAMILY
        </span>

        <div className="family-names">

          {wedding.groomFather && (
            <h3>{wedding.groomFather}</h3>
          )}

          {wedding.groomMother && (
            <p>{wedding.groomMother}</p>
          )}

          {wedding.groomParents && (
            <small>{wedding.groomParents}</small>
          )}

        </div>

        <div className="family-bottom-ornament">
          ✦
        </div>

      </div>


      {/* CENTER ORNAMENT */}

      <div className="families-center-divider">

        <span />

        <b>❦</b>

        <span />

      </div>


      {/* BRIDE FAMILY */}

      <div className="family-column reveal-right">

        <span className="family-side-label">
          BRIDE&apos;S FAMILY
        </span>

        <div className="family-names">

          {wedding.brideFather && (
            <h3>{wedding.brideFather}</h3>
          )}

          {wedding.brideMother && (
            <p>{wedding.brideMother}</p>
          )}

          {wedding.brideParents && (
            <small>{wedding.brideParents}</small>
          )}

        </div>

        <div className="family-bottom-ornament">
          ✦
        </div>

      </div>

    </div>

  </section>
)}


      {/* =====================================================
          EVENTS
      ===================================================== */}

      {events.length > 0 && (

        <section className="events-section">

          <div className="section-heading reveal-up">

            <p>MARK YOUR CALENDAR</p>

            <h2>
              The Celebrations
            </h2>

          </div>

          <div className="timeline">

            {events.map((event: any, index: number) => (

              <div
                key={event.id}
                className={`timeline-item ${
                  index % 2 === 0
                    ? "reveal-left"
                    : "reveal-right"
                }`}
              >

                <div className="timeline-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="timeline-content">

                  <span>
                    {event.date}
                    {event.time && ` · ${event.time}`}
                  </span>

                  <h3>
                    {event.name}
                  </h3>

                  {event.venue && (
                    <p>
                      {event.venue}
                    </p>
                  )}

                  {event.address && (
                    <small>
                      {event.address}
                    </small>
                  )}

                  {event.description && (
                    <p className="event-description">
                      {event.description}
                    </p>
                  )}

                </div>

              </div>

            ))}

          </div>

        </section>
      )}


      {/* =====================================================
          PHOTO GALLERY
      ===================================================== */}

      {photos.length > 0 && (

        <section className="gallery-section">

          <div className="section-heading reveal-up">

            <p>A GLIMPSE OF OUR JOURNEY</p>

            <h2>
              Beautiful Moments
            </h2>

          </div>

          <div className="gallery-grid">

            {photos.map((photo: any, index: number) => (

              <figure
                key={photo.id}
                className={`gallery-item gallery-${index % 4}`}
              >

                <img
                  src={photo.url}
                  alt={
                    photo.caption ||
                    "Wedding memory"
                  }
                />

                <div className="gallery-overlay">

                  <span>
                    ✦
                  </span>

                  {photo.caption && (
                    <p>
                      {photo.caption}
                    </p>
                  )}

                </div>

              </figure>

            ))}

          </div>

        </section>
      )}


          
     {/* =====================================================
    VIDEOS / REELS
===================================================== */}

{videos.length > 0 && (

  <section className="video-section">

    <div className="section-heading light reveal-up">

      <p>MOVING MEMORIES</p>

      <h2>
        Our Story
      </h2>

    </div>

    <ReelsGallery videos={videos} />

  </section>

)}

      {/* =====================================================
          VENUE
      ===================================================== */}

      {wedding.venueName && (

        <section className="venue-section">

          <div className="venue-decoration">
            ✦
          </div>

          <p className="venue-label">
            WHERE WE CELEBRATE
          </p>

          <h2>
            {wedding.venueName}
          </h2>

          <div className="venue-line" />

          <p className="venue-address">
            {wedding.venueAddress}
          </p>

          {wedding.mapsUrl && (

            <a
              href={wedding.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="map-button"
            >
              <span>⌖</span>
              OPEN LOCATION
            </a>

          )}

        </section>
      )}


      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="closing-section">

        <div className="closing-inner">

          <div className="closing-star">
            ✦
          </div>

          <div className="arabic closing-arabic">
            بارك الله لنا ولكم
          </div>

          <p className="closing-message">

            {wedding.closingMessage ||
              "May Allah bless our Nikah with endless love, mercy and barakah, and guide us through a beautiful journey together. Your presence and duas will make our special day truly complete. Keep us in your prayers as we begin this new chapter. Ameen."}

          </p>

          <div className="closing-divider">
            <span />
            <b>✦</b>
            <span />
          </div>

          <p className="with-love">
            WITH LOVE
          </p>

          <h2>
            {wedding.groomName}
            <span>&</span>
            {wedding.brideName}
          </h2>

          <p className="final-dua">
            May Allah keep our hearts together in love,
            faith and happiness. Ameen.
          </p>

        </div>

      </section>

    </main>
    </InvitationOpening>
  );
}