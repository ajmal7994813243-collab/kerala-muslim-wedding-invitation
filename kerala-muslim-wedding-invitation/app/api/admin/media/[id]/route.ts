import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(req);

    const ref = adminDb()
      .collection('weddings')
      .doc('main');

    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    const data = snap.data() || {};

    const photos = Array.isArray(data.photos)
      ? data.photos
      : [];

    const videos = Array.isArray(data.videos)
      ? data.videos
      : [];

    const newPhotos = photos.filter(
      (item: any) => item.id !== params.id
    );

    const newVideos = videos.filter(
      (item: any) => item.id !== params.id
    );

    await ref.set(
      {
        photos: newPhotos,
        videos: newVideos,
        updatedAt: new Date(),
        updatedBy: user.uid,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Request failed' },
      {
        status:
          e.message === 'UNAUTHORIZED'
            ? 401
            : 403,
      }
    );
  }
}