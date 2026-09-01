import { adminAuth, adminDb } from "./firebase-admin";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);

    const adminDoc = await adminDb()
      .collection("admins")
      .doc(decoded.uid)
      .get();

    if (!adminDoc.exists) {
      throw new Error("FORBIDDEN");
    }

    return decoded;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" ||
        error.message === "FORBIDDEN")
    ) {
      throw error;
    }

    throw new Error("UNAUTHORIZED");
  }
}