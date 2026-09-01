import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/auth";

const id = "main";

const base = {
  id,

  // Couple
  groomName: "",
  brideName: "",

  // Parents
  groomParents: "",
  brideParents: "",

  // Wedding
  date: "",
  time: "",

  // Invitation
  invitationTitle: "",
  openingMessage: "",
  closingMessage: "",

  // Venue
  venueName: "",
  venueAddress: "",
  mapsUrl: "",

  // Media
  photos: [],
  videos: [],

  // Events
  events: [],

  // Theme
  theme: "classic-red",
};

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const ref = adminDb()
      .collection("weddings")
      .doc(id);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return NextResponse.json(base);
    }

    return NextResponse.json({
      ...base,
      ...snapshot.data(),
    });
  } catch (e: any) {
    const message = e?.message || "Request failed";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "UNAUTHORIZED"
            ? 401
            : 403,
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json();

    const ref = adminDb()
      .collection("weddings")
      .doc(id);

    await ref.set(
      {
        ...body,

        id,

        updatedAt: new Date(),
        updatedBy: user.uid,
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (e: any) {
    const message = e?.message || "Request failed";

    return NextResponse.json(
      { error: message },
      {
        status:
          message === "UNAUTHORIZED"
            ? 401
            : 403,
      }
    );
  }
}