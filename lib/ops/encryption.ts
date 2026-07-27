import "server-only";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.DEV_PORTAL_SESSION_SECRET;
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts arbitrary text using AES-256-GCM with a random IV and auth tag.
 * Used for general encryption of sensitive configuration data within the Ops portal.
 */
export function encryptText(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error(
      "DEV_PORTAL_SESSION_SECRET must be at least 32 characters long for AES-256.",
    );
  }

  // Ensure key is 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY).subarray(0, 32);
  const iv = crypto.randomBytes(12); // Standard for GCM

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text previously encrypted with AES-256-GCM.
 */
export function decryptText(encryptedPayload: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error(
      "DEV_PORTAL_SESSION_SECRET must be at least 32 characters long for AES-256.",
    );
  }

  const key = Buffer.from(ENCRYPTION_KEY).subarray(0, 32);
  const parts = encryptedPayload.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
