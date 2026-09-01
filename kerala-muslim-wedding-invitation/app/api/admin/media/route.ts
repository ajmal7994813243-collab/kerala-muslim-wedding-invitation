import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const snap = await adminDb()
      .collection('weddings')
      .doc('main')
      .get();

    const data = snap.exists ? snap.data() : null;

    return NextResponse.json({
      media: [
        ...((data?.photos || []).map((item: any) => ({
          ...item,
          type: 'image',
        }))),
        ...((data?.videos || []).map((item: any) => ({
          ...item,
          type: 'video',
        }))),
      ],
    });
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

export async function POST(req: Request) {
  try {
    const user = await requireAdmin(req);
    const body = await req.json();

    const {
      type,
      url,
      title = '',
      caption = '',
      order = 0,
    } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Media URL is required' },
        { status: 400 }
      );
    }

    if (type !== 'image' && type !== 'video') {
      return NextResponse.json(
        { error: 'Invalid media type' },
        { status: 400 }
      );
    }

    const item = {
      id: randomUUID(),
      type,
      url,
      title,
      caption,
      order,
      createdAt: new Date(),
      createdBy: user.uid,
    };

    const ref = adminDb()
      .collection('weddings')
      .doc('main');

    const snap = await ref.get();

    const current = snap.exists ? snap.data() : {};

    const field = type === 'image' ? 'photos' : 'videos';

    const existing = Array.isArray(current?.[field])
      ? current[field]
      : [];

    await ref.set(
      {
        [field]: [...existing, item],
        updatedAt: new Date(),
        updatedBy: user.uid,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      media: item,
    });
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