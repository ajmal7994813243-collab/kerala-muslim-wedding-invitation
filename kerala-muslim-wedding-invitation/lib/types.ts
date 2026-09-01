export type WeddingDraft = {
  id: string;

  groomName: string;
  brideName: string;

  groomParents?: string;
  brideParents?: string;

  date?: string;
  time?: string;

  invitationTitle?: string;

  openingMessage?: string;
  closingMessage?: string;

  venueName?: string;
  venueAddress?: string;
  mapsUrl?: string;

  photos: MediaItem[];
  videos: MediaItem[];

  events: EventItem[];

  updatedAt?: unknown;
};

export type MediaItem = {
  id: string;

  type: "image" | "video";

  url: string;

  title?: string;
  caption?: string;

  order: number;
};

export type EventItem = {
  id: string;

  name: string;

  date: string;
  time: string;

  venue?: string;
  address?: string;

  description?: string;

  order: number;
};

export type WeddingVersion = WeddingDraft & {
  versionId: string;

  createdAt?: unknown;
  publishedAt?: unknown;
  createdBy?: string;
};

export type Guest = {
  id: string;

  name: string;

  phone?: string;
  email?: string;

  customGreeting?: string;

  status: "active" | "revoked";

  versionId: string;

  createdAt?: unknown;
};

export type Invitation = {
  id: string;

  guestId: string;
  versionId: string;

  token: string;

  status: "active" | "revoked";

  openCount: number;

  lastOpenedAt?: unknown;
  createdAt?: unknown;
};