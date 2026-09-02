"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { auth } from "@/lib/firebase-client";

const CLOUDINARY_CLOUD_NAME = "zxzsqxbx";
const CLOUDINARY_UPLOAD_PRESET = "wedding_upload";

type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  title?: string;
  caption?: string;
  order: number;
};

type EventItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  venue?: string;
  address?: string;
  description?: string;
  order: number;
};

type WeddingData = {
  id: string;
  groomName: string;
  brideName: string;

  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;

  date: string;
  time: string;

  invitationTitle: string;
  openingMessage: string;
  closingMessage: string;

  venueName: string;
  venueAddress: string;
  mapsUrl: string;

  photos: MediaItem[];
  videos: MediaItem[];
  events: EventItem[];

  theme: string;
};

const emptyWedding: WeddingData = {
  id: "main",

  groomName: "",
  brideName: "",

  groomFather: "",
  groomMother: "",
  brideFather: "",
  brideMother: "",

  date: "",
  time: "",

  invitationTitle: "",
  openingMessage: "",
  closingMessage: "",

  venueName: "",
  venueAddress: "",
  mapsUrl: "",

  photos: [],
  videos: [],
  events: [],

  theme: "classic-red",
};

export default function AdminPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<
    "wedding" | "events" | "photos" | "videos" | "guests" | "versions"
  >("wedding");

  const [data, setData] = useState<WeddingData>(emptyWedding);

  const [guests, setGuests] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  /* MEDIA FORM */

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCaption, setVideoCaption] = useState("");

  const [addingPhoto, setAddingPhoto] = useState(false);
  const [addingVideo, setAddingVideo] = useState(false);

  async function api(path: string, options: RequestInit = {}) {
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("Admin login required");
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }

    return result;
  }

  async function load() {
    try {
      setLoading(true);

      const [wedding, guestData, versionData] =
        await Promise.all([
          api("/api/admin/wedding"),
          api("/api/admin/guests"),
          api("/api/admin/versions"),
        ]);

      setData({
        ...emptyWedding,
        ...wedding,
        photos: Array.isArray(wedding.photos)
          ? wedding.photos
          : [],
        videos: Array.isArray(wedding.videos)
          ? wedding.videos
          : [],
        events: Array.isArray(wedding.events)
          ? wedding.events
          : [],
      });

      setGuests(guestData.guests || []);
      setVersions(versionData.versions || []);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(
    field: keyof WeddingData,
    value: string
  ) {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveWedding() {
    try {
      setSaving(true);
      setMessage("");

      await api("/api/admin/wedding", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      setMessage(
        "Wedding details saved successfully."
      );
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function createVersion() {
    try {
      setMessage("");

      await saveWedding();

      await api("/api/admin/versions", {
        method: "POST",
      });

      await load();

      setMessage(
        "New immutable invitation version created."
      );
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  async function addGuest() {
    const name = window.prompt("Guest name?");

    if (!name?.trim()) return;

    try {
      setMessage("");

      await api("/api/admin/guests", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          versionId: versions[0]?.versionId,
        }),
      });

      await load();

      setMessage("Guest invitation created.");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  function addEvent() {
    const event: EventItem = {
      id: crypto.randomUUID(),
      name: "Nikah",
      date: "",
      time: "",
      venue: "",
      address: "",
      description: "",
      order: data.events.length,
    };

    setData((previous) => ({
      ...previous,
      events: [...previous.events, event],
    }));
  }

  function updateEvent(
    id: string,
    field: keyof EventItem,
    value: string
  ) {
    setData((previous) => ({
      ...previous,
      events: previous.events.map((event) =>
        event.id === id
          ? {
              ...event,
              [field]: value,
            }
          : event
      ),
    }));
  }

  function deleteEvent(id: string) {
    setData((previous) => ({
      ...previous,
      events: previous.events.filter(
        (event) => event.id !== id
      ),
    }));
  }

  /* =========================================================
     PHOTOS
  ========================================================= */

  async function addPhoto() {
    if (!photoFile && !photoUrl.trim()) {
      setMessage("Please choose a photo from your device.");
      return;
    }

    try {
      setAddingPhoto(true);
      setMessage("");

      let finalUrl = photoUrl.trim();

      if (photoFile) {
        const user = auth.currentUser;

        if (!user) {
          throw new Error("Admin login required");
        }

        if (!photoFile.type.startsWith("image/")) {
          throw new Error("Please choose an image file.");
        }

        if (photoFile.size > 10 * 1024 * 1024) {
          throw new Error("Photo must be 10 MB or smaller.");
        }

        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "ajmal-irfana/photos");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.secure_url) {
          throw new Error(
            result.error?.message || "Cloudinary photo upload failed."
          );
        }

        finalUrl = result.secure_url;
      }

      await api("/api/admin/media", {
        method: "POST",
        body: JSON.stringify({
          type: "image",
          url: finalUrl,
          title: photoTitle.trim(),
          caption: photoCaption.trim(),
          order: data.photos.length,
        }),
      });

      setPhotoUrl("");
      setPhotoTitle("");
      setPhotoCaption("");
      setPhotoFile(null);
      setPhotoPreview("");

      await load();

      setMessage("Photo uploaded successfully.");
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setAddingPhoto(false);
    }
  }

  function handlePhotoFileChange(file: File | null) {
    setPhotoFile(file);

    if (!file) {
      setPhotoPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUrl("");
    setMessage("");
  }

  async function deletePhoto(id: string) {
    if (!window.confirm("Remove this photo?")) return;

    try {
      setMessage("");

      await api(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      await load();

      setMessage("Photo removed.");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  /* =========================================================
     VIDEOS
  ========================================================= */

  async function addVideo() {
    if (!videoUrl.trim()) {
      setMessage("Please enter a video URL.");
      return;
    }

    try {
      setAddingVideo(true);
      setMessage("");

      await api("/api/admin/media", {
        method: "POST",
        body: JSON.stringify({
          type: "video",
          url: videoUrl.trim(),
          title: videoTitle.trim(),
          caption: videoCaption.trim(),
          order: data.videos.length,
        }),
      });

      setVideoUrl("");
      setVideoTitle("");
      setVideoCaption("");

      await load();

      setMessage("Video added successfully.");
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setAddingVideo(false);
    }
  }

  async function deleteVideo(id: string) {
    if (!window.confirm("Remove this video?")) return;

    try {
      setMessage("");

      await api(`/api/admin/media/${id}`, {
        method: "DELETE",
      });

      await load();

      setMessage("Video removed.");
    } catch (error: any) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <div className="text-3xl text-wine">
            ✦
          </div>

          <p className="mt-4 text-sm text-stone-500">
            Loading wedding dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">

        {/* SIDEBAR */}

        <aside className="h-fit rounded-3xl bg-white p-3 shadow-[0_15px_50px_rgba(60,15,25,0.08)]">

          <div className="px-4 py-5">

            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Wedding
            </p>

            <h2 className="mt-2 font-serif text-2xl text-wine">
              Admin
            </h2>

          </div>

          <SidebarButton
            active={tab === "wedding"}
            onClick={() => setTab("wedding")}
          >
            💍 Wedding
          </SidebarButton>

          <SidebarButton
            active={tab === "events"}
            onClick={() => setTab("events")}
          >
            🗓️ Events
          </SidebarButton>

          <SidebarButton
            active={tab === "photos"}
            onClick={() => setTab("photos")}
          >
            📸 Photos
          </SidebarButton>

          <SidebarButton
            active={tab === "videos"}
            onClick={() => setTab("videos")}
          >
            🎥 Videos
          </SidebarButton>

          <SidebarButton
            active={tab === "guests"}
            onClick={() => setTab("guests")}
          >
            👥 Guests
          </SidebarButton>

          <SidebarButton
            active={tab === "versions"}
            onClick={() => setTab("versions")}
          >
            📦 Versions
          </SidebarButton>

        </aside>


        {/* CONTENT */}

        <section className="rounded-3xl bg-white p-5 shadow-[0_15px_50px_rgba(60,15,25,0.08)] md:p-8">

          {message && (
            <div className="mb-6 rounded-2xl border border-[#ead8d0] bg-[#fff7f3] p-4 text-sm text-wine">
              {message}
            </div>
          )}


          {/* =====================================================
              WEDDING
          ===================================================== */}

          {tab === "wedding" && (
            <>

              <PageHeader
                eyebrow="Wedding Setup"
                title="Wedding Details"
                description="Everything entered here will appear on the invitation."
              />

              <Section title="Couple Details">

                <div className="grid gap-5 md:grid-cols-2">

                  <Field
                    label="Groom Name"
                    value={data.groomName}
                    onChange={(value) =>
                      updateField("groomName", value)
                    }
                  />

                  <Field
                    label="Bride Name"
                    value={data.brideName}
                    onChange={(value) =>
                      updateField("brideName", value)
                    }
                  />

                </div>

              </Section>


              <Section title="Family Details">

                <div className="grid gap-5 md:grid-cols-2">

                  <Field
                    label="Groom's Father"
                    value={data.groomFather}
                    onChange={(value) =>
                      updateField(
                        "groomFather",
                        value
                      )
                    }
                  />

                  <Field
                    label="Groom's Mother"
                    value={data.groomMother}
                    onChange={(value) =>
                      updateField(
                        "groomMother",
                        value
                      )
                    }
                  />

                  <Field
                    label="Bride's Father"
                    value={data.brideFather}
                    onChange={(value) =>
                      updateField(
                        "brideFather",
                        value
                      )
                    }
                  />

                  <Field
                    label="Bride's Mother"
                    value={data.brideMother}
                    onChange={(value) =>
                      updateField(
                        "brideMother",
                        value
                      )
                    }
                  />

                </div>

              </Section>


              <Section title="Wedding Date & Time">

                <div className="grid gap-5 md:grid-cols-2">

                  <Field
                    label="Wedding Date"
                    placeholder="Example: 20 December 2026"
                    value={data.date}
                    onChange={(value) =>
                      updateField("date", value)
                    }
                  />

                  <Field
                    label="Wedding Time"
                    placeholder="Example: 7:30 PM"
                    value={data.time}
                    onChange={(value) =>
                      updateField("time", value)
                    }
                  />

                </div>

              </Section>


              <Section title="Invitation Message">

                <Field
                  label="Invitation Title"
                  value={data.invitationTitle}
                  onChange={(value) =>
                    updateField(
                      "invitationTitle",
                      value
                    )
                  }
                />

                <div className="mt-5">
                  <TextArea
                    label="Opening Message"
                    value={data.openingMessage}
                    onChange={(value) =>
                      updateField(
                        "openingMessage",
                        value
                      )
                    }
                  />
                </div>

                <div className="mt-5">
                  <TextArea
                    label="Closing Message"
                    value={data.closingMessage}
                    onChange={(value) =>
                      updateField(
                        "closingMessage",
                        value
                      )
                    }
                  />
                </div>

              </Section>


              <Section title="Venue">

                <div className="grid gap-5">

                  <Field
                    label="Venue Name"
                    value={data.venueName}
                    onChange={(value) =>
                      updateField(
                        "venueName",
                        value
                      )
                    }
                  />

                  <Field
                    label="Venue Address"
                    value={data.venueAddress}
                    onChange={(value) =>
                      updateField(
                        "venueAddress",
                        value
                      )
                    }
                  />

                  <Field
                    label="Google Maps URL"
                    value={data.mapsUrl}
                    onChange={(value) =>
                      updateField(
                        "mapsUrl",
                        value
                      )
                    }
                  />

                </div>

              </Section>


              <div className="mt-10 flex flex-wrap gap-3">

                <button
                  onClick={saveWedding}
                  disabled={saving}
                  className="rounded-full bg-wine px-7 py-3 text-sm text-white transition hover:bg-[#701521] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Draft"}
                </button>

                <button
                  onClick={createVersion}
                  className="rounded-full border border-wine px-7 py-3 text-sm text-wine transition hover:bg-[#fff4f1]"
                >
                  Save & Create Version
                </button>

              </div>

            </>
          )}


          {/* =====================================================
              EVENTS
          ===================================================== */}

          {tab === "events" && (
            <>

              <PageHeader
                eyebrow="Schedule"
                title="Wedding Events"
                description="Add Nikah, reception, mehndi or any other events."
              />

              <button
                onClick={addEvent}
                className="rounded-full bg-wine px-6 py-3 text-sm text-white"
              >
                + Add Event
              </button>

              <div className="mt-8 space-y-6">

                {data.events.length === 0 && (
                  <EmptyState text="No events added yet." />
                )}

                {data.events.map((event, index) => (

                  <div
                    key={event.id}
                    className="rounded-3xl border border-[#eadbd3] p-5 md:p-7"
                  >

                    <div className="mb-5 flex items-center justify-between">

                      <h3 className="font-serif text-2xl text-wine">
                        Event {index + 1}
                      </h3>

                      <button
                        onClick={() =>
                          deleteEvent(event.id)
                        }
                        className="text-sm text-red-700"
                      >
                        Delete
                      </button>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <Field
                        label="Event Name"
                        value={event.name}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "name",
                            value
                          )
                        }
                      />

                      <Field
                        label="Date"
                        value={event.date}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "date",
                            value
                          )
                        }
                      />

                      <Field
                        label="Time"
                        value={event.time}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "time",
                            value
                          )
                        }
                      />

                      <Field
                        label="Venue"
                        value={event.venue || ""}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "venue",
                            value
                          )
                        }
                      />

                      <Field
                        label="Address"
                        value={event.address || ""}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "address",
                            value
                          )
                        }
                      />

                    </div>

                    <div className="mt-5">

                      <TextArea
                        label="Description"
                        value={event.description || ""}
                        onChange={(value) =>
                          updateEvent(
                            event.id,
                            "description",
                            value
                          )
                        }
                      />

                    </div>

                  </div>

                ))}

              </div>

              {data.events.length > 0 && (
                <button
                  onClick={saveWedding}
                  className="mt-8 rounded-full bg-wine px-7 py-3 text-sm text-white"
                >
                  Save Events
                </button>
              )}

            </>
          )}


          {/* =====================================================
              PHOTOS
          ===================================================== */}

          {tab === "photos" && (
            <>

              <PageHeader
                eyebrow="Gallery"
                title="Wedding Photos"
                description="Add beautiful memories to your invitation."
              />

              {/* ADD PHOTO */}

              <div className="rounded-3xl border border-[#eadbd3] bg-[#fffaf7] p-5 md:p-7">

                <div className="mb-6">

                  <h2 className="font-serif text-2xl text-wine">
                    Add New Photo
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Choose a photo from your phone or computer. It will upload automatically.
                  </p>

                </div>

                <div className="grid gap-5">

                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-[#35171d]">
                      Choose Photo
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handlePhotoFileChange(
                          event.target.files?.[0] || null
                        )
                      }
                      className="w-full rounded-2xl border border-dashed border-[#d8c2b7] bg-white px-4 py-4 text-sm text-[#35171d] outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#9b1e30] file:px-5 file:py-2 file:text-sm file:text-white hover:border-[#9b1e30] focus:border-[#9b1e30] focus:ring-4 focus:ring-[#9b1e30]/10"
                    />

                    <span className="text-xs text-stone-500">
                      JPG, PNG or WEBP • max 10 MB
                    </span>
                  </label>

                  {(photoPreview || photoUrl.trim()) && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">
                        Preview
                      </p>

                      <div className="overflow-hidden rounded-2xl border bg-white">
                        <img
                          src={photoPreview || photoUrl}
                          alt="Photo preview"
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <details className="rounded-2xl border border-[#eadbd3] bg-white p-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#35171d]">
                      Or use an image URL
                    </summary>

                    <div className="mt-4">
                      <Field
                        label="Photo URL"
                        placeholder="https://example.com/wedding-photo.jpg"
                        value={photoUrl}
                        onChange={(value) => {
                          setPhotoUrl(value);
                          setPhotoFile(null);
                          setPhotoPreview("");
                        }}
                      />
                    </div>
                  </details>

                  <div className="grid gap-5 md:grid-cols-2">

                    <Field
                      label="Title"
                      placeholder="Our beautiful moment"
                      value={photoTitle}
                      onChange={setPhotoTitle}
                    />

                    <Field
                      label="Caption"
                      placeholder="A memory to cherish forever"
                      value={photoCaption}
                      onChange={setPhotoCaption}
                    />

                  </div>

                  <button
                    onClick={addPhoto}
                    disabled={addingPhoto}
                    className="w-fit rounded-full bg-wine px-7 py-3 text-sm text-white transition hover:bg-[#701521] disabled:opacity-50"
                  >
                    {addingPhoto
                      ? "Adding..."
                      : "＋ Upload Photo"}
                  </button>

                </div>

              </div>


              {/* PHOTO LIST */}

              <div className="mt-10">

                <div className="mb-5 flex items-center justify-between">

                  <h2 className="font-serif text-2xl text-wine">
                    Your Photos
                  </h2>

                  <span className="rounded-full bg-[#fff1ec] px-4 py-2 text-xs text-wine">
                    {data.photos.length}{" "}
                    {data.photos.length === 1
                      ? "Photo"
                      : "Photos"}
                  </span>

                </div>

                {data.photos.length === 0 ? (
                  <EmptyState text="No photos added yet." />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">

                    {data.photos.map((photo) => (

                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-3xl border border-[#eadbd3] bg-white shadow-sm"
                      >

                        <img
                          src={photo.url}
                          alt={
                            photo.caption ||
                            "Wedding photo"
                          }
                          className="h-64 w-full object-cover"
                        />

                        <div className="p-5">

                          <h3 className="font-serif text-xl text-wine">
                            {photo.title ||
                              "Wedding Photo"}
                          </h3>

                          {photo.caption && (
                            <p className="mt-2 text-sm leading-6 text-stone-500">
                              {photo.caption}
                            </p>
                          )}

                          <button
                            onClick={() =>
                              deletePhoto(photo.id)
                            }
                            className="mt-5 rounded-full border border-red-200 px-5 py-2 text-sm text-red-700 transition hover:bg-red-50"
                          >
                            Remove Photo
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

              </div>

            </>
          )}


          {/* =====================================================
              VIDEOS
          ===================================================== */}

          {tab === "videos" && (
            <>

              <PageHeader
                eyebrow="Moving Memories"
                title="Wedding Videos"
                description="Add beautiful videos to your invitation."
              />

              {/* ADD VIDEO */}

              <div className="rounded-3xl border border-[#eadbd3] bg-[#fffaf7] p-5 md:p-7">

                <div className="mb-6">

                  <h2 className="font-serif text-2xl text-wine">
                    Add New Video
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Paste a direct video URL below.
                  </p>

                </div>

                <div className="grid gap-5">

                  <Field
                    label="Video URL"
                    placeholder="https://example.com/wedding-video.mp4"
                    value={videoUrl}
                    onChange={setVideoUrl}
                  />

                  {videoUrl.trim() && (
                    <div>

                      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">
                        Preview
                      </p>

                      <div className="overflow-hidden rounded-2xl bg-black">
                        <video
                          src={videoUrl}
                          controls
                          preload="metadata"
                          className="max-h-[450px] w-full"
                        />
                      </div>

                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">

                    <Field
                      label="Title"
                      placeholder="Our Wedding Story"
                      value={videoTitle}
                      onChange={setVideoTitle}
                    />

                    <Field
                      label="Caption"
                      placeholder="A moment worth remembering"
                      value={videoCaption}
                      onChange={setVideoCaption}
                    />

                  </div>

                  <button
                    onClick={addVideo}
                    disabled={addingVideo}
                    className="w-fit rounded-full bg-wine px-7 py-3 text-sm text-white transition hover:bg-[#701521] disabled:opacity-50"
                  >
                    {addingVideo
                      ? "Adding..."
                      : "＋ Add Video"}
                  </button>

                </div>

              </div>


              {/* VIDEO LIST */}

              <div className="mt-10">

                <div className="mb-5 flex items-center justify-between">

                  <h2 className="font-serif text-2xl text-wine">
                    Your Videos
                  </h2>

                  <span className="rounded-full bg-[#fff1ec] px-4 py-2 text-xs text-wine">
                    {data.videos.length}{" "}
                    {data.videos.length === 1
                      ? "Video"
                      : "Videos"}
                  </span>

                </div>

                {data.videos.length === 0 ? (
                  <EmptyState text="No videos added yet." />
                ) : (
                  <div className="space-y-6">

                    {data.videos.map((video) => (

                      <div
                        key={video.id}
                        className="overflow-hidden rounded-3xl border border-[#eadbd3] bg-white shadow-sm"
                      >

                        <div className="bg-black">

                          <video
                            src={video.url}
                            controls
                            preload="metadata"
                            className="max-h-[500px] w-full"
                          />

                        </div>

                        <div className="p-5">

                          <h3 className="font-serif text-xl text-wine">
                            {video.title ||
                              "Wedding Video"}
                          </h3>

                          {video.caption && (
                            <p className="mt-2 text-sm leading-6 text-stone-500">
                              {video.caption}
                            </p>
                          )}

                          <button
                            onClick={() =>
                              deleteVideo(video.id)
                            }
                            className="mt-5 rounded-full border border-red-200 px-5 py-2 text-sm text-red-700 transition hover:bg-red-50"
                          >
                            Remove Video
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

              </div>

            </>
          )}


          {/* =====================================================
              GUESTS
          ===================================================== */}

          {tab === "guests" && (
            <>

              <div className="flex flex-wrap items-center justify-between gap-4">

                <PageHeader
                  eyebrow="Personal Invitations"
                  title="Guests"
                  description="Every guest receives a private invitation link."
                />

                <button
                  onClick={addGuest}
                  className="rounded-full bg-wine px-6 py-3 text-sm text-white"
                >
                  + Add Guest
                </button>

              </div>

              <div className="mt-8 space-y-4">

                {guests.length === 0 && (
                  <EmptyState text="No guests added yet." />
                )}

                {guests.map((guest) => (

                  <div
                    key={guest.id}
                    className="rounded-3xl border border-[#eadbd3] p-5"
                  >

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                      <div>

                        <h3 className="font-serif text-2xl text-wine">
                          {guest.name}
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                          Version: {guest.versionId}
                        </p>

                      </div>

                      {guest.token && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${window.location.origin}/invite/${guest.token}`
                            )
                          }
                          className="rounded-full border border-wine px-5 py-2 text-sm text-wine"
                        >
                          Copy Link
                        </button>
                      )}

                    </div>

                    {guest.token && (
                      <p className="mt-4 break-all rounded-xl bg-[#fff8f5] p-3 text-sm text-stone-600">
                        {window.location.origin}/invite/
                        {guest.token}
                      </p>
                    )}

                  </div>

                ))}

              </div>

            </>
          )}


          {/* =====================================================
              VERSIONS
          ===================================================== */}

          {tab === "versions" && (
            <>

              <div className="flex flex-wrap items-center justify-between gap-4">

                <PageHeader
                  eyebrow="Immutable Snapshots"
                  title="Invitation Versions"
                  description="Published versions stay unchanged for existing guests."
                />

                <button
                  onClick={createVersion}
                  className="rounded-full bg-wine px-6 py-3 text-sm text-white"
                >
                  Create New Version
                </button>

              </div>

              <div className="mt-8 space-y-4">

                {versions.length === 0 && (
                  <EmptyState text="No versions created yet." />
                )}

                {versions.map((version) => (

                  <div
                    key={version.versionId}
                    className="rounded-3xl border border-[#eadbd3] p-5"
                  >

                    <p className="text-xs uppercase tracking-[0.3em] text-gold">
                      Immutable Version
                    </p>

                    <h3 className="mt-2 font-serif text-xl text-wine">
                      {version.versionId}
                    </h3>

                    <p className="mt-2 text-sm text-stone-500">
                      {version.groomName ||
                        "Groom"}{" "}
                      &{" "}
                      {version.brideName ||
                        "Bride"}
                    </p>

                    <p className="mt-1 text-sm text-stone-500">
                      {version.date ||
                        "No date"}
                    </p>

                  </div>

                ))}

              </div>

            </>
          )}

        </section>
      </div>
    </main>
  );
}


/* =============================================================
   COMPONENTS
============================================================= */

function SidebarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-[#9b1e30] text-white shadow-lg"
          : "text-stone-600 hover:bg-[#fff5f1]"
      }`}
    >
      {children}
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
        {eyebrow}
      </p>

      <h1 className="mt-2 font-serif text-3xl text-wine md:text-4xl">
        {title}
      </h1>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
          {description}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-[#eadbd3] pt-8 first:mt-0 first:border-0 first:pt-0">
      <h2 className="mb-5 font-serif text-2xl text-wine">
        {title}
      </h2>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">

      <span className="font-medium text-[#35171d]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-[#e3d5ce] bg-white px-4 py-3 text-[#35171d] outline-none transition placeholder:text-stone-400 focus:border-[#9b1e30] focus:ring-4 focus:ring-[#9b1e30]/10"
      />

    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">

      <span className="font-medium text-[#35171d]">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-32 w-full resize-y rounded-2xl border border-[#e3d5ce] bg-white px-4 py-3 text-[#35171d] outline-none transition placeholder:text-stone-400 focus:border-[#9b1e30] focus:ring-4 focus:ring-[#9b1e30]/10"
      />

    </label>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#dbc9c0] bg-[#fffaf7] p-10 text-center">

      <div className="text-2xl text-gold">
        ✦
      </div>

      <p className="mt-3 text-sm text-stone-500">
        {text}
      </p>

    </div>
  );
}